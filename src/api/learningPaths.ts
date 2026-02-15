import { apiRequest } from './client';

export interface LearningPathway {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
  isPublished: boolean;
  stageCount?: number;
  createdBy?: string;
}

export interface PathwayStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  lessons: { id: string; title: string; completed?: boolean }[];
}

export interface PathwayDetail extends LearningPathway {
  stages: PathwayStage[];
}

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
