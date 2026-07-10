import React from 'react';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import { GhostButton, SimpleButton } from '@/components/common/AppButton';

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
        <GhostButton
          className="font-bold flex items-center gap-2 border border-primary text-primary hover:bg-primary/5"
          onClick={onSyncClick}
          disabled={isSyncing}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Đồng bộ VietQR
        </GhostButton>
        <SimpleButton
          className="flex items-center gap-2"
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4" />
          Thêm Ngân hàng
        </SimpleButton>
      </div>
    </div>
  );
}
