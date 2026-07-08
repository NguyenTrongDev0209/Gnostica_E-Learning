import { useQuery } from '@tanstack/react-query';
import instructorService from '@/services/instructor/instructorService';

export function useInstructorList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['instructors_public'],
    queryFn: async () => {
      const res = await instructorService.getInstructorList();
      return res || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return { instructors: data || [], loading: isLoading, error };
}
