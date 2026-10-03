import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface GameResultsProps {
  score: number;
  total: number;
  timeSeconds?: number;
  xpEarned: number;
  onPlayAgain: () => void;
}

export default function GameResults({ score, total, timeSeconds, xpEarned, onPlayAgain }: GameResultsProps) {
  const percentage = Math.round((score / total) * 100);
  const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3].map(i => (
            <Ionicons
              key={i}
              name={i <= stars ? 'star' : 'star-outline'}
              size={40}
              color={i <= stars ? '#c4a35a' : '#d1d5db'}
            />
          ))}
        </View>

        <Text style={styles.title}>
          {percentage >= 90 ? 'Excellent!' : percentage >= 70 ? 'Great Job!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
        </Text>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreNumber}>{score}</Text>
          <Text style={styles.scoreDivider}>/</Text>
          <Text style={styles.scoreTotal}>{total}</Text>
        </View>
        <Text style={styles.percentage}>{percentage}% correct</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          {timeSeconds !== undefined && (
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.statText}>{Math.floor(timeSeconds / 60)}:{String(timeSeconds % 60).padStart(2, '0')}</Text>
            </View>
          )}
          <View style={styles.stat}>
            <Ionicons name="star" size={20} color="#c4a35a" />
            <Text style={styles.statText}>+{xpEarned} XP</Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.playAgainButton} onPress={onPlayAgain}>
          <Ionicons name="refresh" size={20} color="#ffffff" />
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24 },
  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 32, width: '100%', alignItems: 'center' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a365d', marginBottom: 20 },
  scoreContainer: { flexDirection: 'row', alignItems: 'baseline' },
  scoreNumber: { fontSize: 48, fontWeight: '700', color: '#1a365d' },
  scoreDivider: { fontSize: 32, color: '#d1d5db', marginHorizontal: 4 },
  scoreTotal: { fontSize: 32, color: '#9ca3af' },
  percentage: { fontSize: 16, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 24 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 15, fontWeight: '500', color: '#374151' },
  playAgainButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1a365d', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24,
    marginTop: 24, width: '100%', justifyContent: 'center',
  },
  playAgainText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  doneButton: { marginTop: 12, paddingVertical: 12 },
  doneText: { color: '#6b7280', fontSize: 16, fontWeight: '500' },
});
