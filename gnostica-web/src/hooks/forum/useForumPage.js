import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import threadService from '@/services/forum/threadService';
import forumCategoryService from '@/services/forum/forumCategoryService';

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

  const threadsQuery = useInfiniteQuery({
    queryKey: ['forum_threads'],
    queryFn: async ({ pageParam }) => {
      const res = await threadService.getThreads(pageParam, 5);
      return res?.data || res;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.page?.number ?? lastPage?.number ?? 0;
      const totalPages = lastPage?.page?.totalPages ?? lastPage?.totalPages ?? 1;
      return currentPage + 1 < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });

  const threads = threadsQuery.data?.pages.flatMap(page => page?.content || []) || [];

  return {
    categories: categoriesQuery.data || [],
    refetchCategories: categoriesQuery.refetch,
    threads,
    isLoading: categoriesQuery.isLoading || threadsQuery.isLoading,
    hasNextPage: threadsQuery.hasNextPage,
    fetchNextPage: threadsQuery.fetchNextPage,
    isFetchingNextPage: threadsQuery.isFetchingNextPage,
  };
}
