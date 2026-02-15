import { apiRequest } from './client';

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  mediaType: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  author?: string;
  createdAt: string;
}

export async function getMedia(params?: { type?: string; limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.type) qs.set('type', params.type);
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const query = qs.toString();
  return apiRequest<{ data: MediaItem[] }>('GET', `/api/connected/immersion/media${query ? `?${query}` : ''}`);
}

export async function getMediaItem(mediaId: string) {
  return apiRequest<{ data: MediaItem }>('GET', `/api/connected/immersion/media/${mediaId}`);
}
