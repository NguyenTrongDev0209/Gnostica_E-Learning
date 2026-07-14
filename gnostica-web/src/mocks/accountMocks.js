
export const MOCK_STATS = {
  totalHours: 125.5,
  completedCourses: 4,
  averageScore: 9.2,
  certificatesEarned: 3
};

export const MOCK_COURSES = [
  {
    id: 1,
    courseTitle: "Thi?t k? UI/UX Th?c chi?n v?i Figma",
    slug: "thiet-ke-ui-ux-thuc-chien-voi-figma",
    thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=400&auto=format&fit=crop",
    progressPercent: 45,
    lastAccessed: "2026-07-10T10:00:00Z"
  },
  {
    id: 2,
    courseTitle: "JavaScript Co b?n d?n N�ng cao",
    slug: "javascript-co-ban-den-nang-cao",
    thumbnail: "https://images.unsplash.com/photo-1627398242454-4bcf1c8f1d8?q=80&w=400&auto=format&fit=crop",
    progressPercent: 100,
    lastAccessed: "2026-06-25T14:30:00Z"
  },
  {
    id: 3,
    courseTitle: "ReactJS Masterclass",
    slug: "reactjs-masterclass",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400&auto=format&fit=crop",
    progressPercent: 0,
    lastAccessed: null
  }
];

export const MOCK_INSTRUCTORS = [
  {
    id: 1,
    fullName: "Nguy?n Van A",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
    headline: "Senior Frontend Engineer t?i Gnostica",
    rating: 4.8,
    studentsCount: 15420,
    coursesCount: 5
  },
  {
    id: 2,
    fullName: "Tr?n Th? B",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
    headline: "UI/UX Designer",
    rating: 4.9,
    studentsCount: 8900,
    coursesCount: 3
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Kh�a h?c m?i t? Nguy?n Van A",
    message: "Gi?ng vi�n b?n dang theo d�i v?a ra m?t kh�a h?c NextJS 14 Masterclass.",
    type: "COURSE",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
  },
  {
    id: 2,
    title: "B?n d� ho�n th�nh kh�a h?c!",
    message: "Ch�c m?ng b?n d� ho�n th�nh kh�a h?c JavaScript Co b?n. H�y nh?n ch?ng ch? ngay.",
    type: "SYSTEM",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 3,
    title: "Nh?c nh? h?c t?p",
    message: "B?n d� b? l? m?c ti�u h?c t?p tu?n n�y. H�y quay l?i v� ti?p t?c nh�!",
    type: "REMINDER",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  }
];

export const MOCK_WISHLIST = [
  {
    id: 10,
    title: "Mastering TypeScript",
    slug: "mastering-typescript",
    category: "L?p tr�nh Web",
    rating: 4.9,
    classes: 45,
    students: 3200,
    price: "899.000",
    originalPrice: "1.200.000",
    discountPercentage: 25,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Nguy?n Van A",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
    }
  }
];
