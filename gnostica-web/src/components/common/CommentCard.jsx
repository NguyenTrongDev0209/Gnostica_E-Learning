import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, CornerDownRight, Send } from 'lucide-react';
import RenderContent from './RenderContent';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function CommentCard({ comment, isNested = false, threadId, onCommentAdded }) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const userEmail = userData?.email;
      
      const res = await axios.post('http://localhost:8080/api/comments', {
        content: replyContent,
        objectId: threadId,
        userEmail: userEmail, // Gửi email thay vì dùng token
        parentId: comment.id
      });
      
      if (onCommentAdded) onCommentAdded(res.data);
      setReplyContent('');
      setShowReply(false);
    } catch (err) {
      console.error("Error sending reply:", err);
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      alert("Lỗi khi trả lời bình luận: " + errorMsg);
    }
  };
  
  return (
    <div className={`flex gap-3 ${isNested ? 'ml-8 sm:ml-12 mt-4 border-l-2 border-slate-100 pl-4' : ''}`}>
      <div className="shrink-0 mt-1">
        <Avatar className="w-9 h-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {comment.author.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`rounded-xl p-4 ${comment.isAccepted ? 'bg-primary/5 border border-primary/20' : 'bg-slate-50 border border-slate-100'}`}>
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800">{comment.author.name}</span>
              {comment.author.role && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 border-none text-slate-500">
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
          {!isNested && ( // Hỗ trợ trả lời 1 cấp cho đơn giản
            <button 
              onClick={() => setShowReply(!showReply)}
              className="text-xs font-medium text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              <CornerDownRight className="w-3.5 h-3.5" /> Trả lời
            </button>
          )}
        </div>

        {/* Reply Input Box */}
        {showReply && (
          <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <Textarea
              placeholder="Viết câu trả lời của bạn..."
              className="min-h-[80px] text-sm resize-none mb-2"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowReply(false)}>Hủy</Button>
              <Button size="sm" className="bg-button-gradient font-bold" onClick={handleSendReply}>
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
          />
        ))}
      </div>
    </div>
  );
}
