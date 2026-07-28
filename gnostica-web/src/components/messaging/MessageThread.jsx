import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowDown, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageThreadSkeleton from './MessageThreadSkeleton';
import MessagingEmptyState from './MessagingEmptyState';

export default function MessageThread({
  conversationId,
  messages = [],
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  currentAccountId,
  onRetryMessage,
  onMarkRead,
}) {
  const scrollContainerRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const prevMessageCountRef = useRef(messages.length);
  const lastMarkedMessageIdRef = useRef(null);

  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [hasUnreadBelow, setHasUnreadBelow] = useState(false);

  // Reset tracking state whenever conversationId changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    lastMarkedMessageIdRef.current = null;
    requestAnimationFrame(() => {
      setShowScrollBottomBtn(false);
      setHasUnreadBelow(false);
    });
  }, [conversationId]);

  const scrollToBottom = useCallback((smooth = false) => {
    const container = scrollContainerRef.current;
    if (container) {
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, []);

  // Helper to validate and trigger markRead safely
  const tryMarkRead = useCallback(() => {
    if (!onMarkRead || !conversationId || !messages.length) return;
    if (document.visibilityState !== 'visible') return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const isNearBottom = distanceFromBottom < 150;
    if (!isNearBottom) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    // Must not be sent by current user
    const isMine =
      lastMsg.mine ||
      (currentAccountId && String(lastMsg.senderId) === String(currentAccountId));
    if (isMine) return;

    // Must have valid backend ID (not optimistic or sending)
    const messageId = lastMsg.id ?? lastMsg.messageId;
    if (
      !messageId ||
      String(messageId).startsWith('optimistic-') ||
      lastMsg.deliveryStatus === 'sending'
    ) {
      return;
    }

    // Deduplicate: do not mark the exact same messageId repeatedly
    if (lastMarkedMessageIdRef.current === messageId) {
      return;
    }

    lastMarkedMessageIdRef.current = messageId;
    onMarkRead(messageId);
  }, [onMarkRead, conversationId, messages, currentAccountId]);

  // Check scroll position for floating button & mark read trigger
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const isNearBottom = distanceFromBottom < 150;
    setShowScrollBottomBtn(!isNearBottom);

    if (isNearBottom) {
      setHasUnreadBelow(false);
      tryMarkRead();
    }
  }, [tryMarkRead]);

  // Initial load scroll to bottom & mark read
  useEffect(() => {
    if (!isLoading && messages.length > 0 && isInitialLoadRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom(false);
        tryMarkRead();
      });
      isInitialLoadRef.current = false;
      prevMessageCountRef.current = messages.length;
    }
  }, [isLoading, messages, scrollToBottom, tryMarkRead]);

  // Message length changes (New message or history load)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isInitialLoadRef.current) return;

    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    if (currentCount > prevCount) {
      const lastMsg = messages[messages.length - 1];
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      const isMine =
        lastMsg?.mine ||
        (currentAccountId && String(lastMsg?.senderId) === String(currentAccountId));

      if (isMine || distanceFromBottom < 200) {
        requestAnimationFrame(() => {
          scrollToBottom(true);
          tryMarkRead();
        });
      } else {
        requestAnimationFrame(() => {
          setHasUnreadBelow(true);
          setShowScrollBottomBtn(true);
        });
      }
    }

    prevMessageCountRef.current = currentCount;
  }, [messages, scrollToBottom, tryMarkRead, currentAccountId]);

  // History prepend scroll position preservation
  const handleLoadOlder = async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    const container = scrollContainerRef.current;
    if (container) {
      prevScrollHeightRef.current = container.scrollHeight;
    }

    await fetchNextPage();

    requestAnimationFrame(() => {
      if (container && prevScrollHeightRef.current > 0) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop += newScrollHeight - prevScrollHeightRef.current;
      }
    });
  };

  // Tab visibility change listener for mark read
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tryMarkRead();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tryMarkRead]);

  if (isLoading) {
    return <MessageThreadSkeleton />;
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-background">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 scrollbar-hide flex flex-col"
      >
        {/* Load older messages button */}
        {hasNextPage && (
          <div className="flex justify-center my-2">
            <button
              type="button"
              onClick={handleLoadOlder}
              disabled={isFetchingNextPage}
              className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải tin cũ hơn...</span>
                </>
              ) : (
                <span>Tải tin nhắn cũ hơn</span>
              )}
            </button>
          </div>
        )}

        {/* Message list */}
        {messages.length === 0 ? (
          <MessagingEmptyState
            title="Bắt đầu cuộc trò chuyện"
            description="Hãy gửi tin nhắn đầu tiên để kết nối với đối phương."
          />
        ) : (
          <div className="flex-1 flex flex-col justify-end">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.clientMessageId || msg.id}
                message={msg}
                currentAccountId={currentAccountId}
                onRetry={() => onRetryMessage?.(msg)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Scroll to bottom button */}
      {showScrollBottomBtn && (
        <button
          type="button"
          onClick={() => {
            scrollToBottom(true);
            setShowScrollBottomBtn(false);
            setHasUnreadBelow(false);
            requestAnimationFrame(() => tryMarkRead());
          }}
          className="absolute bottom-4 right-4 bg-primary text-white p-2.5 rounded-full shadow-lg hover:bg-primary/90 transition-all z-20 flex items-center gap-1.5 text-xs font-bold animate-bounce cursor-pointer"
          aria-label="Cuộn xuống tin nhắn mới"
        >
          <ArrowDown className="w-4 h-4" />
          {hasUnreadBelow && <span>Tin nhắn mới</span>}
        </button>
      )}
    </div>
  );
}
