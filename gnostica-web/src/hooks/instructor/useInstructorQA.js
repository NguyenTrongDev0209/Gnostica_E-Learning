import { useQuery } from "@tanstack/react-query";
import { instructorDashboardService } from "@/services/instructorDashboardService";

export default function useInstructorQA() {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor_qa'],
    queryFn: async () => {
        const [qData, rData] = await Promise.all([
          instructorDashboardService.getQuestions(),
          instructorDashboardService.getReviews()
        ]);
        return {
            questions: qData || [],
            reviews: rData || []
        };
    },
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });

  return { 
      questions: data?.questions || [], 
      reviews: data?.reviews || [], 
      loading: isLoading 
  };
}
