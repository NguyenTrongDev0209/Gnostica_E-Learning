import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import messagingService from '@/services/messaging/messagingService';
import { messagingKeys } from '@/lib/messaging/messagingQueryKeys';

export const useMessages = (conversationId, { limit = 30 } = {}) => {
  const queryResult = useInfiniteQuery({
    queryKey: messagingKeys.messages(conversationId),
    queryFn: ({ pageParam }) =>
      messagingService.getMessages(conversationId, { cursor: pageParam, limit }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => (lastPage?.hasNext ? lastPage.nextCursor : undefined),
    enabled: Boolean(conversationId),
  });

  const messages = useMemo(() => {
    if (!queryResult.data?.pages) return [];

    const itemMap = new Map();

    // Iterate through pages in chronological order
    queryResult.data.pages.forEach((page) => {
      if (Array.isArray(page?.items)) {
        page.items.forEach((item) => {
          if (!item) return;

          const realId = item.id ?? item.messageId;
          const normalizedItem = {
            ...item,
            id: realId || item.id,
          };

          // Deduplication key: prefer clientMessageId, fallback to id
          const key = item.clientMessageId || realId;
          if (key) {
            const existing = itemMap.get(key);
            // Replace if no existing item OR existing item is optimistic/sending while new item is sent/real
            if (!existing || (existing.deliveryStatus === 'sending' && item.deliveryStatus !== 'sending')) {
              itemMap.set(key, normalizedItem);
            }
          }
        });
      }
    });

    const list = Array.from(itemMap.values());

    // Sort chronologically (createdAt ASC)
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      if (timeA !== timeB) return timeA - timeB;
      const idA = String(a.id || a.clientMessageId || '');
      const idB = String(b.id || b.clientMessageId || '');
      return idA.localeCompare(idB);
    });

    return list;
  }, [queryResult.data]);

  return {
    ...queryResult,
    messages,
  };
};
