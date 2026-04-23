import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumb } from "@/components/common/AppSection";
import courseService from "@/services/courseService";
import wishlistService from "@/services/wishlistService";
import axios from "axios";
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
  const [instructorProfile, setInstructorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseBySlug(slug);
        
        // Map backend model to frontend structure
        const formattedCourse = {
          id: data.id,
          category: data.categoryName || "Chưa phân loại",
          title: data.title,
          promoVideo: data.promoVideo,
          image: data.thumbnail,
          thumbnail: data.thumbnail, // Added thumbnail for consistency
          description: data.description ? data.description.replace(/&nbsp;/g, ' ') : "Chưa có mô tả chi tiết.",
          price: data.price || 0,
          salePrice: data.salePrice || data.price || 0,
          originalPrice: data.price || 0,
          discountPercentage: data.discount || 0,
          discount: data.discount || 0,
          rating: 5.0,
          reviews: 0,
          isEnrolled: data.isEnrolled || false,
          isFavourite: false, // Default
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

        // Check if favorite
        try {
          const wishRes = await wishlistService.checkWishlist(data.id);
          if (wishRes.success) {
            formattedCourse.isFavourite = wishRes.data.isFavourite;
          }
        } catch (e) {
          console.warn("Could not check wishlist status");
        }

        setCourse(formattedCourse);

        // Fetch instructor profile nếu có instructorId
        if (data.instructorId) {
          try {
            const profileRes = await axios.get(`http://localhost:8080/api/instructors/${data.instructorId}/profile`);
            setInstructorProfile(profileRes.data);
          } catch (profileErr) {
            console.warn("Không thể tải thông tin giảng viên:", profileErr);
          }
        }
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

  // Build instructor data: ưu tiên dữ liệu từ API profile, fallback về course data
  const instructorData = {
    name: instructorProfile?.name || course.instructor?.name || "Giảng viên",
    avatar: instructorProfile?.avatar || course.instructor?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
    role: "Chuyên gia đào tạo",
    bio: `Giảng viên tại Gnostica với ${instructorProfile?.coursesCount || 1} khóa học và ${instructorProfile?.studentsCount || 0} học viên đã đăng ký.`,
    reviewsCount: instructorProfile?.reviewsCount || 0,
    studentsCount: instructorProfile?.studentsCount || 0,
    coursesCount: instructorProfile?.coursesCount || 1,
  };

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

            <CourseDetailCurriculum curriculum={course.curriculum || []} />

            <Separator className="bg-slate-200/60" />

            <CourseDetailInstructor instructor={instructorData} />
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

