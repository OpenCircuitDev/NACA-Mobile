import { apiRequest } from './client';
import type { ChatChannel, ChatMessage } from '@naca/shared';
export type { ChatChannel, ChatMessage } from '@naca/shared';

export async function getChatChannels() {
  return apiRequest<{ data: ChatChannel[] }>('GET', '/api/connected/communications/chat/channels');
}

export async function sendChatMessage(channelId: string, content: string) {
  return apiRequest('POST', '/api/connected/communications/chat/messages', { channelId, content });
}
