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
