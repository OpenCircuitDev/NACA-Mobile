import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { getGameDataset } from '../../../src/api/lessons';
import { useAuth } from '../../../src/contexts/AuthContext';
import { recordProgressEvent } from '../../../src/api/progress';
import GameResults from '../../../src/components/games/GameResults';
import ProgressBar from '../../../src/components/ui/ProgressBar';

export default function AudioRecognitionGame() {
  const { datasetId } = useLocalSearchParams<{ datasetId: string }>();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [startTime] = useState(Date.now());
  const soundRef = useRef<Audio.Sound | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['gameDataset', datasetId],
    queryFn: () => getGameDataset(datasetId!),
    enabled: !!datasetId,
  });

  const items = data?.data?.items || [];
  const currentItem = items[currentIndex];
  const total = items.length;

  // Generate options: correct answer + 3 distractors
  const options = React.useMemo(() => {
    if (!currentItem || items.length < 2) return [];
    const correct = currentItem.answer || currentItem.englishTranslation;
    const others = items
      .filter((_: any, i: number) => i !== currentIndex)
      .map((item: any) => item.answer || item.englishTranslation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const allOptions = [correct, ...others].sort(() => Math.random() - 0.5);
    return allOptions;
  }, [currentIndex, items.length]);

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const playAudio = async () => {
    if (!currentItem?.audioUrl) return;
    try {
      soundRef.current?.unloadAsync();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: currentItem.audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) setIsPlayingAudio(false);
        }
      );
      soundRef.current = sound;
      setIsPlayingAudio(true);
    } catch (error) {
      console.error('Audio error:', error);
    }
  };

  const handleAnswer = (answer: string) => {
    const correct = currentItem.answer || currentItem.englishTranslation;
    const isCorrect = answer === correct;
    setSelectedAnswer(answer);
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentIndex + 1 >= total) {
        const finalScore = score + (isCorrect ? 1 : 0);
        if (user) {
          recordProgressEvent(user.id, {
            eventType: 'game_completed',
            sourceType: 'game_dataset',
            sourceId: datasetId!,
            data: { gameType: 'audio_recognition' },
            score: finalScore,
            xpEarned: Math.round((finalScore / total) * 20),
            timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000),
          }).catch(() => {});
        }
        setShowResults(true);
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, 1000);
  };

  const reset = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResults(false);
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a365d" /></View>;
  }

  if (showResults) {
    return (
      <GameResults score={score} total={total}
        timeSeconds={Math.floor((Date.now() - startTime) / 1000)}
        xpEarned={Math.round((score / total) * 20)} onPlayAgain={reset} />
    );
  }

  if (!currentItem) {
    return <View style={styles.center}><Text style={styles.emptyText}>No audio items available.</Text></View>;
  }

  const correctAnswer = currentItem.answer || currentItem.englishTranslation;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.counter}>{currentIndex + 1}/{total}</Text>
        <Text style={styles.scoreText}>{score} correct</Text>
      </View>

      <ProgressBar progress={(currentIndex + 1) / total} style={styles.progress} />

      {/* Audio Prompt */}
      <View style={styles.audioSection}>
        <Text style={styles.instruction}>Listen and select the correct answer</Text>
        <TouchableOpacity style={styles.playButton} onPress={playAudio}>
          <Ionicons name={isPlayingAudio ? 'pause' : 'play'} size={40} color="#ffffff" />
        </TouchableOpacity>
        {!currentItem.audioUrl && (
          <Text style={styles.wordPrompt}>{currentItem.question || currentItem.indigenousWord}</Text>
        )}
        <Text style={styles.tapToPlay}>
          {currentItem.audioUrl ? 'Tap to listen' : 'What does this mean?'}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.optionsGrid}>
        {options.map((option: string, i: number) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === correctAnswer;
          const showResult = selectedAnswer !== null;

          return (
            <TouchableOpacity
              key={`${i}-${option}`}
              style={[
                styles.optionCard,
                showResult && isCorrectOption && styles.optionCorrect,
                showResult && isSelected && !isCorrectOption && styles.optionWrong,
              ]}
              onPress={() => !selectedAnswer ? handleAnswer(option) : undefined}
              disabled={!!selectedAnswer}
            >
              <Text style={[
                styles.optionText,
                showResult && isCorrectOption && styles.optionCorrectText,
                showResult && isSelected && !isCorrectOption && styles.optionWrongText,
              ]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48 },
  counter: { fontSize: 16, fontWeight: '600', color: '#374151' },
  scoreText: { fontSize: 14, color: '#22c55e', fontWeight: '500' },
  progress: { paddingHorizontal: 16 },
  audioSection: { alignItems: 'center', paddingVertical: 32 },
  instruction: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  playButton: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#1a365d',
    justifyContent: 'center', alignItems: 'center',
    elevation: 4, shadowColor: '#1a365d', shadowOpacity: 0.3, shadowRadius: 12,
  },
  wordPrompt: { fontSize: 28, fontWeight: '700', color: '#1a365d', marginTop: 20 },
  tapToPlay: { fontSize: 14, color: '#9ca3af', marginTop: 12 },
  optionsGrid: { paddingHorizontal: 16, gap: 12, flex: 1 },
  optionCard: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 18, borderWidth: 2, borderColor: '#e5e7eb',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  optionWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  optionText: { fontSize: 16, fontWeight: '500', color: '#374151', textAlign: 'center' },
  optionCorrectText: { color: '#22c55e' },
  optionWrongText: { color: '#ef4444' },
  emptyText: { fontSize: 16, color: '#6b7280' },
});
