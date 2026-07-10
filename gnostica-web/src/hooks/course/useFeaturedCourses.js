import { useState, useEffect } from 'react';
import courseService from '@/services/course/courseService';

export default function useFeaturedCourses(size = 8) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getAllCourses(0, size);
        if (isMounted) {
          setCourses(data.content || []);
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
