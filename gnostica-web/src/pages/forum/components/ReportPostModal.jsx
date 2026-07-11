import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GhostButton } from '@/components/common/micro/AppButton';

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Báo cáo bài viết</DialogTitle>
          <DialogDescription>
            Vui lòng chọn loại vi phạm và cung cấp thông tin chi tiết để quản trị viên có thể xem xét.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Loại vi phạm <span className="text-error">*</span></label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại vi phạm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam / Quảng cáo</SelectItem>
                <SelectItem value="harassment">Quấy rối / Chửi bới / Lăng mạ</SelectItem>
                <SelectItem value="inappropriate">Nội dung không phù hợp / Phản cảm</SelectItem>
                <SelectItem value="copyright">Vi phạm bản quyền</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Chi tiết vi phạm</label>
            <Textarea
              placeholder="Nhập thông tin chi tiết về vi phạm (nếu cần)..."
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2 text-right">
          <GhostButton type="button" className="border border-border" onClick={() => onOpenChange(false)} disabled={isSubmittingReport}>
            Hủy
          </GhostButton>
          <Button
            type="button"
            className="bg-error/10 hover:bg-error/20 text-error font-bold"
            onClick={onSendReport}
            disabled={isSubmittingReport}
          >
            {isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPostModal;
