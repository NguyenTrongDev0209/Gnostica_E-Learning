import { useState, useEffect } from 'react';
import courseService from '@/services/course/courseService';
import authService from '@/services/auth/authService';

export default function useRecommendedCourses(size = 4) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    useEffect(() => {
        let isMounted = true;

        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const data = await courseService.getRecommendedCourses(0, size);
                if (isMounted) {
                    setCourses(data.content || []);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error fetching recommendations:', error);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (user) {
            fetchRecommendations();
        } else {
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [size, user]);

    return { courses, loading, user };
}
