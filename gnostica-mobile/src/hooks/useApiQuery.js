import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle API requests with loading and error states
 * @param {Function} apiFunc - The API service function to call
 * @param {Array} params - Array of parameters to pass to the API function
 * @param {boolean} immediate - Whether to execute the request immediately
 * @returns {Object} { data, loading, error, execute }
 */
const useApiQuery = (apiFunc, params = [], immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFunc(...(args.length ? args : params));
            // Trích xuất data từ ApiResponse
            const resultData = response?.data || response?.content || response;
            setData(resultData);
            return resultData;
        } catch (err) {
            console.error('useApiQuery Error:', err);
            setError(err?.message || 'Có lỗi xảy ra');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunc, ...params]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { data, loading, error, execute };
};

export default useApiQuery;
