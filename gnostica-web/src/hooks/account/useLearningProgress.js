import { useState, useEffect } from "react";
import enrollmentService from "@/services/course/enrollmentService";
import { toast } from "sonner";

export default function useLearningProgress() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, coursesRes] = await Promise.all([
          enrollmentService.getMyStats(),
          enrollmentService.getMyCourses()
        ]);

        if (statsRes.success) {
          setStats(statsRes.data);
        }

        if (coursesRes.success) {
          setCourses(coursesRes.data);
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
        toast.error("Không thể tải thông tin tiến độ học tập");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    courses,
    stats,
    loading
  };
}
