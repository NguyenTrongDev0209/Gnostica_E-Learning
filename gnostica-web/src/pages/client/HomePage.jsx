import { MainHeroCarousel, SubBannerCarousel, CardCarousel, TestimonialCarousel } from "@/components/common/HomeCarousels"
import AppCard from "@/components/common/AppCard"
import AppSection from "@/components/common/AppSection"

function HomePage() {

  return (
    <div className={`min-h-[100dvh] transition-colors duration-700 ease-in-out bg-background`}>
      <div className="flex flex-col gap-4 sm:gap-8 pb-10 relative z-10 w-full overflow-hidden">
        <MainHeroCarousel />

        <div className="app-container">
          <SubBannerCarousel />
        </div>

        <AppSection title="Khóa học thịnh hành">
          <AppCard
            price="432.000"
            originalPrice="864.000"
            discountPercentage={50}
          />
          <AppCard
            category="Web Development"
            rating={5.0}
            title="Fullstack Next.js Masterclass"
            classes={32}
            students={1200}
            price="21.599.000"
            originalPrice="1.199.000"
            discountPercentage={50}
            image="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400&auto=format&fit=crop"
            instructor={{
              name: "Sonny Sangha",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
              status: "online"
            }}
          />
          <AppCard
            category="UI/UX Design"
            rating={4.8}
            title="Figma Mastery for Professionals"
            classes={24}
            students={850}
            price="299.000"
            originalPrice="599.000"
            discountPercentage={50}
            image="https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=400&auto=format&fit=crop"
            instructor={{
              name: "Sarah Jenkins",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
              status: "online"
            }}
          />
          <AppCard
            category="Artificial Intelligence"
            rating={4.9}
            title="Deep Learning with PyTorch"
            classes={40}
            students={2100}
            price="749.000"
            originalPrice="1.499.000"
            discountPercentage={50}
            image="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400&auto=format&fit=crop"
            instructor={{
              name: "Dr. James Wilson",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
              status: "online"
            }}
          />
        </AppSection>

        <CardCarousel />
        <TestimonialCarousel />
      </div>
    </div>
  )
}

export default HomePage
