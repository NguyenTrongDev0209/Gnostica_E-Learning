import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SectionContainer, { PageHeader } from '@/components/common/AppSection';
import { ForumPostCard } from "@/components/common/AppCard";
import { Button } from "@/components/ui/button";
import { Search, Menu, Star, Tag } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
// import { forumCategoriesMock, forumPostsMock } from "@/mocks/forum";

const ForumPage = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [topContributors, setTopContributors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
  }, []);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/threads/top-contributors');
        setTopContributors(res.data);
      } catch (error) {
        console.error("Failed to load top contributors", error);
      }
    };
    fetchTopContributors();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/forum-categories');
        const activeCategories = res.data.filter(cat => cat.status === true);
        setCategories(activeCategories);
      } catch (error) {
        console.error("Failed to load forum categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`http://localhost:8080/api/threads?page=0&size=1000`);
        setThreads(res.data.content);
      } catch (error) {
        console.error("Failed to fetch threads", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreads();
  }, []);

  // Đặt lại trang đầu tiên khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory, searchQuery]);

  // Map backend data to ForumPostCard format
  const mappedPosts = threads.map(thread => ({
    id: thread.id,
    title: thread.content.substring(0, 25) + (thread.content.length > 25 ? "..." : ""),
    content: thread.content,
    author: {
      name: thread.account?.fullName || "Ẩn danh",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.account?.email || 'default'}`,
      status: "online"
    },
    category: thread.category?.name || "",
    tags: [], // Tháo luận removed
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
    isHot: (thread.views || 0) > 50
  }));

  const filteredPosts = mappedPosts.filter(post => {
    const matchesCategory = activeCategory === "Tất cả" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const postsPerPage = 5;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 pt-8">
      <SectionContainer containerClassName="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <PageHeader
            title="Diễn đàn"
            highlightedTitle="Cộng đồng"
            description="Nơi giao lưu, hỏi đáp và chia sẻ kiến thức về lập trình, công nghệ."
            className="mb-0 sm:mb-0"
          />
          <Button
            className="bg-button-gradient hover:brightness-110 md:w-auto w-full font-bold"
            onClick={() => navigate('/forum/create')}
          >
            + Tạo bài viết mới
          </Button>
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
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-slate-500">Đang tải bài viết...</p>
              </div>
            ) : currentPosts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {currentPosts.map((post) => (
                  <ForumPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-dashed border-border mt-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Không tìm thấy bài viết nào</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác xem sao.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setActiveCategory("Tất cả"); }}>
                  Xóa bộ lọc
                </Button>
              </div>
            )}

            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 mb-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        className="gap-1 pl-2.5"
                      >
                        <PaginationPrevious className="hover:bg-transparent p-0" />
                      </Button>
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
                      <Button
                        variant="ghost"
                        disabled={currentPage === totalPages - 1}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        className="gap-1 pr-2.5"
                      >
                        <PaginationNext className="hover:bg-transparent p-0" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0">
            {/* Categories Widget */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Menu className="w-5 h-5 text-primary" />
                  Danh mục chủ đề
                </h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setActiveCategory("Tất cả")}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${activeCategory === "Tất cả"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border-none transition-colors ${activeCategory === cat.name ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                        }`}>
                        {cat.threadCount || 0}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>


            {/* Top Contributors Widget */}
            <Card className="bg-white shadow-sm border-border hidden lg:block">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  Người nổi bật
                </h3>
                <div className="flex flex-col gap-4">
                  {topContributors.length > 0 ? (
                    topContributors.map((item, index) => (
                      <div key={item.account.id} className="flex items-center gap-3">
                        <Avatar size="sm" className="w-8 h-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.account.email || 'default'}`} />
                          <AvatarFallback>{item.account.fullName?.substring(0, 1).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-semibold text-slate-800 truncate">
                            {item.account.fullName || "Ẩn danh"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {item.totalLikes} lượt thích · {item.threadCount} bài viết
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">Chưa có dữ liệu</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* "Me" Section */}
            {currentUser && (
              <Card className="bg-white shadow-sm border-border">
                <CardContent className="p-5">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email || 'default'}`} />
                      <AvatarFallback>{currentUser.fullName?.substring(0, 1).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    Tôi
                  </h3>
                  <Link 
                    to="/forum/me"
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <Avatar className="w-10 h-10 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email || 'default'}`} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {currentUser.fullName?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">
                        {currentUser.fullName || "Tài khoản của tôi"}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        Xem bài viết của tôi
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </SectionContainer>
    </div>
  );
};

export default ForumPage;
