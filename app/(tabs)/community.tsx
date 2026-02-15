import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCommunity } from '../../src/contexts/CommunityContext';

export default function CommunityScreen() {
  const { activeCommunity } = useCommunity();

  return (
    <ScrollView style={styles.container}>
      {/* Community Header */}
      {activeCommunity && (
        <View style={[styles.header, { backgroundColor: activeCommunity.primaryColor || '#1a365d' }]}>
          <Text style={styles.communityName}>{activeCommunity.name}</Text>
          <Text style={styles.communityRole}>{activeCommunity.role}</Text>
        </View>
      )}

      {/* Community Features */}
      <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/chat')}>
        <Ionicons name="chatbubbles-outline" size={28} color="#1a365d" />
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Chat</Text>
          <Text style={styles.featureDesc}>Community conversations</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/stories')}>
        <Ionicons name="library-outline" size={28} color="#1a365d" />
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Culture Library</Text>
          <Text style={styles.featureDesc}>Stories, songs, and recordings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/contributions')}>
        <Ionicons name="add-circle-outline" size={28} color="#1a365d" />
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Contribute</Text>
          <Text style={styles.featureDesc}>Submit words, audio, and media</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/notifications')}>
        <Ionicons name="notifications-outline" size={28} color="#1a365d" />
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>Notifications</Text>
          <Text style={styles.featureDesc}>Community updates and alerts</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 24, paddingTop: 16 },
  communityName: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  communityRole: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, textTransform: 'capitalize' },
  featureCard: {
    flexDirection: 'row', backgroundColor: '#ffffff', padding: 20, marginHorizontal: 16,
    marginTop: 12, borderRadius: 12, alignItems: 'center',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  featureContent: { flex: 1, marginLeft: 16 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#1a365d' },
  featureDesc: { fontSize: 13, color: '#6b7280', marginTop: 2 },
});
