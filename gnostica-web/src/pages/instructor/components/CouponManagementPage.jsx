import { useEffect, useMemo, useState } from 'react';
import { Copy, Edit, Eye, Plus, Power, Ticket, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import DataTable from '@/components/common/composite/DataTable';
import { AppButton, TableActionIconButton } from '@/components/common/micro/AppButton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/common/micro/AppDialog';
import AppBadge from '@/components/common/micro/AppBadge';
import AppAvatar from '@/components/common/micro/AppAvatar';
import DataFilter from '@/components/common/composite/DataFilter';
import { Tabs, TabsList, TabsTrigger } from '@/components/common/micro/AppTabs';
import { useCoupons } from '@/hooks/order/useCoupons';
import { CouponFormModal } from './CouponFormModal';

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0,
}).format(Number(value ?? 0));

const formatDiscount = (coupon) => coupon.discountType === 1
  ? `-${coupon.discountValue}%`
  : `-${formatCurrency(coupon.discountValue)}`;

const formatDateTime = (value) => value
  ? new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(value)).replace(/,/, '')
  : '--';

const statusDetails = {
  0: { label: 'Tạm ẩn', variant: 'secondary' },
  1: { label: 'Hoạt động', variant: 'success' },
  2: { label: 'Hết hạn', variant: 'error' },
};

