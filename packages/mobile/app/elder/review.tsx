import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../src/contexts/CommunityContext';
import { useReviewQueue, useSubmitReview } from '../../src/hooks/useElderWorkspace';
import type {
  ContentType,
  Recommendation,
  PendingContribution,
  PendingCulturalKnowledge,
  PendingVariant,
} from '../../src/api/elderWorkspace';

/**
 * Elder Review Queue screen — Phase 1 mobile.
 *
 * Shows three sections: Contributions, Cultural Knowledge, Elder Recordings (variants).
 * Each item expands to reveal a commentary textbox + three recommendation buttons:
 * Approve / Needs changes / Reject. Submitting records the review server-side; the
 * CA sees the commentary inline on their web approval queue and uses it as input
 * to their final decision.
 *
 * Elder input is ADVISORY, not authoritative. The screen makes this explicit
 * with a banner so Elders understand their commentary doesn't auto-approve.
 *
 * Elder-friendly UX: large touch targets, larger body text, audio-first
 * stays in record/author screens — this screen is text-based commentary.
 */

type AnyQueueItem =
  | (PendingContribution & { _kind: 'contribution' })
  | (PendingCulturalKnowledge & { _kind: 'cultural_knowledge' })
  | (PendingVariant & { _kind: 'dictionary_entry_variant' });

function contentTypeOf(item: AnyQueueItem): ContentType {
  if (item._kind === 'contribution') return 'contribution';
  if (item._kind === 'cultural_knowledge') return 'cultural_knowledge';
  return 'dictionary_entry_variant';
}

function titleOf(item: AnyQueueItem): string {
  if (item._kind === 'contribution') {
    return item.title ?? '(untitled contribution)';
  }
  if (item._kind === 'cultural_knowledge') {
    return item.title;
  }
  return item.languageText;
}

function summaryOf(item: AnyQueueItem): string | null {
  if (item._kind === 'contribution') return item.summary;
  if (item._kind === 'cultural_knowledge') return item.summary;
  return `Recording on entry ${item.entryId}`;
}

function iconOf(item: AnyQueueItem): keyof typeof Ionicons.glyphMap {
  if (item._kind === 'contribution') return 'document-text-outline';
  if (item._kind === 'cultural_knowledge') return 'book-outline';
  return 'mic-outline';
}

export default function ElderReviewScreen() {
  const { activeCommunity } = useCommunity();
  const role = (activeCommunity as any)?.role;
  const hasAccess = role === 'elder' || role === 'community_administrator';

  const queue = useReviewQueue();
  const submitReview = useSubmitReview();

  // Local UI state: which item is expanded for commentary
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentary, setCommentary] = useState('');

  if (!hasAccess) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={64} color="#9ca3af" />
        <Text style={styles.bodyText}>You don't have Elder access in this community.</Text>
      </View>
    );
  }

  if (queue.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a365d" />
      </View>
    );
  }

  const allItems: AnyQueueItem[] = [
    ...(queue.data?.contributions ?? []).map((c) => ({ ...c, _kind: 'contribution' as const })),
    ...(queue.data?.culturalKnowledge ?? []).map((c) => ({
      ...c,
      _kind: 'cultural_knowledge' as const,
    })),
    ...(queue.data?.dictionaryEntryVariants ?? []).map((v) => ({
      ...v,
      _kind: 'dictionary_entry_variant' as const,
    })),
  ];

  const expandItem = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setCommentary('');
  };

  const handleSubmit = async (item: AnyQueueItem, recommendation: Recommendation) => {
    try {
      await submitReview.mutateAsync({
        contentType: contentTypeOf(item),
        contentId: item.id,
        recommendation,
        commentary: commentary.trim() || undefined,
      });
      setExpandedId(null);
      setCommentary('');
      Alert.alert('Review submitted', 'Thank you. The community administrator will see your commentary when deciding.');
    } catch (err: any) {
      Alert.alert('Submit failed', err?.message ?? 'Could not submit review. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={queue.isRefetching} onRefresh={() => queue.refetch()} />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.advisoryBanner}>
          <Ionicons name="information-circle" size={20} color="#1a365d" />
          <Text style={styles.advisoryText}>
            Your reviews are <Text style={styles.bold}>advisory</Text>. The community
            administrator sees your commentary and makes the final approval decision.
          </Text>
        </View>

        {allItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#10b981" />
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptySubtitle}>
              Nothing is waiting for your review right now. Pull down to refresh.
            </Text>
          </View>
        ) : (
          allItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View key={`${item._kind}-${item.id}`} style={styles.itemCard}>
                <TouchableOpacity
                  style={styles.itemHeader}
                  onPress={() => expandItem(item.id)}
                  activeOpacity={0.7}
                  testID={`review-item-${item.id}`}
                >
                  <View style={styles.itemIcon}>
                    <Ionicons name={iconOf(item)} size={24} color="#1a365d" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {titleOf(item)}
                    </Text>
                    {summaryOf(item) && (
                      <Text style={styles.itemSummary} numberOfLines={isExpanded ? undefined : 2}>
                        {summaryOf(item)}
                      </Text>
                    )}
                    <Text style={styles.itemKind}>{item._kind.replace(/_/g, ' ')}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.itemExpansion}>
                    <Text style={styles.label}>Your commentary (optional but helpful)</Text>
                    <TextInput
                      style={styles.textArea}
                      multiline
                      numberOfLines={4}
                      placeholder="Add cultural or linguistic context for the community administrator…"
                      placeholderTextColor="#9ca3af"
                      value={commentary}
                      onChangeText={setCommentary}
                      testID={`input-commentary-${item.id}`}
                    />

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionApprove]}
                        disabled={submitReview.isPending}
                        onPress={() => handleSubmit(item, 'approve')}
                        testID={`button-approve-${item.id}`}
                      >
                        <Ionicons name="thumbs-up-outline" size={16} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionNeedsChanges]}
                        disabled={submitReview.isPending}
                        onPress={() => handleSubmit(item, 'needs_changes')}
                        testID={`button-needs-changes-${item.id}`}
                      >
                        <Ionicons name="create-outline" size={16} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Needs changes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionReject]}
                        disabled={submitReview.isPending}
                        onPress={() => handleSubmit(item, 'reject')}
                        testID={`button-reject-${item.id}`}
                      >
                        <Ionicons name="thumbs-down-outline" size={16} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.advisoryFootnote}>
                      Submitting records your recommendation. The administrator will see it on
                      their approval queue. You can update your review by submitting again.
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  bodyText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginTop: 12,
  },
  bold: { fontWeight: '700' },
  advisoryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  advisoryText: {
    flex: 1,
    fontSize: 13,
    color: '#1a365d',
    marginLeft: 8,
    lineHeight: 18,
  },
  advisoryFootnote: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 10,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemSummary: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  itemKind: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemExpansion: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#111827',
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionApprove: { backgroundColor: '#059669' },
  actionNeedsChanges: { backgroundColor: '#c4a35a' },
  actionReject: { backgroundColor: '#dc2626' },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
});
