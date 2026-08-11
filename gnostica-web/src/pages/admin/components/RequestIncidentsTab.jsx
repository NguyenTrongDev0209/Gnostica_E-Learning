import React, { useState, useEffect, useMemo } from "react";
import { supportService } from "@/services/admin/supportService";
import {
  Headphones,
  Clock,
  RefreshCw,
  CheckCheck,
  XCircle,
  Search,
  Filter,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  CheckCircle2,
  User,
  Mail,
  Tag,
  X,
  PieChart,
  LayoutList
} from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import { AppButton } from "@/components/common/micro/AppButton";
import { toast } from "sonner";
import useRequestStats from "@/hooks/admin/useRequestStats";
import { RequestTrendChart, RequestStatusDonut, RequestCategoryBar } from "@/components/common/composite/RequestStatCharts";

const SUPPORT_STATUS = {
  0: { label: "Chờ xử lý", variant: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  1: { label: "Đang xử lý", variant: "bg-info/10 text-info border-info/20", icon: RefreshCw },
  3: { label: "Đã giải quyết", variant: "bg-success/10 text-success border-success/20", icon: CheckCheck },
  4: { label: "Đã đóng", variant: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const SUPPORT_PRIORITY = {
  1: { label: "Thấp", variant: "bg-muted text-muted-foreground border-border" },
  2: { label: "Trung bình", variant: "bg-warning/10 text-warning border-warning/20" },
  3: { label: "Cao", variant: "bg-error/10 text-error border-error/20" },
};

const SUPPORT_TYPE = {
  TECHNICAL_ISSUE: "Lỗi kỹ thuật",
  PAYMENT_ERROR: "Lỗi thanh toán",
  COURSE_ACCESS: "Truy cập khóa học",
  GENERAL: "Chung",
};

export default function RequestIncidentsTab() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [activeTab, setActiveTab] = useState("STATISTICS");

  const { stats: apiStats, loading: statsLoading, months, changeMonths } = useRequestStats('supports');

  // Modal xem chi tiết ticket & modal xem ảnh
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [lightboxImages, setLightboxImages] = useState(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await supportService.getAll();
      setTickets(data || []);
    } catch (err) {
      console.error("Fetch support tickets error:", err);
      toast.error("Không thể tải danh sách yêu cầu hỗ trợ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await supportService.updateStatus(id, status);
      toast.success("Đã cập nhật trạng thái yêu cầu #" + id);
      
      // Nếu đang mở modal ticket này thì cập nhật lại ticket đó
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
      }
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    }
  };

  const handleUpdatePriority = async (id, priority) => {
    try {
      await supportService.updatePriority(id, priority);
      toast.success(`Đã chuyển mức ưu tiên thành "${SUPPORT_PRIORITY[priority]?.label}"`);
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket((prev) => (prev ? { ...prev, priority } : null));
      }
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật mức ưu tiên thất bại");
    }
  };

  const parseImageUrls = (metadata) => {
    if (!metadata) return [];
    try {
      const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      if (Array.isArray(parsed.imageUrls) && parsed.imageUrls.length > 0) {
        return parsed.imageUrls;
      }
      if (parsed.imageUrl) return [parsed.imageUrl];
      return [];
    } catch {
      return [];
    }
  };

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 0).length;
    const inProgress = tickets.filter((t) => t.status === 1).length;
    const resolved = tickets.filter((t) => t.status === 3).length;
    const closed = tickets.filter((t) => t.status === 4).length;
    return { total, open, inProgress, resolved, closed };
  }, [tickets]);

  // Bộ lọc dữ liệu
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Filter theo Trạng thái
      if (statusFilter.length > 0 && !statusFilter.includes(String(t.status))) {
        return false;
      }
      // Filter theo Mức ưu tiên
      if (priorityFilter.length > 0 && !priorityFilter.includes(String(t.priority))) {
        return false;
      }
      // Filter theo Phân loại
      if (typeFilter.length > 0 && !typeFilter.includes(String(t.type))) {
        return false;
      }
      // Filter theo Ngày
      const createdAt = t.createdAt ? new Date(t.createdAt) : null;
      if (dateRange.from && createdAt && createdAt < new Date(dateRange.from)) return false;
      if (dateRange.to && createdAt && createdAt > new Date(new Date(dateRange.to).setHours(23, 59, 59))) return false;

      // Filter theo Từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const studentName = t.account?.fullName?.toLowerCase() || "";
        const studentEmail = t.account?.email?.toLowerCase() || "";
        const subject = t.subject?.toLowerCase() || "";
        const content = t.content?.toLowerCase() || "";
        const idStr = String(t.id);

        return (
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          subject.includes(query) ||
          content.includes(query) ||
          idStr.includes(query)
        );
      }
      return true;
    });
  }, [tickets, statusFilter, priorityFilter, typeFilter, searchQuery, dateRange]);

  const renderStatusBadge = (status) => {
    const s = SUPPORT_STATUS[status] || { label: "Chưa rõ", variant: "bg-muted text-muted-foreground border-border", icon: Clock };
    const IconComponent = s.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.variant}`}>
        <IconComponent className="w-3.5 h-3.5" />
        {s.label}
      </span>
    );
  };

  const renderPriorityBadge = (priority) => {
    const p = SUPPORT_PRIORITY[priority] || { label: "Thường", variant: "bg-muted text-muted-foreground border-border" };
    return (
      <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded border ${p.variant}`}>
        {p.label}
      </span>
    );
  };

  // Badge ưu tiên có thể click để thay đổi – hiển thị dropdown native select
  const renderPrioritySelect = (t) => {
    const p = SUPPORT_PRIORITY[t.priority] || { label: "Thường", variant: "bg-muted text-muted-foreground border-border" };
    return (
      <div className="relative inline-block">
        <select
          value={t.priority || ""}
          onChange={(e) => handleUpdatePriority(t.id, Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          title="Nhấn để thay đổi mức độ ưu tiên"
          className={`appearance-none cursor-pointer text-[11px] font-semibold px-2.5 py-1 pr-5 rounded border focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${p.variant}`}
        >
          <option value="1">Thấp</option>
          <option value="2">Trung bình</option>
          <option value="3">Cao</option>
        </select>
        <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 opacity-60" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-foreground">Danh sách sự cố</h2>
        <AppButton
          appVariant="outline"
          variant="outline"
          size="sm"
          onClick={fetchTickets}
          disabled={isLoading}
          className="gap-2 text-xs font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </AppButton>
      </div>

      {/* Filter and Search toolbar */}
      <DataFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm theo tên, email, mã #ID, chủ đề..."
        dropdownChecklists={[
          {
            title: "Trạng thái",
            items: [
              { label: "Chờ xử lý", value: "0" },
              { label: "Đang xử lý", value: "1" },
              { label: "Đã giải quyết", value: "3" },
              { label: "Đã đóng", value: "4" },
            ],
            selectedItems: statusFilter,
            onItemToggle: (val) => setStatusFilter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]),
            onClear: () => setStatusFilter([]),
          },
          {
            title: "Ưu tiên",
            items: [
              { label: "Cao", value: "3" },
              { label: "Trung bình", value: "2" },
              { label: "Thấp", value: "1" },
            ],
            selectedItems: priorityFilter,
            onItemToggle: (val) => setPriorityFilter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]),
            onClear: () => setPriorityFilter([]),
          },
          {
            title: "Phân loại",
            items: [
              { label: "Lỗi kỹ thuật", value: "TECHNICAL_ISSUE" },
              { label: "Lỗi thanh toán", value: "PAYMENT_ERROR" },
              { label: "Truy cập khóa học", value: "COURSE_ACCESS" },
              { label: "Chung", value: "GENERAL" },
            ],
            selectedItems: typeFilter,
            onItemToggle: (val) => setTypeFilter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]),
            onClear: () => setTypeFilter([]),
          },
        ]}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        dateRangePlaceholder="Ngày tạo"
      />

      {/* Main Data Table */}
      <DataTable
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredTickets.length,
          onPageChange: () => {},
          zeroIndexed: false,
          pageSize: filteredTickets.length || 10,
        }}
        columns={[
          {
            header: "#ID",
            width: "60px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => <span className="text-xs font-bold text-muted-foreground">#{t.id}</span>,
          },
          {
            header: "Học viên",
            width: "180px",
            align: "left",
            headerAlign: "left",
            render: (t) => (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {t.account?.fullName?.charAt(0) || "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate" title={t.account?.fullName}>
                    {t.account?.fullName || "Học viên ẩn danh"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" title={t.account?.email}>
                    {t.account?.email || "Chưa có email"}
                  </p>
                </div>
              </div>
            ),
          },
          {
            header: "Chủ đề & Nội dung",
            width: "240px",
            align: "left",
            headerAlign: "left",
            render: (t) => (
              <div className="space-y-0.5">
                <p className="font-bold text-foreground text-sm line-clamp-1" title={t.subject}>
                  {t.subject || "Không có tiêu đề"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1" title={t.content}>
                  {t.content || "Không có nội dung mô tả"}
                </p>
              </div>
            ),
          },
          {
            header: "Phân loại",
            width: "130px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => (
              <span className="text-xs font-medium text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                {SUPPORT_TYPE[t.type] || t.type || "Chung"}
              </span>
            ),
          },
          {
            header: "Ưu tiên",
            width: "110px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => renderPrioritySelect(t),
          },
          {
            header: "Minh chứng",
            width: "100px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => {
              const imgs = parseImageUrls(t.metadata);
              if (!imgs.length) return <span className="text-xs text-muted-foreground italic">Không có</span>;
              return (
                <button
                  onClick={() => setLightboxImages(imgs)}
                  className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline bg-primary/5 px-2 py-1 rounded border border-primary/20"
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
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => renderStatusBadge(t.status),
          },
          {
            header: "Ngày tạo",
            width: "110px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (t) => (
              <span className="text-xs text-muted-foreground">
                {t.createdAt ? new Date(t.createdAt).toLocaleDateString("vi-VN") : "—"}
              </span>
            ),
          },
          {
            header: "Thao tác",
            width: "210px",
            align: "center",
            headerAlign: "center",
            className: "text-center",
            render: (t) => (
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {/* Nút xem chi tiết modal */}
                <button
                  onClick={() => setSelectedTicket(t)}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-border bg-white"
                  title="Xem chi tiết ticket"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {t.status === 0 && (
                  <>
                    <AppButton
                      appVariant="ghostMuted"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-info border border-info/20 bg-white hover:bg-info/10"
                      onClick={() => handleUpdateStatus(t.id, 1)}
                    >
                      <RefreshCw className="w-3 h-3" /> Xử lý
                    </AppButton>
                    <AppButton
                      appVariant="ghostMuted"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1 text-success border border-success/20 bg-white hover:bg-success/10"
                      onClick={() => handleUpdateStatus(t.id, 3)}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Xong
                    </AppButton>
                  </>
                )}
                {t.status === 1 && (
                  <AppButton
                    appVariant="ghostMuted"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-success border border-success/20 bg-white hover:bg-success/10"
                    onClick={() => handleUpdateStatus(t.id, 3)}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Hoàn tất
                  </AppButton>
                )}
                {t.status === 3 && (
                  <AppButton
                    appVariant="ghostMuted"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-muted-foreground border border-border bg-white hover:bg-muted"
                    onClick={() => handleUpdateStatus(t.id, 4)}
                  >
                    <XCircle className="w-3 h-3" /> Đóng
                  </AppButton>
                )}
                {t.status === 4 && (
                  <AppButton
                    appVariant="ghostMuted"
                    variant="ghost"
                    size="sm"
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
        data={filteredTickets}
        isLoading={isLoading}
        loadingState="Đang tải danh sách yêu cầu hỗ trợ..."
        emptyState="Không tìm thấy yêu cầu hỗ trợ nào phù hợp."
      />
      {/* Lightbox Preview Modal */}
      {lightboxImages && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImages(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Ảnh minh chứng lỗi ({lightboxImages.length} ảnh)
              </h3>
              <button
                onClick={() => setLightboxImages(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lightboxImages.map((url, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                  <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1.5 font-semibold"
                  >
                    <ExternalLink className="w-4 h-4" /> Xem ảnh kích thước chuẩn
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-lg">
                  #{selectedTicket.id}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Chi Tiết Yêu Cầu Hỗ Trợ</h3>
                  <p className="text-xs text-muted-foreground">
                    Gửi ngày {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString("vi-VN") : "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" /> Học viên gửi:
                  </span>
                  <p className="text-sm font-bold text-foreground">{selectedTicket.account?.fullName || "Ẩn danh"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {selectedTicket.account?.email || "Chưa có email"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" /> Phân loại & Ưu tiên:
                  </span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-xs font-medium text-foreground bg-white px-2 py-0.5 rounded border border-border">
                      {SUPPORT_TYPE[selectedTicket.type] || selectedTicket.type || "Chung"}
                    </span>
                    {renderPrioritySelect(selectedTicket)}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Nhấn vào badge ưu tiên để thay đổi</p>
                </div>

                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Trạng thái hiện tại:
                  </span>
                  <div>{renderStatusBadge(selectedTicket.status)}</div>
                </div>
              </div>

              {/* Subject & Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Chủ đề yêu cầu</h4>
                  <p className="text-base font-bold text-foreground bg-muted/10 p-3 rounded-lg border border-border">
                    {selectedTicket.subject}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Mô tả nội dung chi tiết</h4>
                  <div className="text-sm text-foreground bg-muted/20 p-4 rounded-xl border border-border whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {selectedTicket.content}
                  </div>
                </div>
              </div>

              {/* Attached Images */}
              {parseImageUrls(selectedTicket.metadata).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-primary" /> Ảnh minh chứng ({parseImageUrls(selectedTicket.metadata).length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {parseImageUrls(selectedTicket.metadata).map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setLightboxImages([url])}
                        className="cursor-pointer group relative aspect-video rounded-xl overflow-hidden border border-border bg-muted"
                      >
                        <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                          Phóng to
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Chuyển trạng thái nhanh:</span>
              <div className="flex items-center gap-2">
                {selectedTicket.status !== 1 && (
                  <AppButton
                    appVariant="ghostMuted" variant="ghost" size="sm"
                    className="text-xs gap-1 text-info border border-info/20 bg-white hover:bg-info/10"
                    onClick={() => handleUpdateStatus(selectedTicket.id, 1)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Đang xử lý
                  </AppButton>
                )}
                {selectedTicket.status !== 3 && (
                  <AppButton
                    appVariant="ghostMuted" variant="ghost" size="sm"
                    className="text-xs gap-1 text-success border border-success/20 bg-white hover:bg-success/10"
                    onClick={() => handleUpdateStatus(selectedTicket.id, 3)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã giải quyết
                  </AppButton>
                )}
                {selectedTicket.status !== 4 && (
                  <AppButton
                    appVariant="ghostMuted" variant="ghost" size="sm"
                    className="text-xs gap-1 text-muted-foreground border border-border bg-white hover:bg-muted"
                    onClick={() => handleUpdateStatus(selectedTicket.id, 4)}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Đóng ticket
                  </AppButton>
                )}
                {selectedTicket.status === 4 && (
                  <AppButton
                    appVariant="ghostMuted" variant="ghost" size="sm"
                    className="text-xs gap-1 text-warning border border-warning/20 bg-white hover:bg-warning/10"
                    onClick={() => handleUpdateStatus(selectedTicket.id, 0)}
                  >
                    <Clock className="w-3.5 h-3.5" /> Mở lại
                  </AppButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
