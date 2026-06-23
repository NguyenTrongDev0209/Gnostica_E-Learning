import React, { useState } from "react";
import {
  Users,
  Mail,
  Download,
  CheckCircle2,
  Clock,
  Activity,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InstructorStudentTable from "@/components/pages/instructor/students/InstructorStudentTable";
import StudentCoursesModal from "@/components/pages/instructor/students/StudentCoursesModal";
import { useInstructorStudents } from "@/hooks/instructor/useInstructorStudents";
import { toast } from "sonner";

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
          <Button variant="outline" className="btn-md bg-white border-border font-bold hover:shadow-sm rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Xuất dữ liệu
          </Button>
          <Button className="btn-md bg-primary hover:primary/90 text-white shadow-lg shadow-primary/20 font-bold rounded-xl transition-all hover:scale-[1.02]">
            <Mail className="w-4 h-4 mr-2" /> Gửi thông báo
          </Button>
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
