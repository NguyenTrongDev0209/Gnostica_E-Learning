import HomePage from "@/pages/client/HomePage";
import AboutUs from "@/pages/client/AboutUs";
import CourseCatalog from "@/pages/client/CourseCatalog";
import CourseCategory from "@/pages/client/CourseCategory";
import CourseDetail from "@/pages/client/CourseDetail";
import CourseCart from "@/pages/client/CourseCart";
import SearchPage from "@/pages/client/SearchPage";
import ForumPage from "@/pages/client/ForumPage";
import ForumDetail from "@/pages/client/ForumDetail";
import UserProfile from "@/pages/client/UserProfile";
import CheckoutPage from "@/pages/client/CheckoutPage";
import PayosQR from "@/pages/client/PayosQR";
import CheckoutResult from "@/pages/client/CheckoutResult";
import TermsPage from "@/pages/client/TermsPage";
import PrivacyPage from "@/pages/client/PrivacyPage";
import Showcase from "@/pages/Showcase";
import ErrorPage from "@/pages/ErrorPage";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ConfirmPage from "@/pages/auth/ConfirmPage";

export const publicRoutes = {
  main: [
    { path: "/", component: HomePage },
    { path: "/about", component: AboutUs },
    { path: "/courses", component: CourseCatalog },
    { path: "/courses/category/:categoryName", component: CourseCategory },
    { path: "/courses/:id", component: CourseDetail },
    { path: "/cart", component: CourseCart },
    { path: "/checkout", component: CheckoutPage },
    { path: "/checkout/payos", component: PayosQR },
    { path: "/checkout/success", component: CheckoutResult },
    { path: "/checkout/cancel", component: CheckoutResult },
    { path: "/search", component: SearchPage },
    { path: "/forum", component: ForumPage },
    { path: "/forum/:id", component: ForumDetail },
    { path: "/profile/:id", component: UserProfile },
    { path: "/terms", component: TermsPage },
    { path: "/privacy", component: PrivacyPage },
    { path: "/showcase", component: Showcase },
    { path: "*", component: ErrorPage },
  ],
  auth: [
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
    { path: "/forgot-password", component: ForgotPassword },
    { path: "/confirm-code", component: ConfirmPage },
  ],
};
