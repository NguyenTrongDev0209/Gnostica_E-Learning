import React from 'react';
import { Ticket, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CouponHeader({ onAddClick }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Ticket className="w-6 h-6 text-primary" />
          Quản lý Mã giảm giá
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tạo và quản lý các chương trình ưu đãi cho học viên.
        </p>
      </div>
      <Button
        className="font-bold flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
        onClick={onAddClick}
      >
        <Plus className="w-4 h-4" />
        Thêm Phiếu giảm
      </Button>
    </div>
  );
}
