import React, { Suspense, useState, useEffect } from "react";
import * as LucideIcons from 'lucide-react';
import { Users, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

import PageContainer from "@/components/common/core/PageContainer";
import CourseCard from "@/components/common/composite/CourseCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/common/micro/AppCarousel";
import { Card } from '@/components/common/micro/AppCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/common/micro/AppAccordion";
import Skeleton from '@/components/common/micro/AppSkeleton';
import { Button } from '@/components/common/micro/AppButton';

import useCategories from '@/hooks/course/useCategories';
import useFeaturedCourses from "@/hooks/course/useFeaturedCourses";
import useRecommendedCourses from '@/hooks/course/useRecommendedCourses';
import useHomeData from '@/hooks/home/useHomeData';

// --- DATA CONSTANTS ---

const slides = [
  { img: "/banner1.webp", alt: "Banner khuyến mãi 1" },
  { img: "/banner2.webp", alt: "Banner khuyến mãi 2" },
];

const subBanners = [
  { img: "/banner_small1.webp", alt: "Sub banner khuyến mãi 1" },
  { img: "/banner_small2.webp", alt: "Sub banner khuyến mãi 2" },
  { img: "/banner_small3.webp", alt: "Sub banner khuyến mãi 3" },
  { img: "/banner_small4.webp", alt: "Sub banner khuyến mãi 4" },
];

const defaultColors = [
  "bg-primary/10 text-primary",
  "bg-info/10 text-info",
  "bg-warning/10 text-warning",
  "bg-success/10 text-success",
  "bg-error/10 text-error"
];

const faqs = [
  {
    question: "Gnostica là gì?",
    answer: "Gnostica là nền tảng học tập trực tuyến thông minh, cung cấp các khóa học đa dạng từ công nghệ, kinh doanh đến kỹ năng mềm, giúp bạn phát triển sự nghiệp một cách toàn diện."
  },
  {
    question: "Làm thế nào để tôi có thể học trên Gnostica?",
    answer: "Bạn chỉ cần đăng ký tài khoản, lựa chọn khóa học phù hợp và tiến hành thanh toán. Sau đó, bạn có thể bắt đầu học ngay lập tức trên mọi thiết bị."
  },
  {
    question: "Gnostica có cấp chứng chỉ sau khóa học không?",
    answer: "Có, sau khi hoàn thành đầy đủ các bài học và bài kiểm tra của khóa học, bạn sẽ nhận được chứng chỉ điện tử có giá trị khẳng định kỹ năng của mình."
  },
  {
    question: "Tôi có thể học trên điện thoại di động được không?",
    answer: "Hoàn toàn được. Gnostica hỗ trợ học tập trên cả trình duyệt máy tính, điện thoại di động và ứng dụng dành riêng cho Android/iOS."
  },
  {
    question: "Làm sao để tôi nhận được sự hỗ trợ khi gặp khó khăn?",
    answer: "Bạn có thể đặt câu hỏi trực tiếp trong phần Thảo luận của khóa học để giảng viên và cộng đồng hỗ trợ, hoặc liên hệ với đội ngũ CSKH qua email và hotline."
  }
];

// --- COMPONENTS ---

function MainHeroCarousel() {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="app-container py-0 md:py-6 relative z-10 w-full overflow-hidden">
      <Carousel setApi={setApi} className="w-full relative">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="w-full">
              {/* Box chứa ảnh giữ nguyên tỷ lệ */}
              <div className="relative w-full aspect-[25/9] md:aspect-[4/1] flex items-center justify-center">
                <img
                  src={slide.img}
                  alt={slide.alt}
                  className="w-full h-full object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex left-4 bg-background/80 backdrop-blur-sm border-border" />
        <CarouselNext className="hidden md:flex right-4 bg-background/80 backdrop-blur-sm border-border" />

        <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-foreground/20 backdrop-blur-md rounded-full border border-foreground/10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`transition-all duration-300 rounded-full ${currentIndex === index
                ? "w-4 h-1 md:w-5 md:h-1 bg-background"
                : "w-1.5 h-1.5 md:w-1.5 md:h-1.5 bg-background/50 hover:bg-background/80"
                }`}
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}

