// src/mocks/instructorMockData.js
import { DollarSign, Users, Star, Activity, FileText, CheckSquare } from "lucide-react";

export const USE_INSTRUCTOR_MOCK = true;

const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString();

export const MOCK_DASHBOARD = {
  STATS: [
    { title: "Doanh Thu Tháng", value: "12,500,000₫", trend: "+15.2%", isPositive: true, icon: DollarSign, color: "text-success bg-success/10 border-success/20" },
    { title: "Học Viên Mới", value: "324", trend: "+5.1%", isPositive: true, icon: Users, color: "text-info bg-info/10 border-info/20" },
    { title: "Điểm Đánh Giá", value: "4.8", trend: "+0.1", isPositive: true, icon: Star, color: "text-warning bg-warning/10 border-warning/20" },
    { title: "Tỷ Lệ Hoàn Thành", value: "78.4%", trend: "+2.4%", isPositive: true, icon: Activity, color: "text-primary bg-primary/10 border-primary/20" },
  ],
  REVENUE_DATA: [
    { name: "T1", revenue: 5000000 },
    { name: "T2", revenue: 8000000 },
    { name: "T3", revenue: 6500000 },
    { name: "T4", revenue: 12000000 },
    { name: "T5", revenue: 9000000 },
    { name: "T6", revenue: 15000000 },
  ],
  RATING_DISTRIBUTION: [
    { name: "5 sao", value: 650, color: "var(--color-warning)" },
    { name: "4 sao", value: 200, color: "color-mix(in srgb, var(--color-warning) 80%, transparent)" },
    { name: "3 sao", value: 50, color: "color-mix(in srgb, var(--color-warning) 60%, transparent)" },
    { name: "2 sao", value: 20, color: "color-mix(in srgb, var(--color-warning) 40%, transparent)" },
    { name: "1 sao", value: 10, color: "color-mix(in srgb, var(--color-warning) 20%, transparent)" },
  ],
  STUDENT_GROWTH_DATA: [
    { name: "T1", students: 50 },
    { name: "T2", students: 120 },
    { name: "T3", students: 250 },
    { name: "T4", students: 400 },
    { name: "T5", students: 650 },
    { name: "T6", students: 950 },
  ],
  COURSE_PERFORMANCE: [
    { id: 1, title: "Lập trình ReactJS Thực chiến", students: 450, completed: 85, avgProgress: 60, rating: 4.8, status: "active" },
    { id: 2, title: "NodeJS & ExpressJS API", students: 320, completed: 72, avgProgress: 45, rating: 4.7, status: "active" },
    { id: 3, title: "Python Data Science Cơ bản", students: 150, completed: 40, avgProgress: 25, rating: 4.5, status: "draft" },
  ],
  PENDING_TASKS: [
    { id: 1, label: "Trả lời câu hỏi học viên", count: 12, urgent: true, href: "/instructor/qa", color: "bg-error/10 text-error", icon: FileText },
    { id: 2, label: "Đánh giá khóa học mới", count: 5, urgent: false, href: "/instructor/qa", color: "bg-warning/10 text-warning", icon: CheckSquare },
  ]
};

export const MOCK_COURSES = {
  content: [
    {
      id: 1,
      title: "Lập trình ReactJS Thực chiến từ A-Z",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
      category: { name: "Frontend Development" },
      price: 1500000,
      students: 450,
      rating: 4.8,
      status: 1, // active
      createdAt: twoDaysAgo,
    },
    {
      id: 2,
      title: "NodeJS & ExpressJS: Xây dựng RESTful API",
      thumbnail: "https://images.unsplash.com/photo-1627398240411-a892b1a8d052?q=80&w=2070&auto=format&fit=crop",
      category: { name: "Backend Development" },
      price: 1200000,
      students: 320,
      rating: 4.7,
      status: 1,
      createdAt: yesterday,
    },
    {
      id: 3,
      title: "Mastering TypeScript trong 2024",
      thumbnail: null,
      category: { name: "Web Development" },
      price: 800000,
      students: 0,
      rating: 0,
      status: 2, // draft
      createdAt: today,
    },
  ],
  number: 0,
  totalPages: 1,
  totalElements: 3,
};

