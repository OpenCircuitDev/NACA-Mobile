import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface XPBadgeProps {
  xp: number;
  level?: number;
  compact?: boolean;
}

export default function XPBadge({ xp, level, compact = false }: XPBadgeProps) {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name="star" size={14} color="#c4a35a" />
        <Text style={styles.compactText}>{xp} XP</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="star" size={24} color="#c4a35a" />
      <View>
        <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>
        {level !== undefined && <Text style={styles.levelText}>Level {level}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpText: { fontSize: 20, fontWeight: '700', color: '#1a365d' },
  levelText: { fontSize: 13, color: '#6b7280' },
  compactContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  compactText: { fontSize: 12, fontWeight: '600', color: '#92400e' },
});
