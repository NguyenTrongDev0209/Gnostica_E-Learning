import React from "react";
import { AppDialog } from "@/components/common/micro/AppDialog";
import { AppButton } from "@/components/common/micro/AppButton";
import { MapPin, ShoppingBag, Receipt, ArrowRight } from "lucide-react";
import AppSeparator from "@/components/common/micro/AppSeparator";
import AppBadge from "@/components/common/micro/AppBadge";

export default function OrderDetailModal({ open, onOpenChange, order }) {
  if (!order) return null;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết đơn hàng"
      description={`Mã đơn: ${order.id}`}
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
            Sản phẩm đã mua
          </h4>
          <div className="space-y-3">
            {order.courses.map((course, idx) => (
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
              </div>
            ))}
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
