import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../src/api/client';

interface Lesson {
  id: number;
  title: string;
  description: string;
  unitId?: number;
  unitTitle?: string;
  category?: string;
  estimatedMinutes: number;
  orderIndex: number;
  isCompleted?: boolean;
}

interface Unit {
  id: number;
  title: string;
  lessons: Lesson[];
  completedCount: number;
}

export default function BrowseLessonsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());

  const { data: lessons, isLoading } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: async () => {
      const response = await apiRequest('/api/connected/learning/lessons');
      return response as Lesson[];
    },
  });

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    if (!searchQuery.trim()) return lessons;

    const query = searchQuery.toLowerCase();
    return lessons.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.description?.toLowerCase().includes(query) ||
        lesson.category?.toLowerCase().includes(query) ||
        lesson.unitTitle?.toLowerCase().includes(query)
    );
  }, [lessons, searchQuery]);

  const groupedByUnit = useMemo(() => {
    if (!filteredLessons) return { units: [], standalone: [] };

    const unitsMap = new Map<number, Unit>();
    const standalone: Lesson[] = [];

    filteredLessons.forEach((lesson) => {
      if (lesson.unitId) {
        if (!unitsMap.has(lesson.unitId)) {
          unitsMap.set(lesson.unitId, {
            id: lesson.unitId,
            title: lesson.unitTitle || `Unit ${lesson.unitId}`,
            lessons: [],
            completedCount: 0,
          });
        }
        const unit = unitsMap.get(lesson.unitId)!;
        unit.lessons.push(lesson);
        if (lesson.isCompleted) {
          unit.completedCount++;
        }
      } else {
        standalone.push(lesson);
      }
    });

    const units = Array.from(unitsMap.values()).map((unit) => ({
      ...unit,
      lessons: unit.lessons.sort((a, b) => a.orderIndex - b.orderIndex),
    }));

    return { units, standalone };
  }, [filteredLessons]);

  const toggleUnit = (unitId: number) => {
    setExpandedUnits((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.unitId) {
      router.push(`/lessons/take/${lesson.id}`);
    } else {
      router.push(`/lessons/take/${lesson.id}`);
    }
  };

  const renderLessonCard = (lesson: Lesson, showUnit: boolean = true) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() => handleLessonPress(lesson)}
      activeOpacity={0.7}
    >
      <View style={styles.lessonCardLeft}>
        {lesson.isCompleted ? (
          <Ionicons name="checkmark-circle" size={28} color="#10b981" />
        ) : (
          <Ionicons name="play-circle-outline" size={28} color="#c4a35a" />
        )}
      </View>
      <View style={styles.lessonCardContent}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        {lesson.description && (
          <Text style={styles.lessonDescription} numberOfLines={2}>
            {lesson.description}
          </Text>
        )}
        <View style={styles.lessonMeta}>
          {lesson.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{lesson.category}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{lesson.estimatedMinutes} min</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  const renderUnitCard = (unit: Unit) => {
    const isExpanded = expandedUnits.has(unit.id);
    const progress =
      unit.lessons.length > 0 ? unit.completedCount / unit.lessons.length : 0;

    return (
      <View key={unit.id} style={styles.unitCard}>
        <TouchableOpacity
          style={styles.unitHeader}
          onPress={() => toggleUnit(unit.id)}
          activeOpacity={0.7}
        >
          <View style={styles.unitHeaderLeft}>
            <Ionicons
              name={isExpanded ? 'chevron-down' : 'chevron-forward'}
              size={24}
              color="#1a365d"
            />
            <View style={styles.unitInfo}>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <Text style={styles.unitSubtitle}>
                {unit.lessons.length} {unit.lessons.length === 1 ? 'lesson' : 'lessons'} · {unit.completedCount} completed
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/lessons/${unit.id}`)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="open-outline" size={20} color="#c4a35a" />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.unitProgressBar}>
          <View
            style={[styles.unitProgressFill, { width: `${progress * 100}%` }]}
          />
        </View>

        {isExpanded && (
          <View style={styles.unitLessons}>
            {unit.lessons.map((lesson) => (
              <View key={lesson.id}>
                {renderLessonCard(lesson, false)}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  const hasUnits = groupedByUnit.units.length > 0;
  const hasStandalone = groupedByUnit.standalone.length > 0;
  const isEmpty = !hasUnits && !hasStandalone;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Lessons</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#6b7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search lessons, units, or categories..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#6b7280" />
          <Text style={styles.emptyTitle}>No Lessons Available</Text>
          <Text style={styles.emptyDescription}>
            {searchQuery
              ? 'No lessons match your search. Try a different query.'
              : 'Check back later for new lessons!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={
            hasUnits
              ? [...groupedByUnit.units, ...groupedByUnit.standalone]
              : groupedByUnit.standalone
          }
          renderItem={({ item }) => {
            if ('lessons' in item) {
              return renderUnitCard(item as Unit);
            } else {
              return renderLessonCard(item as Lesson);
            }
          }}
          keyExtractor={(item) => {
            if ('lessons' in item) {
              return `unit-${item.id}`;
            } else {
              return `lesson-${item.id}`;
            }
          }}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.resultsText}>
                {filteredLessons.length}{' '}
                {filteredLessons.length === 1 ? 'lesson' : 'lessons'} found
              </Text>
            </View>
          }
        />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  listContent: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  unitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  unitHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 4,
  },
  unitSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  unitProgressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
  },
  unitProgressFill: {
    height: '100%',
    backgroundColor: '#c4a35a',
  },
  unitLessons: {
    padding: 12,
    gap: 8,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lessonCardLeft: {
    marginRight: 12,
  },
  lessonCardContent: {
    flex: 1,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4338ca',
    textTransform: 'uppercase',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
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
