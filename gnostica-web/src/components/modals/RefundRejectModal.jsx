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

export default function RefundRejectModal({
  isOpen,
  onClose,
  targetInfo,
  rejectReason,
  setRejectReason,
  onConfirm,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-[500px] w-full p-0 overflow-hidden border-none shadow-2xl bg-white">
        <DialogHeader className="p-6 pb-4 bg-muted border-b border-border">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-2 text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-foreground tracking-tight">
            Từ chối hoàn tiền
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Bạn đang chuẩn bị từ chối yêu cầu hoàn tiền cho mã đơn:{" "}
            <span className="font-bold text-foreground">{targetInfo}</span>.
            Vui lòng cung cấp lý do cụ thể.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="grid w-full gap-2">
            <Label
              htmlFor="reason"
              className="font-bold text-foreground flex items-center gap-1.5"
            >
              Lý do từ chối <span className="text-rose-500 font-black">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Bạn đã học quá 20% thời lượng khóa học..."
              className="min-h-[140px] focus-visible:ring-rose-500/20 focus-visible:border-rose-500 resize-none bg-muted border-border font-medium"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground font-semibold italic flex items-center gap-1 mt-1">
              ℹ️ Học viên sẽ nhận được phản hồi này trong mục thông báo.
            </p>
          </div>
        </div>
        <DialogFooter className="p-6 bg-muted border-t border-border gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            className="font-bold border-border text-muted-foreground h-11 px-5"
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
