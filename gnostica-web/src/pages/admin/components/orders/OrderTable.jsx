import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="overflow-x-auto px-4 pb-2">
        <div className="rounded-t-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[60px]">STT</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-left w-[120px]">Mã đơn</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-left">Khách hàng</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-right w-[150px]">Tổng tiền</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[180px]">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[200px]">Mã giao dịch</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingCart className="w-12 h-12 opacity-20" />
                      <p>Không tìm thấy đơn hàng nào.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, index) => (
                  <TableRow key={order.id} className="hover:bg-muted">
                    <TableCell className="text-center font-medium text-muted-foreground">{startIndex + index + 1}</TableCell>
                    <TableCell className="text-left font-bold text-foreground truncate">
                      ORD-{order.id}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{order.account?.fullname || "Ẩn danh"}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{order.account?.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {order.totalPrice?.toLocaleString()}đ
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {order.transactionId || "---"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        onClick={() => onDetailClick(order)}
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
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
