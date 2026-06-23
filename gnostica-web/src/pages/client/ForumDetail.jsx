import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SectionContainer, { AppBreadcrumb } from '@/components/common/AppSection';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ThumbsUp, MessageSquare, Eye, Clock, Tag, Flame, ChevronLeft,
  Flag, Send
} from 'lucide-react';
import { cn } from "@/lib/utils";
import RenderContent from '@/components/common/RenderContent';
import CommentCard from '@/components/common/CommentCard';
import useForumDetail from '@/hooks/client/useForumDetail';
import { toast } from 'sonner';

const ForumDetail = () => {
  const { id } = useParams();
  
  const {
    post,
    comments,
    isLoading,
    error,
    postLiked,
    relatedPosts,
    hasReported,
    isSubmittingReport,
    handleSendReport,
    handleSendComment,
    handleToggleLike,
    handleCommentAdded,
    handleCommentDeleted
  } = useForumDetail(id);

  const [commentText, setCommentText] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDetail, setReportDetail] = useState('');

  const onSendReport = () => {
    handleSendReport(reportType, reportDetail, () => {
        setIsReportModalOpen(false);
        setReportType('');
        setReportDetail('');
    });
  };

  const onSendComment = () => {
    handleSendComment(commentText, () => setCommentText(''));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-muted-foreground font-medium">Đang tải nội dung...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-2">Thao tác thất bại</h2>
          <p className="text-muted-foreground mb-6">{error || "Không tìm thấy bài viết này."}</p>
          <Link to="/forum">
            <Button className="bg-button-gradient font-bold w-full">Quay lại Diễn đàn</Button>
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { component: <Link to="/">Trang chủ</Link> },
    { component: <Link to="/forum">Diễn đàn</Link> },
    { label: post.content.substring(0, 30) + '...', isLast: true }
  ];

  return (
    <div className="min-h-screen bg-muted pb-16 pt-8">
      <SectionContainer containerClassName="w-full">
        <AppBreadcrumb items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main Content ── */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">

            {/* Post Card */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs font-semibold">
                    {post.category?.name || "Thảo luận"}
                  </Badge>
                  {(post.views || 0) > 100 && (
                    <Badge className="bg-warning/10 text-warning text-warning border-none text-xs font-semibold gap-1">
                      <Flame className="w-3 h-3 fill-orange-500" /> Đang hot
                    </Badge>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 leading-snug">
                  {post.content.substring(0, 100)}{(post.content.length > 100) ? '...' : ''}
                </h1>

                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
                  <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.account?.email || 'default'}`} alt={post.account?.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(post.account?.fullName || "A").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{post.account?.fullName || "Ẩn danh"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      <span className="mx-1">·</span>
                      <Eye className="w-3 h-3" /> {post.views || 0} lượt xem
                    </p>
                  </div>
                </div>

                <RenderContent text={post.content} />

                {post.images && post.images.length > 0 && (
                  <div className={cn(
                    "mt-8 grid gap-4",
                    post.images.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                  )}>
                    {post.images.map((img, index) => (
                      <div key={index} className="rounded-xl overflow-hidden border border-border shadow-sm group bg-muted">
                        <img
                          src={img.imageUrl}
                          alt={`img-${index}`}
                          className="w-full h-auto object-contain max-h-[500px] mx-auto group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 flex-wrap mt-6 pt-5 border-t border-border">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <Badge variant="secondary" className="bg-secondary text-muted-foreground hover:bg-muted border-none text-xs">
                    Thảo luận
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 h-9 ${postLiked ? 'border-primary text-primary bg-primary/5' : ''}`}
                      onClick={handleToggleLike}
                    >
                      <ThumbsUp className={`w-4 h-4 ${postLiked ? 'fill-primary' : ''}`} />
                      {post.likes || 0} Hữu ích
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "gap-1.5 h-9",
                        hasReported ? "text-error bg-red-50" : "text-muted-foreground hover:text-error"
                      )}
                      onClick={() => {
                        if (hasReported) {
                          toast.info("Bạn đã báo cáo bài viết này rồi");
                          return;
                        }
                        setIsReportModalOpen(true);
                      }}
                      disabled={hasReported}
                    >
                      <Flag className={cn("w-4 h-4", hasReported && "fill-red-500")} /> 
                      {hasReported ? "Đã báo cáo" : "Báo cáo"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <div>
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                {post.commentCount || 0} Bình luận
              </h2>

              <div className="flex flex-col gap-5">
                {comments.map(c => (
                  <CommentCard
                    key={c.id}
                    comment={{
                      ...c,
                      author: {
                        name: c.account?.fullName || "Ẩn danh",
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.account?.email || 'default'}`,
                        status: "online",
                        role: c.account?.role?.name || "Member"
                      },
                      createdAt: new Date(c.createdAt).toLocaleString('vi-VN'),
                      replies: (c.replies || []).map(r => ({
                        ...r,
                        author: {
                          name: r.account?.fullName || "Ẩn danh",
                          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.account?.email || 'default'}`,
                          status: "online",
                          role: r.account?.role?.name || "Member"
                        },
                        createdAt: new Date(r.createdAt).toLocaleString('vi-VN')
                      }))
                    }}
                    threadId={id}
                    onCommentAdded={(newReply) => handleCommentAdded(newReply, c.id)}
                    onCommentDeleted={(deletedId) => handleCommentDeleted(deletedId)}
                  />
                ))}
              </div>
            </div>

            {/* Reply Box */}
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Viết bình luận của bạn</h3>
                <Textarea
                  placeholder="Chia sẻ kiến thức hoặc đặt câu hỏi thêm..."
                  className="min-h-[120px] resize-none bg-muted border-border focus:bg-white transition-colors"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end mt-3">
                  <Button
                    className="bg-button-gradient hover:brightness-110 gap-2 font-bold"
                    disabled={!commentText.trim()}
                    onClick={onSendComment}
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
                <h3 className="text-sm font-bold text-foreground mb-4">Thông tin tác giả</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.account?.email || 'default'}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(post.account?.fullName || "A").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">{post.account?.fullName || "Ẩn danh"}</p>
                    <p className="text-xs text-muted-foreground">Email: {post.account?.email}</p>
                  </div>
                </div>
                <Separator className="mb-4" />
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
              </CardContent>
            </Card>

            {/* Post Stats */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
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
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card className="bg-white shadow-sm border-border">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-foreground mb-4">Bài viết liên quan</h3>
                <div className="flex flex-col gap-3">
                  {relatedPosts.length > 0 ? (
                    relatedPosts.map(p => (
                      <Link
                        key={p.id}
                        to={`/forum/${p.id}`}
                        className="group flex flex-col gap-1 hover:bg-muted rounded-md p-2 -mx-2 transition-colors"
                      >
                        <span className="text-xs text-primary font-medium">{p.category?.name || "Thảo luận"}</span>
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {p.content.substring(0, 70)}{p.content.length > 70 ? '...' : ''}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">Không có bài viết liên quan</p>
                  )}
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
        
        {/* Report Modal */}
        <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Báo cáo bài viết</DialogTitle>
              <DialogDescription>
                Vui lòng chọn loại vi phạm và cung cấp thông tin chi tiết để quản trị viên có thể xem xét.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Loại vi phạm <span className="text-error">*</span></label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại vi phạm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spam">Spam / Quảng cáo</SelectItem>
                    <SelectItem value="harassment">Quấy rối / Chửi bới / Lăng mạ</SelectItem>
                    <SelectItem value="inappropriate">Nội dung không phù hợp / Phản cảm</SelectItem>
                    <SelectItem value="copyright">Vi phạm bản quyền</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Chi tiết vi phạm</label>
                <Textarea 
                  placeholder="Nhập thông tin chi tiết về vi phạm (nếu cần)..."
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-end gap-2 text-right">
              <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)} disabled={isSubmittingReport}>
                Hủy
              </Button>
              <Button 
                type="button" 
                className="bg-error/10 text-error hover:bg-error/10 text-error text-white" 
                onClick={onSendReport}
                disabled={isSubmittingReport}
              >
                {isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SectionContainer>
    </div>
  );
};

export default ForumDetail;
