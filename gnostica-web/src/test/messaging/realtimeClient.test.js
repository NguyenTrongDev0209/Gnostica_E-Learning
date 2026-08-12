import { describe, it, expect, vi, beforeEach } from 'vitest';
import messagingRealtimeClient from '@/lib/messaging/messagingRealtimeClient';

describe('messagingRealtimeClient Module', () => {
  beforeEach(() => {
    messagingRealtimeClient.disconnect();
    vi.clearAllMocks();
  });

  it('ignores duplicate events with the same eventId', () => {
    const callback = vi.fn();
    messagingRealtimeClient.on('MESSAGE_CREATED', callback);

    const frame1 = {
      body: JSON.stringify({
        eventId: 'evt-dup-1',
        type: 'MESSAGE_CREATED',
        data: { id: 'msg-1', content: 'Event 1' },
      }),
    };

    messagingRealtimeClient.handleIncomingEnvelope(frame1);
    messagingRealtimeClient.handleIncomingEnvelope(frame1);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('notifies status listeners on status change', () => {
    const statusCallback = vi.fn();
    const unsub = messagingRealtimeClient.onStatusChange(statusCallback);

    messagingRealtimeClient.connect('dummy-token-abc');

    expect(statusCallback).toHaveBeenCalled();
    expect(messagingRealtimeClient.currentToken).toBe('dummy-token-abc');

    unsub();
  });

  it('cleans up token and subscriptions on disconnect', () => {
    messagingRealtimeClient.connect('dummy-token-abc');
    expect(messagingRealtimeClient.currentToken).toBe('dummy-token-abc');

    messagingRealtimeClient.disconnect();

    expect(messagingRealtimeClient.currentToken).toBeNull();
    expect(messagingRealtimeClient.status).toBe('DISCONNECTED');
  });
});
