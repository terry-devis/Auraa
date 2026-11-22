import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Habit } from '@/db/schema';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DAILY_REMINDER_ID = 'auraa_daily_checkin';

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('auraa-daily', {
      name: 'Daily Ritual Reminders',
      importance: 5, // AndroidImportance.DEFAULT
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyAuraReminder(
  hour: number,
  minute: number
): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await ensureAndroidChannel();
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(
    () => {}
  );

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: 'Time for your daily sanctuary ✨',
      body: 'Take a gentle moment to check in with your Auraa rituals.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return true;
}

export async function cancelDailyAuraReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(
    () => {}
  );
}

export async function scheduleHabitReminder(habit: Habit): Promise<boolean> {
  const identifier = `habit_${habit.id}`;
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  if (!habit.reminderTime || habit.isArchived) {
    return false;
  }

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const [hourStr, minStr] = habit.reminderTime.split(':');
  const hour = Number(hourStr);
  const minute = Number(minStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return false;

  await ensureAndroidChannel();

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: `${habit.icon} ${habit.title}`,
      body: `Gentle reminder for your ${habit.timeOfDay} ritual ✨`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return true;
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`habit_${habitId}`).catch(
    () => {}
  );
}

export function formatTime12h(time24: string | null | undefined): string {
  if (!time24) return 'Off';
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(minStrOrZero(mStr));
  if (Number.isNaN(h) || Number.isNaN(m)) return 'Off';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function minStrOrZero(m?: string): string {
  return m ?? '00';
}
