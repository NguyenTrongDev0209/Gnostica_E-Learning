const fs = require('fs');
const path = require('path');

// 1. Create accountMocks.js
const mocksContent = `
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
    courseTitle: "JavaScript Co b?n d?n Nâng cao",
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
    title: "Khóa h?c m?i t? Nguy?n Van A",
    message: "Gi?ng viên b?n dang theo dõi v?a ra m?t khóa h?c NextJS 14 Masterclass.",
    type: "COURSE",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
  },
  {
    id: 2,
    title: "B?n dã hoàn thành khóa h?c!",
    message: "Chúc m?ng b?n dã hoàn thành khóa h?c JavaScript Co b?n. Hãy nh?n ch?ng ch? ngay.",
    type: "SYSTEM",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 3,
    title: "Nh?c nh? h?c t?p",
    message: "B?n dã b? l? m?c tiêu h?c t?p tu?n này. Hãy quay l?i và ti?p t?c nhé!",
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
    category: "L?p trình Web",
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
`;

fs.writeFileSync('src/mocks/accountMocks.js', mocksContent);

// 2. Overwrite useAccountOverview.js
const overviewHook = `import { useState, useEffect } from "react";
import { MOCK_STATS, MOCK_COURSES } from "@/mocks/accountMocks";

export default function useAccountOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ stats: null, recentCourses: [], recentCertificates: [] });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData({
        stats: MOCK_STATS,
        recentCourses: MOCK_COURSES,
        recentCertificates: [
          {
            id: "CERT-2026-891",
            title: "Thi?t k? UI/UX Th?c chi?n v?i Figma",
            issueDate: "15/03/2026",
            image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=400&auto=format&fit=crop",
          }
        ]
      });
      setLoading(false);
    }, 600);
  }, []);

  return {
    stats: data.stats,
    recentCourses: data.recentCourses,
    recentCertificates: data.recentCertificates,
    loading
  };
}
`;
fs.writeFileSync('src/hooks/user/useAccountOverview.js', overviewHook);

// 3. Overwrite useMyCourses.js
const myCoursesHook = `import { useState, useEffect } from "react";
import { MOCK_COURSES } from "@/mocks/accountMocks";

export default function useMyCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCourses(MOCK_COURSES);
      setLoading(false);
    }, 600);
  }, []);

  const getStatus = (progress) => {
    if (progress === 100) return "completed";
    if (progress > 0) return "in_progress";
    return "not_started";
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getStatus(course.progressPercent);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    courses: filteredCourses,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    totalCourses: courses.length
  };
}
`;
fs.writeFileSync('src/hooks/course/useMyCourses.js', myCoursesHook);

// 4. Overwrite useLearningProgress.js
const learningProgressHook = `import { useState, useEffect } from "react";
import { MOCK_STATS, MOCK_COURSES } from "@/mocks/accountMocks";

export default function useLearningProgress() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStats(MOCK_STATS);
      setCourses(MOCK_COURSES);
      setLoading(false);
    }, 600);
  }, []);

  return {
    courses,
    stats,
    loading
  };
}
`;
fs.writeFileSync('src/hooks/account/useLearningProgress.js', learningProgressHook);

// 5. Overwrite useFavoriteInstructors.js
const favoriteInstructorsHook = `import { useState, useEffect } from 'react';
import { MOCK_INSTRUCTORS } from '@/mocks/accountMocks';
import { toast } from 'sonner';

export default function useFavoriteInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setInstructors(MOCK_INSTRUCTORS);
            setLoading(false);
        }, 600);
    }, []);

    const handleUnfollow = (instructorId) => {
        setInstructors(prev => prev.filter(inst => inst.id !== instructorId));
        toast.success("Ðã b? theo dõi gi?ng viên");
    };

    return {
        instructors,
        loading,
        handleUnfollow
    };
}
`;
fs.writeFileSync('src/hooks/account/useFavoriteInstructors.js', favoriteInstructorsHook);

// 6. Overwrite useNotifications.js
const notificationsHook = `import { useState, useEffect } from "react";
import { MOCK_NOTIFICATIONS } from "@/mocks/accountMocks";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAllAsRead,
    markAsRead,
    fetchNotifications
  };
}
`;
fs.writeFileSync('src/hooks/account/useNotifications.js', notificationsHook);

// 7. Overwrite useSettingsForm.js
const settingsFormHook = `import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function useSettingsForm(user) {
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      headline: "",
      bio: "",
      website: "",
      facebook: "",
      linkedin: "",
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        phone: user.phone || "",
        headline: user.headline || "H?c viên t?i Gnostica",
        bio: user.bio || "Xin chào, tôi là h?c viên m?i.",
        website: user.website || "",
        facebook: user.facebook || "",
        linkedin: user.linkedin || "",
      });
    }
  }, [user, form]);

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      toast.success("C?p nh?t thông tin thành công!");
      setLoading(false);
    }, 800);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.success("Ðã t?i ?nh lên thành công (mock)");
    }
  };

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
    handleAvatarUpload
  };
}
`;
fs.writeFileSync('src/hooks/account/useSettingsForm.js', settingsFormHook);

// 8. Overwrite useChangePassword.js
const changePasswordHook = `import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      form.setError("confirmPassword", { message: "M?t kh?u xác nh?n không kh?p" });
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      toast.success("Ð?i m?t kh?u thành công!");
      form.reset();
      setLoading(false);
    }, 800);
  };

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword
  };
}
`;
fs.writeFileSync('src/hooks/account/useChangePassword.js', changePasswordHook);

// 9. Overwrite useWishlist.js
const wishlistHook = `import { useState, useEffect } from "react";
import { MOCK_WISHLIST } from "@/mocks/accountMocks";
import { toast } from "sonner";

export default function useWishlist() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCourses(MOCK_WISHLIST);
      setLoading(false);
    }, 600);
  }, []);

  const handleToggleWishlist = (courseId) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    toast.success("Ðã xóa kh?i danh sách yêu thích");
  };

  return {
    courses,
    loading,
    handleToggleWishlist
  };
}
`;
fs.writeFileSync('src/hooks/account/useWishlist.js', wishlistHook);

console.log("Mock hooks generated successfully.");
