import { useQuery } from "@tanstack/react-query";
import { instructorDashboardService } from "@/services/instructor/instructorDashboardService";
import { USE_INSTRUCTOR_MOCK, MOCK_QA } from "@/mocks/instructorMockData";

export default function useInstructorQA() {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor_qa'],
    queryFn: async () => {
        let qData = [];
        let rData = [];
        try {
          const res = await Promise.all([
            instructorDashboardService.getQuestions(),
            instructorDashboardService.getReviews()
          ]);
          qData = res[0];
          rData = res[1];
        } catch (e) {
          console.error("Failed to fetch QA data:", e);
          if (!USE_INSTRUCTOR_MOCK) throw e;
        }

        if (USE_INSTRUCTOR_MOCK && (!rData || rData.length === 0)) {
          rData = MOCK_QA.reviews;
        }

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
