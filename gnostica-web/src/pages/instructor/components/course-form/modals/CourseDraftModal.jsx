import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function CourseDraftModal({ showDraftModal, setShowDraftModal, slug, restoreDraft }) {
  if (!showDraftModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md shadow-2xl border-none overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-info rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Phát hiện bản nháp!</h3>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            Bạn có một bản lưu nháp chưa hoàn thành từ phiên làm việc trước. Bạn có muốn khôi phục lại dữ liệu này không?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11 font-bold border-border"
              onClick={() => {
                setShowDraftModal(false);
                localStorage.removeItem(`course_questions_${slug || 'new'}`);
              }}
            >
              Bỏ qua
            </Button>
            <Button
              className="h-11 font-bold bg-info text-white hover:bg-info/90"
              onClick={restoreDraft}
            >
              Khôi phục ngay
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
