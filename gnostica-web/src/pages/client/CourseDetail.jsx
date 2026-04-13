import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Home } from "lucide-react";
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
} from "@/components/pages/client/courseDetail/CourseDetailComponents";

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseBySlug(slug);
        
        // Map backend model to frontend structure
        const formattedCourse = {
          category: data.categoryName || "Chưa phân loại",
          title: data.title,
          image: data.thumbnail,
          description: data.description || "Chưa có mô tả chi tiết.",
          price: new Intl.NumberFormat('vi-VN').format(data.salePrice || data.price || 0),
          originalPrice: data.discount > 0 ? new Intl.NumberFormat('vi-VN').format(data.price) : null,
          discountPercentage: data.discount || 0,
          rating: 5.0,
          reviews: 0,
          students: data.students || 0,
          lastUpdated: "Mới đây",
          language: "Tiếng Việt",
          outcomes: [
            "Nắm vững các kiến thức cơ bản từ lý thuyết đến thực hành",
            "Tự tin áp dụng kỹ năng vào các dự án thực tế",
            "Nhận chứng chỉ chuyên môn sau khi hoàn thành",
            "Được tham gia cộng đồng hỗ trợ học tập"
          ],
          curriculum: data.modules ? data.modules.map(module => ({
            title: module.title,
            lessons: module.lessons ? module.lessons.map(lesson => ({
              title: lesson.title,
              duration: "00:00",
              preview: false
            })) : []
          })) : [],
          instructor: {
            name: data.instructorName || "Ẩn danh",
            avatar: data.instructorAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
            role: "Giảng viên",
            bio: "Giảng viên chia sẻ kiến thức chuyên sâu.",
            coursesCount: 1,
            studentsCount: data.students || 0,
            reviewsCount: 0,
            status: "online"
          }
        };

        setCourse(formattedCourse);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết khóa học:", err);
        setError("Không thể tải thông tin khóa học.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="bg-background min-h-screen pt-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{error || "Khóa học không tồn tại"}</h2>
        <a href="/courses" className="text-primary hover:underline font-medium">Quay lại danh sách khóa học</a>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khoá học", href: "/courses" },
    { label: course.category, isLast: true },
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
              courseImage={course.image} 
              courseTitle={course.title} 
            />

            <CourseDetailOutcomes outcomes={course.outcomes} />

            <CourseDetailCurriculum curriculum={course.curriculum} />

            <Separator className="bg-slate-200/60" />

            <CourseDetailInstructor instructor={course.instructor} />
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

