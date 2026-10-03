import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';

interface AudioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  error: string | null;
}

export function useAudioPlayer() {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    duration: 0,
    position: 0,
    error: null,
  });
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const play = useCallback(async (uri: string) => {
    try {
      // Unload previous
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setState(s => ({ ...s, isLoading: true, error: null }));
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setState(s => ({
              ...s,
              isPlaying: status.isPlaying,
              position: status.positionMillis,
              duration: status.durationMillis || 0,
              isLoading: false,
            }));
            if (status.didJustFinish) {
              setState(s => ({ ...s, isPlaying: false, position: 0 }));
              sound.setPositionAsync(0);
            }
          }
        }
      );
      soundRef.current = sound;
    } catch (error: any) {
      setState(s => ({ ...s, isLoading: false, error: error.message }));
    }
  }, []);

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
  }, []);

  const resume = useCallback(async () => {
    await soundRef.current?.playAsync();
  }, []);

  const stop = useCallback(async () => {
    await soundRef.current?.stopAsync();
    setState(s => ({ ...s, isPlaying: false, position: 0 }));
  }, []);

  const togglePlayPause = useCallback(async (uri?: string) => {
    if (state.isPlaying) {
      await pause();
    } else if (soundRef.current) {
      await resume();
    } else if (uri) {
      await play(uri);
    }
  }, [state.isPlaying, play, pause, resume]);

  return { ...state, play, pause, resume, stop, togglePlayPause };
}
