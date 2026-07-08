import React from 'react';
import AppTable from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import { TableActionIconButton } from "@/components/common/AppButton";
import { Trash2, Calendar, Ticket, Edit, BarChart, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";

export function CouponTable({ coupons, isLoading, onDelete, onToggleStatus }) {
  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <div className="px-4 pb-2">
        <AppTable
          columns={[
            {
              header: "STT",
              width: "50px",
              className: "text-center",
              cellClassName: "text-center font-medium text-muted-foreground",
              render: (_, index) => index + 1,
            },
            {
              header: "Tên phiếu",
              className: "text-center",
              cellClassName: "text-center",
              render: (coupon) => <span className="font-bold text-foreground">{coupon.name}</span>,
            },
            {
              header: "Mã phiếu",
              className: "text-center",
              cellClassName: "text-center",
              render: (coupon) => (
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.code);
                      toast.success(`Đã sao chép mã: ${coupon.code}`);
                    }}
                    title="Nhấn để sao chép"
                    className="group flex flex-row items-center gap-1.5 bg-secondary hover:bg-muted/70 px-2 py-1 rounded border border-border hover:border-border transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-mono font-bold text-primary">
                      {coupon.code}
                    </span>
                    <Copy className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              ),
            },
            {
              header: "Giá trị giảm",
              width: "100px",
              className: "text-center",
              cellClassName: "text-center",
              render: (coupon) => (
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-primary">-{coupon.discountPercent}%</span>
                </div>
              ),
            },
            {
              header: "Điều kiện",
              width: "140px",
              className: "text-center",
              cellClassName: "text-left py-4 pl-6",
              render: (coupon) => (
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-muted-foreground">
                    <span className="text-[10px] uppercase font-bold opacity-40 w-8 inline-block">Min:</span>
                    <span className="font-medium text-foreground">{coupon.minDiscount?.toLocaleString()}đ</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-[10px] uppercase font-bold opacity-40 w-8 inline-block">Max:</span>
                    <span className="font-medium text-foreground">{coupon.maxDiscount?.toLocaleString()}đ</span>
                  </div>
                </div>
              ),
            },
            {
              header: "Thời gian",
              width: "220px",
              className: "text-center",
              cellClassName: "text-center text-sm",
              render: (coupon) => (
                <div className="flex flex-col items-center">
                  <div className="w-fit text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] uppercase font-bold opacity-50 w-8">Từ:</span>
                      <span className="text-xs">{coupon.startDate ? format(new Date(coupon.startDate), "dd/MM/yyyy HH:mm") : "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] uppercase font-bold opacity-50 w-8">Đến:</span>
                      <span className="text-xs">{coupon.expiryDate ? format(new Date(coupon.expiryDate), "dd/MM/yyyy HH:mm") : "N/A"}</span>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "Số lượng",
              width: "200px",
              className: "text-center",
              cellClassName: "text-center w-[200px]",
              render: (coupon) => (
                coupon.quantity === 0 ? (
                  <span className="font-bold text-success bg-success/10 text-success px-2 py-0.5 rounded text-xs">Vô hạn</span>
                ) : (
                  <div className="flex flex-col gap-1 w-full max-w-[160px] mx-auto">
                    <div className="flex justify-between items-end text-[10px] text-muted-foreground font-medium px-1">
                      <span className="text-primary font-bold">0%</span>
                      <span>0 / {coupon.quantity.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                )
              ),
            },
            {
              header: "Trạng thái",
              className: "text-center",
              cellClassName: "text-center",
              render: (coupon) => (
                <>
                  {coupon.status === 0 && <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border">Tạm ẩn</Badge>}
                  {coupon.status === 1 && <Badge variant="success" className="bg-success/10 text-success text-success border-success/20">Hoạt động</Badge>}
                  {coupon.status === 2 && <Badge variant="destructive" className="bg-error/10 text-error text-error border-error/20">Hết hạn</Badge>}
                  {coupon.status === 3 && <Badge variant="warning" className="bg-warning/10 text-warning text-warning border-warning/20">Hết lượt</Badge>}
                </>
              ),
            },
            {
              header: "Thao tác",
              width: "120px",
              className: "text-center",
              cellClassName: "text-center w-[120px]",
              render: (coupon) => (
                <div className="flex items-center justify-center gap-1">
                  <TableActionIconButton
                    icon={Edit}
                    title="Đổi trạng thái"
                    onClick={() => onToggleStatus && onToggleStatus(coupon)}
                  />
                  <TableActionIconButton
                    icon={BarChart}
                    title="Xem biểu đồ"
                  />
                  <TableActionIconButton
                    icon={Trash2}
                    colorVariant="error"
                    title="Xóa mã"
                    onClick={() => onDelete(coupon.id)}
                  />
                </div>
              ),
            },
          ]}
          data={coupons}
          isLoading={isLoading}
          loadingState="Đang tải dữ liệu..."
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2">
              <Ticket className="w-12 h-12 opacity-20" />
              <p>Không tìm thấy mã giảm giá nào.</p>
            </div>
          }
        />
      </div>
    </Card>
  );
}
