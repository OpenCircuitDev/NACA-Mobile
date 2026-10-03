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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCommunity } from '../../src/contexts/CommunityContext';
import {
  useProtocolTags,
  useCreateContribution,
} from '../../src/hooks/useElderWorkspace';
import type { ProtocolTag } from '../../src/api/elderWorkspace';

/**
 * Elder Author screen — author a new teaching / contribution.
 *
 * The form mirrors the cultural-protocol-aware contribution schema:
 *   - English text + Indigenous text (the teaching itself)
 *   - Teaching note (Elder's guidance for how this teaches)
 *   - Cultural protocol freeform + seasonal context freeform (legacy fields)
 *   - Sensitivity (fixed-core: public / restricted / sacred)
 *   - Audience (fixed-core: everyone / community_members_only / role_restricted)
 *   - Protocol tags (per-community vocabulary, multi-select)
 *
 * Submission goes to POST /api/connected/learning/elder-workspace/contributions
 * and lands in the CA approval queue with caApprovalStatus='pending'.
 */

type Sensitivity = 'public' | 'restricted' | 'sacred';
type Audience = 'everyone' | 'community_members_only' | 'role_restricted';

const SENSITIVITY_OPTIONS: { value: Sensitivity; label: string; hint: string }[] = [
  { value: 'public', label: 'Public', hint: 'Anyone can view' },
  { value: 'restricted', label: 'Restricted', hint: 'Soft gate — viewer must acknowledge' },
  { value: 'sacred', label: 'Sacred', hint: 'Hidden from non-Elders/CAs' },
];

const AUDIENCE_OPTIONS: { value: Audience; label: string; hint: string }[] = [
  { value: 'everyone', label: 'Everyone', hint: 'No audience restriction' },
  { value: 'community_members_only', label: 'Community members only', hint: 'Hidden from non-members' },
  { value: 'role_restricted', label: 'Role-restricted', hint: 'Elders + CAs only' },
];

