import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../../src/api/client';

interface Pathway {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdBy: string;
  isEnrolled?: boolean;
  progressPercentage?: number;
}

interface Stage {
  id: number;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  isCompleted?: boolean;
}

interface PathwayStructure {
  pathway: Pathway;
  stages: Stage[];
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

export default function LearningPathDetailScreen() {
  const { pathId } = useLocalSearchParams<{ pathId: string }>();
  const queryClient = useQueryClient();

  const { data: pathway, isLoading: pathwayLoading } = useQuery({
    queryKey: ['pathway', pathId],
    queryFn: async () => {
      const response = await apiRequest(
        `/api/connected/learning/pathways/pathways/${pathId}`
      );
      return response as Pathway;
    },
  });

  const { data: structure, isLoading: structureLoading } = useQuery({
    queryKey: ['pathway-structure', pathId],
    queryFn: async () => {
      const response = await apiRequest(
        `/api/connected/learning/pathways/pathways/${pathId}/structure`
      );
      return response as PathwayStructure;
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const userId = 1; // Replace with actual user ID from auth context
      await apiRequest(
        `/api/connected/learning/pathways/users/${userId}/enroll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pathwayId: Number(pathId),
          }),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pathway', pathId] });
      queryClient.invalidateQueries({ queryKey: ['learning-pathways'] });
      Alert.alert(
        'Success',
        'You have successfully enrolled in this learning path!'
      );
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to enroll. Please try again.');
      console.error('Enroll error:', error);
    },
  });

  const handleEnroll = () => {
    Alert.alert(
      'Enroll in Learning Path',
      `Do you want to enroll in "${pathway?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enroll',
          onPress: () => enrollMutation.mutate(),
        },
      ]
    );
  };

  const handleLessonPress = (lessonId: number) => {
    router.push(`/lessons/take/${lessonId}`);
  };

  if (pathwayLoading || structureLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (!pathway || !structure) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#6b7280" />
        <Text style={styles.emptyText}>Learning path not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const difficultyConfig = getDifficultyConfig(pathway.difficulty);
  const totalLessons = structure.stages.reduce(
    (sum, stage) => sum + stage.lessons.length,
    0
  );
  const completedLessons = structure.stages.reduce(
    (sum, stage) =>
      sum + stage.lessons.filter((lesson) => lesson.isCompleted).length,
    0
  );
  const progress = totalLessons > 0 ? completedLessons / totalLessons : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1a365d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Path</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.pathwayHeader}>
          <Text style={styles.pathwayTitle}>{pathway.title}</Text>
          <Text style={styles.pathwayDescription}>{pathway.description}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons
                name={difficultyConfig.icon as any}
                size={18}
                color={difficultyConfig.color}
              />
              <Text style={[styles.metaText, { color: difficultyConfig.color }]}>
                {difficultyConfig.label}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={18} color="#6b7280" />
              <Text style={styles.metaText}>Created by {pathway.createdBy}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={18} color="#6b7280" />
              <Text style={styles.metaText}>
                {structure.stages.length} stages · {totalLessons} lessons
              </Text>
            </View>
          </View>

          {pathway.isEnrolled && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={styles.progressText}>
                  {completedLessons}/{totalLessons} lessons
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.stagesSection}>
          <Text style={styles.sectionTitle}>Learning Stages</Text>

          {structure.stages
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((stage, stageIndex) => {
              const stageCompletedLessons = stage.lessons.filter(
                (l) => l.isCompleted
              ).length;
              const stageProgress =
                stage.lessons.length > 0
                  ? stageCompletedLessons / stage.lessons.length
                  : 0;

              return (
                <View key={stage.id} style={styles.stageCard}>
                  <View style={styles.stageHeader}>
                    <View style={styles.stageNumberBadge}>
                      <Text style={styles.stageNumberText}>
                        {stageIndex + 1}
                      </Text>
                    </View>
                    <View style={styles.stageTitleContainer}>
                      <Text style={styles.stageTitle}>{stage.title}</Text>
                      <Text style={styles.stageDescription}>
                        {stage.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stageProgress}>
                    <View style={styles.stageProgressBar}>
                      <View
                        style={[
                          styles.stageProgressFill,
                          { width: `${stageProgress * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.stageProgressText}>
                      {stageCompletedLessons}/{stage.lessons.length} complete
                    </Text>
                  </View>

                  <View style={styles.lessonsContainer}>
                    {stage.lessons.map((lesson) => (
                      <TouchableOpacity
                        key={lesson.id}
                        style={styles.lessonItem}
                        onPress={() => handleLessonPress(lesson.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.lessonIconContainer}>
                          {lesson.isCompleted ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="#10b981"
                            />
                          ) : (
                            <Ionicons
                              name="play-circle-outline"
                              size={24}
                              color="#c4a35a"
                            />
                          )}
                        </View>
                        <View style={styles.lessonContent}>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          <View style={styles.lessonMetaRow}>
                            <Ionicons name="time-outline" size={12} color="#6b7280" />
                            <Text style={styles.lessonMetaText}>
                              {lesson.estimatedMinutes} min
                            </Text>
                          </View>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#6b7280"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
        </View>
      </ScrollView>

      {!pathway.isEnrolled && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={handleEnroll}
            disabled={enrollMutation.isPending}
            activeOpacity={0.7}
          >
            {enrollMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
                <Text style={styles.enrollButtonText}>Enroll in Path</Text>
              </>
            )}
          </TouchableOpacity>
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
  pathwayHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  pathwayTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 8,
  },
  pathwayDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  progressSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
  stagesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 16,
  },
  stageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  stageHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stageNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a365d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  stageTitleContainer: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  stageProgress: {
    marginBottom: 16,
  },
  stageProgressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  stageProgressFill: {
    height: '100%',
    backgroundColor: '#c4a35a',
    borderRadius: 3,
  },
  stageProgressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  lessonsContainer: {
    gap: 8,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  lessonIconContainer: {
    marginRight: 12,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a365d',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
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
