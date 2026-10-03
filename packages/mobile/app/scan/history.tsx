import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getScanHistory,
  clearHistory,
  type HistoryItem,
} from '../../src/services/scanCache';

/**
 * Scan History — Phase 2.6.
 *
 * Read-only list of the last 50 QR scans on this device. Tapping an entry
 * re-opens the result screen (which hits the offline cache for an instant
 * load without re-scanning).
 *
 * v1: history is per-device, not synced. Clear-all button at the top.
 * Useful for kids reviewing the day's classroom labels at home.
 */
export default function ScanHistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      (async () => {
        const items = await getScanHistory();
        if (!cancelled) {
          setHistory(items);
          setIsLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleClear = () => {
    Alert.alert(
      'Clear scan history?',
      'This removes all entries from this device. The QR codes themselves are not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {history.length} scan{history.length === 1 ? '' : 's'} on this device
        </Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClear} testID="button-clear-history">
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? null : history.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptySubtitle}>
              Scanned QR codes appear here so you can replay them later without scanning again.
            </Text>
          </View>
        ) : (
          history.map((item) => (
            <TouchableOpacity
              key={`${item.qrId}-${item.scannedAt}`}
              style={styles.item}
              onPress={() => router.push(`/scan/result?qrId=${encodeURIComponent(item.qrId)}`)}
              testID={`history-item-${item.qrId}`}
            >
              <View
                style={[
                  styles.itemIcon,
                  { backgroundColor: item.found ? '#dbeafe' : '#fef3c7' },
                ]}
              >
                <Ionicons
                  name={item.found ? 'qr-code' : 'help-circle-outline'}
                  size={20}
                  color={item.found ? '#1a365d' : '#92400e'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.summary}
                </Text>
                <Text style={styles.itemMeta}>
                  <Text style={styles.code}>{item.qrId}</Text>
                  {' · '}
                  {formatRelativeTime(item.scannedAt)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function formatRelativeTime(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: { fontSize: 14, color: '#6b7280' },
  clearText: { color: '#dc2626', fontWeight: '600', fontSize: 14 },
  content: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 12 },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  code: { fontFamily: 'Menlo', color: '#1a365d' },
});
