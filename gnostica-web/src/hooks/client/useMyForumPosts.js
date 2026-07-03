import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import threadService from '@/services/threadService';
import { toast } from "sonner";

export default function useMyForumPosts(postsPerPage = 5) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [threadToDelete, setThreadToDelete] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
  }, []);

  const { data: threads = [], isLoading: isThreadsLoading } = useQuery({
    queryKey: ['my_threads', currentUser?.email],
    queryFn: async () => {
      const res = await threadService.getMyThreads(currentUser.email);
      return res?.content || res?.data?.content || [];
    },
    enabled: !!currentUser?.email,
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });

  const { data: userStats = { threadCount: 0, totalLikes: 0 } } = useQuery({
    queryKey: ['my_thread_stats', currentUser?.email],
    queryFn: async () => {
      const res = await threadService.getMyThreadStats(currentUser.email);
      return res?.data || res || { threadCount: 0, totalLikes: 0 };
    },
    enabled: !!currentUser?.email,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await threadService.deleteThread(id);
    },
    onSuccess: () => {
      toast.success("Đã xóa bài viết thành công!");
      queryClient.invalidateQueries({ queryKey: ['my_threads'] });
      queryClient.invalidateQueries({ queryKey: ['my_thread_stats'] });
      setThreadToDelete(null);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa bài viết.");
      setThreadToDelete(null);
    }
  });

  const handleDelete = async () => {
    if (!threadToDelete) return;
    await deleteMutation.mutateAsync(threadToDelete);
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const mappedPosts = threads.map(thread => {
    const plainText = stripHtml(thread.content);
    return {
      id: thread.id,
      title: plainText.substring(0, 100) + (plainText.length > 100 ? "..." : ""),
      content: plainText,
      author: {
        name: thread.account?.fullName || "Ẩn danh",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.account?.email || 'default'}`,
        status: "online"
      },
      category: thread.category?.name || "Thảo luận",
      tags: [],
      createdAt: new Date(thread.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      stats: {
        likes: thread.likes || 0,
        views: thread.views || 0,
        replies: thread.commentCount || 0
      },
      images: thread.images || [],
      isHot: (thread.views || 0) > 50,
      status: thread.status,
      pendingModeration: thread.pendingModeration
    };
  });

  const totalPages = Math.ceil(mappedPosts.length / postsPerPage);
  const currentPosts = mappedPosts.slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage);

  useEffect(() => {
    setCurrentPage(0);
  }, [threads.length]);

  return {
    currentUser,
    userStats,
    isLoading: isThreadsLoading,
    currentPosts,
    totalPages,
    currentPage,
    setCurrentPage,
    threadToDelete,
    setThreadToDelete,
    handleDelete
  };
}
