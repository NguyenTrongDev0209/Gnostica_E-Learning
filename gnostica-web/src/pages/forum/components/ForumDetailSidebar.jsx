import React from 'react';
import { Link } from 'react-router-dom';
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppAvatar from "@/components/common/micro/AppAvatar";
import AppSeparator from "@/components/common/micro/AppSeparator";
import { Eye, ThumbsUp, MessageSquare, ChevronLeft } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";

const ForumDetailSidebar = ({ post, relatedPosts }) => {
  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0">
      {/* Author Info */}
      <AppCard appVariant="default" className="bg-white shadow-sm border-border">
        <AppCardContent className="p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Thông tin tác giả</h3>
          <div className="flex items-center gap-3 mb-4">
            <AppAvatar 
              className="w-12 h-12 ring-2 ring-primary/10"
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.account?.email || 'default'}`}
              fallback={(post.account?.fullName || "A").substring(0, 2).toUpperCase()}
            />
            <div>
              <p className="font-bold text-foreground">{post.account?.fullName || "Ẩn danh"}</p>
              <p className="text-xs text-muted-foreground">Email: {post.account?.email}</p>
            </div>
          </div>
          <AppSeparator className="mb-4" />
          <div className="flex justify-around text-center">
            <div>
              <p className="font-bold text-foreground">{post.likes || 0}</p>
              <p className="text-xs text-muted-foreground">Lượt thích</p>
            </div>
            <div>
              <p className="font-bold text-foreground">{post.commentCount || 0}</p>
              <p className="text-xs text-muted-foreground">Bình luận</p>
            </div>
          </div>
        </AppCardContent>
      </AppCard>

      {/* Post Stats */}
      <AppCard appVariant="default" className="bg-white shadow-sm border-border">
        <AppCardContent className="p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Thống kê bài viết</h3>
          <div className="flex flex-col gap-3">
            {[
              { icon: Eye, label: 'Lượt xem', value: post.views || 0 },
              { icon: ThumbsUp, label: 'Lượt thích', value: post.likes || 0 },
              { icon: MessageSquare, label: 'Bình luận', value: post.commentCount || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary/70" /> {label}
                </span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </AppCardContent>
      </AppCard>

      {/* Related Posts */}
      <AppCard appVariant="default" className="bg-white shadow-sm border-border">
        <AppCardContent className="p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Bài viết liên quan</h3>
          <div className="flex flex-col gap-3">
            {relatedPosts && relatedPosts.length > 0 ? (
              relatedPosts.map(p => (
                <Link
                  key={p.id}
                  to={`/forum/${p.id}`}
                  className="group flex flex-col gap-1 hover:bg-muted rounded-md p-2 -mx-2 transition-colors"
                >
                  <span className="text-xs text-primary font-medium">{p.topic?.title || "Thảo luận"}</span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {(p.title || '').substring(0, 70)}{(p.title || '').length > 70 ? '...' : ''}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">Không có bài viết liên quan</p>
            )}
          </div>

          <AppSeparator className="my-4" />
          <Link to="/forum">
            <AppButton appVariant="ghostMuted" variant="ghost" className="w-full text-sm gap-2 border border-border" size="sm">
              <ChevronLeft className="w-4 h-4" /> Quay về diễn đàn
            </AppButton>
          </Link>
        </AppCardContent>
      </AppCard>
    </div>
  );
};

export default ForumDetailSidebar;
