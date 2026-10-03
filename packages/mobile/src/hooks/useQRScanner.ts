/**
 * useQRScanner — Phase 2.6 mobile.
 *
 * Encapsulates the QR lookup state machine: scan input → online lookup → cache
 * fallback when offline → history append. Used by app/scan/index.tsx.
 *
 * Returns:
 *   - lookupQrAndCache(qrId) — resolve a QR ID, prefer live lookup, fall back
 *     to cache, append to history regardless. Returns the result + a hint
 *     about whether it came from cache.
 *   - The scanner UI itself handles camera permission + barcode events
 *     because that's expo-camera-specific (no benefit in further wrapping).
 */

import { useCallback } from 'react';
import { lookupQr, type QRLookupResult } from '../api/qr';
import {
  getCachedLookup,
  setCachedLookup,
  appendToHistory,
} from '../services/scanCache';

export interface LookupOutcome {
  result: QRLookupResult;
  source: 'live' | 'cache';
  error?: string;
}

export function useQRScanner() {
  const lookupQrAndCache = useCallback(async (qrId: string): Promise<LookupOutcome> => {
    // First try live
    try {
      const result = await lookupQr(qrId);
      // Cache + history regardless of found/not-found
      await setCachedLookup(qrId, result);
      await appendToHistory(qrId, result);
      return { result, source: 'live' };
    } catch (err: any) {
      // Live failed — try cache (likely offline)
      const cached = await getCachedLookup(qrId);
      if (cached) {
        await appendToHistory(qrId, cached);
        return { result: cached, source: 'cache' };
      }
      // No cache either — return an empty "not found" result and surface the error
      const notFound: QRLookupResult = {
        found: false,
        qrId,
        activity: null,
        vocabulary: [],
        relatedDictionaryEntries: [],
        message: 'Offline and not in cache. Connect to wifi and try again.',
      };
      await appendToHistory(qrId, notFound);
      return { result: notFound, source: 'live', error: err?.message ?? 'Network error' };
    }
  }, []);

  return { lookupQrAndCache };
}
