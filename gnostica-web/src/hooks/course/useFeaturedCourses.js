import { useState, useEffect } from 'react';
import { MOCK_COURSES } from '@/mocks/homeMocks';

export default function useFeaturedCourses(size = 8) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Mock delay
        await new Promise(r => setTimeout(r, 600));
        if (isMounted) {
          setCourses(MOCK_COURSES.slice(0, size));
        }
      } catch (error) {
        if (isMounted) {
          console.error("Lỗi khi tải khóa học thịnh hành:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, [size]);

  return { courses, loading };
}
