import React, { useState, useMemo } from 'react';
import { Search, WifiOff } from 'lucide-react';
import AppInput from '@/components/common/micro/AppInput';
import ConversationListItem from './ConversationListItem';
import ConversationListSkeleton from './ConversationListSkeleton';
import MessagingErrorState from './MessagingErrorState';
import { useMessagingRealtime } from '@/context/useMessagingRealtime';
import { normalizeConversationSummary } from '@/lib/messaging/conversationNormalizer';

export default function ConversationList({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  isLoading,
  isError,
  onRetry,
  currentAccountId,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const { wsStatus } = useMessagingRealtime();

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.toLowerCase().trim();
    return conversations.filter((raw) => {
      const c = normalizeConversationSummary(raw);
      if (!c) return false;
      const name = (c.otherParticipant?.fullName || '').toLowerCase();
      const courseTitle = (c.course?.title || '').toLowerCase();
      const lastMsg = (c.lastMessageText || '').toLowerCase();

      return name.includes(term) || courseTitle.includes(term) || lastMsg.includes(term);
    });
  }, [conversations, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/60">
      {/* Header & Search */}
      <div className="p-4 border-b border-border/60 space-y-3">
        <h2 className="text-lg font-bold text-foreground tracking-tight">Hộp thư tin nhắn</h2>
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <AppInput
            type="text"
            placeholder="Tìm theo tên hoặc khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9 rounded-xl bg-muted/50 border-border/60"
          />
        </div>

        {wsStatus === 'RECONNECTING' && (
          <div className="flex items-center gap-2 p-2 bg-warning/10 text-warning text-xs font-semibold rounded-xl border border-warning/20">
            <WifiOff className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span>Đang kết nối lại máy chủ...</span>
          </div>
        )}
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : isError ? (
          <MessagingErrorState
            title="Lỗi tải danh sách"
            description="Không thể kết nối đến máy chủ tin nhắn."
            onRetry={onRetry}
          />
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <p className="text-sm font-bold text-foreground mb-1">
              {searchTerm ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchTerm ? 'Vui lòng thử từ khóa tìm kiếm khác.' : 'Các cuộc trò chuyện của bạn sẽ xuất hiện ở đây.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={c}
              isSelected={String(c.id) === String(selectedConversationId)}
              onClick={() => onSelectConversation(c.id)}
              currentAccountId={currentAccountId}
            />
          ))
        )}
      </div>
    </div>
  );
}
