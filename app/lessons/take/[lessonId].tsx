import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { apiRequest } from '../../../src/api/client';

interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  audioUrl?: string;
  estimatedMinutes: number;
  isCompleted?: boolean;
}

export default function LessonPlayerScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const queryClient = useQueryClient();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const response = await apiRequest(
        `/api/connected/learning/lessons/${lessonId}`
      );
      return response as Lesson;
    },
  });

  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      const userId = 1; // Replace with actual user ID from auth context
      await apiRequest(`/api/connected/learning/progress/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'lesson_completed',
          sourceType: 'lesson',
          sourceId: Number(lessonId),
          xpEarned: 10,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      setShowCongratsModal(true);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to complete lesson. Please try again.');
      console.error('Complete lesson error:', error);
    },
  });

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAndPlayAudio = async () => {
    if (!lesson?.audioUrl) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: lesson.audioUrl },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const handleCompleteLesson = () => {
    Alert.alert(
      'Complete Lesson',
      'Mark this lesson as complete and earn 10 XP?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => completeLessonMutation.mutate(),
        },
      ]
    );
  };

  const handleBackPress = () => {
    if (!lesson?.isCompleted && hasStarted) {
      Alert.alert(
        'Exit Lesson',
        'Are you sure you want to leave? Your progress will not be saved.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleCongratsClose = () => {
    setShowCongratsModal(false);
    router.back();
  };

  useEffect(() => {
    if (lesson) {
      setHasStarted(true);
    }
  }, [lesson]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#6b7280" />
        <Text style={styles.emptyText}>Lesson not found</Text>
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
          onPress={handleBackPress}
          style={styles.headerBackButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1a365d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lesson.title}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.lessonMeta}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.lessonMetaText}>
              {lesson.estimatedMinutes} min
            </Text>
            {lesson.isCompleted && (
              <>
                <View style={styles.metaDivider} />
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.completedText}>Completed</Text>
              </>
            )}
          </View>
        </View>

        {lesson.audioUrl && (
          <View style={styles.audioSection}>
            <TouchableOpacity
              style={styles.audioButton}
              onPress={loadAndPlayAudio}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={48}
                color="#c4a35a"
              />
              <Text style={styles.audioButtonText}>
                {isPlaying ? 'Pause Audio' : 'Play Audio'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Lesson Content</Text>
          <Text style={styles.contentText}>{lesson.content}</Text>
        </View>

        {lesson.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{lesson.description}</Text>
          </View>
        )}
      </ScrollView>

      {!lesson.isCompleted && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteLesson}
            disabled={completeLessonMutation.isPending}
            activeOpacity={0.7}
          >
            {completeLessonMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#ffffff" />
                <Text style={styles.completeButtonText}>Complete Lesson</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showCongratsModal}
        transparent
        animationType="fade"
        onRequestClose={handleCongratsClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="trophy" size={64} color="#c4a35a" />
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalMessage}>
              You've completed this lesson and earned 10 XP!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCongratsClose}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  lessonHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: 12,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6b7280',
    marginHorizontal: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#10b981',
    marginLeft: 4,
    fontWeight: '600',
  },
  audioSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  audioButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  audioButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a365d',
    marginTop: 8,
  },
  contentSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  descriptionSection: {
    backgroundColor: '#ffffff',
    padding: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a365d',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  completeButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a365d',
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#1a365d',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
