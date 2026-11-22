import { Habit, HabitLog } from '@/db/schema';

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

export interface WeekDayItem {
  dateStr: string;
  dayShort: string;
  dayNum: number;
  dayOfWeek: number;
  isToday: boolean;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getRollingWeekDays(today: Date = new Date()): WeekDayItem[] {
  const todayStr = getLocalDateString(today);
  const items: WeekDayItem[] = [];
  for (let i = -5; i <= 1; i++) {
    const d = addDays(today, i);
    const dateStr = getLocalDateString(d);
    items.push({
      dateStr,
      dayShort: DAY_LABELS[d.getDay()],
      dayNum: d.getDate(),
      dayOfWeek: d.getDay(),
      isToday: dateStr === todayStr,
    });
  }
  return items;
}

export function isHabitScheduledForDate(habit: Habit, dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return habit.frequencyDays.includes(date.getDay());
}

/**
 * Frequency-aware current streak:
 * - Unscheduled rest days do NOT break the streak.
 * - If today is scheduled but not yet completed, streak is preserved until midnight
 *   as long as the previous scheduled day was completed.
 * - Any missed scheduled day breaks the streak.
 */
export function calculateHabitStreak(habit: Habit, logs: HabitLog[]): number {
  const completedSet = new Set(
    logs.filter((l) => l.habitId === habit.id).map((l) => l.completedDate)
  );
  if (completedSet.size === 0 || habit.frequencyDays.length === 0) return 0;

  const today = new Date();
  const todayStr = getLocalDateString(today);

  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let streak = 0;

  // If today is not completed yet, start checking from yesterday
  // (so an uncompleted today doesn't prematurely wipe out an active streak).
  if (completedSet.has(todayStr)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  } else {
    cursor = addDays(cursor, -1);
  }

  for (let i = 0; i < 3650; i++) {
    const dateStr = getLocalDateString(cursor);
    const isScheduled = habit.frequencyDays.includes(cursor.getDay());
    const isDone = completedSet.has(dateStr);

    if (isDone) {
      streak += 1;
    } else if (isScheduled) {
      break;
    }

    cursor = addDays(cursor, -1);
  }

  return streak;
}

/**
 * Frequency-aware all-time longest streak for a habit.
 */
export function calculateLongestHabitStreak(
  habit: Habit,
  logs: HabitLog[]
): number {
  const habitDates = logs
    .filter((l) => l.habitId === habit.id)
    .map((l) => l.completedDate)
    .sort();

  if (habitDates.length === 0 || habit.frequencyDays.length === 0) return 0;

  const completedSet = new Set(habitDates);
  const [sy, sm, sd] = habitDates[0].split('-').map(Number);
  let cursor = new Date(sy, sm - 1, sd);

  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStr = getLocalDateString(todayEnd);

  let best = 0;
  let current = 0;

  while (cursor <= todayEnd) {
    const dateStr = getLocalDateString(cursor);
    const isScheduled = habit.frequencyDays.includes(cursor.getDay());
    const isDone = completedSet.has(dateStr);

    if (isDone) {
      current += 1;
      if (current > best) best = current;
    } else if (isScheduled && dateStr !== todayStr) {
      current = 0;
    }

    cursor = addDays(cursor, 1);
  }

  return best;
}

export function calculateBestStreakAcrossHabits(
  habits: Habit[],
  logs: HabitLog[]
): number {
  let max = 0;
  for (const h of habits) {
    const longest = calculateLongestHabitStreak(h, logs);
    if (longest > max) max = longest;
  }
  return max;
}
