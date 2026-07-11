import threadReportService from "@/services/forum/threadReportService";
import React, { useState, useEffect } from "react";
import { BarChart3, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppTable from "@/components/common/composite/AppTable";
import { Badge } from "@/components/ui/badge";
import { AppButton } from "@/components/common/micro/AppButton";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

const violationTypes = {
  spam: "Spam / Quảng cáo",
  harassment: "Quấy rối / Lăng mạ",
  inappropriate: "Nội dung phản cảm",
  copyright: "Vi phạm bản quyền",
  other: "Khác",
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await threadReportService.getReports(0, 50);
      const allReports = data.content || data || [];
      // Lọc bỏ các báo cáo có trạng thái là DISMISSED (Bỏ qua) khỏi bảng hiển thị
      const activeReports = allReports.filter(report => report.status !== "DISMISSED");
      setReports(activeReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

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
        return <Badge variant="secondary" className="bg-warning/10 text-warning text-warning hover:bg-warning/10 text-warning border-none">Chờ xử lý</Badge>;
      case "RESOLVED":
        return <Badge variant="secondary" className="bg-success/10 text-success text-success hover:bg-success/10 text-success border-none">Đã duyệt</Badge>;
      case "DISMISSED":
        return <Badge variant="secondary" className="bg-secondary text-foreground hover:bg-secondary border-none">Bỏ qua</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Thống Kê & Báo Cáo</h1>
        <p className="text-sm text-muted-foreground mt-1">Phân tích doanh thu và quản lý nội dung nền tảng.</p>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="stats" className="gap-2"><BarChart3 className="w-4 h-4" /> Thống kê chung</TabsTrigger>
          <TabsTrigger value="forum-reports" className="gap-2"><ShieldAlert className="w-4 h-4" /> Báo cáo bài viết</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-border border-dashed gap-4">
            <BarChart3 className="w-12 h-12 text-slate-300" />
            <p className="text-muted-foreground font-medium">Trang Thống Kê đang được xây dựng</p>
          </div>
        </TabsContent>

        <TabsContent value="forum-reports">
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <AppTable
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
                          <AppButton appVariant="ghostMuted" variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1 text-muted-foreground border border-border hover:bg-muted bg-white"
                            onClick={() => handleUpdateStatus(report.id, "PENDING")}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Hủy duyệt
                          </AppButton>
                        ) : report.status === "DISMISSED" ? (
                          <AppButton appVariant="ghostMuted" variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1 text-muted-foreground border border-border hover:bg-muted bg-white"
                            onClick={() => handleUpdateStatus(report.id, "PENDING")}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Hoàn tác
                          </AppButton>
                        ) : (
                          <>
                            <AppButton appVariant="ghostMuted" variant="ghost" 
                              size="sm" 
                              className="h-8 gap-1 text-error border border-error/20 bg-white hover:bg-red-50 hover:text-error"
                              onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                            </AppButton>
                            <AppButton appVariant="ghostMuted" variant="ghost" 
                              size="sm" 
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
