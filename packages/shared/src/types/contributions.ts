export interface DictionaryEntrySubmission {
  indigenousWord: string;
  englishTranslation: string;
  pronunciation?: string;
  category?: string;
  partOfSpeech?: string;
  examples?: string[];
  notes?: string;
}
