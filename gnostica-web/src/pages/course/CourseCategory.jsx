import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { BookOpen, ChevronRight, Layers3 } from "lucide-react";
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import Skeleton from "@/components/common/micro/AppSkeleton";
import { CourseResultsLayout } from "@/pages/course/SearchPage";
import { useSearch } from "@/hooks/course/useSearch";

function CategoryDirectory({ categories, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-4 rounded-xl border border-border p-5">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  const visibleCategories = categories.filter((category) =>
    Number(category.courses || 0) > 0 || category.subcategories?.some((child) => Number(child.courses || 0) > 0)
  );

  if (!visibleCategories.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {visibleCategories.map((category) => {
        const children = (category.subcategories || []).filter((child) => Number(child.courses || 0) > 0);

        return (
          <AppCard key={category.id} appVariant="default" className="h-full hover-lift">
            <AppCardHeader className="gap-3 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers3 className="size-5" />
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {Number(category.courses || 0)} khóa học
                </span>
              </div>
              <AppCardTitle className="text-lg font-bold">
                <Link to={`/courses/category/${category.slug}`} className="transition-colors hover:text-primary">
                  {category.name}
                </Link>
              </AppCardTitle>
            </AppCardHeader>
            <AppCardContent className="space-y-1">
              {children.length ? children.map((child) => (
                <Link
                  key={child.id}
                  to={`/courses/category/${child.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary/70" />
                    {child.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs">
                    {Number(child.courses || 0)}
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )) : (
                <Link
                  to={`/courses/category/${category.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Xem khóa học
                  <ChevronRight className="size-4" />
                </Link>
              )}
            </AppCardContent>
          </AppCard>
        );
      })}
    </div>
  );
}

function CourseCategoryContent({ categorySlug }) {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCategorySlugs = location.state?.categorySlugs || (categorySlug ? [categorySlug] : []);
  const [filters, setFilters] = useState({
    levels: [],
    categorySlugs: initialCategorySlugs,
    categoryId: null,
    priceRange: [0, 2000000],
  });
  const [page, setPage] = useState(0);
  const size = 9;
  const { courses, categories, loading, totalElements, totalPages } = useSearch("", filters, { page, size });

  const selectedCategory = categories
    .flatMap((category) => [category, ...(category.subcategories || [])])
    .find((category) => category.slug === categorySlug);
  const displayCategory = selectedCategory?.name
    || (categorySlug ? categorySlug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : null);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "categorySlugs" && value?.length ? { categoryId: null } : {}),
      ...(key === "categoryId" && value ? { categorySlugs: [] } : {}),
    }));
    setPage(0);

    if (key === "categorySlugs" && categorySlug && !value.includes(categorySlug)) {
      navigate("/courses/category", { replace: true, state: { categorySlugs: value } });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadcrumbItems = [
    { label: "Khóa học", href: "/courses" },
    { label: "Danh mục", ...(displayCategory ? { href: "/courses/category" } : {}) },
    ...(displayCategory ? [{ label: displayCategory }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="app-container space-y-10 py-8 md:py-12">
        <PageContainer.Header
          title={displayCategory
            ? <>Khóa học <span className="text-accent-highlight">{displayCategory}</span></>
            : <>Khám phá theo <span className="text-accent-highlight">Danh mục</span></>}
          description={displayCategory
            ? `Khám phá ${totalElements} khóa học thuộc ${displayCategory} và lọc theo trình độ phù hợp với bạn.`
            : "Duyệt các lĩnh vực và danh mục con để nhanh chóng tìm được khóa học phù hợp với mục tiêu của bạn."}
        >
          <AppBreadcrumb paths={breadcrumbItems} />
        </PageContainer.Header>

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-2">
            <div>
              <h2 className="app-section-title">Danh mục khóa học</h2>
              <p className="mt-1 text-sm text-muted-foreground">Chọn một danh mục con để xem các khóa học liên quan.</p>
            </div>
            {displayCategory && (
              <Link to="/courses/category" className="text-sm font-semibold text-primary hover:text-primary/80">
                Xem mọi danh mục
              </Link>
            )}
          </div>
          <CategoryDirectory categories={categories} loading={loading && !categories.length} />
        </section>

        <CourseResultsLayout
          courses={courses}
          loading={loading}
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          pagination={{ page, size, totalElements, totalPages }}
          onPageChange={handlePageChange}
          emptyMessage="Hiện chưa có khóa học phù hợp với danh mục và bộ lọc bạn đã chọn."
          sectionTitle={displayCategory ? `Khóa học ${displayCategory}` : "Tất cả khóa học"}
        />
      </div>
    </div>
  );
}

export default function CourseCategory() {
  const { categorySlug } = useParams();
  return <CourseCategoryContent key={categorySlug || "all-categories"} categorySlug={categorySlug} />;
}
