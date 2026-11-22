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

export function calculateHabitStreak(habitId: string, logs: HabitLog[]): number {
  const completedSet = new Set(
    logs.filter((l) => l.habitId === habitId).map((l) => l.completedDate)
  );
  if (completedSet.size === 0) return 0;

  const today = new Date();
  const todayStr = getLocalDateString(today);
  const yesterdayStr = getLocalDateString(addDays(today, -1));

  let cursor = completedSet.has(todayStr)
    ? today
    : completedSet.has(yesterdayStr)
      ? addDays(today, -1)
      : null;

  if (!cursor) return 0;

  let streak = 0;
  while (completedSet.has(getLocalDateString(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
