import React from 'react';
import ConversationList from './ConversationList';
import ConversationHeader from './ConversationHeader';
import MessageThread from './MessageThread';
import MessageComposer from './MessageComposer';
import MessagingEmptyState from './MessagingEmptyState';

export default function MessagingShell({
  mode = 'account',
  conversations = [],
  activeConversation,
  selectedConversationId,
  onSelectConversation,
  onBackMobile,
  isConversationsLoading,
  isConversationsError,
  onRetryConversations,
  isConversationLoading,
  isConversationError,
  messages = [],
  isMessagesLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  currentAccountId,
  onSendMessage,
  onRetryMessage,
  onMarkRead,
  isSendMessagePending,
}) {
  const hasSelectedConversation = Boolean(selectedConversationId);

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden min-h-0">
      {/* Left Column: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
          hasSelectedConversation ? 'hidden md:block' : 'block'
        }`}
      >
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={onSelectConversation}
          isLoading={isConversationsLoading}
          isError={isConversationsError}
          onRetry={onRetryConversations}
          currentAccountId={currentAccountId}
        />
      </div>

      {/* Right Column: Chat Thread or Empty State */}
      <div
        className={`flex-1 flex flex-col h-full min-h-0 min-w-0 ${
          hasSelectedConversation ? 'block' : 'hidden md:flex'
        }`}
      >
        {hasSelectedConversation ? (
          <>
            <ConversationHeader
              conversation={activeConversation}
              onBack={onBackMobile}
              currentAccountId={currentAccountId}
              isLoading={isConversationLoading}
              isError={isConversationError}
            />

            <MessageThread
              conversationId={selectedConversationId}
              messages={messages}
              isLoading={isMessagesLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
              currentAccountId={currentAccountId}
              onSendMessage={onSendMessage}
              onRetryMessage={onRetryMessage}
              onMarkRead={onMarkRead}
            />

            <MessageComposer
              onSendMessage={onSendMessage}
              isPending={isSendMessagePending}
            />
          </>
        ) : (
          <MessagingEmptyState
            title="Chưa chọn cuộc trò chuyện"
            description={
              mode === 'instructor'
                ? 'Chọn một học viên từ danh sách để xem lịch sử nhắn tin.'
                : 'Chọn một khóa học hoặc giảng viên từ danh sách để bắt đầu trò chuyện.'
            }
          />
        )}
      </div>
    </div>
  );
}
