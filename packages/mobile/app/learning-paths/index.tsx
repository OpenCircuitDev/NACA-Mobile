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
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../src/api/client';

interface Pathway {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stageCount: number;
  isEnrolled?: boolean;
  progressPercentage?: number;
}

const getDifficultyConfig = (
  difficulty: string
): { color: string; icon: string; label: string } => {
  switch (difficulty) {
    case 'beginner':
      return { color: '#10b981', icon: 'leaf', label: 'Beginner' };
    case 'intermediate':
      return { color: '#f59e0b', icon: 'fitness', label: 'Intermediate' };
    case 'advanced':
      return { color: '#ef4444', icon: 'flame', label: 'Advanced' };
    default:
      return { color: '#6b7280', icon: 'help-circle', label: 'Unknown' };
  }
};

export default function LearningPathsIndexScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: pathways, isLoading, refetch } = useQuery({
    queryKey: ['learning-pathways'],
    queryFn: async () => {
      const response = await apiRequest(
        '/api/connected/learning/pathways/pathways'
      );
      return response as Pathway[];
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderPathwayCard = ({ item }: { item: Pathway }) => {
    const difficultyConfig = getDifficultyConfig(item.difficulty);

    return (
      <TouchableOpacity
        style={[
          styles.pathwayCard,
          item.isEnrolled && styles.pathwayCardEnrolled,
        ]}
        onPress={() => router.push(`/learning-paths/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.pathwayCardHeader}>
          <View style={styles.pathwayTitleContainer}>
            <Text style={styles.pathwayTitle}>{item.title}</Text>
            {item.isEnrolled && (
              <View style={styles.enrolledBadge}>
                <Text style={styles.enrolledBadgeText}>Enrolled</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6b7280" />
        </View>

        <Text style={styles.pathwayDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.pathwayMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="list" size={16} color="#6b7280" />
            <Text style={styles.metaText}>
              {item.stageCount} {item.stageCount === 1 ? 'stage' : 'stages'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name={difficultyConfig.icon as any}
              size={16}
              color={difficultyConfig.color}
            />
            <Text style={[styles.metaText, { color: difficultyConfig.color }]}>
              {difficultyConfig.label}
            </Text>
          </View>
        </View>

        {item.isEnrolled && item.progressPercentage !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.progressPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(item.progressPercentage)}% complete
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="map-outline" size={64} color="#6b7280" />
      <Text style={styles.emptyTitle}>No Learning Paths Available</Text>
      <Text style={styles.emptyDescription}>
        Check back later for new learning paths to explore!
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  const enrolledPaths = pathways?.filter((p) => p.isEnrolled) || [];
  const availablePaths = pathways?.filter((p) => !p.isEnrolled) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Paths</Text>
      </View>

      <FlatList
        data={pathways}
        renderItem={renderPathwayCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          pathways && pathways.length > 0
            ? styles.listContent
            : styles.emptyListContent
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1a365d']}
            tintColor="#1a365d"
          />
        }
        ListHeaderComponent={
          pathways && pathways.length > 0 ? (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{enrolledPaths.length}</Text>
                <Text style={styles.statLabel}>Enrolled</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{availablePaths.length}</Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{pathways.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          ) : null
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a365d',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  pathwayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pathwayCardEnrolled: {
    borderColor: '#c4a35a',
    borderWidth: 2,
  },
  pathwayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pathwayTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pathwayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a365d',
    marginRight: 8,
  },
  enrolledBadge: {
    backgroundColor: '#c4a35a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enrolledBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  pathwayDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  pathwayMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#c4a35a',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
