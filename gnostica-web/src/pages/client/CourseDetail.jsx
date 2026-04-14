import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumb } from "@/components/common/AppSection";
import courseService from "@/services/courseService";
import { 
  CourseDetailHeader, 
  CourseDetailVideo, 
  CourseDetailOutcomes, 
  CourseDetailCurriculum, 
  CourseDetailInstructor, 
  CourseDetailPricingCard 
} from "@/components/common/CourseDetailComponents";

export default function CourseDetail() {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseBySlug(slug);
        
        // Kiểm tra nếu khóa học bị ẩn (status != 1)
        if (data.status !== 1) {
            navigate("/404");
            return;
        }

        // Lọc modules và lessons có status = 1 (Hoạt động)
        const activeModules = (data.modules || [])
          .filter(m => m.status === 1)
          .map(m => ({
            ...m,
            lessons: (m.lessons || []).filter(l => l.status === 1)
          }))
          .filter(m => m.lessons.length > 0); // Chỉ giữ lại chương có bài học

        setCourse({
            ...data,
            modules: activeModules
        });
      } catch (err) {
        console.error("Lỗi lấy chi tiết khóa học:", err);
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (!course) return null;

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khoá học", href: "/courses" },
    { label: course.category?.name || "Chi tiết", isLast: true },
  ];

  return (
    <div className="bg-background min-h-screen pb-24">
      <div className="app-container pt-8 md:pt-12">
        <div className="mb-6">
          <AppBreadcrumb
            items={breadcrumbItems}
            linkClassName="text-slate-500 hover:text-primary transition-colors"
            activeClassName="font-bold text-slate-800"
            separatorClassName="text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
          <div className="lg:col-span-8 flex flex-col gap-10">
            <CourseDetailHeader course={course} />
            
            <CourseDetailVideo 
              courseImage={course.thumbnail} 
              courseTitle={course.title} 
              promoVideo={course.promoVideo}
            />

            <CourseDetailOutcomes course={course} />

            <CourseDetailCurriculum curriculum={course.modules || []} />

            <Separator className="bg-slate-200/60" />

            <CourseDetailInstructor instructor={{
                name: course.instructorName || "Giảng viên",
                avatar: course.instructorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
                role: "Chuyên gia đào tạo",
                bio: "Giảng viên giàu kinh nghiệm trong lĩnh vực công nghệ thông tin và phát triển phần mềm.",
                reviewsCount: 120,
                studentsCount: 1250,
                coursesCount: 5
            }} />
          </div>

          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 mb-12 lg:mb-0">
              <CourseDetailPricingCard course={course} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

