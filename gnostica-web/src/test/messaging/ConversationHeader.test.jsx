import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import ConversationHeader from '@/components/messaging/ConversationHeader';

describe('ConversationHeader Component', () => {
  const detailDTO = {
    id: 'conv-detail-1',
    course: {
      courseId: 'c-course-99',
      title: 'Khóa học React 19',
    },
    student: {
      accountId: 'acc-student-1',
      fullName: 'Học viên Nguyễn Văn A',
      avatar: null,
      role: 'STUDENT',
    },
    instructor: {
      accountId: 'acc-instructor-1',
      fullName: 'Giảng viên Lê Văn B',
      avatar: null,
      role: 'INSTRUCTOR',
    },
    currentParticipantRole: 'STUDENT',
  };

  it('renders instructor info when currentParticipantRole is STUDENT', () => {
    render(
      <MemoryRouter>
        <ConversationHeader
          conversation={detailDTO}
          onBack={() => {}}
          currentAccountId="acc-student-1"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Giảng viên Lê Văn B')).toBeInTheDocument();
    expect(screen.getByText('Giảng viên')).toBeInTheDocument();
    expect(screen.getByText('Khóa học React 19')).toBeInTheDocument();

    const courseLink = screen.getByRole('link', { name: /Khóa học/i });
    expect(courseLink).toHaveAttribute('href', '/learning/c-course-99');
  });

  it('renders student info when currentParticipantRole is INSTRUCTOR', () => {
    const instructorViewDTO = {
      ...detailDTO,
      currentParticipantRole: 'INSTRUCTOR',
    };

    render(
      <MemoryRouter>
        <ConversationHeader
          conversation={instructorViewDTO}
          onBack={() => {}}
          currentAccountId="acc-instructor-1"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Học viên Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('Học viên')).toBeInTheDocument();
    expect(screen.getByText('Khóa học React 19')).toBeInTheDocument();
  });
});
