import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AchievementCardProps {
  name: string;
  description: string;
  unlocked: boolean;
  icon?: string;
  unlockedAt?: string;
}

export default function AchievementCard({ name, description, unlocked, icon, unlockedAt }: AchievementCardProps) {
  return (
    <View style={[styles.container, !unlocked && styles.locked]}>
      <View style={[styles.iconContainer, unlocked ? styles.iconUnlocked : styles.iconLocked]}>
        <Ionicons
          name={unlocked ? (icon as any || 'trophy') : 'lock-closed'}
          size={24}
          color={unlocked ? '#c4a35a' : '#9ca3af'}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.name, !unlocked && styles.lockedText]}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
        {unlocked && unlockedAt && (
          <Text style={styles.date}>Unlocked {new Date(unlockedAt).toLocaleDateString()}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
    marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  locked: { opacity: 0.6 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconUnlocked: { backgroundColor: '#fef3c7' },
  iconLocked: { backgroundColor: '#f3f4f6' },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1a365d' },
  lockedText: { color: '#6b7280' },
  description: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  date: { fontSize: 11, color: '#c4a35a', marginTop: 4 },
});
