import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface AudioPlayerProps {
  uri: string;
  label?: string;
  compact?: boolean;
}

export default function AudioPlayer({ uri, label, compact = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const handlePlayPause = async () => {
    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
              soundRef.current?.setPositionAsync(0);
            }
          }
        }
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactButton} onPress={handlePlayPause}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#1a365d" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.info}>
        {label && <Text style={styles.label} numberOfLines={1}>{label}</Text>}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.time}>{formatTime(position)} / {formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f4f8', borderRadius: 12, padding: 12, gap: 12 },
  playButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a365d',
    justifyContent: 'center', alignItems: 'center',
  },
  compactButton: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#dbeafe',
    justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  progressTrack: { height: 4, backgroundColor: '#d1d5db', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#1a365d', borderRadius: 2 },
  time: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
});
