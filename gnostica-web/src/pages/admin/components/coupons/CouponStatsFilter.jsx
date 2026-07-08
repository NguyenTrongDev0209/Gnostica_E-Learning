import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CouponStatsFilter({ 
  searchTerm, onSearchChange, 
  statusFilter, onStatusChange,
  startDateFilter, onStartDateChange,
  endDateFilter, onEndDateChange,
  totalCount 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="md:col-span-3 border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mã giảm giá..."
                className="pl-9 h-10 border-border focus:bg-white"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-[160px] flex-shrink-0">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="!h-10 w-full border-border focus:ring-0 bg-white">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="1">Hoạt động</SelectItem>
                  <SelectItem value="0">Tạm ẩn</SelectItem>
                  <SelectItem value="2">Hết hạn</SelectItem>
                  <SelectItem value="3">Hết lượt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[140px]">
              <Input
                type="date"
                className="h-10 border-border focus:bg-white text-muted-foreground"
                value={startDateFilter}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>
            
            <div className="hidden md:flex items-center text-slate-300">-</div>

            <div className="w-full md:w-[140px]">
              <Input
                type="date"
                className="h-10 border-border focus:bg-white text-muted-foreground"
                value={endDateFilter}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm bg-muted">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng số mã</p>
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
