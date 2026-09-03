import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { ArrowLeft, ChevronDown, FileText, Loader2, BookOpen, GraduationCap, Building2, Shield, Handshake, Layers } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { usePublicTermsMenu, usePublicTerm } from "@/hooks/settings/useSiteSettings";

const MODULE_ICONS = {
  "cổng khóa học": BookOpen,
  "giảng viên": GraduationCap,
  "business": Building2,
  "nhà cung cấp": Shield,
  "đối tác": Handshake,
  "bổ sung": Layers,
};

function getModuleIcon(title = "") {
  const lower = title.toLowerCase();
  for (const [key, Icon] of Object.entries(MODULE_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return FileText;
}

function TermsSidebar({ groups = [], isLoading, currentPath }) {
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const normalizedCurrentPath = currentPath.toLowerCase().replace(/\/+$/, "");

  return (
    <aside className="h-fit rounded-2xl border border-border bg-card p-4 shadow-xs lg:sticky lg:top-24">
      <div className="mb-3 border-b border-border pb-3">
        <Link
          to="/terms"
          className="block text-base font-bold text-foreground hover:text-primary transition-colors"
        >
          Điều khoản &amp; Chính sách
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : groups.length === 0 ? (
        <p className="px-2 py-4 text-xs text-muted-foreground">Chưa có mục nào.</p>
      ) : (
        <nav aria-label="Danh mục điều khoản" className="space-y-1.5">
          {groups.map((group) => {
            const isCollapsed = !!collapsedGroups[group.id];
            const ModuleIcon = getModuleIcon(group.title);
            const hasActiveTerm = group.terms?.some(
              (term) => (term.urlPath || "").toLowerCase().replace(/\/+$/, "") === normalizedCurrentPath
            );

            return (
              <div key={group.id} className="rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setCollapsedGroups((prev) => ({
                      ...prev,
                      [group.id]: !prev[group.id],
                    }))
                  }
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-muted rounded-lg ${
                    hasActiveTerm ? "bg-muted/70 text-primary font-bold" : "text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <ModuleIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{group.title}</span>
                  </div>
                  <ChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                </button>

                {!isCollapsed && group.terms?.length > 0 && (
                  <div className="ml-4 border-l border-border/80 pl-2 my-1 space-y-0.5">
                    {group.terms.map((term) => {
                      const termPath = (term.urlPath || "").toLowerCase().replace(/\/+$/, "");
                      const isActive = termPath === normalizedCurrentPath;

                      return (
                        <Link
                          key={term.id}
                          to={term.urlPath.startsWith("/") ? term.urlPath : `/${term.urlPath}`}
                          className={`block rounded-md px-3 py-2 text-sm transition-all ${
                            isActive
                              ? "bg-primary/10 font-bold text-primary shadow-xs"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {term.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}
    </aside>
  );
}

export default function TermsPage() {
  const { pathname } = useLocation();
  const cleanPath = pathname.replace(/\/+$/, "") || "/terms";
  const isRootTerms = cleanPath === "/terms";

  const { data: groups = [], isLoading: isMenuLoading } = usePublicTermsMenu();

  // Tìm term trong menu đã tải về
  const activeTermFromMenu = useMemo(() => {
    if (isRootTerms || !groups?.length) return null;
    for (const group of groups) {
      for (const term of group.terms || []) {
        const normalized = (term.urlPath || "").toLowerCase().replace(/\/+$/, "");
        if (normalized === cleanPath.toLowerCase() || normalized === cleanPath.toLowerCase().replace(/^\/terms\//, "")) {
          return { ...term, moduleTitle: group.title };
        }
      }
    }
    return null;
  }, [groups, cleanPath, isRootTerms]);

  // Fallback gọi API chi tiết nếu không tìm thấy trong menu
  const termSlug = cleanPath.replace(/^\/terms\/?/, "");
  const { data: fetchedTerm, isLoading: isTermLoading } = usePublicTerm(
    !isRootTerms && !activeTermFromMenu ? termSlug : null
  );

  const activeTerm = activeTermFromMenu || fetchedTerm;
  const isDetailLoading = !isRootTerms && isMenuLoading && !activeTerm;

  const title = isRootTerms
    ? "Trung tâm tài nguyên & Điều khoản pháp lý"
    : activeTerm?.title || "Điều khoản dịch vụ";

  const updatedAt = activeTerm?.updatedAt
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(new Date(activeTerm.updatedAt))
    : null;

  const sanitizedContent = useMemo(() => {
    if (!activeTerm?.content) return "";
    const normalized = activeTerm.content
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ");
    return DOMPurify.sanitize(normalized);
  }, [activeTerm?.content]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb trực tiếp không có dãy màu xám */}
      <div className="app-container pt-6 pb-2">
        <AppBreadcrumb
          paths={[
            { label: "Trang chủ", href: "/" },
            { label: "Điều khoản & Chính sách", href: "/terms" },
            ...(!isRootTerms && activeTerm?.moduleTitle
              ? [{ label: activeTerm.moduleTitle, href: "/terms" }]
              : []),
            ...(!isRootTerms ? [{ label: title }] : []),
          ]}
        />
      </div>

      {/* Main Layout */}
      <main className="app-container mt-4 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left Sidebar */}
        <TermsSidebar groups={groups} isLoading={isMenuLoading} currentPath={cleanPath} />

        {/* Right Content */}
        <section className="min-w-0 max-w-full overflow-hidden">
          {isRootTerms ? (
            /* TRANG CHÍNH /terms: CHÀO MỪNG & CÁC KHUNG DANH MỤC */
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-2xl font-black text-foreground sm:text-3xl md:text-4xl tracking-tight leading-tight">
                  Chào mừng bạn đến với Trung tâm tài nguyên &amp; Điều khoản pháp lý của Gnostica
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Chào mừng đến với điểm đến duy nhất của bạn để xem tất cả các chính sách, điều khoản và cam kết hướng dẫn cách chúng tôi vận hành, hỗ trợ và hợp tác với bạn. Tại Gnostica, học tập là niềm đam mê của chúng tôi, nhưng tính minh bạch, sự tin tưởng và an toàn cũng vậy—vì khi bạn phát triển, tất cả chúng ta đều thành công! Cho dù bạn là học viên tò mò, một giảng viên truyền cảm hứng, một đối tác đáng tin cậy hay một nhà cung cấp siêu sao, trang này được thiết kế để giúp mọi thứ trở nên dễ dàng hơn cho bạn. Khám phá thư viện tiện dụng của chúng tôi về các điều khoản, chính sách và thỏa thuận để xem cách chúng tôi đang nỗ lực để làm cho việc học trở nên thú vị, toàn diện và an toàn cho tất cả mọi người. Hãy cùng nhau phát triển và học hỏi!
                </p>
              </div>

              {/* Danh sách các khung (Cards) lấy dữ liệu từ bảng ghi liên quan mà đổ ra */}
              <div className="space-y-6">
                {isMenuLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                ) : groups.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                    Chưa có mục điều khoản nào được thiết lập.
                  </div>
                ) : (
                  groups.map((group) => {
                    return (
                      <div
                        key={group.id}
                        className="rounded-xl border border-border bg-card p-6 shadow-xs transition-all hover:shadow-sm"
                      >
                        <h2 className="text-lg font-bold text-foreground mb-4">
                          {group.title}
                        </h2>

                        {group.terms?.length > 0 ? (
                          <ul className="space-y-2.5 pl-2">
                            {group.terms.map((term) => (
                              <li key={term.id} className="flex items-baseline gap-3">
                                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                                <Link
                                  to={term.urlPath.startsWith("/") ? term.urlPath : `/${term.urlPath}`}
                                  className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                                >
                                  {term.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm italic text-muted-foreground pl-2">
                            (Mục này chưa có bài viết)
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* TRANG CHI TIẾT BÀI VIẾT ĐIỀU KHOẢN */
            <div className="space-y-6">
              {isDetailLoading || isTermLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : activeTerm ? (
                <div className="space-y-6">
                  <div className="border-b border-border pb-5">
                    <h1 className="flex items-center gap-3 text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">
                      <FileText className="size-8 text-primary shrink-0" />
                      <span>{activeTerm.title}</span>
                    </h1>
                    {updatedAt && (
                      <p className="mt-2 text-sm font-medium text-muted-foreground">
                        Cập nhật lần cuối: {updatedAt}
                      </p>
                    )}
                  </div>

                  <article
                    className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xs sm:p-10 leading-relaxed
                      overflow-hidden max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word]
                      [&_*]:max-w-full [&_*]:break-words [&_*]:[overflow-wrap:anywhere]
                      [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-foreground
                      [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground
                      [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground
                      [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-foreground
                      [&_p]:mb-4 [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:text-muted-foreground
                      [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ul]:text-muted-foreground
                      [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5 [&_ol]:text-muted-foreground
                      [&_li]:leading-relaxed
                      [&_strong]:font-bold [&_strong]:text-foreground
                      [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary/80"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                  <p className="text-lg font-bold text-foreground">Không tìm thấy điều khoản yêu cầu</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Trang này có thể đã được di chuyển hoặc chưa được xuất bản.
                  </p>
                  <Link
                    to="/terms"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    <ArrowLeft className="size-4" /> Quay lại Trung tâm điều khoản
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