export const MOCK_STUDENTS = [
  { id: 1, name: "Nguyễn Văn A", email: "nva@gmail.com", avatar: "https://i.pravatar.cc/150?u=1", status: "active", coursesCount: 2, progress: 100, joinedDate: twoDaysAgo, lastActive: "15 phút trước" },
  { id: 2, name: "Trần Thị B", email: "ttb@gmail.com", avatar: "https://i.pravatar.cc/150?u=2", status: "active", coursesCount: 1, progress: 45, joinedDate: yesterday, lastActive: "2 giờ trước" },
  { id: 3, name: "Lê Hoàng C", email: "lhc@gmail.com", avatar: "https://i.pravatar.cc/150?u=3", status: "inactive", coursesCount: 3, progress: 10, joinedDate: "2024-01-10T00:00:00.000Z", lastActive: "5 ngày trước" },
];

export const MOCK_REVENUE = {
  wallet: {
    remain: 15450000,
    totalEarned: 112800000,
    accountNumber: "0389123456",
    bankBin: "970436" // Vietcombank
  },
  transactions: [
    { id: "1029", type: 1, amount: 1500000, ref: "Thanh toán khóa học Lập trình ReactJS", status: 1, createdAt: today },
    { id: "1028", type: 2, amount: 5000000, ref: "Rút tiền về tài khoản ngân hàng", status: 1, createdAt: yesterday },
    { id: "1027", type: 1, amount: 1200000, ref: "Thanh toán khóa học NodeJS", status: 1, createdAt: twoDaysAgo },
  ]
};

export const MOCK_COUPONS = [
  { id: 1, code: "SUMMER2024", discountPercent: 20, minDiscount: 500000, maxDiscount: 1000000, startDate: twoDaysAgo, endDate: "2024-12-31T00:00:00.000Z", usageLimit: 100, usedCount: 45, status: 1, courseId: null },
  { id: 2, code: "REACT50", discountPercent: 50, minDiscount: 0, maxDiscount: 2000000, startDate: yesterday, endDate: "2024-08-31T00:00:00.000Z", usageLimit: 50, usedCount: 50, status: 0, courseId: 1 },
];

export const MOCK_QA = {
  questions: [
    { id: 1, studentName: "Nguyễn Văn A", studentAvatar: "https://i.pravatar.cc/150?u=1", courseName: "Lập trình ReactJS Thực chiến", lessonName: "Bài 5: UseEffect Hook", content: "Thầy cho em hỏi tại sao useEffect lại bị lặp vô hạn ở đoạn code này ạ?", status: "unanswered", createdAt: today, replies: [] },
    { id: 2, studentName: "Trần Thị B", studentAvatar: "https://i.pravatar.cc/150?u=2", courseName: "NodeJS & ExpressJS", lessonName: "Bài 10: Authentication", content: "Lỗi JWT expired xử lý sao ạ?", status: "answered", createdAt: yesterday, replies: [{ content: "Em bắt exception rồi refresh token nhé." }] }
  ],
  reviews: [
    { id: 1, studentName: "Lê Hoàng C", studentAvatar: "https://i.pravatar.cc/150?u=3", courseName: "Lập trình ReactJS Thực chiến", rating: 5, content: "Khóa học rất chi tiết và dễ hiểu!", status: "not_responded", createdAt: today, reply: null },
    { id: 2, studentName: "Phạm D", studentAvatar: "https://i.pravatar.cc/150?u=4", courseName: "NodeJS & ExpressJS", rating: 4, content: "Kiến thức hay nhưng tốc độ hơi nhanh.", status: "responded", createdAt: twoDaysAgo, reply: "Cảm ơn em đã góp ý, thầy sẽ chú ý giảng chậm hơn ở phần sau." }
  ]
};
