import React from 'react';
import {
  AppDialog,
  AppDialogContent,
  AppDialogHeader,
  AppDialogTitle,
  AppDialogDescription,
  AppDialogFooter,
} from "@/components/common/micro/AppDialog";
import AppSelect from "@/components/common/micro/AppSelect";
import AppTextarea from "@/components/common/micro/AppTextarea";
import { AppButton } from "@/components/common/micro/AppButton";

const ReportPostModal = ({
  isOpen,
  onOpenChange,
  reportType,
  setReportType,
  reportDetail,
  setReportDetail,
  onSendReport,
  isSubmittingReport
}) => {
  return (
    <AppDialog open={isOpen} onOpenChange={onOpenChange}>
      <AppDialogContent className="sm:max-w-md">
        <AppDialogHeader>
          <AppDialogTitle>Báo cáo bài viết</AppDialogTitle>
          <AppDialogDescription>
            Vui lòng chọn loại vi phạm và cung cấp thông tin chi tiết để quản trị viên có thể xem xét.
          </AppDialogDescription>
        </AppDialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Loại vi phạm <span className="text-error">*</span></label>
            <AppSelect 
              value={reportType} 
              onValueChange={setReportType}
              placeholder="Chọn loại vi phạm"
              options={[
                { value: "spam", label: "Spam / Quảng cáo" },
                { value: "harassment", label: "Quấy rối / Chửi bới / Lăng mạ" },
                { value: "inappropriate", label: "Nội dung không phù hợp / Phản cảm" },
                { value: "copyright", label: "Vi phạm bản quyền" },
                { value: "other", label: "Khác" }
              ]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Chi tiết vi phạm</label>
            <AppTextarea
              placeholder="Nhập thông tin chi tiết về vi phạm (nếu cần)..."
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        <AppDialogFooter className="sm:justify-end gap-2 text-right">
          <AppButton appVariant="ghostMuted" variant="ghost" type="button" className="border border-border" onClick={() => onOpenChange(false)} disabled={isSubmittingReport}>
            Hủy
          </AppButton>
          <AppButton appVariant="destructive"
            type="button"
            onClick={onSendReport}
            disabled={isSubmittingReport}
          >
            {isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}
          </AppButton>
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  );
};

export default ReportPostModal;
