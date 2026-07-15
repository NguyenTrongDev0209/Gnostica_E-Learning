import { useState, useEffect } from 'react';
import { MOCK_STATS, MOCK_INSTRUCTORS } from '@/mocks/homeMocks';

export default function useHomeData() {
    const [stats, setStats] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingInstructors, setLoadingInstructors] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Mock data loading
        setTimeout(() => {
            setStats(MOCK_STATS);
            setLoadingStats(false);
        }, 500);
        
        setTimeout(() => {
            setInstructors(MOCK_INSTRUCTORS);
            setLoadingInstructors(false);
        }, 800);
    }, []);

    return {
        stats,
        instructors,
        loadingStats,
        loadingInstructors,
        error
    };
}
