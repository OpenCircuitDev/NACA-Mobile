export interface GameItem {
  id: string;
  question: string;
  answer: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
}

export interface GameDataset {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  items: GameItem[];
}
