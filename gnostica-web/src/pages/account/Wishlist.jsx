import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppCard from "@/components/common/AppCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Heart, Loader2 } from "lucide-react";
import wishlistService from "@/services/wishlistService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function Wishlist() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistService.getMyWishlist();
      if (res.success) {
        // Map backend Course model to AppCard expected props
        const formattedCourses = res.data.map(course => ({
          id: course.id,
          category: course.category?.name || "Chưa phân loại",
          rating: 5.0,
          title: course.title,
          classes: course.classes || 0,
          students: course.students || 0,
          price: course.salePrice?.toLocaleString("vi-VN") || "0",
          originalPrice: course.price?.toLocaleString("vi-VN") || "0",
          discountPercentage: course.discount || 0,
          image: course.thumbnail,
          slug: course.slug,
          instructor: {
            name: course.account?.fullName || "Ẩn danh",
            avatar: course.account?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
          }
        }));
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (courseId) => {
    try {
      const res = await wishlistService.toggleWishlist(courseId);
      if (res.success) {
        toast.success(res.data.message);
        // Remove from local state
        setCourses(prev => prev.filter(c => c.id !== courseId));
      }
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

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
            <BreadcrumbPage className="text-sm font-semibold">Danh sách yêu thích</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-3">
            <Heart className="w-7 h-7 text-error fill-red-100/50" />
            Danh sách yêu thích
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Đang tải..." : `Bạn đã lưu lại ${courses.length} khóa học vào danh sách quan tâm.`}
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="relative group">
              <Link to={`/course/${course.slug}`}>
                <AppCard {...course} />
              </Link>
              
              {/* Overlay Delete Button - appears on hover */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleWishlist(course.id);
                  }}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 group/btn transition-colors"
                  aria-label="Bỏ yêu thích"
                >
                  <Heart className="w-5 h-5 text-error fill-red-500 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted rounded-2xl border border-dashed border-border">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Chưa có khóa học nào</h3>
          <p className="text-muted-foreground mb-6">Bạn chưa lưu khóa học nào vào danh sách yêu thích.</p>
          <Link to="/courses">
            <button className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
              Khám phám khóa học mới
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
