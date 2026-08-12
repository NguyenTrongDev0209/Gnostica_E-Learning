import React from 'react';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { normalizeConversationSummary } from '@/lib/messaging/conversationNormalizer';

export default function ConversationHeader({
  conversation,
  onBack,
  currentAccountId,
  isLoading,
  isError,
}) {
  if (isLoading) {
    return (
      <div className="h-16 px-4 border-b border-border/60 bg-card flex items-center gap-3 shrink-0 animate-pulse">
        {onBack && <div className="w-8 h-8 rounded-xl bg-muted md:hidden" />}
        <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="w-32 h-4 rounded bg-muted" />
          <div className="w-48 h-3 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !conversation) {
    return (
      <div className="h-16 px-4 border-b border-border/60 bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
              aria-label="Quay lại danh sách"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="text-xs font-semibold text-destructive">
            Không thể tải thông tin cuộc trò chuyện
          </span>
        </div>
      </div>
    );
  }

  const norm = normalizeConversationSummary(conversation, currentAccountId);
  if (!norm) return null;

  const { otherParticipant, course } = norm;
  const name = otherParticipant?.fullName || '';
  const avatar = otherParticipant?.avatar || null;
  const role = otherParticipant?.roleName || 'Học viên';
  const courseTitle = course?.title || '';
  const courseId = course?.courseId || null;

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : n.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-16 px-4 border-b border-border/60 bg-card flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            aria-label="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <Avatar className="w-10 h-10 ring-2 ring-border shrink-0">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground truncate">{name}</span>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium border-primary/20 text-primary bg-primary/5 shrink-0">
              {role}
            </Badge>
          </div>

          {courseTitle && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
              <BookOpen className="w-3 h-3 shrink-0" />
              <span className="truncate font-medium">{courseTitle}</span>
            </div>
          )}
        </div>
      </div>

      {courseId && (
        <Link
          to={`/learning/${courseId}`}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all shrink-0"
        >
          <span>Khóa học</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
