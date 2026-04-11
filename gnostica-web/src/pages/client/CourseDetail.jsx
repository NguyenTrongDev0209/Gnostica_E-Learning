import React from "react";
import { useParams } from "react-router-dom";
import { Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumb } from "@/components/common/AppSection";
import { getCourseDetailById } from "@/mocks/courses";
import { 
  CourseDetailHeader, 
  CourseDetailVideo, 
  CourseDetailOutcomes, 
  CourseDetailCurriculum, 
  CourseDetailInstructor, 
  CourseDetailPricingCard 
} from "@/components/pages/client/courseDetail/CourseDetailComponents";

export default function CourseDetail() {
  const { id } = useParams();
  const course = getCourseDetailById(id || "1");

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

