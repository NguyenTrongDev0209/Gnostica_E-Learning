import { useQuery } from '@tanstack/react-query';
import threadService from '@/services/forum/threadService';
import forumCategoryService from '@/services/forum/forumCategoryService';

export function useForumPage() {
  const categoriesQuery = useQuery({
    queryKey: ['forum_categories'],
    queryFn: async () => {
      const res = await forumCategoryService.getAllCategories();
      const data = res?.data || res || [];
      return Array.isArray(data) ? data.filter(cat => cat.status === true) : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const threadsQuery = useQuery({
    queryKey: ['forum_threads'],
    queryFn: async () => {
      const res = await threadService.getThreads(0, 1000);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data?.content && Array.isArray(data.content)) return data.content;
      return [];
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    categories: categoriesQuery.data || [],
    refetchCategories: categoriesQuery.refetch,
    threads: threadsQuery.data || [],
    isLoading: categoriesQuery.isLoading || threadsQuery.isLoading,
    refetchThreads: threadsQuery.refetch,
  };
}
