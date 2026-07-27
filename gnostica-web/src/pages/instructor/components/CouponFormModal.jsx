import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { z } from 'zod';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign, Package, Percent, RotateCw, Search } from 'lucide-react';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/common/micro/AppDialog';
import { AppButton } from '@/components/common/micro/AppButton';
import { AppCheckbox } from '@/components/common/micro/AppCheckbox';
import AppInput from '@/components/common/micro/AppInput';
import AppSelect from '@/components/common/micro/AppSelect';
import couponService from '@/services/order/couponService';

const toLocalDateTimeInput = (value) => value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : '';
const parseMetadata = (metadata) => {
  try { return metadata ? JSON.parse(metadata) : {}; } catch { return {}; }
};
const formatCurrency = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  const normalizedDigits = digits.replace(/^0+(?=\d)/, '');
  return normalizedDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
const getFixedAmountQuantityLimit = (value) => {
  const amount = Number(value);
  if (amount >= 500000) return 1;
  if (amount >= 200000) return 2;
  if (amount >= 100000) return 5;
  return null;
};
const COUPON_CODE_PATTERN = /^GNS-[A-Z0-9]{6}$/;
const generateCouponCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomValues = new Uint32Array(6);
  const values = globalThis.crypto?.getRandomValues
    ? globalThis.crypto.getRandomValues(randomValues)
    : Array.from({ length: 6 }, () => Math.floor(Math.random() * characters.length));
  return `GNS-${Array.from(values, (value) => characters[value % characters.length]).join('')}`;
};

const makeDefaultValues = (isAdmin) => ({
  name: '', code: generateCouponCode(), discountType: '1', discountValue: 10, minDiscount: 0, maxDiscount: 0,
  validFrom: toLocalDateTimeInput(new Date()), validUntil: '', quantity: 100,
  scope: isAdmin ? 'ALL_PLATFORM' : 'ALL_OWNER_COURSES', courseIds: [], categoryIds: [],
});

const makeCouponSchema = (isAdmin) => z.object({
  name: z.string().trim().min(1, 'Tên phiếu giảm giá không được để trống').max(255),
  code: z.string().regex(COUPON_CODE_PATTERN, 'Mã giảm giá phải theo dạng GNS-XXXXXX'),
  discountType: z.enum(['1', '2']),
  discountValue: z.coerce.number().positive('Giá trị giảm phải lớn hơn 0'),
  minDiscount: z.coerce.number().min(0, 'Giá trị đơn hàng tối thiểu không được âm'),
  maxDiscount: z.coerce.number().min(0, 'Mức giảm tối đa không được âm'),
  validFrom: z.string().min(1, 'Chọn thời điểm bắt đầu'),
  validUntil: z.string().min(1, 'Chọn thời điểm kết thúc'),
  quantity: z.coerce.number().int().min(0, 'Số lượng không được âm'),
  scope: z.enum(['ALL_PLATFORM', 'ALL_OWNER_COURSES', 'COURSES', 'CATEGORIES']),
  courseIds: z.array(z.string()), categoryIds: z.array(z.string()),
}).superRefine((value, context) => {
  if (value.discountType === '1' && value.discountValue > 100) context.addIssue({ code: 'custom', path: ['discountValue'], message: 'Giảm theo phần trăm không vượt quá 100%' });
  if (!isAdmin && value.discountType === '1' && value.discountValue >= 90 && value.discountValue <= 100 && value.quantity !== 1) context.addIssue({ code: 'custom', path: ['quantity'], message: 'Chỉ được tạo số 1 với mức Coupon này' });
  const fixedAmountLimit = !isAdmin && value.discountType === '2' ? getFixedAmountQuantityLimit(value.discountValue) : null;
  if (fixedAmountLimit !== null && value.quantity > fixedAmountLimit) context.addIssue({ code: 'custom', path: ['quantity'], message: 'Số lượng phát hành vượt mức tối đa cho mức Coupon này' });
  if (new Date(value.validUntil) <= new Date(value.validFrom)) context.addIssue({ code: 'custom', path: ['validUntil'], message: 'Thời điểm kết thúc phải sau thời điểm bắt đầu' });
  if (value.scope === 'COURSES' && value.courseIds.length === 0) context.addIssue({ code: 'custom', path: ['courseIds'], message: 'Chọn ít nhất một khóa học' });
  if (value.scope === 'CATEGORIES' && value.categoryIds.length === 0) context.addIssue({ code: 'custom', path: ['categoryIds'], message: 'Chọn ít nhất một danh mục' });
});

