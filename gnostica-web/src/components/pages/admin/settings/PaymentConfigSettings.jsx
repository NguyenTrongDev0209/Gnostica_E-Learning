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
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              Cổng thanh toán PayOS
            </CardTitle>
            <CardDescription>Cấu hình các API keys để tích hợp thanh toán tự động.</CardDescription>
          </div>
          <Badge className="bg-success/10 text-success text-success border-success/20">Đang hoạt động</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId" className="text-xs font-bold uppercase text-muted-foreground">Client ID</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="clientId" type="password" placeholder="Nhập Client ID..." defaultValue="**********************" className="pl-9 border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-xs font-bold uppercase text-muted-foreground">API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="apiKey" type="password" placeholder="Nhập API Key..." defaultValue="**********************" className="pl-9 border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="checksumKey" className="text-xs font-bold uppercase text-muted-foreground">Checksum Key</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="checksumKey" type="password" placeholder="Nhập Checksum Key..." defaultValue="**********************" className="pl-9 border-border" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Cấu hình giao dịch
          </CardTitle>
          <CardDescription>Tùy chỉnh các tham số liên quan đến quy trình thanh toán.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-foreground">Chế độ bảo trì thanh toán</Label>
              <p className="text-xs text-muted-foreground italic">Tạm thời ngắt kết nối cổng thanh toán để bảo trì.</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold text-foreground">Tự động đồng bộ VietQR</Label>
              <p className="text-xs text-muted-foreground italic">Tự động cập nhật danh sách ngân hàng từ VietQR định kỳ.</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencyPrefix" className="text-xs font-bold uppercase text-muted-foreground">Đơn vị tiền tệ hiển thị</Label>
            <Input id="currencyPrefix" defaultValue="đ" className="w-[100px] border-border" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
