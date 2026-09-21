import { useCallback, useEffect, useState } from 'react';
export const API = import.meta.env.VITE_API_BASE || '/api';
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export async function request<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; meta?: { page: number; pageSize: number; total: number } }> {
  const response = await fetch(API + path, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new ApiError('No se pudo contactar al servidor. Revisá la conexión.', response.status);
  }
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/auth/'))
      window.dispatchEvent(new Event('lider:unauthorized'));
    throw new ApiError(result.message || 'No se pudo completar la operación.', response.status);
  }
  return result;
}
export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  return (
    await request<T>(path, {
      method,
      ...(body === undefined
        ? {}
        : { body: body instanceof FormData ? body : JSON.stringify(body) }),
    })
  ).data;
}
export function useData<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    if (!path) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    api<T>(path)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  return { data, loading, error, reload };
}
