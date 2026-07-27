import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/micro/AppSelect";
import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import DataTable from "@/components/common/composite/DataTable";
import React, { useState, useEffect } from "react";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import {Search, CheckCircle, Clock, XCircle, ShoppingCart, User, Eye, Info, CreditCard, Receipt} from "lucide-react";
import { useOrders } from "@/hooks/order/useOrders";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";

export default function AdminOrders() {
  // eslint-disable-next-line no-unused-vars
  const { orders, isLoading, fetchOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = orders.filter((order) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.id?.toString().includes(searchStr)) ||
      (order.account?.fullname?.toLowerCase().includes(searchStr)) ||
      (order.account?.email?.toLowerCase().includes(searchStr)) ||
      (order.transactionId?.toLowerCase().includes(searchStr));
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      matchesStatus = order.status === Number(statusFilter);
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleDetailClick = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <OrderHeader />
      
      <OrderStatsFilter 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        totalCount={orders.length} 
      />
      
      <OrderTable 
        orders={paginatedOrders} 
        isLoading={isLoading} 
        onDetailClick={handleDetailClick}
        startIndex={startIndex}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: filteredOrders.length,
          onPageChange: setCurrentPage,
          zeroIndexed: false,
          pageSize: itemsPerPage,
        }}
      />


      <OrderDetailModal 
        isOpen={isDetailModalOpen} 
        onOpenChange={setIsDetailModalOpen} 
        order={selectedOrder} 
      />
    </div>
  );
}


function OrderHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          Quản Lý Đơn Hàng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý và theo dõi trạng thái các đơn hàng trên hệ thống.
        </p>
      </div>
    </div>
  );
}

function OrderStatsFilter({ 
  searchTerm, onSearchChange, 
  statusFilter, onStatusChange,
  totalCount 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <AppCard appVariant="default" className="md:col-span-3 border-border shadow-sm">
        <AppCardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <AppInput
                placeholder="Tìm đơn hàng (mã, khách hàng)..."
                className="pl-9 h-10 border-border focus:bg-white"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-[200px] flex-shrink-0">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="!h-10 w-full border-border focus:ring-0 bg-white text-muted-foreground">
                  <SelectValue placeholder="Trạng thái đơn hàng" />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white border border-border shadow-md">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="1">Đã thanh toán</SelectItem>
                  <SelectItem value="0">Chờ thanh toán</SelectItem>
                  <SelectItem value="2">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AppCardContent>
      </AppCard>
      <AppCard appVariant="default" className="border-border shadow-sm bg-muted">
        <AppCardContent className="p-4 flex flex-col items-center justify-center h-full">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng số đơn</p>
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
        </AppCardContent>
      </AppCard>
    </div>
  );
}

