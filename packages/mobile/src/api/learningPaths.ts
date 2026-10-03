import { apiRequest } from './client';
import type { LearningPathway, PathwayDetail } from '@naca/shared';
export type { LearningPathway, PathwayStage, PathwayDetail } from '@naca/shared';

export async function getLearningPathways() {
  return apiRequest<{ data: LearningPathway[] }>('GET', '/api/connected/learning/pathways/pathways');
}

export async function getLearningPathwayDetail(pathwayId: string) {
  return apiRequest<{ data: PathwayDetail }>('GET', `/api/connected/learning/pathways/pathways/${pathwayId}`);
}

export async function getLearningPathwayStructure(pathwayId: string) {
  return apiRequest<{ data: PathwayDetail }>('GET', `/api/connected/learning/pathways/pathways/${pathwayId}/structure`);
}

export async function enrollInPathway(userId: string, pathwayId: string) {
  return apiRequest('POST', `/api/connected/learning/pathways/users/${userId}/enroll`, { pathwayId });
}

export async function getPathwayProgress(userId: string, pathwayId: string) {
  return apiRequest('GET', `/api/connected/learning/pathways/users/${userId}/pathways/${pathwayId}/progress`);
}

export async function getUserEnrollments(userId: string) {
  return apiRequest('GET', `/api/connected/learning/pathways/users/${userId}/enrollments`);
}
