export interface UserXP {
  totalXp: number;
  level: number;
  levelTitle?: string;
  xpToNextLevel?: number;
  xpForCurrentLevel?: number;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  criteriaType: string;
  criteriaThreshold: number;
  xpReward: number;
  isHidden: boolean;
  unlockedAt?: string | null;
  progress?: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  profileImageUrl?: string | null;
  totalXp: number;
  level: number;
  rank: number;
}
