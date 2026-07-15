import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppToaster } from "@/components/common/micro/AppToast";
import MainLayout from "@/components/layouts/MainLayout";
import AuthLayout from "@/components/layouts/AuthLayout";
import AccountLayout from "@/components/layouts/AccountLayout";
import AdminLayout from "@/components/layouts/AdminLayout";
import InstructorLayout from "@/components/layouts/InstructorLayout";
import LearningLayout from "@/components/layouts/LearningLayout";
import { publicRoutes, privateRoutes } from "@/routers";
import ErrorPage from "@/pages/general/ErrorPage";
import ProtectedRoute from "@/components/common/core/ProtectedRoute";
import CertificatePage from "@/pages/learning/CertificatePage";
import { ROLES } from "@/utils/constants";
import PersonalizationModal from "@/components/common/composite/PersonalizationModal";

function App() {
  return (
    <TooltipProvider>
      <AppToaster />
      <Router>
        <PersonalizationModal />
        <Routes>
          {publicRoutes.noLayout && publicRoutes.noLayout.map(({ path, component: Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}

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
            {privateRoutes.forum && privateRoutes.forum.map(({ path, component: Component }) => (
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
            <ProtectedRoute roles={[ROLES.ADMIN]}>
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
            <ProtectedRoute roles={[ROLES.INSTRUCTOR]}>
              <InstructorLayout />
            </ProtectedRoute>
          }>
            {privateRoutes.instructor.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Route>

          <Route path="/certificate/:certifiUrl" element={<CertificatePage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </TooltipProvider>
  );
}

export default App
