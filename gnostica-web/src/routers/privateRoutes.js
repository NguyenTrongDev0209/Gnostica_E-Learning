import LearningWorkspace from "@/pages/learning/LearningWorkspace";

import AccountOverview from "@/pages/account/AccountOverview";
import MyCourses from "@/pages/account/MyCourses";
import LearningProgress from "@/pages/account/LearningProgress";
import Certificates from "@/pages/account/Certificates";
import Wishlist from "@/pages/account/Wishlist";
import Orders from "@/pages/account/Orders";
import Vouchers from "@/pages/account/Vouchers";
import Notifications from "@/pages/account/Notifications";
import Settings from "@/pages/account/Settings";
import ChangePassword from "@/pages/account/ChangePassword";
import FavoriteInstructors from "@/pages/account/FavoriteInstructors";

import CheckoutPage from "@/pages/order/CheckoutPage";
import PayosQR from "@/pages/order/PayosQR";
import CheckoutResult from "@/pages/order/CheckoutResult";
import ForumCreatePost from "@/pages/forum/ForumCreatePost";
import MyForumPosts from "@/pages/forum/MyForumPosts";
import ApplyInstructor from "@/pages/user/ApplyInstructor";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminCategoryManagement from "@/pages/admin/AdminCategoryManagement";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminReviews from "@/pages/admin/AdminReviews";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminBanks from "@/pages/admin/AdminBanks";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminCourseModeration from "@/pages/admin/AdminCourseModeration";
import AdminCourseDetailModeration from "@/pages/admin/AdminCourseDetailModeration";
import AdminThreadModeration from "@/pages/admin/AdminThreadModeration";


import InstructorDashboard from "@/pages/instructor/InstructorDashboard";
import InstructorCourses from "@/pages/instructor/InstructorCourses";
import InstructorRevenue from "@/pages/instructor/InstructorRevenue";
import InstructorCoupons from "@/pages/instructor/InstructorCoupons";
import InstructorStudents from "@/pages/instructor/InstructorStudents";
import InstructorSettings from "@/pages/instructor/InstructorSettings";
import InstructorCourseForm from "@/pages/instructor/InstructorCourseForm";

export const privateRoutes = {
  account: [
    { path: "/account", component: AccountOverview },
    { path: "/account/my-courses", component: MyCourses },
    { path: "/account/progress", component: LearningProgress },
    { path: "/account/certificates", component: Certificates },
    { path: "/account/wishlist", component: Wishlist },
    { path: "/account/orders", component: Orders },
    { path: "/account/vouchers", component: Vouchers },
    { path: "/account/notifications", component: Notifications },
    { path: "/account/settings", component: Settings },
    { path: "/account/change-password", component: ChangePassword },
    { path: "/account/following", component: FavoriteInstructors },
  ],
  admin: [
    { path: "/admin", component: AdminDashboard },
    { path: "/admin/users", component: AdminUsers },
    { path: "/admin/courses", component: AdminCourses },
    { path: "/admin/categories", component: AdminCategoryManagement },
    { path: "/admin/orders", component: AdminOrders },
    { path: "/admin/coupons", component: AdminCoupons },
    { path: "/admin/reviews", component: AdminReviews },
    { path: "/admin/reports", component: AdminReports },
    { path: "/admin/settings", component: AdminSettings },
    { path: "/admin/banks", component: AdminBanks },
    { path: "/admin/transactions", component: AdminTransactions },
    { path: "/admin/course-moderation", component: AdminCourseModeration },
    { path: "/admin/course-moderation/:slug", component: AdminCourseDetailModeration },
    { path: "/admin/thread-moderation", component: AdminThreadModeration },
  ],

  instructor: [
    { path: "/instructor", component: InstructorDashboard },
    { path: "/instructor/courses", component: InstructorCourses },
    { path: "/instructor/courses/courses-form", component: InstructorCourseForm },
    { path: "/instructor/courses/edit/:slug", component: InstructorCourseForm },
    { path: "/instructor/revenue", component: InstructorRevenue },
    { path: "/instructor/coupons", component: InstructorCoupons },
    { path: "/instructor/students", component: InstructorStudents },
    { path: "/instructor/settings", component: InstructorSettings },
  ],
  learning: [
    { path: "/learning/:id", component: LearningWorkspace },
  ],
  checkout: [
    { path: "/checkout", component: CheckoutPage },
    { path: "/checkout/payos", component: PayosQR },
    { path: "/checkout/success", component: CheckoutResult },
    { path: "/checkout/cancel", component: CheckoutResult },
  ],
  forum: [
    { path: "/forum/create", component: ForumCreatePost },
    { path: "/forum/me", component: MyForumPosts },
    { path: "/apply-instructor", component: ApplyInstructor },
  ],
};
