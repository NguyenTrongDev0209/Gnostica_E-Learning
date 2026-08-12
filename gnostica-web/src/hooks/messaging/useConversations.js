import { useQuery } from '@tanstack/react-query';
import messagingService from '@/services/messaging/messagingService';
import { messagingKeys } from '@/lib/messaging/messagingQueryKeys';

export const useConversations = ({ page = 0, size = 20 } = {}) => {
  return useQuery({
    queryKey: messagingKeys.conversationList(page, size),
    queryFn: () => messagingService.getConversations({ page, size }),
  });
};
