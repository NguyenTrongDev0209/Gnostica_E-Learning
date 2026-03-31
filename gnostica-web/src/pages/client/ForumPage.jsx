import React, { useState } from 'react';
import SectionContainer, { PageHeader } from '@/components/common/AppSection';
import { ForumPostCard } from "@/components/common/AppCard";
import { Button } from "@/components/ui/button";
import { Search, Flame, Menu, Star, Tag } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { forumCategoriesMock, forumPostsMock } from "@/mocks/forum";

const ForumPage = () => {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = forumPostsMock.filter(post => {
    const matchesCategory = activeCategory === "Tất cả" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
          <Button className="bg-button-gradient hover:brightness-110 md:w-auto w-full font-bold">
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
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" className="bg-white shrink-0 h-11 px-5">
                  Mới nhất
                </Button>
                <Button variant="ghost" className="shrink-0 flex items-center gap-1 text-orange-500 hover:text-orange-600 hover:bg-orange-50 font-medium h-11 px-5">
                  <Flame className="w-4 h-4" /> Đang hot
                </Button>
              </div>
            </div>

            {/* Post List */}
            {filteredPosts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredPosts.map((post) => (
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
            {filteredPosts.length > 0 && (
              <div className="flex justify-center mt-8 mb-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" className="text-sm font-medium" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" className="text-sm font-medium" />
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
                  {forumCategoriesMock.map((cat) => (
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
                        {cat.count}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags Widget */}
            <Card className="bg-white shadow-sm border-border hidden sm:block">
              <CardContent className="p-5">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  Tags phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["ReactJS", "Vue", "Java", "Spring Boot", "Tuyển dụng", "Lộ trình", "Data Science", "Câu hỏi phỏng vấn"].map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-colors text-xs py-1"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </Badge>
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
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <Avatar size="sm" className="w-8 h-8">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=a042581f4e2902670${item}d`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-slate-800 truncate">Chuyên gia {item}</span>
                        <span className="text-[10px] text-muted-foreground">{item * 124} điểm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </SectionContainer>
    </div>
  );
};

export default ForumPage;
