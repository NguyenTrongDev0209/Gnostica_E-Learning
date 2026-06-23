import React from "react";
import {
  CheckCircle2,
  Briefcase,
  FileCheck,
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Award,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InstructorProfileModal({ isOpen, onClose, instructor }) {
  if (!instructor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-[650px] w-full p-0 overflow-hidden border-none shadow-2xl bg-muted animate-in zoom-in-95 duration-200">
        {/* Premium Banner Top */}
        <div className="h-32 w-full bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"></div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-white/20 backdrop-blur-md text-white border-none gap-1.5 font-bold py-1 px-3">
              <FileCheck className="w-3.5 h-3.5" /> Tài khoản đã xác thực
            </Badge>
          </div>
        </div>

        <div className="px-6 -mt-14 relative z-10">
          {/* Profile Intro Box */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 mb-6 text-center sm:text-left">
            <div className="relative">
              <div className="w-28 h-28 rounded-full p-1.5 bg-white shadow-lg overflow-hidden group">
                <img
                  src={instructor.avatar}
                  alt="Avt"
                  className="w-full h-full rounded-full object-cover bg-secondary transition-transform group-hover:scale-110 duration-500"
                />
              </div>
            </div>
            <div className="flex-1 pt-4 sm:pt-16">
              <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight flex items-center gap-2 justify-center sm:justify-start">
                {instructor.name}
                <CheckCircle2 className="w-5 h-5 fill-blue-500 text-white shrink-0" />
              </h2>
              <p className="text-indigo-600 font-bold text-sm flex items-center gap-1 mt-0.5 justify-center sm:justify-start">
                <Briefcase className="w-4 h-4" /> {instructor.job}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-0 sm:pt-16">
              <div className="text-center bg-white px-3 py-2 rounded-xl border border-border/60 shadow-sm">
                <p className="text-sm font-black text-foreground">
                  {instructor.courses}
                </p>
                <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wide">
                  Khóa học
                </p>
              </div>
              <div className="text-center bg-white px-3 py-2 rounded-xl border border-border/60 shadow-sm">
                <p className="text-sm font-black text-foreground">
                  {instructor.students}
                </p>
                <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wide">
                  Học viên
                </p>
              </div>
            </div>
          </div>

          {/* Details Content Divided in Sections */}
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar pb-6">
            {/* SECTION 1: Thông tin cơ bản */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-3 px-4 bg-muted border-b border-border flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" />
                <h3 className="font-extrabold text-foreground text-[13px] uppercase tracking-wide">
                  Thông tin cá nhân & Liên hệ
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  <p className="font-semibold text-foreground break-all">
                    {instructor.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Điện thoại
                  </label>
                  <p className="font-semibold text-foreground">
                    {instructor.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" /> CCCD / Mã định danh
                  </label>
                  <p className="font-semibold text-foreground">
                    {instructor.cccd}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Địa chỉ
                  </label>
                  <p className="font-semibold text-foreground">
                    {instructor.address}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: Hồ sơ năng lực */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-3 px-4 bg-muted border-b border-border flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-foreground text-[13px] uppercase tracking-wide">
                  Bằng cấp & Năng lực
                </h3>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Tiểu sử giới thiệu
                  </label>
                  <p className="font-medium text-muted-foreground mt-1 leading-relaxed italic border-l-2 border-border pl-3">
                    "{instructor.bio}"
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-info rounded-full text-xs font-bold border border-info/20">
                    Certificate: IELTS 7.5
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                    Microsoft Azure Expert
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full font-bold border-border text-indigo-600 gap-2 hover:bg-indigo-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Xem toàn bộ File hồ sơ đính kèm
                </Button>
              </div>
            </div>

            {/* SECTION 3: Thông tin thanh toán */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="p-3 px-4 bg-muted border-b border-border flex items-center gap-2 text-white">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-[13px] uppercase tracking-wide">
                  Thông tin tài khoản ngân hàng
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Ngân hàng
                  </label>
                  <p className="font-extrabold text-foreground text-base">
                    {instructor.bankName}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Số tài khoản
                  </label>
                  <p className="font-black text-indigo-700 tracking-wider text-base">
                    {instructor.bankNumber}
                  </p>
                </div>
                <div className="col-span-2 bg-secondary rounded p-2 border border-border/50">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase block">
                    Tên người thụ hưởng
                  </label>
                  <p className="font-bold text-foreground text-[13px]">
                    {instructor.bankHolder}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-bold">
              Đăng ký: {instructor.joinedDate}
            </span>
          </div>
          <Button
            onClick={() => onClose(false)}
            className="font-bold bg-muted hover:bg-muted text-white px-6"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
