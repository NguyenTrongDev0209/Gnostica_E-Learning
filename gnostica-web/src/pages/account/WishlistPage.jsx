import React from "react";
import { Link } from "react-router-dom";
import CourseCard from "@/components/common/composite/CourseCard";
import { Heart } from "lucide-react";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import useWishlist from "@/hooks/account/useWishlist";
import { AppButton } from "@/components/common/micro/AppButton";
import AppSkeleton from "@/components/common/micro/AppSkeleton";

export default function Wishlist() {
  const { courses, loading, handleToggleWishlist } = useWishlist();

  return (
    <div>
      {/* Breadcrumb */}
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Danh sách yêu thích" }]} />

      <AppPageHeader
        iconNode={<Heart className="w-7 h-7 text-error fill-red-100/50" />}
        title="Danh sách yêu thích"
        description={loading ? "Đang tải..." : `Bạn đã lưu lại ${courses.length} khóa học vào danh sách quan tâm.`}
      />

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <AppSkeleton className="aspect-video w-full rounded-xl" />
              <AppSkeleton className="h-6 w-3/4" />
              <AppSkeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="relative group">
              <CourseCard {...course} link={`/course/${course.slug}`} />

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
            <AppButton appVariant="ghostMuted" variant="ghost" className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
              Khám phám khóa học mới
            </AppButton>
          </Link>
        </div>
      )}
    </div>
  );
}
