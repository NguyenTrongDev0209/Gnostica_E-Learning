export const messagingKeys = {
  all: ['messaging'],
  conversations: () => ['messaging', 'conversations'],
  conversationList: (page = 0, size = 20) => ['messaging', 'conversations', 'list', { page, size }],
  conversation: (conversationId) => ['messaging', 'conversations', 'detail', conversationId],
  allMessages: () => ['messaging', 'messages'],
  messages: (conversationId) => ['messaging', 'messages', conversationId],
};
