import { useEffect, useMemo, useState } from 'react';
import { Calendar, Edit, Plus, RotateCw, Ticket, Trash2 } from 'lucide-react';

import DataTable from '@/components/common/composite/DataTable';
import { AppButton, TableActionIconButton } from '@/components/common/micro/AppButton';
import AppCard, { AppCardContent } from '@/components/common/micro/AppCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/common/micro/AppDialog';
import AppInput from '@/components/common/micro/AppInput';
import AppBadge from '@/components/common/micro/AppBadge';
import AppSelect from '@/components/common/micro/AppSelect';
import DataFilter from '@/components/common/composite/DataFilter';
import { useCoupons } from '@/hooks/order/useCoupons';
import { CouponFormModal } from './CouponFormModal';

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0,
}).format(Number(value ?? 0));

const formatDiscount = (coupon) => coupon.discountType === 1
  ? `-${coupon.discountValue}%`
  : `-${formatCurrency(coupon.discountValue)}`;

const statusDetails = {
  0: { label: 'Tạm ẩn', variant: 'secondary' },
  1: { label: 'Hoạt động', variant: 'success', soft: true },
  2: { label: 'Hết hạn', variant: 'error', soft: true },
};

export function CouponManagementPage({ title, description, adminLayout = false }) {
  const { coupons, isLoading, addCoupon, editCoupon, removeCoupon, toggleCouponStatus } = useCoupons();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [discountType, setDiscountType] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const status = statusFilter[0] ?? 'all';
  const setStatus = (value) => setStatusFilter(value === 'all' ? [] : [value]);

  const filteredCoupons = useMemo(() => coupons.filter((coupon) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || coupon.code?.toLowerCase().includes(query) || coupon.name?.toLowerCase().includes(query);
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(String(coupon.status));
    const matchesDiscountType = discountType === 'all' || coupon.discountType === Number(discountType);
    const filterDate = coupon.validFrom ? new Date(coupon.validFrom) : null;
    const matchesStartDate = !dateRange.from || (filterDate && filterDate >= new Date(dateRange.from).setHours(0, 0, 0, 0));
    const matchesEndDate = !dateRange.to || (filterDate && filterDate <= new Date(dateRange.to).setHours(23, 59, 59, 999));
    return matchesSearch && matchesStatus && matchesDiscountType && matchesStartDate && matchesEndDate;
  }), [coupons, dateRange, discountType, search, statusFilter]);

  useEffect(() => {
    setCurrentPage(0);
  }, [dateRange, discountType, pageSize, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / pageSize));
  const paginatedCoupons = adminLayout
    ? filteredCoupons.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : filteredCoupons;

  const openCreateForm = () => {
    setEditingCoupon(null);
    setIsFormOpen(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  };

  const saveCoupon = (payload) => editingCoupon
    ? editCoupon(editingCoupon.id, payload)
    : addCoupon(payload);

  const confirmDelete = async () => {
    if (!couponToDelete) return;
    const wasDeleted = await removeCoupon(couponToDelete.id);
    if (wasDeleted) setCouponToDelete(null);
  };

  const columns = [
    ...(adminLayout ? [{
      header: 'STT', width: '72px', align: 'center', headerAlign: 'center',
      className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 text-center font-bold text-muted-foreground',
      render: (_coupon, index) => currentPage * pageSize + index + 1,
    }] : []),
    {
      header: 'Mã & ưu đãi',
      render: (coupon) => (
        <div className="space-y-1.5">
          <p className="font-mono font-bold tracking-wide text-primary">{coupon.code}</p>
          <p className="text-xs text-muted-foreground">{coupon.name}</p>
        </div>
      ),
    },
    {
      header: 'Giảm giá',
      className: 'text-center', cellClassName: 'text-center',
      render: (coupon) => <span className="font-bold text-success">{formatDiscount(coupon)}</span>,
    },
    {
      header: 'Điều kiện',
      render: (coupon) => (
        <div className="text-xs leading-5 text-muted-foreground">
          <p>Đơn tối thiểu: <span className="font-medium text-foreground">{formatCurrency(coupon.minDiscount)}</span></p>
          {coupon.discountType === 1 && <p>Giảm tối đa: <span className="font-medium text-foreground">{formatCurrency(coupon.maxDiscount)}</span></p>}
        </div>
      ),
    },
    {
      header: 'Thời hạn',
      render: (coupon) => (
        <div className="text-xs leading-5 text-muted-foreground">
          <p>{new Date(coupon.validFrom).toLocaleDateString('vi-VN')}</p>
          <p>đến {new Date(coupon.validUntil).toLocaleDateString('vi-VN')}</p>
        </div>
      ),
    },
    {
      header: 'Phát hành', className: 'text-center', cellClassName: 'text-center',
      render: (coupon) => <span className="font-medium">{Number(coupon.quantity ?? 0).toLocaleString('vi-VN')}</span>,
    },
    {
      header: 'Trạng thái', className: 'text-center', cellClassName: 'text-center',
      render: (coupon) => {
        const detail = statusDetails[coupon.status] ?? statusDetails[0];
        return <AppBadge variant={detail.variant} soft={detail.soft}>{detail.label}</AppBadge>;
      },
    },
    {
      header: 'Thao tác', className: 'text-center', cellClassName: 'text-center',
      render: (coupon) => (
        <div className="flex items-center justify-center gap-1">
          <TableActionIconButton icon={Edit} title="Chỉnh sửa" onClick={() => openEditForm(coupon)} />
          <TableActionIconButton icon={RotateCw} title="Bật hoặc tắt" onClick={() => toggleCouponStatus(coupon)} />
          <TableActionIconButton icon={Trash2} colorVariant="error" title="Xóa" onClick={() => setCouponToDelete(coupon)} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground"><Ticket className="size-6 text-primary" />{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <AppButton appVariant="gradient" onClick={openCreateForm}><Plus className="size-4" />Tạo mã giảm giá</AppButton>
      </div>

      {adminLayout ? (
        <DataFilter
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm kiếm mã hoặc tên coupon..."
          dropdownChecklists={[{
            title: 'Trạng thái',
            items: [
              { label: 'Tạm ẩn', value: '0' },
              { label: 'Hoạt động', value: '1' },
              { label: 'Hết hạn', value: '2' },
            ],
            selectedItems: statusFilter,
            onItemToggle: (value) => setStatusFilter((current) => current.includes(value)
              ? current.filter((item) => item !== value)
              : [...current, value]),
            onClear: () => setStatusFilter([]),
          }]}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          dateRangePlaceholder="Ngày bắt đầu"
        >
          <div className="w-full xl:w-[200px]">
            <AppSelect value={discountType} onValueChange={setDiscountType} options={[
              { value: 'all', label: 'Loại giảm giá' },
              { value: '1', label: 'Giảm theo phần trăm' },
              { value: '2', label: 'Giảm theo số tiền' },
            ]} />
          </div>
        </DataFilter>
      ) : (
      <div className="grid gap-4 md:grid-cols-3">
        <AppCard className="md:col-span-2"><AppCardContent className="grid gap-3 p-4 sm:grid-cols-2">
          <AppInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo mã hoặc tên" />
          <AppSelect value={status} onValueChange={setStatus} options={[
            { value: 'all', label: 'Tất cả trạng thái' }, { value: '0', label: 'Tạm ẩn' },
            { value: '1', label: 'Hoạt động' }, { value: '2', label: 'Hết hạn' },
          ]} />
        </AppCardContent></AppCard>
        <AppCard><AppCardContent className="flex items-center gap-3 p-4">
          <Calendar className="size-5 text-primary" /><div><p className="text-xs text-muted-foreground">Tổng số mã</p><p className="text-2xl font-bold">{coupons.length}</p></div>
        </AppCardContent></AppCard>
      </div>
      )}

      <DataTable columns={columns} data={paginatedCoupons} isLoading={isLoading}
        pagination={adminLayout ? {
          currentPage,
          totalPages,
          totalItems: filteredCoupons.length,
          pageSize,
          zeroIndexed: true,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        } : undefined}
        loadingState="Đang tải mã giảm giá..."
        emptyState={<div className="flex flex-col items-center gap-2 py-10 text-muted-foreground"><Ticket className="size-10 opacity-30" /><p>Chưa có mã giảm giá phù hợp.</p></div>} />

      <CouponFormModal coupon={editingCoupon} isOpen={isFormOpen} onOpenChange={setIsFormOpen} onSave={saveCoupon} />

      <Dialog open={Boolean(couponToDelete)} onOpenChange={(open) => !open && setCouponToDelete(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Xóa mã giảm giá?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Mã <span className="font-mono font-semibold text-foreground">{couponToDelete?.code}</span> sẽ không còn hiển thị hoặc áp dụng được. Dữ liệu đơn hàng cũ vẫn được giữ lại.</p>
          <DialogFooter><AppButton appVariant="ghostMuted" onClick={() => setCouponToDelete(null)}>Hủy</AppButton><AppButton appVariant="primary" onClick={confirmDelete}>Xóa mã</AppButton></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
