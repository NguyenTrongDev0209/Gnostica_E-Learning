import React from 'react';
import { History } from 'lucide-react';

export function TransactionHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          Lịch sử Giao dịch
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi và quản lý toàn bộ dòng tiền nạp, rút và thanh toán trên hệ thống.
        </p>
      </div>
    </div>
  );
}
