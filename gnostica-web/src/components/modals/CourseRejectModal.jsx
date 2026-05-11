import React from "react";
import { XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CourseRejectModal({
  isOpen,
  onClose,
  courseName,
  rejectReason,
  setRejectReason,
  onConfirm,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-[500px] w-full p-0 overflow-hidden border-none shadow-2xl bg-white">
        <DialogHeader className="p-6 pb-4 bg-slate-50/50 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-2 text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
            Từ chối kiểm duyệt
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Bạn đang chuẩn bị từ chối khóa học{" "}
            <span className="font-bold text-slate-800">"{courseName}"</span>.
            Vui lòng cung cấp lý do cụ thể.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="grid w-full gap-2">
            <Label
              htmlFor="reason"
              className="font-bold text-slate-700 flex items-center gap-1.5"
            >
              Lý do từ chối <span className="text-rose-500 font-black">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Hình ảnh vi phạm bản quyền, chất lượng âm thanh quá kém..."
              className="min-h-[140px] focus-visible:ring-rose-500/20 focus-visible:border-rose-500 resize-none bg-slate-50 border-slate-200 font-medium"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <p className="text-[11px] text-slate-400 font-semibold italic flex items-center gap-1 mt-1">
              ℹ️ Giảng viên sẽ nhận được phản hồi này trong mục thông báo cá
              nhân.
            </p>
          </div>
        </div>
        <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="font-bold border-slate-200 text-slate-600 h-11 px-5"
          >
            Hủy bỏ
          </Button>
          <Button
            variant="outline"
            onClick={onConfirm}
            disabled={!rejectReason.trim()}
            className="font-bold text-rose-600 bg-white border-rose-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-600 shadow-sm h-11 px-6 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            Xác nhận từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
