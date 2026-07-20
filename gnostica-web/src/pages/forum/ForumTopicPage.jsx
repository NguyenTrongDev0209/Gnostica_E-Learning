import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  LayoutPanelTop,
  List,
  Search,
  SquarePlus,
  UserRound,
} from "lucide-react";
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppAvatar from "@/components/common/micro/AppAvatar";
import AppSelect from "@/components/common/micro/AppSelect";
import AppSkeleton from "@/components/common/micro/AppSkeleton";
import { AppButton } from "@/components/common/micro/AppButton";
import { Input } from "@/components/ui/input";
import { ForumPostCard } from "@/components/common/composite/CourseCard";
import forumCategoryService from "@/services/forum/forumCategoryService";
import threadService from "@/services/forum/threadService";

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
    value: "detailed",
  },
  {
    label: <span className="flex items-center gap-2"><List className="h-4 w-4" />Tối giản</span>,
    value: "compact",
  },
];

const TopicFeedSkeleton = ({ count = 3 }) => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-start gap-3">
          <AppSkeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <AppSkeleton className="h-3 w-2/5" />
            <AppSkeleton className="h-5 w-3/5" />
            <AppSkeleton className="h-3 w-full" />
            <AppSkeleton className="h-3 w-4/5" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

const mapThreadToPost = (thread) => {
  const plainText = stripHtml(thread.content);
  return {
    id: thread.id,
    title: thread.title || (plainText.substring(0, 60) + (plainText.length > 60 ? "..." : "")),
    content: plainText,
    rawContent: thread.content,
    author: {
      name: thread.account?.fullName || "Ẩn danh",
      avatar: thread.account?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.account?.email || "default"}`,
      status: "online",
    },
    category: thread.topic?.title || thread.category?.name || "",
    topic: thread.topic || thread.category || null,
    topicAvatar: thread.topic?.avatarUrl || thread.category?.avatarUrl || "",
    topicSlug: thread.topic?.slug || thread.category?.slug || "",
    tags: (thread.hashtags || []).map(th => th.hashtag?.name || ""),
    createdAt: new Date(thread.createdAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    stats: {
      likes: thread.likes || 0,
      views: thread.viewCount ?? thread.views ?? 0,
      replies: thread.commentCount || 0,
    },
    images: thread.images || [],
    isHot: (thread.viewCount ?? thread.views ?? 0) > 50,
    isPinned: thread.isPinned || false,
    status: thread.status,
    voteScore: thread.voteScore || 0,
    userVote: thread.userVote || 0,
    userLiked: thread.userLiked || false,
    slug: thread.slug,
    createdAtValue: new Date(thread.createdAt).getTime(),
  };
};

const TopicOverview = ({ topic, canManage = false }) => {
  const [expanded, setExpanded] = useState(false);
  const description = topic?.description || "Chưa có mô tả cho chủ đề này.";
  const shouldClamp = description.length > 180;
  const topicInitial = topic?.name?.trim()?.substring(0, 1).toUpperCase() || "G";

  return (
    <AppCard appVariant="default" className="overflow-hidden bg-white p-0">
      <div className="relative h-40 bg-primary/10 sm:h-48">
        {topic?.bannerUrl ? (
          <img
            src={topic.bannerUrl}
            alt={topic.name}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary/40">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
      </div>
      <AppCardContent className="p-5 pt-0">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-4 border-white bg-primary/10 text-2xl font-bold text-primary shadow-sm">
            {topic?.avatarUrl ? (
              <img src={topic.avatarUrl} alt={topic.name} className="h-full w-full object-cover" />
            ) : (
              topicInitial
            )}
          </div>
          <div className="min-w-0 pb-1">
            <h1 className="text-2xl font-bold leading-tight text-foreground">{topic?.name || "Chủ đề"}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 text-primary/70" />
              {topic?.threadCount || 0} bài viết
            </p>
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <p className={`text-sm leading-6 text-muted-foreground ${!expanded && shouldClamp ? "line-clamp-3" : ""}`}>
            {description}
          </p>
          {shouldClamp && (
            <button
              type="button"
              onClick={() => setExpanded(value => !value)}
              className="mt-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {expanded ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
        </div>
      </AppCardContent>
    </AppCard>
  );
};

const TopicCreatorSidebar = ({ topic }) => {
  const creatorName = topic?.ownerName || "Người tạo chủ đề";
  const creatorEmail = topic?.ownerEmail;
  const creatorAvatar = topic?.ownerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorEmail || topic?.slug || "topic"}`;

  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0 lg:sticky lg:top-24 lg:self-start">
      <AppCard appVariant="default" className="bg-white shadow-sm border-border">
        <AppCardContent className="p-5">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            Người tạo chủ đề
          </h3>
          <div className="flex items-center gap-3">
            <AppAvatar
              className="h-12 w-12 ring-2 ring-primary/10"
              src={creatorAvatar}
              fallback={creatorName.substring(0, 2).toUpperCase()}
              alt={creatorName}
            />
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground">{creatorName}</p>
              {creatorEmail && <p className="truncate text-xs text-muted-foreground">{creatorEmail}</p>}
            </div>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary/70" />
                Chủ đề
              </span>
              <span className="font-semibold text-foreground">{topic?.name || "Diễn đàn"}</span>
            </div>
          </div>
        </AppCardContent>
      </AppCard>
    </div>
  );
};

