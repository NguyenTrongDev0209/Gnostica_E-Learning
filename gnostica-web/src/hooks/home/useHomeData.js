import { useState, useEffect } from 'react';
import * as homeService from '@/services/home/homeService';

export default function useHomeData() {
    const [stats, setStats] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingInstructors, setLoadingInstructors] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const data = await homeService.getPlatformStats();
                setStats(data);
            } catch (err) {
                setError(err);
                console.error("Failed to load platform stats:", err);
            } finally {
                setLoadingStats(false);
            }
        };

        const fetchInstructors = async () => {
            try {
                setLoadingInstructors(true);
                const data = await homeService.getInstructors();
                setInstructors(data);
            } catch (err) {
                setError(err);
                console.error("Failed to load instructors:", err);
            } finally {
                setLoadingInstructors(false);
            }
        };

        fetchStats();
        fetchInstructors();
    }, []);

    return {
        stats,
        instructors,
        loadingStats,
        loadingInstructors,
        error
    };
}
