import React, { useEffect, useRef, useState } from 'react';
import PageContainer from "@/components/common/core/PageContainer";
import { ForumPostCard } from "@/components/common/composite/CourseCard";
import { LayoutPanelTop, List, Menu, Search, SquarePlus, Star } from 'lucide-react';
import { Input } from "@/components/ui/input";
import AppSelect from "@/components/common/micro/AppSelect";
import { useNavigate, useLocation } from "react-router-dom";
import { useForumPage } from '@/hooks/forum/useForumPage';
import useAuthStore from '@/store/useAuthStore';
import { AppButton } from "@/components/common/micro/AppButton";
import AppSkeleton from "@/components/common/micro/AppSkeleton";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import AppAvatar from "@/components/common/micro/AppAvatar";
import { Link } from "react-router-dom";

const sortOptions = [
  { label: "Tốt nhất", value: "best" },
  { label: "Nổi bật", value: "featured" },
  { label: "Mới nhất", value: "latest" },
  { label: "Hàng đầu", value: "top" },
  { label: "Đang lên", value: "rising" },
];

const displayOptions = [
  {
    label: <span className="flex items-center gap-2"><LayoutPanelTop className="h-4 w-4" />Dạng thẻ</span>,
    value: "detailed"
  },
  {
    label: <span className="flex items-center gap-2"><List className="h-4 w-4" />Tối giản</span>,
    value: "compact"
  },
];

