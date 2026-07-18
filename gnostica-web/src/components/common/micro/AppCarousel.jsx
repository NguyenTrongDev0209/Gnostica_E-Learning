import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

/**
 * AppCarousel - Wrapper cho Carousel với hệ thống Gnostica
 * @param {Array} items - Mảng dữ liệu các item
 * @param {Function} renderItem - Hàm render cho mỗi item (nhận item, index, và trạng thái isActive)
 * @param {Object} opts - Cấu hình thêm cho embla carousel (ví dụ: { loop: true })
 * @param {string} className - Class name cho Carousel container
 * @param {string} contentClassName - Class name cho CarouselContent
 * @param {string} itemClassName - Class name cho mỗi CarouselItem
 * @param {boolean} hideControls - Ẩn nút prev/next
 * @param {boolean} showIndicators - Hiển thị các chấm chuyển slide (dots) ở dưới cùng
 * @param {string} variant - "default" | "hero" | "sub-banner" | "centered-focus"
 * @param {Function} onSelect - Callback trả về index của slide đang active
 */
export default function AppCarousel({
  items = [],
  renderItem,
  opts = { loop: true },
  className,
  contentClassName,
  itemClassName,
  hideControls = false,
  showIndicators = false,
  variant = "default",
  onSelect,
  ...props
}) {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrentIndex(api.selectedScrollSnap());
    if (onSelect) {
      onSelect(api.selectedScrollSnap());
    }

    api.on("select", () => {
      const index = api.selectedScrollSnap();
      setCurrentIndex(index);
      if (onSelect) {
        onSelect(index);
      }
    });
  }, [api, onSelect]);

  // Cấu hình dựa trên variant
  let finalOpts = { ...opts };
  let finalItemClassName = itemClassName;
  let finalContentClassName = contentClassName;
  let finalShowIndicators = showIndicators;
  
  if (variant === "centered-focus") {
    finalOpts = { align: "center", loop: true, skipSnaps: false, ...opts };
    finalItemClassName = cn("pl-3 md:pl-4 basis-[70%] sm:basis-[40%] lg:basis-[25%] px-2", itemClassName);
    finalContentClassName = cn("-ml-3 md:-ml-4 py-8 md:py-16 items-stretch", contentClassName);
  } else if (variant === "hero") {
    finalOpts = { loop: true, ...opts };
    finalItemClassName = cn("w-full", itemClassName);
    finalShowIndicators = showIndicators !== undefined ? showIndicators : true; // Mặc định hiện indicators cho hero
  } else if (variant === "sub-banner") {
    finalOpts = {
      align: "start",
      loop: true,
      slidesToScroll: 1,
      breakpoints: {
        "(min-width: 768px)": { slidesToScroll: 2 },
      },
      ...opts
    };
    finalItemClassName = cn("pl-2 md:pl-4 basis-full md:basis-1/2", itemClassName);
    finalContentClassName = cn("-ml-2 md:-ml-4", contentClassName);
  }

  return (
    <Carousel
      setApi={setApi}
      opts={finalOpts}
      className={cn("w-full relative z-10", className)}
      {...props}
    >
      <CarouselContent className={finalContentClassName}>
        {items.map((item, index) => {
          const isActive = currentIndex === index;

          return (
            <CarouselItem key={index} className={finalItemClassName}>
              {variant === "centered-focus" ? (
                <div
                  className={cn(
                    "h-full transition-all duration-700 ease-in-out origin-center flex flex-col",
                    isActive
                      ? "scale-105 md:scale-110 z-30 opacity-100 ring-2 ring-primary/20 rounded-xl shadow-xl"
                      : "scale-90 md:scale-95 z-10 opacity-50 blur-[0.5px] hover:opacity-100"
                  )}
                >
                  {renderItem ? renderItem(item, index, isActive) : item}
                </div>
              ) : (
                renderItem ? renderItem(item, index, isActive) : item
              )}
            </CarouselItem>

          );
        })}
      </CarouselContent>
      
      {!hideControls && (
        <>
          <CarouselPrevious className={cn(
            "hidden md:flex glass hover:bg-background transition-transform active:scale-110 active:-translate-y-1/2 z-40",
            variant === "centered-focus" ? "-left-4 lg:-left-6 w-12 h-12 shadow-xl hover:scale-110" :
            variant === "sub-banner" ? "-left-4 lg:-left-6" :
            variant === "hero" ? "left-4" : "left-2"
          )} />
          <CarouselNext className={cn(
            "hidden md:flex glass hover:bg-background transition-transform active:scale-110 active:-translate-y-1/2 z-40",
            variant === "centered-focus" ? "-right-4 lg:-right-6 w-12 h-12 shadow-xl hover:scale-110" :
            variant === "sub-banner" ? "-right-4 lg:-right-6" :
            variant === "hero" ? "right-4" : "right-2"
          )} />
        </>
      )}

      {finalShowIndicators && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10 z-20">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "transition-all duration-300 rounded-full",
                currentIndex === index
                  ? "w-4 h-1.5 md:w-6 md:h-2 bg-white"
                  : "w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Carousel>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious };
