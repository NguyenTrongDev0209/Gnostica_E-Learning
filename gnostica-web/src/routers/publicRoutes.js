import HomePage from "@/pages/home/HomePage";
import AboutUs from "@/pages/static/AboutUs";
import CourseCatalog from "@/pages/course/CourseCatalog";
import CourseCategory from "@/pages/course/CourseCategory";
import CourseDetail from "@/pages/course/CourseDetail";
import CourseCart from "@/pages/order/CourseCart";
import SearchPage from "@/pages/course/SearchPage";
import ForumPage from "@/pages/forum/ForumPage";
import ForumDetail from "@/pages/forum/ForumDetail";
import UserProfile from "@/pages/user/UserProfile";
import TermsPage from "@/pages/static/TermsPage";
import PrivacyPage from "@/pages/static/PrivacyPage";
import Showcase from "@/pages/Showcase";
import ErrorPage from "@/pages/static/ErrorPage";
import InstructorList from "@/pages/user/InstructorList";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ConfirmPage from "@/pages/auth/ConfirmPage";
import ResetPassword from "@/pages/auth/ResetPassword";
import OAuth2Callback from "@/pages/auth/OAuth2Callback";

export const publicRoutes = {
  main: [
    { path: "/", component: HomePage },
    { path: "/about", component: AboutUs },
    { path: "/courses", component: CourseCatalog },
    { path: "/courses/category", component: CourseCatalog },
    { path: "/courses/category/:categorySlug", component: CourseCatalog },
    { path: "/courses/category/:categoryName", component: CourseCategory },
    { path: "/courses/:slug", component: CourseDetail },
    { path: "/cart", component: CourseCart },
    { path: "/search", component: SearchPage },
    { path: "/forum", component: ForumPage },
    { path: "/forum/:slug", component: ForumDetail },
    { path: "/profile/:id", component: UserProfile },
    { path: "/terms", component: TermsPage },
    { path: "/privacy", component: PrivacyPage },
    { path: "/showcase", component: Showcase },
    { path: "/instructors", component: InstructorList },
  ],
  auth: [
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
    { path: "/forgot-password", component: ForgotPassword },
    { path: "/confirm-code", component: ConfirmPage },
    { path: "/reset-password", component: ResetPassword },
    { path: "/auth/callback", component: OAuth2Callback },
  ],
};