const ForumFeedSkeleton = ({ count = 2 }) => (
  <div className="flex flex-col gap-4" aria-label="Đang tải thêm bài viết" aria-live="polite">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-start gap-3">
          <AppSkeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <AppSkeleton className="h-3 w-2/5" />
            <AppSkeleton className="h-5 w-3/5" />
            <AppSkeleton className="h-3 w-full" />
            <AppSkeleton className="h-3 w-4/5" />
            <div className="flex gap-3 pt-2">
              <AppSkeleton className="h-7 w-20 rounded-full" />
              <AppSkeleton className="h-7 w-12 rounded-full" />
              <AppSkeleton className="h-7 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ── ForumSidebar ──
const ForumSidebar = ({ categories, activeCategory, setActiveCategory, topContributors, currentUser }) => {
  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0 lg:sticky lg:top-24 lg:self-start">
      {/* Categories Widget */}
      <AppCard appVariant="default" className="bg-white shadow-sm border-border">
        <AppCardContent className="p-5">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Menu className="w-5 h-5 text-primary" />
            Danh mục chủ đề
          </h3>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveCategory("Tất cả")}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${activeCategory === "Tất cả"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              <span>Tất cả chủ đề</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group ${activeCategory === cat.name
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <span className="truncate pr-2">{cat.name}</span>
                <AppBadge variant={activeCategory === cat.name ? "primary" : "secondary"} soft className="text-[10px] px-1.5 py-0">
                  {cat.threadCount || 0}
                </AppBadge>
              </button>
            ))}
          </div>
        </AppCardContent>
      </AppCard>

      {/* Top Contributors Widget */}
      <AppCard appVariant="default" className="bg-white shadow-sm border-border hidden lg:block">
        <AppCardContent className="p-5">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary fill-primary" />
            Người nổi bật
          </h3>
          <div className="flex flex-col gap-4">
            {topContributors.length > 0 ? (
              topContributors.map((item) => (
                <div key={item.account.id} className="flex items-center gap-3">
                  <AppAvatar 
                    className="w-8 h-8"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.account.email || 'default'}`}
                    fallback={item.account.fullName?.substring(0, 1).toUpperCase() || "U"}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {item.account.fullName || "Ẩn danh"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.totalLikes} lượt thích · {item.threadCount} bài viết
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">Chưa có dữ liệu</p>
            )}
          </div>
        </AppCardContent>
      </AppCard>
      
      {/* "Me" Section */}
      {currentUser && (
        <AppCard appVariant="default" className="bg-white shadow-sm border-border">
          <AppCardContent className="p-5">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2">
              <AppAvatar 
                className="w-5 h-5"
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email || 'default'}`}
                fallback={currentUser.fullName?.substring(0, 1).toUpperCase() || "U"}
              />
              Tôi
            </h3>
            <Link 
              to="/forum/me"
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <AppAvatar 
                className="w-10 h-10 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all"
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email || 'default'}`}
                fallback={currentUser.fullName?.substring(0, 2).toUpperCase() || "U"}
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {currentUser.fullName || "Tài khoản của tôi"}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  Xem bài viết của tôi
                </span>
              </div>
            </Link>
          </AppCardContent>
        </AppCard>
      )}
    </div>
  );
};



const ForumPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore(state => state.user);
  
  const {
    threads,
    categories,
    topContributors,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useForumPage();
  
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("best");
  const [displayMode, setDisplayMode] = useState("compact");
  const loadMoreRef = useRef(null);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const tagParam = queryParams.get('tag') || queryParams.get('search');

  React.useEffect(() => {
    if (tagParam) {
      const cleanTag = tagParam.replace(/^#/, '');
      setSearchQuery(cleanTag);
    }
  }, [tagParam]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: "400px 0px" });

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const stripHtml = (html) => {
    if (!html) return '';
    let text = html.replace(/<[^>]*>/g, '');
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return text.trim();
  };

  // Map backend data to ForumPostCard format
  const mappedPosts = threads.map(thread => {
    const plainText = stripHtml(thread.content);
    return {
      id: thread.id,
      title: thread.title || (plainText.substring(0, 60) + (plainText.length > 60 ? "..." : "")),
      content: plainText,
      rawContent: thread.content,
      author: {
        name: thread.account?.fullName || "Ẩn danh",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.account?.email || 'default'}`,
        status: "online"
      },
      category: thread.topic?.title || thread.category?.name || "",
      tags: (thread.hashtags || []).map(th => th.hashtag?.name || ""),
      createdAt: new Date(thread.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      stats: {
        likes: thread.likes || 0,
        views: thread.viewCount ?? thread.views ?? 0,
        replies: thread.commentCount || 0
      },
      images: thread.images || [],
      isHot: (thread.viewCount ?? thread.views ?? 0) > 50,
      isPinned: thread.isPinned || false,
      status: thread.status,
      voteScore: thread.voteScore || 0,
      userVote: thread.userVote || 0,
      userLiked: thread.userLiked || false,
      slug: thread.slug,
      createdAtValue: new Date(thread.createdAt).getTime()
    };
  });

  const filteredPosts = mappedPosts.filter(post => {
    const matchesCategory = activeCategory === "Tất cả" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((first, second) => {
    const engagement = (post) => post.voteScore * 3 + post.stats.likes * 2 + post.stats.replies * 2 + post.stats.views * 0.05;
    const ageInHours = (post) => Math.max((Date.now() - post.createdAtValue) / 3_600_000, 1);

    if (sortMode === "latest") return second.createdAtValue - first.createdAtValue;
    if (sortMode === "top") return second.stats.views - first.stats.views || engagement(second) - engagement(first);
    if (sortMode === "featured") return Number(second.isPinned) - Number(first.isPinned) || Number(second.isHot) - Number(first.isHot) || engagement(second) - engagement(first);
    if (sortMode === "rising") return engagement(second) / Math.pow(ageInHours(second), 0.35) - engagement(first) / Math.pow(ageInHours(first), 0.35);
    return engagement(second) - engagement(first) || second.createdAtValue - first.createdAtValue;
  });

  return (
    <div className="min-h-screen bg-muted pb-16 pt-8">
      <PageContainer.Section className="w-full app-container">
        <PageContainer.Header
          title={<>Diễn đàn <span className="text-accent-highlight">Cộng đồng</span></>}
          description="Nơi giao lưu, hỏi đáp và chia sẻ kiến thức về lập trình, công nghệ."
          className="mb-8 sm:mb-12"
        />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Content - Feed */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Search and Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_170px_170px_auto] gap-3 mb-2">
              <div className="flex h-11 overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <Input
                  placeholder="Tìm kiếm chủ đề, tag..."
                  className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 shadow-none focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  aria-label="Tìm kiếm diễn đàn"
                  className="flex w-14 shrink-0 items-center justify-center bg-accent text-white transition-colors hover:bg-accent/90"
                >
                  <Search className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
              <AppSelect
                options={sortOptions}
                value={sortMode}
                onValueChange={setSortMode}
                placeholder="Sắp xếp bài viết"
                className="bg-white shadow-sm"
              />
              <AppSelect
                options={displayOptions}
                value={displayMode}
                onValueChange={setDisplayMode}
                placeholder="Kiểu hiển thị"
                className="bg-white shadow-sm"
              />
              <AppButton
                appVariant="gradient"
                className="h-11 w-full gap-2 px-5 sm:col-span-2 lg:col-span-1 lg:w-auto"
                onClick={() => navigate('/forum/create')}
              >
                <SquarePlus className="h-4 w-4" />
                Tạo bài viết
              </AppButton>
            </div>

            {/* Post List */}
            {isLoading ? (
              <ForumFeedSkeleton count={3} />
            ) : sortedPosts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {sortedPosts.map((post) => (
                  <ForumPostCard key={post.id} post={post} displayMode={displayMode} />
                ))}
              </div>
            ) : !hasNextPage && (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-dashed border-border mt-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Không tìm thấy bài viết nào</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác xem sao.
                </p>
                <AppButton appVariant="ghostMuted" variant="ghost" className="mt-4 border border-border" onClick={() => { setSearchQuery(""); setActiveCategory("Tất cả"); navigate("/forum"); }}>
                  Xóa bộ lọc
                </AppButton>
              </div>
            )}

            {(hasNextPage || isFetchingNextPage) && (
              <div ref={loadMoreRef} className="mt-2 min-h-24">
                {isFetchingNextPage && <ForumFeedSkeleton />}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <ForumSidebar 
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            topContributors={topContributors}
            currentUser={currentUser}
          />
        </div>
      </PageContainer.Section>
    </div>
  );
};

export default ForumPage;
