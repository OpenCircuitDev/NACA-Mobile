// Types
export type { ApiResponse, PaginatedResponse, PackageResponse } from './types/api';
export type { AuthUser, AuthResponse } from './types/auth';
export type { DictionaryEntry, DictionarySearchResult, WordOfDay } from './types/dictionary';
export type { UserXP, UserStreak, Achievement, LeaderboardEntry } from './types/gamification';
export type { Course, Unit, Lesson, LessonItem } from './types/lessons';
export type { LearningPathway, PathwayStage, PathwayDetail } from './types/learningPaths';
export type { Community, DashboardData } from './types/communities';
export type { Notification } from './types/notifications';
export type { ProgressEvent, ProgressSummary } from './types/progress';
export type { MediaItem } from './types/media';
export type { ChatChannel, ChatMessage } from './types/chat';
export type { DictionaryEntrySubmission } from './types/contributions';
export type { GameItem, GameDataset } from './types/games';

// Constants
export { APP_NAME, APP_VERSION } from './constants/config';
export { ENDPOINTS } from './constants/endpoints';

// Theme
export { colors } from './theme/colors';
export { typography } from './theme/typography';
export { spacing, borderRadius } from './theme/spacing';
