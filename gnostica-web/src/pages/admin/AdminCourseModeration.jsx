import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Calendar,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import courseService from "@/services/courseService";
import { toast } from "sonner";

// Shared Modal Imports
import CourseRejectModal from "@/components/modals/CourseRejectModal";
import InstructorProfileModal from "@/components/modals/InstructorProfileModal";

export default function AdminCourseModeration() {
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const navigate = useNavigate();

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Instructor Profile State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeInstructor, setActiveInstructor] = useState(null);

  // Safe extraction function to support standard Page, ResponseDTO, or ApiResponse
  const extractPageData = (res) => {
    if (!res) return null;
    if (res.data !== undefined) {
      // Wrapped inside ResponseDTO or ApiResponse
      return res.data;
    }
    return res; // Raw Page object
  };

  // Load real data based on current active tab and page
  const loadCourses = async (page = 0) => {
    try {
      setLoading(true);
      let statusParam = null;
      if (activeTab === "pending") statusParam = 4;
      else if (activeTab === "approved") statusParam = 1;
      else if (activeTab === "rejected") statusParam = 3;

      const resRaw = await courseService.getModerationCourses(statusParam, page, 10);
      const res = extractPageData(resRaw) || {};
      
      setCourses(res.content || []);
      setPagination({
        currentPage: res.number || 0,
        totalPages: res.totalPages || 0,
        totalElements: res.totalElements || 0,
      });
    } catch (err) {
      console.error("Fetch courses error:", err);
      toast.error("Không thể kết nối đến máy chủ dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch general counts for statistics cards (Runs once on component mount)
  const loadStats = async () => {
    try {
      const res = await courseService.getModerationStats();
      // Safely handle wrapper if present
      const statsData = res?.data !== undefined ? res.data : res;
      
      if (statsData) {
        setStats({
          pending: statsData.pending || 0,
          approved: statsData.approved || 0,
          rejected: statsData.rejected || 0,
        });
      }
    } catch (e) {
      console.error("Load Stats Error:", e);
    }
  };

  useEffect(() => {
    loadCourses(0);
    loadStats();
  }, [activeTab]);

  const handleOpenInstructorProfile = (course) => {
     if (!course.instructorId && !course.instructorName) return;
     setActiveInstructor({
        name: course.instructorName || "Chưa cập nhật",
        avatar: course.instructorAvatar,
        email: course.instructorEmail || "---",
        phone: course.instructorPhone || "---",
        cccd: "---",
        address: "Việt Nam",
        joinedDate: formatFriendlyDate(course.instructorCreatedAt),
        job: "Giảng viên Gnostica",
        bio: "Thông tin chi tiết về kinh nghiệm giảng dạy của tác giả khóa học.",
        bankName: "Ngân hàng liên kết",
        bankNumber: "---",
        bankHolder: (course.instructorName || "").toUpperCase(),
        courses: 1,
        students: "--",
        rating: "4.8"
     });
     setIsProfileModalOpen(true);
  };

  const handleOpenPreview = (course) => {
    // Navigation relies strictly on SLUG requested by user
    navigate(`/admin/course-moderation/${course.slug}`);
  };

  const handleApprove = async (course) => {
    if (!window.confirm(`Bạn có chắc chắn phê duyệt công khai khóa học "${course.title}"?`)) return;
    try {
      setIsSubmitting(true);
      await courseService.approveCourse(course.slug);
      toast.success("Phê duyệt và xuất bản khóa học thành công!");
      loadCourses(pagination.currentPage);
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.error || "Không thể phê duyệt khóa học này.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRejectModal = (course) => {
    setSelectedCourse(course);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng điền lý do từ chối kiểm duyệt.");
      return;
    }
    try {
      setIsSubmitting(true);
      await courseService.rejectCourse(selectedCourse.slug, rejectReason);
      toast.success("Đã gửi lý do từ chối phê duyệt khóa học.");
      setIsRejectModalOpen(false);
      setSelectedCourse(null);
      loadCourses(pagination.currentPage);
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi từ chối khóa học.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 4: // Backend Chờ duyệt
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Chờ duyệt
          </span>
        );
      case 1: // Backend Đã duyệt
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã duyệt
          </span>
        );
      case 3: // Backend Từ chối
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <XCircle className="w-3.5 h-3.5" />
            Từ chối
          </span>
        );
      case 2: // Backend Ẩn
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            Tạm ẩn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border shadow-sm">
            Nháp
          </span>
        );
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Client-side search filtering over current page data
  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-border/60 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            Kiểm Duyệt Khóa Học
          </h1>
          <p className="text-muted-foreground font-medium">
            Xem xét và duyệt khóa học do Giảng viên thiết kế trước khi công khai.
          </p>
        </div>
      </div>

      {/* Status Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-white to-amber-50/20 border border-border rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-muted-foreground tracking-wide uppercase mb-1">
            Đang chờ phê duyệt
          </h4>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black text-amber-700">{stats.pending}</span>
            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 font-extrabold">Cần duyệt</Badge>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-white to-emerald-50/20 border border-border rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-muted-foreground tracking-wide uppercase mb-1">
            Đã phê duyệt
          </h4>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black text-emerald-700">{stats.approved}</span>
            <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold">Hoạt động</Badge>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-white to-rose-50/20 border border-border rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-muted-foreground tracking-wide uppercase mb-1">
            Đã từ chối duyệt
          </h4>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black text-rose-700">{stats.rejected}</span>
            <Badge variant="outline" className="bg-rose-50 border-rose-200 text-rose-700 font-extrabold">Yêu cầu sửa</Badge>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-border/60 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex w-full lg:w-auto items-center gap-3">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm nhanh trong trang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-muted border-border h-10 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl w-full lg:w-auto border border-border/30">
          <TabButton
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            Tất cả
          </TabButton>
          <TabButton
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
          >
            Đang chờ
          </TabButton>
          <TabButton
            active={activeTab === "approved"}
            onClick={() => setActiveTab("approved")}
          >
            Đã duyệt
          </TabButton>
          <TabButton
            active={activeTab === "rejected"}
            onClick={() => setActiveTab("rejected")}
          >
            Từ chối
          </TabButton>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden bg-white rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/80">
              <TableRow>
                <TableHead className="py-4 font-bold text-muted-foreground uppercase text-xs tracking-wider pl-6 w-[380px]">
                  Thông tin khóa học
                </TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground uppercase text-xs tracking-wider">
                  Giảng viên
                </TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground uppercase text-xs tracking-wider">
                  Ngày cập nhật
                </TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground uppercase text-xs tracking-wider">
                  Giá bán
                </TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground uppercase text-xs tracking-wider">
                  Trạng thái
                </TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground uppercase text-xs tracking-wider text-right pr-6">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="font-bold">Đang tải danh sách kiểm duyệt...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/60 group transition-colors"
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex gap-4 items-center">
                        <div 
                          onClick={() => handleOpenPreview(item)}
                          className="w-24 h-16 rounded-lg overflow-hidden border border-border shadow-sm shrink-0 relative group-hover:shadow-md transition-shadow cursor-pointer bg-secondary flex items-center justify-center"
                        >
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-[8px] font-extrabold text-muted-foreground">Gnostica Image</span>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Eye className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            onClick={() => handleOpenPreview(item)}
                            className="font-bold text-foreground truncate group-hover:text-primary transition-colors cursor-pointer leading-tight"
                            title={item.title}
                          >
                            {item.title || <i className="text-muted-foreground font-normal">Chưa đặt tên</i>}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] font-extrabold uppercase tracking-wide px-1 bg-muted">
                              ID: {item.id}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-bold">
                              {item.categoryName || "Chưa rõ danh mục"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-secondary shadow-sm shrink-0 flex items-center justify-center">
                          {item.instructorAvatar ? (
                            <img
                              src={item.instructorAvatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">Gv</span>
                          )}
                        </div>
                        <span className="font-semibold text-foreground text-sm line-clamp-1">
                          {item.instructorName || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {formatFriendlyDate(item.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-extrabold text-foreground text-[15px]">
                        {formatCurrency(item.salePrice || item.price || 0)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end items-center gap-2">
                        {item.status === 4 ? (
                          <>
                            <Button
                              size="sm"
                              disabled={isSubmitting}
                              onClick={() => handleApprove(item)}
                              className="h-8 font-bold gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isSubmitting}
                              onClick={() => handleOpenRejectModal(item)}
                              className="h-8 font-bold border-border text-muted-foreground hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                            >
                              Từ chối
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPreview(item)}
                            className="h-8 font-bold text-muted-foreground gap-1.5 hover:border-primary hover:text-primary bg-white"
                          >
                            Chi tiết <ArrowUpRight className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem 
                              onClick={() => handleOpenPreview(item)}
                              className="cursor-pointer font-semibold"
                            >
                              Xem giáo trình đầy đủ
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenInstructorProfile(item)}
                              className="cursor-pointer font-semibold"
                            >
                              Hồ sơ Giảng viên
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <div className="p-4 bg-muted rounded-full">
                        <Filter className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-bold">Danh sách kiểm duyệt đang trống</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-white">
          <div className="font-medium pl-2">
            Hiển thị trang <span className="font-black text-foreground">{pagination.currentPage + 1}</span> / {pagination.totalPages || 1} ({pagination.totalElements} kết quả)
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-9 font-bold border-border text-muted-foreground"
              onClick={() => loadCourses(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 0 || loading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 font-bold border-border text-muted-foreground"
              onClick={() => loadCourses(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>

      <CourseRejectModal
         isOpen={isRejectModalOpen}
         onClose={setIsRejectModalOpen}
         courseName={selectedCourse?.title}
         rejectReason={rejectReason}
         setRejectReason={setRejectReason}
         onConfirm={handleConfirmReject}
      />

      <InstructorProfileModal 
         isOpen={isProfileModalOpen}
         onClose={setIsProfileModalOpen}
         instructor={activeInstructor}
      />
    </div>
  );
}

const TabButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 text-center
      ${
        active
          ? "bg-white text-foreground shadow-sm border border-border/50 scale-[1.02]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }
    `}
  >
    {children}
  </button>
);
