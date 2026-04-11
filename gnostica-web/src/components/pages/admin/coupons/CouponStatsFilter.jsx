import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function CouponStatsFilter({ searchTerm, onSearchChange, totalCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="md:col-span-3 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm mã giảm giá..."
              className="pl-9 h-10 border-slate-200 focus:bg-white"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-200 shadow-sm bg-slate-50/50">
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số mã</p>
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
