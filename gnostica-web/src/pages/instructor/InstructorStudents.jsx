import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Download,
  CheckCircle2,
  Clock,
  Activity,
  Search,
  Filter,
  Loader2,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  GraduationCap,
  X,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateConversation } from "@/hooks/messaging/useCreateConversation";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import AppBadge from "@/components/common/micro/AppBadge";
import DataTable from "@/components/common/composite/DataTable";
import { cn } from "@/lib/utils";
import { AppDialogRoot, AppDialogContent, AppDialogHeader, AppDialogTitle } from "@/components/common/micro/AppDialog";
import instructorService from "@/services/instructor/instructorService";
import AppProgress from "@/components/common/micro/AppProgress";
import { useInstructorStudents } from "@/hooks/user/useInstructorStudents";
import DataFilter from "@/components/common/composite/DataFilter";

const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

function InstructorStudentTable({ students, isLoading, onActionClick, onCoursesClick, pagination, onPageChange }) {
    const columns = [
        {
            header: "STT",
            className: "w-[60px] text-center",
            cellClassName: "text-center",
            render: (_, index) => (
                <span className="text-sm font-bold text-muted-foreground font-sans tracking-tighter">
                    {(index + 1).toString().padStart(2, '0')}
                </span>
            ),
        },
        {
            header: () => <div className="text-center w-full">Học viên</div>,
            className: "min-w-[280px]",
            render: (student) => (
                <div className="flex items-center gap-3">
                    <div className="avatar-base w-10 h-10 avatar-ring ring-primary/20">
                        <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        {student.status === "active" && (
                            <span className="status-indicator bg-success shadow-sm" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors duration-200 uppercase text-sm tracking-tight">
                            {student.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">{student.email}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Khóa học tham gia",
            className: "text-center",
            cellClassName: "text-center",
            render: (student) => (
                <div className="flex justify-center">
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onCoursesClick?.(student);
                        }}
                        className="text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl whitespace-nowrap shadow-sm hover:bg-primary hover:text-white transition-all cursor-pointer group-hover:scale-105 active:scale-95"
                    >
                        {student.coursesCount} Khóa học
                    </span>
                </div>
            )
        },
        {
            header: () => (
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors justify-center">
                    Tiến độ học tập <ArrowUpDown className="w-3 h-3" />
                </div>
            ),
            className: "text-center",
            cellClassName: "text-center",
            render: (student) => (
                <div className="w-[140px] mx-auto flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <span className={cn(
                            "text-[10px] font-bold uppercase tracking-tight",
                            student.progress === 100 ? "text-success" : "text-muted-foreground"
                        )}>
                            {student.progress === 100 ? "Hoàn thành" : "Đang học"}
                        </span>
                        <span className="text-xs font-bold text-foreground">{student.progress}%</span>
                    </div>
                    <AppProgress
                        value={student.progress}
                        heightClass="h-2"
                        className="bg-secondary rounded-full border border-border/50"
                        indicatorClassName={cn(
                            "rounded-full transition-all duration-1000 ease-out",
                            student.progress === 100 ? "bg-success" : "bg-primary"
                        )}
                    />
                </div>
            ),
        },
        {
            header: () => <div className="text-center w-full">Ngày tham gia</div>,
            className: "min-w-[160px]",
            cellClassName: "text-center",
            render: (student) => (
                <div className="flex flex-col gap-1 items-center">
                    <span className="text-xs font-bold text-foreground bg-muted border border-border px-2.5 py-1 rounded-lg tabular-nums">
                        {formatDate(student.joinedDate)}
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full shadow-sm",
                            student.lastActive.includes("giờ") || student.lastActive.includes("phút") ? "bg-success animate-pulse" : "bg-muted"
                        )} />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{student.lastActive}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Thao tác",
            className: "w-[80px] text-center",
            cellClassName: "text-center",
            render: (student) => (
                <div className="flex justify-center">
                    <TableActionIconButton
                        icon={MoreHorizontal}
                        onClick={(e) => {
                            e.stopPropagation();
                            onActionClick?.(student);
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <DataTable 
            columns={columns} 
            data={students} 
            pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalElements: pagination.totalItems || pagination.totalElements,
                onPageChange: onPageChange,
                zeroIndexed: true
            }}
            emptyState="Bạn chưa có học viên nào."
            isLoading={isLoading}
        />
    );
}

const StudentCoursesModal = ({ isOpen, onClose, student }) => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { createForInstructor, isCreatingInstructor } = useCreateConversation();

    const handleMessageStudent = async (courseId) => {
        if (!student?.id || !courseId) return;
        try {
            const conversation = await createForInstructor({ courseId, studentId: student.id });
            if (conversation?.id) {
                onClose();
                navigate(`/instructor/messages/${conversation.id}`);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Không thể khởi tạo cuộc trò chuyện.");
        }
    };

    useEffect(() => {
        const fetchStudentCourses = async () => {
            setIsLoading(true);
            try {
                const data = await instructorService.getStudentCourses(student.id);
                setCourses(data);
            } catch (error) {
                console.error("Error fetching student courses:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && student) {
            fetchStudentCourses();
        }
    }, [isOpen, student]);

    return (
        <AppDialogRoot open={isOpen} onOpenChange={onClose}>
            <AppDialogContent
                className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl"
                style={{ maxWidth: "860px", width: "92vw" }}
                showCloseButton={false}
            >
                {/* Header */}
                <AppDialogHeader className="px-6 py-5 bg-muted border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <AppDialogTitle className="text-base font-bold text-foreground">
                                    Khóa học tham gia
                                </AppDialogTitle>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Học viên:{" "}
                                    <span className="text-primary font-bold">{student?.fullName}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-red-50 hover:bg-error/10 text-error flex items-center justify-center text-error hover:text-error transition-colors flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </AppDialogHeader>

                {/* Table */}
                <div className="overflow-y-auto max-h-[60vh]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-sm font-medium">Đang tải...</span>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <GraduationCap className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm font-medium">Chưa có khóa học nào</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="py-4 px-4 text-left text-sm font-semibold text-foreground w-12">STT</th>
                                    <th className="py-4 px-4 text-center text-sm font-semibold text-foreground">Khóa học</th>
                                    <th className="py-4 px-4 text-center text-sm font-semibold text-foreground whitespace-nowrap w-36">Tiến độ</th>
                                    <th className="py-4 px-4 text-center text-sm font-semibold text-foreground whitespace-nowrap w-36">Ngày tham gia</th>
                                    <th className="py-4 px-4 text-center text-sm font-semibold text-foreground w-20 whitespace-nowrap">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course, index) => (
                                    <tr
                                        key={course.id || index}
                                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm font-bold text-muted-foreground">
                                                {(index + 1).toString().padStart(2, "0")}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0">
                                                    {course.courseThumbnail ? (
                                                        <img
                                                            src={course.courseThumbnail}
                                                            alt={course.courseTitle}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                                            <GraduationCap className="w-5 h-5 text-primary/40" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-foreground truncate max-w-[280px]">
                                                        {course.courseTitle}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {course.instructorName}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-primary">{course.progressPercent}%</span>
                                                </div>
                                                <AppProgress value={course.progressPercent} className="h-1.5 bg-primary/10" />
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm font-bold text-foreground block">
                                                {formatDate(course.joinedAt)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Ghi danh</span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleMessageStudent(course.courseId || course.id)}
                                                    disabled={isCreatingInstructor}
                                                    title="Nhắn tin với học viên"
                                                    className="px-2 py-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold border border-primary/20"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    <span>Nhắn tin</span>
                                                </button>
                                                <button className="p-1.5 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </AppDialogContent>
        </AppDialogRoot>
    );
};

export default function InstructorStudents() {
  const { students, stats, loading } = useInstructorStudents();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  const filteredStudents = (Array.isArray(students) ? students : []).filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter.length > 0) {
      if (statusFilter.includes("learning") && student.progress === 100) matchesStatus = false;
      if (statusFilter.includes("completed") && student.progress < 100) matchesStatus = false;
    }

    let matchDate = true;
    if (dateRange?.from) {
      // Assuming student has joinedAt or createdAt. Let's use joinedAt if available, else skip filtering or assume joinedAt
      const dateVal = student.joinedAt || student.createdAt;
      if (dateVal) {
        const itemDate = new Date(dateVal);
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = dateRange.to ? new Date(dateRange.to) : new Date(from);
        to.setHours(23, 59, 59, 999);
        matchDate = itemDate >= from && itemDate <= to;
      }
    }

    return matchesSearch && matchesStatus && matchDate;
  });

  const handleOpenCoursesModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="py-8 space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Học Viên Của Tôi
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Quản lý và theo dõi tiến độ của học viên trong các khóa học bạn đang giảng dạy.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <AppButton appVariant="ghostMuted" variant="ghost" className="btn-md bg-white border border-border font-bold hover:shadow-sm rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Xuất dữ liệu
          </AppButton>
          <AppButton appVariant="gradient" className="btn-md font-bold rounded-xl transition-all hover:scale-[1.02]">
            <Mail className="w-4 h-4 mr-2" /> Gửi thông báo
          </AppButton>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng học viên", value: stats.total.toLocaleString(), icon: Users, bgClass: "bg-info/10", textClass: "text-info", borderClass: "border-info/20", circleClass: "bg-info/5 group-hover:bg-info/10", trend: "+0%", trendBgClass: "bg-info/5", trendBorderClass: "border-info/20" },
          { label: "Hoàn thành", value: stats.completed.toLocaleString(), icon: CheckCircle2, bgClass: "bg-success/10", textClass: "text-success", borderClass: "border-success/20", circleClass: "bg-success/5 group-hover:bg-success/10", trend: "+0%", trendBgClass: "bg-success/5", trendBorderClass: "border-success/20" },
          { label: "Đang học", value: stats.learning.toLocaleString(), icon: Clock, bgClass: "bg-warning/10", textClass: "text-warning", borderClass: "border-warning/20", circleClass: "bg-warning/5 group-hover:bg-warning/10", trend: "+0%", trendBgClass: "bg-warning/5", trendBorderClass: "border-warning/20" },
          { label: "Hoạt động", value: stats.active.toLocaleString(), icon: Activity, bgClass: "bg-primary/10", textClass: "text-primary", borderClass: "border-primary/20", circleClass: "bg-primary/5 group-hover:bg-primary/10", trend: "+0%", trendBgClass: "bg-primary/5", trendBorderClass: "border-primary/20" },
        ].map((stat, i) => (
          <AppCard key={i} className="group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative rounded-2xl bg-card">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${stat.circleClass} transition-colors duration-500`} />
            <AppCardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.bgClass} flex items-center justify-center ${stat.textClass} border ${stat.borderClass} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground tracking-tight">{stat.value}</span>
                  <span className={`text-[10px] font-bold ${stat.textClass} ${stat.trendBgClass} px-1.5 rounded-full border ${stat.trendBorderClass}`}>{stat.trend}</span>
                </div>
              </div>
            </AppCardContent>
          </AppCard>
        ))}
      </div>

      {/* Filters & Content */}
      <div className="space-y-6">
        <DataFilter
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm kiếm theo tên hoặc email..."
          dropdownChecklists={[
            {
              title: "Bộ lọc",
              items: [
                { label: "Đang học", value: "learning" },
                { label: "Hoàn thành", value: "completed" }
              ],
              selectedItems: statusFilter,
              onItemToggle: (val) => setStatusFilter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
              onClear: () => setStatusFilter([])
            }
          ]}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          dateRangePlaceholder="Khoảng thời gian"
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-border shadow-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Đang tải danh sách học viên...</p>
          </div>
        ) : (
          <InstructorStudentTable
            students={filteredStudents}
            onCoursesClick={handleOpenCoursesModal}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: filteredStudents.length,
              itemsPerPage: 50
            }}
            onPageChange={(page) => console.log("Page changed to:", page)}
          />
        )}
      </div>

      <StudentCoursesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
}
