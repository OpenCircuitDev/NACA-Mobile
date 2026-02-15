import { apiRequest } from './client';

export interface DictionaryEntrySubmission {
  indigenousWord: string;
  englishTranslation: string;
  pronunciation?: string;
  category?: string;
  partOfSpeech?: string;
  examples?: string[];
  notes?: string;
}

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
