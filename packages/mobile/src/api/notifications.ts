import { apiRequest } from './client';
import type { Notification } from '@naca/shared';
export type { Notification } from '@naca/shared';

export async function getNotifications(params?: { limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const query = qs.toString();
  return apiRequest<{ data: Notification[] }>('GET', `/api/connected/mobile/notifications${query ? `?${query}` : ''}`);
}
