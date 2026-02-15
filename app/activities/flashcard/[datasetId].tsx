import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getGameDataset } from '../../../src/api/lessons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { recordProgressEvent } from '../../../src/api/progress';
import GameResults from '../../../src/components/games/GameResults';
import ProgressBar from '../../../src/components/ui/ProgressBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FlashcardGame() {
  const { datasetId } = useLocalSearchParams<{ datasetId: string }>();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { data, isLoading } = useQuery({
    queryKey: ['gameDataset', datasetId],
    queryFn: () => getGameDataset(datasetId!),
    enabled: !!datasetId,
  });

  const items = data?.data?.items || [];
  const currentItem = items[currentIndex];
  const total = items.length;

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, { toValue, useNativeDriver: true, friction: 8 }).start();
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (knew: boolean) => {
    if (knew) setScore(s => s + 1);

    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: knew ? SCREEN_WIDTH : -SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentIndex + 1 >= total) {
        const finalScore = score + (knew ? 1 : 0);
        if (user) {
          recordProgressEvent(user.id, {
            eventType: 'game_completed',
            sourceType: 'game_dataset',
            sourceId: datasetId!,
            data: { gameType: 'flashcard' },
            score: finalScore,
            xpEarned: Math.round((finalScore / total) * 20),
            timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
          }).catch(() => {});
        }
        setShowResults(true);
      } else {
        setCurrentIndex(i => i + 1);
        setIsFlipped(false);
        flipAnim.setValue(0);
        slideAnim.setValue(0);
      }
    });
  };

  const reset = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFlipped(false);
    setShowResults(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
  };

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a365d" /></View>;
  }

  if (showResults) {
    return (
      <GameResults
        score={score}
        total={total}
        timeSeconds={Math.floor((Date.now() - startTime) / 1000)}
        xpEarned={Math.round((score / total) * 20)}
        onPlayAgain={reset}
      />
    );
  }

  if (!currentItem) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No flashcards available in this dataset.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.counter}>{currentIndex + 1} / {total}</Text>
        <Text style={styles.scoreText}>{score} correct</Text>
      </View>

      <ProgressBar progress={(currentIndex + 1) / total} style={styles.progress} />

      {/* Card */}
      <TouchableOpacity style={styles.cardContainer} onPress={flipCard} activeOpacity={0.9}>
        <Animated.View style={[styles.card, { transform: [{ translateX: slideAnim }, { rotateY: frontInterpolate }] }]}>
          <Text style={styles.cardLabel}>Question</Text>
          <Text style={styles.cardText}>{currentItem.question || currentItem.indigenousWord}</Text>
          <Text style={styles.tapHint}>Tap to flip</Text>
        </Animated.View>

        <Animated.View style={[styles.card, styles.cardBack, { transform: [{ translateX: slideAnim }, { rotateY: backInterpolate }] }]}>
          <Text style={styles.cardLabel}>Answer</Text>
          <Text style={styles.cardText}>{currentItem.answer || currentItem.englishTranslation}</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Answer buttons */}
      {isFlipped && (
        <View style={styles.answerRow}>
          <TouchableOpacity style={[styles.answerButton, styles.dontKnowButton]} onPress={() => handleAnswer(false)}>
            <Ionicons name="close" size={24} color="#ef4444" />
            <Text style={styles.dontKnowText}>Don't Know</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.answerButton, styles.knowButton]} onPress={() => handleAnswer(true)}>
            <Ionicons name="checkmark" size={24} color="#22c55e" />
            <Text style={styles.knowText}>I Know This</Text>
          </TouchableOpacity>
        </View>
      )}
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
  cardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  card: {
    width: '100%', minHeight: 280, backgroundColor: '#ffffff', borderRadius: 20,
    padding: 32, justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12,
    backfaceVisibility: 'hidden', position: 'absolute',
  },
  cardBack: { backgroundColor: '#1a365d' },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  cardText: { fontSize: 32, fontWeight: '700', color: '#1a365d', textAlign: 'center' },
  tapHint: { fontSize: 14, color: '#9ca3af', marginTop: 24 },
  answerRow: { flexDirection: 'row', padding: 16, gap: 12, paddingBottom: 32 },
  answerButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12 },
  dontKnowButton: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  knowButton: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  dontKnowText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
  knowText: { fontSize: 16, fontWeight: '600', color: '#22c55e' },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  backLink: { color: '#1a365d', fontSize: 16, fontWeight: '600', marginTop: 16 },
});
