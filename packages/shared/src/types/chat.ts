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
