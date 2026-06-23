import React from 'react';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BankHeader({ onAddClick, onSyncClick, isSyncing }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Quản lý Ngân hàng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý danh sách ngân hàng hỗ trợ thanh toán và đồng bộ từ VietQR.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="font-bold flex items-center gap-2 border-primary text-primary hover:bg-primary/5"
          onClick={onSyncClick}
          disabled={isSyncing}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Đồng bộ VietQR
        </Button>
        <Button
          className="font-bold flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4" />
          Thêm Ngân hàng
        </Button>
      </div>
    </div>
  );
}
