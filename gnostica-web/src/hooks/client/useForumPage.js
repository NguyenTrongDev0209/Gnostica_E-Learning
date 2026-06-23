import { useQuery } from '@tanstack/react-query';
import threadService from '@/services/threadService';
import forumCategoryService from '@/services/forumCategoryService';

export function useForumPage() {
  const categoriesQuery = useQuery({
    queryKey: ['forum_categories'],
    queryFn: async () => {
      const res = await forumCategoryService.getAllCategories();
      // API có thể trả về res hoặc res.data
      const data = res?.data || res || [];
      return Array.isArray(data) ? data.filter(cat => cat.status === true) : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const contributorsQuery = useQuery({
    queryKey: ['forum_top_contributors'],
    queryFn: async () => {
      const res = await threadService.getTopContributors();
      return res || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const threadsQuery = useQuery({
    queryKey: ['forum_threads'],
    queryFn: async () => {
      const res = await threadService.getThreads(0, 1000);
      return res?.content || res?.data?.content || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    categories: categoriesQuery.data || [],
    topContributors: contributorsQuery.data || [],
    threads: threadsQuery.data || [],
    isLoading: categoriesQuery.isLoading || contributorsQuery.isLoading || threadsQuery.isLoading
  };
}
