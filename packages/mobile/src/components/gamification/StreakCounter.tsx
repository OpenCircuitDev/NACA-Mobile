import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakCounterProps {
  streak: number;
  compact?: boolean;
}

export default function StreakCounter({ streak, compact = false }: StreakCounterProps) {
  const isActive = streak > 0;

  if (compact) {
    return (
      <View style={[styles.compactContainer, !isActive && styles.inactive]}>
        <Ionicons name="flame" size={14} color={isActive ? '#f97316' : '#9ca3af'} />
        <Text style={[styles.compactText, !isActive && styles.inactiveText]}>{streak}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="flame" size={28} color={isActive ? '#f97316' : '#d1d5db'} />
      <View>
        <Text style={[styles.streakNumber, !isActive && styles.inactiveNumber]}>{streak}</Text>
        <Text style={styles.label}>day streak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakNumber: { fontSize: 24, fontWeight: '700', color: '#f97316' },
  inactiveNumber: { color: '#9ca3af' },
  label: { fontSize: 13, color: '#6b7280' },
  compactContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  inactive: { backgroundColor: '#f3f4f6' },
  compactText: { fontSize: 12, fontWeight: '600', color: '#c2410c' },
  inactiveText: { color: '#9ca3af' },
});
