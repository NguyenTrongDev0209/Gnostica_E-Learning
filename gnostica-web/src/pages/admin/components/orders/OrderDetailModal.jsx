import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, Receipt, CreditCard, ShoppingBag, Info, Calendar } from "lucide-react";

export function OrderDetailModal({ isOpen, onOpenChange, order }) {
  if (!order) return null;

  const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value || 'N/A'}</span>
    </div>
  );

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
                    order.status === 1 ? <Badge variant="success" className="bg-success/10 text-success text-success">Đã thanh toán</Badge> : 
                    order.status === 0 ? <Badge variant="secondary" className="bg-amber-100 text-amber-600">Chờ thanh toán</Badge> : 
                    <Badge variant="destructive">Đã hủy</Badge>
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
                        <ShoppingBag className="w-full h-full p-2 text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-foreground truncate" title={detail.course?.title}>
                        {detail.course?.title}
                      </span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-muted-foreground font-bold">{detail.price?.toLocaleString()}đ</span>
                        {detail.discount > 0 && (
                          <Badge variant="outline" className="text-[8px] h-4 px-1 border-warning/20 text-warning">
                            -{detail.discount}%
                          </Badge>
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
