import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { apiRequest } from '../../src/api/client';

type MediaType = 'story' | 'song' | 'video' | 'document' | 'audio' | 'image';

interface MediaItem {
  id: number;
  title: string;
  description: string;
  type: MediaType;
  content?: string;
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  author?: string;
  speaker?: string;
  duration?: number;
  relatedMedia?: Array<{
    id: number;
    title: string;
    type: MediaType;
  }>;
}

const { width } = Dimensions.get('window');

export default function StoryDetailScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const { data: media, isLoading, error } = useQuery({
    queryKey: ['media-detail', storyId],
    queryFn: async () => {
      const response = await apiRequest(`/api/connected/immersion/media/${storyId}`);
      return response.media as MediaItem;
    },
    enabled: !!storyId,
  });

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadAudio = async () => {
    if (!media?.audioUrl) return;

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: media.audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) {
      await loadAudio();
      return;
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (!media) return null;

    switch (media.type) {
      case 'story':
      case 'document':
        return (
          <View style={styles.textContent}>
            <Text style={styles.contentText}>{media.content}</Text>
          </View>
        );

      case 'audio':
      case 'song':
        return (
          <View style={styles.audioPlayer}>
            <View style={styles.audioIcon}>
              <Ionicons name="musical-notes" size={48} color="#c4a35a" />
            </View>

            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color="#ffffff"
              />
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${duration ? (position / duration) * 100 : 0}%` },
                  ]}
                />
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>
        );

      case 'image':
        return (
          <View style={styles.imageContent}>
            {media.imageUrl ? (
              <Image
                source={{ uri: media.imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={64} color="#9ca3af" />
              </View>
            )}
            {media.description && (
              <Text style={styles.caption}>{media.description}</Text>
            )}
          </View>
        );

      case 'video':
        return (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam-outline" size={64} color="#9ca3af" />
            <Text style={styles.placeholderText}>Video player coming soon</Text>
          </View>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (error || !media) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load media</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIconButton}>
          <Ionicons name="arrow-back" size={24} color="#1a365d" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {media.title}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{media.title}</Text>

          {(media.author || media.speaker) && (
            <View style={styles.authorContainer}>
              <Ionicons name="person-outline" size={16} color="#6b7280" />
              <Text style={styles.authorText}>
                {media.author || media.speaker}
              </Text>
            </View>
          )}

          {renderContent()}

          {media.relatedMedia && media.relatedMedia.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Related Content</Text>
              {media.relatedMedia.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedItem}
                  onPress={() => router.push(`/stories/${item.id}`)}
                >
                  <Ionicons name="link-outline" size={20} color="#1a365d" />
                  <Text style={styles.relatedItemText}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    padding: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backIconButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a365d',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  authorText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  textContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#374151',
  },
  audioPlayer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  audioIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a365d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#c4a35a',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  imageContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  image: {
    width: '100%',
    height: width - 72,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: width - 72,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caption: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
  videoPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  relatedSection: {
    marginTop: 32,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: 12,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#1a365d',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
