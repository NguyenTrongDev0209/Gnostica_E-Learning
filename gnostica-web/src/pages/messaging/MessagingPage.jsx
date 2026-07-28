import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import { useConversations } from '@/hooks/messaging/useConversations';
import { useConversation } from '@/hooks/messaging/useConversation';
import { useMessages } from '@/hooks/messaging/useMessages';
import { useSendMessage } from '@/hooks/messaging/useSendMessage';
import { useMarkConversationRead } from '@/hooks/messaging/useMarkConversationRead';
import MessagingShell from '@/components/messaging/MessagingShell';

export default function MessagingPage({ mode = 'account' }) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const currentAccountId = user?.id || user?.accountId || null;

  // Conversations list query
  const {
    data: conversationsPage,
    isLoading: isConversationsLoading,
    isError: isConversationsError,
    refetch: refetchConversations,
  } = useConversations({ page: 0, size: 50 });

  const conversations = conversationsPage?.content || conversationsPage?.items || [];

  // Active conversation detail query
  const {
    data: activeConversation,
    isLoading: isConversationLoading,
    isError: isConversationError,
  } = useConversation(conversationId);

  const fallbackConversation = conversations.find(
    (c) => String(c.id) === String(conversationId)
  );

  const effectiveActiveConversation = activeConversation || fallbackConversation || null;

  // Messages query
  const {
    messages,
    isLoading: isMessagesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMessages(conversationId);

  // Send message mutation
  const { mutate: sendMessage, isPending: isSendMessagePending } =
    useSendMessage(conversationId);

  // Mark conversation read mutation
  const { mutate: markRead } = useMarkConversationRead(conversationId);

  const handleSelectConversation = (id) => {
    navigate(`/${mode}/messages/${id}`);
  };

  const handleBackMobile = () => {
    navigate(`/${mode}/messages`);
  };

  const handleSendMessage = (content) => {
    if (!conversationId) return;
    sendMessage({ content });
  };

  const handleRetryMessage = (msg) => {
    if (!conversationId || !msg?.content) return;
    sendMessage({ content: msg.content, clientMessageId: msg.clientMessageId });
  };

  const handleMarkRead = (messageId) => {
    if (!conversationId || !messageId) return;
    markRead(messageId);
  };

  return (
    <div className="w-full h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] p-2 md:p-4">
      <MessagingShell
        mode={mode}
        conversations={conversations}
        activeConversation={effectiveActiveConversation}
        selectedConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onBackMobile={handleBackMobile}
        isConversationsLoading={isConversationsLoading}
        isConversationsError={isConversationsError}
        onRetryConversations={refetchConversations}
        isConversationLoading={isConversationLoading}
        isConversationError={isConversationError}
        messages={messages}
        isMessagesLoading={isMessagesLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        currentAccountId={currentAccountId}
        onSendMessage={handleSendMessage}
        onRetryMessage={handleRetryMessage}
        onMarkRead={handleMarkRead}
        isSendMessagePending={isSendMessagePending}
      />
    </div>
  );
}
