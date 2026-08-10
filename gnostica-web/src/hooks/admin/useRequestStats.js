import { useState, useCallback, useEffect } from 'react';
import requestStatsService from '@/services/admin/requestStatsService';
import { toast } from 'sonner';

export default function useRequestStats(type) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [months, setMonths] = useState(6);

    const fetchStats = useCallback(async (selectedMonths = months) => {
        setLoading(true);
        setError(null);
        try {
            let data = null;
            switch (type) {
                case 'supports':
                    data = await requestStatsService.getSupportsStats(selectedMonths);
                    break;
                case 'refunds':
                    data = await requestStatsService.getRefundsStats(selectedMonths);
                    break;
                case 'withdrawals':
                    data = await requestStatsService.getWithdrawalsStats(selectedMonths);
                    break;
                case 'reports':
                    data = await requestStatsService.getThreadReportsStats(selectedMonths);
                    break;
                default:
                    throw new Error(`Unknown stat type: ${type}`);
            }
            setStats(data);
        } catch (err) {
            console.error(`Failed to fetch ${type} stats:`, err);
            setError(err.message || 'Lỗi khi tải dữ liệu thống kê');
            toast.error('Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    }, [type, months]);

    useEffect(() => {
        fetchStats(months);
    }, []);

    const changeMonths = (newMonths) => {
        setMonths(newMonths);
        fetchStats(newMonths);
    };

    return {
        stats,
        loading,
        error,
        months,
        changeMonths,
        fetchStats
    };
}
