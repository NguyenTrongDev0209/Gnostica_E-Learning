import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  PlayCircle,
  FileText,
  Video,
  Tag,
  BookOpen,
  Calendar,
  Globe,
  Trophy,
  Layers,
  Eye,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Mail,
  Briefcase,
  MapPin,
  Phone,
  CreditCard,
  Award,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

// Shared Components
import CourseRejectModal from "@/components/modals/CourseRejectModal";
import InstructorProfileModal from "@/components/modals/InstructorProfileModal";

// Mock Curriculums and Data for demo
const SAMPLE_CURRICULUM = [
  {
    id: "m1",
    title: "Chương 1: Bắt đầu với kiến thức cơ bản",
    lessons: [
      {
        id: "l1",
        title: "1.1 Giới thiệu nội dung học",
        duration: "05:20",
        type: "video",
      },
      {
        id: "l2",
        title: "1.2 Cài đặt môi trường phát triển",
        duration: "15:45",
        type: "video",
      },
      {
        id: "l3",
        title: "1.3 Tài liệu hướng dẫn thực hành (PDF)",
        type: "doc",
      },
    ],
  },
  {
    id: "m2",
    title: "Chương 2: Xây dựng Component chuyên sâu",
    lessons: [
      {
        id: "l4",
        title: "2.1 State & Effect nâng cao",
        duration: "22:10",
        type: "video",
      },
      {
        id: "l5",
        title: "2.2 Tối ưu hóa Render logic",
        duration: "18:30",
        type: "video",
      },
      { id: "l6", title: "Quiz 01: Kiểm tra kiến thức Chương 2", type: "quiz" },
    ],
  },
  {
    id: "m3",
    title: "Chương 3: Deployment và tối ưu Server side",
    lessons: [
      {
        id: "l7",
        title: "3.1 Cấu hình Vercel Pro",
        duration: "12:05",
        type: "video",
      },
      {
        id: "l8",
        title: "3.2 Bảo mật hệ thống & JWT",
        duration: "25:00",
        type: "video",
      },
    ],
  },
];

const MOCK_COURSE = {
  id: "CRS-1024",
  title: "Mastering Advanced Next.js & Node.js 2024",
  instructor: "Nguyễn Văn A",
  instructorAvatar: "https://i.pravatar.cc/150?u=a",
  price: "1.299.000đ",
  submittedDate: "10/05/2026 09:30",
  status: "pending",
  category: "Web Development",
  image:
    "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1200&auto=format&fit=crop",
};

