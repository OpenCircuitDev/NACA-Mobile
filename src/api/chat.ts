import { apiRequest } from './client';

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  lastMessage?: {
    content: string;
    senderName: string;
    sentAt: string;
  };
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  content: string;
  senderId: string;
  senderName: string;
  sentAt: string;
}

export async function getChatChannels() {
  return apiRequest<{ data: ChatChannel[] }>('GET', '/api/connected/communications/chat/channels');
}

export async function sendChatMessage(channelId: string, content: string) {
  return apiRequest('POST', '/api/connected/communications/chat/messages', { channelId, content });
}
