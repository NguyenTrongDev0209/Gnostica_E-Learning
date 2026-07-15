import React from 'react';
import { Link } from 'react-router-dom';
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppAvatar from "@/components/common/micro/AppAvatar";
import { FileText, ThumbsUp, LayoutGrid } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import { cn } from "@/lib/utils";

const MyForumSidebar = ({ currentUser, userStats, activeTab, setActiveTab }) => {
  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0 order-2 lg:order-1">
      <AppCard appVariant="default" className="bg-white shadow-sm border-border overflow-hidden">
        <div className="h-24 bg-accent-gradient" />
        <AppCardContent className="p-5 -mt-12 text-center">
          <AppAvatar 
            className="w-20 h-20 mx-auto border-4 border-white shadow-md mb-4 bg-white"
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'default'}`}
            fallback={currentUser?.fullName?.substring(0, 2).toUpperCase() || "U"}
          />
          <h3 className="font-bold text-lg text-foreground mb-1">{currentUser?.fullName || "Tài khoản của tôi"}</h3>
          <p className="text-sm text-muted-foreground mb-6">{currentUser?.email}</p>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-info/10 text-info rounded-full flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground">{userStats?.threadCount || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bài viết</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-warning/10 text-warning rounded-full flex items-center justify-center mb-2">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground">{userStats?.totalLikes || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lượt thích</span>
            </div>
          </div>
        </AppCardContent>
      </AppCard>

      <AppCard appVariant="default" className="bg-white shadow-sm border-border">
        <AppCardContent className="p-5">
          <h4 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            Truy cập nhanh
          </h4>
          <div className="flex flex-col gap-2">
            <AppButton appVariant="ghostMuted" variant="ghost"
              className={cn(
                "w-full justify-start text-sm gap-3 font-semibold",
                activeTab === 'my-posts' ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('my-posts')}
            >
              <FileText className="w-4 h-4" />
              Bài viết của tôi
            </AppButton>
            <AppButton appVariant="ghostMuted" variant="ghost"
              className={cn(
                "w-full justify-start text-sm gap-3 font-semibold",
                activeTab === 'liked' ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('liked')}
            >
              <ThumbsUp className="w-4 h-4" />
              Bài viết đã thích
            </AppButton>
            <Link to="/account" className="w-full">
              <AppButton appVariant="ghostMuted" variant="ghost" className="w-full justify-start text-sm hover:bg-muted gap-3 text-muted-foreground hover:text-foreground">
                Tài khoản của tôi
              </AppButton>
            </Link>
          </div>
        </AppCardContent>
      </AppCard>
    </div>
  );
};

export default MyForumSidebar;
