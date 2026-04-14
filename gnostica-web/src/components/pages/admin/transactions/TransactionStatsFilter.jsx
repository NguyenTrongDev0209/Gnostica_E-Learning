import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TransactionStatsFilter({ 
  searchTerm, onSearchChange, 
  typeFilter, onTypeChange,
  statusFilter, onStatusChange,
  totalCount 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="md:col-span-3 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm giao dịch (mã, nội dung)..."
                className="pl-9 h-10 border-slate-200 focus:bg-white"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-[150px] flex-shrink-0">
              <Select value={typeFilter} onValueChange={onTypeChange}>
                <SelectTrigger className="!h-10 w-full border-slate-200 focus:ring-0 bg-white text-slate-600">
                  <SelectValue placeholder="Phân loại" />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white border border-slate-200 shadow-md">
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="1">Nạp tiền</SelectItem>
                  <SelectItem value="2">Thanh toán</SelectItem>
                  <SelectItem value="3">Rút tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[150px] flex-shrink-0">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="!h-10 w-full border-slate-200 focus:ring-0 bg-white text-slate-600">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="z-[9999] bg-white border border-slate-200 shadow-md">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="1">Thành công</SelectItem>
                  <SelectItem value="0">Chờ xử lý</SelectItem>
                  <SelectItem value="2">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-200 shadow-sm bg-slate-50/50">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
