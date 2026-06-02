import React, { useState, useEffect } from "react";
import { BarChart3, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      const res = await axios.get("http://localhost:8080/api/thread-reports?page=0&size=50");
      const allReports = res.data.content || [];
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
      await axios.put(`http://localhost:8080/api/thread-reports/${id}/status`, { status });
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
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">Chờ xử lý</Badge>;
      case "RESOLVED":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Đã duyệt</Badge>;
      case "DISMISSED":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">Bỏ qua</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thống Kê & Báo Cáo</h1>
        <p className="text-sm text-slate-500 mt-1">Phân tích doanh thu và quản lý nội dung nền tảng.</p>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="stats" className="gap-2"><BarChart3 className="w-4 h-4" /> Thống kê chung</TabsTrigger>
          <TabsTrigger value="forum-reports" className="gap-2"><ShieldAlert className="w-4 h-4" /> Báo cáo bài viết</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 border-dashed gap-4">
            <BarChart3 className="w-12 h-12 text-slate-300" />
            <p className="text-slate-400 font-medium">Trang Thống Kê đang được xây dựng</p>
          </div>
        </TabsContent>

        <TabsContent value="forum-reports">
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="w-[150px]">Người báo cáo</TableHead>
                    <TableHead className="w-[150px]">Vi phạm</TableHead>
                    <TableHead className="max-w-[200px]">Nội dung vi phạm</TableHead>
                    <TableHead className="max-w-[200px]">Chi tiết từ User</TableHead>
                    <TableHead className="w-[120px]">Trạng thái</TableHead>
                    <TableHead className="text-right w-[180px]">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 h-32 text-slate-500">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 h-32 text-slate-500">
                        Chưa có báo cáo nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <p className="font-medium text-slate-700">{report.reporterName}</p>
                          <p className="text-xs text-slate-400">{report.reporterEmail}</p>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-slate-700 text-sm">{violationTypes[report.type] || report.type}</span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-slate-600" title={report.threadContent}>
                            {report.threadContent?.length > 50 
                              ? report.threadContent.substring(0, 50) + "..." 
                              : report.threadContent}
                          </p>
                          <a href={`/forum/${report.threadId}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                            Xem bài viết
                          </a>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-slate-600" title={report.details}>
                            {report.details 
                              ? (report.details.length > 50 ? report.details.substring(0, 50) + "..." : report.details)
                              : <span className="text-slate-400 italic">Không có</span>}
                          </p>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(report.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {report.status === "RESOLVED" ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1 text-slate-600 border-slate-200 hover:bg-slate-50"
                                onClick={() => handleUpdateStatus(report.id, "PENDING")}
                              >
                                <XCircle className="w-3.5 h-3.5" /> Hủy duyệt
                              </Button>
                            ) : report.status === "DISMISSED" ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1 text-slate-600 border-slate-200 hover:bg-slate-50"
                                onClick={() => handleUpdateStatus(report.id, "PENDING")}
                              >
                                <XCircle className="w-3.5 h-3.5" /> Hoàn tác
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 gap-1 text-slate-500 hover:text-slate-700"
                                  onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Bỏ qua
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
