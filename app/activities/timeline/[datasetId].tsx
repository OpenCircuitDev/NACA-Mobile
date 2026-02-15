import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getGameDataset } from '../../../src/api/lessons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { recordProgressEvent } from '../../../src/api/progress';
import GameResults from '../../../src/components/games/GameResults';

interface TimelineItem {
  id: string;
  text: string;
  order: number;
}

export default function TimelineGame() {
  const { datasetId } = useLocalSearchParams<{ datasetId: string }>();
  const { user } = useAuth();
  const [orderedItems, setOrderedItems] = useState<TimelineItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const { data, isLoading } = useQuery({
    queryKey: ['gameDataset', datasetId],
    queryFn: () => getGameDataset(datasetId!),
    enabled: !!datasetId,
  });

  const items = data?.data?.items || [];

  // Create timeline items from dataset
  const timelineItems: TimelineItem[] = useMemo(() => {
    return items.map((item: any, index: number) => ({
      id: item.id || String(index),
      text: item.question || item.indigenousWord || `Item ${index + 1}`,
      order: index,
    }));
  }, [items.length]);

  // Shuffled version for initial display
  const shuffledItems = useMemo(() => {
    const shuffled = [...timelineItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [timelineItems]);

  // Initialize ordered items on first render
  useState(() => {
    if (shuffledItems.length > 0 && orderedItems.length === 0) {
      setOrderedItems(shuffledItems);
    }
  });

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= orderedItems.length) return;

    const newItems = [...orderedItems];
    [newItems[fromIndex], newItems[toIndex]] = [newItems[toIndex], newItems[fromIndex]];
    setOrderedItems(newItems);
  };

  const handleCheck = () => {
    const correctCount = orderedItems.filter((item, index) => item.order === index).length;
    const total = orderedItems.length;
    setScore(correctCount);
    setShowFeedback(true);

    setTimeout(() => {
      if (user) {
        recordProgressEvent(user.id, {
          eventType: 'game_completed',
          sourceType: 'game_dataset',
          sourceId: datasetId!,
          data: { gameType: 'timeline' },
          score: correctCount,
          xpEarned: Math.round((correctCount / total) * 20),
          timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
        }).catch(() => {});
      }
      setShowResults(true);
    }, 1500);
  };

  const reset = () => {
    setOrderedItems([...shuffledItems]);
    setScore(0);
    setShowResults(false);
    setShowFeedback(false);
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a365d" /></View>;
  }

  if (showResults) {
    return (
      <GameResults score={score} total={orderedItems.length}
        timeSeconds={Math.floor((Date.now() - startTime) / 1000)}
        xpEarned={Math.round((score / orderedItems.length) * 20)} onPlayAgain={reset} />
    );
  }

  if (timelineItems.length === 0) {
    return <View style={styles.center}><Text style={styles.emptyText}>No timeline items available.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Order the Events</Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.instruction}>Arrange these items in the correct order using the arrows</Text>

      <ScrollView style={styles.list}>
        {orderedItems.map((item, index) => {
          const isCorrect = showFeedback && item.order === index;
          const isWrong = showFeedback && item.order !== index;

          return (
            <View key={item.id} style={[
              styles.itemRow,
              isCorrect && styles.itemCorrect,
              isWrong && styles.itemWrong,
            ]}>
              <View style={styles.orderBadge}>
                <Text style={styles.orderNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.itemText} numberOfLines={2}>{item.text}</Text>
              <View style={styles.arrowButtons}>
                <TouchableOpacity
                  onPress={() => moveItem(index, 'up')}
                  disabled={index === 0 || showFeedback}
                  style={[styles.arrowBtn, index === 0 && styles.arrowBtnDisabled]}
                >
                  <Ionicons name="chevron-up" size={22} color={index === 0 ? '#d1d5db' : '#374151'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => moveItem(index, 'down')}
                  disabled={index === orderedItems.length - 1 || showFeedback}
                  style={[styles.arrowBtn, index === orderedItems.length - 1 && styles.arrowBtnDisabled]}
                >
                  <Ionicons name="chevron-down" size={22} color={index === orderedItems.length - 1 ? '#d1d5db' : '#374151'} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {!showFeedback && (
        <TouchableOpacity style={styles.checkButton} onPress={handleCheck}>
          <Text style={styles.checkText}>Check Order</Text>
          <Ionicons name="checkmark-circle" size={22} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48 },
  title: { fontSize: 18, fontWeight: '600', color: '#1a365d' },
  instruction: { fontSize: 14, color: '#6b7280', textAlign: 'center', paddingHorizontal: 16, marginBottom: 16 },
  list: { flex: 1, paddingHorizontal: 16 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12,
    padding: 14, marginBottom: 8, borderWidth: 2, borderColor: '#e5e7eb',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  itemCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  itemWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  orderBadge: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#1a365d',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  orderNumber: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  itemText: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
  arrowButtons: { marginLeft: 8 },
  arrowBtn: { padding: 4 },
  arrowBtnDisabled: { opacity: 0.3 },
  checkButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1a365d', borderRadius: 12, margin: 16, padding: 16, marginBottom: 32,
  },
  checkText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  emptyText: { fontSize: 16, color: '#6b7280' },
});
