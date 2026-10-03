import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  xp: number;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return '#c4a35a';
    if (rank === 2) return '#9ca3af';
    if (rank === 3) return '#b45309';
    return undefined;
  };

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.userId === currentUserId;
    const medalColor = getMedalColor(item.rank);

    return (
      <View style={[styles.row, isCurrentUser && styles.currentUserRow]}>
        <View style={styles.rankContainer}>
          {medalColor ? (
            <Ionicons name="medal" size={22} color={medalColor} />
          ) : (
            <Text style={styles.rankNumber}>{item.rank}</Text>
          )}
        </View>
        <Text style={[styles.name, isCurrentUser && styles.currentUserName]} numberOfLines={1}>
          {item.displayName}
          {isCurrentUser && ' (You)'}
        </Text>
        <Text style={styles.xp}>{item.xp.toLocaleString()} XP</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={entries}
      renderItem={renderItem}
      keyExtractor={(item) => item.userId}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  currentUserRow: { backgroundColor: '#eff6ff' },
  rankContainer: { width: 32, alignItems: 'center' },
  rankNumber: { fontSize: 16, fontWeight: '600', color: '#6b7280' },
  name: { flex: 1, fontSize: 15, color: '#374151', marginLeft: 12 },
  currentUserName: { fontWeight: '600', color: '#1a365d' },
  xp: { fontSize: 14, fontWeight: '600', color: '#c4a35a' },
});
