import React, { useState, useEffect } from "react";
import { Search, AlertTriangle, Eye, CheckCircle2, XCircle, Clock, Calendar, MessageSquare, HelpCircle, FileText, MessageSquareWarning } from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import AppBadge from "@/components/common/micro/AppBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axiosClient from "@/lib/axiosClient";

import { useNavigate } from "react-router-dom";

export default function AdminCourseReports({ hideHeader = false }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolveReason, setResolveReason] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/admin/courses/reports', {
        params: { status: 'all', page: 0, size: 500 }
      });
      setReports(response.data?.content || []);
    } catch (err) {
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const matchStatus = activeTab === "all" ? true : r.status === activeTab;
    const matchSearch = r.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    all: reports.length,
    pending: reports.filter(r => r.status === "pending").length,
    resolved: reports.filter(r => r.status === "resolved").length,
    dismissed: reports.filter(r => r.status === "dismissed").length,
  };

  const handleOpenDetails = (report) => {
    setSelectedReport(report);
    setResolveReason("");
    setIsModalOpen(true);
  };

  const handleOpenCoursePreview = (report) => {
    navigate(`/admin/course-moderation/${report.courseSlug}`, { state: { report: report } });
  };

  const handleResolve = async (id, action) => {
    try {
      await axiosClient.put(`/admin/courses/reports/${id}/resolve`, {
        action: action,
        reason: resolveReason.trim()
      });
      toast.success(action === 'HIDE_COURSE' ? 'Đã ẩn khóa học do vi phạm' : 'Đã bỏ qua báo cáo');
      setIsModalOpen(false);
      fetchReports();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data || "Lỗi khi xử lý báo cáo");
    }
  };

  const getStatusBadge = (status) => {
    if (status === "pending") {
      return <AppBadge variant="warning" soft icon={Clock}>Đang chờ</AppBadge>;
    }
    if (status === "dismissed") {
      return <AppBadge variant="secondary" soft icon={CheckCircle2}>Đã bỏ qua</AppBadge>;
    }
    return <AppBadge variant="error" soft icon={XCircle}>Đã ẩn khóa học</AppBadge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-border/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-error" />
              Kiểm Duyệt Báo Cáo
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Xem xét và xử lý các báo cáo vi phạm khóa học từ học viên.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-white to-primary/10 border border-border rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-muted-foreground tracking-wide uppercase mb-1">
            Tổng số báo cáo
          </h4>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black text-primary">{stats.all}</span>
          </div>
        </div>
        <div className="p-5 bg-gradient-to-br from-white to-warning/10 border border-border rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-muted-foreground tracking-wide uppercase mb-1">
            Báo cáo chờ xử lý
          </h4>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black text-warning">{stats.pending}</span>
            <AppBadge variant="warning" soft>Cần xem xét</AppBadge>
          </div>
        </div>
        <div className="p-5 bg-gradient-to-br from-white to-success/10 border border-border rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-muted-foreground tracking-wide uppercase mb-1">
            Báo cáo đã giải quyết
          </h4>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black text-success">{stats.resolved}</span>
            <AppBadge variant="success" soft>Hoàn thành</AppBadge>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-border/60 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex w-full lg:w-auto items-center gap-3">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <AppInput
              placeholder="Tìm theo tên khóa học hoặc người báo cáo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-muted border-border h-10 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl w-full lg:w-auto border border-border/30">
          <AppButton
            appVariant="ghostMuted"
            variant="ghost"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 text-center h-auto ${
              activeTab === "all"
                ? "bg-white text-foreground shadow-sm border border-border/50 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            Tất cả
          </AppButton>
          <AppButton
            appVariant="ghostMuted"
            variant="ghost"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 text-center h-auto ${
              activeTab === "pending"
                ? "bg-white text-foreground shadow-sm border border-border/50 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            Đang chờ
          </AppButton>
          <AppButton
            appVariant="ghostMuted"
            variant="ghost"
            onClick={() => setActiveTab("resolved")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 text-center h-auto ${
              activeTab === "resolved"
                ? "bg-white text-foreground shadow-sm border border-border/50 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            Đã xử lý
          </AppButton>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={[
          {
            header: "Khóa học bị báo cáo",
            className: "pl-6 min-w-[300px]",
            render: (item) => (
              <div className="flex gap-4 items-start pl-6 py-2">
                <div 
                  className="w-24 h-16 rounded-lg overflow-hidden border border-border shadow-sm shrink-0 relative bg-secondary flex items-center justify-center cursor-pointer group"
                  onClick={() => handleOpenCoursePreview(item)}
                >
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.courseTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-[8px] font-extrabold text-muted-foreground">Image</span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="w-5 h-5 text-white drop-shadow" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span 
                    className="font-bold text-[15px] text-foreground line-clamp-2 leading-snug cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleOpenCoursePreview(item)}
                  >
                    {item.courseTitle}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    GV: <strong className="font-semibold">{item.instructorName}</strong>
                  </span>
                </div>
              </div>
            ),
          },
          {
            header: "Người báo cáo",
            align: "center",
            render: (item) => <span className="font-semibold">{item.reporterName}</span>,
          },
          {
            header: "Chi tiết lý do",
            align: "left",
            render: (item) => (
              <span className="text-muted-foreground text-sm line-clamp-2 max-w-[250px]">
                {item.reportDetails}
              </span>
            ),
          },
          {
            header: "Ngày gửi",
            align: "center",
            render: (item) => (
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(item.createdAt)}
              </div>
            ),
          },
          {
            header: "Trạng thái",
            align: "center",
            render: (item) => getStatusBadge(item.status),
          },
          {
            header: "Thao tác",
            className: "text-right pr-6",
            render: (item) => (
              <div className="flex justify-end items-center pr-6">
                <AppButton 
                  appVariant="ghostMuted" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleOpenDetails(item)}
                  className="font-semibold shadow-sm border-border text-muted-foreground hover:text-primary rounded-lg w-9 h-9"
                  title="Xem lý do báo cáo"
                >
                  <MessageSquareWarning className="w-4 h-4" />
                </AppButton>
              </div>
            ),
          },
        ]}
        data={filteredReports}
        loadingState="Đang tải danh sách báo cáo..."
        emptyState="Không có báo cáo nào."
        pagination={{
          currentPage: 0,
          totalPages: 1,
          totalElements: filteredReports.length,
          onPageChange: () => {},
          zeroIndexed: true,
        }}
      />

      {/* Report Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:!max-w-[700px] w-full p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="p-6 pb-4 bg-muted border-b border-border">
            <DialogTitle className="text-xl font-extrabold text-foreground tracking-tight">Chi tiết Báo Cáo Khóa Học</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">Chi tiết thông tin báo cáo.</DialogDescription>
          </DialogHeader>
          <div className="p-6">
            {selectedReport && (
              <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                  <img src={selectedReport.thumbnail} alt="" className="w-24 h-16 rounded-md object-cover border border-border" />
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{selectedReport.courseTitle}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Giảng viên: {selectedReport.instructorName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Người báo cáo</p>
                    <p className="font-bold">{selectedReport.reporterName}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Ngày gửi</p>
                    <p className="font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-error/20 bg-error/5 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-error uppercase mb-1">Chi tiết lý do báo cáo</p>
                    <div className="p-3 bg-white rounded-lg border border-error/10 text-sm leading-relaxed text-foreground">
                      {selectedReport.reportDetails || <i className="text-muted-foreground">Không có thông tin chi tiết</i>}
                    </div>
                  </div>
                </div>

                {selectedReport.status === "pending" ? (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex gap-3">
                      <AppButton
                        appVariant="primary"
                        className="flex-1 gap-2 bg-error hover:bg-error/90 font-bold"
                        onClick={() => handleResolve(selectedReport.id, "HIDE_COURSE")}
                      >
                        <XCircle className="w-4 h-4" /> Xác nhận & Ẩn khóa học
                      </AppButton>
                      <AppButton
                        appVariant="ghostMuted"
                        variant="outline"
                        className="flex-1 gap-2 font-bold"
                        onClick={() => handleResolve(selectedReport.id, "DISMISS")}
                      >
                        <HelpCircle className="w-4 h-4" /> Bỏ qua (Sai sự thật)
                      </AppButton>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-success/20 bg-success/10 text-center">
                    <p className="text-success font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Báo cáo này đã được xử lý
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
