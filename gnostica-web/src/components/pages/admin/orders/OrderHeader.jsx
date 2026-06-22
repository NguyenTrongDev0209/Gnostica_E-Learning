import React from 'react';
import { ShoppingCart } from 'lucide-react';

export function OrderHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          Quản Lý Đơn Hàng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi, xử lý và quản lý toàn bộ đơn hàng của khách hàng trên hệ thống.
        </p>
      </div>
    </div>
  );
}