function buildFormValues(coupon, isAdmin) {
  if (!coupon) return makeDefaultValues(isAdmin);
  const metadata = parseMetadata(coupon.metadata);
  return {
    ...makeDefaultValues(isAdmin), name: coupon.name ?? '', code: COUPON_CODE_PATTERN.test(coupon.code ?? '') ? coupon.code : generateCouponCode(),
    discountType: String(coupon.discountType ?? 1), discountValue: coupon.discountValue ?? 0,
    minDiscount: coupon.minDiscount ?? 0, maxDiscount: coupon.maxDiscount ?? 0,
    validFrom: toLocalDateTimeInput(coupon.validFrom), validUntil: toLocalDateTimeInput(coupon.validUntil),
    quantity: coupon.quantity ?? 0, scope: metadata.scope ?? (isAdmin ? 'ALL_PLATFORM' : 'ALL_OWNER_COURSES'),
    courseIds: (metadata.courseIds ?? []).map(String), categoryIds: (metadata.categoryIds ?? []).map(String),
  };
}

export function CouponFormModal({ coupon, isAdmin, isOpen, onOpenChange, onSave }) {
  const form = useForm({ resolver: zodResolver(makeCouponSchema(isAdmin)), defaultValues: makeDefaultValues(isAdmin) });
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pickerType, setPickerType] = useState(null);
  const [pickerQuery, setPickerQuery] = useState('');
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);
  const discountType = form.watch('discountType');
  const discountValue = form.watch('discountValue');
  const scope = form.watch('scope');
  const isEditing = Boolean(coupon?.id);
  const isHighPercentageDiscount = !isAdmin && discountType === '1' && Number(discountValue) >= 90 && Number(discountValue) <= 100;
  const fixedAmountQuantityLimit = !isAdmin && discountType === '2' ? getFixedAmountQuantityLimit(discountValue) : null;

  useEffect(() => { if (isOpen) form.reset(buildFormValues(coupon, isAdmin)); }, [coupon, form, isAdmin, isOpen]);
  useEffect(() => {
    if (isHighPercentageDiscount) form.setValue('quantity', 1, { shouldValidate: true });
  }, [form, isHighPercentageDiscount]);
  useEffect(() => {
    const quantity = Number(form.getValues('quantity'));
    if (fixedAmountQuantityLimit !== null && quantity > fixedAmountQuantityLimit) {
      form.setValue('quantity', fixedAmountQuantityLimit, { shouldValidate: true });
    }
  }, [fixedAmountQuantityLimit, form]);
  useEffect(() => {
    if (!isOpen) return;
    couponService.getScopeCourses().then((response) => setCourses(response?.data ?? [])).catch(() => setCourses([]));
    if (isAdmin) couponService.getScopeCategories().then((response) => setCategories(response?.data ?? [])).catch(() => setCategories([]));
  }, [isAdmin, isOpen]);

  const closeModal = (open) => { if (!open) form.reset(makeDefaultValues(isAdmin)); onOpenChange(open); };
  const toggleId = (fieldName, id) => {
    const selected = form.getValues(fieldName);
    form.setValue(fieldName, selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id], { shouldValidate: true });
  };
  const openPicker = (type) => {
    setPickerQuery('');
    setPickerType(type);
  };
  const normalizeId = (id) => String(id);
  const getCategoryDescendantIds = (categoryId) => {
    const childIds = categories
      .filter((item) => item.parentId != null && normalizeId(item.parentId) === normalizeId(categoryId))
      .map((item) => normalizeId(item.id));
    return childIds.flatMap((childId) => [childId, ...getCategoryDescendantIds(childId)]);
  };
  const toggleCategory = (categoryId) => {
    const normalizedCategoryId = normalizeId(categoryId);
    const category = categories.find((item) => normalizeId(item.id) === normalizedCategoryId);
    if (!category) return;
    const selected = form.getValues('categoryIds').map(normalizeId);
    const descendantIds = getCategoryDescendantIds(normalizedCategoryId);
    if (!category.parentId) {
      const groupIds = [normalizedCategoryId, ...descendantIds];
      const isGroupSelected = groupIds.every((id) => selected.includes(id));
      form.setValue('categoryIds', isGroupSelected
        ? selected.filter((id) => !groupIds.includes(id))
        : [...new Set([...selected, ...groupIds])], { shouldValidate: true });
      setExpandedCategoryIds((ids) => ids.includes(normalizedCategoryId) ? ids : [...ids, normalizedCategoryId]);
      return;
    }
    const ancestorIds = [];
    let current = category;
    while (current.parentId) {
      ancestorIds.push(normalizeId(current.parentId));
      current = categories.find((item) => normalizeId(item.id) === normalizeId(current.parentId)) ?? {};
    }
    const selectedWithoutParents = selected.filter((id) => !ancestorIds.includes(id));
    form.setValue('categoryIds', selected.includes(normalizedCategoryId)
      ? selectedWithoutParents.filter((id) => id !== normalizedCategoryId)
      : [...selectedWithoutParents, normalizedCategoryId], { shouldValidate: true });
  };
  const selectedItems = (pickerType === 'COURSES' ? form.watch('courseIds') : form.watch('categoryIds')).map(normalizeId);
  const pickerItems = pickerType === 'COURSES' ? courses : categories;
  const filteredPickerItems = pickerItems.filter((item) => item.label.toLowerCase().includes(pickerQuery.trim().toLowerCase()));
  const categoryParents = categories.filter((item) => !item.parentId);
  const visibleCategoryParents = categoryParents.filter((parent) => {
    const query = pickerQuery.trim().toLowerCase();
    return !query || parent.label.toLowerCase().includes(query)
      || categories.some((item) => item.parentId != null && normalizeId(item.parentId) === normalizeId(parent.id) && item.label.toLowerCase().includes(query));
  });
  const selectionSummary = (type) => {
    const selected = type === 'COURSES' ? form.watch('courseIds') : form.watch('categoryIds');
    if (selected.length === 0) return type === 'COURSES' ? 'Chọn khóa học áp dụng' : 'Chọn danh mục áp dụng';
    return `Đã chọn ${selected.length} ${type === 'COURSES' ? 'khóa học' : 'danh mục'}`;
  };
  const onSubmit = async (data) => {
    const metadata = { scope: data.scope, courseIds: data.scope === 'COURSES' ? data.courseIds : [], categoryIds: data.scope === 'CATEGORIES' ? data.categoryIds.map(Number) : [] };
    const result = await onSave({
      name: data.name.trim(), code: data.code.trim().toUpperCase(), discountType: Number(data.discountType),
      discountValue: Number(data.discountValue), minDiscount: Number(data.minDiscount),
      maxDiscount: data.discountType === '1' ? Number(data.maxDiscount) : null,
      validFrom: new Date(data.validFrom).toISOString(), validUntil: new Date(data.validUntil).toISOString(),
      quantity: Number(data.quantity), status: coupon?.status ?? 0, metadata: JSON.stringify(metadata),
    });
    if (result?.success) closeModal(false);
  };

  const scopeOptions = isAdmin
    ? [{ value: 'ALL_PLATFORM', label: 'Tất cả khóa học' }, { value: 'COURSES', label: 'Khóa học' }, { value: 'CATEGORIES', label: 'Danh mục' }]
    : [{ value: 'ALL_OWNER_COURSES', label: 'Tất cả khóa học của tôi' }, { value: 'COURSES', label: 'Khóa học' }];

  return <><Dialog open={isOpen && !pickerType} onOpenChange={closeModal}><DialogContent className="sm:max-w-[640px]"><DialogHeader><DialogTitle>{isEditing ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá'}</DialogTitle></DialogHeader>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-3"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Controller control={form.control} name="name" render={({ field, fieldState }) => <AppInput {...field} label="Tên chương trình" containerClassName="sm:col-span-2" placeholder="Ví dụ: Khuyến mãi khai giảng" error={fieldState.error?.message} />} />
      <Controller control={form.control} name="code" render={({ field, fieldState }) => <AppInput {...field} label="Mã giảm giá" className="font-mono uppercase tracking-wider" readOnly error={fieldState.error?.message} rightElement={<AppButton type="button" appVariant="ghostMuted" appSize="sm" className="h-8 w-8 p-0" title="Tạo mã mới" aria-label="Tạo mã giảm giá mới" onClick={() => field.onChange(generateCouponCode())}><RotateCw className="size-4" /></AppButton>} />} />
      <Controller control={form.control} name="scope" render={({ field, fieldState }) => <div className="space-y-1.5"><p className="text-sm font-medium text-foreground">Phân loại</p><AppSelect value={field.value} onValueChange={field.onChange} options={scopeOptions} error={Boolean(fieldState.error)} />{fieldState.error && <p className="text-xs text-error">{fieldState.error.message}</p>}</div>} />
      {scope === 'COURSES' && <div className="sm:col-span-2"><AppInput label="Chọn khóa học" value={selectionSummary('COURSES')} readOnly icon={Search} className="cursor-pointer" onClick={() => openPicker('COURSES')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker('COURSES'); } }} error={form.formState.errors.courseIds?.message} /></div>}
      {scope === 'CATEGORIES' && <div className="sm:col-span-2"><AppInput label="Chọn danh mục" value={selectionSummary('CATEGORIES')} readOnly icon={Search} className="cursor-pointer" onClick={() => openPicker('CATEGORIES')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker('CATEGORIES'); } }} error={form.formState.errors.categoryIds?.message} /></div>}
      <Controller control={form.control} name="discountType" render={({ field }) => <div className="space-y-1.5"><p className="text-sm font-medium text-foreground">Loại giảm giá</p><AppSelect value={field.value} onValueChange={field.onChange} options={[{ value: '1', label: 'Theo phần trăm' }, { value: '2', label: 'Theo số tiền' }]} /></div>} />
      <Controller control={form.control} name="discountValue" render={({ field, fieldState }) => discountType === '1' ? <AppInput {...field} type="number" min="0" step="1" label="Phần trăm giảm" icon={Percent} rightElement="%" error={fieldState.error?.message} onChange={(event) => field.onChange(event.target.value)} /> : <AppInput {...field} type="text" inputMode="numeric" label="Số tiền giảm" icon={CircleDollarSign} rightElement="đ" value={formatCurrency(field.value)} error={fieldState.error?.message} onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ''))} />} />
      <Controller control={form.control} name="minDiscount" render={({ field, fieldState }) => <AppInput {...field} type="text" inputMode="numeric" label="Giá trị đơn hàng tối thiểu" icon={CircleDollarSign} rightElement="đ" value={formatCurrency(field.value)} error={fieldState.error?.message} onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ''))} />} />
      {discountType === '1' && <Controller control={form.control} name="maxDiscount" render={({ field, fieldState }) => <AppInput {...field} type="text" inputMode="numeric" label="Mức giảm tối đa" icon={CircleDollarSign} rightElement="đ" value={formatCurrency(field.value)} error={fieldState.error?.message} onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ''))} />} />}
      <Controller control={form.control} name="quantity" render={({ field, fieldState }) => <AppInput {...field} type="number" min="0" max={fixedAmountQuantityLimit ?? undefined} step="1" label="Số lượng phát hành" icon={Package} containerClassName={discountType === '2' ? 'sm:col-start-1' : undefined} disabled={isHighPercentageDiscount} error={fieldState.error?.message} onChange={(event) => field.onChange(event.target.value)} />} />
      <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2"><Controller control={form.control} name="validFrom" render={({ field, fieldState }) => <AppInput {...field} type="datetime-local" label="Bắt đầu áp dụng" icon={Calendar} error={fieldState.error?.message} />} />
        <Controller control={form.control} name="validUntil" render={({ field, fieldState }) => <AppInput {...field} type="datetime-local" label="Kết thúc áp dụng" icon={Calendar} error={fieldState.error?.message} />} /></div>
    </div><DialogFooter className="gap-2"><AppButton type="button" appVariant="ghostMuted" onClick={() => closeModal(false)}>Hủy</AppButton><AppButton type="submit" appVariant="gradient">{isEditing ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}</AppButton></DialogFooter></form>
  </DialogContent></Dialog>
  <Dialog open={Boolean(pickerType)} onOpenChange={(open) => { if (!open) setPickerType(null); }}><DialogContent className="sm:max-w-[560px]"><DialogHeader><DialogTitle>{pickerType === 'COURSES' ? 'Chọn khóa học' : 'Chọn danh mục'}</DialogTitle></DialogHeader>
    <div className="space-y-4 py-3"><AppInput value={pickerQuery} onChange={(event) => setPickerQuery(event.target.value)} placeholder={pickerType === 'COURSES' ? 'Tìm kiếm khóa học...' : 'Tìm kiếm danh mục...'} icon={Search} />
      <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-lg border border-border bg-card p-4">{pickerType === 'CATEGORIES' ? visibleCategoryParents.length > 0 ? visibleCategoryParents.map((parent) => {
        const children = categories.filter((item) => item.parentId != null && normalizeId(item.parentId) === normalizeId(parent.id));
        const parentIsFullySelected = [normalizeId(parent.id), ...getCategoryDescendantIds(parent.id)].every((id) => selectedItems.includes(id));
        const query = pickerQuery.trim().toLowerCase();
        const parentMatches = parent.label.toLowerCase().includes(query);
        const matchingChildren = children.filter((item) => item.label.toLowerCase().includes(query));
        if (query && !parentMatches && matchingChildren.length === 0) return null;
        const isExpanded = expandedCategoryIds.includes(normalizeId(parent.id)) || Boolean(query);
        return <div key={parent.id} className="space-y-3"><div className="flex items-center gap-1"><AppButton type="button" appVariant="ghostMuted" appSize="sm" className="h-8 w-8 p-0" aria-label={`Hiện danh mục con của ${parent.label}`} onClick={() => setExpandedCategoryIds((ids) => ids.includes(normalizeId(parent.id)) ? ids.filter((id) => id !== normalizeId(parent.id)) : [...ids, normalizeId(parent.id)])}>{isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</AppButton><AppCheckbox id={`coupon-picker-category-${parent.id}`} label={parent.label} checked={parentIsFullySelected} onCheckedChange={() => toggleCategory(parent.id)} /></div>
          {isExpanded && <div className="ml-9 space-y-3 border-l border-border pl-4">{(query && !parentMatches ? matchingChildren : children).map((child) => <AppCheckbox key={child.id} id={`coupon-picker-category-${child.id}`} label={child.label} checked={selectedItems.includes(child.id)} onCheckedChange={() => toggleCategory(child.id)} />)}</div>}</div>;
      }) : <p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy kết quả phù hợp.</p> : filteredPickerItems.length > 0 ? filteredPickerItems.map((item) => <AppCheckbox key={item.id} id={`coupon-picker-${pickerType}-${item.id}`} label={item.label} checked={selectedItems.includes(item.id)} onCheckedChange={() => toggleId('courseIds', item.id)} />) : <p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy kết quả phù hợp.</p>}</div>
    </div><DialogFooter className="gap-2"><AppButton type="button" appVariant="ghostMuted" onClick={() => setPickerType(null)}><ChevronLeft className="size-4" />Quay lại</AppButton><AppButton type="button" appVariant="gradient" onClick={() => setPickerType(null)}>Xác nhận ({selectedItems.length})</AppButton></DialogFooter>
  </DialogContent></Dialog></>;
}
