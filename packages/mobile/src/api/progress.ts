import { apiRequest } from './client';
import type { ProgressEvent, ProgressSummary } from '@naca/shared';
export type { ProgressEvent, ProgressSummary } from '@naca/shared';

export async function getProgressSummary(userId: string) {
  return apiRequest<{ data: ProgressSummary }>('GET', `/api/connected/learning/progress/${userId}`);
}

export async function recordProgressEvent(userId: string, event: ProgressEvent) {
  return apiRequest('POST', `/api/connected/learning/progress/${userId}`, event);
}

export async function getProgressHistory(userId: string, params?: {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.startDate) qs.set('startDate', params.startDate);
  if (params?.endDate) qs.set('endDate', params.endDate);
  if (params?.eventType) qs.set('eventType', params.eventType);
  if (params?.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return apiRequest('GET', `/api/connected/learning/progress/${userId}/history${query ? `?${query}` : ''}`);
}

export async function getLessonProgress(userId: string, lessonId: string) {
  return apiRequest('GET', `/api/connected/learning/progress/${userId}/lessons/${lessonId}`);
}
