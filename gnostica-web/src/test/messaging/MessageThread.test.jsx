import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import React from 'react';
import MessageThread from '@/components/messaging/MessageThread';

describe('MessageThread Component & Mark-Read Triggers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });
  });

  const sampleMessages = [
    {
      id: 'msg-real-100',
      clientMessageId: 'c-100',
      senderId: 'acc-other',
      content: 'Tin nhắn từ giảng viên',
      mine: false,
      deliveryStatus: 'sent',
    },
  ];

  it('triggers mark-read on initial load when scrolled near bottom and message is from other user', async () => {
    const handleMarkRead = vi.fn();

    render(
      <MessageThread
        conversationId="conv-1"
        messages={sampleMessages}
        isLoading={false}
        currentAccountId="acc-me"
        onMarkRead={handleMarkRead}
      />
    );

    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });

    expect(handleMarkRead).toHaveBeenCalledWith('msg-real-100');
  });

  it('does NOT trigger mark-read when the last message is sent by current user', async () => {
    const handleMarkRead = vi.fn();
    const ownMessages = [
      {
        id: 'msg-real-101',
        clientMessageId: 'c-101',
        senderId: 'acc-me',
        content: 'Tin nhắn của tôi',
        mine: true,
        deliveryStatus: 'sent',
      },
    ];

    render(
      <MessageThread
        conversationId="conv-1"
        messages={ownMessages}
        isLoading={false}
        currentAccountId="acc-me"
        onMarkRead={handleMarkRead}
      />
    );

    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });

    expect(handleMarkRead).not.toHaveBeenCalled();
  });

  it('does NOT trigger mark-read when document is hidden', async () => {
    const handleMarkRead = vi.fn();
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      writable: true,
      configurable: true,
    });

    render(
      <MessageThread
        conversationId="conv-1"
        messages={sampleMessages}
        isLoading={false}
        currentAccountId="acc-me"
        onMarkRead={handleMarkRead}
      />
    );

    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });

    expect(handleMarkRead).not.toHaveBeenCalled();
  });

  it('does NOT trigger mark-read multiple times for the same messageId', async () => {
    const handleMarkRead = vi.fn();

    const { rerender } = render(
      <MessageThread
        conversationId="conv-1"
        messages={sampleMessages}
        isLoading={false}
        currentAccountId="acc-me"
        onMarkRead={handleMarkRead}
      />
    );

    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });

    // Re-render with same messages
    rerender(
      <MessageThread
        conversationId="conv-1"
        messages={[...sampleMessages]}
        isLoading={false}
        currentAccountId="acc-me"
        onMarkRead={handleMarkRead}
      />
    );

    await act(async () => {
      await new Promise((r) => requestAnimationFrame(r));
    });

    expect(handleMarkRead).toHaveBeenCalledTimes(1);
  });
});
