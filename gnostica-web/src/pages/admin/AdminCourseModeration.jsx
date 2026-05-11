import React, { useState } from "react";
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
  PlayCircle,
  FileText,
  Video,
  Tag,
  BookOpen,
  Calendar,
  Globe,
  Trophy,
  Layers,
  Mail,
  Briefcase,
  MapPin,
  Phone,
  CreditCard,
  Award,
  FileCheck,
  ExternalLink,
  User,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Shared Modal Imports
import CourseRejectModal from "@/components/modals/CourseRejectModal";
import InstructorProfileModal from "@/components/modals/InstructorProfileModal";

// Mock Data
const MODERATION_DATA = [
  {
    id: "CRS-1024",
    title: "Mastering Advanced Next.js & Node.js 2024",
    instructor: "Nguyễn Văn A",
    instructorAvatar: "https://i.pravatar.cc/150?u=a",
    price: "1.299.000đ",
    submittedDate: "10/05/2026 09:30",
    status: "pending",
    category: "Web Development",
    image:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "CRS-1025",
    title: "Thiết kế UI/UX Mobile App chuyên nghiệp",
    instructor: "Trần Thị B",
    instructorAvatar: "https://i.pravatar.cc/150?u=b",
    price: "890.000đ",
    submittedDate: "09/05/2026 14:15",
    status: "pending",
    category: "UI/UX Design",
    image:
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "CRS-1021",
    title: "DevOps cho người mới bắt đầu với Docker",
    instructor: "Lê Quang C",
    instructorAvatar: "https://i.pravatar.cc/150?u=c",
    price: "500.000đ",
    submittedDate: "08/05/2026 16:45",
    status: "approved",
    category: "DevOps",
    image:
      "https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "CRS-1019",
    title: "React Native & Expo Toàn tập",
    instructor: "Phạm Minh D",
    instructorAvatar: "https://i.pravatar.cc/150?u=d",
    price: "950.000đ",
    submittedDate: "07/05/2026 10:20",
    status: "rejected",
    category: "Mobile App",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=200&auto=format&fit=crop",
  },
];

export default function AdminCourseModeration() {
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Instructor Profile State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeInstructor, setActiveInstructor] = useState(null);

  const handleOpenInstructorProfile = (course) => {
     setActiveInstructor({
        name: course.instructor,
        avatar: course.instructorAvatar,
        email: course.instructor.replace(" ", ".").toLowerCase() + "@gmail.com",
        phone: "0987.654.321",
        cccd: "012345678901",
        address: "Hà Nội, Việt Nam",
        joinedDate: "15/08/2023",
        job: "Tech Lead / Architect",
        bio: "Giảng viên với nhiều năm kinh nghiệm làm việc tại các tập đoàn đa quốc gia.",
        bankName: "Vietcombank",
        bankNumber: "10123456789",
        bankHolder: course.instructor.toUpperCase(),
        courses: 12,
        students: "5.4k",
        rating: "4.9"
     });
     setIsProfileModalOpen(true);
  };

  const handleOpenPreview = (course) => {
    navigate(`/admin/course-moderation/${course.id}`);
  };

  const handleOpenRejectModal = (course) => {
    setSelectedCourse(course);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;

    // Logics handled here (Mock update or API call later)
    console.log(
      `Rejecting course ${selectedCourse.id} with reason: ${rejectReason}`,
    );

    setIsRejectModalOpen(false);
    setSelectedCourse(null);
    // Show success toast could go here
  };

  const filteredData =
    activeTab === "all"
      ? MODERATION_DATA
      : MODERATION_DATA.filter((item) => item.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Chờ duyệt
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <XCircle className="w-3.5 h-3.5" />
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Kiểm Duyệt Khóa Học
          </h1>
          <p className="text-slate-500 font-medium">
            Xem xét nội dung khóa học và phê duyệt để phát hành lên nền tảng.
          </p>
        </div>
      </div>

      {/* Status Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-300"></div>
          <h4 className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">
            Chờ phê duyệt
          </h4>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-800">2</span>
            <span className="text-amber-600 bg-amber-50 text-xs font-bold px-2 py-0.5 rounded-md border border-amber-100">
              Khóa mới
            </span>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-300"></div>
          <h4 className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">
            Đã duyệt
          </h4>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-800">24</span>      
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-300"></div>
          <h4 className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">
            Từ chối
          </h4>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-800">5</span>         
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex w-full lg:w-auto items-center gap-3">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              className="pl-9 bg-slate-50/50 border-slate-200 h-10 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <select className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer hover:border-slate-300">
            <option>Tất cả danh mục</option>
            <option>Web Development</option>
            <option>Mobile App</option>
            <option>UI/UX Design</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-full lg:w-auto border border-slate-200/30">
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
      <Card className="border-slate-200/60 shadow-sm overflow-hidden bg-white rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="py-4 font-bold text-slate-600 uppercase text-xs tracking-wider pl-6">
                  Thông tin khóa học
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">
                  Giảng viên
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">
                  Ngày gửi
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">
                  Giá niêm yết
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-600 uppercase text-xs tracking-wider">
                  Trạng thái
                </TableHead>
                <TableHead className="py-4 font-bold text-slate-600 uppercase text-xs tracking-wider text-right pr-6">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-slate-50/60 group transition-colors"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex gap-4 items-center">
                      <div 
                        onClick={() => handleOpenPreview(item)}
                        className="w-24 h-16 rounded-lg overflow-hidden border border-slate-100 shadow-sm shrink-0 relative group-hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                          <Eye className="w-5 h-5 text-white drop-shadow" />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 max-w-[300px]">
                        <span
                          onClick={() => handleOpenPreview(item)}
                          className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors cursor-pointer"
                          title={item.title}
                        >
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.id}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                        <img
                          src={item.instructorAvatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-semibold text-slate-700 text-sm">
                        {item.instructor}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700 text-sm">
                        {item.submittedDate.split(" ")[0]}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.submittedDate.split(" ")[1]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-extrabold text-slate-800 text-[15px]">
                      {item.price}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end items-center gap-2 opacity-90 group-hover:opacity-100">
                      {item.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="h-8 font-bold gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 border-none"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRejectModal(item)}
                            className="h-8 font-bold border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm"
                          >
                            Từ chối
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPreview(item)}
                          className="h-8 font-bold text-slate-600 gap-1.5 hover:border-primary hover:text-primary bg-white transition-all"
                        >
                          Xem chi tiết <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-full"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => handleOpenPreview(item)}
                            className="cursor-pointer font-medium"
                          >
                            Xem nhanh chương trình
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleOpenInstructorProfile(item)}
                            className="cursor-pointer font-medium"
                          >
                            Xem thông tin Giảng viên
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                      <div className="p-4 bg-slate-50 rounded-full">
                        <Filter className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="font-bold">Không tìm thấy dữ liệu</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-white">
          <div className="font-medium pl-2">
            Đang hiển thị{" "}
            <span className="font-extrabold text-slate-900">
              {filteredData.length}
            </span>{" "}
            mục
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-9 font-semibold border-slate-200 text-slate-600"
              disabled
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 font-bold bg-primary text-white border-primary shadow-md shadow-primary/20 hover:bg-primary hover:text-white"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 font-semibold border-slate-200 text-slate-600"
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

// Mini component for Tab Toggle buttons
const TabButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 text-center
      ${
        active
          ? "bg-white text-slate-900 shadow-sm border border-slate-200/50 scale-[1.02]"
          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
      }
    `}
  >
    {children}
  </button>
);
