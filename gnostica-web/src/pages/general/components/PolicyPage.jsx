import DOMPurify from "dompurify";
import { createElement } from "react";
import { Loader2 } from "lucide-react";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { usePublicPage } from "@/hooks/settings/useSiteSettings";

export default function PolicyPage({ slug, fallbackTitle, icon }) {
  const { data: page, isLoading, isError } = usePublicPage(slug);
  const title = page?.title || fallbackTitle;
  const updatedAt = page?.updatedAt
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(page.updatedAt))
    : null;

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
        {isError && <div className="rounded-xl border border-error/20 bg-error/5 p-6 text-center text-sm text-error">Nội dung hiện chưa khả dụng. Vui lòng thử lại sau.</div>}
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
