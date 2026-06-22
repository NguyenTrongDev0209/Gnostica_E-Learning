import { useQuery } from '@tanstack/react-query';
import instructorService from '@/services/instructorService';

export function useInstructorStudents() {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor_students'],
    queryFn: async () => {
      const res = await instructorService.getMyStudents();
      const students = res.data || res || [];
      
      const total = students.length;
      const completed = students.filter(s => s.progress === 100).length;
      const learning = students.filter(s => s.progress < 100 && s.progress > 0).length;
      const active = students.filter(s => s.lastActive && !s.lastActive.includes("ngày") && !s.lastActive.includes("/")).length;

      return {
        students,
        stats: { total, completed, learning, active }
      };
    },
    staleTime: 1000 * 60 * 2,
  });

  return {
    students: data?.students || [],
    stats: data?.stats || { total: 0, completed: 0, learning: 0, active: 0 },
    loading: isLoading
  };
}
