import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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

export default function MainHeroCarousel({ onBgChange }) {
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
    <div className="app-container py-0 md:py-6 relative z-10">
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
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
