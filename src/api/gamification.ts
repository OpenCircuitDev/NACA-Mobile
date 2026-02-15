import { apiRequest } from './client';

export async function getUserXP(userId: string) {
  return apiRequest('GET', `/api/connected/learning/gamification/users/${userId}/xp`);
}

export async function getUserStreak(userId: string) {
  return apiRequest('GET', `/api/connected/learning/gamification/users/${userId}/streak`);
}

export async function getUserAchievements(userId: string) {
  return apiRequest('GET', `/api/connected/learning/gamification/users/${userId}/achievements`);
}

export async function getLeaderboard() {
  return apiRequest('GET', `/api/connected/learning/gamification/leaderboard`);
}

export async function getAllAchievements() {
  return apiRequest('GET', `/api/connected/learning/gamification/achievements`);
}
