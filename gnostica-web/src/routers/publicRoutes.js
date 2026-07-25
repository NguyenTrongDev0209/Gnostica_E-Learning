import HomePage from "@/pages/general/HomePage";
import AboutUs from "@/pages/general/AboutUs";
import CourseCatalog from "@/pages/course/CourseCatalog";
import CourseCategory from "@/pages/course/CourseCategory";
import CourseDetail from "@/pages/course/CourseDetail";
import SearchPage from "@/pages/course/SearchPage";
import ForumPage from "@/pages/forum/ForumPage";
import ForumTopicPage from "@/pages/forum/ForumTopicPage";
import ForumDetail from "@/pages/forum/ForumDetail";
import UserProfile from "@/pages/general/UserProfile";
import TermsPage from "@/pages/general/TermsPage";
import PrivacyPage from "@/pages/general/PrivacyPage";
import Showcase from "@/pages/Showcase";
import ErrorPage from "@/pages/general/ErrorPage";
import InstructorList from "@/pages/general/InstructorList";
import ContentPage from "@/pages/general/ContentPage";
import GiftResponsePage from "@/pages/course/GiftResponsePage";

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
    { path: "/courses/category", component: CourseCategory },
    { path: "/courses/category/:categorySlug", component: CourseCategory },
    { path: "/courses/:slug", component: CourseDetail },
    { path: "/search", component: SearchPage },
    { path: "/forum", component: ForumPage },
    { path: "/forum/topic/:topicSlug", component: ForumTopicPage },
    { path: "/forum/:topicSlug/:slug", component: ForumDetail },
    { path: "/forum/:slug", component: ForumDetail },
    { path: "/profile/:id", component: UserProfile },
    { path: "/terms/*", component: TermsPage },
    { path: "/privacy", component: PrivacyPage },
    { path: "/instructors", component: InstructorList },
    { path: "/gift/:token", component: GiftResponsePage },
    { path: "/*", component: ContentPage },
  ],
  noLayout: [
    { path: "/showcase", component: Showcase },
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
