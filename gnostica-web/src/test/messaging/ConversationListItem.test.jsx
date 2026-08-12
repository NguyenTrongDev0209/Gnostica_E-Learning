import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ConversationListItem from '@/components/messaging/ConversationListItem';

describe('ConversationListItem Component', () => {
  const mockConversation = {
    id: 'conv-10',
    course: {
      courseId: 'c-100',
      title: 'Lập trình Node.js Nâng Cao',
    },
    otherParticipant: {
      accountId: 'acc-inst-1',
      fullName: 'Giảng viên Trần Văn B',
      avatar: 'https://example.com/avatar.jpg',
      role: 'INSTRUCTOR',
    },
    lastMessage: {
      messageId: 'm-1',
      contentPreview: 'Chào em, em xem bài 5 nhé.',
      createdAt: new Date().toISOString(),
    },
    unreadCount: 3,
  };

  it('renders nested course title, otherParticipant fullName, contentPreview, and unread badge', () => {
    render(<ConversationListItem conversation={mockConversation} isSelected={false} onClick={() => {}} />);

    expect(screen.getByText('Giảng viên Trần Văn B')).toBeInTheDocument();
    expect(screen.getByText('Giảng viên')).toBeInTheDocument();
    expect(screen.getByText('Lập trình Node.js Nâng Cao')).toBeInTheDocument();
    expect(screen.getByText('Chào em, em xem bài 5 nhé.')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('handles lastMessage being null gracefully and displays "Chưa có tin nhắn"', () => {
    const emptyConversation = {
      ...mockConversation,
      lastMessage: null,
      unreadCount: 0,
    };

    render(<ConversationListItem conversation={emptyConversation} isSelected={false} onClick={() => {}} />);

    expect(screen.getByText('Giảng viên Trần Văn B')).toBeInTheDocument();
    expect(screen.getByText('Chưa có tin nhắn')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<ConversationListItem conversation={mockConversation} isSelected={false} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
