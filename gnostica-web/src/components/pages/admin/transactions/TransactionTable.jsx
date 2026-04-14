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
      case 1: return <ArrowDownCircle className="w-4 h-4 text-green-500" />;
      case 2: return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 3: return <ArrowUpCircle className="w-4 h-4 text-orange-500" />;
      default: return <CreditCard className="w-4 h-4 text-slate-400" />;
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
      case 1: return <Badge variant="success" className="bg-green-100 text-green-600 border-green-200">Thành công</Badge>;
      case 0: return <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200">Chờ xử lý</Badge>;
      case 2: return <Badge variant="destructive" className="bg-red-100 text-red-600 border-red-200">Thất bại</Badge>;
      default: return <Badge variant="outline">Không rõ</Badge>;
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto px-4 pb-2">
        <div className="rounded-t-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[60px]">STT</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-left w-[180px]">Mã giao dịch</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-right w-[140px]">Số tiền</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[150px]">Phân loại</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[150px]">Phương thức</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[150px]">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[180px]">Thời gian</TableHead>
                <TableHead className="py-4 font-semibold text-slate-900 text-center w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500 font-medium">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-48 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CreditCard className="w-12 h-12 opacity-20" />
                      <p>Không tìm thấy giao dịch nào.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx, index) => (
                  <TableRow key={tx.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-center font-medium text-slate-500">{startIndex + index + 1}</TableCell>
                    <TableCell className="text-left font-mono text-xs font-bold text-slate-700">
                      {tx.transactionCode || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {tx.amount?.toLocaleString()}đ
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium">
                        {getTypeIcon(tx.type)}
                        {getTypeText(tx.type)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-600 font-semibold">
                      {tx.paymentMethod}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(tx.status)}
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-500">
                      {tx.createdAt ? format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm:ss") : "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5"
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
