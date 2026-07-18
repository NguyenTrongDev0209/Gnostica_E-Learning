import { useQuery } from '@tanstack/react-query';
import courseService from '@/services/course/courseService';

export default function useFeaturedCourses(size = 8) {
  const query = useQuery({
    queryKey: ['courses', 'featured', size],
    queryFn: async () => {
      const response = await courseService.getPublicCourses({ page: 0, size });
      return response?.content || [];
    },
    staleTime: 60_000
  });

  return { courses: query.data || [], loading: query.isLoading, error: query.error };
}
