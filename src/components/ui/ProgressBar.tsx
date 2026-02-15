import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  showLabel?: boolean;
  style?: ViewStyle;
}

export default function ProgressBar({
  progress, color = '#1a365d', height = 8, showLabel = false, style,
}: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View style={style}>
      {showLabel && (
        <Text style={styles.label}>{Math.round(clamped * 100)}%</Text>
      )}
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color, height }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: '#e5e7eb', borderRadius: 100, overflow: 'hidden' },
  fill: { borderRadius: 100 },
  label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 4, textAlign: 'right' },
});
