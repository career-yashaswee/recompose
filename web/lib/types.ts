export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  location?: string;
  birthday?: Date;
  summary?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  leetcodeId?: string;
  work?: string;
  education?: string;
  technicalSkills: string[];
  timezone?: string;
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Session {
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
  };
}

export interface UserDisplayData {
  name: string;
  email: string;
  avatar: string;
}

export interface Composition {
  id: string;
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

export interface CompositionProgress {
  id: string;
  userId: string;
  compositionId: string;
  status: 'SOLVED' | 'ATTEMPTING' | 'UNSOLVED';
  updatedAt: Date;
}

export interface CompositionCompletion {
  id: string;
  userId: string;
  compositionId: string;
  dateKey: string;
  completedAt: Date;
}

export interface CompositionFavorite {
  id: string;
  userId: string;
  compositionId: string;
  createdAt: Date;
}

export interface CompositionReaction {
  id: string;
  userId: string;
  compositionId: string;
  value: 'LIKE' | 'DISLIKE';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPoint {
  id: string;
  userId: string;
  points: number;
  reason: string;
  category: 'COMPOSITION_COMPLETE' | 'DAILY_STREAK' | 'WEEKLY_STREAK' | 'MONTHLY_STREAK' | 'FIRST_COMPLETION' | 'DIFFICULTY_BONUS' | 'ACHIEVEMENT';
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  criteria: Record<string, unknown>;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  category: 'COMPOSITION' | 'ENGAGEMENT' | 'STREAK' | 'ACHIEVEMENT';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  isEarned: boolean;
  progress: number;
  earnedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BadgeCriteria {
  id: string;
  badgeId: string;
  type: string;
  operator: string;
  value: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  category: 'SYSTEM' | 'USER' | 'COMPOSITION';
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'SOURCED' | 'IN_PROGRESS' | 'INTERVIEW';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionId: string;
  startTime: Date;
  lastActive: Date;
  endTime?: Date;
  totalTime: number;
  isActive: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyTimeTracking {
  id: string;
  userId: string;
  date: Date;
  totalSeconds: number;
  sessionCount: number;
  createdAt: Date;
  updatedAt: Date;
}
