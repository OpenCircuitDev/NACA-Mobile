export interface ProgressEvent {
  eventType: string;
  sourceType: string;
  sourceId: string;
  data?: Record<string, any>;
  score?: number;
  xpEarned?: number;
  timeSpentSeconds?: number;
  sessionId?: string;
}

export interface ProgressSummary {
  xp: number;
  level: number;
  streak: number;
  achievements: number;
  lessonsCompleted: number;
}
