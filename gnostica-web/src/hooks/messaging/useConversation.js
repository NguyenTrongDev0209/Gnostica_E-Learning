import { useQuery } from '@tanstack/react-query';
import messagingService from '@/services/messaging/messagingService';
import { messagingKeys } from '@/lib/messaging/messagingQueryKeys';

export const useConversation = (conversationId) => {
  return useQuery({
    queryKey: messagingKeys.conversation(conversationId),
    queryFn: () => messagingService.getConversation(conversationId),
    enabled: Boolean(conversationId),
  });
};
