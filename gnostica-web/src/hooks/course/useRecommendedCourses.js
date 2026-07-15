import { useState, useEffect } from 'react';
import { MOCK_COURSES } from '@/mocks/homeMocks';

export default function useRecommendedCourses(size = 4) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    // Hardcode user so recommended courses show up without login during testing
    const user = { email: "test@example.com" }; 

    useEffect(() => {
        let isMounted = true;

        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                // Mock delay
                await new Promise(r => setTimeout(r, 600));
                if (isMounted) {
                    setCourses(MOCK_COURSES.slice(0, size));
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

        fetchRecommendations();

        return () => {
            isMounted = false;
        };
    }, [size]);

    return { courses, loading, user };
}
