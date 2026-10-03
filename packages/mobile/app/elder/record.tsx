import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useCommunity } from '../../src/contexts/CommunityContext';
import {
  useProtocolTags,
  useCreateRecording,
  useUploadAudio,
} from '../../src/hooks/useElderWorkspace';
import { searchDictionary } from '../../src/api/dictionary';
import type { ProtocolTag } from '../../src/api/elderWorkspace';

/**
 * Elder Record screen — capture an elder_speech variant for a dictionary entry.
 *
 * Flow:
 *   1. Elder searches + picks a dictionary entry to record for
 *   2. Elder enters the pronunciation text (Indigenous spelling)
 *   3. Elder taps to record audio (expo-av), plays it back, re-records if needed
 *   4. Elder optionally adds pronunciation key, literal translation, notes
 *   5. Elder picks any protocol tags (uses community vocabulary)
 *   6. Submit → POST /recordings creates dictionary_entry_variants row with
 *      variantType='elder_speech', caApprovalStatus='pending'
 *
 * v1 limitation: the audio file stays LOCAL on the device. The variant row is
 * created with audioMediaId=undefined. Media upload pipeline lands in v1.5 —
 * see the audio panel banner. The text variant still goes through the
 * approval flow and surfaces in the CA's queue.
 */

interface SearchHit {
  id: string;
  language?: string;
  english?: string;
  category?: string;
}

