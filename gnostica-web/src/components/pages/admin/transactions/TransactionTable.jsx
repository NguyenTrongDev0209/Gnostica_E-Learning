import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto px-4 pb-2">
        <div className="rounded-t-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[60px]">STT</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-left w-[180px]">Mã giao dịch</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-right w-[140px]">Số tiền</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[150px]">Phân loại</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[150px]">Phương thức</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[150px]">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[180px]">Thời gian</TableHead>
                <TableHead className="py-4 font-semibold text-foreground text-center w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground font-medium">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CreditCard className="w-12 h-12 opacity-20" />
                      <p>Không tìm thấy giao dịch nào.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx, index) => (
                  <TableRow key={tx.id} className="hover:bg-muted">
                    <TableCell className="text-center font-medium text-muted-foreground">{startIndex + index + 1}</TableCell>
                    <TableCell className="text-left font-mono text-xs font-bold text-foreground">
                      {tx.transactionCode || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {tx.amount?.toLocaleString()}đ
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
                        {getTypeIcon(tx.type)}
                        {getTypeText(tx.type)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground font-semibold">
                      {tx.paymentMethod}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(tx.status)}
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {tx.createdAt ? format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm:ss") : "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        onClick={() => onDetailClick(tx)}
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
