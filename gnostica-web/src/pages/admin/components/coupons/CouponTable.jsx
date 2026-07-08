import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Ticket, Edit, BarChart, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";

export function CouponTable({ coupons, isLoading, onDelete, onToggleStatus }) {
  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto px-4 pb-2">
        <div className="rounded-t-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[50px]">STT</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center">Tên phiếu</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center">Mã phiếu</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[100px]">Giá trị giảm</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[140px]">Điều kiện</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[220px]">Thời gian</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[200px]">Số lượng</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[120px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground font-medium">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Ticket className="w-12 h-12 opacity-20" />
                      <p>Không tìm thấy mã giảm giá nào.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon, index) => (
                  <TableRow key={coupon.id} className="hover:bg-muted">
                    <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-foreground">{coupon.name}</span>
                    </TableCell>
                    <TableCell className="text-center">
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
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-primary">-{coupon.discountPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-left py-4 pl-6">
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
                    </TableCell>
                    <TableCell className="text-center text-sm">
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
                    </TableCell>
                    <TableCell className="text-center w-[200px]">
                      {coupon.quantity === 0 ? (
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
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {coupon.status === 0 && <Badge variant="secondary" className="bg-secondary text-muted-foreground border-border">Tạm ẩn</Badge>}
                      {coupon.status === 1 && <Badge variant="success" className="bg-success/10 text-success text-success border-success/20">Hoạt động</Badge>}
                      {coupon.status === 2 && <Badge variant="destructive" className="bg-error/10 text-error text-error border-error/20">Hết hạn</Badge>}
                      {coupon.status === 3 && <Badge variant="warning" className="bg-warning/10 text-warning text-warning border-warning/20">Hết lượt</Badge>}
                    </TableCell>
                    <TableCell className="text-center w-[120px]">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-info hover:bg-blue-50"
                          title="Đổi trạng thái"
                          onClick={() => onToggleStatus && onToggleStatus(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-purple-600 hover:bg-purple-50"
                          title="Xem biểu đồ"
                        >
                          <BarChart className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-error hover:bg-red-50"
                          title="Xóa mã"
                          onClick={() => onDelete(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
