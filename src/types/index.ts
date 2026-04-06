export interface Activity {
  id: string;
  title: string;
  description: string;
  category?: string;
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
  photos: Photo[];
  tags: string[];
  aiGenerated?: boolean;
}

export interface Photo {
  id: string;
  path: string;
  caption?: string;
  uploadedAt: string;
}

export interface UserSettings {
  notificationEnabled: boolean;
  notificationTime: string;
  theme: 'light' | 'dark' | 'summer';
  cloudSyncEnabled: boolean;
  activeHoursStart: string;
  activeHoursEnd: string;
}

export interface RecapData {
  period: 'week' | 'month' | 'summer';
  startDate: string;
  endDate: string;
  totalActivities: number;
  completedActivities: number;
  inProgressActivities: number;
  photos: Photo[];
  completionsByDate: Record<string, number>;
  longestStreak: number;
  favoriteCategory?: string;
  /** Completed activities in the selected period (for story timeline). */
  periodActivities: Activity[];
  /** Count of completed moments per category within the period. */
  categoryCounts: Record<string, number>;
}

export interface PresetActivity {
  title: string;
  description: string;
  category: string;
  tags: string[];
}
