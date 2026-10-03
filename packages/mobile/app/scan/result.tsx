import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useQRScanner } from '../../src/hooks/useQRScanner';
import type { QRLookupResult } from '../../src/api/qr';
import { API_URL } from '../../src/constants/config';

/**
 * QR Scan Result — Phase 2.6.
 *
 * Reads `qrId` from route params, looks it up (via the same hook the scanner
 * primed on its way here — typically a cache hit), and renders the resolved
 * content with audio playback.
 */
export default function ScanResultScreen() {
  const { qrId } = useLocalSearchParams<{ qrId: string }>();
  const { lookupQrAndCache } = useQRScanner();
  const [result, setResult] = useState<QRLookupResult | null>(null);
  const [source, setSource] = useState<'live' | 'cache'>('live');
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!qrId) {
      setError('No QR ID provided');
      return;
    }
    (async () => {
      const outcome = await lookupQrAndCache(qrId);
      if (cancelled) return;
      setResult(outcome.result);
      setSource(outcome.source);
      if (outcome.error) setError(outcome.error);
    })();
    return () => {
      cancelled = true;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [qrId, lookupQrAndCache]);

  const playAudio = async (storagePath: string, label: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const url = `${API_URL}/api/storage/public/${encodeURIComponent(storagePath)}`;
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = sound;
      setPlayingId(label);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setPlayingId(null);
      });
      await sound.playAsync();
    } catch (err: any) {
      Alert.alert('Could not play audio', err?.message ?? 'Unknown error');
      setPlayingId(null);
    }
  };

  if (!result) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a365d" />
        <Text style={styles.loading}>Looking up {qrId}…</Text>
      </View>
    );
  }

  if (!result.found) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
        <Text style={styles.notFoundTitle}>Not found</Text>
        <Text style={styles.notFoundText}>
          {result.message ?? `No content matched QR code "${qrId}".`}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/scan')}
          testID="button-scan-again"
        >
          <Ionicons name="qr-code-outline" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>Scan again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {source === 'cache' && (
        <View style={styles.cacheBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color="#92400e" />
          <Text style={styles.cacheBannerText}>
            Offline — showing a cached result from your last scan of this code.
          </Text>
        </View>
      )}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={16} color="#991b1b" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <Text style={styles.qrIdLabel}>QR ID</Text>
      <Text style={styles.qrId}>{result.qrId}</Text>

      {/* Activity */}
      {result.activity && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVITY</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{result.activity.name}</Text>
            <Text style={styles.cardSubtitle}>
              {result.activity.activityType}
              {result.activity.communityName && ` · ${result.activity.communityName}`}
            </Text>
            {result.activity.description && (
              <Text style={styles.cardBody}>{result.activity.description}</Text>
            )}
          </View>
        </View>
      )}

      {/* Vocabulary */}
      {result.vocabulary.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>VOCABULARY ({result.vocabulary.length})</Text>
          {result.vocabulary.map((v) => (
            <View key={v.id} style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{v.language || '—'}</Text>
                  <Text style={styles.cardSubtitle}>{v.english}</Text>
                  {v.pronunciationGuide && (
                    <Text style={styles.cardMeta}>{v.pronunciationGuide}</Text>
                  )}
                </View>
                {v.audioStoragePath && (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playAudio(v.audioStoragePath!, v.id)}
                    testID={`button-play-vocab-${v.id}`}
                  >
                    <Ionicons
                      name={playingId === v.id ? 'volume-high' : 'play'}
                      size={20}
                      color="#1a365d"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Related dictionary entries */}
      {result.relatedDictionaryEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            DICTIONARY ENTRIES ({result.relatedDictionaryEntries.length})
          </Text>
          {result.relatedDictionaryEntries.map((e) => (
            <View key={e.id} style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{e.language || '—'}</Text>
                  <Text style={styles.cardSubtitle}>{e.english}</Text>
                  {e.pronunciationKey && (
                    <Text style={styles.cardMeta}>{e.pronunciationKey}</Text>
                  )}
                  {e.category && (
                    <Text style={styles.cardMetaLight}>{e.category}</Text>
                  )}
                </View>
                {e.speaker1Audio && (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => playAudio(e.speaker1Audio!, `${e.id}-1`)}
                    testID={`button-play-entry-${e.id}`}
                  >
                    <Ionicons
                      name={playingId === `${e.id}-1` ? 'volume-high' : 'play'}
                      size={20}
                      color="#1a365d"
                    />
                  </TouchableOpacity>
                )}
              </View>
              {e.speaker2Audio && (
                <TouchableOpacity
                  style={[styles.playButton, styles.secondaryPlay]}
                  onPress={() => playAudio(e.speaker2Audio!, `${e.id}-2`)}
                >
                  <Ionicons name="play" size={16} color="#1a365d" />
                  <Text style={styles.secondaryPlayText}>Speaker 2</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {result.message && (
        <Text style={styles.messageFootnote}>{result.message}</Text>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, { marginTop: 24, alignSelf: 'center' }]}
        onPress={() => router.replace('/scan')}
        testID="button-scan-another"
      >
        <Ionicons name="qr-code-outline" size={18} color="#ffffff" />
        <Text style={styles.primaryButtonText}>Scan another</Text>
      </TouchableOpacity>
    </ScrollView>
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
  loading: { marginTop: 12, fontSize: 14, color: '#6b7280' },
  notFoundTitle: { fontSize: 22, fontWeight: '600', color: '#111827', marginTop: 12 },
  notFoundText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a365d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 24,
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },

  cacheBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  cacheBannerText: { flex: 1, fontSize: 12, color: '#92400e' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  errorBannerText: { flex: 1, fontSize: 12, color: '#991b1b' },

  qrIdLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 1,
  },
  qrId: {
    fontFamily: 'Menlo',
    fontSize: 18,
    color: '#1a365d',
    fontWeight: '600',
    marginBottom: 16,
  },
  section: { marginBottom: 18 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1a365d' },
  cardSubtitle: { fontSize: 14, color: '#374151', marginTop: 2 },
  cardBody: { fontSize: 14, color: '#4b5563', marginTop: 6, lineHeight: 20 },
  cardMeta: { fontSize: 13, color: '#6b7280', marginTop: 4, fontStyle: 'italic' },
  cardMetaLight: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryPlay: {
    width: undefined,
    height: undefined,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  secondaryPlayText: { color: '#1a365d', fontSize: 13, fontWeight: '500' },
  messageFootnote: {
    marginTop: 12,
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
