import React, { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import AppSection from "@/components/common/AppSection";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    role: "Lập trình viên Full-stack",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5,
    text: "Khóa học thực sự chất lượng, lộ trình bài bản giúp tôi nắm vững kiến thức chỉ trong thời gian ngắn. Rất đáng để đầu tư!"
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    role: "Quản lý Dự án IT",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 4,
    text: "Nền tảng học tập rất hiện đại, giao diện trực quan và dễ sử dụng. Tôi đánh giá cao sự hỗ trợ tận tình từ đội ngũ giảng viên."
  },
  {
    id: 3,
    name: "Lê Huỳnh Vũ",
    role: "Sinh viên Công nghệ",
    avatar: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    text: "Dữ liệu và bài tập thực tế giúp ích cho tôi rất nhiều trong việc chuẩn bị kiến thức cho kỳ thực tập quan trọng sắp tới."
  },
  {
    id: 4,
    name: "Phạm Minh Đức",
    role: "Kỹ sư Trí tuệ nhân tạo",
    avatar: "https://i.pravatar.cc/150?img=8",
    rating: 4,
    text: "Hệ thống cá nhân hóa của Gnostica thực sự khác biệt, nó giúp tôi tối ưu hóa thời gian học tập những phần mình còn yếu."
  },
  {
    id: 5,
    name: "Hoàng Mỹ Linh",
    role: "Nhà thiết kế Đồ họa",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    text: "Cách truyền đạt kiến thức rất dễ hiểu và sinh động. Tôi đã tự tin hơn hẳn khi nhận các dự án thiết kế phức tạp sau khóa học."
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
      <span className="text-warning">Học viên</span> nói gì!
    </span>
  );

  return (
    <AppSection
      title={titleNode}
      description="Khám phá hành trình thay đổi của những học viên đã tin tưởng và đồng hành cùng Gnostica."
      centered={true}
      className="py-8 md:py-12 bg-muted dark:bg-transparent"
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
                          <h4 className={`text-base font-bold mb-0.5 ${isActive ? 'text-warning' : 'text-neutral-800 dark:text-neutral-200'}`}>
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
                            className={i < testimonial.rating ? "fill-orange-400 text-warning" : "text-neutral-300"}
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

        <CarouselPrevious className="hidden md:flex -left-2 lg:left-4 bg-white shadow-xl border-none hover:bg-orange-50 hover:text-warning hover:scale-110 transition-all w-12 h-12 z-40 text-neutral-400" />
        <CarouselNext className="hidden md:flex -right-2 lg:right-4 bg-white shadow-xl border-none hover:bg-orange-50 hover:text-warning hover:scale-110 transition-all w-12 h-12 z-40 text-neutral-400" />
      </Carousel>
    </AppSection>
  );
}
export default TestimonialCarousel;
