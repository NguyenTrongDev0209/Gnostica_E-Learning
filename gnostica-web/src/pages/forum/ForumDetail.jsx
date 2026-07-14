import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Clock, Eye, Tag, Flame, ThumbsUp, ArrowUp, ArrowDown, Share2, Flag
} from 'lucide-react';
import { cn } from "@/lib/utils";
import RenderContent from '@/components/common/core/RenderContent';
import useForumDetail from '@/hooks/forum/useForumDetail';
import { toast } from 'sonner';
import { AppButton } from "@/components/common/micro/AppButton";
import ForumDetailSidebar from './components/ForumDetailSidebar';
import ReportPostModal from './components/ReportPostModal';
import CommentSection from './components/CommentSection';

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
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs font-semibold">
                    {post.topic?.title || "Thảo luận"}
                  </Badge>
                  {(post.views || 0) > 100 && (
                    <Badge className="bg-warning/10 text-warning border-none text-xs font-semibold gap-1">
                      <Flame className="w-3 h-3 fill-warning" /> Đang hot
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
              </CardContent>
            </Card>

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