const PlatformStats = () => {
  const { stats, loadingStats } = useHomeData();

  if (loadingStats) {
    return (
      <div className="app-container mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) return null;

  return (
    <div className="app-container mb-12 -mt-4 relative z-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = LucideIcons[stat.iconName] || LucideIcons.Users;
          return (
            <div
              key={idx}
              className="group relative flex flex-col items-center justify-center rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-primary/40 transition-all duration-500 overflow-hidden"
            >
              {/* Subtle background gradient that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md transition-all duration-500">
                  <Icon className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-3xl md:text-4xl font-black text-foreground tracking-tight drop-shadow-sm">
                    {stat.value}
                  </span>
                  <span className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function SubBannerCarousel() {
  return (
    <div className="w-full px-2 md:px-0 mt-3 md:mt-0 mb-6 md:mb-0 block">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
          breakpoints: {
            "(min-width: 768px)": {
              slidesToScroll: 2,
            },
          },
        }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {subBanners.map((banner, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2">
              <div className="w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={banner.img}
                  alt={banner.alt}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x180?text=Khuyen+Mai";
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Nút điều hướng - Ẩn trên mobile, hiện trên md trở lên */}
        <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 bg-background/90 shadow text-foreground hover:bg-background z-10 border-border" />
        <CarouselNext className="hidden md:flex -right-4 lg:-right-6 bg-background/90 shadow text-foreground hover:bg-background z-10 border-border" />
      </Carousel>
    </div>
  );
}

const RecommendedCourses = () => {
  const { courses, loading, user } = useRecommendedCourses(4);

  if (!user || (!loading && courses.length === 0)) return null;

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Dành riêng cho bạn</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              image={course.thumbnail}
              title={course.title}
              category={course.categoryName}
              students={course.students}
              price={course.salePrice?.toLocaleString()}
              originalPrice={course.discount > 0 ? course.price?.toLocaleString() : null}
              discountPercentage={course.discount}
              instructor={{
                name: course.instructorName,
                avatar: course.instructorAvatar,
                status: "online"
              }}
              link={`/courses/${course.slug}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const CategoryGrid = () => {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 w-full bg-muted animate-pulse rounded-2xl border" />
        ))}
      </div>
    );
  }

  // Lấy 4 danh mục đầu tiên
  const displayCategories = categories.slice(0, 4);

  if (displayCategories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {displayCategories.map((cat, idx) => {
        // Fallback icon 'Code'
        const Icon = LucideIcons[cat.iconName || 'Code'] || LucideIcons.Code;
        const colorClass = cat.colorClass || defaultColors[idx % defaultColors.length];

        return (
          <Card key={cat.id || idx} className="group relative overflow-hidden p-6 w-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{cat.name || cat.title}</h3>
            <p className="text-sm text-muted-foreground">{cat.coursesCount || Math.floor(Math.random() * 50) + 10} khóa học</p>
          </Card>
        );
      })}
    </div>
  );
};

const FeaturedCourses = () => {
  const { courses, loading } = useFeaturedCourses(8);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full h-80 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="w-full text-center py-12 text-muted-foreground">
        Chưa có khóa học nào được hiển thị.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center w-full">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          category={course.categoryName}
          rating={4.8} // Default rating for now
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
        />
      ))}
    </div>
  );
};

const InstructorGrid = () => {
  const { instructors, loadingInstructors } = useHomeData();

  if (loadingInstructors) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center p-6 text-center w-full h-64 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {instructors.map((instructor, idx) => (
        <Card key={idx} className="flex flex-col items-center p-6 text-center w-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
          <img src={instructor.avatar} alt={instructor.name} className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-background shadow-sm" />
          <h3 className="font-bold text-lg">{instructor.name}</h3>
          <p className="text-primary text-sm font-medium mb-3">{instructor.role}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground w-full justify-center border-t pt-3 mt-auto">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{instructor.students} hb</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{instructor.courses} khóa</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const OutcomeBanner = () => {
  return (
    <div className="w-full mt-12 bg-foreground rounded-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-10 relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>

      {/* Left Content */}
      <div className="flex flex-col gap-3 z-10 max-w-lg text-center md:text-left mb-6 md:mb-0">
        <h2 className="text-2xl md:text-3xl font-bold text-background leading-tight">
          95% học viên đạt được mục tiêu nghề nghiệp
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Học viên ghi nhận những cơ hội việc làm mới và kiến thức chuyên môn được nâng cao rõ rệt sau khóa học tại Gnostica.
        </p>
        <div className="mt-2">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-background font-bold hover:text-primary transition-all text-sm md:text-base group"
          >
            Khám phá lộ trình học tập
            <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
      </div>

      {/* Right Graphic */}
      <div className="relative flex items-center justify-center">
        <div className="relative w-36 h-36 md:w-44 md:h-44">
          {/* SVG Graphic */}
          <svg className="w-full h-full transform -rotate-90">
            {/* Outer Glow Ring */}
            <circle
              cx="50%"
              cy="50%"
              r="42%"
              fill="transparent"
              className="stroke-primary/10"
              strokeWidth="1"
            />
            {/* Main Progress Background */}
            <circle
              cx="50%"
              cy="50%"
              r="32%"
              className="fill-background/10 stroke-background/5"
              strokeWidth="10"
            />
            {/* Progress Line */}
            <circle
              cx="50%"
              cy="50%"
              r="32%"
              fill="transparent"
              stroke="url(#banner-gradient)"
              strokeWidth="10"
              strokeDasharray="201"
              strokeDashoffset="10"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="banner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-primary" stopColor="currentColor" />
                <stop offset="100%" className="text-success" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl md:text-3xl font-black text-background">95%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function CardCarousel() {
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
              <CarouselItem key={`${course.id}-${index}`} className="pl-3 md:pl-4 basis-3/4 sm:basis-2/5 lg:basis-1/4 px-2">
                <div
                  className={`h-full transition-all duration-700 ease-in-out origin-center flex flex-col ${isActive
                    ? "scale-105 md:scale-110 z-30 opacity-100 ring-2 ring-primary/20 rounded-xl shadow-xl"
                    : "scale-90 md:scale-95 z-10 opacity-50 blur-sm transition-opacity hover:opacity-100"
                    }`}
                >
                  <CourseCard
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
        <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 bg-background shadow-xl text-foreground hover:bg-muted hover:scale-110 transition-transform z-40 w-12 h-12 border-border" />
        <CarouselNext className="hidden md:flex -right-4 lg:-right-6 bg-background shadow-xl text-foreground hover:bg-muted hover:scale-110 transition-transform z-40 w-12 h-12 border-border" />
      </Carousel>
    </div>
  );
}

const FAQSection = () => {
  return (
    <div className="w-full text-left">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-b border-border py-1 last:border-0">
            <AccordionTrigger className="text-left font-bold text-lg text-foreground hover:text-primary transition-colors hover:no-underline py-5">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-6">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

function HomePage() {

  return (
    <PageContainer>
      <PageContainer.Content disableContainer={true} className="flex flex-col gap-12 sm:gap-16 pb-12 relative z-10 w-full overflow-hidden pt-0 md:pt-0">
        <MainHeroCarousel />

        <PlatformStats />

        <div className="app-container">
          <SubBannerCarousel />
        </div>

        <div className="app-container">
          <RecommendedCourses />
        </div>

        <PageContainer.Section title="Danh mục nổi bật" className="w-full app-container">
          <CategoryGrid />
        </PageContainer.Section>

        <PageContainer.Section title="Khóa học thịnh hành" className="w-full app-container">
          <FeaturedCourses />
        </PageContainer.Section>

        <PageContainer.Section title="Giảng viên tiêu biểu" className="w-full app-container">
          <InstructorGrid />
          <OutcomeBanner />
        </PageContainer.Section>

        <PageContainer.Section title="Khóa học nổi bật" className="w-full app-container">
          <CardCarousel />
        </PageContainer.Section>

        <PageContainer.Section title="Câu hỏi thường gặp" className="w-full app-container">
          <FAQSection />
        </PageContainer.Section>

      </PageContainer.Content>
    </PageContainer>
  )
}

export default HomePage;
