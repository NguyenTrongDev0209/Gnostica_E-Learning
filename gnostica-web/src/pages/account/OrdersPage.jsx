import React from "react";
import { Link } from "react-router-dom";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import DataTable from "@/components/common/composite/DataTable";
import { ShoppingBag, Eye, Download } from "lucide-react";
import useOrders from "@/hooks/account/useOrders";
import { AppButton } from "@/components/common/micro/AppButton";

export default function Orders() {
  const { 
    orders, 
    loading,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages
  } = useOrders();

  const columns = [
    { 
      accessor: "id", 
      header: "Mã đơn hàng", 
      className: "whitespace-nowrap py-4",
      cellClassName: "font-mono font-semibold text-foreground py-4",
    },
    { 
      accessor: "date", 
      header: "Ngày đặt",
      className: "whitespace-nowrap py-4",
      cellClassName: "text-muted-foreground font-medium py-4",
    },
    { 
      accessor: "courses", 
      header: "Sản phẩm",
      width: "300px",
      render: (order) => (
        <div className="py-4">
          <div className="space-y-1">
            {order.courses.map((course, idx) => (
              <p key={idx} className="text-sm font-bold text-foreground line-clamp-1">
                • {course}
              </p>
            ))}
          </div>
          {order.courses.length > 1 && (
            <span className="text-xs text-primary font-bold mt-1 inline-block">
              +{order.courses.length - 1} khóa học khác
            </span>
          )}
        </div>
      )
    },
    { 
      accessor: "total", 
      header: "Tổng tiền",
      className: "whitespace-nowrap py-4",
      cellClassName: "font-black text-primary py-4",
    },
    { 
      accessor: "method", 
      header: "PT Thanh toán",
      className: "whitespace-nowrap py-4",
      cellClassName: "text-muted-foreground font-medium py-4",
    },
    { 
      accessor: "status", 
      header: "Trạng thái",
      className: "whitespace-nowrap py-4",
      render: (order) => (
        <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-md border-none shadow-none ${order.statusColor}`}>
          {order.status}
        </span>
      )
    },
    { 
      accessor: "actions", 
      header: "Thao tác",
      className: "text-right whitespace-nowrap py-4",
      cellClassName: "text-right py-4",
      render: () => (
        <div className="flex items-center justify-end gap-2">
          <AppButton appVariant="ghostMuted" variant="ghost" size="icon" className="h-9 w-9 rounded-lg" title="Xem chi tiết">
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
    </div>
  );
}
