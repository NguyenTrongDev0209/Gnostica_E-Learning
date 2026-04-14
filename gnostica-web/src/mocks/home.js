export const mockCategories = [
  { id: 1, title: "Lập trình & IT", iconName: "Code", coursesCount: "320+", colorClass: "bg-blue-500/10 text-blue-500" },
  { id: 2, title: "Thiết kế Đồ họa", iconName: "PenTool", coursesCount: "150+", colorClass: "bg-pink-500/10 text-pink-500" },
  { id: 3, title: "Kinh doanh", iconName: "BarChart", coursesCount: "210+", colorClass: "bg-orange-500/10 text-orange-500" },
  { id: 4, title: "Marketing", iconName: "Megaphone", coursesCount: "180+", colorClass: "bg-green-500/10 text-green-500" },
];

export const mockFeaturedCourses = [
  {
    id: 1,
    category: "Web Development",
    rating: 5.0,
    title: "Fullstack Next.js Masterclass",
    classes: 32,
    students: 1200,
    price: "21.599.000",
    originalPrice: "1.199.000",
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
    category: "Artificial Intelligence",
    rating: 4.9,
    title: "Deep Learning with PyTorch",
    classes: 40,
    students: 2100,
    price: "749.000",
    originalPrice: "1.499.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Dr. James Wilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  }
];

export const mockInstructors = [
  { id: 1, name: "Sonny Sangha", role: "Fullstack Developer", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop", students: "1.2k", courses: 5 },
  { id: 2, name: "Sarah Jenkins", role: "UI/UX Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop", students: "850", courses: 3 },
  { id: 3, name: "Dr. James Wilson", role: "AI Researcher", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop", students: "2.1k", courses: 8 },
  { id: 4, name: "Emily Chen", role: "Marketing Specialist", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop", students: "1.5k", courses: 6 },
];

export const mockPlatformStats = [
  { id: 1, label: "Học viên", value: "50,000+", iconName: "Users" },
  { id: 2, label: "Khóa học", value: "1,200+", iconName: "BookOpen" },
  { id: 3, label: "Giảng viên", value: "300+", iconName: "Star" },
  { id: 4, label: "Giờ học", value: "10M+", iconName: "PlayCircle" },
];
