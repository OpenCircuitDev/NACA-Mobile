import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getGameDataset } from '../../../src/api/lessons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { recordProgressEvent } from '../../../src/api/progress';
import GameResults from '../../../src/components/games/GameResults';

interface MatchCard {
  id: string;
  text: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MatchingGame() {
  const { datasetId } = useLocalSearchParams<{ datasetId: string }>();
  const { user } = useAuth();
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  const { data, isLoading } = useQuery({
    queryKey: ['gameDataset', datasetId],
    queryFn: () => getGameDataset(datasetId!),
    enabled: !!datasetId,
  });

  const items = data?.data?.items || [];
  const totalPairs = Math.min(items.length, 8); // Max 8 pairs = 16 cards

  useEffect(() => {
    if (items.length === 0) return;
    const subset = items.slice(0, totalPairs);
    const pairs: MatchCard[] = [];

    subset.forEach((item: any, i: number) => {
      pairs.push(
        { id: `q-${i}`, text: item.question || item.indigenousWord, pairId: String(i), isFlipped: false, isMatched: false },
        { id: `a-${i}`, text: item.answer || item.englishTranslation, pairId: String(i), isFlipped: false, isMatched: false }
      );
    });

    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    setCards(pairs);
  }, [items.length]);

  const handleCardPress = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || selected.length >= 2) return;

    const newCards = cards.map(c => c.id === cardId ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    const newSelected = [...selected, cardId];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setAttempts(a => a + 1);
      const [first, second] = newSelected.map(id => newCards.find(c => c.id === id)!);

      if (first.pairId === second.pairId) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.pairId === first.pairId ? { ...c, isMatched: true } : c
          ));
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches >= totalPairs) {
              setTimeout(() => {
                if (user) {
                  recordProgressEvent(user.id, {
                    eventType: 'game_completed',
                    sourceType: 'game_dataset',
                    sourceId: datasetId!,
                    data: { gameType: 'matching', attempts: attempts + 1 },
                    score: totalPairs,
                    xpEarned: Math.max(5, 20 - Math.floor((attempts + 1 - totalPairs) / 2)),
                    timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
                  }).catch(() => {});
                }
                setShowResults(true);
              }, 500);
            }
            return newMatches;
          });
          setSelected([]);
        }, 300);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newSelected.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setSelected([]);
        }, 800);
      }
    }
  };

  const reset = () => {
    setMatches(0);
    setAttempts(0);
    setSelected([]);
    setShowResults(false);
    // Re-shuffle
    setCards(prev => {
      const shuffled = prev.map(c => ({ ...c, isFlipped: false, isMatched: false }));
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a365d" /></View>;
  }

  if (showResults) {
    const efficiency = Math.min(1, totalPairs / Math.max(attempts, 1));
    return (
      <GameResults
        score={totalPairs}
        total={totalPairs}
        timeSeconds={Math.floor((Date.now() - startTime) / 1000)}
        xpEarned={Math.max(5, Math.round(efficiency * 20))}
        onPlayAgain={reset}
      />
    );
  }

  const numColumns = cards.length <= 12 ? 3 : 4;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Match Pairs</Text>
        <Text style={styles.matchCount}>{matches}/{totalPairs}</Text>
      </View>

      <View style={styles.grid}>
        {cards.map(card => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              { width: `${Math.floor(100 / numColumns) - 3}%` },
              card.isFlipped && styles.cardFlipped,
              card.isMatched && styles.cardMatched,
            ]}
            onPress={() => handleCardPress(card.id)}
            disabled={card.isMatched}
            activeOpacity={0.7}
          >
            {card.isFlipped || card.isMatched ? (
              <Text style={[styles.cardText, card.isMatched && styles.cardMatchedText]} numberOfLines={3}>
                {card.text}
              </Text>
            ) : (
              <Ionicons name="help" size={28} color="#9ca3af" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.attempts}>Attempts: {attempts}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48 },
  title: { fontSize: 18, fontWeight: '600', color: '#1a365d' },
  matchCount: { fontSize: 16, fontWeight: '600', color: '#22c55e' },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 8, justifyContent: 'center', gap: 8, alignContent: 'center' },
  card: {
    aspectRatio: 0.75, backgroundColor: '#ffffff', borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    padding: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, borderWidth: 2, borderColor: '#e5e7eb',
  },
  cardFlipped: { borderColor: '#1a365d', backgroundColor: '#eff6ff' },
  cardMatched: { borderColor: '#22c55e', backgroundColor: '#f0fdf4', opacity: 0.7 },
  cardText: { fontSize: 13, fontWeight: '600', color: '#1a365d', textAlign: 'center' },
  cardMatchedText: { color: '#22c55e' },
  attempts: { textAlign: 'center', fontSize: 14, color: '#6b7280', paddingBottom: 24 },
});
