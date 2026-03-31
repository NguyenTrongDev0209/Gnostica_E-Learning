import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, ThumbsUp, CornerDownRight } from 'lucide-react';
import RenderContent from './RenderContent';

export default function CommentCard({ comment, isNested = false }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <div className={`flex gap-3 ${isNested ? 'ml-8 sm:ml-12 mt-4' : ''}`}>
      <div className="shrink-0 mt-1">
        <Avatar className="w-9 h-9 ring-2 ring-transparent hover:ring-primary/20 transition-all">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {comment.author.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
          {comment.author.status === 'online' && (
            <AvatarBadge className="bg-green-500 border-2 border-white ring-0 w-2.5 h-2.5" />
          )}
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
              {comment.isAccepted && (
                <Badge className="text-[10px] px-1.5 py-0 bg-primary text-white border-none">✓ Được chấp nhận</Badge>
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
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${liked ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-primary' : ''}`} />
            {comment.likes + (liked ? 1 : 0)}
          </button>
          <button className="text-xs font-medium text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
            <CornerDownRight className="w-3.5 h-3.5" /> Trả lời
          </button>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.map(reply => (
          <CommentCard key={reply.id} comment={reply} isNested />
        ))}
      </div>
    </div>
  );
}
