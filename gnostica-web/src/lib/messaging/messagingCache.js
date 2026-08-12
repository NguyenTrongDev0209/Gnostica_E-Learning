import { messagingKeys } from './messagingQueryKeys';

export const messagingCache = {
  onMessageCreated: (queryClient, envelope, currentAccountId) => {
    if (!queryClient || !envelope || !envelope.data) return;

    const { conversationId, data: payload } = envelope;
    if (!conversationId) return;

    const messageId = payload.id ?? payload.messageId;
    if (!messageId) return;

    const clientMessageId = payload.clientMessageId;

    const formattedMessage = {
      id: messageId,
      conversationId: payload.conversationId || conversationId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderAvatar: payload.senderAvatar,
      clientMessageId: clientMessageId,
      type: payload.type || 'TEXT',
      content: payload.content,
      createdAt: payload.createdAt,
      mine: currentAccountId ? payload.senderId === currentAccountId : false,
      deliveryStatus: 'sent',
    };

    // 1. Update Messages Infinite Query Cache
    queryClient.setQueryData(messagingKeys.messages(conversationId), (oldData) => {
      if (!oldData || !oldData.pages || oldData.pages.length === 0) {
        return oldData;
      }

      let replaced = false;
      let exists = false;

      const newPages = oldData.pages.map((page) => {
        const newItems = page.items.map((item) => {
          const isMatch =
            (clientMessageId && item.clientMessageId && item.clientMessageId === clientMessageId) ||
            (item.id && item.id === messageId) ||
            (clientMessageId && item.id && item.id === `optimistic-${clientMessageId}`);

          if (isMatch) {
            replaced = true;
            exists = true;
            return formattedMessage;
          }
          return item;
        });

        if (
          newItems.some(
            (i) => i.id === messageId || (clientMessageId && i.clientMessageId === clientMessageId)
          )
        ) {
          exists = true;
        }

        return {
          ...page,
          items: newItems,
        };
      });

      if (!replaced && !exists) {
        const lastPageIndex = newPages.length - 1;
        newPages[lastPageIndex] = {
          ...newPages[lastPageIndex],
          items: [...newPages[lastPageIndex].items, formattedMessage],
        };
      }

      return {
        ...oldData,
        pages: newPages,
      };
    });

    // 2. Invalidate & update Conversation List Cache
    messagingCache.updateConversationListSummary(queryClient);
  },

  onConversationUpdated: (queryClient, envelope) => {
    if (!queryClient || !envelope || !envelope.data) return;

    const { conversationId } = envelope;
    if (!conversationId) return;

    messagingCache.updateConversationListSummary(queryClient);
  },

  onConversationRead: (queryClient, envelopeOrId) => {
    if (!queryClient || !envelopeOrId) return;

    const conversationId =
      typeof envelopeOrId === 'string'
        ? envelopeOrId
        : envelopeOrId.conversationId || envelopeOrId.data?.conversationId;

    if (!conversationId) return;

    // Immediately update list cache to set unreadCount to 0 for this conversation
    queryClient.setQueriesData({ queryKey: messagingKeys.conversations() }, (oldData) => {
      if (!oldData) return oldData;

      const updateList = (items) =>
        items.map((c) => (String(c.id) === String(conversationId) ? { ...c, unreadCount: 0 } : c));

      if (Array.isArray(oldData.content)) {
        return { ...oldData, content: updateList(oldData.content) };
      }
      if (Array.isArray(oldData.items)) {
        return { ...oldData, items: updateList(oldData.items) };
      }
      if (Array.isArray(oldData)) {
        return updateList(oldData);
      }
      return oldData;
    });

    queryClient.invalidateQueries({ queryKey: messagingKeys.conversation(conversationId) });
    queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
  },

  updateConversationListSummary: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
  },

  addOptimisticMessage: (queryClient, conversationId, optimisticMsg) => {
    queryClient.setQueryData(messagingKeys.messages(conversationId), (oldData) => {
      if (!oldData || !oldData.pages || oldData.pages.length === 0) {
        return {
          pages: [
            {
              items: [optimisticMsg],
              nextCursor: null,
              hasNext: false,
            },
          ],
          pageParams: [undefined],
        };
      }

      const newPages = [...oldData.pages];
      const lastPageIndex = newPages.length - 1;

      const existingItems = newPages[lastPageIndex].items;
      if (!existingItems.some((i) => i.clientMessageId === optimisticMsg.clientMessageId)) {
        newPages[lastPageIndex] = {
          ...newPages[lastPageIndex],
          items: [...existingItems, optimisticMsg],
        };
      }

      return {
        ...oldData,
        pages: newPages,
      };
    });
  },

  markOptimisticMessageError: (queryClient, conversationId, clientMessageId, error) => {
    queryClient.setQueryData(messagingKeys.messages(conversationId), (oldData) => {
      if (!oldData || !oldData.pages) return oldData;

      const newPages = oldData.pages.map((page) => ({
        ...page,
        items: page.items.map((item) => {
          if (
            item.clientMessageId === clientMessageId ||
            item.id === `optimistic-${clientMessageId}`
          ) {
            return {
              ...item,
              deliveryStatus: 'error',
              error: error?.message || 'Gửi tin nhắn thất bại',
            };
          }
          return item;
        }),
      }));

      return {
        ...oldData,
        pages: newPages,
      };
    });
  },
};
