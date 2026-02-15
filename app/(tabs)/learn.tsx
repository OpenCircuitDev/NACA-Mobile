import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getLessons, getGameData } from '../../src/api/lessons';

export default function LearnScreen() {
  const { data: lessonsData } = useQuery({ queryKey: ['lessons'], queryFn: getLessons });
  const { data: gamesData } = useQuery({ queryKey: ['gameData'], queryFn: getGameData });

  return (
    <ScrollView style={styles.container}>
      {/* Learning Paths */}
      <TouchableOpacity style={styles.sectionCard} onPress={() => router.push('/learning-paths')}>
        <Ionicons name="map-outline" size={32} color="#1a365d" />
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>Learning Paths</Text>
          <Text style={styles.sectionDesc}>Follow guided courses to build your language skills</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>

      {/* Lessons */}
      <TouchableOpacity style={styles.sectionCard} onPress={() => router.push('/lessons/browse')}>
        <Ionicons name="document-text-outline" size={32} color="#1a365d" />
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>Lessons</Text>
          <Text style={styles.sectionDesc}>Browse units and individual lessons</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>

      {/* Activities & Games */}
      <TouchableOpacity style={styles.sectionCard} onPress={() => router.push('/activities')}>
        <Ionicons name="game-controller-outline" size={32} color="#1a365d" />
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>Activities & Games</Text>
          <Text style={styles.sectionDesc}>Practice with flashcards, matching, word scramble and more</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>

      {/* Culture Library */}
      <TouchableOpacity style={styles.sectionCard} onPress={() => router.push('/stories')}>
        <Ionicons name="library-outline" size={32} color="#1a365d" />
        <View style={styles.sectionContent}>
          <Text style={styles.sectionTitle}>Culture Library</Text>
          <Text style={styles.sectionDesc}>Stories, songs, and cultural media</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  sectionCard: {
    flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 12, padding: 20,
    marginBottom: 12, alignItems: 'center',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  sectionContent: { flex: 1, marginLeft: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a365d' },
  sectionDesc: { fontSize: 13, color: '#6b7280', marginTop: 4 },
});
