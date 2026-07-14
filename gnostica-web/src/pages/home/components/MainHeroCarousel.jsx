import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const slides = [
  { img: "/banner1.webp", alt: "Banner khuyến mãi 1" },
  { img: "/banner2.webp", alt: "Banner khuyến mãi 2" },
];

export default function MainHeroCarousel() {
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
                ? "w-4 h-1.5 md:w-6 md:h-2 bg-background"
                : "w-1.5 h-1.5 md:w-2 md:h-2 bg-background/50 hover:bg-background/80"
                }`}
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
