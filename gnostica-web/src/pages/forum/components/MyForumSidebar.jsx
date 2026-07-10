import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FileText, ThumbsUp, LayoutGrid } from 'lucide-react';
import { GhostButton } from '@/components/common/AppButton';
import { cn } from "@/lib/utils";

const MyForumSidebar = ({ currentUser, userStats, activeTab, setActiveTab }) => {
  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0 order-2 lg:order-1">
      <Card className="bg-white shadow-sm border-border overflow-hidden">
        <div className="h-24 bg-button-gradient" />
        <CardContent className="p-5 -mt-12 text-center">
          <Avatar className="w-20 h-20 mx-auto border-4 border-white shadow-md mb-4 bg-white">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'default'}`} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {currentUser?.fullName?.substring(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-lg text-foreground mb-1">{currentUser?.fullName || "Tài khoản của tôi"}</h3>
          <p className="text-sm text-muted-foreground mb-6">{currentUser?.email}</p>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-50 text-info rounded-full flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground">{userStats?.threadCount || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bài viết</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-orange-50 text-warning rounded-full flex items-center justify-center mb-2">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground">{userStats?.totalLikes || 0}</span>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lượt thích</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-border">
        <CardContent className="p-5">
          <h4 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-primary" />
            Truy cập nhanh
          </h4>
          <div className="flex flex-col gap-2">
            <GhostButton
              className={cn(
                "w-full justify-start text-sm gap-3 font-semibold",
                activeTab === 'my-posts' ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('my-posts')}
            >
              <FileText className="w-4 h-4" />
              Bài viết của tôi
            </GhostButton>
            <GhostButton
              className={cn(
                "w-full justify-start text-sm gap-3 font-semibold",
                activeTab === 'liked' ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('liked')}
            >
              <ThumbsUp className="w-4 h-4" />
              Bài viết đã thích
            </GhostButton>
            <Link to="/account" className="w-full">
              <GhostButton className="w-full justify-start text-sm hover:bg-muted gap-3 text-muted-foreground hover:text-foreground">
                Tài khoản của tôi
              </GhostButton>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyForumSidebar;
