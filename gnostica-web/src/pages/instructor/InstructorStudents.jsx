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
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/common/composite/DataTable";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import instructorService from "@/services/instructor/instructorService";
import { Progress } from "@/components/ui/progress";
import { useInstructorStudents } from "@/hooks/user/useInstructorStudents";

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
                <span className="text-2xs font-bold text-muted-foreground font-sans tracking-tighter">
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
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors duration-200 uppercase text-xs tracking-tight">
                            {student.name}
                        </span>
                        <span className="text-2xs text-muted-foreground font-medium">{student.email}</span>
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
                        className="text-xs font-black text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl whitespace-nowrap shadow-sm hover:bg-primary hover:text-white transition-all cursor-pointer group-hover:scale-105 active:scale-95"
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
                            "text-[10px] font-black uppercase tracking-tight",
                            student.progress === 100 ? "text-success" : "text-muted-foreground"
                        )}>
                            {student.progress === 100 ? "Hoàn thành" : "Đang học"}
                        </span>
                        <span className="text-xs font-black text-foreground">{student.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/50 p-[1px]">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out relative shadow-sm",
                                student.progress === 100 ? "bg-success" : "bg-primary"
                            )}
                            style={{ width: `${student.progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                        </div>
                    </div>
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
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">{student.lastActive}</span>
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="p-0 overflow-hidden border-none shadow-2xl rounded-2xl"
                style={{ maxWidth: "860px", width: "92vw" }}
                showCloseButton={false}
            >
                {/* Header */}
                <DialogHeader className="px-6 py-5 bg-muted border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-foreground">
                                    Khóa học tham gia
                                </DialogTitle>
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
                </DialogHeader>

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
                                                    <span className="text-sm font-black text-primary">{course.progressPercent}%</span>
                                                </div>
                                                <Progress value={course.progressPercent} className="h-1.5 bg-primary/10" />
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-sm font-bold text-foreground block">
                                                {formatDate(course.joinedAt)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Ghi danh</span>
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <button className="p-1.5 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function InstructorStudents() {
  const { students, stats, loading } = useInstructorStudents();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleOpenCoursesModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="py-8 space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-h1 font-black text-foreground tracking-tight leading-none">Học Viên Của Tôi</h1>
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
          { label: "Tổng học viên", value: stats.total.toLocaleString(), icon: Users, color: "blue", trend: "+0%" },
          { label: "Hoàn thành", value: stats.completed.toLocaleString(), icon: CheckCircle2, color: "green", trend: "+0%" },
          { label: "Đang học", value: stats.learning.toLocaleString(), icon: Clock, color: "amber", trend: "+0%" },
          { label: "Hoạt động", value: stats.active.toLocaleString(), icon: Activity, color: "purple", trend: "+0%" },
        ].map((stat, i) => (
          <Card key={i} className="group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative rounded-2xl">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-${stat.color}-50/50 group-hover:bg-${stat.color}-100/50 transition-colors duration-500`} />
            <CardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 border border-${stat.color}-100 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground tracking-tight">{stat.value}</span>
                  <span className={`text-[10px] font-bold text-${stat.color}-600 bg-${stat.color}-50 px-1.5 rounded-full border border-${stat.color}-100/50`}>{stat.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Content */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl border border-border">
          <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center gap-3">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="pl-9 h-11 bg-white border-border focus:ring-2 focus:ring-primary/10 transition-all rounded-xl shadow-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-muted/80 p-1 rounded-xl w-full sm:w-auto border border-border/50">
              <select className="h-9 px-3 bg-transparent border-none rounded-lg text-sm text-foreground font-bold focus:outline-none appearance-none min-w-[160px] cursor-pointer">
                <option>Tất cả khóa học</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground bg-muted/80 p-1.5 rounded-xl border border-border/50 shadow-inner">
            <button className="px-5 py-2 rounded-lg bg-white text-primary shadow-sm hover:shadow-md transition-all font-black uppercase tracking-tight">Tất cả</button>
            <button className="px-5 py-2 rounded-lg hover:text-foreground transition-all hover:bg-white/50 font-bold uppercase tracking-tight">Đang học</button>
            <button className="px-5 py-2 rounded-lg hover:text-foreground transition-all hover:bg-white/50 font-bold uppercase tracking-tight">Hoàn thành</button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-border shadow-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Đang tải danh sách học viên...</p>
          </div>
        ) : (
          <InstructorStudentTable
            students={students}
            onCoursesClick={handleOpenCoursesModal}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: students.length,
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
