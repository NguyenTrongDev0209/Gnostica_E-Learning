import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Key, ShieldCheck, Landmark } from 'lucide-react';

export function PaymentConfigSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              Cổng thanh toán PayOS
            </CardTitle>
            <CardDescription>Cấu hình các API keys để tích hợp thanh toán tự động.</CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-600 border-green-200">Đang hoạt động</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId" className="text-xs font-bold uppercase text-slate-500">Client ID</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="clientId" type="password" placeholder="Nhập Client ID..." defaultValue="**********************" className="pl-9 border-slate-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-xs font-bold uppercase text-slate-500">API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="apiKey" type="password" placeholder="Nhập API Key..." defaultValue="**********************" className="pl-9 border-slate-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="checksumKey" className="text-xs font-bold uppercase text-slate-500">Checksum Key</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input id="checksumKey" type="password" placeholder="Nhập Checksum Key..." defaultValue="**********************" className="pl-9 border-slate-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Cấu hình giao dịch
          </CardTitle>
          <CardDescription>Tùy chỉnh các tham số liên quan đến quy trình thanh toán.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-slate-700">Chế độ bảo trì thanh toán</Label>
              <p className="text-xs text-slate-500 italic">Tạm thời ngắt kết nối cổng thanh toán để bảo trì.</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-slate-700">Tự động đồng bộ VietQR</Label>
              <p className="text-xs text-slate-500 italic">Tự động cập nhật danh sách ngân hàng từ VietQR định kỳ.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencyPrefix" className="text-xs font-bold uppercase text-slate-500">Đơn vị tiền tệ hiển thị</Label>
            <Input id="currencyPrefix" defaultValue="đ" className="w-[100px] border-slate-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
