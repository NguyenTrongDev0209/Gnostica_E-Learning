import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { normalizeConversationSummary } from '@/lib/messaging/conversationNormalizer';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffHours = (now - date) / (1000 * 60 * 60);

  if (diffHours < 24 && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  if (diffHours < 48) {
    return 'Hôm qua';
  }

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export default function ConversationListItem({ conversation, isSelected, onClick, currentAccountId }) {
  if (!conversation) return null;

  const norm = normalizeConversationSummary(conversation, currentAccountId);
  if (!norm) return null;

  const { otherParticipant, course, lastMessageText, lastMessageAt, unreadCount } = norm;

  const name = otherParticipant?.fullName || '';
  const avatar = otherParticipant?.avatar || null;
  const role = otherParticipant?.roleName || 'Học viên';
  const courseTitle = course?.title || '';
  const timeStr = formatTime(lastMessageAt);

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : n.substring(0, 2).toUpperCase();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left p-3.5 rounded-2xl transition-all flex items-start gap-3 border mb-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isSelected
          ? 'bg-primary/10 border-primary/20 shadow-sm ring-1 ring-primary/20'
          : 'bg-card border-border/40 hover:bg-muted/60 hover:border-border'
      )}
    >
      <Avatar className="w-11 h-11 ring-2 ring-border shrink-0 mt-0.5">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="font-bold text-sm text-foreground truncate">{name}</span>
          <span className="text-[11px] font-medium text-muted-foreground shrink-0">{timeStr}</span>
        </div>

        {courseTitle && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium border-primary/20 text-primary bg-primary/5 shrink-0">
              {role}
            </Badge>
            <span className="text-[11px] text-muted-foreground truncate font-medium">
              {courseTitle}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-xs truncate font-medium',
            unreadCount > 0 ? 'text-foreground font-bold' : 'text-muted-foreground'
          )}>
            {lastMessageText}
          </p>

          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-[18px] text-center shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
