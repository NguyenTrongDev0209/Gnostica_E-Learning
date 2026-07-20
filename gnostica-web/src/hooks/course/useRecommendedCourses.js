import { useQuery } from '@tanstack/react-query';
import courseService from '@/services/course/courseService';
import useAuthStore from '@/store/useAuthStore';

export default function useRecommendedCourses(size = 4) {
    const user = useAuthStore((state) => state.user);
    const query = useQuery({
        queryKey: ['courses', 'recommendations', user?.id, size],
        queryFn: async () => {
            const response = await courseService.getRecommendedCourses(0, size);
            return response?.content || [];
        },
        enabled: Boolean(user),
        staleTime: 60_000
    });

    return { courses: query.data || [], loading: query.isLoading, error: query.error, user };
}
