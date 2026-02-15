import { apiRequest } from './client';

export async function getLessons() {
  return apiRequest('GET', '/api/connected/learning/lessons');
}

export async function getLessonDetail(lessonId: string) {
  return apiRequest('GET', `/api/connected/learning/lessons/${lessonId}`);
}

export async function getGameData() {
  return apiRequest('GET', '/api/connected/learning/game-data');
}

export async function getGameDataset(datasetId: string) {
  return apiRequest('GET', `/api/connected/learning/game-data/${datasetId}`);
}

export async function getLearningPaths() {
  return apiRequest('GET', '/api/connected/learning/pathways/pathways');
}

export async function getLearningPathDetail(pathId: string) {
  return apiRequest('GET', `/api/connected/learning/pathways/pathways/${pathId}`);
}

export async function recordProgress(userId: string, data: any) {
  return apiRequest('POST', `/api/connected/learning/progress/${userId}`, data);
}
