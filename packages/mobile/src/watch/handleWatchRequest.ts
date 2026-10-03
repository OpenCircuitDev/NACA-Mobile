/**
 * handleWatchRequest — Responds to sendMessage requests from the watchOS app
 *
 * The watch sends messages when it needs data and has no direct network.
 * Request types: wordOfDay, streak, xp, achievements, dictionarySearch
 */
import { Platform } from 'react-native';
import { searchDictionary, getWordOfTheDay } from '../api/dictionary';
import { getUserXP, getUserStreak, getUserAchievements } from '../api/gamification';

let watchModule: typeof import('react-native-watch-connectivity') | null = null;
if (Platform.OS === 'ios') {
  try {
    watchModule = require('react-native-watch-connectivity');
  } catch {
    console.log('[WatchRequest] react-native-watch-connectivity not available');
  }
}

type WatchMessage = {
  requestType: string;
  [key: string]: any;
};

type ReplyHandler = (reply: Record<string, any>) => void;

async function processRequest(message: WatchMessage): Promise<Record<string, any>> {
  const { requestType } = message;

  try {
    switch (requestType) {
      case 'wordOfDay': {
        const result = await getWordOfTheDay();
        return { success: true, data: result };
      }
      case 'streak': {
        const userId = message.userId as string;
        if (!userId) return { success: false, error: 'userId required' };
        const result = await getUserStreak(userId);
        return { success: true, data: result };
      }
      case 'xp': {
        const userId = message.userId as string;
        if (!userId) return { success: false, error: 'userId required' };
        const result = await getUserXP(userId);
        return { success: true, data: result };
      }
      case 'achievements': {
        const userId = message.userId as string;
        if (!userId) return { success: false, error: 'userId required' };
        const result = await getUserAchievements(userId);
        return { success: true, data: result };
      }
      case 'dictionarySearch': {
        const query = message.query as string;
        if (!query) return { success: false, error: 'query required' };
        const result = await searchDictionary(query, { limit: 10 });
        return { success: true, data: result };
      }
      default:
        return { success: false, error: `Unknown request type: ${requestType}` };
    }
  } catch (error: any) {
    console.error(`[WatchRequest] Error handling ${requestType}:`, error);
    return { success: false, error: error.message || 'Request failed' };
  }
}

let isListening = false;

/**
 * Start listening for incoming Watch requests.
 * Call once at app startup (in _layout.tsx or similar).
 * Safe to call multiple times — only sets up listener once.
 */
export function startWatchRequestListener() {
  if (!watchModule || Platform.OS !== 'ios' || isListening) return;

  try {
    const { watchEvents } = watchModule;

    watchEvents.on('message', (message: any, replyHandler?: ReplyHandler) => {
      if (!message?.requestType) return;

      processRequest(message as WatchMessage).then((reply) => {
        if (replyHandler) {
          replyHandler(reply);
        }
      });
    });

    isListening = true;
    console.log('[WatchRequest] Listening for Watch messages');
  } catch (error) {
    console.warn('[WatchRequest] Failed to start listener:', error);
  }
}

export function stopWatchRequestListener() {
  // react-native-watch-connectivity doesn't expose removeListener easily,
  // but this flag prevents double-registering
  isListening = false;
}
