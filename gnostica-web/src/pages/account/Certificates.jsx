import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Home,
  Award,
  Download,
  Share2,
  Trophy,
  ExternalLink,
} from "lucide-react";

// Mock Data
const CERTIFICATES_DATA = [
  {
    id: "CERT-2026-891",
    courseId: 3,
    title: "Thiết kế UI/UX Thực chiến với Figma",
    issueDate: "15/03/2026",
    instructor: "Lê Minh Tâm",
    grade: "Xuất sắc",
    hours: "20.5 giờ",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=400&auto=format&fit=crop",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "CERT-2026-102",
    courseId: 2,
    title: "JavaScript Cơ bản",
    issueDate: "10/01/2026",
    instructor: "Nguyễn Văn A",
    grade: "Giỏi",
    hours: "15 giờ",
    image: "https://images.unsplash.com/photo-1627398242454-4bcf1c8f1d8?q=80&w=400&auto=format&fit=crop",
    color: "from-blue-500 to-cyan-500",
  },
];

export default function Certificates() {
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" /> Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Tài khoản
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-semibold">Chứng chỉ</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
            <Award className="w-7 h-7 text-primary" />
            Chứng chỉ của tôi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bạn đã nỗ lực hoàn thành {CERTIFICATES_DATA.length} khóa học. Tuyệt vời!
          </p>
        </div>
      </div>

      {/* Certificates Grid */}
      {CERTIFICATES_DATA.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {CERTIFICATES_DATA.map((cert) => (
            <Card key={cert.id} className="border-border shadow-sm overflow-hidden hover:shadow-lg transition-all group">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                {/* Left Side: Thumbnail/Design */}
                <div className={`relative w-full sm:w-48 h-48 sm:h-auto bg-gradient-to-br ${cert.color} overflow-hidden shrink-0 flex flex-col items-center justify-center text-white p-6`}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Award className="w-16 h-16 opacity-90 mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Cấp bởi Gnostica</p>
                  <p className="font-extrabold text-center leading-tight line-clamp-3">{cert.title}</p>
                </div>
                
                {/* Right Side: Info & Actions */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-bold text-lg text-foreground line-clamp-2">{cert.title}</h3>
                      <Link to={`/courses/${cert.courseId}`} title="Xem khóa học">
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      </Link>
                    </div>
                    
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Giảng viên:</span>
                        <span className="font-semibold text-foreground">{cert.instructor}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Thời lượng:</span>
                        <strong className="text-foreground">{cert.hours}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Xếp loại:</span>
                        <strong className="text-primary">{cert.grade}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Cấp ngày:</span>
                        <span className="font-medium text-foreground">{cert.issueDate}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Mã CC:</span>
                        <span className="text-xs font-mono font-medium bg-secondary px-1.5 py-0.5 rounded text-foreground">{cert.id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                    <Button className="flex-1 bg-primary text-white hover:bg-primary/90 font-bold text-sm gap-2">
                      <Download className="w-4 h-4" />
                      Tải PDF
                    </Button>
                    <Button variant="outline" className="px-4 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border-border">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-muted shadow-none border-border">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-primary/40 mb-6">
              <Trophy className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Bạn chưa có chứng chỉ nào</h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
              Hãy cố gắng hoàn thành 100% bài giảng và bài tập trong khóa học để mở khóa chứng chỉ của bạn nhé!
            </p>
            <Link to="/account/my-courses">
              <Button className="font-bold bg-primary text-white">Quay lại học ngay</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
