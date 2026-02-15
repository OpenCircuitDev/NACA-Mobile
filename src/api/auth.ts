import { apiRequest, setTokens, clearTokens, getRefreshToken } from './client';
import { API_URL } from '../constants/config';

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  profileImageUrl: string | null;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function loginApi(email: string, password: string, deviceInfo?: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/mobile/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, deviceInfo }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(data.message || 'Login failed');
  }

  const data: AuthResponse = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function registerApi(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  deviceInfo?: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/mobile/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName, deviceInfo }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(data.message || 'Registration failed');
  }

  const data: AuthResponse = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logoutApi(): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
    await fetch(`${API_URL}/api/mobile/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // Logout silently even if server request fails
  }
  await clearTokens();
}

export async function refreshSession(): Promise<AuthResponse | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/api/mobile/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return null;
    }

    const data: AuthResponse = await res.json();
    await setTokens(data.accessToken, data.refreshToken);
    return data;
  } catch {
    await clearTokens();
    return null;
  }
}
