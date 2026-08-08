import React from "react";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { RotateCcw } from "lucide-react";
import useRefunds from "@/hooks/account/useRefunds";

export default function RefundsPage() {
  const { 
    refunds, 
    loading,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    totalItems,
    totalPages
  } = useRefunds();

  const columns = [
    {
      accessor: "index",
      header: "STT",
      width: "72px",
      sortable: false,
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "py-4 text-center font-bold text-muted-foreground",
      render: (_refund, rowIndex) => (currentPage - 1) * pageSize + rowIndex + 1,
    },
    { 
      accessor: "orderCode", 
      header: "Mã đơn hàng", 
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "py-4 font-semibold text-foreground text-center",
    },
    { 
      accessor: "courseName", 
      header: "Khóa học",
      className: "py-4 text-center",
      cellClassName: "py-4 text-sm font-medium text-foreground text-left",
    },
    { 
      accessor: "amount", 
      header: "Số tiền",
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "font-bold bg-accent-gradient bg-clip-text text-transparent py-4 text-center",
    },
    { 
      accessor: "reason", 
      header: "Lý do",
      className: "py-4 text-center",
      cellClassName: "py-4 text-sm text-muted-foreground text-left max-w-xs truncate",
    },
    { 
      accessor: "date", 
      header: "Ngày gửi",
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "text-muted-foreground font-medium py-4 text-center",
    },
    { 
      accessor: "status", 
      header: "Trạng thái",
      className: "whitespace-nowrap py-4 text-center",
      cellClassName: "py-4 text-center",
      render: (refund) => (
        <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-md border-none shadow-none ${refund.statusColor}`}>
          {refund.statusLabel}
        </span>
      )
    }
  ];

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Yêu cầu hoàn tiền" }]} />

      <AppPageHeader
        icon={RotateCcw}
        title="Yêu cầu hoàn tiền"
        description="Xem lịch sử và trạng thái các yêu cầu hoàn tiền của bạn."
      />

      <div className="mb-6">
        <DataFilter 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Tìm kiếm mã đơn hàng hoặc khóa học..."
        />
      </div>

      <DataTable 
        columns={columns}
        data={refunds}
        isLoading={loading}
        emptyState={
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">Bạn chưa có yêu cầu hoàn tiền nào</p>
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
