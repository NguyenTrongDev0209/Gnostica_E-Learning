import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, CornerDownRight, Send } from 'lucide-react';
import RenderContent from '@/components/common/core/RenderContent';
import commentService from '@/services/forum/commentService';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CommentCard({ comment, isNested = false, threadId, onCommentAdded, onCommentDeleted, parentAuthorName }) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleSendReply = async () => {
    const isReplyEmpty = !replyContent || replyContent.replace(/<[^>]*>/g, '').trim() === '';
    if (isReplyEmpty) return;
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userEmail = userData?.email;
      
      const newComment = await commentService.addComment({
        content: replyContent,
        threadId: threadId,
        userEmail: userEmail, // Gửi email thay vì dùng token
        parentId: comment.id
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

  return (
    <div className={`flex gap-3 ${isNested ? 'ml-8 sm:ml-12 mt-4 border-l-2 border-border pl-4' : ''}`}>
      <div className="shrink-0 mt-1">
        <Avatar className="w-9 h-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {comment.author.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`rounded-xl p-4 ${comment.isAccepted ? 'bg-primary/5 border border-primary/20' : 'bg-muted border border-border'}`}>
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{comment.author.name}</span>
              {parentAuthorName && (
                <span className="text-xs text-muted-foreground">
                  trả lời <span className="font-semibold text-foreground">@{parentAuthorName}</span>
                </span>
              )}
              {comment.author.role && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-secondary border-none text-muted-foreground">
                  {comment.author.role}
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {comment.createdAt}
            </span>
          </div>
          <RenderContent text={comment.content} />
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-3 mt-2 px-1">
          <button 
            onClick={() => setShowReply(!showReply)}
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <CornerDownRight className="w-3.5 h-3.5" /> Trả lời
          </button>
          
          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button 
                  className="text-xs font-medium text-muted-foreground hover:text-error transition-colors"
                >
                  Xóa
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa bình luận?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Bình luận của bạn và các phản hồi liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border">Hủy</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-error/10 text-error hover:bg-error/10 text-error text-white font-bold"
                  >
                    Xóa bình luận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Reply Input Box */}
        {showReply && (
          <div className="mt-3 bg-white p-3 rounded-lg border border-border shadow-sm">
            <div className="rounded-lg border border-border overflow-hidden focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 transition-all bg-white relative z-0 mb-3">
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
              <Button size="sm" variant="ghost" onClick={() => setShowReply(false)}>Hủy</Button>
              <Button 
                size="sm" 
                className="bg-accent-gradient font-bold" 
                onClick={handleSendReply}
                disabled={!replyContent || replyContent.replace(/<[^>]*>/g, '').trim() === ''}
              >
                <Send className="w-3 h-3 mr-1" /> Trả lời
              </Button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.map(reply => (
          <CommentCard 
            key={reply.id} 
            comment={reply} 
            isNested 
            threadId={threadId}
            onCommentAdded={onCommentAdded}
            onCommentDeleted={onCommentDeleted}
            parentAuthorName={comment.author.name}
          />
        ))}
      </div>
    </div>
  );
}