export function CouponManagementPage({ title, description, adminLayout = false, adminOwnerType, readOnly = false }) {
  const { coupons, isLoading, addCoupon, editCoupon, removeCoupon, toggleCouponStatus } = useCoupons({ adminOwnerType });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [discountType, setDiscountType] = useState('1');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [couponToView, setCouponToView] = useState(null);

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
  const paginatedCoupons = filteredCoupons.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

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
  const copyCouponCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Đã sao chép mã giảm giá');
    } catch {
      toast.error('Không thể sao chép mã giảm giá');
    }
  };

  const columns = [
    {
      header: 'STT', width: '72px', align: 'center', headerAlign: 'center',
      className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 text-center font-bold text-muted-foreground whitespace-nowrap',
      render: (_coupon, index) => currentPage * pageSize + index + 1,
    },
    {
      header: 'Chương trình',
      className: 'py-4', cellClassName: 'py-4',
      render: (coupon) => adminOwnerType === 'INSTRUCTOR'
        ? <span className="text-sm font-bold text-foreground">{coupon.name}</span>
        : <div className="space-y-1"><p className="text-sm font-bold text-foreground">{coupon.name}</p><div className="flex items-center gap-1"><TableActionIconButton icon={Copy} title="Sao chép mã giảm giá" className="h-6 w-6" onClick={() => copyCouponCode(coupon.code)} /><span className="font-mono text-xs font-semibold tracking-wide text-primary">{coupon.code}</span></div></div>,
    },
    ...(adminOwnerType === 'INSTRUCTOR' ? [{
      header: 'Tác giả',
      className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 whitespace-nowrap',
      render: (coupon) => <div className="flex items-center gap-3"><AppAvatar src={coupon.accountAvatar} alt={coupon.accountName} size="sm" /><div className="min-w-0"><p className="truncate text-sm font-bold text-foreground">{coupon.accountName || 'Chưa xác định'}</p><p className="truncate text-xs text-muted-foreground">{coupon.accountEmail || '--'}</p></div></div>,
    }] : []),
    {
      header: 'Giá trị',
      align: 'center', headerAlign: 'center', className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 text-center whitespace-nowrap',
      render: (coupon) => <span className="font-bold text-primary">{formatDiscount(coupon)}</span>,
    },
    {
      header: 'Điều kiện',
      className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 whitespace-nowrap',
      render: (coupon) => (
        <div className="text-xs leading-5 text-muted-foreground">
          <p>Đơn tối thiểu: <span className="font-medium text-foreground">{formatCurrency(coupon.minDiscount)}</span></p>
          {coupon.discountType === 1 && <p>Giảm tối đa: <span className="font-medium text-foreground">{formatCurrency(coupon.maxDiscount)}</span></p>}
        </div>
      ),
    },
    {
      header: 'Bắt đầu', align: 'center', headerAlign: 'center', className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 text-center text-sm font-medium whitespace-nowrap',
      render: (coupon) => formatDateTime(coupon.validFrom),
    },
    {
      header: 'Hết hạn', align: 'center', headerAlign: 'center', className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 text-center text-sm font-medium whitespace-nowrap',
      render: (coupon) => formatDateTime(coupon.validUntil),
    },
    {
      header: 'Lượt dùng', align: 'center', headerAlign: 'center', className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 text-center whitespace-nowrap',
      render: (coupon) => {
        const usedCount = Number(coupon.usedCount ?? 0);
        const totalQuantity = Number(coupon.totalQuantity ?? coupon.quantity ?? 0);
        const usagePercent = totalQuantity > 0 ? Math.min(100, Math.round((usedCount / totalQuantity) * 100)) : 0;
        return <div className="mx-auto w-[130px] space-y-1.5"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-foreground">{usedCount}/{totalQuantity}</span><span className="font-medium text-muted-foreground">{usagePercent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usagePercent}%` }} /></div></div>;
      },
    },
    {
      header: 'Trạng thái', align: 'center', headerAlign: 'center', className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 whitespace-nowrap',
      render: (coupon) => {
        const detail = statusDetails[coupon.status] ?? statusDetails[0];
        return <div className="flex justify-center"><AppBadge variant={detail.variant} className="w-[100px] justify-center px-2.5 py-1 text-white">{detail.label}</AppBadge></div>;
      },
    },
    ...(!readOnly ? [{
      header: 'Thao tác', align: 'center', headerAlign: 'center', className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 text-center whitespace-nowrap',
      render: (coupon) => (
        <div className="flex items-center justify-center gap-2">
          <AppButton appVariant="ghostMuted" appSize="sm" className="w-9 p-0 bg-info text-white hover:bg-info/90 disabled:opacity-50" title={coupon.usedCount > 0 ? "Không thể sửa khi đã có lượt dùng" : "Chỉnh sửa"} disabled={coupon.usedCount > 0} onClick={() => openEditForm(coupon)}><Edit className="size-4" /></AppButton>
          <AppButton appVariant="ghostMuted" appSize="sm" className="w-9 p-0 bg-success text-white hover:bg-success/90" title="Bật hoặc tắt" onClick={() => toggleCouponStatus(coupon)}><Power className="size-4" /></AppButton>
          <AppButton appVariant="ghostMuted" appSize="sm" className="w-9 p-0 bg-error text-white hover:bg-error/90 disabled:opacity-50" title={coupon.usedCount > 0 ? "Không thể xóa khi đã có lượt dùng" : "Xóa"} disabled={coupon.usedCount > 0} onClick={() => setCouponToDelete(coupon)}><Trash2 className="size-4" /></AppButton>
        </div>
      ),
    }] : [{
      header: 'Thao tác', align: 'center', headerAlign: 'center', className: 'py-4 whitespace-nowrap', cellClassName: 'py-4 text-center whitespace-nowrap',
      render: (coupon) => <AppButton appVariant="ghostMuted" appSize="sm" className="w-9 p-0 border border-border bg-card text-primary hover:bg-primary/10" title="Xem chi tiết" onClick={() => setCouponToView(coupon)}><Eye className="size-4" /></AppButton>,
    }]),
  ];

  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground"><Ticket className="size-6 text-primary" />{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {!readOnly && <AppButton appVariant="gradient" onClick={openCreateForm}><Plus className="size-4" />Tạo mã giảm giá</AppButton>}
      </div>

      <div className="space-y-4">
        <Tabs value={discountType} onValueChange={setDiscountType}>
          <TabsList className="bg-secondary p-1">
            <TabsTrigger value="1" className="px-6 font-semibold">Theo %</TabsTrigger>
            <TabsTrigger value="2" className="px-6 font-semibold">Theo giá</TabsTrigger>
          </TabsList>
        </Tabs>
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
        />
      </div>

      <DataTable columns={columns} data={paginatedCoupons} isLoading={isLoading}
        pagination={{
          currentPage,
          totalPages,
          totalItems: filteredCoupons.length,
          pageSize,
          zeroIndexed: true,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        loadingState="Đang tải mã giảm giá..."
        emptyState={<div className="flex flex-col items-center gap-2 py-10 text-muted-foreground"><Ticket className="size-10 opacity-30" /><p>Chưa có mã giảm giá phù hợp.</p></div>} />

      <CouponFormModal coupon={editingCoupon} isAdmin={adminLayout} isOpen={isFormOpen} onOpenChange={setIsFormOpen} onSave={saveCoupon} />

      <Dialog open={Boolean(couponToDelete)} onOpenChange={(open) => !open && setCouponToDelete(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Xóa mã giảm giá?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Mã <span className="font-mono font-semibold text-foreground">{couponToDelete?.code}</span> sẽ không còn hiển thị hoặc áp dụng được. Dữ liệu đơn hàng cũ vẫn được giữ lại.</p>
          <DialogFooter><AppButton appVariant="ghostMuted" onClick={() => setCouponToDelete(null)}>Hủy</AppButton><AppButton appVariant="primary" onClick={confirmDelete}>Xóa mã</AppButton></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(couponToView)} onOpenChange={(open) => !open && setCouponToView(null)}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Chi tiết mã giảm giá</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 text-sm"><div><p className="text-xs font-medium text-muted-foreground">Chương trình</p><p className="mt-1 font-semibold text-foreground">{couponToView?.name}</p></div><div><p className="text-xs font-medium text-muted-foreground">Mã giảm giá</p><p className="mt-1 font-mono font-semibold text-primary">{couponToView?.code}</p></div><div className="grid grid-cols-2 gap-4"><div><p className="text-xs font-medium text-muted-foreground">Giá trị</p><p className="mt-1 font-semibold text-foreground">{couponToView && formatDiscount(couponToView)}</p></div><div><p className="text-xs font-medium text-muted-foreground">Lượt dùng</p><p className="mt-1 font-semibold text-foreground">{couponToView?.usedCount ?? 0}/{couponToView?.totalQuantity ?? couponToView?.quantity ?? 0}</p></div></div><div className="grid grid-cols-2 gap-4"><div><p className="text-xs font-medium text-muted-foreground">Bắt đầu</p><p className="mt-1 font-medium text-foreground">{formatDateTime(couponToView?.validFrom)}</p></div><div><p className="text-xs font-medium text-muted-foreground">Hết hạn</p><p className="mt-1 font-medium text-foreground">{formatDateTime(couponToView?.validUntil)}</p></div></div></div>
          <DialogFooter><AppButton appVariant="ghostMuted" onClick={() => setCouponToView(null)}>Đóng</AppButton></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
