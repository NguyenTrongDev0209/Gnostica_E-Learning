import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppAvatar from "@/components/common/micro/AppAvatar";
import AppBadge from "@/components/common/micro/AppBadge";
import AppSeparator from "@/components/common/micro/AppSeparator";
import {
  Clock, Eye, Tag, Flame, ThumbsUp, ArrowUp, ArrowDown, Share2, Flag, MessageSquare, Send, ChevronLeft
} from 'lucide-react';
import { cn } from "@/lib/utils";
import RenderContent from '@/components/common/core/RenderContent';
import useForumDetail from '@/hooks/forum/useForumDetail';
import { toast } from 'sonner';
import { AppButton } from "@/components/common/micro/AppButton";
import {
  AppDialog,
  AppDialogContent,
  AppDialogHeader,
  AppDialogTitle,
  AppDialogDescription,
  AppDialogFooter,
} from "@/components/common/micro/AppDialog";
import AppSelect from "@/components/common/micro/AppSelect";
import AppTextarea from "@/components/common/micro/AppTextarea";
import CommentCard from '@/components/common/composite/CommentCard';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// ── ForumDetailSidebar ──
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

// ── ReportPostModal ──
const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const ReportPostModal = ({
  isOpen,
  onOpenChange,
  reportType,
  setReportType,
  reportDetail,
  setReportDetail,
  onSendReport,
  isSubmittingReport
}) => {
  return (
    <AppDialog open={isOpen} onOpenChange={onOpenChange}>
      <AppDialogContent className="sm:max-w-md">
        <AppDialogHeader>
          <AppDialogTitle>Báo cáo bài viết</AppDialogTitle>
          <AppDialogDescription>
            Vui lòng chọn loại vi phạm và cung cấp thông tin chi tiết để quản trị viên có thể xem xét.
          </AppDialogDescription>
        </AppDialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Loại vi phạm <span className="text-error">*</span></label>
            <AppSelect 
              value={reportType} 
              onValueChange={setReportType}
              placeholder="Chọn loại vi phạm"
              options={[
                { value: "spam", label: "Spam / Quảng cáo" },
                { value: "harassment", label: "Quấy rối / Chửi bới / Lăng mạ" },
                { value: "inappropriate", label: "Nội dung không phù hợp / Phản cảm" },
                { value: "copyright", label: "Vi phạm bản quyền" },
                { value: "other", label: "Khác" }
              ]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Chi tiết vi phạm</label>
            <AppTextarea
              placeholder="Nhập thông tin chi tiết về vi phạm (nếu cần)..."
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>
        <AppDialogFooter className="sm:justify-end gap-2 text-right">
          <AppButton appVariant="ghostMuted" variant="ghost" type="button" className="border border-border" onClick={() => onOpenChange(false)} disabled={isSubmittingReport}>
            Hủy
          </AppButton>
          <AppButton appVariant="destructive"
            type="button"
            onClick={onSendReport}
            disabled={isSubmittingReport}
          >
            {isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}
          </AppButton>
        </AppDialogFooter>
      </AppDialogContent>
    </AppDialog>
  );
};

// ── CommentSection ──
const CommentSection = ({
  post,
  comments,
  commentText,
  setCommentText,
  onSendComment,
  handleCommentAdded,
  handleCommentDeleted
}) => {
  return (
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
      <AppCard appVariant="default" className="bg-white border-border shadow-sm mt-6">
        <AppCardContent className="p-5">
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
            <AppButton appVariant="gradient"
              className="gap-2"
              disabled={!commentText || commentText.replace(/<[^>]*>/g, '').trim() === ''}
              onClick={onSendComment}
            >
              <Send className="w-4 h-4" /> Gửi bình luận
            </AppButton>
          </div>
        </AppCardContent>
      </AppCard>
    </>
  );
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
            <AppButton appVariant="ghostMuted" variant="ghost" className="bg-accent-gradient text-white w-full">Quay lại Diễn đàn</AppButton>
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
      <PageContainer.Section className="w-full app-container">
        <AppBreadcrumb paths={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Main Content ── */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">

            {/* Post Card */}
            <AppCard appVariant="default" className="bg-white border-border shadow-sm">
              <AppCardContent className="p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <AppBadge variant="primary" soft className="text-xs font-semibold">
                    {post.topic?.title || "Thảo luận"}
                  </AppBadge>
                  {(post.views || 0) > 100 && (
                    <AppBadge variant="warning" soft className="text-xs font-semibold gap-1">
                      <Flame className="w-3 h-3 fill-warning" /> Đang hot
                    </AppBadge>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5 leading-snug">
                  {post.title || ''}
                </h1>

                <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
                  <AppAvatar 
                    className="w-10 h-10 ring-2 ring-primary/10"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.account?.email || 'default'}`} 
                    alt={post.account?.fullName || "Ẩn danh"}
                    fallback={(post.account?.fullName || "A").substring(0, 2).toUpperCase()}
                  />
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
                        <AppBadge variant="primary" soft className="text-xs font-semibold cursor-pointer">
                          #{th.hashtag?.name}
                        </AppBadge>
                      </Link>
                    ))
                  ) : (
                    <AppBadge variant="secondary" soft className="text-xs">
                      Thảo luận
                    </AppBadge>
                  )}
                </div>

                {isOwnerViewingPending ? (
                  <div className="mt-5 pt-5 border-t border-border">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-warning-soft border border-warning/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <p className="text-sm text-warning font-medium">
                        Bài viết đang chờ kiểm duyệt &mdash; các tương tác sẽ được mở khóa sau khi bài được phê duyệt.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-5 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-secondary rounded-full px-3 py-1 h-9 border border-transparent">
                        <button
                          onClick={() => handleVote(1)}
                          className={cn(
                            "p-1 hover:text-primary rounded-full transition-colors",
                            postVoteStatus === 1 && "text-primary font-bold"
                          )}
                          title="Bình chọn lên"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className={cn(
                          "px-1.5 font-semibold text-sm min-w-[20px] text-center",
                          postVoteStatus === 1 && "text-primary",
                          postVoteStatus === -1 && "text-info"
                        )}>
                          {post.voteScore || 0}
                        </span>
                        <button
                          onClick={() => handleVote(-1)}
                          className={cn(
                            "p-1 hover:text-info rounded-full transition-colors",
                            postVoteStatus === -1 && "text-info font-bold"
                          )}
                          title="Bình chọn xuống"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <AppButton appVariant="ghostMuted" variant="ghost"
                        size="sm"
                        className={`gap-1.5 h-9 border border-border ${postLiked ? 'border-primary text-primary bg-primary/5' : ''}`}
                        onClick={handleToggleLike}
                      >
                        <ThumbsUp className={`w-4 h-4 ${postLiked ? 'fill-primary' : ''}`} />
                        {post.likes || 0} Hữu ích
                      </AppButton>
                    </div>
                    <div className="flex items-center gap-2">
                      <AppButton appVariant="ghostMuted" variant="ghost"
                        size="sm"
                        className="gap-1.5 h-9 text-muted-foreground hover:text-primary transition-all"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4" />
                        Chia sẻ
                      </AppButton>

                      <AppButton appVariant="ghostMuted" variant="ghost" 
                        size="sm" 
                        className={cn(
                          "gap-1.5 h-9",
                          hasReported ? "text-error bg-error/10" : "text-muted-foreground hover:text-error hover:bg-error/10"
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
                        <Flag className={cn("w-4 h-4", hasReported && "fill-error")} /> 
                        {hasReported ? "Đã báo cáo" : "Báo cáo"}
                      </AppButton>
                    </div>
                  </div>
                )}
              </AppCardContent>
            </AppCard>

            {/* Comments Section */}
            {!isOwnerViewingPending && (
              <CommentSection
                post={post}
                comments={comments}
                commentText={commentText}
                setCommentText={setCommentText}
                onSendComment={onSendComment}
                handleCommentAdded={handleCommentAdded}
                handleCommentDeleted={handleCommentDeleted}
              />
            )}
          </div>

          {/* ── Sidebar ── */}
          <ForumDetailSidebar post={post} relatedPosts={relatedPosts} />
        </div>
        
        {/* Report Modal */}
        <ReportPostModal
          isOpen={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
          reportType={reportType}
          setReportType={setReportType}
          reportDetail={reportDetail}
          setReportDetail={setReportDetail}
          onSendReport={onSendReport}
          isSubmittingReport={isSubmittingReport}
        />
      </PageContainer.Section>
    </div>
  );
};

export default ForumDetail;
