/**
 * QR API client — Phase 2.6.
 *
 * Wraps the PUBLIC QR lookup endpoint at `/api/public/qr/:qrId`.
 * Unlike the rest of the mobile API, this endpoint is unauthenticated —
 * QR labels are meant to be scannable by anyone (a parent at home, a kid
 * in a classroom, a museum visitor, etc.).
 *
 * Response shape mirrors `QRLookupResult` from server/publicQRRoutes.ts:
 *   { found, qrId, activity, vocabulary[], relatedDictionaryEntries[], message? }
 */

import { API_URL } from '../constants/config';

export interface VocabularyItem {
  id: string;
  english: string;
  language: string;
  pronunciationGuide: string | null;
  audioStoragePath: string | null;
  imageStoragePath: string | null;
  dictionaryEntryId: string | null;
}

export interface RelatedDictionaryEntry {
  id: string;
  language: string | null;
  english: string | null;
  category: string | null;
  pronunciationKey: string | null;
  speaker1Audio: string | null;
  speaker2Audio: string | null;
  images: string | null;
  imageStoragePath: string | null;
}

export interface ActivityInfo {
  id: string;
  name: string;
  activityType: string;
  description: string | null;
  communityId: string | null;
  communityName: string | null;
  thumbnailUrl: string | null;
  isPublished: boolean;
}

export interface QRLookupResult {
  found: boolean;
  qrId: string;
  activity: ActivityInfo | null;
  vocabulary: VocabularyItem[];
  relatedDictionaryEntries: RelatedDictionaryEntry[];
  message?: string;
}

/**
 * Looks up a QR ID via the public endpoint. Returns the QRLookupResult shape
 * directly. Throws on network errors; callers should catch and fall back to
 * the offline scan cache when appropriate.
 */
export async function lookupQr(qrId: string): Promise<QRLookupResult> {
  const trimmed = qrId.trim();
  if (!trimmed) {
    throw new Error('QR ID is required');
  }
  const url = `${API_URL}/api/public/qr/${encodeURIComponent(trimmed)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`QR lookup failed: ${res.status}`);
  }
  return res.json();
}
