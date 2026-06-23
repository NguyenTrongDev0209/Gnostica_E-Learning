import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function BankStatsFilter({ 
  searchTerm, onSearchChange, 
  statusFilter, onStatusChange,
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
                placeholder="Tìm kiếm ngân hàng (tên, mã, bin)..."
                className="pl-9 h-10 border-border focus:bg-white"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-[200px] flex-shrink-0">
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="!h-10 w-full border-border focus:ring-0 bg-white text-muted-foreground">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent position="bottom" className="z-50 bg-white border border-border shadow-md">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="1">Đang hoạt động</SelectItem>
                  <SelectItem value="0">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm bg-muted">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tổng ngân hàng</p>
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
