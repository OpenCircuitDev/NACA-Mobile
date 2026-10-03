import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import { apiRequest } from '../../src/api/client';

const CATEGORIES = [
  'Animals',
  'Plants',
  'Food',
  'Family',
  'Numbers',
  'Colors',
  'Nature',
  'Activities',
  'Objects',
  'Other',
];

const PARTS_OF_SPEECH = [
  'Noun',
  'Verb',
  'Adjective',
  'Adverb',
  'Pronoun',
  'Preposition',
  'Conjunction',
  'Interjection',
];

export default function CreateDictionaryEntryScreen() {
  const [indigenousWord, setIndigenousWord] = useState('');
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [partOfSpeech, setPartOfSpeech] = useState(PARTS_OF_SPEECH[0]);
  const [examples, setExamples] = useState<string[]>(['']);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Microphone access is needed to record audio');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;

    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const deleteRecording = () => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
    setRecordingUri(null);
    setIsPlaying(false);
  };

  const addExample = () => {
    setExamples([...examples, '']);
  };

  const updateExample = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const removeExample = (index: number) => {
    if (examples.length > 1) {
      setExamples(examples.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!indigenousWord.trim()) {
      newErrors.indigenousWord = 'Indigenous word is required';
    }
    if (!englishTranslation.trim()) {
      newErrors.englishTranslation = 'English translation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const filteredExamples = examples.filter((ex) => ex.trim() !== '');

      const payload = {
        indigenousWord: indigenousWord.trim(),
        englishTranslation: englishTranslation.trim(),
        pronunciation: pronunciation.trim() || undefined,
        category,
        partOfSpeech,
        examples: filteredExamples.length > 0 ? filteredExamples : undefined,
        // Note: Audio upload would be handled separately in a real implementation
      };

      await apiRequest('/api/connected/learning/dictionary/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      Alert.alert('Success', 'Dictionary entry submitted successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Failed to submit entry:', error);
      Alert.alert('Error', 'Failed to submit entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a365d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Dictionary Entry</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={20} color="#c4a35a" />
          <Text style={styles.noteText}>
            Contributor role required. Your submission will be reviewed before publication.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Indigenous Word <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.indigenousWord && styles.inputError]}
            value={indigenousWord}
            onChangeText={setIndigenousWord}
            placeholder="Enter the indigenous word"
            placeholderTextColor="#9ca3af"
          />
          {errors.indigenousWord && (
            <Text style={styles.errorText}>{errors.indigenousWord}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            English Translation <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.englishTranslation && styles.inputError]}
            value={englishTranslation}
            onChangeText={setEnglishTranslation}
            placeholder="Enter the English translation"
            placeholderTextColor="#9ca3af"
          />
          {errors.englishTranslation && (
            <Text style={styles.errorText}>{errors.englishTranslation}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Pronunciation (IPA)</Text>
          <TextInput
            style={styles.input}
            value={pronunciation}
            onChangeText={setPronunciation}
            placeholder="e.g., /təˈneɪʃən/"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              {CATEGORIES.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Part of Speech</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={partOfSpeech}
              onValueChange={setPartOfSpeech}
              style={styles.picker}
            >
              {PARTS_OF_SPEECH.map((pos) => (
                <Picker.Item key={pos} label={pos} value={pos} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Audio Recording</Text>
          <View style={styles.audioSection}>
            {!recordingUri ? (
              <TouchableOpacity
                style={[styles.audioButton, isRecording && styles.audioButtonRecording]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons
                  name={isRecording ? 'stop-circle' : 'mic'}
                  size={24}
                  color="#ffffff"
                />
                <Text style={styles.audioButtonText}>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.recordingControls}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={playRecording}
                >
                  <Ionicons
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
                    size={32}
                    color="#1a365d"
                  />
                  <Text style={styles.playButtonText}>
                    {isPlaying ? 'Playing...' : 'Play Recording'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={deleteRecording}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Usage Examples</Text>
          {examples.map((example, index) => (
            <View key={index} style={styles.exampleRow}>
              <TextInput
                style={styles.exampleInput}
                value={example}
                onChangeText={(value) => updateExample(index, value)}
                placeholder={`Example ${index + 1}`}
                placeholderTextColor="#9ca3af"
                multiline
              />
              {examples.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeExample(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addExample}>
            <Ionicons name="add-circle-outline" size={20} color="#1a365d" />
            <Text style={styles.addButtonText}>Add Example</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Image</Text>
          <TouchableOpacity style={styles.imagePicker}>
            <Ionicons name="camera-outline" size={32} color="#6b7280" />
            <Text style={styles.imagePickerText}>Add Image (Coming Soon)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit Entry</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  content: {
    padding: 20,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  audioSection: {
    marginTop: 4,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a365d',
    padding: 16,
    borderRadius: 8,
  },
  audioButtonRecording: {
    backgroundColor: '#ef4444',
  },
  audioButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playButtonText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exampleInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    minHeight: 44,
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#1a365d',
    marginLeft: 8,
    fontWeight: '500',
  },
  imagePicker: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a365d',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
