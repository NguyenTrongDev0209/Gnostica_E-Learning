import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Globe, Mail, Phone, MapPin, Image as ImageIcon } from 'lucide-react';

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Thông tin thương hiệu
          </CardTitle>
          <CardDescription>Cấu hình tên website và các thông tin cơ bản xuất hiện trên nền tảng.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-xs font-bold uppercase text-muted-foreground">Tên Website</Label>
              <Input id="siteName" placeholder="Gnostica E-Learning" defaultValue="Gnostica E-Learning" className="border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline" className="text-xs font-bold uppercase text-muted-foreground">Slogan</Label>
              <Input id="tagline" placeholder="Tri thức không giới hạn" defaultValue="Tri thức không giới hạn" className="border-border" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Logo Website</Label>
            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-border rounded-xl bg-muted hover:bg-muted transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
                <ImageIcon className="w-6 h-6 text-slate-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Tải lên logo mới</span>
                <span className="text-xs text-muted-foreground">PNG, JPG hoặc SVG (Max 2MB)</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerText" className="text-xs font-bold uppercase text-muted-foreground">Văn bản chân trang (Footer)</Label>
            <Textarea id="footerText" placeholder="Nhập nội dung hiển thị ở cuối trang..." className="min-h-[100px] border-border focus:bg-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Thông tin liên hệ
          </CardTitle>
          <CardDescription>Các thông tin này sẽ hiển thị công khai để khách hàng liên hệ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Email liên hệ</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" defaultValue="contact@gnostica.com" className="pl-9 border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" defaultValue="0987 654 321" className="pl-9 border-border" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-xs font-bold uppercase text-muted-foreground">Địa chỉ văn phòng</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea id="address" defaultValue="Số 1 Trịnh Văn Bô, Nam Từ Liêm, Hà Nội" className="pl-9 min-h-[80px] border-border" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
