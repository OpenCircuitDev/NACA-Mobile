/**
 * Elder Workspace API client (Phase 1 Elder Education).
 *
 * Wraps the connected endpoints registered at /api/connected/learning/elder-workspace/*
 * on NACA-Core. All requests authenticate via the standard JWT Bearer + X-NACA-Community
 * header that the shared `apiRequest` helper already handles.
 *
 * Requires the authenticated user to have `communityMembership.role` = 'elder' or
 * 'community_administrator' in the active community. Endpoints return 403 NOT_ELDER
 * otherwise.
 */

import { apiRequest } from './client';

// ============================================================================
// Types (mirror server response shapes)
// ============================================================================

export type EnforcementPolicy = 'display_only' | 'soft' | 'hard';

export interface ProtocolTag {
  id: string;
  communityId: string;
  slug: string;
  label: string;
  description: string | null;
  enforcementPolicy: EnforcementPolicy;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PendingContribution {
  id: string;
  communityId: string;
  title: string | null;
  summary: string | null;
}

export interface PendingCulturalKnowledge {
  id: string;
  communityId: string;
  title: string;
  summary: string;
}

export interface PendingVariant {
  id: string;
  entryId: string;
  variantType: string;
  languageText: string;
}

export interface ReviewQueueData {
  contributions: PendingContribution[];
  culturalKnowledge: PendingCulturalKnowledge[];
  dictionaryEntryVariants: PendingVariant[];
}

export type Recommendation = 'approve' | 'reject' | 'needs_changes';
export type ContentType =
  | 'contribution'
  | 'cultural_knowledge'
  | 'dictionary_entry_variant'
  | 'place_name';

export interface ElderReview {
  id: string;
  contentType: ContentType;
  contentId: string;
  reviewerUserId: string;
  communityId: string;
  recommendation: Recommendation;
  commentary: string | null;
  createdAt: string;
  updatedAt: string;
}

// Connected API response envelope
interface PackageResponse<T> {
  data: T;
  hasSubscription: boolean;
  // ...other envelope fields (omitted for brevity)
}

// ============================================================================
// Reads
// ============================================================================

export async function getProtocolTags(): Promise<ProtocolTag[]> {
  const res = await apiRequest<PackageResponse<ProtocolTag[]>>(
    'GET',
    '/api/connected/learning/elder-workspace/protocol-tags',
  );
  return res.data ?? [];
}

export async function getReviewQueue(limit = 50): Promise<ReviewQueueData> {
  const res = await apiRequest<PackageResponse<ReviewQueueData>>(
    'GET',
    `/api/connected/learning/elder-workspace/review-queue?limit=${limit}`,
  );
  return (
    res.data ?? {
      contributions: [],
      culturalKnowledge: [],
      dictionaryEntryVariants: [],
    }
  );
}

export async function getMyContributions(limit = 50): Promise<any[]> {
  const res = await apiRequest<PackageResponse<any[]>>(
    'GET',
    `/api/connected/learning/elder-workspace/my-contributions?limit=${limit}`,
  );
  return res.data ?? [];
}

export async function getMyRecordings(limit = 50): Promise<any[]> {
  const res = await apiRequest<PackageResponse<any[]>>(
    'GET',
    `/api/connected/learning/elder-workspace/my-recordings?limit=${limit}`,
  );
  return res.data ?? [];
}

export async function getMyReviews(limit = 50): Promise<ElderReview[]> {
  const res = await apiRequest<PackageResponse<ElderReview[]>>(
    'GET',
    `/api/connected/learning/elder-workspace/my-reviews?limit=${limit}`,
  );
  return res.data ?? [];
}

// ============================================================================
// Writes
// ============================================================================

export interface SubmitReviewInput {
  contentType: ContentType;
  contentId: string;
  recommendation: Recommendation;
  commentary?: string;
}

export async function submitReview(input: SubmitReviewInput): Promise<ElderReview> {
  const res = await apiRequest<PackageResponse<ElderReview>>(
    'POST',
    '/api/connected/learning/elder-workspace/reviews',
    input,
  );
  return res.data;
}

export interface CreateContributionInput {
  type?: 'new' | 'update';
  submissionType?: 'entry' | 'phrase';
  englishText?: string;
  indigenousText?: string;
  teachingNote?: string;
  culturalProtocol?: string;
  seasonalContext?: string;
  sensitivity?: 'public' | 'restricted' | 'sacred';
  audience?: 'everyone' | 'community_members_only' | 'role_restricted';
  protocolTagIds?: string[];
  proposedData?: Record<string, unknown>;
}

export async function createContribution(input: CreateContributionInput): Promise<any> {
  const res = await apiRequest<PackageResponse<any>>(
    'POST',
    '/api/connected/learning/elder-workspace/contributions',
    input,
  );
  return res.data;
}

export interface CreateRecordingInput {
  entryId: string;
  languageText: string;
  pronunciationKey?: string;
  literalTranslation?: string;
  notes?: string;
  audioMediaId?: string;
  protocolTagIds?: string[];
}

export async function createRecording(input: CreateRecordingInput): Promise<any> {
  const res = await apiRequest<PackageResponse<any>>(
    'POST',
    '/api/connected/learning/elder-workspace/recordings',
    input,
  );
  return res.data;
}

// ============================================================================
// Audio upload
// ============================================================================

export interface AudioUploadResult {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
}

export interface AudioUploadInput {
  fileName: string;
  mimeType: string;
  /** Base64-encoded audio data. */
  fileData: string;
}

/**
 * Uploads an audio recording to NACA-Core and returns the media id.
 * Throws if the backend storage isn't configured (e.g., local dev without GCS) —
 * the calling screen should catch and fall back to text-only submission.
 */
export async function uploadAudio(input: AudioUploadInput): Promise<AudioUploadResult> {
  const res = await apiRequest<PackageResponse<AudioUploadResult>>(
    'POST',
    '/api/connected/learning/elder-workspace/upload-audio',
    input,
  );
  return res.data;
}
