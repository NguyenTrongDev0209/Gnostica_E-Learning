import React, { useState, useEffect, useMemo } from "react";
import threadReportService from "@/services/forum/threadReportService";
import {
  Flag,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  X,
  Clock,
  CheckCheck,
  PieChart,
  LayoutList
} from "lucide-react";
import DataTable from "@/components/common/composite/DataTable";
import DataFilter from "@/components/common/composite/DataFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import { AppButton } from "@/components/common/micro/AppButton";
import { toast } from "sonner";
import AppBadge from "@/components/common/micro/AppBadge";
import useRequestStats from "@/hooks/admin/useRequestStats";
import { RequestTrendChart, RequestStatusDonut, RequestCategoryBar } from "@/components/common/composite/RequestStatCharts";
import { RefreshCw } from "lucide-react";

const violationTypes = {
  spam: "Spam / Quảng cáo",
  harassment: "Quấy rối / Lăng mạ",
  inappropriate: "Nội dung phản cảm",
  copyright: "Vi phạm bản quyền",
  other: "Khác",
};

export default function RequestReportsTab() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [activeTab, setActiveTab] = useState("STATISTICS");

  const { stats: apiStats, loading: statsLoading, changeMonths } = useRequestStats('reports');

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
        return <AppBadge variant="warning" className="px-2.5 py-1 text-warning bg-warning/10">Chờ xử lý</AppBadge>;
      case "RESOLVED":
        return <AppBadge variant="success" className="px-2.5 py-1">Đã duyệt</AppBadge>;
      case "DISMISSED":
        return <AppBadge variant="outline" className="px-2.5 py-1 text-muted-foreground border-border">Bỏ qua</AppBadge>;
      default:
        return <AppBadge className="px-2.5 py-1">{status}</AppBadge>;
    }
  };

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((t) => t.status === "PENDING").length;
    const resolved = reports.filter((t) => t.status === "RESOLVED").length;
    const dismissed = reports.filter((t) => t.status === "DISMISSED").length;
    return { total, pending, resolved, dismissed };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((t) => {
      if (statusFilter.length > 0 && !statusFilter.includes(t.status)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const reporterName = t.reporterName?.toLowerCase() || "";
        const reporterEmail = t.reporterEmail?.toLowerCase() || "";
        const details = t.details?.toLowerCase() || "";
        const content = t.threadContent?.toLowerCase() || "";
        const type = violationTypes[t.type]?.toLowerCase() || t.type?.toLowerCase() || "";

        return (
          reporterName.includes(query) ||
          reporterEmail.includes(query) ||
          details.includes(query) ||
          content.includes(query) ||
          type.includes(query)
        );
      }
      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="STATISTICS"><div className="flex items-center gap-2"><PieChart className="w-4 h-4" /> Thống kê</div></TabsTrigger>
          <TabsTrigger value="LIST"><div className="flex items-center gap-2"><LayoutList className="w-4 h-4" /> Danh sách</div></TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="STATISTICS" className="mt-0 space-y-6">
        {statsLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground"><RefreshCw className="animate-spin w-5 h-5 mr-2" /> Đang tải dữ liệu thống kê...</div>
        ) : (
          <>
            <RequestTrendChart 
                data={apiStats?.trends} 
                title="Xu hướng Báo cáo vi phạm" 
                hasAmount={false}
                onMonthsChange={changeMonths}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RequestStatusDonut 
                    data={apiStats?.statusDistribution} 
                    title="Tỉ lệ trạng thái xử lý"
                />
                <RequestCategoryBar 
                    data={apiStats?.typeDistribution} 
                    title="Phân loại vi phạm"
                />
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="LIST" className="mt-0 space-y-6">
      {/* Filter and Search toolbar */}
      <DataFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm theo tên, nội dung, phân loại..."
        dropdownChecklists={[
          {
            title: "Trạng thái",
            items: [
              { label: "Chờ xử lý", value: "PENDING" },
              { label: "Đã duyệt", value: "RESOLVED" },
              { label: "Bỏ qua", value: "DISMISSED" },
            ],
            selectedItems: statusFilter,
            onItemToggle: (val) => setStatusFilter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]),
            onClear: () => setStatusFilter([]),
          },
        ]}
      />

      {/* Table */}
      <DataTable
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredReports.length,
          onPageChange: () => {},
          zeroIndexed: false,
          pageSize: filteredReports.length || 10,
        }}
        columns={[
          {
            header: "Người báo cáo",
            width: "180px",
            align: "left",
            headerAlign: "left",
            render: (report) => (
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm truncate" title={report.reporterName}>{report.reporterName}</p>
                <p className="text-xs text-muted-foreground truncate" title={report.reporterEmail}>{report.reporterEmail}</p>
              </div>
            ),
          },
          {
            header: "Vi phạm",
            width: "150px",
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (report) => (
              <span className="font-medium text-foreground text-sm">{violationTypes[report.type] || report.type}</span>
            ),
          },
          {
            header: "Nội dung bài viết",
            width: "250px",
            align: "left",
            headerAlign: "left",
            render: (report) => (
              <>
                <p className="text-sm text-muted-foreground" title={report.threadContent}>
                  {report.threadContent?.length > 70
                    ? report.threadContent.substring(0, 70) + "..."
                    : report.threadContent}
                </p>
                <a href={`/forum/${report.threadId}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                  Xem bài viết
                </a>
              </>
            ),
          },
          {
            header: "Lý do từ User",
            width: "200px",
            align: "left",
            headerAlign: "left",
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
            align: "center",
            headerAlign: "center",
            cellClassName: "text-center",
            render: (report) => getStatusBadge(report.status),
          },
          {
            header: "Hành động",
            width: "180px",
            align: "center",
            headerAlign: "center",
            className: "text-center",
            render: (report) => (
              <div className="flex items-center justify-center gap-2">
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
                      className="h-8 gap-1 text-success border border-success/20 bg-white hover:bg-success/10 hover:text-success"
                      onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                    </AppButton>
                    <AppButton appVariant="ghostMuted" variant="ghost" size="sm"
                      className="h-8 gap-1 text-muted-foreground border border-border hover:bg-muted hover:text-foreground bg-white"
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
        data={filteredReports}
        isLoading={isLoading}
        loadingState="Đang tải dữ liệu..."
        emptyState="Không có báo cáo nào phù hợp"
      />
      </TabsContent>
    </Tabs>
  );
}
