import { logger } from '@/lib/logger';
import { useAuthStore } from '@/store/useAuthStore';

export const API_ORIGIN = 'http://localhost:8081';

const API_BASE_URL = `${API_ORIGIN}/api`;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  // Pour un FormData, le navigateur pose lui-même le Content-Type multipart (boundary).
  const isFormData = options.body instanceof FormData;
  const method = options.method ?? 'GET';

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    logger.error('api', `${method} ${path} : requête réseau échouée`, { error });
    throw error;
  }

  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !body || !body.success) {
    logger.warn('api', `${method} ${path} → ${response.status} : ${body?.message ?? 'erreur inconnue'}`);
    if (response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/401';
    } else if (response.status === 403) {
      window.location.href = '/403';
    }
    throw new Error(body?.message ?? `Erreur ${response.status}`);
  }

  return body.data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : null }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : null }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : null }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
};
