/**
 * Canonical API endpoint paths.
 * Used by mobile, TV, and watch apps (via codegen for Swift/Kotlin).
 * Keep in sync — the watchOS codegen script reads this file.
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/mobile/auth/login',
    REGISTER: '/api/mobile/auth/register',
    REFRESH: '/api/mobile/auth/refresh',
    LOGOUT: '/api/mobile/auth/logout',
  },
  DICTIONARY: {
    SEARCH: '/api/connected/learning/dictionary/search',
    ENTRY: (id: string) => `/api/connected/learning/dictionary/entries/${id}`,
    ENTRY_AUDIO: (id: string) => `/api/connected/learning/dictionary/entries/${id}/audio`,
    WORD_OF_DAY: '/api/connected/learning/dictionary/word-of-the-day',
    CATEGORIES: '/api/connected/learning/dictionary/categories',
    STATS: '/api/connected/learning/dictionary/stats',
  },
  GAMIFICATION: {
    XP: (userId: string) => `/api/connected/learning/gamification/users/${userId}/xp`,
    STREAK: (userId: string) => `/api/connected/learning/gamification/users/${userId}/streak`,
    ACHIEVEMENTS: (userId: string) => `/api/connected/learning/gamification/users/${userId}/achievements`,
    LEVEL: (userId: string) => `/api/connected/learning/gamification/users/${userId}/level`,
    LEADERBOARD: '/api/connected/learning/gamification/leaderboard',
    ALL_ACHIEVEMENTS: '/api/connected/learning/gamification/achievements',
  },
  GAME_DATA: {
    LIST: '/api/connected/learning/game-data',
    DATASET: (id: string) => `/api/connected/learning/game-data/${id}`,
  },
  LESSONS: {
    LIST: '/api/connected/learning/lessons',
    DETAIL: (id: string) => `/api/connected/learning/lessons/${id}`,
    COURSES: '/api/connected/lessons/courses',
    COURSE: (id: string) => `/api/connected/lessons/courses/${id}`,
    UNITS: '/api/connected/lessons/units',
    UNIT: (id: string) => `/api/connected/lessons/units/${id}`,
  },
  PATHWAYS: {
    LIST: '/api/connected/learning/pathways/pathways',
    DETAIL: (id: string) => `/api/connected/learning/pathways/pathways/${id}`,
    STRUCTURE: (id: string) => `/api/connected/learning/pathways/pathways/${id}/structure`,
    ENROLL: (userId: string) => `/api/connected/learning/pathways/users/${userId}/enroll`,
    PROGRESS: (userId: string, pathwayId: string) =>
      `/api/connected/learning/pathways/users/${userId}/pathways/${pathwayId}/progress`,
    ENROLLMENTS: (userId: string) => `/api/connected/learning/pathways/users/${userId}/enrollments`,
  },
  PROGRESS: {
    SUMMARY: (userId: string) => `/api/connected/learning/progress/${userId}`,
    RECORD: (userId: string) => `/api/connected/learning/progress/${userId}`,
    HISTORY: (userId: string) => `/api/connected/learning/progress/${userId}/history`,
    LESSON: (userId: string, lessonId: string) =>
      `/api/connected/learning/progress/${userId}/lessons/${lessonId}`,
  },
  MOBILE: {
    COMMUNITIES: '/api/connected/mobile/communities',
    DASHBOARD: (communityId: string) => `/api/connected/mobile/dashboard/${communityId}`,
    NOTIFICATIONS: '/api/connected/mobile/notifications',
  },
  CHAT: {
    CHANNELS: '/api/connected/communications/chat/channels',
    MESSAGES: '/api/connected/communications/chat/messages',
  },
  MEDIA: {
    LIST: '/api/connected/immersion/media',
    ITEM: (id: string) => `/api/connected/immersion/media/${id}`,
  },
  CONTRIBUTIONS: {
    SUBMIT_ENTRY: '/api/connected/learning/dictionary/entries',
    FEEDBACK: '/api/connected/interactive/feedback',
  },
  CULTURAL: {
    KNOWLEDGE: '/api/connected/cultural-knowledge',
    KNOWLEDGE_ITEM: (id: string) => `/api/connected/cultural-knowledge/${id}`,
  },
  SPEAKERS: {
    LIST: '/api/connected/speakers',
    DETAIL: (id: string) => `/api/connected/speakers/${id}`,
  },
  PUSH: {
    REGISTER: '/api/mobile/push/register',
    UNREGISTER: '/api/mobile/push/unregister',
  },
} as const;
