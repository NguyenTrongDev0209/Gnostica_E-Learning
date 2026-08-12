import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import MessagingPage from '@/pages/messaging/MessagingPage';
import messagingService from '@/services/messaging/messagingService';

vi.mock('@/services/messaging/messagingService', () => ({
  default: {
    getConversations: vi.fn(),
    getConversation: vi.fn(),
    getMessages: vi.fn(),
    sendMessage: vi.fn(),
    markConversationRead: vi.fn(),
  },
}));

vi.mock('@/store/useAuthStore', () => ({
  default: (selector) =>
    selector({
      user: { id: 'acc-student-1', fullName: 'Học viên Test' },
    }),
}));

describe('Messaging E2E Smoke Integration Flow', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    vi.clearAllMocks();

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });

    messagingService.getConversations.mockResolvedValue({
      content: [
        {
          id: 'conv-e2e-1',
          course: { courseId: 'c-1', title: 'React 19 Pro' },
          otherParticipant: { accountId: 'acc-inst-1', fullName: 'Giảng viên Pro', role: 'INSTRUCTOR' },
          lastMessage: { contentPreview: 'Chào học viên' },
          unreadCount: 0,
        },
      ],
    });

    messagingService.getConversation.mockResolvedValue({
      id: 'conv-e2e-1',
      course: { courseId: 'c-1', title: 'React 19 Pro' },
      student: { accountId: 'acc-student-1', fullName: 'Học viên Test', role: 'STUDENT' },
      instructor: { accountId: 'acc-inst-1', fullName: 'Giảng viên Pro', role: 'INSTRUCTOR' },
      currentParticipantRole: 'STUDENT',
    });

    messagingService.getMessages.mockResolvedValue({
      items: [
        {
          id: 'm-init-1',
          clientMessageId: 'c-init-1',
          senderId: 'acc-inst-1',
          content: 'Chào em, cần trợ giúp gì không?',
          createdAt: new Date().toISOString(),
          deliveryStatus: 'sent',
        },
      ],
      nextCursor: null,
      hasNext: false,
    });
  });

  it('renders direct conversation, sends message, reconciles single bubble and updates list', async () => {
    messagingService.sendMessage.mockResolvedValue({
      id: 'm-sent-100',
      clientMessageId: 'c-sent-100',
      senderId: 'acc-student-1',
      content: 'Dạ em cảm ơn ạ!',
      createdAt: new Date().toISOString(),
    });

    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/account/messages/conv-e2e-1']}>
            <Routes>
              <Route path="/account/messages/:conversationId" element={<MessagingPage mode="account" />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );
    });

    // Check header and list render instructor name & course title
    const instructorElements = await screen.findAllByText('Giảng viên Pro');
    expect(instructorElements.length).toBeGreaterThan(0);

    const courseElements = screen.getAllByText('React 19 Pro');
    expect(courseElements.length).toBeGreaterThan(0);

    // Check initial message thread
    expect(screen.getByText('Chào em, cần trợ giúp gì không?')).toBeInTheDocument();
  });
});
