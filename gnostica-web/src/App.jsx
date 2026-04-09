import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import MainLayout from "@/components/layouts/MainLayout";
import AuthLayout from "@/components/layouts/AuthLayout";
import AccountLayout from "@/components/layouts/AccountLayout";
import AdminLayout from "@/components/layouts/AdminLayout";
import InstructorLayout from "@/components/layouts/InstructorLayout";
import LearningLayout from "@/components/layouts/LearningLayout";
import { publicRoutes, privateRoutes } from "@/routers";
import ErrorPage from "@/pages/ErrorPage";
import ProtectedRoute from "@/components/common/ProtectedRoute";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router>
        <Routes>

          <Route element={<MainLayout />}>
            {publicRoutes.main.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            <Route element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }>
              {privateRoutes.account.map(({ path, component: Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
            {privateRoutes.checkout.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}
          </Route>

          <Route element={<AuthLayout />}>
            {publicRoutes.auth.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          <Route element={
            <ProtectedRoute roles={['admin', 'ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            {privateRoutes.admin.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          <Route element={
            <ProtectedRoute>
              <LearningLayout />
            </ProtectedRoute>
          }>
            {privateRoutes.learning.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          <Route element={
            <ProtectedRoute roles={['instructor', 'teacher', 'TEACHER', 'INSTRUCTOR']}>
              <InstructorLayout />
            </ProtectedRoute>
          }>
            {privateRoutes.instructor.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </TooltipProvider>
  );
}

export default App
