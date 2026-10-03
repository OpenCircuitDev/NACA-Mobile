export interface DictionaryEntry {
  id: string;
  indigenousWord: string;
  englishTranslation: string;
  pronunciation?: string;
  category?: string;
  audioUrl?: string;
  imageUrl?: string;
  examples?: string[];
}

export interface DictionarySearchResult {
  data: {
    entries: DictionaryEntry[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface WordOfDay {
  entry: DictionaryEntry;
  date: string;
}
