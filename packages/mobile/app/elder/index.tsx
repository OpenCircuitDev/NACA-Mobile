import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../src/contexts/CommunityContext';
import { useReviewQueue, useMyContributions, useMyRecordings } from '../../src/hooks/useElderWorkspace';

/**
 * Elder Education Dashboard — Phase 1 mobile entry.
 *
 * Shows the Elder a high-level overview of their workspace:
 *   - Items pending their review (clickable card to /elder/review)
 *   - Their own contributions count
 *   - Their own recordings count
 *
 * Gated to users whose active-community role is 'elder' or 'community_administrator'.
 * Other users see a "no access" message rather than the dashboard.
 *
 * Elder-friendly UX: large fonts, large touch targets, audio-first, simplified nav.
 * Matches the existing Elder workspace persona pattern (large fonts, generous spacing,
 * no animations).
 */
export default function ElderDashboardScreen() {
  const { activeCommunity, isLoading: communityLoading } = useCommunity();
  const role = (activeCommunity as any)?.role;
  const hasAccess = role === 'elder' || role === 'community_administrator';

  const reviewQueue = useReviewQueue();
  const myContributions = useMyContributions();
  const myRecordings = useMyRecordings();

  if (communityLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  if (!activeCommunity) {
    return (
      <View style={styles.centered}>
        <Text style={styles.bodyText}>No community selected.</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={64} color="#9ca3af" />
        <Text style={styles.headingText}>Elder Education access</Text>
        <Text style={styles.bodyText}>
          The Elder Education environment is for users with the Elder role in their community.
          If you should have access, please ask a Community Administrator to add you.
        </Text>
      </View>
    );
  }

  const pendingTotal =
    (reviewQueue.data?.contributions.length ?? 0) +
    (reviewQueue.data?.culturalKnowledge.length ?? 0) +
    (reviewQueue.data?.dictionaryEntryVariants.length ?? 0);

  const refreshing =
    reviewQueue.isRefetching || myContributions.isRefetching || myRecordings.isRefetching;

  const onRefresh = () => {
    reviewQueue.refetch();
    myContributions.refetch();
    myRecordings.refetch();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerCard}>
        <Ionicons name="people-circle" size={48} color="#1a365d" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.welcomeText}>Welcome to your</Text>
          <Text style={styles.headingText}>Elder Workspace</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>YOUR WORK</Text>

      {/* Pending review queue card — primary action */}
      <TouchableOpacity
        style={[styles.card, pendingTotal > 0 && styles.cardEmphasized]}
        onPress={() => router.push('/elder/review')}
        activeOpacity={0.7}
        testID="card-review-queue"
      >
        <View style={styles.cardIcon}>
          <Ionicons name="time-outline" size={32} color="#1a365d" />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Review queue</Text>
          <Text style={styles.cardSubtitle}>
            {reviewQueue.isLoading
              ? 'Loading…'
              : pendingTotal === 0
                ? 'Nothing pending right now'
                : `${pendingTotal} item${pendingTotal === 1 ? '' : 's'} awaiting your review`}
          </Text>
        </View>
        {pendingTotal > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingTotal}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>CREATE</Text>

      {/* Author a new teaching */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/elder/author')}
        activeOpacity={0.7}
        testID="card-author"
      >
        <View style={styles.cardIcon}>
          <Ionicons name="document-text-outline" size={32} color="#c4a35a" />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Author a teaching</Text>
          <Text style={styles.cardSubtitle}>
            Submit a new teaching with cultural protocol metadata
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>

      {/* Record audio */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/elder/record')}
        activeOpacity={0.7}
        testID="card-record"
      >
        <View style={styles.cardIcon}>
          <Ionicons name="mic-outline" size={32} color="#059669" />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>Record pronunciation</Text>
          <Text style={styles.cardSubtitle}>
            Capture an elder_speech variant on a dictionary entry
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>HISTORY</Text>

      {/* My library — read-only history */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/elder/library')}
        activeOpacity={0.7}
        testID="card-library"
      >
        <View style={styles.cardIcon}>
          <Ionicons name="library-outline" size={32} color="#7c3aed" />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>My library</Text>
          <Text style={styles.cardSubtitle}>
            {myContributions.isLoading || myRecordings.isLoading
              ? 'Loading…'
              : `${myContributions.data?.length ?? 0} teaching${(myContributions.data?.length ?? 0) === 1 ? '' : 's'} · ${myRecordings.data?.length ?? 0} recording${(myRecordings.data?.length ?? 0) === 1 ? '' : 's'}`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
      </TouchableOpacity>

      <View style={styles.helpCard}>
        <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
        <Text style={styles.helpText}>
          Your reviews are advisory. The final approval is made by your community's
          administrator. Your commentary helps them understand the cultural context.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9fafb',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  headingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a365d',
  },
  bodyText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 280,
    lineHeight: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardEmphasized: {
    borderLeftWidth: 4,
    borderLeftColor: '#c4a35a',
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  disabledText: {
    color: '#9ca3af',
  },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#c4a35a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginRight: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3f4f6',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    marginLeft: 10,
    lineHeight: 18,
  },
});
