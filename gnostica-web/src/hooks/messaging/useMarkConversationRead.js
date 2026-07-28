import { useMutation, useQueryClient } from '@tanstack/react-query';
import messagingService from '@/services/messaging/messagingService';
import { messagingCache } from '@/lib/messaging/messagingCache';

export const useMarkConversationRead = (conversationId, { onError } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId) => messagingService.markConversationRead(conversationId, messageId),
    onSuccess: (data, messageId) => {
      messagingCache.onConversationRead(queryClient, conversationId, messageId);
    },
    onError,
  });
};
