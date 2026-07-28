import { useMutation, useQueryClient } from '@tanstack/react-query';
import messagingService from '@/services/messaging/messagingService';
import { messagingCache } from '@/lib/messaging/messagingCache';
import useAuthStore from '@/store/useAuthStore';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useSendMessage = (conversationId) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const currentAccountId = user?.id || user?.accountId || null;

  const mutation = useMutation({
    mutationFn: async ({ content, clientMessageId }) => {
      return messagingService.sendMessage(conversationId, {
        clientMessageId,
        content,
      });
    },
    onMutate: async ({ content, clientMessageId }) => {
      if (!conversationId || !content?.trim() || !clientMessageId) return;

      const optimisticMsg = {
        id: `optimistic-${clientMessageId}`,
        conversationId,
        senderId: currentAccountId,
        senderName: user?.fullName || 'Tôi',
        senderAvatar: user?.avatar || null,
        clientMessageId,
        type: 'TEXT',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        mine: true,
        deliveryStatus: 'sending',
      };

      messagingCache.addOptimisticMessage(queryClient, conversationId, optimisticMsg);

      return { clientMessageId };
    },
    onSuccess: (data) => {
      messagingCache.onMessageCreated(
        queryClient,
        { conversationId, data },
        currentAccountId
      );
    },
    onError: (error, variables, context) => {
      const clientMsgId = variables?.clientMessageId || context?.clientMessageId;
      if (clientMsgId) {
        messagingCache.markOptimisticMessageError(
          queryClient,
          conversationId,
          clientMsgId,
          error
        );
      }
    },
  });

  const mutate = (variables, options) => {
    if (!variables) return;
    const preparedVariables = {
      ...variables,
      clientMessageId: variables.clientMessageId || generateUUID(),
    };
    return mutation.mutate(preparedVariables, options);
  };

  const mutateAsync = (variables, options) => {
    if (!variables) return Promise.reject(new Error('Variables are required'));
    const preparedVariables = {
      ...variables,
      clientMessageId: variables.clientMessageId || generateUUID(),
    };
    return mutation.mutateAsync(preparedVariables, options);
  };

  return {
    ...mutation,
    mutate,
    mutateAsync,
  };
};
