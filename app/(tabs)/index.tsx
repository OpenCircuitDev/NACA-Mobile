import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCommunity } from '../../src/contexts/CommunityContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { getCommunityDashboard } from '../../src/api/communities';
import { getWordOfTheDay } from '../../src/api/dictionary';

export default function HomeScreen() {
  const { user } = useAuth();
  const { activeCommunity, communities, switchCommunity } = useCommunity();

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', activeCommunity?.id],
    queryFn: () => activeCommunity ? getCommunityDashboard(activeCommunity.id) : null,
    enabled: !!activeCommunity,
  });

  const { data: wordOfDay } = useQuery({
    queryKey: ['wordOfDay'],
    queryFn: getWordOfTheDay,
  });

  const stats = dashboard?.data?.stats;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      {/* Welcome Header */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || 'Learner'}</Text>
        {activeCommunity && (
          <Text style={styles.communityName}>{activeCommunity.name}</Text>
        )}
      </View>

      {/* Stats Grid */}
      {stats && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="book-outline" size={24} color="#1a365d" />
            <Text style={styles.statNumber}>{stats.totalEntries}</Text>
            <Text style={styles.statLabel}>Dictionary Entries</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="library-outline" size={24} color="#1a365d" />
            <Text style={styles.statNumber}>{stats.totalDictionaries}</Text>
            <Text style={styles.statLabel}>Dictionaries</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#1a365d" />
            <Text style={styles.statNumber}>{stats.totalMembers}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/dictionary')}>
          <Ionicons name="search" size={28} color="#1a365d" />
          <Text style={styles.actionText}>Search Dictionary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/learn')}>
          <Ionicons name="school" size={28} color="#1a365d" />
          <Text style={styles.actionText}>Start a Lesson</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/activities')}>
          <Ionicons name="game-controller" size={28} color="#1a365d" />
          <Text style={styles.actionText}>Play a Game</Text>
        </TouchableOpacity>
      </View>

      {/* Word of the Day */}
      {wordOfDay?.data && (
        <View style={styles.wordCard}>
          <Text style={styles.wordLabel}>Word of the Day</Text>
          <Text style={styles.wordIndigenous}>{wordOfDay.data.indigenousWord || wordOfDay.data.word}</Text>
          <Text style={styles.wordEnglish}>{wordOfDay.data.englishTranslation || wordOfDay.data.translation}</Text>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  welcomeCard: {
    backgroundColor: '#1a365d', padding: 24, paddingTop: 16,
  },
  welcomeText: { color: '#c4a35a', fontSize: 14, fontWeight: '500' },
  userName: { color: '#ffffff', fontSize: 28, fontWeight: '700', marginTop: 4 },
  communityName: { color: '#93c5fd', fontSize: 14, marginTop: 4 },
  statsGrid: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
    alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#1a365d', marginTop: 8 },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a365d', paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  actionCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 12, padding: 16,
    alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  actionText: { fontSize: 12, color: '#374151', marginTop: 8, textAlign: 'center', fontWeight: '500' },
  wordCard: {
    backgroundColor: '#ffffff', borderRadius: 12, margin: 16, padding: 20,
    borderLeftWidth: 4, borderLeftColor: '#c4a35a',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  wordLabel: { fontSize: 12, fontWeight: '600', color: '#c4a35a', textTransform: 'uppercase', letterSpacing: 1 },
  wordIndigenous: { fontSize: 24, fontWeight: '700', color: '#1a365d', marginTop: 8 },
  wordEnglish: { fontSize: 16, color: '#6b7280', marginTop: 4 },
});
