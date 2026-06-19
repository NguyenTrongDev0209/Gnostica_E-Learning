import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Target, AlertTriangle, RefreshCw, XCircle, CheckCircle2, ChevronRight, Loader2, Info, User, Trash, CornerDownRight, ChevronDown, ChevronUp, Send, MessageSquare } from "lucide-react";
import courseService from "@/services/courseService";
import commentService from "@/services/commentService";
import useAuthStore from "@/store/useAuthStore";

export default function LessonQA({ lesson }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collapsedComments, setCollapsedComments] = useState(new Set());
  const currentUser = useAuthStore(state => state.user);

  const toggleCollapse = (id) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const fetchComments = useCallback(async () => {
    if (!lesson?.id) return;
    setLoading(true);
    try {
      const data = await commentService.getCommentsByThreadId(`lesson_${lesson.id}`);
      setComments(data || []);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  }, [lesson?.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e, parentId = null) => {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    if (!content.trim() || !currentUser?.email) return;

    setIsSubmitting(true);
    try {
      await commentService.addComment({
        content,
        objectId: `lesson_${lesson.id}`,
        userEmail: currentUser.email,
        parentId
      });
      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
      fetchComments();
    } catch (error) {
      alert(error?.response?.data || "Đã xảy ra lỗi khi gửi bình luận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      await commentService.deleteComment(id, currentUser.email);
      fetchComments();
    } catch (error) {
      alert("Xóa bình luận thất bại.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-4 ${isReply ? 'mt-4' : 'mt-6 pt-6 border-t border-border'}`}>
      <Avatar className="w-10 h-10 border border-border shrink-0">
        <AvatarImage src={comment.account?.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {comment.account?.fullName?.charAt(0) || <User className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted border border-border rounded-2xl rounded-tl-none p-4 relative group">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm text-foreground">{comment.account?.fullName || "Người dùng"}</span>
            <span className="text-xs text-muted-foreground font-medium">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
          
          {currentUser?.email === comment.account?.email && (
            <button 
              onClick={() => handleDelete(comment.id)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-2 ml-2">
          <button 
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <CornerDownRight className="w-3.5 h-3.5" /> Phản hồi
          </button>
          {comment.replies && comment.replies.length > 0 && (
            <button 
              onClick={() => toggleCollapse(comment.id)}
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              {collapsedComments.has(comment.id) ? (
                <><ChevronDown className="w-3.5 h-3.5" /> Hiển thị {comment.replies.length} phản hồi</>
              ) : (
                <><ChevronUp className="w-3.5 h-3.5" /> Ẩn phản hồi</>
              )}
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Viết phản hồi..."
              className="flex-1 text-sm rounded-md border-border focus:border-primary focus:ring-primary/20"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={isSubmitting || !replyContent.trim()} className="rounded-md px-4">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && !collapsedComments.has(comment.id) && (
          <div className="pl-4 border-l-2 border-border mt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 border border-border shadow-sm">
      <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-primary" /> Thảo luận bài học
      </h3>

      <form onSubmit={(e) => handleSubmit(e, null)} className="mb-8">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12 border border-border shrink-0">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {currentUser?.fullName?.charAt(0) || <User className="w-6 h-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Bạn có câu hỏi gì về bài học này?"
              className="w-full rounded-2xl border-border focus:border-primary focus:ring-primary/20 min-h-[100px] p-4 text-sm resize-y shadow-sm"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()} 
              className="absolute bottom-3 right-3 rounded-xl gap-2 h-9 px-4 shadow-md font-bold"
            >
              Gửi <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map(c => renderComment(c, false))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground bg-muted rounded-2xl border border-dashed border-border">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold">Chưa có bình luận nào.</p>
          <p className="text-sm mt-1 opacity-80">Hãy là người đầu tiên đặt câu hỏi!</p>
        </div>
      )}
    </div>
  );
}
