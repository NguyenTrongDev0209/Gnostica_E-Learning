import React from 'react';
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { MessageSquare, Send } from 'lucide-react';
import { AppButton } from "@/components/common/micro/AppButton";
import CommentCard from '@/components/common/composite/CommentCard';
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

export default CommentSection;
