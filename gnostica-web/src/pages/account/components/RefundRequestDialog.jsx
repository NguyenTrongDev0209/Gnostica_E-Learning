import React, { useState, useEffect } from 'react';
import { AppDialog } from "@/components/common/micro/AppDialog";
import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppTextarea from "@/components/common/micro/AppTextarea";
import { Info, AlertCircle, Loader2 } from "lucide-react";
import refundService from "@/services/payment/refundService";
import { toast } from "sonner";

const refundReasons = [
  { label: "Khóa học không như kỳ vọng", value: "not_expected" },
  { label: "Nội dung khóa học quá khó", value: "too_hard" },
  { label: "Mua nhầm khóa học", value: "accidental_purchase" },
  { label: "Khác", value: "other" },
];

export default function RefundRequestDialog({ isOpen, onClose, course }) {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens with a new course
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setOtherReason("");
    }
  }, [isOpen, course]);

  if (!course) return null;

  const joinedAtDate = course.joinedAt ? new Date(course.joinedAt) : new Date();
  const daysSinceJoin = Math.floor((new Date() - joinedAtDate) / (1000 * 60 * 60 * 24));
  const isEligible = course.progressPercent <= 20 && daysSinceJoin <= 14;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const finalReason = reason === "other" ? otherReason.trim() : refundReasons.find(r => r.value === reason)?.label;
      await refundService.requestRefund({
        courseId: course.id,
        reason: finalReason
      });
      toast.success("Yêu cầu hoàn tiền đã được gửi thành công!");
      onClose();
    } catch (error) {
      toast.error(error.message || error || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Yêu cầu hoàn tiền"
      description={<span className="block mt-2.5">Khóa học: {course.title}</span>}
      appVariant="default"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <AppButton appVariant="ghostMuted" onClick={onClose} disabled={isSubmitting}>Hủy</AppButton>
          <AppButton 
            appVariant="primary" 
            onClick={handleSubmit}
            disabled={!reason || (reason === "other" && !otherReason.trim()) || isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Gửi yêu cầu
          </AppButton>
        </div>
      }
    >
      <div className="space-y-4 px-1">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Lý do hoàn tiền <span className="text-error">*</span></label>
          <AppSelect
            options={refundReasons}
            value={reason}
            onValueChange={setReason}
            placeholder="-- Chọn lý do --"
          />
        </div>

        {reason === "other" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="text-sm font-semibold">Lý do cụ thể <span className="text-error">*</span></label>
            <AppTextarea 
              placeholder="Vui lòng mô tả chi tiết lý do bạn muốn hoàn tiền..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-xl space-y-3 border border-border">
          <div>
            <h4 className="text-sm font-bold flex items-center gap-1.5 mb-1 text-foreground">
              <Info className="w-4 h-4 text-primary" /> Điều kiện hoàn tiền
            </h4>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 ml-1">
              <li>Tiến độ học tập dưới 20%.</li>
              <li>Thời gian mua khóa học chưa quá 14 ngày.</li>
            </ul>
          </div>
          
          <div className="border-t border-border pt-3">
            <h4 className="text-sm font-bold flex items-center gap-1.5 mb-2 text-foreground">
              Thông tin hiện tại
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-background rounded p-2.5 border border-border/50 shadow-sm flex flex-col gap-1">
                <span className="text-muted-foreground">Tiến độ</span>
                <span className={`text-base font-bold ${course.progressPercent <= 20 ? 'text-success' : 'text-error'}`}>
                  {course.progressPercent}%
                </span>
              </div>
              <div className="bg-background rounded p-2.5 border border-border/50 shadow-sm flex flex-col gap-1">
                <span className="text-muted-foreground">Đã tham gia</span>
                <span className={`text-base font-bold ${daysSinceJoin <= 14 ? 'text-success' : 'text-error'}`}>
                  {daysSinceJoin} ngày
                </span>
              </div>
            </div>
          </div>
        </div>

        {!isEligible && (
          <div className="bg-error/10 text-error p-3 rounded-lg flex gap-2.5 items-start text-xs border border-error/20">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              <strong>Lưu ý:</strong> Khóa học này không đáp ứng đủ điều kiện hoàn tiền tự động. 
              Yêu cầu của bạn sẽ được gửi để hệ thống xét duyệt thủ công và có thể sẽ bị từ chối.
            </p>
          </div>
        )}
      </div>
    </AppDialog>
  );
}
