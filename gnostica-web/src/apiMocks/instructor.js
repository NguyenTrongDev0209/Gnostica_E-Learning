import {
    Users,
    MessageSquare,
    Star,
    Activity,
    DollarSign,
    HelpCircle,
    FileEdit,
    AlertCircle
} from "lucide-react";

export const REVENUE_DATA = [
    { month: "T10", revenue: 12000000 },
    { month: "T11", revenue: 18500000 },
    { month: "T12", revenue: 15400000 },
    { month: "T01", revenue: 22800000 },
    { month: "T02", revenue: 19600000 },
    { month: "T03", revenue: 24500000 },
];

export const STUDENT_GROWTH_DATA = [
    { month: "T10", students: 450 },
    { month: "T11", students: 620 },
    { month: "T12", students: 580 },
    { month: "T01", students: 890 },
    { month: "T02", students: 740 },
    { month: "T03", students: 1050 },
];

export const RATING_DISTRIBUTION = [
    { name: "5 Sao", value: 750, color: "#10b981" },
    { name: "4 Sao", value: 180, color: "#3b82f6" },
    { name: "3 Sao", value: 50, color: "#f59e0b" },
    { name: "2 Sao", value: 15, color: "#ef4444" },
    { name: "1 Sao", value: 5, color: "#6b7280" },
];

export const COURSE_PERFORMANCE = [
    { id: 1, title: "Fullstack Next.js Masterclass", students: 1245, completed: 68, avgProgress: 74, rating: 4.9, status: "active" },
    { id: 2, title: "React Native cho người mới bắt đầu", students: 512, completed: 55, avgProgress: 61, rating: 4.7, status: "active" },
    { id: 3, title: "Tailwind CSS Thực chiến", students: 890, completed: 82, avgProgress: 88, rating: 4.8, status: "active" },
    { id: 4, title: "Node.js API Development", students: 320, completed: 45, avgProgress: 52, rating: 4.5, status: "draft" },
];

export const PENDING_TASKS = [
    { id: 1, type: "question", icon: HelpCircle, color: "text-info bg-blue-50", label: "Câu hỏi chưa trả lời", count: 12, href: "/instructor/questions", urgent: true },
    { id: 2, type: "review", icon: MessageSquare, color: "text-amber-500 bg-amber-50", label: "Đánh giá chưa phản hồi", count: 5, href: "/instructor/reviews", urgent: false },
    { id: 3, type: "draft", icon: FileEdit, color: "text-purple-500 bg-purple-50", label: "Khóa học nháp cần hoàn thiện", count: 2, href: "/instructor/courses", urgent: false },
    { id: 4, type: "update", icon: AlertCircle, color: "text-error bg-red-50", label: "Nội dung cũ cần cập nhật", count: 3, href: "/instructor/courses", urgent: true },
];

export const STATS = [
    {
        title: "Doanh Thu Tháng",
        value: "24.500.000đ",
        trend: "+15.3%",
        isPositive: true,
        icon: DollarSign,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100"
    },
    {
        title: "Học Viên Mới",
        value: "1,050",
        trend: "+12.4%",
        isPositive: true,
        icon: Users,
        color: "text-info bg-blue-50 border-info/20"
    },
    {
        title: "Điểm Đánh Giá",
        value: "4.8",
        trend: "+0.1",
        isPositive: true,
        icon: Star,
        color: "text-amber-600 bg-amber-50 border-amber-100"
    },
    {
        title: "Tỷ Lệ Hoàn Thành",
        value: "78%",
        trend: "-1.2%",
        isPositive: false,
        icon: Activity,
        color: "text-indigo-600 bg-indigo-50 border-indigo-100"
    },
];