const ForumTopicPage = () => {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState("best");
  const [displayMode, setDisplayMode] = useState("compact");

  const categoriesQuery = useQuery({
    queryKey: ["forum_categories"],
    queryFn: async () => {
      const res = await forumCategoryService.getAllCategories();
      const data = res?.data || res || [];
      return Array.isArray(data) ? data.filter(category => category.status === true) : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const threadsQuery = useQuery({
    queryKey: ["forum_topic_threads", topicSlug],
    queryFn: async () => {
      const res = await threadService.getThreads(0, 1000);
      return res?.content || res?.data?.content || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const topic = useMemo(
    () => (categoriesQuery.data || []).find(category => category.slug === topicSlug),
    [categoriesQuery.data, topicSlug]
  );

  const posts = useMemo(() => {
    const mappedPosts = (threadsQuery.data || [])
      .filter(thread => (thread.topic?.slug || thread.category?.slug) === topicSlug)
      .map(mapThreadToPost);

    const filteredPosts = mappedPosts.filter(post => {
      const normalizedSearch = searchQuery.toLowerCase();
      return post.title.toLowerCase().includes(normalizedSearch)
        || post.content.toLowerCase().includes(normalizedSearch)
        || post.tags.some(tag => tag.toLowerCase().includes(normalizedSearch));
    });

    return [...filteredPosts].sort((first, second) => {
      const engagement = (post) => post.voteScore * 3 + post.stats.likes * 2 + post.stats.replies * 2 + post.stats.views * 0.05;
      const ageInHours = (post) => Math.max((Date.now() - post.createdAtValue) / 3_600_000, 1);

      if (sortMode === "latest") return second.createdAtValue - first.createdAtValue;
      if (sortMode === "top") return second.stats.views - first.stats.views || engagement(second) - engagement(first);
      if (sortMode === "featured") return Number(second.isPinned) - Number(first.isPinned) || Number(second.isHot) - Number(first.isHot) || engagement(second) - engagement(first);
      if (sortMode === "rising") return engagement(second) / Math.pow(ageInHours(second), 0.35) - engagement(first) / Math.pow(ageInHours(first), 0.35);
      return engagement(second) - engagement(first) || second.createdAtValue - first.createdAtValue;
    });
  }, [threadsQuery.data, topicSlug, searchQuery, sortMode]);

  const isLoading = categoriesQuery.isLoading || threadsQuery.isLoading;
  const breadcrumbItems = [
    { label: "Diễn đàn", href: "/forum" },
    { label: topic?.name || "Chủ đề", isLast: true },
  ];

  return (
    <div className="min-h-screen bg-muted pb-16 pt-8">
      <PageContainer.Section className="w-full app-container">
        <AppBreadcrumb paths={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {topic && <TopicOverview topic={topic} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_170px_170px_auto] gap-3 mb-2">
              <div className="flex h-11 overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <Input
                  placeholder="Tìm bài viết, tag..."
                  className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 shadow-none focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <button
                  type="button"
                  aria-label="Tìm kiếm trong chủ đề"
                  className="flex w-14 shrink-0 items-center justify-center bg-accent text-white transition-colors hover:bg-accent/90"
                >
                  <Search className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
              <AppSelect options={sortOptions} value={sortMode} onValueChange={setSortMode} placeholder="Sắp xếp bài viết" className="bg-white shadow-sm" />
              <AppSelect options={displayOptions} value={displayMode} onValueChange={setDisplayMode} placeholder="Kiểu hiển thị" className="bg-white shadow-sm" />
              <AppButton
                appVariant="gradient"
                className="h-11 w-full gap-2 px-5 sm:col-span-2 lg:col-span-1 lg:w-auto"
                onClick={() => navigate("/forum/create", { state: { topicId: topic?.id } })}
              >
                <SquarePlus className="h-4 w-4" />
                Tạo bài viết
              </AppButton>
            </div>

            {isLoading ? (
              <TopicFeedSkeleton />
            ) : posts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {posts.map(post => (
                  <ForumPostCard key={post.id} post={post} displayMode={displayMode} topicContext />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-foreground">Chưa có bài viết phù hợp</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Thử đổi từ khóa tìm kiếm hoặc tạo bài viết đầu tiên cho chủ đề này.
                </p>
              </div>
            )}
          </div>

          <TopicCreatorSidebar topic={topic} />
        </div>
      </PageContainer.Section>
    </div>
  );
};

export default ForumTopicPage;
