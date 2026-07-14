import { useState, useEffect } from "react";
import { MOCK_STATS, MOCK_COURSES } from "@/mocks/accountMocks";

export default function useLearningProgress() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStats(MOCK_STATS);
      setCourses(MOCK_COURSES);
      setLoading(false);
    }, 600);
  }, []);

  return {
    courses,
    stats,
    loading
  };
}
