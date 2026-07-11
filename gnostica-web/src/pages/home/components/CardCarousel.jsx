import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import AppCard from "@/components/common/composite/AppCard";
import useFeaturedCourses from "@/hooks/course/useFeaturedCourses";

export default function CardCarousel() {
  const [api, setApi] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { courses, loading } = useFeaturedCourses(10);

  useEffect(() => {
    if (!api) return;

    setActiveIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  if (loading) {
    return <div className="app-container h-64 flex items-center justify-center">Đang tải slide khóa học...</div>;
  }

  if (courses.length === 0) return null;

  return (
    <div className="py-6 md:py-10 w-full relative">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
          skipSnaps: false,
        }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-3 md:-ml-4 py-8 md:py-16 items-stretch">
          {courses.map((course, index) => {
            const isActive = activeIndex === index;

            return (
              <CarouselItem key={`${course.id}-${index}`} className="pl-3 md:pl-4 basis-[70%] sm:basis-[40%] lg:basis-[25%] px-2">
                <div
                  className={`h-full transition-all duration-700 ease-in-out origin-center flex flex-col ${isActive
                    ? "scale-105 md:scale-110 z-30 opacity-100 ring-2 ring-primary/20 rounded-xl shadow-xl"
                    : "scale-90 md:scale-95 z-10 opacity-50 blur-[0.5px] transition-opacity hover:opacity-100"
                    }`}
                >
                  <AppCard
                    category={course.categoryName}
                    rating={4.8}
                    title={course.title}
                    classes={course.classes}
                    students={course.students}
                    price={new Intl.NumberFormat('vi-VN').format(course.finalPrice || course.price)}
                    originalPrice={course.discount > 0 ? new Intl.NumberFormat('vi-VN').format(course.price) : null}
                    discountPercentage={course.discount}
                    image={course.thumbnail}
                    instructor={{
                      name: course.instructorName,
                      avatar: course.instructorAvatar,
                      status: "online"
                    }}
                    link={`/courses/${course.slug}`}
                    className="flex-1"
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 bg-white shadow-xl text-neutral-800 hover:bg-neutral-50 hover:scale-110 transition-transform z-40 w-12 h-12 border-none" />
        <CarouselNext className="hidden md:flex -right-4 lg:-right-6 bg-white shadow-xl text-neutral-800 hover:bg-neutral-50 hover:scale-110 transition-transform z-40 w-12 h-12 border-none" />
      </Carousel>
    </div>
  );
}
