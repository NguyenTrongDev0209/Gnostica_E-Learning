import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export function CouponTable({ coupons, isLoading, onDelete }) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="py-4 font-semibold text-slate-900 text-center w-[60px]">STT</TableHead>
              <TableHead className="py-4 font-semibold text-slate-900 text-center">Tên phiếu</TableHead>
              <TableHead className="py-4 font-semibold text-slate-900 text-center">Mã phiếu</TableHead>
              <TableHead className="py-4 font-semibold text-slate-900 text-center">Giá trị giảm</TableHead>
              <TableHead className="py-4 font-semibold text-slate-900 text-center">Điều kiện</TableHead>
              <TableHead className="py-4 font-semibold text-slate-900 text-center w-[220px]">Thời gian</TableHead>
              <TableHead className="py-4 font-semibold text-slate-900 text-center">Số lượng</TableHead>
              <TableHead className="py-4 font-semibold text-slate-900 text-center">Trạng thái</TableHead>
              <TableHead className="py-4 font-semibold text-slate-900 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-slate-500 font-medium">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Ticket className="w-12 h-12 opacity-20" />
                    <p>Không tìm thấy mã giảm giá nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon, index) => (
                <TableRow key={coupon.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-slate-900">{coupon.name}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono font-bold text-primary border border-slate-200">
                        {coupon.code}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-primary">-{coupon.discountPercent}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-left py-4 pl-6">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-slate-600">
                        <span className="text-[10px] uppercase font-bold opacity-40 w-8 inline-block">Min:</span>
                        <span className="font-medium text-slate-900">{coupon.minDiscount?.toLocaleString()}đ</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        <span className="text-[10px] uppercase font-bold opacity-40 w-8 inline-block">Max:</span>
                        <span className="font-medium text-slate-900">{coupon.maxDiscount?.toLocaleString()}đ</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    <div className="flex flex-col items-center">
                      <div className="w-fit text-left space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] uppercase font-bold opacity-50 w-8">Từ:</span>
                          <span className="text-xs">{coupon.startDate ? format(new Date(coupon.startDate), "dd/MM/yyyy HH:mm") : "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] uppercase font-bold opacity-50 w-8">Đến:</span>
                          <span className="text-xs">{coupon.expiryDate ? format(new Date(coupon.expiryDate), "dd/MM/yyyy HH:mm") : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium px-2 py-0.5 rounded text-xs ${coupon.quantity === 0 ? "bg-green-100 text-green-700 font-bold" : "bg-slate-100 text-slate-700"}`}>
                      {coupon.quantity === 0 ? "Vô hạn" : coupon.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {coupon.status === 0 && <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200">Tạm ẩn</Badge>}
                    {coupon.status === 1 && <Badge variant="success" className="bg-green-100 text-green-600 border-green-200">Hoạt động</Badge>}
                    {coupon.status === 2 && <Badge variant="destructive" className="bg-red-100 text-red-600 border-red-200">Hết hạn</Badge>}
                    {coupon.status === 3 && <Badge variant="warning" className="bg-orange-100 text-orange-600 border-orange-200">Hết lượt</Badge>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => onDelete(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
