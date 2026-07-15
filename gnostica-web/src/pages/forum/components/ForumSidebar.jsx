import React from 'react';
import { Link } from "react-router-dom";
import { Menu, Star } from 'lucide-react';
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import AppAvatar from "@/components/common/micro/AppAvatar";

const ForumSidebar = ({ categories, activeCategory, setActiveCategory, topContributors, currentUser }) => {
  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0">
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
              topContributors.map((item, index) => (
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

export default ForumSidebar;
