import DOMPurify from "dompurify";
import { ChevronDown, FileText, Loader2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { usePublicPage, usePublicTermsMenu } from "@/hooks/settings/useSiteSettings";
import ErrorPage from "@/pages/general/ErrorPage";
import { getErrorPageStatus } from "@/utils/errorPageStatus";

function TermsSidebar({ groups, isLoading, slug }) {
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const activeGroup = groups.find((group) => group.items.some((item) => item.slug === slug))?.title;

  return (
    <aside className="h-fit rounded-2xl border border-border bg-card p-3 shadow-sm lg:sticky lg:top-24">
      <h2 className="px-3 py-2 text-base font-bold text-foreground">Điều khoản &amp; Chính sách</h2>
      {isLoading ? <div className="flex justify-center py-8"><Loader2 className="size-5 animate-spin text-primary" /></div> : (
        <nav aria-label="Danh mục điều khoản" className="space-y-2">
          {groups.map((group) => {
            const isCollapsed = collapsedGroups[group.title];
            const isActiveGroup = activeGroup === group.title;
            return (
              <section key={group.title} className={isActiveGroup ? "rounded-xl bg-muted/50" : "rounded-xl"}>
                <button type="button" onClick={() => setCollapsedGroups((current) => ({ ...current, [group.title]: !current[group.title] }))} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span>{group.title}</span>
                  <ChevronDown className={`size-4 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} aria-hidden="true" />
                </button>
                {!isCollapsed && <div className="space-y-1 pb-1">
                  {group.items.map((item) => {
                    const isActive = item.slug === slug;
                    return <Link key={item.id} to={`/${item.slug}`} className={`block rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`} aria-current={isActive ? "page" : undefined}>{item.title}</Link>;
                  })}
                </div>}
              </section>
            );
          })}
        </nav>
      )}
    </aside>
  );
}

export default function TermsPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+/, "") || "terms";
  const { data: page, isLoading: isPageLoading, error } = usePublicPage(slug);
  const { data: groups = [], isLoading: isMenuLoading } = usePublicTermsMenu();
  const title = page?.title || "Điều khoản dịch vụ";
  const updatedAt = page?.updatedAt
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(page.updatedAt))
    : null;

  if (error) {
    return <ErrorPage status={getErrorPageStatus(error)} />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="bg-muted py-10">
        <div className="app-container">
          <AppBreadcrumb paths={[{ label: "Trang chủ", href: "/" }, { label: "Điều khoản & Chính sách", href: "/terms" }, { label: title }]} />
          <h1 className="mt-3 flex items-center gap-3 text-3xl font-extrabold text-foreground md:text-4xl"><FileText className="size-8 text-primary" />{title}</h1>
          {updatedAt && <p className="mt-2 font-medium text-muted-foreground">Cập nhật lần cuối: {updatedAt}</p>}
        </div>
      </section>

      <main className="app-container mt-8 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <TermsSidebar groups={groups} isLoading={isMenuLoading} slug={slug} />
        <section aria-busy={isPageLoading}>
          {isPageLoading && <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>}
          {page && <article className="prose prose-sm max-w-none rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-10 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_li]:text-muted-foreground [&_p]:leading-relaxed [&_p]:text-muted-foreground" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }} />}
        </section>
      </main>
    </div>
  );
}
