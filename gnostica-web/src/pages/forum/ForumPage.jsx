import React, { useEffect, useRef, useState } from 'react';
import PageContainer from "@/components/common/core/PageContainer";
import { ForumPostCard } from "@/components/common/composite/CourseCard";
import ForumTopicCreateDialog from "@/components/common/composite/ForumTopicCreateDialog";
import { FolderPlus, History, Home, LayoutPanelTop, List, Mail, Menu, Search, SquarePlus, Tags, UserRound } from 'lucide-react';
import { Input } from "@/components/ui/input";
import AppSelect from "@/components/common/micro/AppSelect";
import { useNavigate, useLocation } from "react-router-dom";
import { useForumPage } from '@/hooks/forum/useForumPage';
import useAuthStore from '@/store/useAuthStore';
import { AppButton } from "@/components/common/micro/AppButton";
import AppSkeleton from "@/components/common/micro/AppSkeleton";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
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
const getCurrentRole = (user) => {
  const roles = [user?.role, ...(Array.isArray(user?.roles) ? user.roles : [])]
    .map(role => typeof role === "object" ? role?.name : role)
    .filter(Boolean)
    .flatMap(role => String(role).split(","))
    .map(role => role.trim().replace(/^ROLE_/, "").toUpperCase());

  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("INSTRUCTOR") || roles.includes("TEACHER")) return "INSTRUCTOR";
  return roles[0] || "";
};

const ForumSidebar = ({ categories, activeCategory, setActiveCategory, currentUser, sortMode, setSortMode, refetchCategories }) => {
  const [showTopics, setShowTopics] = useState(false);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const role = getCurrentRole(currentUser);
  const canCreateTopic = role === "ADMIN" || role === "INSTRUCTOR";

  const menuItemClass = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";

  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0 lg:sticky lg:top-24 lg:self-start">
      {/* Forum navigation */}
      <AppCard appVariant="default" className="bg-white shadow-sm border-border">
        <AppCardContent className="p-5">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Menu className="w-5 h-5 text-primary" />
            Diễn đàn
          </h3>
          <nav className="flex flex-col gap-1" aria-label="Điều hướng diễn đàn">
            <Link
              to="/forum"
              className={`${menuItemClass} ${activeCategory === "Tất cả" && sortMode !== "latest" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              onClick={() => { setActiveCategory("Tất cả"); setSortMode("best"); }}
            >
              <Home className="h-4 w-4" />
              Trang chủ
            </Link>
            <button
              type="button"
              onClick={() => setShowTopics(value => !value)}
              className={`${menuItemClass} ${showTopics || activeCategory !== "Tất cả" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Tags className="h-4 w-4" />
              Chủ đề
            </button>
            {showTopics && (
              <div className="ml-4 flex flex-col gap-1 border-l border-border pl-3">
                <button
                  type="button"
                  onClick={() => setActiveCategory("Tất cả")}
                  className={`rounded-md px-3 py-2 text-left text-sm ${activeCategory === "Tất cả" ? "font-semibold text-primary" : "text-muted-foreground hover:bg-muted"}`}
                >
                  Tất cả chủ đề
                </button>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/forum/topic/${category.slug}`}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm ${activeCategory === category.name ? "font-semibold text-primary" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <span className="truncate pr-2">{category.name}</span>
                    <span className="text-xs">{category.threadCount || 0}</span>
                  </Link>
                ))}
              </div>
            )}
            {canCreateTopic && (
              <button
                type="button"
                onClick={() => setShowCreateTopic(true)}
                className={`${menuItemClass} text-muted-foreground hover:bg-muted hover:text-foreground`}
              >
                <FolderPlus className="h-4 w-4" />
                Bắt đầu chủ đề
              </button>
            )}
            <button
              type="button"
              onClick={() => setSortMode("latest")}
              className={`${menuItemClass} ${sortMode === "latest" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <History className="h-4 w-4" />
              Xem gần đây
            </button>
          </nav>
        </AppCardContent>
      </AppCard>

      <ForumTopicCreateDialog
        open={showCreateTopic}
        onOpenChange={setShowCreateTopic}
        categories={categories}
        onCreated={async () => {
          await refetchCategories();
          setShowTopics(true);
        }}
      />

      {/* Personal information widget */}
      <AppCard appVariant="default" className="bg-white shadow-sm border-border hidden lg:block">
        <AppCardContent className="p-5">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <UserRound className="w-5 h-5 text-primary" />
            Thông tin cá nhân
          </h3>
          {currentUser ? (
            <div className="flex flex-col items-center text-center">
              <AppAvatar
                size="xl"
                className="ring-4 ring-primary/10"
                src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email || 'default'}`}
                fallback={currentUser.fullName?.substring(0, 1).toUpperCase() || "U"}
                alt={currentUser.fullName || "Tài khoản của tôi"}
              />
              <p className="mt-3 max-w-full truncate text-base font-semibold text-foreground">
                {currentUser.fullName || "Tài khoản của tôi"}
              </p>
              <p className="mt-1 flex max-w-full items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </p>
              <Link
                to="/forum/me"
                className="mt-4 flex h-10 w-full items-center justify-center rounded-lg border border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                Xem hồ sơ của tôi
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <UserRound className="h-7 w-7 text-primary" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Đăng nhập để xem thông tin và bài viết của bạn.
              </p>
              <Link
                to="/login"
                className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </AppCardContent>
      </AppCard>
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
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetchCategories,
  } = useForumPage();

  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("best");
  const [displayMode, setDisplayMode] = useState("compact");
  const loadMoreRef = useRef(null);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const tagParam = queryParams.get('tag') || queryParams.get('search');
  const topicParam = queryParams.get('topic');

  React.useEffect(() => {
    if (tagParam) {
      const cleanTag = tagParam.replace(/^#/, '');
      setSearchQuery(cleanTag);
    }
  }, [tagParam]);

  React.useEffect(() => {
    if (!topicParam) return;
    const selectedCategory = categories.find(category =>
      category.slug === topicParam || category.name === topicParam
    );
    if (selectedCategory) {
      setActiveCategory(selectedCategory.name);
    }
  }, [categories, topicParam]);

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
      topic: thread.topic || thread.category || null,
      topicAvatar: thread.topic?.avatarUrl || thread.category?.avatarUrl || "",
      topicSlug: thread.topic?.slug || thread.category?.slug || "",
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
            currentUser={currentUser}
            sortMode={sortMode}
            setSortMode={setSortMode}
            refetchCategories={refetchCategories}
          />
        </div>
      </PageContainer.Section>
    </div>
  );
};

export default ForumPage;
