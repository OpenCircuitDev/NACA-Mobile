import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getGameDataset } from '../../../src/api/lessons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { recordProgressEvent } from '../../../src/api/progress';
import GameResults from '../../../src/components/games/GameResults';
import ProgressBar from '../../../src/components/ui/ProgressBar';

export default function WordScrambleGame() {
  const { datasetId } = useLocalSearchParams<{ datasetId: string }>();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
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
  const word = currentItem?.answer || currentItem?.indigenousWord || '';

  // Scramble letters
  const scrambledIndices = useMemo(() => {
    const indices = word.split('').map((_: string, i: number) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    // Ensure it's actually scrambled
    if (indices.join('') === word.split('').map((_: string, i: number) => i).join('') && word.length > 1) {
      [indices[0], indices[1]] = [indices[1], indices[0]];
    }
    return indices;
  }, [word, currentIndex]);

  const currentGuess = selectedLetters.map(i => word[i]).join('');
  const isCorrect = currentGuess === word && selectedLetters.length === word.length;

  const handleLetterPress = (scrambleIndex: number) => {
    const letterIndex = scrambledIndices[scrambleIndex];
    if (selectedLetters.includes(letterIndex)) return;
    setSelectedLetters(prev => [...prev, letterIndex]);
  };

  const handleRemoveLetter = (position: number) => {
    setSelectedLetters(prev => prev.filter((_, i) => i !== position));
  };

  const handleClear = () => setSelectedLetters([]);

  useEffect(() => {
    if (isCorrect && selectedLetters.length === word.length) {
      setShowFeedback('correct');
      setScore(s => s + 1);
      setTimeout(() => {
        setShowFeedback(null);
        if (currentIndex + 1 >= total) {
          const finalScore = score + 1;
          if (user) {
            recordProgressEvent(user.id, {
              eventType: 'game_completed',
              sourceType: 'game_dataset',
              sourceId: datasetId!,
              data: { gameType: 'scramble' },
              score: finalScore,
              xpEarned: Math.round((finalScore / total) * 20),
              timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
            }).catch(() => {});
          }
          setShowResults(true);
        } else {
          setCurrentIndex(i => i + 1);
          setSelectedLetters([]);
        }
      }, 800);
    }
  }, [selectedLetters.length]);

  const handleSkip = () => {
    setShowFeedback('wrong');
    setTimeout(() => {
      setShowFeedback(null);
      if (currentIndex + 1 >= total) {
        setShowResults(true);
      } else {
        setCurrentIndex(i => i + 1);
        setSelectedLetters([]);
      }
    }, 800);
  };

  const reset = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedLetters([]);
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
    return <View style={styles.center}><Text style={styles.emptyText}>No items available.</Text></View>;
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

      {/* Clue */}
      <View style={styles.clueContainer}>
        <Text style={styles.clueLabel}>Unscramble the word for:</Text>
        <Text style={styles.clueText}>{currentItem.question || currentItem.englishTranslation}</Text>
      </View>

      {/* Answer slots */}
      <View style={styles.slotsRow}>
        {word.split('').map((_: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.slot,
              selectedLetters[i] !== undefined && styles.slotFilled,
              showFeedback === 'correct' && styles.slotCorrect,
              showFeedback === 'wrong' && styles.slotWrong,
            ]}
            onPress={() => selectedLetters[i] !== undefined ? handleRemoveLetter(i) : undefined}
          >
            <Text style={[styles.slotText, selectedLetters[i] !== undefined && styles.slotFilledText]}>
              {selectedLetters[i] !== undefined ? word[selectedLetters[i]] : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scrambled letters */}
      <View style={styles.lettersRow}>
        {scrambledIndices.map((letterIdx: number, scrambleIdx: number) => {
          const isUsed = selectedLetters.includes(letterIdx);
          return (
            <TouchableOpacity
              key={`${scrambleIdx}-${letterIdx}`}
              style={[styles.letterTile, isUsed && styles.letterTileUsed]}
              onPress={() => handleLetterPress(scrambleIdx)}
              disabled={isUsed}
            >
              <Text style={[styles.letterText, isUsed && styles.letterTextUsed]}>
                {word[letterIdx]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Ionicons name="backspace-outline" size={20} color="#6b7280" />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="arrow-forward" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48 },
  counter: { fontSize: 16, fontWeight: '600', color: '#374151' },
  scoreText: { fontSize: 14, color: '#22c55e', fontWeight: '500' },
  progress: { paddingHorizontal: 16 },
  clueContainer: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  clueLabel: { fontSize: 14, color: '#6b7280' },
  clueText: { fontSize: 22, fontWeight: '700', color: '#1a365d', marginTop: 8, textAlign: 'center' },
  slotsRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 32 },
  slot: {
    width: 42, height: 48, borderRadius: 8, borderWidth: 2, borderColor: '#d1d5db',
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff',
  },
  slotFilled: { borderColor: '#1a365d', backgroundColor: '#eff6ff' },
  slotCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  slotWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  slotText: { fontSize: 20, fontWeight: '700', color: '#1a365d' },
  slotFilledText: { color: '#1a365d' },
  lettersRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  letterTile: {
    width: 48, height: 52, borderRadius: 10, backgroundColor: '#1a365d',
    justifyContent: 'center', alignItems: 'center', elevation: 2,
  },
  letterTileUsed: { backgroundColor: '#e5e7eb', elevation: 0 },
  letterText: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  letterTextUsed: { color: '#d1d5db' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 24 },
  clearButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clearText: { fontSize: 16, color: '#6b7280' },
  skipButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skipText: { fontSize: 16, color: '#6b7280' },
  emptyText: { fontSize: 16, color: '#6b7280' },
});
