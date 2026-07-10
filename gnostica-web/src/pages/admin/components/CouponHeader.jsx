import React from 'react';
import { Ticket, Plus } from 'lucide-react';
import { SimpleButton } from '@/components/common/AppButton';

export function CouponHeader({ onAddClick }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Ticket className="w-6 h-6 text-primary" />
          Quản lý Mã giảm giá
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tạo và quản lý các chương trình ưu đãi cho học viên.
        </p>
      </div>
      <SimpleButton
        className="flex items-center gap-2"
        onClick={onAddClick}
      >
        <Plus className="w-4 h-4" />
        Thêm Phiếu giảm
      </SimpleButton>
    </div>
  );
}
