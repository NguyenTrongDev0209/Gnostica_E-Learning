import React from "react";
import AppCarousel from "@/components/common/micro/AppCarousel";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { Star } from "lucide-react";
import PageContainer from "@/components/common/core/PageContainer";

export function TestimonialCarousel({
  testimonials = [],
  description,
}) {
  if (testimonials.length === 0) return null;

  const titleNode = (
    <span>
      <span className="text-warning">Học viên</span> nói gì!
    </span>
  );

  return (
    <section className="w-full bg-muted dark:bg-transparent">
      <PageContainer.Section
        title={titleNode}
        description={description}
        className="app-container py-8 md:py-12 items-center text-center"
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
    </section>
  );
}
export default TestimonialCarousel;
