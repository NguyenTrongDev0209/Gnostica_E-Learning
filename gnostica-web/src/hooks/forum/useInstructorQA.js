import { useQuery } from "@tanstack/react-query";
import { instructorDashboardService } from "@/services/instructor/instructorDashboardService";
import { USE_INSTRUCTOR_MOCK, MOCK_QA } from "@/mocks/instructorMockData";

export default function useInstructorQA() {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor_qa'],
    queryFn: async () => {
        let qData = [];
        let rData = [];
        let tData = [];
        try {
          const res = await Promise.allSettled([
            instructorDashboardService.getQuestions(),
            instructorDashboardService.getReviews(),
            instructorDashboardService.getReplyTemplates()
          ]);
          
          if (res[0].status === 'fulfilled') {
              qData = res[0].value;
          } else {
              console.error("Failed to fetch questions:", res[0].reason);
          }
          
          if (res[1].status === 'fulfilled') {
              rData = res[1].value;
          } else {
              console.error("Failed to fetch reviews:", res[1].reason);
          }

          if (res[2].status === 'fulfilled') {
              tData = res[2].value?.data || [];
          } else {
              console.error("Failed to fetch templates:", res[2].reason);
          }
          
          if (res[0].status === 'rejected' && res[1].status === 'rejected') {
              if (!USE_INSTRUCTOR_MOCK) throw new Error("Both QA and Reviews failed to fetch");
          }
        } catch (e) {
          console.error("Failed to fetch QA data:", e);
          if (!USE_INSTRUCTOR_MOCK) throw e;
        }


        return {
            questions: qData || [],
            reviews: rData || [],
            templates: tData || []
        };
    },
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });

  return { 
      questions: data?.questions || [], 
      reviews: data?.reviews || [], 
      templates: data?.templates || [],
      loading: isLoading 
  };
}
