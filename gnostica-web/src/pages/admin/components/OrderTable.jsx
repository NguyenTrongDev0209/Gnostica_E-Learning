import React from 'react';
import DataTable from "@/components/common/composite/DataTable";
import { Badge } from "@/components/ui/badge";
import { TableActionIconButton } from "@/components/common/micro/AppButton";
import { Eye, User, ShoppingCart, CreditCard, XCircle, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

export function OrderTable({ orders, isLoading, onDetailClick, startIndex = 0 }) {
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 1: 
        return (
          <Badge variant="success" className="bg-success/10 text-success text-success border-success/20 gap-1 flex w-fit items-center mx-auto">
            <CheckCircle className="w-3 h-3" /> Đã thanh toán
          </Badge>
        );
      case 0: 
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-600 border-amber-200 gap-1 flex w-fit items-center mx-auto">
            <Clock className="w-3 h-3" /> Chờ thanh toán
          </Badge>
        );
      case 2: 
        return (
          <Badge variant="destructive" className="bg-error/10 text-error text-error border-error/20 gap-1 flex w-fit items-center mx-auto">
            <XCircle className="w-3 h-3" /> Đã hủy
          </Badge>
        );
      default: 
        return <Badge variant="outline" className="mx-auto block w-fit">Không rõ</Badge>;
    }
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <div className="px-4 pb-2">
        <DataTable
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
      </div>
    </Card>
  );
}
