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
  Flag, Send, ArrowUp, ArrowDown, Share2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import RenderContent from '@/components/common/RenderContent';
import CommentCard from '@/components/common/CommentCard';
import useForumDetail from '@/hooks/forum/useForumDetail';
import { toast } from 'sonner';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const quillModules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
    ],
};

const ForumDetail = () => {
  const { slug } = useParams();
  
  const {
    post,
    comments,
    isLoading,
    error,
    currentUser,
    postLiked,
    postVoteStatus,
    relatedPosts,
    hasReported,
    isSubmittingReport,
    handleSendReport,
    handleSendComment,
    handleToggleLike,
    handleVote,
    handleCommentAdded,
    handleCommentDeleted
  } = useForumDetail(slug);

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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/forum/${slug}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success("Đã sao chép liên kết chia sẻ!");
      })
      .catch(() => {
        toast.error("Không thể sao chép liên kết!");
      });
  };

  // Status 2 = Published. Any other status means pending/draft/hidden.
  // If the current user is the post owner AND the post is not published yet,
  // hide interactive elements (like, report, comments).
  const isOwnerViewingPending = post
    && currentUser?.email
    && post.account?.email === currentUser.email
    && post.status !== 2;

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
    { label: post.title ? (post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title) : '', isLast: true }
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
                    {post.topic?.title || "Thảo luận"}
                  </Badge>
                  {(post.views || 0) > 100 && (
                    <Badge className="bg-warning/10 text-warning text-warning border-none text-xs font-semibold gap-1">
                      <Flame className="w-3 h-3 fill-orange-500" /> Đang hot
                    </Badge>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 leading-snug">
                  {post.title || ''}
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

                <div className="flex items-center gap-2 flex-wrap mt-6 pt-5 border-t border-border">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  {post.hashtags && post.hashtags.length > 0 ? (
                    post.hashtags.map(th => (
                      <Link
                        key={th.id}
                        to={`/forum?tag=${encodeURIComponent(th.hashtag?.name || '')}`}
                        className="inline-flex"
                      >
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          #{th.hashtag?.name}
                        </Badge>
                      </Link>
                    ))
                  ) : (
                    <Badge variant="secondary" className="bg-secondary text-muted-foreground hover:bg-muted border-none text-xs">
                      Thảo luận
                    </Badge>
                  )}
                </div>

                {isOwnerViewingPending ? (
                  <div className="mt-5 pt-5 border-t border-border">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <p className="text-sm text-amber-700 font-medium">
                        Bài viết đang chờ kiểm duyệt &mdash; các tương tác sẽ được mở khóa sau khi bài được phê duyệt.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      {/* Voting Pill */}
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1 h-9 border border-transparent">
                        <button
                          onClick={() => handleVote(1)}
                          className={cn(
                            "p-1 hover:text-orange-500 rounded-full transition-colors",
                            postVoteStatus === 1 && "text-orange-500 font-bold"
                          )}
                          title="Bình chọn lên"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className={cn(
                          "px-1.5 font-semibold text-sm min-w-[20px] text-center",
                          postVoteStatus === 1 && "text-orange-500",
                          postVoteStatus === -1 && "text-blue-500"
                        )}>
                          {post.voteScore || 0}
                        </span>
                        <button
                          onClick={() => handleVote(-1)}
                          className={cn(
                            "p-1 hover:text-blue-500 rounded-full transition-colors",
                            postVoteStatus === -1 && "text-blue-500 font-bold"
                          )}
                          title="Bình chọn xuống"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

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
                        className="gap-1.5 h-9 text-muted-foreground hover:text-primary transition-all"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4" />
                        Chia sẻ
                      </Button>

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
                )}
              </CardContent>
            </Card>

            {/* Comments Section - hidden for owner while pending */}
            {!isOwnerViewingPending && (
              <>
                <div>
                  <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    {post.commentCount || 0} Bình luận
                  </h2>

                  <div className="flex flex-col gap-5">
                    {(() => {
                      const mapComment = (comment) => {
                        return {
                          ...comment,
                          author: {
                            name: comment.account?.fullName || "Ẩn danh",
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.account?.email || 'default'}`,
                            status: "online",
                            role: comment.account?.role?.name || "Member"
                          },
                          createdAt: new Date(comment.createdAt).toLocaleString('vi-VN'),
                          replies: (comment.replies || []).map(r => mapComment(r))
                        };
                      };
                      return comments.map(c => (
                        <CommentCard
                          key={c.id}
                          comment={mapComment(c)}
                          threadId={post.id}
                          onCommentAdded={(newReply) => handleCommentAdded(newReply, c.id)}
                          onCommentDeleted={(deletedId) => handleCommentDeleted(deletedId)}
                        />
                      ));
                    })()}
                  </div>
                </div>

                {/* Reply Box */}
                <Card className="bg-white border-border shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-bold text-foreground mb-3">Viết bình luận của bạn</h3>
                    <div className="rounded-lg border border-border overflow-hidden focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all bg-white relative z-0">
                      <ReactQuill
                        theme="snow"
                        value={commentText}
                        onChange={(val) => setCommentText(val)}
                        modules={quillModules}
                        placeholder="Chia sẻ kiến thức hoặc đặt câu hỏi thêm..."
                        className="[&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-toolbar.ql-snow]:!border-b [&_.ql-toolbar.ql-snow]:!border-border [&_.ql-toolbar]:bg-muted [&_.ql-container.ql-snow]:!border-0 [&_.ql-container]:min-h-[150px] [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-foreground font-sans"
                      />
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        className="bg-button-gradient hover:brightness-110 gap-2 font-bold"
                        disabled={!commentText || commentText.replace(/<[^>]*>/g, '').trim() === ''}
                        onClick={onSendComment}
                      >
                        <Send className="w-4 h-4" /> Gửi bình luận
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
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
