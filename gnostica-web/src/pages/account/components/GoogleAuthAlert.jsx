import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function GoogleAuthAlert() {
  return (
    <Card className="border-none shadow-sm bg-blue-50/50">
      <CardContent className="p-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center mx-auto text-info">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-bold text-foreground">Tính năng này không khả dụng</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Vì bạn đăng nhập bằng tài khoản **Google**, việc quản lý mật khẩu sẽ được thực hiện thông qua cài đặt bảo mật của Google.
          </p>
          <div className="pt-6">
            <a 
              href="https://myaccount.google.com/signinoptions/password" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-border text-foreground font-bold text-sm shadow-sm hover:bg-muted transition-colors gap-2"
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" className="w-4 h-4" alt="Google" />
              Quản lý mật khẩu Google
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
