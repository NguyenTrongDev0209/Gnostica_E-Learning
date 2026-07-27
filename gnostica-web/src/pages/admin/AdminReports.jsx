import threadReportService from "@/services/forum/threadReportService";
import { supportService } from "@/services/admin/supportService";
import React, { useState, useEffect } from "react";
import {
  BarChart3, ShieldAlert, CheckCircle2, XCircle, Headphones,
  Clock, CheckCheck, AlertTriangle, Image as ImageIcon, ExternalLink, RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import DataTable from "@/components/common/composite/DataTable";
import { AppButton } from "@/components/common/micro/AppButton";
import { toast } from "sonner";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";

const violationTypes = {
  spam: "Spam / Quảng cáo",
  harassment: "Quấy rối / Lăng mạ",
  inappropriate: "Nội dung phản cảm",
  copyright: "Vi phạm bản quyền",
  other: "Khác",
};

const SUPPORT_STATUS = {
  0: { label: "Chờ xử lý", variant: "bg-warning/10 text-warning" },
  1: { label: "Đang xử lý", variant: "bg-info/10 text-info" },
  3: { label: "Đã giải quyết", variant: "bg-success/10 text-success" },
  4: { label: "Đã đóng", variant: "bg-muted text-muted-foreground" },
};

const SUPPORT_PRIORITY = {
  1: { label: "Thấp", variant: "bg-muted text-muted-foreground" },
  2: { label: "Trung bình", variant: "bg-warning/10 text-warning" },
  3: { label: "Cao", variant: "bg-error/10 text-error" },
};

const SUPPORT_TYPE = {
  TECHNICAL_ISSUE: "Lỗi kỹ thuật",
  PAYMENT_ERROR: "Lỗi thanh toán",
  COURSE_ACCESS: "Truy cập khóa học",
  GENERAL: "Chung",
};

function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await supportService.getAll();
      setTickets(data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách yêu cầu hỗ trợ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await supportService.updateStatus(id, status);
      toast.success("Đã cập nhật trạng thái");
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    }
  };

  const parseImageUrls = (metadata) => {
    if (!metadata) return [];
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      return parsed.imageUrls || (parsed.imageUrl ? [parsed.imageUrl] : []);
    } catch {
      return [];
    }
  };

  const getStatusBadge = (status) => {
    const s = SUPPORT_STATUS[status] || { label: "Không rõ", variant: "bg-muted text-muted-foreground" };
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md ${s.variant}`}>
        {status === 0 && <Clock className="w-3 h-3" />}
        {status === 1 && <RefreshCw className="w-3 h-3" />}
        {status === 3 && <CheckCheck className="w-3 h-3" />}
        {s.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const p = SUPPORT_PRIORITY[priority] || { label: "N/A", variant: "bg-muted text-muted-foreground" };
    return (
      <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded ${p.variant}`}>
        {p.label}
      </span>
    );
  };

  // Stats summary
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 0).length;
  const inProgress = tickets.filter(t => t.status === 1).length;
  const resolved = tickets.filter(t => t.status === 3).length;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng yêu cầu", value: total, icon: <Headphones className="w-4 h-4" />, color: "text-primary bg-primary/10" },
          { label: "Chờ xử lý", value: open, icon: <Clock className="w-4 h-4" />, color: "text-warning bg-warning/10" },
          { label: "Đang xử lý", value: inProgress, icon: <RefreshCw className="w-4 h-4" />, color: "text-info bg-info/10" },
          { label: "Đã giải quyết", value: resolved, icon: <CheckCheck className="w-4 h-4" />, color: "text-success bg-success/10" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal xem ảnh */}
      {selectedImages && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setSelectedImages(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Ảnh minh chứng ({selectedImages.length} ảnh)
              </h3>
              <button onClick={() => setSelectedImages(null)} className="p-1.5 hover:bg-secondary rounded-lg">
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedImages.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                  <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                  <a
                    href={url} target="_blank" rel="noreferrer"
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1 font-semibold"
                  >
                    <ExternalLink className="w-4 h-4" /> Xem ảnh gốc
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: tickets.length,
          onPageChange: () => {},
          zeroIndexed: false,
          pageSize: tickets.length || 10,
        }}
        columns={[
          {
            header: "#",
            width: "50px",
            render: (t) => <span className="text-xs font-bold text-muted-foreground">#{t.id}</span>,
          },
          {
            header: "Học viên",
            width: "160px",
            render: (t) => (
              <>
                <p className="font-semibold text-foreground text-sm">{t.account?.fullName || "Ẩn danh"}</p>
                <p className="text-xs text-muted-foreground">{t.account?.email}</p>
              </>
            ),
          },
          {
            header: "Chủ đề",
            width: "200px",
            render: (t) => (
              <>
                <p className="font-semibold text-foreground text-sm line-clamp-1" title={t.subject}>{t.subject}</p>
                <p className="text-xs text-muted-foreground line-clamp-1" title={t.content}>{t.content}</p>
              </>
            ),
          },
          {
            header: "Loại",
            width: "130px",
            render: (t) => (
              <span className="text-xs font-medium text-muted-foreground">
                {SUPPORT_TYPE[t.type] || t.type || "—"}
              </span>
            ),
          },
          {
            header: "Ưu tiên",
            width: "100px",
            render: (t) => getPriorityBadge(t.priority),
          },
          {
            header: "Ảnh",
            width: "80px",
            render: (t) => {
              const imgs = parseImageUrls(t.metadata);
              if (!imgs.length) return <span className="text-xs text-muted-foreground italic">Không có</span>;
              return (
                <button
                  onClick={() => setSelectedImages(imgs)}
                  className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  {imgs.length} ảnh
                </button>
              );
            },
          },
          {
            header: "Trạng thái",
            width: "130px",
            render: (t) => getStatusBadge(t.status),
          },
          {
            header: "Ngày gửi",
            width: "120px",
            render: (t) => (
              <span className="text-xs text-muted-foreground">
                {t.createdAt ? new Date(t.createdAt).toLocaleDateString("vi-VN") : "—"}
              </span>
            ),
          },
          {
            header: "Hành động",
            width: "200px",
            className: "text-right",
            render: (t) => (
              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                {t.status === 0 && (
                  <>
                    <AppButton
                      appVariant="ghostMuted" variant="ghost" size="sm"
                      className="h-7 text-xs gap-1 text-info border border-info/20 bg-white hover:bg-info/10"
                      onClick={() => handleUpdateStatus(t.id, 1)}
                    >
                      <RefreshCw className="w-3 h-3" /> Xử lý
                    </AppButton>
                    <AppButton
                      appVariant="ghostMuted" variant="ghost" size="sm"
                      className="h-7 text-xs gap-1 text-success border border-success/20 bg-white hover:bg-success/10"
                      onClick={() => handleUpdateStatus(t.id, 3)}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Giải quyết
                    </AppButton>
                  </>
                )}
                {t.status === 1 && (
                  <AppButton
                    appVariant="ghostMuted" variant="ghost" size="sm"
                    className="h-7 text-xs gap-1 text-success border border-success/20 bg-white hover:bg-success/10"
                    onClick={() => handleUpdateStatus(t.id, 3)}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                  </AppButton>
                )}
                {t.status === 3 && (
                  <AppButton
                    appVariant="ghostMuted" variant="ghost" size="sm"
                    className="h-7 text-xs gap-1 text-muted-foreground border border-border bg-white hover:bg-muted"
                    onClick={() => handleUpdateStatus(t.id, 4)}
                  >
                    <XCircle className="w-3 h-3" /> Đóng
                  </AppButton>
                )}
                {t.status === 4 && (
                  <AppButton
                    appVariant="ghostMuted" variant="ghost" size="sm"
                    className="h-7 text-xs gap-1 text-muted-foreground border border-border bg-white hover:bg-muted"
                    onClick={() => handleUpdateStatus(t.id, 0)}
                  >
                    <RefreshCw className="w-3 h-3" /> Mở lại
                  </AppButton>
                )}
              </div>
            ),
          },
        ]}
        data={tickets}
        isLoading={isLoading}
        loadingState="Đang tải yêu cầu hỗ trợ..."
        emptyState="Chưa có yêu cầu hỗ trợ nào từ học viên"
      />
    </div>
  );
}

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await threadReportService.getReports(0, 50);
      const allReports = data.content || data || [];
      setReports(allReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await threadReportService.updateReportStatus(id, status);
      toast.success("Đã cập nhật trạng thái báo cáo");
      fetchReports();
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Cập nhật thất bại");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <AppBadge variant="secondary" className="bg-warning/10 text-warning text-warning hover:bg-warning/10 text-warning border-none">Chờ xử lý</AppBadge>;
      case "RESOLVED":
        return <AppBadge variant="secondary" className="bg-success/10 text-success text-success hover:bg-success/10 text-success border-none">Đã duyệt</AppBadge>;
      case "DISMISSED":
        return <AppBadge variant="secondary" className="bg-secondary text-foreground hover:bg-secondary border-none">Bỏ qua</AppBadge>;
      default:
        return <AppBadge>{status}</AppBadge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Thống Kê & Báo Cáo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem báo cáo chi tiết về doanh thu, học viên và hiệu suất nền tảng.
        </p>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="stats" className="gap-2"><BarChart3 className="w-4 h-4" /> Thống kê chung</TabsTrigger>
          <TabsTrigger value="forum-reports" className="gap-2"><ShieldAlert className="w-4 h-4" /> Báo cáo bài viết</TabsTrigger>
          <TabsTrigger value="support-tickets" className="gap-2">
            <Headphones className="w-4 h-4" /> Hỗ trợ khách hàng
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-border border-dashed gap-4">
            <BarChart3 className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">Trang Thống Kê đang được xây dựng</p>
          </div>
        </TabsContent>

        <TabsContent value="forum-reports">
          <DataTable
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: reports.length,
              onPageChange: () => {},
              zeroIndexed: false,
              pageSize: reports.length || 10,
            }}
            columns={[
              {
                header: "Người báo cáo",
                width: "150px",
                render: (report) => (
                  <>
                    <p className="font-medium text-foreground">{report.reporterName}</p>
                    <p className="text-xs text-muted-foreground">{report.reporterEmail}</p>
                  </>
                ),
              },
              {
                header: "Vi phạm",
                width: "150px",
                render: (report) => (
                  <span className="font-medium text-foreground text-sm">{violationTypes[report.type] || report.type}</span>
                ),
              },
              {
                header: "Nội dung vi phạm",
                width: "200px",
                render: (report) => (
                  <>
                    <p className="text-sm text-muted-foreground" title={report.threadContent}>
                      {report.threadContent?.length > 50
                        ? report.threadContent.substring(0, 50) + "..."
                        : report.threadContent}
                    </p>
                    <a href={`/forum/${report.threadId}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                      Xem bài viết
                    </a>
                  </>
                ),
              },
              {
                header: "Chi tiết từ User",
                width: "200px",
                render: (report) => (
                  <p className="text-sm text-muted-foreground" title={report.details}>
                    {report.details
                      ? (report.details.length > 50 ? report.details.substring(0, 50) + "..." : report.details)
                      : <span className="text-muted-foreground italic">Không có</span>}
                  </p>
                ),
              },
              {
                header: "Trạng thái",
                width: "120px",
                render: (report) => getStatusBadge(report.status),
              },
              {
                header: "Hành động",
                width: "180px",
                className: "text-right",
                render: (report) => (
                  <div className="flex items-center justify-end gap-2">
                    {report.status === "RESOLVED" ? (
                      <AppButton appVariant="ghostMuted" variant="ghost" size="sm"
                        className="h-8 gap-1 text-muted-foreground border border-border hover:bg-muted bg-white"
                        onClick={() => handleUpdateStatus(report.id, "PENDING")}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Hủy duyệt
                      </AppButton>
                    ) : report.status === "DISMISSED" ? (
                      <AppButton appVariant="ghostMuted" variant="ghost" size="sm"
                        className="h-8 gap-1 text-muted-foreground border border-border hover:bg-muted bg-white"
                        onClick={() => handleUpdateStatus(report.id, "PENDING")}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Hoàn tác
                      </AppButton>
                    ) : (
                      <>
                        <AppButton appVariant="ghostMuted" variant="ghost" size="sm"
                          className="h-8 gap-1 text-error border border-error/20 bg-white hover:bg-error/10 hover:text-error"
                          onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                        </AppButton>
                        <AppButton appVariant="ghostMuted" variant="ghost" size="sm"
                          className="h-8 gap-1 text-muted-foreground border-none hover:bg-muted hover:text-foreground"
                          onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Bỏ qua
                        </AppButton>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            data={reports}
            isLoading={isLoading}
            loadingState="Đang tải dữ liệu..."
            emptyState="Chưa có báo cáo nào"
          />
        </TabsContent>

        <TabsContent value="support-tickets">
          <AdminSupportTickets />
        </TabsContent>
      </Tabs>
    </div>
  );
}
