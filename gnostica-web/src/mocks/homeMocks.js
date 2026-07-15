export const MOCK_STATS = [
  { value: "500+", label: "Khóa học", iconName: "BookOpen" },
  { value: "50K+", label: "Học viên", iconName: "Users" },
  { value: "200+", label: "Giảng viên", iconName: "Award" },
  { value: "4.8", label: "Đánh giá TB", iconName: "Star" }
];

export const MOCK_INSTRUCTORS = [
  { name: "Alex Taylor", role: "Chuyên gia Data Science", students: "15,000", courses: 12, avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop" },
  { name: "Sarah Connor", role: "Kỹ sư Phần mềm", students: "12,500", courses: 8, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
  { name: "Michael Chang", role: "Chuyên gia UI/UX", students: "18,200", courses: 15, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
  { name: "Emily Watson", role: "Chuyên gia Marketing", students: "9,800", courses: 6, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" },
];

export const MOCK_CATEGORIES = [
  { id: 1, name: "Lập trình & IT", coursesCount: 150, iconName: "Code", colorClass: "bg-primary/10 text-primary" },
  { id: 2, name: "Thiết kế UI/UX", coursesCount: 85, iconName: "PenTool", colorClass: "bg-warning/10 text-warning" },
  { id: 3, name: "Marketing", coursesCount: 65, iconName: "Megaphone", colorClass: "bg-success/10 text-success" },
  { id: 4, name: "Data Science", coursesCount: 42, iconName: "Database", colorClass: "bg-info/10 text-info" }
];

export const MOCK_COURSES = [
  {
    id: 1,
    slug: "python-for-data-science",
    title: "Python Thực chiến cho Data Science",
    categoryName: "Data Science",
    students: 1250,
    classes: 45,
    price: 899000,
    finalPrice: 449500,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=600&auto=format&fit=crop",
    instructorName: "Alex Taylor",
    instructorAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 2,
    slug: "ui-ux-design-masterclass",
    title: "Thiết kế UI/UX Masterclass với Figma",
    categoryName: "Thiết kế",
    students: 2340,
    classes: 62,
    price: 1200000,
    finalPrice: 840000,
    discount: 30,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop",
    instructorName: "Michael Chang",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 3,
    slug: "fullstack-react-nodejs",
    title: "Lập trình Fullstack với React & Node.js",
    categoryName: "Lập trình Web",
    students: 3100,
    classes: 85,
    price: 1500000,
    finalPrice: 750000,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
    instructorName: "Sarah Connor",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 4,
    slug: "digital-marketing-strategy",
    title: "Chiến lược Digital Marketing Thực chiến",
    categoryName: "Marketing",
    students: 1800,
    classes: 34,
    price: 699000,
    finalPrice: 699000,
    discount: 0,
    thumbnail: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=600&auto=format&fit=crop",
    instructorName: "Emily Watson",
    instructorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 5,
    slug: "advanced-javascript",
    title: "JavaScript Nâng cao - Design Patterns",
    categoryName: "Lập trình Web",
    students: 950,
    classes: 28,
    price: 850000,
    finalPrice: 680000,
    discount: 20,
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=600&auto=format&fit=crop",
    instructorName: "Sarah Connor",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 6,
    slug: "data-analysis-sql",
    title: "Phân tích dữ liệu với SQL căn bản",
    categoryName: "Data Science",
    students: 1450,
    classes: 22,
    price: 599000,
    finalPrice: 599000,
    discount: 0,
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
    instructorName: "Alex Taylor",
    instructorAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 7,
    slug: "figma-prototyping",
    title: "Kỹ năng Prototyping siêu tốc trong Figma",
    categoryName: "Thiết kế",
    students: 820,
    classes: 15,
    price: 499000,
    finalPrice: 249500,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=600&auto=format&fit=crop",
    instructorName: "Michael Chang",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
  },
  {
    id: 8,
    slug: "content-marketing",
    title: "Nghệ thuật viết Content Marketing",
    categoryName: "Marketing",
    students: 2100,
    classes: 40,
    price: 750000,
    finalPrice: 375000,
    discount: 50,
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=600&auto=format&fit=crop",
    instructorName: "Emily Watson",
    instructorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop"
  }
];
