import { create } from 'zustand';
import {
  archiveHabitDb,
  fetchHabitLogs,
  fetchHabits,
  fetchUserProfile,
  initDatabase,
  insertHabitDb,
  toggleHabitLogDb,
  updateHabitDb,
  updateUserProfileDb,
} from '@/db/database';
import { Habit, HabitLog, UserProfile } from '@/db/schema';
import {
  cancelHabitReminder,
  scheduleHabitReminder,
  syncTonightStreakSaverReminder,
} from '@/utils/notifications';

interface AuraState {
  isReady: boolean;
  profile: UserProfile | null;
  habits: Habit[];
  logs: HabitLog[];
  bootstrap: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) => Promise<void>;
  addHabit: (
    input: Omit<Habit, 'id' | 'isArchived' | 'sortOrder' | 'createdAt'>
  ) => Promise<void>;
  updateHabit: (
    id: string,
    patch: Partial<Omit<Habit, 'id' | 'createdAt'>>
  ) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  toggleHabitForDate: (habitId: string, dateStr: string) => Promise<boolean>;
}

export const useAuraStore = create<AuraState>((set, get) => ({
  isReady: false,
  profile: null,
  habits: [],
  logs: [],

  bootstrap: async () => {
    await initDatabase();
    const [profile, habits, logs] = await Promise.all([
      fetchUserProfile(),
      fetchHabits(),
      fetchHabitLogs(),
    ]);
    set({ isReady: true, profile, habits, logs });
    syncTonightStreakSaverReminder(habits, logs).catch(() => {});
  },

  updateProfile: async (patch) => {
    await updateUserProfileDb(patch);
    const current = get().profile;
    if (current) {
      set({ profile: { ...current, ...patch } });
    }
  },

  addHabit: async (input) => {
    const currentHabits = get().habits;
    const newHabit: Habit = {
      ...input,
      id: `habit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      isArchived: false,
      sortOrder: currentHabits.length,
      createdAt: new Date().toISOString(),
    };
    await insertHabitDb(newHabit);
    await scheduleHabitReminder(newHabit);
    const nextHabits = [...currentHabits, newHabit];
    set({ habits: nextHabits });
    syncTonightStreakSaverReminder(nextHabits, get().logs).catch(() => {});
  },

  updateHabit: async (id, patch) => {
    await updateHabitDb(id, patch);
    const nextHabits = get().habits.map((h) =>
      h.id === id ? { ...h, ...patch } : h
    );
    const updated = nextHabits.find((h) => h.id === id);
    if (updated) {
      await scheduleHabitReminder(updated);
    }
    set({ habits: nextHabits });
    syncTonightStreakSaverReminder(nextHabits, get().logs).catch(() => {});
  },

  archiveHabit: async (id) => {
    await archiveHabitDb(id);
    await cancelHabitReminder(id);
    const nextHabits = get().habits.filter((h) => h.id !== id);
    set({ habits: nextHabits });
    syncTonightStreakSaverReminder(nextHabits, get().logs).catch(() => {});
  },

  toggleHabitForDate: async (habitId, dateStr) => {
    const completed = await toggleHabitLogDb(habitId, dateStr);
    const currentLogs = get().logs;
    const nextLogs = completed
      ? [
          ...currentLogs,
          {
            id: `${habitId}_${dateStr}`,
            habitId,
            completedDate: dateStr,
            completedAt: new Date().toISOString(),
          },
        ]
      : currentLogs.filter(
          (l) => !(l.habitId === habitId && l.completedDate === dateStr)
        );
    set({ logs: nextLogs });
    syncTonightStreakSaverReminder(get().habits, nextLogs).catch(() => {});
    return completed;
  },
}));
