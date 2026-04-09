import { MainHeroCarousel, SubBannerCarousel, CardCarousel, TestimonialCarousel } from "@/components/common/HomeCarousels"
import AppCard from "@/components/common/AppCard"
import AppSection from "@/components/common/AppSection"
import { Code, PenTool, BarChart, Megaphone, Users, BookOpen, Star, PlayCircle } from "lucide-react"

function HomePage() {

  return (
    <div className={`min-h-[100dvh] transition-colors duration-700 ease-in-out bg-background`}>
      <div className="flex flex-col gap-12 sm:gap-16 pb-12 relative z-10 w-full overflow-hidden">
        <MainHeroCarousel />

        <div className="app-container">
          <SubBannerCarousel />
        </div>

        {/* Top Categories Section */}
        <AppSection title="Danh mục nổi bật" containerClassName="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[
            { title: "Lập trình & IT", icon: Code, courses: "320+", color: "bg-blue-500/10 text-blue-500" },
            { title: "Thiết kế Đồ họa", icon: PenTool, courses: "150+", color: "bg-pink-500/10 text-pink-500" },
            { title: "Kinh doanh", icon: BarChart, courses: "210+", color: "bg-orange-500/10 text-orange-500" },
            { title: "Marketing", icon: Megaphone, courses: "180+", color: "bg-green-500/10 text-green-500" },
          ].map((cat, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-2xl border bg-card p-6 w-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color}`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{cat.title}</h3>
              <p className="text-sm text-muted-foreground">{cat.courses} khóa học</p>
            </div>
          ))}
        </AppSection>

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

        {/* Top Instructors Section */}
        <AppSection title="Giảng viên tiêu biểu" containerClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {[
            { name: "Sonny Sangha", role: "Fullstack Developer", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop", students: "1.2k", courses: 5 },
            { name: "Sarah Jenkins", role: "UI/UX Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop", students: 850, courses: 3 },
            { name: "Dr. James Wilson", role: "AI Researcher", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop", students: "2.1k", courses: 8 },
            { name: "Emily Chen", role: "Marketing Specialist", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop", students: "1.5k", courses: 6 },
          ].map((instructor, idx) => (
            <div key={idx} className="flex flex-col items-center p-6 bg-card rounded-2xl border text-center w-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
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
            </div>
          ))}
        </AppSection>



        <CardCarousel />

        {/* Platform Stats Section */}
        <div className="app-container mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Học viên", value: "50,000+", icon: Users },
              { label: "Khóa học", value: "1,200+", icon: BookOpen },
              { label: "Giảng viên", value: "300+", icon: Star },
              { label: "Giờ học", value: "10M+", icon: PlayCircle },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                <stat.icon className="w-8 h-8 text-primary mb-3" />
                <h4 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h4>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