export default function AdminCourseDetailModeration() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In realistic scenario fetch data by ID
  const course = MOCK_COURSE;

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activePreview, setActivePreview] = useState(null); // Tracks current lesson being previewed

  // Replicate comprehensive instructor dummy data for this screen
  const activeInstructor = {
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
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    console.log(`Rejecting ${id} with: ${rejectReason}`);
    setIsRejectModalOpen(false);
    // After successful state change you might navigate back
    // navigate("/admin/course-moderation");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 font-bold gap-1 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>{" "}
            Chờ duyệt
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 font-bold text-[11px]">
            Đã duyệt
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm sticky top-4 z-20 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/course-moderation")}
            className="h-10 w-10 rounded-xl shrink-0 border-slate-200 hover:bg-slate-50 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Mã: {id || course.id}
              </span>
              {getStatusBadge(course.status)}
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight truncate leading-tight">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-14 md:ml-0">
          {course.status === "pending" && (
            <>
              <Button
                onClick={() => setIsRejectModalOpen(true)}
                variant="outline"
                className="font-bold text-rose-600 border-rose-200 bg-white hover:bg-rose-50 hover:text-rose-700 transition-all h-10 px-5"
              >
                Từ chối kiểm duyệt
              </Button>
              <Button className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 gap-2 border-none px-6 h-10">
                <CheckCircle2 className="w-4.5 h-4.5" /> Phê duyệt khóa học
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: 7/12 Content Specs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Media Presentation */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
                {activePreview ? (
                  <>
                    {activePreview.type === "video" && (
                      <Video className="w-5 h-5 text-blue-500" />
                    )}
                    {activePreview.type === "doc" && (
                      <FileText className="w-5 h-5 text-orange-500" />
                    )}
                    {activePreview.type === "quiz" && (
                      <Trophy className="w-5 h-5 text-violet-500" />
                    )}
                    Đang xem bài học: {activePreview.title}
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5 text-indigo-500" /> Video Giới
                    thiệu & Hình ảnh
                  </>
                )}
              </h2>
              {activePreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-indigo-600 font-bold hover:bg-indigo-50 gap-1 text-xs"
                  onClick={() => setActivePreview(null)}
                >
                  Quay về Intro
                </Button>
              )}
            </div>
            <div className="p-6">
              {activePreview ? (
                /* DYNAMIC LESSON PREVIEW AREA */
                <div className="space-y-4 animate-in fade-in duration-300">
                  {activePreview.type === "video" ? (
                    <div className="aspect-video rounded-xl bg-slate-950 overflow-hidden shadow-2xl border border-slate-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex items-center justify-center">
                        <div className="text-center space-y-3 p-6">
                          <div className="w-20 h-20 mx-auto bg-indigo-600/90 rounded-full flex items-center justify-center text-white animate-pulse shadow-lg shadow-indigo-500/30">
                            <PlayCircle className="w-12 h-12 fill-white/10" />
                          </div>
                          <h3 className="text-white font-black text-lg drop-shadow">
                            Trình phát bài giảng
                          </h3>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/60 backdrop-blur-md flex items-center px-4 justify-between text-white">
                        <div className="flex items-center gap-3">
                          <PlayCircle className="w-5 h-5" />
                          <div className="h-1.5 w-48 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-indigo-500"></div>
                          </div>
                          <span className="text-xs font-mono">
                            02:15 / {activePreview.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : activePreview.type === "doc" ? (
                    <div className="min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-10 space-y-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-lg">
                          {activePreview.title}
                        </h4>
                        <p className="text-slate-500 text-sm mt-1">
                          File đính kèm: tutorial_handout.pdf (4.2 MB)
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          className="font-bold gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          variant="outline"
                        >
                          Tải tài liệu về
                        </Button>
                        <Button className="font-bold gap-2 bg-indigo-600 hover:bg-indigo-700">
                          <ExternalLink className="w-4 h-4" /> Mở xem trước file
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[400px] bg-gradient-to-br from-violet-50 to-white border border-violet-100 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-200 mb-4">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">
                        Bài tập Trắc nghiệm / Quiz
                      </h3>
                      <p className="text-slate-500 mt-2 mb-6 max-w-md font-medium">
                        Phần này admin có thể xem trước danh sách các câu hỏi,
                        đáp án đúng và cách tính điểm của giảng viên.
                      </p>
                      <Button className="bg-violet-600 hover:bg-violet-700 font-bold gap-2">
                        Xem trước bài test
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* PROMO INTRO VIEW */
                <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden shadow-lg border border-slate-200 relative group">
                  <img
                    src={course.image}
                    alt="Thumbnail"
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-[1500ms]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-gradient-to-t from-black/40 to-transparent">
                    <button className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 hover:bg-white/20 border border-white/30 shadow-2xl group/btn">
                      <PlayCircle className="w-14 h-14 text-white fill-white/10 group-hover/btn:fill-white/30" />
                    </button>
                    <span className="text-white font-black text-sm tracking-wide uppercase drop-shadow bg-black/40 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                      Xem Video Giới Thiệu
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Specs Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Giá Niêm yết
                </p>
                <p className="text-xl font-black text-slate-900">
                  {course.price}
                </p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Cấp độ
                </p>
                <p className="text-lg font-bold text-slate-900">Trung cấp</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Danh mục
                </p>
                <p className="text-base font-bold text-slate-900">
                  {course.category}
                </p>
              </div>
            </div>
          </div>

          {/* Description Content */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-500" />
              <h2 className="font-extrabold text-slate-800">
                Mô tả & Nội dung chi tiết
              </h2>
            </div>
            <div className="p-6 prose max-w-none text-slate-600 font-medium leading-relaxed">
              <p className="text-lg text-slate-700 font-semibold mb-4">
                Đưa dự án thực tế vào việc giảng dạy giúp học viên nắm vững toàn
                bộ quá trình...
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4 marker:text-indigo-500">
                <li>Xây dựng hệ thống API mạnh mẽ với NestJS.</li>
                <li>
                  Tối ưu hóa caching và Performance cho ứng dụng React Next.js
                  app dir.
                </li>
                <li>
                  Cách Deploy & quản lý môi trường production chuẩn DevOps.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Curriculum Sticky */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[100px]">
          {/* Instructor Profile Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className="relative">
              <img
                src={course.instructorAvatar}
                alt="avt"
                className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                <CheckCircle2 className="w-3 h-3 fill-white text-emerald-500" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Được biên soạn bởi
              </p>
              <p className="text-base font-black text-slate-900">
                {course.instructor}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileModalOpen(true)}
              className="font-bold text-xs rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all"
            >
              Profile
            </Button>
          </div>

          {/* The Course Curriculum Wrapper */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden max-h-[calc(100vh-200px)]">
            <div className="p-5 bg-slate-900 text-white">
              <h3 className="font-black flex items-center gap-2.5 tracking-tight text-[17px]">
                <BookOpen className="w-5 h-5 text-indigo-400" /> Khung chương
                trình
              </h3>
              <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" /> 3 Chương • 8 Bài học
              </p>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 bg-slate-50/50 scrollbar-hide">
              <Accordion
                type="multiple"
                defaultValue={["m1"]}
                className="w-full space-y-3"
              >
                {SAMPLE_CURRICULUM.map((module, index) => (
                  <AccordionItem
                    key={module.id}
                    value={module.id}
                    className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white data-[state=open]:ring-2 data-[state=open]:ring-indigo-500/10 transition-all duration-200"
                  >
                    <AccordionTrigger className="px-4 py-3.5 hover:no-underline hover:bg-slate-50 font-bold text-slate-800 text-left group text-sm">
                      <span className="flex gap-2.5 items-start">
                        <span className="group-hover:text-indigo-700 transition-colors leading-snug pt-0.5">
                          {module.title}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-2 pt-0">
                      <div className="space-y-1">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            onClick={() => {
                              setActivePreview(lesson);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg transition-all group/lesson cursor-pointer border ${activePreview?.id === lesson.id ? "bg-indigo-50 border-indigo-200 shadow-sm" : "hover:bg-indigo-50/40 border-transparent"}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {lesson.type === "video" && (
                                <div
                                  className={`shrink-0 ${activePreview?.id === lesson.id ? "text-indigo-600" : "text-blue-500"}`}
                                >
                                  <Video className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {lesson.type === "doc" && (
                                <div
                                  className={`shrink-0 ${activePreview?.id === lesson.id ? "text-indigo-600" : "text-orange-500"}`}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {lesson.type === "quiz" && (
                                <div
                                  className={`shrink-0 ${activePreview?.id === lesson.id ? "text-indigo-600" : "text-violet-500"}`}
                                >
                                  <Trophy className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <span
                                className={`font-semibold text-xs truncate leading-snug ${activePreview?.id === lesson.id ? "text-indigo-900 font-bold" : "text-slate-700"}`}
                              >
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {lesson.duration && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  {lesson.duration}
                                </span>
                              )}
                              <ChevronRight
                                className={`w-3.5 h-3.5 transition-all ${activePreview?.id === lesson.id ? "text-indigo-600 opacity-100 translate-x-0.5" : "text-slate-300 opacity-0 group-hover/lesson:opacity-100 group-hover/lesson:translate-x-0.5"}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <CourseRejectModal
         isOpen={isRejectModalOpen}
         onClose={setIsRejectModalOpen}
         courseName={course?.title}
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
