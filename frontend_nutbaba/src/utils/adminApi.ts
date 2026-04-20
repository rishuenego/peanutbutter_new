import { getApiUrl } from './index';

const API_URL = getApiUrl();

export function getAdminToken(): string | null {
  return localStorage.getItem('adminToken');
}

export function getAdminHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

export async function adminFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  
  const headers: HeadersInit = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  
  // Only add Content-Type if not FormData
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
