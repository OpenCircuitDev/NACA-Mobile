import { apiRequest } from './client';
import type { DictionaryEntrySubmission } from '@naca/shared';
export type { DictionaryEntrySubmission } from '@naca/shared';

export async function submitDictionaryEntry(data: DictionaryEntrySubmission) {
  return apiRequest('POST', '/api/connected/learning/dictionary/entries', data);
}

export async function submitFeedback(data: {
  type: string;
  title: string;
  description: string;
}) {
  return apiRequest('POST', '/api/connected/interactive/feedback', data);
}
