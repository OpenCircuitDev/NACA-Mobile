import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

const TOKEN_KEY = 'naca_access_token';
const REFRESH_KEY = 'naca_refresh_token';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/api/mobile/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return false;
    }

    const data = await res.json();
    await setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    await clearTokens();
    return false;
  }
}

// Stored community ID for X-NACA-Community header
let activeCommunityId: string | null = null;

export function setActiveCommunityId(id: string | null) {
  activeCommunityId = id;
}

export async function apiRequest<T = any>(
  method: string,
  path: string,
  data?: unknown,
  options?: { skipAuth?: boolean }
): Promise<T> {
  const url = `${API_URL}${path}`;
  const accessToken = options?.skipAuth ? null : await getAccessToken();

  const headers: Record<string, string> = {};
  if (data) headers['Content-Type'] = 'application/json';
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (activeCommunityId) headers['X-NACA-Community'] = activeCommunityId;

  let res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && !options?.skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      const newToken = await getAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });
    } else {
      throw new AuthError('Session expired');
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text);
  }

  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return res.json();
  }
  return undefined as T;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
