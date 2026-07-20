import React, { useState } from 'react';
import AppAvatar from "@/components/common/micro/AppAvatar";
import { Clock, CornerDownRight, MessageSquare, Send } from 'lucide-react';
import RenderContent from '@/components/common/core/RenderContent';
import commentService from '@/services/forum/commentService';
import { AppButton } from '@/components/common/micro/AppButton';
import { toast } from 'sonner';
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import AppAlertDialog from "@/components/common/micro/AppAlertDialog";

const REPLY_BATCH_SIZE = 5;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const getAuthorName = (comment) => comment?.author?.name || comment?.account?.fullName || "Ẩn danh";

const flattenReplies = (replies = [], parentAuthorName) => replies.flatMap((reply) => [
  { ...reply, parentAuthorName },
  ...flattenReplies(reply.replies || [], getAuthorName(reply)),
]);

const getCommentBadges = (comment, threadAuthorEmail, topicOwnerEmail) => {
  const email = comment?.author?.email || comment?.account?.email;
  return [
    email && threadAuthorEmail && email === threadAuthorEmail ? "OP" : null,
    email && topicOwnerEmail && email === topicOwnerEmail ? "MOD" : null,
  ].filter(Boolean);
};

export default function CommentCard({
  comment,
  isReply = false,
  threadId,
  onCommentAdded,
  onCommentDeleted,
  parentAuthorName,
  rootCommentId,
  threadAuthorEmail,
  topicOwnerEmail,
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [visibleReplyCount, setVisibleReplyCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowMore, setShouldShowMore] = useState(false);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    setIsExpanded(false);
  }, [comment.content]);

  React.useEffect(() => {
    if (!contentRef.current) return undefined;

    const checkOverflow = () => {
      if (contentRef.current && !isExpanded) {
        setShouldShowMore(contentRef.current.scrollHeight > contentRef.current.clientHeight);
      }
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(contentRef.current);
    window.addEventListener('resize', checkOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [comment.content, isExpanded]);

  const collapsedStyle = {
    maxHeight: '120px',
    overflow: 'hidden',
  };

  const handleSendReply = async () => {
    const isReplyEmpty = !replyContent || replyContent.replace(/<[^>]*>/g, '').trim() === '';
    if (isReplyEmpty) return;

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userEmail = userData?.email;
      const parentId = isReply && rootCommentId ? rootCommentId : comment.id;

      const newComment = await commentService.addComment({
        content: replyContent,
        threadId,
        userEmail,
        parentId,
      });

      if (onCommentAdded) {
        onCommentAdded(newComment);
        toast.success("Đã gửi câu trả lời");
      }

      setReplyContent('');
      setShowReply(false);
    } catch (err) {
      console.error("Error sending reply:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      toast.error("Lỗi khi trả lời: " + errorMsg);
    }
  };

  const handleDelete = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userEmail = userData?.email;

      await commentService.deleteComment(comment.id, userEmail);

      if (onCommentDeleted) {
        onCommentDeleted(comment.id);
        toast.success("Đã xóa bình luận");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      toast.error("Lỗi khi xóa: " + errorMsg);
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwner = currentUser?.email === comment.account?.email;
  const isThreadOwner = currentUser?.email && threadAuthorEmail && currentUser.email === threadAuthorEmail;
  const flattenedReplies = isReply ? [] : flattenReplies(comment.replies || [], getAuthorName(comment));
  const visibleReplies = flattenedReplies.slice(0, visibleReplyCount);
  const remainingReplies = Math.max(flattenedReplies.length - visibleReplyCount, 0);
  const commentBadges = getCommentBadges(comment, threadAuthorEmail, topicOwnerEmail);

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-8 sm:ml-16 mt-4' : ''}`}>
      <div className="shrink-0 mt-1">
        <AppAvatar
          size="md"
          className="w-9 h-9 ring-2 ring-transparent hover:ring-primary/20 transition-all"
          src={comment.author.avatar}
          alt={comment.author.name}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`rounded-xl bg-white p-4 ${comment.isAccepted ? 'border border-primary/20' : 'border border-border'}`}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{comment.author.name}</span>
              {parentAuthorName && (
                <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-semibold text-primary">
                  trả lời @{parentAuthorName}
                </span>
              )}
              {commentBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-md border border-accent/20 bg-accent/10 px-1.5 py-0 text-[10px] font-bold text-accent"
                >
                  {badge}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {comment.createdAt}
            </span>
          </div>

          <div ref={contentRef} style={!isExpanded ? collapsedStyle : undefined} className="relative">
            <RenderContent text={comment.content} />
            {shouldShowMore && !isExpanded && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
            )}
          </div>
          {shouldShowMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 block text-xs font-semibold text-primary transition-colors hover:text-primary/80 focus:outline-none"
            >
              {isExpanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3 px-1">
          <button
            onClick={() => setShowReply(!showReply)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <CornerDownRight className="h-3.5 w-3.5" /> Trả lời
          </button>

          {!isReply && remainingReplies > 0 && (
            <button
              onClick={() => setVisibleReplyCount((count) => Math.min(count + REPLY_BATCH_SIZE, flattenedReplies.length))}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {remainingReplies} phản hồi
            </button>
          )}

          {(isOwner || isThreadOwner) && (
            <AppAlertDialog
              trigger={
                <button className="text-xs font-medium text-muted-foreground transition-colors hover:text-error">
                  Xóa
                </button>
              }
              title="Xác nhận xóa bình luận?"
              description="Hành động này không thể hoàn tác. Bình luận của bạn và các phản hồi liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống."
              confirmText="Xóa bình luận"
              cancelText="Hủy"
              onConfirm={handleDelete}
              variant="destructive"
            />
          )}
        </div>

        {showReply && (
          <div className="mt-3 rounded-lg border border-border bg-white p-3 shadow-sm">
            <div className="relative z-0 mb-3 overflow-hidden rounded-lg border border-border bg-white transition-all focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <ReactQuill
                theme="snow"
                value={replyContent}
                onChange={(val) => setReplyContent(val)}
                modules={quillModules}
                placeholder="Viết câu trả lời của bạn..."
                className="[&_.ql-toolbar.ql-snow]:!border-0 [&_.ql-toolbar.ql-snow]:!border-b [&_.ql-toolbar.ql-snow]:!border-border [&_.ql-toolbar]:bg-muted [&_.ql-container.ql-snow]:!border-0 [&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-foreground font-sans"
              />
            </div>
            <div className="flex justify-end gap-2">
              <AppButton size="sm" variant="ghost" onClick={() => setShowReply(false)}>Hủy</AppButton>
              <AppButton
                size="sm"
                className="bg-accent-gradient font-bold text-white"
                onClick={handleSendReply}
                disabled={!replyContent || replyContent.replace(/<[^>]*>/g, '').trim() === ''}
              >
                <Send className="mr-1 h-3 w-3" /> Trả lời
              </AppButton>
            </div>
          </div>
        )}

        {visibleReplies.map((reply) => (
          <CommentCard
            key={reply.id}
            comment={reply}
            isReply
            threadId={threadId}
            onCommentAdded={onCommentAdded}
            onCommentDeleted={onCommentDeleted}
            parentAuthorName={reply.parentAuthorName}
            rootCommentId={comment.id}
            threadAuthorEmail={threadAuthorEmail}
            topicOwnerEmail={topicOwnerEmail}
          />
        ))}
      </div>
    </div>
  );
}
