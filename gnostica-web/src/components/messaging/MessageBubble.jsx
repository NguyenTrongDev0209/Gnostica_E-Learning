import React from 'react';
import { cn } from '@/lib/utils';
import MessageDeliveryStatus from './MessageDeliveryStatus';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export default function MessageBubble({ message, currentAccountId, onRetry }) {
  if (!message) return null;

  const isMine =
    typeof message.mine === 'boolean'
      ? message.mine
      : String(message.senderId) === String(currentAccountId);

  const senderName = message.senderName || (isMine ? 'Tôi' : 'Người dùng');
  const avatar = message.senderAvatar || null;
  const timeStr = formatTime(message.createdAt);
  const status = message.deliveryStatus || 'sent';

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : n.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        'flex items-end gap-2 my-2.5 max-w-[85%] sm:max-w-[75%]',
        isMine ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
      )}
    >
      {!isMine && (
        <Avatar className="w-7 h-7 ring-1 ring-border shrink-0 mb-1">
          <AvatarImage src={avatar} alt={senderName} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
            {getInitials(senderName)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere shadow-sm',
            isMine
              ? 'bg-primary text-white rounded-br-none font-medium'
              : 'bg-card text-foreground border border-border/60 rounded-bl-none font-normal'
          )}
          style={{ overflowWrap: 'anywhere' }}
        >
          {message.content}
        </div>

        <div className="flex items-center gap-1.5 mt-1 px-1">
          <span className="text-[11px] text-muted-foreground font-medium">{timeStr}</span>
          {isMine && (
            <MessageDeliveryStatus
              status={status}
              errorText={message.error}
              onRetry={onRetry}
            />
          )}
        </div>
      </div>
    </div>
  );
}
