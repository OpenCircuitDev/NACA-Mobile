/**
 * Scan Cache + History — Phase 2.6 mobile.
 *
 * Two responsibilities:
 *   1. Offline-cache the LAST RESOLVED VALUE for a QR ID. When the device
 *      is offline (or the server is unreachable), `getCachedLookup()` returns
 *      the previously-seen result so the scanner stays useful in classrooms
 *      with unreliable wifi.
 *   2. Maintain a chronological scan history so the Elder / learner can
 *      replay the day's scans without re-pointing the camera.
 *
 * Storage: AsyncStorage (per-device, per-install). NOT synced to the server
 * in v1. If the user signs out, history clears (the auth context can call
 * `clearAll()` on logout to avoid Elder A seeing Elder B's history on a
 * shared classroom device).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QRLookupResult } from '../api/qr';

const CACHE_KEY_PREFIX = 'qr:lookup:';
const HISTORY_KEY = 'qr:scan-history';
const HISTORY_MAX = 50;
// Cache lookups for 7 days. Refresh on next online scan automatically.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CachedEntry {
  result: QRLookupResult;
  cachedAt: number; // ms since epoch
}

export interface HistoryItem {
  qrId: string;
  scannedAt: number;
  summary: string; // human-readable label for the history list
  found: boolean;
}

// ============================================================================
// Lookup cache
// ============================================================================

export async function getCachedLookup(qrId: string): Promise<QRLookupResult | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY_PREFIX + qrId);
    if (!raw) return null;
    const cached: CachedEntry = JSON.parse(raw);
    if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
      // Expired — clean up
      await AsyncStorage.removeItem(CACHE_KEY_PREFIX + qrId);
      return null;
    }
    return cached.result;
  } catch {
    return null;
  }
}

export async function setCachedLookup(qrId: string, result: QRLookupResult): Promise<void> {
  try {
    const entry: CachedEntry = { result, cachedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY_PREFIX + qrId, JSON.stringify(entry));
  } catch {
    // Cache failures are non-fatal
  }
}

// ============================================================================
// Scan history
// ============================================================================

function summarizeLookup(result: QRLookupResult): string {
  if (result.relatedDictionaryEntries.length > 0) {
    const e = result.relatedDictionaryEntries[0];
    return e.language ?? e.english ?? `dictionary entry ${e.id.slice(0, 6)}`;
  }
  if (result.vocabulary.length > 0) {
    const v = result.vocabulary[0];
    return v.language || v.english || `vocab ${v.id.slice(0, 6)}`;
  }
  if (result.activity) {
    return result.activity.name;
  }
  return result.found ? 'unknown content' : 'not found';
}

export async function getScanHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

export async function appendToHistory(qrId: string, result: QRLookupResult): Promise<void> {
  try {
    const current = await getScanHistory();
    const summary = summarizeLookup(result);
    // De-dup adjacent identical scans (kid scanning the same label repeatedly)
    if (current[0]?.qrId === qrId) return;
    const next: HistoryItem[] = [
      { qrId, scannedAt: Date.now(), summary, found: result.found },
      ...current,
    ].slice(0, HISTORY_MAX);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // History writes are non-fatal
  }
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

/** Wipe both cache + history. Call on logout to avoid leaking across users. */
export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith(CACHE_KEY_PREFIX) || k === HISTORY_KEY);
    if (ours.length > 0) await AsyncStorage.multiRemove(ours);
  } catch {
    // best-effort
  }
}
