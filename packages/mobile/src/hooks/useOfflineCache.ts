import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CACHE_PREFIX = 'naca_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useOfflineCache<T>(key: string, fetcher: () => Promise<T>, options?: {
  ttl?: number;
  enabled?: boolean;
}) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = `${CACHE_PREFIX}${key}`;
  const ttl = options?.ttl ?? CACHE_TTL;
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check network status
        const netState = await NetInfo.fetch();
        const online = netState.isConnected && netState.isInternetReachable;
        setIsOffline(!online);

        if (online) {
          // Try fetching fresh data
          try {
            const freshData = await fetcher();
            setData(freshData);
            // Cache the result
            const entry: CacheEntry<T> = { data: freshData, timestamp: Date.now() };
            await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
          } catch (fetchError: any) {
            // Fall back to cache on fetch error
            const cached = await loadFromCache();
            if (cached) {
              setData(cached);
            } else {
              setError(fetchError);
            }
          }
        } else {
          // Offline — use cache
          const cached = await loadFromCache();
          if (cached) {
            setData(cached);
          } else {
            setError(new Error('No cached data available offline'));
          }
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, enabled]);

  const loadFromCache = async (): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp > ttl) {
        // Cache expired
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      return entry.data;
    } catch {
      return null;
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    try {
      const freshData = await fetcher();
      setData(freshData);
      const entry: CacheEntry<T> = { data: freshData, timestamp: Date.now() };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, isOffline, error, refresh };
}

// Utility to clear all cached data
export async function clearAllCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch {
    // Ignore errors
  }
}

// Queue for offline contributions
const OFFLINE_QUEUE_KEY = 'naca_offline_queue';

interface OfflineAction {
  id: string;
  method: string;
  path: string;
  data: any;
  createdAt: number;
}

export async function queueOfflineAction(method: string, path: string, data: any) {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue: OfflineAction[] = raw ? JSON.parse(raw) : [];
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      method,
      path,
      data,
      createdAt: Date.now(),
    });
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore
  }
}

export async function processOfflineQueue(apiRequest: Function) {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return;

    const queue: OfflineAction[] = JSON.parse(raw);
    const remaining: OfflineAction[] = [];

    for (const action of queue) {
      try {
        await apiRequest(action.method, action.path, action.data);
      } catch {
        remaining.push(action);
      }
    }

    if (remaining.length > 0) {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    } else {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    }
  } catch {
    // Ignore
  }
}
