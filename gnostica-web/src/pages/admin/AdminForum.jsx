import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import AdminThreadModeration from './AdminThreadModeration';

function AdminForumList() {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-border border-dashed gap-4">
      <MessageSquare className="w-12 h-12 text-muted-foreground/40" />
      <p className="text-muted-foreground font-medium">Tính năng Danh sách Bài viết đang được xây dựng</p>
    </div>
  );
}



export default function AdminForum() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'list';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Quản Lý Diễn Đàn
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi và quản lý toàn bộ bài viết diễn đàn trên hệ thống.
        </p>
      </div>

      {tab === 'list' && <AdminForumList />}
      {tab === 'moderation' && <AdminThreadModeration hideHeader={true} />}
    </div>
  );
}