function SegmentedPicker<T extends string>({
  options,
  value,
  onChange,
  testIDPrefix,
}: {
  options: { value: T; label: string; hint: string }[];
  value: T;
  onChange: (v: T) => void;
  testIDPrefix: string;
}) {
  return (
    <View style={styles.segmentGroup}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(opt.value)}
            testID={`${testIDPrefix}-${opt.value}`}
          >
            <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
              {opt.label}
            </Text>
            <Text style={[styles.segmentHint, active && styles.segmentHintActive]}>
              {opt.hint}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ProtocolTagPicker({
  tags,
  selectedIds,
  onToggle,
}: {
  tags: ProtocolTag[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  if (tags.length === 0) {
    return (
      <Text style={styles.helpText}>
        No community-specific protocol tags defined yet. Ask your Community Administrator
        to set up the vocabulary if you need to tag this teaching with seasonal or ceremonial protocols.
      </Text>
    );
  }
  return (
    <View style={styles.tagWrap}>
      {tags.map((tag) => {
        const selected = selectedIds.includes(tag.id);
        const policy = tag.enforcementPolicy;
        return (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tagChip,
              selected && styles.tagChipSelected,
              policy === 'hard' && selected && styles.tagChipHard,
            ]}
            onPress={() => onToggle(tag.id)}
            testID={`tag-chip-${tag.slug}`}
          >
            <Text style={[styles.tagChipText, selected && styles.tagChipTextSelected]}>
              {tag.label}
            </Text>
            <Text style={[styles.tagChipPolicy, selected && styles.tagChipPolicySelected]}>
              {policy}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ElderAuthorScreen() {
  const { activeCommunity } = useCommunity();
  const role = (activeCommunity as any)?.role;
  const hasAccess = role === 'elder' || role === 'community_administrator';

  const protocolTags = useProtocolTags();
  const createContribution = useCreateContribution();

  // Form state
  const [englishText, setEnglishText] = useState('');
  const [indigenousText, setIndigenousText] = useState('');
  const [teachingNote, setTeachingNote] = useState('');
  const [culturalProtocol, setCulturalProtocol] = useState('');
  const [seasonalContext, setSeasonalContext] = useState('');
  const [sensitivity, setSensitivity] = useState<Sensitivity>('public');
  const [audience, setAudience] = useState<Audience>('everyone');
  const [protocolTagIds, setProtocolTagIds] = useState<string[]>([]);

  if (!hasAccess) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={64} color="#9ca3af" />
        <Text style={styles.bodyTextCentered}>You don't have Elder access in this community.</Text>
      </View>
    );
  }

  const canSubmit =
    (englishText.trim().length > 0 || indigenousText.trim().length > 0) &&
    !createContribution.isPending;

  const toggleTag = (id: string) => {
    setProtocolTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Add at least one text field', 'Provide English text or Indigenous text before submitting.');
      return;
    }
    try {
      await createContribution.mutateAsync({
        type: 'new',
        submissionType: 'phrase',
        englishText: englishText.trim() || undefined,
        indigenousText: indigenousText.trim() || undefined,
        teachingNote: teachingNote.trim() || undefined,
        culturalProtocol: culturalProtocol.trim() || undefined,
        seasonalContext: seasonalContext.trim() || undefined,
        sensitivity,
        audience,
        protocolTagIds,
        proposedData: {},
      });
      Alert.alert(
        'Teaching submitted',
        'Your teaching is now in your community administrator\'s approval queue. They\'ll review your commentary and any Elder reviews before approving.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert('Submit failed', err?.message ?? 'Could not submit. Please try again.');
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.advisoryBanner}>
          <Ionicons name="information-circle" size={20} color="#1a365d" />
          <Text style={styles.advisoryText}>
            Your teaching submission goes to your Community Administrator's approval queue.
            Other Elders may add commentary before it's approved.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>YOUR TEACHING</Text>

        <View style={styles.field}>
          <Text style={styles.label}>English text</Text>
          <TextInput
            style={styles.input}
            value={englishText}
            onChangeText={setEnglishText}
            placeholder="The teaching, in English"
            placeholderTextColor="#9ca3af"
            multiline
            testID="input-english"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Indigenous text</Text>
          <TextInput
            style={styles.input}
            value={indigenousText}
            onChangeText={setIndigenousText}
            placeholder="The teaching, in your community's language"
            placeholderTextColor="#9ca3af"
            multiline
            testID="input-indigenous"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Teaching note</Text>
          <Text style={styles.fieldHint}>How should this be taught? Context, story, audience.</Text>
          <TextInput
            style={[styles.input, styles.inputTall]}
            value={teachingNote}
            onChangeText={setTeachingNote}
            placeholder="When I share this teaching, I tell people…"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={5}
            testID="input-teaching-note"
          />
        </View>

        <Text style={styles.sectionLabel}>CULTURAL PROTOCOL</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Sensitivity</Text>
          <SegmentedPicker
            options={SENSITIVITY_OPTIONS}
            value={sensitivity}
            onChange={setSensitivity}
            testIDPrefix="sensitivity"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Audience</Text>
          <SegmentedPicker
            options={AUDIENCE_OPTIONS}
            value={audience}
            onChange={setAudience}
            testIDPrefix="audience"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Community protocol tags</Text>
          <Text style={styles.fieldHint}>Tap to apply any tags your community has defined for this kind of teaching.</Text>
          {protocolTags.isLoading ? (
            <ActivityIndicator color="#1a365d" />
          ) : (
            <ProtocolTagPicker
              tags={protocolTags.data ?? []}
              selectedIds={protocolTagIds}
              onToggle={toggleTag}
            />
          )}
        </View>

        <Text style={styles.sectionLabel}>OPTIONAL CONTEXT</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Cultural protocol notes (freeform)</Text>
          <TextInput
            style={styles.input}
            value={culturalProtocol}
            onChangeText={setCulturalProtocol}
            placeholder="Additional notes about cultural protocol"
            placeholderTextColor="#9ca3af"
            multiline
            testID="input-cultural-protocol"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Seasonal context</Text>
          <TextInput
            style={styles.input}
            value={seasonalContext}
            onChangeText={setSeasonalContext}
            placeholder="When during the year is this appropriate?"
            placeholderTextColor="#9ca3af"
            multiline
            testID="input-seasonal-context"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          disabled={!canSubmit}
          onPress={handleSubmit}
          testID="button-submit"
        >
          {createContribution.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={18} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit teaching</Text>
            </>
          )}
        </TouchableOpacity>
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
  advisoryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  advisoryText: {
    flex: 1,
    fontSize: 13,
    color: '#1a365d',
    marginLeft: 8,
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 12,
  },
  field: { marginBottom: 16 },
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
  inputTall: { minHeight: 110 },
  segmentGroup: { gap: 8 },
  segment: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
  },
  segmentActive: {
    borderColor: '#1a365d',
    backgroundColor: '#dbeafe',
  },
  segmentLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  segmentLabelActive: { color: '#1a365d' },
  segmentHint: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  segmentHintActive: { color: '#1e40af' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagChipSelected: {
    backgroundColor: '#1a365d',
    borderColor: '#1a365d',
  },
  tagChipHard: {
    backgroundColor: '#7c1d1d',
    borderColor: '#7c1d1d',
  },
  tagChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  tagChipTextSelected: { color: '#ffffff' },
  tagChipPolicy: {
    fontSize: 10,
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  tagChipPolicySelected: { color: '#dbeafe' },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a365d',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  submitButtonDisabled: { backgroundColor: '#9ca3af' },
  submitButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
});
