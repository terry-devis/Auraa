import * as SQLite from 'expo-sqlite';
import { Habit, HabitLog, UserProfile } from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('auraa.db');
  }
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL DEFAULT 'Aura Explorer',
      avatar_type TEXT NOT NULL DEFAULT 'preset',
      avatar_value TEXT NOT NULL DEFAULT 'aura_moon',
      aura_vibe TEXT NOT NULL DEFAULT 'Soft Minimalist',
      theme_mode TEXT NOT NULL DEFAULT 'system',
      sound_enabled INTEGER NOT NULL DEFAULT 1,
      selected_chime TEXT NOT NULL DEFAULT 'celestial',
      haptics_enabled INTEGER NOT NULL DEFAULT 1,
      daily_reminder_enabled INTEGER NOT NULL DEFAULT 1,
      daily_reminder_time TEXT NOT NULL DEFAULT '20:00',
      onboarding_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'sparkles',
      category TEXT NOT NULL DEFAULT 'mindfulness',
      time_of_day TEXT NOT NULL DEFAULT 'morning',
      frequency_days TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
      reminder_time TEXT,
      accent_color TEXT NOT NULL DEFAULT '#a78bfa',
      is_archived INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      completed_date TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      UNIQUE(habit_id, completed_date)
    );
  `);

  // Safe migration for existing installs
  const cols = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(user_profile)'
  );
  const colNames = new Set(cols.map((c) => c.name));
  if (!colNames.has('daily_reminder_enabled')) {
    await db.execAsync(
      'ALTER TABLE user_profile ADD COLUMN daily_reminder_enabled INTEGER NOT NULL DEFAULT 1'
    );
  }
  if (!colNames.has('daily_reminder_time')) {
    await db.execAsync(
      "ALTER TABLE user_profile ADD COLUMN daily_reminder_time TEXT NOT NULL DEFAULT '20:00'"
    );
  }

  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM user_profile WHERE id = ?',
    ['default']
  );

  if (!existing) {
    await db.runAsync(
      `INSERT INTO user_profile (
        id, display_name, avatar_type, avatar_value, aura_vibe,
        theme_mode, sound_enabled, selected_chime, haptics_enabled,
        daily_reminder_enabled, daily_reminder_time,
        onboarding_completed, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'default',
        'Aura Explorer',
        'preset',
        'aura_moon',
        'Soft Minimalist',
        'system',
        1,
        'celestial',
        1,
        1,
        '20:00',
        0,
        new Date().toISOString(),
      ]
    );
  }
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const db = await getDb();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM user_profile WHERE id = ?',
    ['default']
  );
  return {
    id: row.id,
    displayName: row.display_name,
    avatarType: row.avatar_type,
    avatarValue: row.avatar_value,
    auraVibe: row.aura_vibe,
    themeMode: row.theme_mode,
    soundEnabled: Boolean(row.sound_enabled),
    selectedChime: row.selected_chime,
    hapticsEnabled: Boolean(row.haptics_enabled),
    dailyReminderEnabled:
      row.daily_reminder_enabled === undefined
        ? true
        : Boolean(row.daily_reminder_enabled),
    dailyReminderTime: row.daily_reminder_time ?? '20:00',
    onboardingCompleted: Boolean(row.onboarding_completed),
    createdAt: row.created_at,
  };
}

export async function updateUserProfileDb(
  patch: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDb();
  const fieldMap: Record<string, string> = {
    displayName: 'display_name',
    avatarType: 'avatar_type',
    avatarValue: 'avatar_value',
    auraVibe: 'aura_vibe',
    themeMode: 'theme_mode',
    soundEnabled: 'sound_enabled',
    selectedChime: 'selected_chime',
    hapticsEnabled: 'haptics_enabled',
    dailyReminderEnabled: 'daily_reminder_enabled',
    dailyReminderTime: 'daily_reminder_time',
    onboardingCompleted: 'onboarding_completed',
  };

  const sets: string[] = [];
  const values: any[] = [];

  for (const [key, val] of Object.entries(patch)) {
    const col = fieldMap[key];
    if (!col || val === undefined) continue;
    sets.push(`${col} = ?`);
    values.push(typeof val === 'boolean' ? (val ? 1 : 0) : val);
  }

  if (sets.length === 0) return;
  values.push('default');
  await db.runAsync(
    `UPDATE user_profile SET ${sets.join(', ')} WHERE id = ?`,
    values
  );
}

export async function fetchHabits(): Promise<Habit[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM habits WHERE is_archived = 0 ORDER BY sort_order ASC, created_at ASC'
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    icon: r.icon,
    category: r.category,
    timeOfDay: r.time_of_day,
    frequencyDays: JSON.parse(r.frequency_days),
    reminderTime: r.reminder_time,
    accentColor: r.accent_color,
    isArchived: Boolean(r.is_archived),
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }));
}

export async function insertHabitDb(habit: Habit): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO habits (
      id, title, icon, category, time_of_day, frequency_days,
      reminder_time, accent_color, is_archived, sort_order, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      habit.id,
      habit.title,
      habit.icon,
      habit.category,
      habit.timeOfDay,
      JSON.stringify(habit.frequencyDays),
      habit.reminderTime,
      habit.accentColor,
      habit.isArchived ? 1 : 0,
      habit.sortOrder,
      habit.createdAt,
    ]
  );
}

export async function updateHabitDb(
  id: string,
  patch: Partial<Omit<Habit, 'id' | 'createdAt'>>
): Promise<void> {
  const db = await getDb();
  const sets: string[] = [];
  const values: any[] = [];

  if (patch.title !== undefined) {
    sets.push('title = ?');
    values.push(patch.title);
  }
  if (patch.icon !== undefined) {
    sets.push('icon = ?');
    values.push(patch.icon);
  }
  if (patch.category !== undefined) {
    sets.push('category = ?');
    values.push(patch.category);
  }
  if (patch.timeOfDay !== undefined) {
    sets.push('time_of_day = ?');
    values.push(patch.timeOfDay);
  }
  if (patch.frequencyDays !== undefined) {
    sets.push('frequency_days = ?');
    values.push(JSON.stringify(patch.frequencyDays));
  }
  if (patch.reminderTime !== undefined) {
    sets.push('reminder_time = ?');
    values.push(patch.reminderTime);
  }
  if (patch.accentColor !== undefined) {
    sets.push('accent_color = ?');
    values.push(patch.accentColor);
  }
  if (patch.isArchived !== undefined) {
    sets.push('is_archived = ?');
    values.push(patch.isArchived ? 1 : 0);
  }

  if (sets.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE habits SET ${sets.join(', ')} WHERE id = ?`, values);
}

export async function archiveHabitDb(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE habits SET is_archived = 1 WHERE id = ?', [id]);
}

export async function fetchHabitLogs(): Promise<HabitLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>('SELECT * FROM habit_logs');
  return rows.map((r) => ({
    id: r.id,
    habitId: r.habit_id,
    completedDate: r.completed_date,
    completedAt: r.completed_at,
  }));
}

export async function toggleHabitLogDb(
  habitId: string,
  completedDate: string
): Promise<boolean> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM habit_logs WHERE habit_id = ? AND completed_date = ?',
    [habitId, completedDate]
  );

  if (existing) {
    await db.runAsync('DELETE FROM habit_logs WHERE id = ?', [existing.id]);
    return false;
  }

  const id = `${habitId}_${completedDate}`;
  await db.runAsync(
    'INSERT INTO habit_logs (id, habit_id, completed_date, completed_at) VALUES (?, ?, ?, ?)',
    [id, habitId, completedDate, new Date().toISOString()]
  );
  return true;
}
