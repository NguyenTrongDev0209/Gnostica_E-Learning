import { useState, useEffect } from "react";
import { instructorDashboardService } from "@/services/instructorDashboardService";

export default function useInstructorQA() {
  const [questions, setQuestions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qData, rData] = await Promise.all([
          instructorDashboardService.getQuestions(),
          instructorDashboardService.getReviews()
        ]);
        setQuestions(qData || []);
        setReviews(rData || []);
      } catch (error) {
        console.error("Error fetching QA data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { questions, reviews, loading };
}
