import React from "react";
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
import { Home, Heart } from "lucide-react";

// Mock Data for Wishlist
const WISHLIST_COURSES = [
  {
    id: 4,
    category: "Lập trình Web",
    rating: 4.8,
    title: "Node.js & Express API Development",
    classes: 60,
    students: 1540,
    price: "799.000",
    originalPrice: "1.599.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=600&auto=format&fit=crop",
    instructor: {
      name: "Nguyễn Văn A",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
    }
  },
  {
    id: 5,
    category: "Khoa học dữ liệu",
    rating: 5.0,
    title: "Python for Data Science & Machine Learning",
    classes: 120,
    students: 3100,
    price: "1.299.000",
    originalPrice: "2.599.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
    instructor: {
      name: "Trịnh Thảo",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
    }
  },
  {
    id: 6,
    category: "Thiết kế Đồ họa",
    rating: 4.9,
    title: "Sáng tạo với Adobe Illustrator",
    classes: 45,
    students: 800,
    price: "699.000",
    originalPrice: "1.399.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop",
    instructor: {
      name: "Lê Minh Tâm",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    }
  }
];

export default function Wishlist() {
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
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Heart className="w-7 h-7 text-red-500 fill-red-100/50" />
            Danh sách yêu thích
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bạn đã lưu lại {WISHLIST_COURSES.length} khóa học vào danh sách quan tâm.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      {WISHLIST_COURSES.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {WISHLIST_COURSES.map((course) => (
            <div key={course.id} className="relative group">
              <AppCard {...course} />
              
              {/* Overlay Delete Button - appears on hover */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 group/btn transition-colors"
                  aria-label="Bỏ yêu thích"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có khóa học nào</h3>
          <p className="text-slate-500 mb-6">Bạn chưa lưu khóa học nào vào danh sách yêu thích.</p>
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
