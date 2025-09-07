export interface Team {
  id: string;
  name: string;
  members: string[];
}

export interface User {
  id: string;
  name: string;
  teamId: string;
}

export interface ActivityType {
  id: string;
  name: string;
  points: number;
  isCustom?: boolean;
  createdAt?: string;
  isChecklistStyle?: boolean; // New field to distinguish between input types
}

export interface Activity {
  id: string;
  userId: string;
  activityTypeId: string;
  quantity: number;
  points: number;
  date: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  type: 'points' | 'activities' | 'streak';
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

export interface AppData {
  teams: Team[];
  users: User[];
  activities: Activity[];
  activityTypes: ActivityType[];
  userAchievements: UserAchievement[];
  lastActivity: Record<string, string>;
}

export type TimeFilter = 'all' | 'today' | 'week' | 'month';

export interface UserStats {
  userId: string;
  userName: string;
  teamId: string;
  teamName: string;
  totalPoints: number;
  totalActivities: number;
  currentStreak: number;
  achievements: UserAchievement[];
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  totalPoints: number;
  totalActivities: number;
  memberCount: number;
  members: UserStats[];
}