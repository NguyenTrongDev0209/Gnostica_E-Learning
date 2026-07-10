import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const subBanners = [
  { img: "/banner_small1.webp", alt: "Sub banner khuyến mãi 1" },
  { img: "/banner_small2.webp", alt: "Sub banner khuyến mãi 2" },
  { img: "/banner_small3.webp", alt: "Sub banner khuyến mãi 3" },
  { img: "/banner_small4.webp", alt: "Sub banner khuyến mãi 4" },
];

export default function SubBannerCarousel() {
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
