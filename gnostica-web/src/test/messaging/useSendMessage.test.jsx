import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSendMessage } from '@/hooks/messaging/useSendMessage';
import messagingService from '@/services/messaging/messagingService';

vi.mock('@/services/messaging/messagingService', () => ({
  default: {
    sendMessage: vi.fn(),
  },
}));

vi.mock('@/store/useAuthStore', () => ({
  default: (selector) =>
    selector({
      user: { id: 'acc-1', fullName: 'Test User' },
    }),
}));

describe('useSendMessage Hook', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('generates clientMessageId exactly once when not provided by caller', async () => {
    messagingService.sendMessage.mockResolvedValue({
      id: 'real-1',
      clientMessageId: 'gen-uuid',
      content: 'Hello',
    });

    const { result } = renderHook(() => useSendMessage('conv-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ content: 'Hello' });
    });

    expect(messagingService.sendMessage).toHaveBeenCalledTimes(1);
    const passedArgs = messagingService.sendMessage.mock.calls[0][1];
    expect(passedArgs.clientMessageId).toBeDefined();
    expect(passedArgs.clientMessageId.length).toBeGreaterThan(10);
  });

  it('preserves caller-supplied clientMessageId', async () => {
    messagingService.sendMessage.mockResolvedValue({
      id: 'real-2',
      clientMessageId: 'custom-id-123',
      content: 'Custom',
    });

    const { result } = renderHook(() => useSendMessage('conv-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ content: 'Custom', clientMessageId: 'custom-id-123' });
    });

    expect(messagingService.sendMessage).toHaveBeenCalledWith('conv-1', {
      clientMessageId: 'custom-id-123',
      content: 'Custom',
    });
  });

  it('preserves clientMessageId on retry', async () => {
    messagingService.sendMessage.mockResolvedValue({
      id: 'real-3',
      clientMessageId: 'retry-id-999',
      content: 'Retry Msg',
    });

    const { result } = renderHook(() => useSendMessage('conv-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ content: 'Retry Msg', clientMessageId: 'retry-id-999' });
    });

    expect(messagingService.sendMessage).toHaveBeenCalledWith('conv-1', {
      clientMessageId: 'retry-id-999',
      content: 'Retry Msg',
    });
  });

  it('updates deliveryStatus to error when sending fails', async () => {
    messagingService.sendMessage.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSendMessage('conv-1'), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({ content: 'Failing msg', clientMessageId: 'err-id-1' });
      } catch {
        // Expected failure
      }
    });

    const cachedData = queryClient.getQueryData(['messaging', 'messages', 'conv-1']);
    const failedItem = cachedData?.pages?.[0]?.items?.find((i) => i.clientMessageId === 'err-id-1');
    expect(failedItem).toBeDefined();
    expect(failedItem.deliveryStatus).toBe('error');
  });
});
