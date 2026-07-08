import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Smartphone, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Đổi mật khẩu quản trị
          </CardTitle>
          <CardDescription>Đảm bảo sử dụng mật khẩu mạnh để bảo vệ quyền truy cập hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPass" className="text-xs font-bold uppercase text-muted-foreground">Mật khẩu hiện tại</Label>
            <Input id="currentPass" type="password" placeholder="••••••••" className="border-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPass" className="text-xs font-bold uppercase text-muted-foreground">Mật khẩu mới</Label>
              <Input id="newPass" type="password" placeholder="••••••••" className="border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPass" className="text-xs font-bold uppercase text-muted-foreground">Xác nhận mật khẩu mới</Label>
              <Input id="confirmPass" type="password" placeholder="••••••••" className="border-border" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" className="text-xs font-bold border-border">Cập nhật mật khẩu</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Bảo mật nâng cao
          </CardTitle>
          <CardDescription>Các lớp bảo vệ bổ sung cho tài khoản Admin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-foreground">Xác thực 2 yếu tố (2FA)</Label>
                <p className="text-xs text-muted-foreground italic">Yêu cầu mã từ ứng dụng xác thực khi đăng nhập.</p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-sm font-bold text-foreground">Thông báo đăng nhập lạ</Label>
                <p className="text-xs text-muted-foreground italic">Gửi email khi có thiết bị mới truy cập vào tài khoản Admin.</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
