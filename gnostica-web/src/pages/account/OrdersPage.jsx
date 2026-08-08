import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { MapPin, ShoppingBag, Receipt, ArrowRight, Eye, Download } from "lucide-react";
import useOrders from "@/hooks/account/useOrders";
import { AppButton } from "@/components/common/micro/AppButton";
import { AppDialog } from "@/components/common/micro/AppDialog";
import AppSeparator from "@/components/common/micro/AppSeparator";
import AppBadge from "@/components/common/micro/AppBadge";
import refundService from "@/services/order/refund.service";
import { toast } from "sonner";
import { AppInput } from "@/components/common/micro/AppInput";

export default function Orders() {
  const { 
    orders, 
    loading,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    totalItems,
    totalPages
  } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refundCourse, setRefundCourse] = useState(null);

  const handleRequestRefund = async (e) => {
    e.preventDefault();
    const reason = e.target.reason.value;
    if (!reason) {
      toast.error("Vui lòng nhập lý do hoàn tiền!");
      return;
    }
    
    try {
      await refundService.requestRefund({
        orderDetailId: refundCourse.id,
        reason
      });
      toast.success("Gửi yêu cầu hoàn tiền thành công!");
      setRefundCourse(null);
      // Optional: Refresh the page or update state to reflect the refund request
    } catch (err) {
      toast.error(err.toString());
    }
  };

  const columns = [
    {
      accessor: "index",
      header: "STT",
      width: "72px",
      sortable: false,
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "py-4 text-center font-bold text-muted-foreground",
      render: (_order, rowIndex) => (currentPage - 1) * pageSize + rowIndex + 1,
    },
    { 
      accessor: "orderCode", 
      header: "Mã đơn hàng", 
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "py-4 font-semibold text-foreground",
    },
    { 
      accessor: "date", 
      header: "Ngày đặt",
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "text-muted-foreground font-medium py-4 text-center",
    },
    { 
      accessor: "courses", 
      header: "Khóa học",
      width: "300px",
      className: "py-4 text-center",
      render: (order) => (
        <div className="py-4">
          {order.courses.length > 0 ? (
            <div className="space-y-1">
              {order.courses.map((course, idx) => (
                <p key={idx} className="text-sm text-foreground line-clamp-1">
                  {course.name || course}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">Chưa có thông tin khóa học</p>
          )}
          {order.courses.length > 1 && (
            <span className="text-xs text-muted-foreground mt-1 inline-block">
              +{order.courses.length - 1} khóa học khác
            </span>
          )}
        </div>
      )
    },
    { 
      accessor: "total", 
      header: "Tổng tiền",
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "font-bold bg-accent-gradient bg-clip-text text-transparent py-4 text-center",
    },
    { 
      accessor: "status", 
      header: "Trạng thái",
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "py-4 text-center",
      render: (order) => (
        <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-md border-none shadow-none ${order.statusColor}`}>
          {order.status}
        </span>
      )
    },
    { 
      accessor: "actions", 
      header: "Thao tác",
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "py-4",
      render: (order) => (
        <div className="flex items-center justify-center gap-2">
          <AppButton 
            appVariant="ghostMuted" 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-lg" 
            title="Xem chi tiết"
            onClick={() => setSelectedOrder(order)}
          >
            <Eye className="w-5 h-5" />
          </AppButton>
          <AppButton appVariant="ghostMuted" variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:text-info hover:bg-blue-50" title="Tải hóa đơn">
            <Download className="w-5 h-5" />
          </AppButton>
        </div>
      )
    }
  ];

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Lịch sử đơn hàng" }]} />

      <AppPageHeader
        icon={ShoppingBag}
        title="Lịch sử mua hàng"
        description="Quản lý các giao dịch và đăng ký khóa học của bạn."
      />

      <div className="mb-6">
        <DataFilter 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm mã đơn hàng..."
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <DataTable 
        columns={columns}
        data={orders}
        isLoading={loading}
        emptyState={
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">Bạn chưa có đơn hàng nào</p>
          </div>
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems,
          totalPages,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize
        }}
      />

      <OrderDetailModal 
        open={!!selectedOrder} 
        onOpenChange={(open) => !open && setSelectedOrder(null)} 
        order={selectedOrder}
        onRefund={(course) => {
          setSelectedOrder(null);
          setRefundCourse(course);
        }}
      />

      <AppDialog
        open={!!refundCourse}
        onOpenChange={(open) => !open && setRefundCourse(null)}
        title="Yêu cầu hoàn tiền"
        description={`Khóa học: ${refundCourse?.name}`}
        appVariant="glass"
      >
        <form onSubmit={handleRequestRefund} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Lý do hoàn tiền <span className="text-error">*</span></label>
            <AppInput 
              name="reason" 
              placeholder="VD: Khóa học không phù hợp, đã học trùng..." 
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              Yêu cầu hoàn tiền sẽ được duyệt tự động nếu gửi trong vòng 14 ngày và tiến độ học dưới 20%. Các trường hợp khác sẽ được xem xét thủ công. Số tiền sẽ được hoàn vào Ví cá nhân.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" appVariant="ghostMuted" onClick={() => setRefundCourse(null)}>Hủy</AppButton>
            <AppButton type="submit" appVariant="primary">Gửi yêu cầu</AppButton>
          </div>
        </form>
      </AppDialog>
    </div>
  );
}

function OrderDetailModal({ open, onOpenChange, order, onRefund }) {
  if (!order) return null;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết đơn hàng"
      description={`Mã đơn: ${order.orderCode || order.id}`}
      appVariant="glass"
      className="max-w-2xl [&>button]:bg-error [&>button]:text-white [&>button]:opacity-100 hover:[&>button]:bg-red-600 [&>button]:w-8 [&>button]:h-8 [&>button>svg]:w-5 [&>button>svg]:h-5 [&>button]:rounded-lg [&>button]:shadow-sm"
    >
      <div className="space-y-6 mt-4">
        {/* Status and basic info */}
        <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="space-y-1 flex-1 text-left">
            <p className="text-sm text-muted-foreground font-medium mb-1">Trạng thái</p>
            <div>
              <AppBadge 
                variant={
                  order.statusColor?.includes('success') ? 'success' : 
                  order.statusColor?.includes('error') || order.statusColor?.includes('destructive') ? 'error' : 
                  'warning'
                } 
                soft
              >
                {order.status}
              </AppBadge>
            </div>
          </div>
          <div className="space-y-1 flex-1 sm:text-center">
            <p className="text-sm text-muted-foreground font-medium">Ngày đặt</p>
            <p className="font-semibold text-foreground">{order.date}</p>
          </div>
          <div className="space-y-1 flex-1 sm:text-right">
            <p className="text-sm text-muted-foreground font-medium">Phương thức thanh toán</p>
            <p className="font-semibold text-foreground">{order.method}</p>
          </div>
        </div>

        {/* Product list */}
        <div>
          <h4 className="flex items-center gap-2 font-bold text-foreground mb-3">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Khóa học đã mua
          </h4>
          <div className="space-y-3">
            {order.courses.length > 0 ? order.courses.map((course, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{course.name || course}</p>
                    {course.giftedTo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Đã tặng cho:</span> {course.giftedTo}
                      </p>
                    )}
                  </div>
                </div>
                {order.status === "Thành công" && !course.giftedTo && course.status === 1 && (
                  <AppButton
                    appVariant="outlineMuted"
                    size="sm"
                    className="text-xs h-8 text-error hover:bg-error-soft hover:text-error border-error/20"
                    onClick={() => onRefund(course)}
                  >
                    Hoàn tiền
                  </AppButton>
                )}
              </div>
            )) : (
              <div className="p-3 rounded-xl border border-border text-sm font-medium text-muted-foreground">
                Chưa có thông tin khóa học
              </div>
            )}
          </div>
        </div>

        <AppSeparator />

        {/* Summary */}
        <div>
          <h4 className="flex items-center gap-2 font-bold text-foreground mb-3">
            <Receipt className="w-5 h-5 text-primary" />
            Chi tiết thanh toán
          </h4>
          <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span className="font-semibold">{order.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giảm giá:</span>
              <span className="font-semibold text-success">-0đ</span>
            </div>
            <AppSeparator className="my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Tổng cộng:</span>
              <span className="bg-accent-gradient bg-clip-text text-transparent text-xl">{order.total}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <AppButton appVariant="primary" onClick={() => onOpenChange(false)}>
          Đóng
        </AppButton>
      </div>
    </AppDialog>
  );
}
