import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useCommunity } from '../../src/contexts/CommunityContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { communities } = useCommunity();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      {/* Communities */}
      <Text style={styles.sectionTitle}>My Communities</Text>
      {communities.map(c => (
        <View key={c.id} style={styles.communityRow}>
          <View style={[styles.communityDot, { backgroundColor: c.primaryColor || '#1a365d' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.communityName}>{c.name}</Text>
            <Text style={styles.communityRole}>{c.role}</Text>
          </View>
        </View>
      ))}

      {/* Settings Links */}
      <Text style={styles.sectionTitle}>Settings</Text>

      <TouchableOpacity style={styles.settingsRow} onPress={() => router.push('/settings')}>
        <Ionicons name="settings-outline" size={22} color="#374151" />
        <Text style={styles.settingsText}>General Settings</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsRow} onPress={() => router.push('/settings/accessibility')}>
        <Ionicons name="eye-outline" size={22} color="#374151" />
        <Text style={styles.settingsText}>Accessibility</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsRow} onPress={() => router.push('/settings/notifications')}>
        <Ionicons name="notifications-outline" size={22} color="#374151" />
        <Text style={styles.settingsText}>Notifications</Text>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileHeader: { backgroundColor: '#ffffff', padding: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a365d', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#ffffff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: '#1a365d', marginTop: 12 },
  email: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  roleBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  roleText: { fontSize: 12, fontWeight: '600', color: '#1a365d', textTransform: 'capitalize' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 16, marginTop: 24, marginBottom: 8 },
  communityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, marginHorizontal: 16, marginBottom: 1, borderRadius: 8 },
  communityDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  communityName: { fontSize: 16, fontWeight: '500', color: '#1a365d' },
  communityRole: { fontSize: 13, color: '#6b7280', textTransform: 'capitalize' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 16, marginHorizontal: 16, marginBottom: 1, borderRadius: 8, gap: 12 },
  settingsText: { flex: 1, fontSize: 16, color: '#374151' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 16, marginTop: 24, gap: 12 },
  logoutText: { fontSize: 16, color: '#ef4444', fontWeight: '500' },
});
