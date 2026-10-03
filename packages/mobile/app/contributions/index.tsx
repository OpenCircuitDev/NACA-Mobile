import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';

interface ContributionMenuItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
}

const CONTRIBUTION_MENU: ContributionMenuItem[] = [
  {
    id: 'dictionary',
    title: 'Submit Dictionary Entry',
    description: 'Add a new word or phrase to the community dictionary',
    icon: 'book-outline',
    route: '/dictionary/create',
    color: '#1a365d',
  },
  {
    id: 'audio',
    title: 'Record Audio',
    description: 'Contribute audio recordings for pronunciation',
    icon: 'mic-outline',
    route: '/contributions/audio',
    color: '#c4a35a',
  },
  {
    id: 'media',
    title: 'Upload Media',
    description: 'Share photos, videos, or documents with the community',
    icon: 'images-outline',
    route: '/contributions/media',
    color: '#059669',
  },
];

export default function ContributionsScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch user's contribution history when API is ready
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleContributionPress = (item: ContributionMenuItem) => {
    if (item.route === '/dictionary/create') {
      router.push('/dictionary/create');
    } else {
      // TODO: Navigate to other contribution types when implemented
      router.push('/contributions/new');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#d1d5db" />
      <Text style={styles.emptyTitle}>Start Contributing</Text>
      <Text style={styles.emptyDescription}>
        Share your knowledge and help preserve indigenous language and culture.
        Choose a contribution type below to get started.
      </Text>
    </View>
  );

  const renderContributionStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>0</Text>
        <Text style={styles.statLabel}>Total Contributions</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>0</Text>
        <Text style={styles.statLabel}>Pending Review</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>0</Text>
        <Text style={styles.statLabel}>Approved</Text>
      </View>
    </View>
  );

  const renderContributionItem = ({ item }: { item: ContributionMenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleContributionPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon} size={32} color={item.color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#d1d5db" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Contributions</Text>
        {user && (
          <Text style={styles.headerSubtitle}>Welcome, {user.displayName}</Text>
        )}
      </View>

      <FlatList
        data={CONTRIBUTION_MENU}
        renderItem={renderContributionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {renderContributionStats()}
            <Text style={styles.sectionTitle}>Contribute Now</Text>
          </>
        }
        ListEmptyComponent={renderEmptyState()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1a365d"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a365d',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#c4a35a',
  },
  listContent: {
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
