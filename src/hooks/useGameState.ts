import { useState, useCallback, useRef } from 'react';

export interface GameItem {
  id: string;
  question: string;
  answer: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
}

interface GameState {
  items: GameItem[];
  currentIndex: number;
  score: number;
  total: number;
  isComplete: boolean;
  startTime: number;
  elapsedSeconds: number;
}

export function useGameState(items: GameItem[]) {
  const [state, setState] = useState<GameState>({
    items,
    currentIndex: 0,
    score: 0,
    total: items.length,
    isComplete: false,
    startTime: Date.now(),
    elapsedSeconds: 0,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setState(s => ({ ...s, elapsedSeconds: Math.floor((Date.now() - start) / 1000) }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const submitAnswer = useCallback((isCorrect: boolean) => {
    setState(prev => {
      const newScore = prev.score + (isCorrect ? 1 : 0);
      const nextIndex = prev.currentIndex + 1;
      const isComplete = nextIndex >= prev.total;

      if (isComplete) {
        if (timerRef.current) clearInterval(timerRef.current);
      }

      return {
        ...prev,
        score: newScore,
        currentIndex: nextIndex,
        isComplete,
      };
    });
  }, []);

  const reset = useCallback(() => {
    stopTimer();
    setState({
      items,
      currentIndex: 0,
      score: 0,
      total: items.length,
      isComplete: false,
      startTime: Date.now(),
      elapsedSeconds: 0,
    });
  }, [items, stopTimer]);

  const currentItem = state.items[state.currentIndex] || null;
  const xpEarned = Math.round((state.score / Math.max(state.total, 1)) * 20);

  return {
    ...state,
    currentItem,
    xpEarned,
    submitAnswer,
    reset,
    startTimer,
    stopTimer,
  };
}
