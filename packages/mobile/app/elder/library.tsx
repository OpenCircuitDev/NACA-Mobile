import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../src/contexts/CommunityContext';
import {
  useMyContributions,
  useMyRecordings,
  useMyReviews,
} from '../../src/hooks/useElderWorkspace';

/**
 * Elder Library — read-only history of the Elder's own work.
 *
 * Three tabs:
 *   - My Teachings (contributions)
 *   - My Recordings (elder_speech variants)
 *   - My Reviews (commentary I've left)
 *
 * Each item shows status (pending / approved / etc.) so the Elder can see at
 * a glance what's still working its way through the CA approval flow.
 */

type Tab = 'contributions' | 'recordings' | 'reviews';

const TAB_CONFIG: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'contributions', label: 'Teachings', icon: 'document-text-outline' },
  { id: 'recordings', label: 'Recordings', icon: 'mic-outline' },
  { id: 'reviews', label: 'Reviews', icon: 'chatbox-outline' },
];

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = status ?? 'pending';
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
    approved: { bg: '#d1fae5', text: '#065f46', label: 'Approved' },
    rejected: { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
    withdrawn: { bg: '#f3f4f6', text: '#374151', label: 'Withdrawn' },
  };
  const c = config[s] ?? config.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    approve: { bg: '#d1fae5', text: '#065f46', label: 'Approved' },
    needs_changes: { bg: '#fef3c7', text: '#92400e', label: 'Needs changes' },
    reject: { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
  };
  const c = config[recommendation] ?? config.approve;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

export default function ElderLibraryScreen() {
  const { activeCommunity } = useCommunity();
  const role = (activeCommunity as any)?.role;
  const hasAccess = role === 'elder' || role === 'community_administrator';

  const [activeTab, setActiveTab] = useState<Tab>('contributions');

  const contributions = useMyContributions();
  const recordings = useMyRecordings();
  const reviews = useMyReviews();

  if (!hasAccess) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={64} color="#9ca3af" />
        <Text style={styles.bodyText}>You don't have Elder access in this community.</Text>
      </View>
    );
  }

  const current =
    activeTab === 'contributions'
      ? contributions
      : activeTab === 'recordings'
        ? recordings
        : reviews;

  const refreshing =
    contributions.isRefetching || recordings.isRefetching || reviews.isRefetching;

  const onRefresh = () => {
    contributions.refetch();
    recordings.refetch();
    reviews.refetch();
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
              testID={`tab-${tab.id}`}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? '#1a365d' : '#6b7280'}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {current.isLoading ? (
          <ActivityIndicator size="large" color="#1a365d" style={{ marginTop: 32 }} />
        ) : !current.data || current.data.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name={
                activeTab === 'contributions'
                  ? 'document-text-outline'
                  : activeTab === 'recordings'
                    ? 'mic-outline'
                    : 'chatbox-outline'
              }
              size={64}
              color="#9ca3af"
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'contributions'
                ? 'No teachings yet'
                : activeTab === 'recordings'
                  ? 'No recordings yet'
                  : 'No reviews yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'contributions'
                ? 'Author teachings will appear here once you submit them.'
                : activeTab === 'recordings'
                  ? 'Recordings will appear here once you submit them.'
                  : 'Your commentary on community submissions will appear here.'}
            </Text>
          </View>
        ) : (
          (current.data as any[]).map((item) => {
            if (activeTab === 'contributions') {
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.englishText ?? item.indigenousText ?? '(untitled)'}
                    </Text>
                    <StatusBadge status={item.caApprovalStatus} />
                  </View>
                  {item.teachingNote && (
                    <Text style={styles.cardBody} numberOfLines={3}>
                      {item.teachingNote}
                    </Text>
                  )}
                  {item.sensitivity && item.sensitivity !== 'public' && (
                    <Text style={styles.cardMeta}>
                      sensitivity: <Text style={styles.bold}>{item.sensitivity}</Text>
                    </Text>
                  )}
                </View>
              );
            }
            if (activeTab === 'recordings') {
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.languageText}
                    </Text>
                    <StatusBadge status={item.caApprovalStatus} />
                  </View>
                  <Text style={styles.cardMeta}>
                    On entry <Text style={styles.code}>{item.entryId}</Text>
                  </Text>
                  {item.pronunciationKey && (
                    <Text style={styles.cardMeta}>
                      pronunciation: {item.pronunciationKey}
                    </Text>
                  )}
                </View>
              );
            }
            // reviews
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    On {item.contentType.replace(/_/g, ' ')}
                  </Text>
                  <RecommendationBadge recommendation={item.recommendation} />
                </View>
                {item.commentary && (
                  <Text style={styles.cardBody} numberOfLines={4}>
                    {item.commentary}
                  </Text>
                )}
                <Text style={styles.cardMeta}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  bodyText: { fontSize: 16, color: '#374151', textAlign: 'center', marginTop: 12 },
  bold: { fontWeight: '600' },
  code: {
    fontFamily: 'Menlo',
    fontSize: 12,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#1a365d' },
  tabLabel: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  tabLabelActive: { color: '#1a365d', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111827' },
  cardBody: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 6 },
  cardMeta: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
