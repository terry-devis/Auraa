export type AvatarType = 'preset' | 'custom';
export type ChimeType = 'celestial' | 'woodblock' | 'soft_bell';
export type HabitCategory = 'mindfulness' | 'wellness' | 'movement' | 'evening' | 'custom';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface UserProfile {
  id: string;
  displayName: string;
  avatarType: AvatarType;
  avatarValue: string;
  auraVibe: string;
  themeMode: 'serene' | 'midnight' | 'system';
  soundEnabled: boolean;
  selectedChime: ChimeType;
  hapticsEnabled: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  category: HabitCategory;
  timeOfDay: TimeOfDay;
  frequencyDays: number[]; // 0 (Sun) - 6 (Sat)
  reminderTime: string | null;
  accentColor: string;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedDate: string; // YYYY-MM-DD
  completedAt: string;
}
