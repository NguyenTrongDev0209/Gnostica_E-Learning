import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { messagingCache } from '@/lib/messaging/messagingCache';
import { messagingKeys } from '@/lib/messaging/messagingQueryKeys';

describe('messagingCache Normalization & Deduplication', () => {
  let queryClient;
  const conversationId = 'conv-test-1';

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Seed initial cache with optimistic message
    messagingCache.addOptimisticMessage(queryClient, conversationId, {
      id: 'optimistic-client-123',
      clientMessageId: 'client-123',
      conversationId,
      senderId: 'acc-me',
      content: 'Xin chào!',
      createdAt: new Date().toISOString(),
      mine: true,
      deliveryStatus: 'sending',
    });
  });

  it('reconciles optimistic message and accepts REST payload with id', () => {
    messagingCache.onMessageCreated(
      queryClient,
      {
        conversationId,
        data: {
          id: 'server-real-id-1',
          clientMessageId: 'client-123',
          conversationId,
          senderId: 'acc-me',
          content: 'Xin chào!',
          createdAt: new Date().toISOString(),
        },
      },
      'acc-me'
    );

    const data = queryClient.getQueryData(messagingKeys.messages(conversationId));
    const items = data.pages[0].items;

    expect(items.length).toBe(1);
    expect(items[0].id).toBe('server-real-id-1');
    expect(items[0].deliveryStatus).toBe('sent');
  });

  it('accepts WebSocket payload with messageId and reconciles optimistic message', () => {
    messagingCache.onMessageCreated(
      queryClient,
      {
        conversationId,
        data: {
          messageId: 'ws-real-id-2',
          clientMessageId: 'client-123',
          conversationId,
          senderId: 'acc-me',
          content: 'Xin chào!',
          createdAt: new Date().toISOString(),
        },
      },
      'acc-me'
    );

    const data = queryClient.getQueryData(messagingKeys.messages(conversationId));
    const items = data.pages[0].items;

    expect(items.length).toBe(1);
    expect(items[0].id).toBe('ws-real-id-2');
    expect(items[0].deliveryStatus).toBe('sent');
  });

  it('does not create duplicate when receiving same message via REST then WebSocket', () => {
    // 1. REST response arrives
    messagingCache.onMessageCreated(
      queryClient,
      {
        conversationId,
        data: {
          id: 'server-real-id-1',
          clientMessageId: 'client-123',
          conversationId,
          senderId: 'acc-me',
          content: 'Xin chào!',
          createdAt: new Date().toISOString(),
        },
      },
      'acc-me'
    );

    // 2. WebSocket event arrives for same message
    messagingCache.onMessageCreated(
      queryClient,
      {
        conversationId,
        data: {
          messageId: 'server-real-id-1',
          clientMessageId: 'client-123',
          conversationId,
          senderId: 'acc-me',
          content: 'Xin chào!',
          createdAt: new Date().toISOString(),
        },
      },
      'acc-me'
    );

    const data = queryClient.getQueryData(messagingKeys.messages(conversationId));
    const items = data.pages[0].items;

    expect(items.length).toBe(1);
    expect(items[0].id).toBe('server-real-id-1');
  });
});
