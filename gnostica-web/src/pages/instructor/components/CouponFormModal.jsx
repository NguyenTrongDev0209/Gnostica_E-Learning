import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { z } from 'zod';
import { Calendar, CircleDollarSign, Package, Percent, Tag, Ticket } from 'lucide-react';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/common/micro/AppDialog';
import { AppButton } from '@/components/common/micro/AppButton';
import AppInput from '@/components/common/micro/AppInput';
import AppSelect from '@/components/common/micro/AppSelect';

const toLocalDateTimeInput = (value) =>
  value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : '';

const defaultValues = {
  name: '',
  code: '',
  discountType: '1',
  discountValue: 10,
  minDiscount: 0,
  maxDiscount: 0,
  validFrom: toLocalDateTimeInput(new Date()),
  validUntil: '',
  quantity: 100,
  status: '0',
};

const couponSchema = z.object({
  name: z.string().trim().min(1, 'Tên phiếu giảm giá không được để trống').max(255),
  code: z.string().trim().min(3, 'Mã giảm giá cần ít nhất 3 ký tự').max(255)
    .regex(/^[A-Za-z0-9_-]+$/, 'Chỉ dùng chữ, số, dấu gạch dưới hoặc gạch ngang'),
  discountType: z.enum(['1', '2']),
  discountValue: z.coerce.number().positive('Giá trị giảm phải lớn hơn 0'),
  minDiscount: z.coerce.number().min(0, 'Giá trị đơn hàng tối thiểu không được âm'),
  maxDiscount: z.coerce.number().min(0, 'Mức giảm tối đa không được âm'),
  validFrom: z.string().min(1, 'Chọn thời điểm bắt đầu'),
  validUntil: z.string().min(1, 'Chọn thời điểm kết thúc'),
  quantity: z.coerce.number().int().min(0, 'Số lượng không được âm'),
  status: z.enum(['0', '1', '2']),
}).superRefine((value, context) => {
  if (value.discountType === '1' && value.discountValue > 100) {
    context.addIssue({ code: 'custom', path: ['discountValue'], message: 'Giảm theo phần trăm không vượt quá 100%' });
  }
  if (new Date(value.validUntil) <= new Date(value.validFrom)) {
    context.addIssue({ code: 'custom', path: ['validUntil'], message: 'Thời điểm kết thúc phải sau thời điểm bắt đầu' });
  }
});

function buildFormValues(coupon) {
  if (!coupon) return defaultValues;
  return {
    name: coupon.name ?? '',
    code: coupon.code ?? '',
    discountType: String(coupon.discountType ?? 1),
    discountValue: coupon.discountValue ?? 0,
    minDiscount: coupon.minDiscount ?? 0,
    maxDiscount: coupon.maxDiscount ?? 0,
    validFrom: toLocalDateTimeInput(coupon.validFrom),
    validUntil: toLocalDateTimeInput(coupon.validUntil),
    quantity: coupon.quantity ?? 0,
    status: String(coupon.status ?? 0),
  };
}

export function CouponFormModal({ coupon, isOpen, onOpenChange, onSave }) {
  const form = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues,
  });
  const discountType = form.watch('discountType');
  const isEditing = Boolean(coupon?.id);

  useEffect(() => {
    if (isOpen) form.reset(buildFormValues(coupon));
  }, [coupon, form, isOpen]);

  const closeModal = (open) => {
    if (!open) form.reset(defaultValues);
    onOpenChange(open);
  };

  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      discountType: Number(data.discountType),
      discountValue: Number(data.discountValue),
      minDiscount: Number(data.minDiscount),
      maxDiscount: data.discountType === '1' ? Number(data.maxDiscount) : null,
      validFrom: new Date(data.validFrom).toISOString(),
      validUntil: new Date(data.validUntil).toISOString(),
      quantity: Number(data.quantity),
      status: Number(data.status),
    };
    const result = await onSave(payload);
    if (result?.success) closeModal(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <Ticket className="size-5 text-primary" />
            {isEditing ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller control={form.control} name="name" render={({ field, fieldState }) => (
              <AppInput {...field} label="Tên chương trình" containerClassName="sm:col-span-2"
                placeholder="Ví dụ: Khuyến mãi khai giảng" error={fieldState.error?.message} />
            )} />
            <Controller control={form.control} name="code" render={({ field, fieldState }) => (
              <AppInput {...field} label="Mã giảm giá" icon={Tag} className="font-mono uppercase tracking-wider"
                placeholder="KHAIGIANG2026" error={fieldState.error?.message}
                onChange={(event) => field.onChange(event.target.value.toUpperCase())} />
            )} />
            <Controller control={form.control} name="status" render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">Trạng thái</p>
                <AppSelect {...field} value={field.value} onValueChange={field.onChange} error={Boolean(fieldState.error)}
                  options={[{ value: '0', label: 'Tạm ẩn' }, { value: '1', label: 'Hoạt động' }, { value: '2', label: 'Hết hạn' }]} />
                {fieldState.error && <p className="text-xs text-error">{fieldState.error.message}</p>}
              </div>
            )} />
            <Controller control={form.control} name="discountType" render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">Loại giảm giá</p>
                <AppSelect {...field} value={field.value} onValueChange={field.onChange} error={Boolean(fieldState.error)}
                  options={[{ value: '1', label: 'Theo phần trăm' }, { value: '2', label: 'Theo số tiền' }]} />
                {fieldState.error && <p className="text-xs text-error">{fieldState.error.message}</p>}
              </div>
            )} />
            <Controller control={form.control} name="discountValue" render={({ field, fieldState }) => (
              <AppInput {...field} type="number" min="0" step="1" label={discountType === '1' ? 'Phần trăm giảm' : 'Số tiền giảm'}
                icon={discountType === '1' ? Percent : CircleDollarSign} rightElement={discountType === '1' ? '%' : 'đ'}
                error={fieldState.error?.message} onChange={(event) => field.onChange(event.target.value)} />
            )} />
            <Controller control={form.control} name="minDiscount" render={({ field, fieldState }) => (
              <AppInput {...field} type="number" min="0" step="1000" label="Giá trị đơn hàng tối thiểu" icon={CircleDollarSign}
                rightElement="đ" error={fieldState.error?.message} onChange={(event) => field.onChange(event.target.value)} />
            )} />
            {discountType === '1' && <Controller control={form.control} name="maxDiscount" render={({ field, fieldState }) => (
              <AppInput {...field} type="number" min="0" step="1000" label="Mức giảm tối đa" icon={CircleDollarSign}
                rightElement="đ" error={fieldState.error?.message} onChange={(event) => field.onChange(event.target.value)} />
            )} />}
            <Controller control={form.control} name="quantity" render={({ field, fieldState }) => (
              <AppInput {...field} type="number" min="0" step="1" label="Số lượng phát hành" icon={Package}
                error={fieldState.error?.message} onChange={(event) => field.onChange(event.target.value)} />
            )} />
            <Controller control={form.control} name="validFrom" render={({ field, fieldState }) => (
              <AppInput {...field} type="datetime-local" label="Bắt đầu áp dụng" icon={Calendar} error={fieldState.error?.message} />
            )} />
            <Controller control={form.control} name="validUntil" render={({ field, fieldState }) => (
              <AppInput {...field} type="datetime-local" label="Kết thúc áp dụng" icon={Calendar} error={fieldState.error?.message} />
            )} />
          </div>

          <DialogFooter className="gap-2">
            <AppButton type="button" appVariant="ghostMuted" onClick={() => closeModal(false)}>Hủy</AppButton>
            <AppButton type="submit" appVariant="gradient">{isEditing ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}</AppButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
