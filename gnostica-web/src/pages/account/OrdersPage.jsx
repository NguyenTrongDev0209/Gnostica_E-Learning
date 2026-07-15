import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { ShoppingBag, Eye, Download } from "lucide-react";
import useOrders from "@/hooks/account/useOrders";
import { AppButton } from "@/components/common/micro/AppButton";
import OrderDetailModal from "./components/OrderDetailModal";

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

  const columns = [
    { 
      accessor: "id", 
      header: "Mã đơn hàng", 
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "py-4",
    },
    { 
      accessor: "date", 
      header: "Ngày đặt",
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "text-muted-foreground font-medium py-4 text-center",
    },
    { 
      accessor: "courses", 
      header: "Sản phẩm",
      width: "300px",
      className: "py-4 text-center",
      render: (order) => (
        <div className="py-4">
          <div className="space-y-1">
            {order.courses.map((course, idx) => (
              <p key={idx} className="text-sm text-foreground line-clamp-1">
                {course.name || course}
              </p>
            ))}
          </div>
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
      cellClassName: "font-black bg-accent-gradient bg-clip-text text-transparent py-4 text-center",
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
      />
    </div>
  );
}