function OrderTable({ orders, isLoading, onDetailClick, startIndex = 0, pagination }) {
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 1: 
        return (
          <AppBadge variant="success" className="bg-success/10 text-success text-success border-success/20 gap-1 flex w-fit items-center mx-auto">
            <CheckCircle className="w-3 h-3" /> Đã thanh toán
          </AppBadge>
        );
      case 0: 
        return (
          <AppBadge variant="secondary" className="bg-warning/10 text-warning border-warning/20 gap-1 flex w-fit items-center mx-auto">
            <Clock className="w-3 h-3" /> Chờ thanh toán
          </AppBadge>
        );
      case 2: 
        return (
          <AppBadge variant="destructive" className="bg-error/10 text-error text-error border-error/20 gap-1 flex w-fit items-center mx-auto">
            <XCircle className="w-3 h-3" /> Đã hủy
          </AppBadge>
        );
      default: 
        return <AppBadge variant="outline" className="mx-auto block w-fit">Không rõ</AppBadge>;
    }
  };

  return (
    <DataTable
          pagination={pagination}
          columns={[
            {
              header: "STT",
              width: "60px",
              className: "text-center",
              cellClassName: "text-center font-medium text-muted-foreground",
              render: (_, index) => startIndex + index + 1,
            },
            {
              header: "Mã đơn",
              width: "120px",
              className: "text-left",
              cellClassName: "text-left font-bold text-foreground truncate",
              render: (order) => `ORD-${order.id}`,
            },
            {
              header: "Khách hàng",
              className: "text-left",
              cellClassName: "text-left",
              render: (order) => (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{order.account?.fullname || "Ẩn danh"}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{order.account?.email}</span>
                  </div>
                </div>
              ),
            },
            {
              header: "Tổng tiền",
              width: "150px",
              className: "text-right",
              cellClassName: "text-right font-bold text-primary",
              render: (order) => `${order.totalPrice?.toLocaleString()}đ`,
            },
            {
              header: "Trạng thái",
              width: "180px",
              className: "text-center",
              cellClassName: "text-center",
              render: (order) => getStatusBadge(order.status),
            },
            {
              header: "Mã giao dịch",
              width: "200px",
              className: "text-center",
              cellClassName: "text-center font-mono text-xs text-muted-foreground",
              render: (order) => order.transactionId || "---",
            },
            {
              header: "Thao tác",
              width: "80px",
              className: "text-center",
              cellClassName: "text-center",
              render: (order) => (
                <TableActionIconButton
                  icon={Eye}
                  onClick={() => onDetailClick(order)}
                  title="Xem chi tiết"
                />
              ),
            },
          ]}
          data={orders}
          isLoading={isLoading}
          loadingState="Đang tải dữ liệu..."
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p>Không tìm thấy đơn hàng nào.</p>
            </div>
          }
        />
  );
}

// eslint-disable-next-line no-unused-vars
const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
      <Icon className="w-3 h-3" /> {label}
    </span>
    <span className="text-sm font-semibold text-foreground">{value || 'N/A'}</span>
  </div>
);

function OrderDetailModal({ isOpen, onOpenChange, order }) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b pb-4">
            Chi tiết Đơn hàng
            <span className="text-xs font-mono text-muted-foreground">#ORD-{order.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest border-l-2 border-primary pl-2">Thông tin khách hàng</h3>
              <div className="bg-muted p-4 rounded-xl border border-border space-y-3">
                <DetailItem icon={User} label="Họ và tên" value={order.account?.fullname} />
                <DetailItem icon={Info} label="Email" value={order.account?.email} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest border-l-2 border-primary pl-2">Thông tin thanh toán</h3>
              <div className="bg-muted p-4 rounded-xl border border-border space-y-3 flex flex-col">
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem icon={CreditCard} label="Trạng thái" value={
                    order.status === 1 ? <AppBadge variant="success" className="bg-success/10 text-success text-success">Đã thanh toán</AppBadge> : 
                    order.status === 0 ? <AppBadge variant="secondary" className="bg-warning/10 text-warning">Chờ thanh toán</AppBadge> : 
                    <AppBadge variant="destructive">Đã hủy</AppBadge>
                  } />
                  <DetailItem icon={Receipt} label="Tổng tiền" value={`${order.totalPrice?.toLocaleString()}đ`} />
                </div>
                <DetailItem icon={Info} label="Mã giao dịch" value={order.transactionId} className="mt-2" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest border-l-2 border-primary pl-2">Sản phẩm đã mua</h3>
            <div className="space-y-3">
              {order.details && order.details.length > 0 ? (
                order.details.map((detail, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-white border border-border rounded-xl shadow-sm hover:border-primary/20 transition-colors">
                    <div className="w-16 h-10 rounded bg-secondary flex-shrink-0 overflow-hidden border border-border">
                      {detail.course?.thumbnailUrl ? (
                        <img src={detail.course.thumbnailUrl} alt={detail.course.title} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-full h-full p-2 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-foreground truncate" title={detail.course?.title}>
                        {detail.course?.title}
                      </span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-muted-foreground font-bold">{detail.price?.toLocaleString()}đ</span>
                        {detail.discount > 0 && (
                          <AppBadge variant="outline" className="text-[8px] h-4 px-1 border-warning/20 text-warning">
                            -{detail.discount}%
                          </AppBadge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted rounded-xl border border-dashed border-border">
                   Không có thông tin khóa học
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}