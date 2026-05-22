import { useState, useEffect, useCallback } from 'react'
import type { AxiosResponse } from 'axios'

export function useApi<T>(
  apiFn: () => Promise<AxiosResponse<any>>,
  deps: any[] = [],
  immediate = true
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn()
      const resolved = res.data?.data ?? res.data
      setData(resolved as T)
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

export function useMutation<T, P = object>(apiFn: (payload: P) => Promise<AxiosResponse<any>>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (payload: P): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(payload)
      return res.data?.data ?? res.data
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}