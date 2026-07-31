import { FileText, Loader2 } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import PolicyPage from "@/pages/general/components/PolicyPage";
import ErrorPage from "@/pages/general/ErrorPage";
import { usePublicPage } from "@/hooks/settings/useSiteSettings";
import { getErrorPageStatus } from "@/utils/errorPageStatus";

export default function ContentPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+/, "");
  const { data: page, isLoading, error } = usePublicPage(slug);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background" aria-busy="true">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Đang kiểm tra trang" />
      </main>
    );
  }

  if (error) {
    const status = getErrorPageStatus(error);
    return status === 404 ? <Navigate to="/404" replace /> : <ErrorPage status={status} />;
  }

  return <PolicyPage slug={slug} fallbackTitle="Trang nội dung" icon={FileText} page={page} />;
}
