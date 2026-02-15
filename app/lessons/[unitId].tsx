import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../src/api/client';

interface Lesson {
  id: number;
  title: string;
  description: string;
  unitId: number;
  orderIndex: number;
  estimatedMinutes: number;
  isCompleted?: boolean;
}

interface Unit {
  id: number;
  title: string;
  description: string;
}

export default function UnitDetailScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', unitId],
    queryFn: async () => {
      const response = await apiRequest('/api/connected/learning/lessons');
      const allLessons = response as Lesson[];
      return allLessons
        .filter((lesson) => lesson.unitId === Number(unitId))
        .sort((a, b) => a.orderIndex - b.orderIndex);
    },
  });

  const { data: unit, isLoading: unitLoading } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      const response = await apiRequest('/api/connected/learning/lessons');
      const allLessons = response as Lesson[];
      const unitLessons = allLessons.filter((l) => l.unitId === Number(unitId));
      if (unitLessons.length > 0) {
        return {
          id: Number(unitId),
          title: `Unit ${unitId}`,
          description: 'Unit description',
        } as Unit;
      }
      return null;
    },
  });

  const completedCount = lessons?.filter((l) => l.isCompleted).length || 0;
  const totalCount = lessons?.length || 0;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const renderLessonCard = ({ item }: { item: Lesson }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() => router.push(`/lessons/take/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.lessonCardContent}>
        <View style={styles.lessonCardLeft}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <Text style={styles.lessonDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.lessonMeta}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.lessonMetaText}>
              {item.estimatedMinutes} min
            </Text>
          </View>
        </View>
        <View style={styles.lessonCardRight}>
          {item.isCompleted ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            </View>
          ) : (
            <Ionicons name="play-circle-outline" size={32} color="#c4a35a" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (lessonsLoading || unitLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (!unit || !lessons || lessons.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="folder-open-outline" size={64} color="#6b7280" />
        <Text style={styles.emptyText}>No lessons found in this unit</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1a365d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unit Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.unitHeader}>
          <Text style={styles.unitTitle}>{unit.title}</Text>
          <Text style={styles.unitDescription}>{unit.description}</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressText}>
                {completedCount}/{totalCount} lessons
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>
        </View>

        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>Lessons</Text>
          <FlatList
            data={lessons}
            renderItem={renderLessonCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </ScrollView>
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
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a365d',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  unitHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  unitTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 8,
  },
  unitDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#c4a35a',
    borderRadius: 4,
  },
  lessonsSection: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 16,
  },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  lessonCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  lessonCardLeft: {
    flex: 1,
    marginRight: 12,
  },
  lessonCardRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
  },
  completedBadge: {
    padding: 4,
  },
  separator: {
    height: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1a365d',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
