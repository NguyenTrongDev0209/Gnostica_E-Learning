import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { SimpleButton } from "@/components/common/AppButton";

export default function AccountWelcomeBanner({ user, isInstructor, handleBecomeInstructor }) {
  return (
    <>
      <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 via-slate-800 to-primary/90 text-white mb-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-32 h-32" />
        </div>
        <CardContent className="p-6 md:p-8 relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
            Chào mừng trở lại, {user?.fullName || "Học viên"}! 👋
          </h2>
          <p className="text-slate-200 text-sm leading-relaxed max-w-xl">
            Tiếp tục hành trình chinh phục kiến thức mới hôm nay nhé. Mỗi phút học tập đều đưa bạn đến gần hơn với mục tiêu!
          </p>
        </CardContent>
      </Card>

      {!isInstructor && (
        <Card className="border-2 border-dashed border-warning/20 bg-orange-50/50 mb-6 group cursor-pointer hover:bg-orange-50 transition-colors" onClick={handleBecomeInstructor}>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center text-warning shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Chia sẻ kiến thức, tạo nguồn thu nhập</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">Đăng ký trở thành giảng viên trên Gnostica ngay hôm nay.</p>
              </div>
            </div>
            <SimpleButton variant="outline" className="border-warning/20 text-warning hover:bg-warning/10 text-warning hover:text-white shrink-0 font-bold hidden sm:flex">
              Đăng ký ngay
            </SimpleButton>
          </CardContent>
        </Card>
      )}
    </>
  );
}
