import React from 'react';
import AppTable from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import { TableActionIconButton } from "@/components/common/AppButton";
import { Eye, CreditCard, ArrowDownCircle, ArrowUpCircle, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export function TransactionTable({ transactions, isLoading, onDetailClick, startIndex = 0 }) {
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 1: return <ArrowDownCircle className="w-4 h-4 text-success" />;
      case 2: return <ShoppingBag className="w-4 h-4 text-info" />;
      case 3: return <ArrowUpCircle className="w-4 h-4 text-warning" />;
      default: return <CreditCard className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 1: return "Nạp tiền";
      case 2: return "Thanh toán";
      case 3: return "Rút tiền";
      default: return "Khác";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 1: return <Badge variant="success" className="bg-success/10 text-success text-success border-success/20">Thành công</Badge>;
      case 0: return <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border">Chờ xử lý</Badge>;
      case 2: return <Badge variant="destructive" className="bg-error/10 text-error text-error border-error/20">Thất bại</Badge>;
      default: return <Badge variant="outline">Không rõ</Badge>;
    }
  };

    <Card className="border-border shadow-sm overflow-hidden">
      <div className="px-4 pb-2">
        <AppTable
          columns={[
            {
              header: "STT",
              width: "60px",
              className: "text-center",
              cellClassName: "text-center font-medium text-muted-foreground",
              render: (_, index) => startIndex + index + 1,
            },
            {
              header: "Mã giao dịch",
              width: "180px",
              className: "text-left",
              cellClassName: "text-left font-mono text-xs font-bold text-foreground",
              render: (tx) => tx.transactionCode || 'N/A',
            },
            {
              header: "Số tiền",
              width: "140px",
              className: "text-right",
              cellClassName: "text-right font-bold text-foreground",
              render: (tx) => `${tx.amount?.toLocaleString()}đ`,
            },
            {
              header: "Phân loại",
              width: "150px",
              className: "text-center",
              cellClassName: "text-center",
              render: (tx) => (
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
                  {getTypeIcon(tx.type)}
                  {getTypeText(tx.type)}
                </div>
              ),
            },
            {
              header: "Phương thức",
              width: "150px",
              className: "text-center",
              cellClassName: "text-center text-xs text-muted-foreground font-semibold",
              render: (tx) => tx.paymentMethod,
            },
            {
              header: "Trạng thái",
              width: "150px",
              className: "text-center",
              cellClassName: "text-center",
              render: (tx) => getStatusBadge(tx.status),
            },
            {
              header: "Thời gian",
              width: "180px",
              className: "text-center",
              cellClassName: "text-center text-xs text-muted-foreground",
              render: (tx) => tx.createdAt ? format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm:ss") : "N/A",
            },
            {
              header: "Thao tác",
              width: "80px",
              className: "text-center",
              cellClassName: "text-center",
              render: (tx) => (
                <TableActionIconButton
                  icon={Eye}
                  onClick={() => onDetailClick(tx)}
                  title="Xem chi tiết"
                />
              ),
            },
          ]}
          data={transactions}
          isLoading={isLoading}
          loadingState="Đang tải dữ liệu..."
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2">
              <CreditCard className="w-12 h-12 opacity-20" />
              <p>Không tìm thấy giao dịch nào.</p>
            </div>
          }
        />
      </div>
    </Card>
}
