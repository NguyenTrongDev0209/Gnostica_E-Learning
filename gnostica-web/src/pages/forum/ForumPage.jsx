import React, { useState } from 'react';
import SectionContainer, { PageHeader } from '@/components/common/composite/AppSection';
import { ForumPostCard } from "@/components/common/composite/AppCard";
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useForumPage } from '@/hooks/forum/useForumPage';
import useAuthStore from '@/store/useAuthStore';
import { SimpleButton, GhostButton } from '@/components/common/micro/AppButton';
import ForumSidebar from './components/ForumSidebar';
import { Skeleton } from "@/components/ui/skeleton";

const ForumPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore(state => state.user);
  
  const { threads, categories, topContributors, isLoading } = useForumPage();
  
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const tagParam = queryParams.get('tag') || queryParams.get('search');

  React.useEffect(() => {
    if (tagParam) {
      const cleanTag = tagParam.replace(/^#/, '');
      setSearchQuery(cleanTag);
    }
  }, [tagParam]);

  // Đặt lại trang đầu tiên khi thay đổi bộ lọc
  React.useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory, searchQuery]);

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
        views: thread.views || 0,
        replies: thread.commentCount || 0
      },
      images: thread.images || [],
      isHot: (thread.views || 0) > 50,
      status: thread.status,
      voteScore: thread.voteScore || 0,
      userVote: thread.userVote || 0,
      userLiked: thread.userLiked || false,
      slug: thread.slug
    };
  });

  const filteredPosts = mappedPosts.filter(post => {
    const matchesCategory = activeCategory === "Tất cả" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const postsPerPage = 5;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage);

  return (
    <div className="min-h-screen bg-muted pb-16 pt-8">
      <SectionContainer containerClassName="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <PageHeader
            title="Diễn đàn"
            highlightedTitle="Cộng đồng"
            description="Nơi giao lưu, hỏi đáp và chia sẻ kiến thức về lập trình, công nghệ."
            className="mb-0 sm:mb-0"
          />
          <SimpleButton
            className="md:w-auto w-full"
            onClick={() => navigate('/forum/create')}
          >
            + Tạo bài viết mới
          </SimpleButton>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Content - Feed */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm chủ đề, tag..."
                  className="pl-9 bg-white h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Post List */}
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl bg-white" />
                ))}
              </div>
            ) : currentPosts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {currentPosts.map((post) => (
                  <ForumPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-dashed border-border mt-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Không tìm thấy bài viết nào</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác xem sao.
                </p>
                <GhostButton className="mt-4 border border-border" onClick={() => { setSearchQuery(""); setActiveCategory("Tất cả"); navigate("/forum"); }}>
                  Xóa bộ lọc
                </GhostButton>
              </div>
            )}

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <GhostButton
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        className="gap-1 pl-2.5 h-9"
                      >
                        <PaginationPrevious className="hover:bg-transparent p-0" />
                      </GhostButton>
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i)}
                          isActive={currentPage === i}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <GhostButton
                        disabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(prev => Math.max(totalPages - 1, prev + 1))}
                        className="gap-1 pr-2.5 h-9"
                      >
                        <PaginationNext className="hover:bg-transparent p-0" />
                      </GhostButton>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
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
      </SectionContainer>
    </div>
  );
};

export default ForumPage;
