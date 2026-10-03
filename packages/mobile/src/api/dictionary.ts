import { apiRequest } from './client';
import type { DictionaryEntry, DictionarySearchResult } from '@naca/shared';
export type { DictionaryEntry, DictionarySearchResult } from '@naca/shared';

export async function searchDictionary(query: string, options?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<DictionarySearchResult> {
  const params = new URLSearchParams({ q: query });
  if (options?.category) params.set('category', options.category);
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));

  return apiRequest('GET', `/api/connected/learning/dictionary/search?${params}`);
}

export async function getDictionaryEntry(entryId: string) {
  return apiRequest('GET', `/api/connected/learning/dictionary/entries/${entryId}`);
}

export async function getDictionaryCategories() {
  return apiRequest('GET', `/api/connected/learning/dictionary/categories`);
}

export async function getWordOfTheDay() {
  return apiRequest('GET', `/api/connected/learning/dictionary/word-of-the-day`);
}

export async function getDictionaryStats() {
  return apiRequest('GET', `/api/connected/learning/dictionary/stats`);
}
