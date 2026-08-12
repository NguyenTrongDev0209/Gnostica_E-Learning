import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function MessagingEmptyState({ title = 'Chưa chọn cuộc trò chuyện', description = 'Vui lòng chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin.' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card/50 rounded-2xl border border-dashed border-border/60 m-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
