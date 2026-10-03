/**
 * useWatchSync — Pushes key data to the Apple Watch companion app
 *
 * Uses react-native-watch-connectivity's updateApplicationContext to push:
 * - User info (id, email, name) after login
 * - Community ID
 * - Word of the day
 * - Streak count
 * - XP/level data
 *
 * Call this hook in the root layout after auth is confirmed.
 * Data is pushed whenever it changes (not on every render).
 */
import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

// Lazy import — only loads on iOS
let watchModule: typeof import('react-native-watch-connectivity') | null = null;
if (Platform.OS === 'ios') {
  try {
    watchModule = require('react-native-watch-connectivity');
  } catch {
    // Not installed or not available (Expo Go)
    console.log('[WatchSync] react-native-watch-connectivity not available');
  }
}

interface WatchSyncData {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  communityId?: string;
  wordOfDay?: {
    word: string;
    translation: string;
    date: string;
  };
  streak?: number;
  longestStreak?: number;
  xp?: number;
  level?: number;
  progressPercent?: number;
}

export function useWatchSync(data: WatchSyncData) {
  const lastSentRef = useRef<string>('');

  const sendToWatch = useCallback(async (payload: Record<string, any>) => {
    if (!watchModule || Platform.OS !== 'ios') return;

    try {
      const { updateApplicationContext } = watchModule;
      await updateApplicationContext(payload);
      console.log('[WatchSync] Pushed context to Watch:', Object.keys(payload).join(', '));
    } catch (error) {
      console.warn('[WatchSync] Failed to push to Watch:', error);
    }
  }, []);

  useEffect(() => {
    if (!watchModule || Platform.OS !== 'ios') return;

    // Build the context object (only include defined values)
    const context: Record<string, any> = {};
    if (data.userId) context.userId = data.userId;
    if (data.email) context.email = data.email;
    if (data.firstName) context.firstName = data.firstName;
    if (data.lastName) context.lastName = data.lastName;
    if (data.communityId) context.communityId = data.communityId;
    if (data.wordOfDay) {
      context.wordOfDay_word = data.wordOfDay.word;
      context.wordOfDay_translation = data.wordOfDay.translation;
      context.wordOfDay_date = data.wordOfDay.date;
    }
    if (data.streak !== undefined) context.streak = data.streak;
    if (data.longestStreak !== undefined) context.longestStreak = data.longestStreak;
    if (data.xp !== undefined) context.xp = data.xp;
    if (data.level !== undefined) context.level = data.level;
    if (data.progressPercent !== undefined) context.progressPercent = data.progressPercent;

    // Only send if data changed
    const serialized = JSON.stringify(context);
    if (serialized === lastSentRef.current) return;
    lastSentRef.current = serialized;

    sendToWatch(context);
  }, [data, sendToWatch]);
}
