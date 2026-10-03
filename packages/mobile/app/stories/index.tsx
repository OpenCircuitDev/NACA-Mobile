import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../src/api/client';

type MediaType = 'story' | 'song' | 'video' | 'document';
type FilterType = 'all' | MediaType;

interface Media {
  id: number;
  title: string;
  description: string;
  type: MediaType;
  duration?: number;
  author?: string;
  thumbnailUrl?: string;
}

const MEDIA_TYPE_CONFIG: Record<MediaType, { icon: string; color: string }> = {
  story: { icon: 'book-outline', color: '#3b82f6' },
  song: { icon: 'musical-notes-outline', color: '#8b5cf6' },
  video: { icon: 'videocam-outline', color: '#ec4899' },
  document: { icon: 'document-text-outline', color: '#10b981' },
};

const FILTER_TABS: { type: FilterType; label: string }[] = [
  { type: 'all', label: 'All' },
  { type: 'story', label: 'Stories' },
  { type: 'song', label: 'Songs' },
  { type: 'video', label: 'Videos' },
];

export default function StoriesScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const { data: media, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['cultural-media'],
    queryFn: async () => {
      const response = await apiRequest('/api/connected/immersion/media');
      return response.media as Media[];
    },
  });

  const filteredMedia = media?.filter(
    (item) => activeFilter === 'all' || item.type === activeFilter
  );

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMediaCard = ({ item }: { item: Media }) => {
    const config = MEDIA_TYPE_CONFIG[item.type];

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/stories/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon as any} size={28} color="#ffffff" />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.duration && (
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={12} color="#6b7280" />
                <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.mediaType}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
            {item.author && (
              <Text style={styles.author} numberOfLines={1}>
                {item.author}
              </Text>
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load cultural media</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Culture Library</Text>
        <Text style={styles.headerSubtitle}>
          Explore stories, songs, and cultural content
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.type}
            style={[
              styles.filterTab,
              activeFilter === tab.type && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(tab.type)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab.type && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredMedia && filteredMedia.length > 0 ? (
        <FlatList
          data={filteredMedia}
          renderItem={renderMediaCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#1a365d']}
              tintColor="#1a365d"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>No cultural media available yet</Text>
          <Text style={styles.emptySubtext}>
            {activeFilter === 'all'
              ? 'Check back soon for new content!'
              : `No ${activeFilter}s available at the moment`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f9fafb',
  },
  filterTabActive: {
    backgroundColor: '#1a365d',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a365d',
  },
  author: {
    flex: 1,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1a365d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
