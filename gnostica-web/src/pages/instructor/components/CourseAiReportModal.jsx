import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppButton } from "@/components/common/micro/AppButton";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export default function CourseAiReportModal({
  showAiReportModal,
  setShowAiReportModal,
  overallAiReport,
  isPreScanning,
  handlePreScanWholeCourse
}) {
  return (
    <Dialog open={showAiReportModal} onOpenChange={setShowAiReportModal}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl border border-border p-0 overflow-hidden shadow-2xl bg-white focus-visible:outline-none z-[9999]">
        {(() => {
          let report = null;
          try {
            if (overallAiReport) report = JSON.parse(overallAiReport);
          } catch(err) { console.error("Error parsing ai report:", err); }

          const score = report?.safetyScore ?? 100;
          const hasViolations = report?.violations && report.violations.length > 0;
          const isCritical = score < 70 || report?.violations?.some(v => v.severity === 'CRITICAL' || v.severity === 'HIGH');
          
          let headerBg = "bg-gradient-to-br from-emerald-600 to-emerald-500 text-white";
          let ShieldIcon = ShieldCheck;
          let statusText = "Nội Dung Đạt Chuẩn An Toàn";

          if (isCritical) {
            headerBg = "bg-gradient-to-br from-rose-600 to-rose-500 text-white";
            ShieldIcon = ShieldAlert;
            statusText = "Phát Hiện Vi Phạm Tường Lửa";
          } else if (hasViolations || score < 90) {
            headerBg = "bg-gradient-to-br from-amber-500 to-orange-500 text-white";
            ShieldIcon = AlertTriangle;
            statusText = "Cần Xem Lại Nội Dung Nghi Vấn";
          }

          return (
            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
              <div className={`p-6 flex items-center gap-4 border-b border-white/10 shadow-sm shrink-0 ${headerBg}`}>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md shadow-inner shrink-0">
                  <ShieldIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-lg tracking-tight leading-none flex items-center gap-2">
                    {statusText}
                  </h3>
                  <p className="text-[10px] font-extrabold tracking-widest uppercase mt-2 opacity-90 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> CHỈ SỐ AN TOÀN AI: {score}%
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-thin bg-muted/30">
                {!report ? (
                  <div className="text-center py-12 px-6 flex flex-col items-center">
                    <div className="w-16 h-16 bg-violet-50 border border-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <Sparkles className="w-8 h-8 animate-bounce" />
                    </div>
                    <p className="font-black text-foreground text-[15px] uppercase tracking-wide">Chưa có dữ liệu quét AI</p>
                    <p className="text-muted-foreground text-xs mt-1.5 max-w-[320px] font-medium leading-relaxed">
                      Hệ thống Tường lửa AI sẽ tự động thẩm định Tiêu đề & Mô tả khóa học ngay khi bạn bấm nút <span className="font-bold text-info">"Lưu khóa học"</span> lần đầu tiên.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-2xl border border-border/60 shadow-sm">
                      <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase mb-2.5 pl-1">📝 Nhận xét tổng hợp từ Trợ lý AI</p>
                      <p className="text-xs text-foreground font-bold italic bg-muted p-3.5 rounded-xl border border-border leading-relaxed shadow-inner">
                        "{report.assessment}"
                      </p>
                    </div>

                    {report.violations && report.violations.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase pl-1 flex items-center gap-1.5">
                          ⚠️ Danh sách điểm cần sửa đổi ({report.violations.length})
                        </p>
                        <div className="space-y-3">
                          {report.violations.map((v, i) => (
                            <div key={i} className="p-4 bg-white rounded-2xl border border-border shadow-sm space-y-2.5 hover:shadow-md transition-all duration-300 group">
                              <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-black uppercase flex items-center gap-1 ${isCritical ? 'text-rose-700' : 'text-amber-700'}`}>
                                  {v.type === 'EXTERNAL_MARKETING' ? '📢 Quảng cáo / Kéo khách ngoài' : '🗣️ Từ ngữ vi phạm'}
                                </span>
                                <Badge className={`h-4.5 px-2 py-0 text-[9px] font-black border-none uppercase tracking-wider ${v.severity === 'CRITICAL' || v.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {v.severity}
                                </Badge>
                              </div>
                              <p className="text-xs font-bold text-foreground italic bg-muted p-2.5 rounded-xl border border-border leading-relaxed group-hover:bg-secondary transition-colors">
                                "{v.content}"
                              </p>
                              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5 flex items-start gap-1 pl-0.5">
                                <span className="font-extrabold text-foreground shrink-0">📌 Giải thích:</span> 
                                <span className="font-medium">{v.explanation}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white rounded-2xl border border-emerald-100 flex flex-col items-center shadow-sm">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3 border border-emerald-100 shadow-inner">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-pulse" />
                        </div>
                        <p className="font-black text-emerald-800 uppercase tracking-wide text-[13px]">Văn bản sạch tuyệt đối!</p>
                        <p className="text-muted-foreground text-xs mt-1.5 font-medium max-w-[340px] leading-relaxed">
                          Trợ lý AI không phát hiện bất kỳ lỗi ngôn từ, kéo khách ngoài hay vi phạm chính sách nào. Bạn đã sẵn sàng gửi duyệt!
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-4 bg-white border-t border-border flex items-center justify-between gap-3 shrink-0">
                <AppButton appVariant="ghostMuted" variant="ghost"
                  type="button"
                  disabled={isPreScanning}
                  onClick={handlePreScanWholeCourse}
                  className="h-10 px-4 border border-violet-200 text-violet-700 bg-white hover:bg-violet-50 hover:text-violet-800 font-bold rounded-xl shadow-sm text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  {isPreScanning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang quét toàn khóa...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                      <span>Quét thử toàn bộ khóa học</span>
                    </>
                  )}
                </AppButton>
                <AppButton appVariant="gradient" 
                  onClick={() => setShowAiReportModal(false)}
                  className="h-10 px-5 bg-muted hover:bg-secondary text-foreground font-bold rounded-xl shadow-md text-xs select-none active:scale-95 transition-transform border-none"
                >
                  Đóng báo cáo
                </AppButton>
              </div>
            </div>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
}
