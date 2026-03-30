import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import HomePage from "@/pages/client/HomePage"
import AboutUs from "@/pages/client/AboutUs"
import CourseCatalog from "@/pages/client/CourseCatalog"
import CourseCategory from "@/pages/client/CourseCategory"
import CourseDetail from "@/pages/client/CourseDetail"
import CourseCart from "@/pages/client/CourseCart"
import Showcase from "@/pages/Showcase"
import ErrorPage from "@/pages/ErrorPage"
import SearchPage from "@/pages/client/SearchPage"
import ForumPage from "@/pages/client/ForumPage"
import ForumDetail from "@/pages/client/ForumDetail"
import UserProfile from "@/pages/client/UserProfile"
import AuthLayout from "@/components/layouts/AuthLayout"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ForgotPassword from "@/pages/auth/ForgotPassword"
import ConfirmPage from "@/pages/auth/ConfirmPage"
import OAuth2Callback from "@/pages/auth/OAuth2Callback"
import CheckoutPage from "@/pages/client/CheckoutPage"
import PayosQR from "@/pages/client/PayosQR"
import CheckoutResult from "@/pages/client/CheckoutResult"
import TermsPage from "@/pages/client/TermsPage"
import PrivacyPage from "@/pages/client/PrivacyPage"
import AccountLayout from "@/components/layouts/AccountLayout"
import AccountOverview from "@/pages/account/AccountOverview"
import AdminLayout from "@/components/layouts/AdminLayout"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminUsers from "@/pages/admin/AdminUsers"
import AdminCourses from "@/pages/admin/AdminCourses"
import AdminCategories from "@/pages/admin/AdminCategories"
import AdminOrders from "@/pages/admin/AdminOrders"
import AdminCoupons from "@/pages/admin/AdminCoupons"
import AdminReviews from "@/pages/admin/AdminReviews"
import AdminReports from "@/pages/admin/AdminReports"
import AdminSettings from "@/pages/admin/AdminSettings"
import InstructorLayout from "@/components/layouts/InstructorLayout"
import InstructorDashboard from "@/pages/instructor/InstructorDashboard"
import InstructorCourses from "@/pages/instructor/InstructorCourses"
import InstructorRevenue from "@/pages/instructor/InstructorRevenue"
import MainLayout from "@/components/layouts/MainLayout"

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/category/:categoryName" element={<CourseCategory />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/cart" element={<CourseCart />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/payos" element={<PayosQR />} />
            <Route path="/checkout/success" element={<CheckoutResult />} />
            <Route path="/checkout/cancel" element={<CheckoutResult />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/:id" element={<ForumDetail />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/showcase" element={<Showcase />} />
            {/* My Account - Dashboard */}
            <Route element={<AccountLayout />}>
              <Route path="/account" element={<AccountOverview />} />
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/callback" element={<OAuth2Callback />} />
            <Route path="/confirm-code" element={<ConfirmPage />} />
          </Route>
          {/* Admin Area */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
          {/* Instructor Area */}
          <Route element={<InstructorLayout />}>
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/instructor/courses" element={<InstructorCourses />} />
            <Route path="/instructor/revenue" element={<InstructorRevenue />} />
          </Route>
        </Routes>
      </Router>
    </TooltipProvider>
  )
}

export default App
