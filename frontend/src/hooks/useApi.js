import { useState, useEffect, useCallback } from 'react';
export function useApi(apiFn, deps = [], immediate = true) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);
    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFn();
            const resolved = res.data?.data ?? res.data;
            setData(resolved);
        }
        catch (e) {
            setError(e.response?.data?.message || e.message || 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    }, deps);
    useEffect(() => {
        if (immediate)
            execute();
    }, [execute]);
    return { data, loading, error, refetch: execute };
}
export function useMutation(apiFn) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const mutate = async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFn(payload);
            return res.data?.data ?? res.data;
        }
        catch (e) {
            setError(e.response?.data?.message || e.message || 'An error occurred');
            return null;
        }
        finally {
            setLoading(false);
        }
    };
    return { mutate, loading, error };
}
