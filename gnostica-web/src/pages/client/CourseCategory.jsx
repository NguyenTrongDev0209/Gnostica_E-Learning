import React from "react";
import { useParams } from "react-router-dom";
import AppCard from "@/components/common/AppCard";
import AppSection, { PageHeader, AppBreadcrumb } from "@/components/common/AppSection";
import { Home } from "lucide-react";

const popularCourses = [
  {
    id: 1,
    category: "Phổ biến",
    rating: 5.0,
    title: "Khóa học Web Development nâng cao",
    classes: 45,
    students: 2100,
    price: "1.299.000",
    originalPrice: "2.599.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop",
    instructor: {
      name: "Trần Anh Quân",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
    }
  },
  {
    id: 2,
    category: "Phổ biến",
    rating: 4.8,
    title: "Mastering UI/UX Design với Figma",
    classes: 30,
    students: 1540,
    price: "899.000",
    originalPrice: "1.799.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=600&auto=format&fit=crop",
    instructor: {
      name: "Nguyễn Thu Hà",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    }
  },
  {
    id: 3,
    category: "Phổ biến",
    rating: 4.9,
    title: "Data Science & Machine Learning cơ bản",
    classes: 52,
    students: 3100,
    price: "1.599.000",
    originalPrice: "3.199.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
    instructor: {
      name: "Lê Minh Tâm",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
    }
  },
  {
    id: 4,
    category: "Phổ biến",
    rating: 4.7,
    title: "Lập trình Di động với React Native",
    classes: 40,
    students: 1200,
    price: "999.000",
    originalPrice: "1.999.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop",
    instructor: {
      name: "Phạm Hồng Việt",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    }
  }
];

export default function CourseCategory() {
  const { categoryName } = useParams();

  const displayTitle = categoryName
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || "Danh mục";

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khoá học", href: "/courses" },
    { label: displayTitle, isLast: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="app-container py-8 md:py-0 pb-0">
        <AppBreadcrumb items={breadcrumbItems} />

        <PageHeader
          title="Danh mục"
          highlightedTitle={displayTitle}
        />
      </div>

      {/* Phổ biến Section using AppSection component */}
      <AppSection
        title="Phổ biến"
        description={`Những khóa học được học viên yêu thích nhất trong danh mục ${displayTitle}`}
        className="py-0"
      >
        {popularCourses.map((course) => (
          <AppCard key={course.id} {...course} />
        ))}
      </AppSection>
    </div>
  );
}
