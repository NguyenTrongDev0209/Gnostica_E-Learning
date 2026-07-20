import { useQuery } from '@tanstack/react-query';
import { getInstructors, getPlatformStats } from '@/services/home/homeService';

export default function useHomeData() {
    const statsQuery = useQuery({
        queryKey: ['home', 'platform-stats'],
        queryFn: getPlatformStats,
        staleTime: 60_000
    });
    const instructorsQuery = useQuery({
        queryKey: ['home', 'instructors'],
        queryFn: getInstructors,
        staleTime: 60_000
    });

    return {
        stats: statsQuery.data || [],
        instructors: instructorsQuery.data || [],
        loadingStats: statsQuery.isLoading,
        loadingInstructors: instructorsQuery.isLoading,
        error: statsQuery.error || instructorsQuery.error
    };
}
