import React from "react";
import AppCard from "@/components/common/AppCard";
import AppSection, { PageHeader, AppBreadcrumb } from "@/components/common/AppSection";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import FilterOptions from "@/components/common/FilterOptions";
import { Home } from "lucide-react";



const courses = [
  {
    id: 1,
    category: "Web Development",
    rating: 5.0,
    title: "Fullstack Next.js Masterclass",
    classes: 32,
    students: 1200,
    price: "899.000",
    originalPrice: "1.799.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Sonny Sangha",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 2,
    category: "UI/UX Design",
    rating: 4.8,
    title: "Figma Mastery for Professionals",
    classes: 24,
    students: 850,
    price: "299.000",
    originalPrice: "599.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 3,
    category: "Data Science",
    rating: 4.9,
    title: "Python for Data Science & ML",
    classes: 45,
    students: 3100,
    price: "432.000",
    originalPrice: "864.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Alex Taylor",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 4,
    category: "Mobile Dev",
    rating: 4.7,
    title: "React Native: Zero to Hero",
    classes: 28,
    students: 1540,
    price: "549.000",
    originalPrice: "1.099.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "David Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 5,
    category: "Cyber Security",
    rating: 4.9,
    title: "Ethical Hacking Bootcamp 2024",
    classes: 50,
    students: 2800,
    price: "999.000",
    originalPrice: "1.999.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Marcus Holloway",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 6,
    category: "Graphic Design",
    rating: 4.6,
    title: "Adobe Illustrator: Advanced Techniques",
    classes: 20,
    students: 600,
    price: "199.000",
    originalPrice: "399.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Elena Ross",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 7,
    category: "Business",
    rating: 4.5,
    title: "Entrepreneurship 101: Build a Startup",
    classes: 15,
    students: 2100,
    price: "750.000",
    originalPrice: "1.500.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Richard Branson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 8,
    category: "Marketing",
    rating: 4.9,
    title: "Digital Marketing Mastery",
    classes: 40,
    students: 4500,
    price: "320.000",
    originalPrice: "640.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1533750516457-a7f992034fce?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Neil Patel",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 9,
    category: "Cloud Computing",
    rating: 5.0,
    title: "AWS Certified Solutions Architect",
    classes: 55,
    students: 1800,
    price: "1.200.000",
    originalPrice: "2.400.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Stephane Maarek",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 10,
    category: "Blockchain",
    rating: 4.8,
    title: "Ethereum Smart Contract Development",
    classes: 22,
    students: 950,
    price: "600.000",
    originalPrice: "1.200.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Vitalik Buterin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 11,
    category: "Artificial Intelligence",
    rating: 4.9,
    title: "Deep Learning Specialization",
    classes: 60,
    students: 12000,
    price: "1.500.000",
    originalPrice: "3.000.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Andrew Ng",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 12,
    category: "Game Development",
    rating: 4.7,
    title: "Unity 3D Course: C# basics",
    classes: 35,
    students: 2400,
    price: "450.000",
    originalPrice: "900.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Brackeys",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  }
];

export default function CourseCatalog() {
  const [priceRange, setPriceRange] = React.useState([0, 2000000]);

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khoá học", isLast: true }
  ];

  return (
    <div className="app-container py-8 md:py-12 bg-background">
      <AppBreadcrumb items={breadcrumbItems} />
      
      <PageHeader 
        title="Explore Our" 
        highlightedTitle="Courses" 
        description="Discover a wide range of courses tailored to help you master new skills and advance your career in the tech industry."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24">
            <FilterOptions priceRange={priceRange} onPriceRangeChange={setPriceRange} />
          </div>
        </aside>

        {/* Right: Course Grid */}
        <div className="flex flex-col gap-6 lg:gap-10 lg:col-span-9">
          {/* Mobile Filter Trigger */}
          <div className="flex lg:hidden items-center justify-between">
            <h3 className="text-lg font-bold">Danh sách khóa học</h3>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 px-4 flex items-center gap-2 bg-white shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  Lọc
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto p-4 bg-slate-50">
                <FilterOptions priceRange={priceRange} onPriceRangeChange={setPriceRange} />
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 9).map((course) => (
              <AppCard key={course.id} {...course} />
            ))}
          </div>

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
