import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function PasswordSecurityRules({ pwdLength, hasUpperCase, hasNumber, hasSpecial }) {
  return (
    <Card className="border-none shadow-sm bg-muted/80">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-foreground">Tiêu chuẩn mật khẩu an toàn</h3>
        </div>
        
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${pwdLength >= 8 ? 'bg-emerald-100 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className={`text-sm ${pwdLength >= 8 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Tối thiểu 8 ký tự
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasUpperCase ? 'bg-emerald-100 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className={`text-sm ${hasUpperCase ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Ít nhất 1 chữ in hoa (A-Z)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasNumber ? 'bg-emerald-100 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className={`text-sm ${hasNumber ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Ít nhất 1 chữ số (0-9)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasSpecial ? 'bg-emerald-100 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className={`text-sm ${hasSpecial ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Ít nhất 1 ký tự đặc biệt (!@#%&*)
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
