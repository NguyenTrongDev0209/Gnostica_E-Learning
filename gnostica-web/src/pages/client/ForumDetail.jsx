import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SectionContainer, { AppBreadcrumb } from '@/components/common/AppSection';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp, MessageSquare, Eye, Clock, Tag, Flame, ChevronLeft,
  Share2, Bookmark, Flag, Send
} from 'lucide-react';
import RenderContent from '@/components/common/RenderContent';
import CommentCard from '@/components/common/CommentCard';
import {
  forumPostDetailMock,
  forumCommentsMock,
  relatedForumPostsMock,
} from "@/mocks/forum";

// Helper: simple markdown-like renderer exported to common

const ForumDetail = () => {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [postLiked, setPostLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const breadcrumbItems = [
    { component: <Link to="/">Trang chủ</Link> },
    { component: <Link to="/forum">Diễn đàn</Link> },
    { label: `${forumPostDetailMock.title} #${id || forumPostDetailMock.id}`, isLast: true }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 pt-8">
      <SectionContainer containerClassName="w-full">

        {/* Breadcrumb */}
        <AppBreadcrumb items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main Content ── */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">

            {/* Post Card */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-5 sm:p-7">
                {/* Category + Hot badge */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs font-semibold">
                    {forumPostDetailMock.category}
                  </Badge>
                  {forumPostDetailMock.isHot && (
                    <Badge className="bg-orange-100 text-orange-600 border-none text-xs font-semibold gap-1">
                      <Flame className="w-3 h-3 fill-orange-500" /> Đang hot
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 leading-snug">
                  {forumPostDetailMock.title}
                </h1>

                {/* Author meta */}
                <Link to={`/profile/${forumPostDetailMock.id}`} className="flex items-center gap-3 mb-5 pb-5 border-b border-border hover:opacity-80 transition-opacity">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                    <AvatarImage src={forumPostDetailMock.author.avatar} alt={forumPostDetailMock.author.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {forumPostDetailMock.author.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                    {forumPostDetailMock.author.status === 'online' && (
                      <AvatarBadge className="bg-green-500 border-2 border-white ring-0" />
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 hover:text-primary transition-colors">{forumPostDetailMock.author.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {forumPostDetailMock.createdAt}
                      <span className="mx-1">·</span>
                      <Eye className="w-3 h-3" /> {forumPostDetailMock.stats.views} lượt xem
                    </p>
                  </div>
                </Link>

                {/* Post body */}
                <RenderContent text={forumPostDetailMock.content} />

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-6 pt-5 border-t border-border">
                  <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {forumPostDetailMock.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none text-xs cursor-pointer">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 h-9 ${postLiked ? 'border-primary text-primary bg-primary/5' : ''}`}
                      onClick={() => setPostLiked(!postLiked)}
                    >
                      <ThumbsUp className={`w-4 h-4 ${postLiked ? 'fill-primary' : ''}`} />
                      {forumPostDetailMock.stats.likes + (postLiked ? 1 : 0)} Hữu ích
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 h-9">
                      <MessageSquare className="w-4 h-4" />
                      {forumPostDetailMock.stats.replies} Bình luận
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost" size="sm"
                      className={`gap-1.5 h-9 ${bookmarked ? 'text-primary' : 'text-slate-500'}`}
                      onClick={() => setBookmarked(!bookmarked)}
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-primary' : ''}`} />
                      Lưu
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 h-9 text-slate-500">
                      <Share2 className="w-4 h-4" /> Chia sẻ
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 h-9 text-slate-400 hover:text-red-500">
                      <Flag className="w-4 h-4" /> Báo cáo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {forumPostDetailMock.stats.replies} Bình luận
              </h2>

              <div className="flex flex-col gap-5">
                {forumCommentsMock.map(c => (
                  <CommentCard key={c.id} comment={c} />
                ))}
              </div>
            </div>

            {/* Reply Box */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Viết bình luận của bạn</h3>
                <Textarea
                  placeholder="Chia sẻ kiến thức hoặc đặt câu hỏi thêm..."
                  className="min-h-[120px] resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-end mt-3">
                  <Button
                    className="bg-button-gradient hover:brightness-110 gap-2 font-bold"
                    disabled={!comment.trim()}
                  >
                    <Send className="w-4 h-4" /> Gửi bình luận
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0">

            {/* Author Info */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Thông tin tác giả</h3>
                <Link to={`/profile/${forumPostDetailMock.id}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                    <AvatarImage src={forumPostDetailMock.author.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {forumPostDetailMock.author.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                    {forumPostDetailMock.author.status === 'online' && (
                      <AvatarBadge className="bg-green-500 border-2 border-white ring-0" />
                    )}
                  </Avatar>
                  <div>
                    <p className="font-bold text-slate-800 hover:text-primary transition-colors">{forumPostDetailMock.author.name}</p>
                    <p className="text-xs text-muted-foreground">Tham gia: {forumPostDetailMock.author.joinedAt}</p>
                  </div>
                </Link>
                <Separator className="mb-4" />
                <div className="flex justify-around text-center">
                  <div>
                    <p className="font-bold text-slate-800">{forumPostDetailMock.author.postsCount}</p>
                    <p className="text-xs text-muted-foreground">Bài đăng</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{forumPostDetailMock.stats.likes}</p>
                    <p className="text-xs text-muted-foreground">Lượt thích</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post Stats */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Thống kê bài viết</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: Eye, label: 'Lượt xem', value: forumPostDetailMock.stats.views },
                    { icon: ThumbsUp, label: 'Lượt thích', value: forumPostDetailMock.stats.likes },
                    { icon: MessageSquare, label: 'Bình luận', value: forumPostDetailMock.stats.replies },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Icon className="w-4 h-4 text-primary/70" /> {label}
                      </span>
                      <span className="font-semibold text-slate-700">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Bài viết liên quan</h3>
                <div className="flex flex-col gap-3">
                  {relatedForumPostsMock.map(post => (
                    <Link
                      key={post.id}
                      to={`/forum/${post.id}`}
                      className="group flex flex-col gap-1 hover:bg-slate-50 rounded-md p-2 -mx-2 transition-colors"
                    >
                      <span className="text-xs text-primary font-medium">{post.category}</span>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </span>
                    </Link>
                  ))}
                </div>

                <Separator className="my-4" />
                <Link to="/forum">
                  <Button variant="outline" className="w-full text-sm gap-2" size="sm">
                    <ChevronLeft className="w-4 h-4" /> Quay về diễn đàn
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
};

export default ForumDetail;