export default function ElderRecordScreen() {
  const { activeCommunity } = useCommunity();
  const role = (activeCommunity as any)?.role;
  const hasAccess = role === 'elder' || role === 'community_administrator';

  const protocolTags = useProtocolTags();
  const createRecording = useCreateRecording();
  const uploadAudio = useUploadAudio();

  // Entry selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<SearchHit | null>(null);

  // Form state
  const [languageText, setLanguageText] = useState('');
  const [pronunciationKey, setPronunciationKey] = useState('');
  const [literalTranslation, setLiteralTranslation] = useState('');
  const [notes, setNotes] = useState('');
  const [protocolTagIds, setProtocolTagIds] = useState<string[]>([]);

  // Audio state
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup recording + sound on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  if (!hasAccess) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={64} color="#9ca3af" />
        <Text style={styles.bodyTextCentered}>You don't have Elder access in this community.</Text>
      </View>
    );
  }

  // Dictionary search (debounced inline)
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchDictionary(q, { limit: 10 });
        // searchDictionary returns DictionarySearchResult — pull the entries array.
        // Shape varies; defensive access:
        const entries: SearchHit[] =
          (res as any).entries ?? (res as any).data?.entries ?? (res as any).data ?? [];
        setSearchResults(entries);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Microphone access is needed to record audio.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      // Unload previous sound if any
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setDuration(0);
      setRecordingUri(null);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err: any) {
      Alert.alert('Recording failed', err?.message ?? 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      if (uri) setRecordingUri(uri);
    } catch (err: any) {
      Alert.alert('Stop failed', err?.message ?? 'Could not stop recording.');
    }
  };

  const playPreview = async () => {
    if (!recordingUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      await sound.playAsync();
      setIsPlaying(true);
    } catch (err: any) {
      Alert.alert('Playback failed', err?.message ?? 'Could not play recording.');
    }
  };

  const retake = () => {
    setRecordingUri(null);
    setDuration(0);
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
  };

  const toggleTag = (id: string) => {
    setProtocolTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const canSubmit =
    !!selectedEntry &&
    languageText.trim().length > 0 &&
    !isRecording &&
    !createRecording.isPending &&
    !uploadAudio.isPending;

  /**
   * Best-effort audio upload. Returns the mediaId on success, or undefined if:
   *   - There's no recording to upload
   *   - The backend storage isn't configured (503 STORAGE_UPLOAD_FAILED)
   *   - The upload otherwise fails
   * On failure the user is informed and we continue with text-only variant submission.
   */
  const tryUploadAudio = async (): Promise<string | undefined> => {
    if (!recordingUri) return undefined;
    try {
      // Read the local file and base64-encode it for transport.
      // expo-file-system v19+ uses the File class with .base64() instead of the
      // deprecated readAsStringAsync + EncodingType pattern.
      const file = new FileSystem.File(recordingUri);
      const fileData = await file.base64();
      // Infer mime type from URI extension. expo-av defaults to .m4a on iOS, .3gp on Android,
      // but HIGH_QUALITY preset uses AAC/MP4 on iOS and AAC/MP4 on Android — usually .m4a.
      const ext = recordingUri.split('.').pop()?.toLowerCase() ?? 'm4a';
      const mimeType =
        ext === 'm4a' ? 'audio/mp4'
        : ext === 'mp4' ? 'audio/mp4'
        : ext === '3gp' ? 'audio/3gpp'
        : ext === 'wav' ? 'audio/wav'
        : ext === 'mp3' ? 'audio/mpeg'
        : 'audio/mp4';

      const result = await uploadAudio.mutateAsync({
        fileName: `elder-${Date.now()}.${ext}`,
        mimeType,
        fileData,
      });
      return result.id;
    } catch (err: any) {
      const reason = err?.message ?? 'unknown error';
      const isStorageNotConfigured =
        reason.includes('STORAGE_UPLOAD_FAILED') || reason.includes('storage backend');
      Alert.alert(
        'Audio upload not available',
        isStorageNotConfigured
          ? 'Audio storage isn\'t configured on this server. Your text variant will still be submitted — the audio file stays on your device for now. Tell your administrator to configure GCS bucket access if you need audio attached.'
          : `Audio upload failed: ${reason}. Continuing without audio.`,
      );
      return undefined;
    }
  };

  const handleSubmit = async () => {
    if (!selectedEntry || !canSubmit) return;
    try {
      const audioMediaId = await tryUploadAudio();

      await createRecording.mutateAsync({
        entryId: selectedEntry.id,
        languageText: languageText.trim(),
        pronunciationKey: pronunciationKey.trim() || undefined,
        literalTranslation: literalTranslation.trim() || undefined,
        notes: notes.trim() || undefined,
        protocolTagIds,
        audioMediaId,
      });

      Alert.alert(
        'Recording submitted',
        audioMediaId
          ? 'Your recording (with audio attached) is in the approval queue.'
          : recordingUri
            ? 'Your text variant is in the approval queue. Audio was not attached.'
            : 'Your text variant is in the approval queue.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert('Submit failed', err?.message ?? 'Could not submit. Please try again.');
    }
  };

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: pick entry */}
        <Text style={styles.sectionLabel}>STEP 1 — PICK AN ENTRY</Text>

        {selectedEntry ? (
          <View style={styles.selectedEntryCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedEntryLanguage}>
                {selectedEntry.language ?? '(no language text)'}
              </Text>
              <Text style={styles.selectedEntryEnglish}>{selectedEntry.english ?? '—'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedEntry(null);
                setSearchQuery('');
              }}
              testID="button-clear-entry"
            >
              <Ionicons name="close-circle" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Search dictionary entries…"
              placeholderTextColor="#9ca3af"
              autoCorrect={false}
              testID="input-search"
            />
            {isSearching && <ActivityIndicator color="#1a365d" style={{ marginTop: 8 }} />}
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((hit) => (
                  <TouchableOpacity
                    key={hit.id}
                    style={styles.searchResult}
                    onPress={() => {
                      setSelectedEntry(hit);
                      setLanguageText(hit.language ?? '');
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    testID={`search-result-${hit.id}`}
                  >
                    <Text style={styles.searchResultLanguage}>{hit.language ?? '—'}</Text>
                    <Text style={styles.searchResultEnglish}>{hit.english ?? '—'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Step 2: pronunciation text */}
        {selectedEntry && (
          <>
            <Text style={styles.sectionLabel}>STEP 2 — YOUR PRONUNCIATION (TEXT)</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Indigenous spelling *</Text>
              <TextInput
                style={styles.input}
                value={languageText}
                onChangeText={setLanguageText}
                placeholder="How this word is spelled"
                placeholderTextColor="#9ca3af"
                testID="input-language-text"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Pronunciation key</Text>
              <Text style={styles.fieldHint}>Optional — how to say it (phonetic).</Text>
              <TextInput
                style={styles.input}
                value={pronunciationKey}
                onChangeText={setPronunciationKey}
                placeholder="e.g. en-yook-ee"
                placeholderTextColor="#9ca3af"
                testID="input-pronunciation-key"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Literal translation</Text>
              <TextInput
                style={styles.input}
                value={literalTranslation}
                onChangeText={setLiteralTranslation}
                placeholder="Optional — word-for-word meaning"
                placeholderTextColor="#9ca3af"
                testID="input-literal-translation"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional — anything else CAs should know"
                placeholderTextColor="#9ca3af"
                multiline
                testID="input-notes"
              />
            </View>

            {/* Step 3: audio capture */}
            <Text style={styles.sectionLabel}>STEP 3 — RECORD AUDIO (OPTIONAL PREVIEW)</Text>

            <View style={styles.audioBanner}>
              <Ionicons name="information-circle-outline" size={18} color="#1e40af" />
              <Text style={styles.audioBannerText}>
                Audio is uploaded to your community's secure storage when you submit, and
                attached to the variant for review. If your server's storage isn't configured,
                your text variant still submits and you'll be notified that audio couldn't
                be attached.
              </Text>
            </View>

            <View style={styles.audioPanel}>
              {!recordingUri && !isRecording && (
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={startRecording}
                  testID="button-record"
                >
                  <Ionicons name="mic" size={32} color="#ffffff" />
                  <Text style={styles.recordButtonText}>Tap to record</Text>
                </TouchableOpacity>
              )}

              {isRecording && (
                <TouchableOpacity
                  style={[styles.recordButton, styles.recordButtonActive]}
                  onPress={stopRecording}
                  testID="button-stop"
                >
                  <Ionicons name="stop" size={32} color="#ffffff" />
                  <Text style={styles.recordButtonText}>
                    Recording… {formatDuration(duration)} (tap to stop)
                  </Text>
                </TouchableOpacity>
              )}

              {recordingUri && !isRecording && (
                <View style={styles.previewRow}>
                  <TouchableOpacity
                    style={styles.previewButton}
                    onPress={playPreview}
                    disabled={isPlaying}
                    testID="button-play"
                  >
                    <Ionicons
                      name={isPlaying ? 'volume-high' : 'play'}
                      size={20}
                      color="#1a365d"
                    />
                    <Text style={styles.previewButtonText}>
                      {isPlaying ? 'Playing' : `Preview (${formatDuration(duration)})`}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={retake}
                    testID="button-retake"
                  >
                    <Ionicons name="refresh" size={18} color="#7c2d12" />
                    <Text style={styles.retakeButtonText}>Re-record</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Step 4: protocol tags */}
            <Text style={styles.sectionLabel}>STEP 4 — PROTOCOL TAGS (OPTIONAL)</Text>
            {protocolTags.isLoading ? (
              <ActivityIndicator color="#1a365d" />
            ) : (protocolTags.data?.length ?? 0) === 0 ? (
              <Text style={styles.helpText}>
                No community-specific protocol tags defined yet.
              </Text>
            ) : (
              <View style={styles.tagWrap}>
                {protocolTags.data!.map((tag) => {
                  const selected = protocolTagIds.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[styles.tagChip, selected && styles.tagChipSelected]}
                      onPress={() => toggleTag(tag.id)}
                      testID={`tag-chip-${tag.slug}`}
                    >
                      <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              disabled={!canSubmit}
              onPress={handleSubmit}
              testID="button-submit"
            >
              {createRecording.isPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={18} color="#ffffff" />
                  <Text style={styles.submitButtonText}>Submit recording</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 48 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  bodyTextCentered: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 18,
  },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldHint: { fontSize: 12, color: '#6b7280', marginBottom: 6, lineHeight: 16 },
  helpText: { fontSize: 13, color: '#6b7280', fontStyle: 'italic', lineHeight: 18 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  selectedEntryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    borderColor: '#1a365d',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  selectedEntryLanguage: { fontSize: 16, fontWeight: '700', color: '#1a365d' },
  selectedEntryEnglish: { fontSize: 14, color: '#374151', marginTop: 2 },
  searchResults: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  searchResult: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchResultLanguage: { fontSize: 14, fontWeight: '600', color: '#1a365d' },
  searchResultEnglish: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  audioBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  audioBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#1e40af',
    marginLeft: 8,
    lineHeight: 17,
  },
  audioPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a365d',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 32,
    gap: 12,
  },
  recordButtonActive: { backgroundColor: '#dc2626' },
  recordButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  previewRow: { flexDirection: 'row', gap: 12, width: '100%' },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewButtonText: { color: '#1a365d', fontWeight: '600', fontSize: 14 },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  retakeButtonText: { color: '#7c2d12', fontWeight: '600', fontSize: 14 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagChipSelected: { backgroundColor: '#1a365d', borderColor: '#1a365d' },
  tagChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  tagChipTextSelected: { color: '#ffffff' },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a365d',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  submitButtonDisabled: { backgroundColor: '#9ca3af' },
  submitButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
});
