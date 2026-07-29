export const normalizeConversationSummary = (raw, currentAccountId = null) => {
  if (!raw) return null;

  const course = raw.course || {};

  // Resolve other participant for both summary and detail DTOs
  let other = raw.otherParticipant || null;

  if (!other) {
    const currentRole = raw.currentParticipantRole;
    if (currentRole === 'STUDENT') {
      other = raw.instructor || null;
    } else if (currentRole === 'INSTRUCTOR') {
      other = raw.student || null;
    } else if (currentAccountId) {
      const studentAccId = raw.student?.accountId || raw.student?.id;
      const instructorAccId = raw.instructor?.accountId || raw.instructor?.id;
      if (studentAccId && String(studentAccId) === String(currentAccountId)) {
        other = raw.instructor || null;
      } else if (instructorAccId && String(instructorAccId) === String(currentAccountId)) {
        other = raw.student || null;
      }
    }
    if (!other) {
      other = raw.instructor || raw.student || {};
    }
  }

  const roleName = other.role === 'INSTRUCTOR' ? 'Giảng viên' : 'Học viên';
  const fullName = other.fullName || other.name || '';
  const avatar = other.avatar || null;
  const courseTitle = course.title || raw.courseTitle || '';
  const courseId = course.courseId || raw.courseId || null;

  const lastMsg = raw.lastMessage || null;
  const hasLastMessage = Boolean(lastMsg && (lastMsg.contentPreview || lastMsg.content));
  const lastMessageText = hasLastMessage
    ? lastMsg.contentPreview || lastMsg.content
    : raw.lastMessageText || 'Chưa có tin nhắn';

  const lastMessageAt = raw.lastMessageAt || lastMsg?.createdAt || raw.createdAt || null;
  const unreadCount = typeof raw.unreadCount === 'number' ? raw.unreadCount : 0;

  return {
    id: raw.id,
    courseId,
    courseTitle,
    courseSlug: course.slug || null,
    courseThumbnail: course.thumbnail || null,

    course: {
      courseId,
      title: courseTitle,
      slug: course.slug || null,
      thumbnail: course.thumbnail || null,
    },

    otherParticipant: {
      accountId: other.accountId || other.id || null,
      fullName,
      avatar,
      role: other.role || 'STUDENT',
      roleName,
    },

    currentParticipantRole: raw.currentParticipantRole || null,
    student: raw.student || null,
    instructor: raw.instructor || null,

    lastMessage: lastMsg
      ? {
          messageId: lastMsg.messageId || lastMsg.id || null,
          senderId: lastMsg.senderId || null,
          type: lastMsg.type || 'TEXT',
          contentPreview: lastMsg.contentPreview || lastMsg.content || '',
          createdAt: lastMsg.createdAt || null,
        }
      : null,

    lastMessageText,
    lastMessageAt,
    unreadCount,
    createdAt: raw.createdAt || null,
  };
};
