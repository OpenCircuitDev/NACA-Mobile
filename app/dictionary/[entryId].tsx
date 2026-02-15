import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { apiRequest } from '../../src/api/client';

interface DictionaryEntry {
  id: number;
  indigenousWord: string;
  englishTranslation: string;
  pronunciation?: string;
  category: string;
  partOfSpeech?: string;
  examples?: string[];
  imageUrl?: string;
  speakerInfo?: {
    name: string;
    community?: string;
  };
}

interface AudioSource {
  id: number;
  url: string;
  speaker?: string;
  dialect?: string;
}

export default function DictionaryEntryScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const { data: entry, isLoading, error } = useQuery({
    queryKey: ['dictionary-entry', entryId],
    queryFn: async () => {
      const response = await apiRequest(
        `/api/connected/learning/dictionary/entries/${entryId}`
      );
      return response as DictionaryEntry;
    },
  });

  const { data: audioSources } = useQuery({
    queryKey: ['dictionary-audio', entryId],
    queryFn: async () => {
      const response = await apiRequest(
        `/api/connected/learning/dictionary/entries/${entryId}/audio`
      );
      return response as AudioSource[];
    },
  });

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async (audioUrl: string, audioId: number) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (playingAudioId === audioId) {
        setPlayingAudioId(null);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingAudioId(audioId);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudioId(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (error || !entry) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load entry</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a365d" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.indigenousWord}>{entry.indigenousWord}</Text>

        {entry.pronunciation && (
          <Text style={styles.pronunciation}>/{entry.pronunciation}/</Text>
        )}

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{entry.category}</Text>
        </View>

        {entry.partOfSpeech && (
          <Text style={styles.partOfSpeech}>{entry.partOfSpeech}</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>English Translation</Text>
          <Text style={styles.translation}>{entry.englishTranslation}</Text>
        </View>

        {audioSources && audioSources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audio Pronunciation</Text>
            {audioSources.map((audio) => (
              <TouchableOpacity
                key={audio.id}
                style={styles.audioButton}
                onPress={() => playAudio(audio.url, audio.id)}
              >
                <Ionicons
                  name={playingAudioId === audio.id ? 'pause-circle' : 'play-circle'}
                  size={32}
                  color="#1a365d"
                />
                <View style={styles.audioInfo}>
                  {audio.speaker && (
                    <Text style={styles.audioSpeaker}>{audio.speaker}</Text>
                  )}
                  {audio.dialect && (
                    <Text style={styles.audioDialect}>{audio.dialect}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {entry.examples && entry.examples.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage Examples</Text>
            {entry.examples.map((example, index) => (
              <View key={index} style={styles.exampleItem}>
                <Ionicons name="chevron-forward" size={16} color="#c4a35a" />
                <Text style={styles.exampleText}>{example}</Text>
              </View>
            ))}
          </View>
        )}

        {entry.imageUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Image</Text>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color="#6b7280" />
              <Text style={styles.imagePlaceholderText}>Image display coming soon</Text>
            </View>
          </View>
        )}

        {entry.speakerInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Speaker Information</Text>
            <Text style={styles.speakerName}>{entry.speakerInfo.name}</Text>
            {entry.speakerInfo.community && (
              <Text style={styles.speakerCommunity}>
                {entry.speakerInfo.community}
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    padding: 20,
  },
  indigenousWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
  },
  pronunciation: {
    fontSize: 18,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#c4a35a',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  partOfSpeech: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  translation: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 26,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  audioInfo: {
    marginLeft: 12,
    flex: 1,
  },
  audioSpeaker: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  audioDialect: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 8,
  },
  exampleText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 24,
  },
  imagePlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  speakerName: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 4,
  },
  speakerCommunity: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
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
