import React from "react";
import AppCarousel from "@/components/common/micro/AppCarousel";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { Star } from "lucide-react";
import PageContainer from "@/components/common/core/PageContainer";

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
  const titleNode = (
    <span>
      <span className="text-warning">Học viên</span> nói gì!
    </span>
  );

  return (
    <PageContainer.Section
      title={titleNode}
      description="Khám phá hành trình thay đổi của những học viên đã tin tưởng và đồng hành cùng Gnostica."
      className="py-8 md:py-12 bg-muted dark:bg-transparent items-center text-center"
    >
      <div className="relative w-full px-2 md:px-12 pt-4">
      <AppCarousel
        variant="centered-focus"
        items={testimonials}
        itemClassName="pl-4 basis-[85%] sm:basis-[60%] lg:basis-[33.33%]"
        contentClassName="-ml-4 items-center py-4 md:py-8"
        opts={{
          align: "center",
          loop: true,
        }}
        renderItem={(testimonial, index, isActive) => (
          <AppCard className={`overflow-hidden border-none rounded-2xl transition-all duration-500 h-full ${isActive ? 'shadow-2xl shadow-primary/10 bg-card' : 'shadow bg-muted'}`}>
            <AppCardContent className="p-6 md:p-8 flex flex-col gap-5 h-full">
              {/* Thông tin khách hàng (Avatar + Name) */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-background shadow-sm"
                />
                <div>
                  <h4 className={`text-base font-bold mb-0.5 ${isActive ? 'text-warning' : 'text-foreground'}`}>
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic min-h-[80px]">
                "{testimonial.text}"
              </p>

              <div className="flex gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    strokeWidth={i < testimonial.rating ? 0 : 2}
                    className={i < testimonial.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
            </AppCardContent>
          </AppCard>
        )}
      />
      </div>
    </PageContainer.Section>
  );
}
export default TestimonialCarousel;
