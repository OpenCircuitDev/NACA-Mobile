/**
 * Elder Workspace — TanStack Query hooks for Phase 1 Elder Education on mobile.
 *
 * Wraps the API client in `../api/elderWorkspace.ts`. Query keys are namespaced
 * under ['elder-workspace', ...] so mutations can invalidate narrowly.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/elderWorkspace';

const KEY = 'elder-workspace';

// ============================================================================
// Reads
// ============================================================================

export function useProtocolTags() {
  return useQuery({
    queryKey: [KEY, 'protocol-tags'],
    queryFn: api.getProtocolTags,
  });
}

export function useReviewQueue(limit = 50) {
  return useQuery({
    queryKey: [KEY, 'review-queue', { limit }],
    queryFn: () => api.getReviewQueue(limit),
  });
}

export function useMyContributions(limit = 50) {
  return useQuery({
    queryKey: [KEY, 'my-contributions', { limit }],
    queryFn: () => api.getMyContributions(limit),
  });
}

export function useMyRecordings(limit = 50) {
  return useQuery({
    queryKey: [KEY, 'my-recordings', { limit }],
    queryFn: () => api.getMyRecordings(limit),
  });
}

export function useMyReviews(limit = 50) {
  return useQuery({
    queryKey: [KEY, 'my-reviews', { limit }],
    queryFn: () => api.getMyReviews(limit),
  });
}

// ============================================================================
// Writes
// ============================================================================

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.submitReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, 'review-queue'] });
      queryClient.invalidateQueries({ queryKey: [KEY, 'my-reviews'] });
    },
  });
}

export function useCreateContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createContribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, 'my-contributions'] });
    },
  });
}

export function useCreateRecording() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createRecording,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY, 'my-recordings'] });
    },
  });
}

export function useUploadAudio() {
  return useMutation({ mutationFn: api.uploadAudio });
}
