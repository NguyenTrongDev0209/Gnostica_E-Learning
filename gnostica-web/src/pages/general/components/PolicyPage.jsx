import DOMPurify from "dompurify";
import { createElement } from "react";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { usePublicPage } from "@/hooks/settings/useSiteSettings";
import ErrorPage from "@/pages/general/ErrorPage";
import { getErrorPageStatus } from "@/utils/errorPageStatus";

export default function PolicyPage({ slug, fallbackTitle, icon, page: suppliedPage }) {
  const pageQuery = usePublicPage(slug, { enabled: !suppliedPage });
  const page = suppliedPage ?? pageQuery.data;
  const isLoading = pageQuery.isLoading;
  const error = pageQuery.error;
  const title = page?.title || fallbackTitle;
  const updatedAt = page?.updatedAt
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(page.updatedAt))
    : null;

  if (error) {
    const status = getErrorPageStatus(error);
    return status === 404 ? <Navigate to="/404" replace /> : <ErrorPage status={status} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="bg-muted py-12">
        <div className="app-container">
          <AppBreadcrumb paths={[{ label: "Trang chủ", href: "/" }, { label: title }]} />
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-foreground md:text-4xl">
            {createElement(icon, { className: "h-8 w-8 text-primary" })}
            {title}
          </h1>
          {updatedAt && <p className="mt-2 font-medium text-muted-foreground">Cập nhật lần cuối: {updatedAt}</p>}
        </div>
      </section>

      <main className="app-container mt-10 max-w-3xl">
        {isLoading && <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>}
        {page && (
          <article
            className="prose prose-sm max-w-none rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-lg sm:p-10 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_li]:text-muted-foreground [&_p]:leading-relaxed [&_p]:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
          />
        )}
      </main>
    </div>
  );
}
