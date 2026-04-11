import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import AppCard from "@/components/common/AppCard";
import AppSection from "@/components/common/AppSection";
import { featuredCoursesMock } from "@/mocks/courses";

// Dữ liệu slide kèm theo class màu gradient riêng cho từng ảnh
const slides = [
  {
    img: "/banner1.webp",
    alt: "Banner khuyến mãi 1",
    // Ví dụ: màu xanh biển / cam tuỳ ý bạn, ở đây tôi chọn xanh cho tĩnh lặng
    bgConfig: "from-blue-100 via-blue-50 to-white dark:from-blue-900/20 dark:via-blue-900/10 dark:to-background"
  },
  {
    img: "/banner2.webp",
    alt: "Banner khuyến mãi 2",
    // Ví dụ: màu đỏ/cam cho sôi động 
    bgConfig: "from-orange-100 via-orange-50 to-white dark:from-orange-900/20 dark:via-orange-900/10 dark:to-background"
  },
];

const subBanners = [
  { img: "/banner_small1.webp", alt: "Sub banner khuyến mãi 1" },
  { img: "/banner_small2.webp", alt: "Sub banner khuyến mãi 2" },
  { img: "/banner_small3.webp", alt: "Sub banner khuyến mãi 3" },
  { img: "/banner_small4.webp", alt: "Sub banner khuyến mãi 4" },
];

export function SubBannerCarousel() {
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
              <div className="w-full rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
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
        <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 bg-white/90 shadow text-neutral-800 hover:bg-white z-10" />
        <CarouselNext className="hidden md:flex -right-4 lg:-right-6 bg-white/90 shadow text-neutral-800 hover:bg-white z-10" />
      </Carousel>
    </div>
  );
}

export function MainHeroCarousel({ onBgChange }) {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lắng nghe sự kiện chuyển slide của shadcn carousel
  useEffect(() => {
    if (!api) return;

    // Cập nhật index ban đầu
    setCurrentIndex(api.selectedScrollSnap());

    // Gửi màu nền của slide đầu tiên ngay khi render
    if (onBgChange) {
      onBgChange(slides[api.selectedScrollSnap()]?.bgConfig);
    }

    api.on("select", () => {
      const index = api.selectedScrollSnap();
      setCurrentIndex(index);
      if (onBgChange) {
        onBgChange(slides[index]?.bgConfig);
      }
    });
  }, [api, onBgChange]);

  return (
    <div className="w-full md:container md:mx-auto py-0 md:py-6 relative z-10">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="w-full">
              {/* Box chứa ảnh giữ nguyên tỷ lệ */}
              <div className="relative w-full aspect-[1240/285] flex items-center justify-center">
                <img
                  src={slide.img}
                  alt={slide.alt}
                  className="w-full h-full object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex left-4 bg-white/80 backdrop-blur-sm" />
        <CarouselNext className="hidden md:flex right-4 bg-white/80 backdrop-blur-sm" />

        <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`transition-all duration-300 rounded-full ${currentIndex === index
                ? "w-4 h-1.5 md:w-6 md:h-2 bg-white"
                : "w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 hover:bg-white/80"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}

export function CardCarousel() {
  const [api, setApi] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    setActiveIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

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
          {[...featuredCoursesMock, ...featuredCoursesMock].map((card, index) => {
            const isActive = activeIndex === index;

            return (
              <CarouselItem key={`${card.id}-${index}`} className="pl-3 md:pl-4 basis-[70%] sm:basis-[40%] lg:basis-[25%] px-2">
                <div
                  className={`h-full transition-all duration-700 ease-in-out origin-center flex flex-col ${isActive
                    ? "scale-105 md:scale-110 z-30 opacity-100 ring-2 ring-primary/20 rounded-xl shadow-xl"
                    : "scale-90 md:scale-95 z-10 opacity-50 blur-[0.5px] transition-opacity hover:opacity-100"
                    }`}
                >
                  <AppCard {...card} className="flex-1" />
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

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    role: "CEO, Tech Corp",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5,
    text: "Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type."
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Marketing Director",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 4,
    text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
  },
  {
    id: 3,
    name: "Alice Johnson",
    role: "Freelancer",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form."
  },
  {
    id: 4,
    name: "Robert Fox",
    role: "Executive Manager",
    avatar: "https://i.pravatar.cc/150?img=8",
    rating: 4,
    text: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature."
  },
  {
    id: 5,
    name: "Emily Davis",
    role: "Designer",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    text: "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested, very high quality work."
  }
];

export function TestimonialCarousel() {
  const [api, setApi] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    setActiveIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const titleNode = (
    <span>
      What <span className="text-orange-500">Clients</span> Say!
    </span>
  );

  return (
    <AppSection
      title={titleNode}
      description="See How Our Digital Marketing Agency Helped Clients Achieve Their Goals"
      centered={true}
      className="py-8 md:py-12 bg-slate-50/50 dark:bg-transparent"
      containerClassName="relative w-full px-2 md:px-12 pt-4"
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-4 items-center py-4 md:py-8">
          {testimonials.map((testimonial, index) => {
            const isActive = activeIndex === index;

            return (
              <CarouselItem key={testimonial.id} className="pl-4 basis-[85%] sm:basis-[60%] lg:basis-[33.33%]">
                <div
                  className={`transition-all duration-700 ease-in-out ${isActive
                    ? "scale-105 md:scale-110 opacity-100 z-30"
                    : "scale-90 opacity-40 hover:opacity-75 z-10 blur-[1px] hover:blur-none cursor-pointer"
                    }`}
                >
                  <Card className={`overflow-hidden border-none rounded-2xl transition-all duration-500 ${isActive ? 'shadow-2xl shadow-orange-500/10 bg-white dark:bg-neutral-800' : 'shadow bg-neutral-100/80 dark:bg-neutral-900/50'}`}>
                    <CardContent className="p-6 md:p-8 flex flex-col gap-5">
                      {/* Thông tin khách hàng (Avatar + Name) */}
                      <div className="flex items-center gap-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <h4 className={`text-base font-bold mb-0.5 ${isActive ? 'text-orange-500' : 'text-neutral-800 dark:text-neutral-200'}`}>
                            {testimonial.name}
                          </h4>
                          <p className="text-xs text-neutral-500">{testimonial.role}</p>
                        </div>
                      </div>

                      <p className="text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed italic min-h-[80px]">
                        "{testimonial.text}"
                      </p>

                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            strokeWidth={i < testimonial.rating ? 0 : 2}
                            className={i < testimonial.rating ? "fill-orange-400 text-orange-400" : "text-neutral-300"}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex -left-2 lg:left-4 bg-white shadow-xl border-none hover:bg-orange-50 hover:text-orange-500 hover:scale-110 transition-all w-12 h-12 z-40 text-neutral-400" />
        <CarouselNext className="hidden md:flex -right-2 lg:right-4 bg-white shadow-xl border-none hover:bg-orange-50 hover:text-orange-500 hover:scale-110 transition-all w-12 h-12 z-40 text-neutral-400" />
      </Carousel>
    </AppSection>
  );
}