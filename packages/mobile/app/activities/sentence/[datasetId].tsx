import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getGameDataset } from '../../../src/api/lessons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { recordProgressEvent } from '../../../src/api/progress';
import GameResults from '../../../src/components/games/GameResults';
import ProgressBar from '../../../src/components/ui/ProgressBar';

export default function SentenceBuilderGame() {
  const { datasetId } = useLocalSearchParams<{ datasetId: string }>();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [startTime] = useState(Date.now());

  const { data, isLoading } = useQuery({
    queryKey: ['gameDataset', datasetId],
    queryFn: () => getGameDataset(datasetId!),
    enabled: !!datasetId,
  });

  const items = data?.data?.items || [];
  const currentItem = items[currentIndex];
  const total = items.length;

  // Split the answer into words and shuffle
  const targetWords = useMemo(() => {
    const sentence = currentItem?.answer || currentItem?.indigenousWord || '';
    return sentence.split(/\s+/).filter(Boolean);
  }, [currentIndex, items.length]);

  const shuffledWords = useMemo(() => {
    const words = [...targetWords];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  }, [targetWords]);

  const availableWords = shuffledWords.filter(w => {
    const usedCount = placedWords.filter(p => p === w).length;
    const totalCount = shuffledWords.filter(s => s === w).length;
    return usedCount < totalCount;
  });

  const handleWordPress = (word: string) => {
    setPlacedWords(prev => [...prev, word]);
  };

  const handleRemoveWord = (index: number) => {
    setPlacedWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    const isCorrect = placedWords.join(' ') === targetWords.join(' ');
    setShowFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      setShowFeedback(null);
      if (currentIndex + 1 >= total) {
        const finalScore = score + (isCorrect ? 1 : 0);
        if (user) {
          recordProgressEvent(user.id, {
            eventType: 'game_completed',
            sourceType: 'game_dataset',
            sourceId: datasetId!,
            data: { gameType: 'sentence_builder' },
            score: finalScore,
            xpEarned: Math.round((finalScore / total) * 20),
            timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
          }).catch(() => {});
        }
        setShowResults(true);
      } else {
        setCurrentIndex(i => i + 1);
        setPlacedWords([]);
      }
    }, 1000);
  };

  const reset = () => {
    setCurrentIndex(0);
    setScore(0);
    setPlacedWords([]);
    setShowResults(false);
    setShowFeedback(null);
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a365d" /></View>;
  }

  if (showResults) {
    return (
      <GameResults score={score} total={total}
        timeSeconds={Math.floor((Date.now() - startTime) / 1000)}
        xpEarned={Math.round((score / total) * 20)} onPlayAgain={reset} />
    );
  }

  if (!currentItem) {
    return <View style={styles.center}><Text>No items available.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.counter}>{currentIndex + 1}/{total}</Text>
        <Text style={styles.scoreText}>{score} correct</Text>
      </View>

      <ProgressBar progress={(currentIndex + 1) / total} style={styles.progress} />

      {/* Prompt */}
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>Arrange the words to translate:</Text>
        <Text style={styles.promptText}>{currentItem.question || currentItem.englishTranslation}</Text>
      </View>

      {/* Answer area */}
      <View style={[
        styles.answerArea,
        showFeedback === 'correct' && styles.answerCorrect,
        showFeedback === 'wrong' && styles.answerWrong,
      ]}>
        {placedWords.length === 0 ? (
          <Text style={styles.placeholderText}>Tap words below to build the sentence</Text>
        ) : (
          <View style={styles.wordsRow}>
            {placedWords.map((word, i) => (
              <TouchableOpacity key={`placed-${i}`} style={styles.placedWord} onPress={() => handleRemoveWord(i)}>
                <Text style={styles.placedWordText}>{word}</Text>
                <Ionicons name="close-circle" size={16} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Available words */}
      <View style={styles.wordsBank}>
        {shuffledWords.map((word, i) => {
          const usedCount = placedWords.filter(p => p === word).length;
          const sameWordsBefore = shuffledWords.slice(0, i).filter(w => w === word).length;
          const isUsed = sameWordsBefore < usedCount;

          return (
            <TouchableOpacity
              key={`word-${i}`}
              style={[styles.wordTile, isUsed && styles.wordTileUsed]}
              onPress={() => handleWordPress(word)}
              disabled={isUsed}
            >
              <Text style={[styles.wordTileText, isUsed && styles.wordTileTextUsed]}>{word}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.clearButton} onPress={() => setPlacedWords([])}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkButton, placedWords.length < targetWords.length && styles.checkButtonDisabled]}
          onPress={handleCheck}
          disabled={placedWords.length < targetWords.length}
        >
          <Text style={styles.checkText}>Check</Text>
          <Ionicons name="checkmark" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48 },
  counter: { fontSize: 16, fontWeight: '600', color: '#374151' },
  scoreText: { fontSize: 14, color: '#22c55e', fontWeight: '500' },
  progress: { paddingHorizontal: 16 },
  promptContainer: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 },
  promptLabel: { fontSize: 14, color: '#6b7280' },
  promptText: { fontSize: 20, fontWeight: '700', color: '#1a365d', marginTop: 8, textAlign: 'center' },
  answerArea: {
    minHeight: 80, marginHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db',
    borderStyle: 'dashed', padding: 12, justifyContent: 'center', backgroundColor: '#ffffff',
  },
  answerCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  answerWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  placeholderText: { color: '#9ca3af', textAlign: 'center' },
  wordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  placedWord: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#eff6ff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  placedWordText: { fontSize: 16, fontWeight: '500', color: '#1a365d' },
  wordsBank: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16, justifyContent: 'center', marginTop: 16 },
  wordTile: {
    backgroundColor: '#1a365d', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16,
    elevation: 2,
  },
  wordTileUsed: { backgroundColor: '#e5e7eb', elevation: 0 },
  wordTileText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  wordTileTextUsed: { color: '#d1d5db' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingBottom: 32 },
  clearButton: { paddingVertical: 14, paddingHorizontal: 24 },
  clearText: { fontSize: 16, color: '#6b7280', fontWeight: '500' },
  checkButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1a365d', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24,
  },
  checkButtonDisabled: { opacity: 0.4 },
  checkText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
