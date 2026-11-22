import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Moon, Plus, Sun } from 'lucide-react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { AuraCard } from '@/components/ui/AuraCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AuraChip } from '@/components/ui/AuraChip';
import { AuraButton } from '@/components/ui/AuraButton';
import { HabitCard } from '@/components/home/HabitCard';
import { CelebrationModal } from '@/components/home/CelebrationModal';
import {
  CHEER_UP_MESSAGES,
  CheerUpToast,
} from '@/components/home/CheerUpToast';
import { AvatarView } from '@/components/profile/AvatarView';
import { useAuraStore } from '@/store/useAuraStore';
import { TimeOfDay } from '@/db/schema';
import { playAuraChime } from '@/utils/audio';
import { triggerCelebrationHaptic } from '@/utils/haptics';
import {
  calculateHabitStreak,
  getLocalDateString,
  getRollingWeekDays,
  isHabitScheduledForDate,
} from '@/utils/streak';

type FilterOption = 'all' | TimeOfDay;

const FILTERS: { id: FilterOption; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
];

export default function HomeScreen() {
  const { theme, toggleTheme, themeName } = useAuraTheme();
  const { profile, habits, logs, toggleHabitForDate } = useAuraStore();

  const weekDays = useMemo(() => getRollingWeekDays(), []);
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());
  const [filter, setFilter] = useState<FilterOption>('all');
  const [showCelebration, setShowCelebration] = useState(false);
  const [cheerMsg, setCheerMsg] = useState<string | null>(null);

  const scheduledForDate = useMemo(
    () => habits.filter((h) => isHabitScheduledForDate(h, selectedDate)),
    [habits, selectedDate]
  );

  const completedIds = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) {
      if (log.completedDate === selectedDate) {
        set.add(log.habitId);
      }
    }
    return set;
  }, [logs, selectedDate]);

  const completedCount = useMemo(
    () => scheduledForDate.filter((h) => completedIds.has(h.id)).length,
    [scheduledForDate, completedIds]
  );

  const handleToggleHabit = async (habitId: string) => {
    const nowCompleted = await toggleHabitForDate(habitId, selectedDate);
    if (nowCompleted) {
      const nextCompletedCount = completedCount + 1;
      const msg =
        CHEER_UP_MESSAGES[nextCompletedCount % CHEER_UP_MESSAGES.length];
      setCheerMsg(msg);
      setTimeout(() => {
        setCheerMsg((prev) => (prev === msg ? null : prev));
      }, 2200);

      if (scheduledForDate.length > 0 && nextCompletedCount === scheduledForDate.length) {
        playAuraChime('celebration', profile?.soundEnabled ?? true);
        triggerCelebrationHaptic(profile?.hapticsEnabled ?? true);
        setShowCelebration(true);
      } else {
        playAuraChime(
          profile?.selectedChime ?? 'celestial',
          profile?.soundEnabled ?? true
        );
      }
    }
  };

  const progress =
    scheduledForDate.length > 0 ? completedCount / scheduledForDate.length : 0;

  const filteredHabits = useMemo(() => {
    if (filter === 'all') return scheduledForDate;
    return scheduledForDate.filter((h) => h.timeOfDay === filter);
  }, [scheduledForDate, filter]);

  const statusCopy =
    scheduledForDate.length === 0
      ? 'Start small—add one gentle ritual below.'
      : progress === 1
        ? 'Full aura unlocked! Every ritual complete.'
        : progress >= 0.5
          ? 'Beautiful momentum. Keep glowing.'
          : 'Soft progress counts. Take it one step at a time.';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <CheerUpToast message={cheerMsg} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Greeting Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.headerLeft}
          >
            <AvatarView
              avatarType={profile?.avatarType ?? 'preset'}
              avatarValue={profile?.avatarValue ?? 'aura_moon'}
              size={44}
            />
            <View>
              <Text style={[styles.eyebrow, { color: theme.colors.onSurfaceVariant }]}>
                DAILY SANCTUARY
              </Text>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                Hey, {profile?.displayName ?? 'Aura Explorer'} ✨
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeBtn,
              {
                backgroundColor: theme.colors.surfaceContainer,
                borderColor: theme.colors.cardBorder,
              },
            ]}
            accessibilityLabel="Toggle theme"
          >
            {themeName === 'midnight' ? (
              <Sun size={18} color={theme.colors.primary} />
            ) : (
              <Moon size={18} color={theme.colors.primary} />
            )}
          </Pressable>
        </View>

        {/* 7-Day Rolling Strip */}
        <View style={styles.weekRow}>
          {weekDays.map((day) => {
            const active = day.dateStr === selectedDate;
            return (
              <Pressable
                key={day.dateStr}
                onPress={() => setSelectedDate(day.dateStr)}
                style={[
                  styles.dayPill,
                  {
                    backgroundColor: active
                      ? theme.colors.primary
                      : theme.colors.surfaceContainer,
                    borderColor: day.isToday && !active
                      ? theme.colors.lavender
                      : theme.colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayShort,
                    {
                      color: active
                        ? theme.colors.onPrimary
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {day.dayShort}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    {
                      color: active ? theme.colors.onPrimary : theme.colors.onSurface,
                    },
                  ]}
                >
                  {day.dayNum}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Progress Ring Card */}
        <AuraCard style={styles.heroCard}>
          <View style={styles.heroRow}>
            <ProgressRing progress={progress} size={96} strokeWidth={9}>
              <Text style={[styles.ringText, { color: theme.colors.onSurface }]}>
                {Math.round(progress * 100)}%
              </Text>
            </ProgressRing>
            <View style={styles.heroInfo}>
              <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
                {completedCount}/{scheduledForDate.length} Rituals
              </Text>
              <Text style={[styles.heroSub, { color: theme.colors.onSurfaceVariant }]}>
                {statusCopy}
              </Text>
            </View>
          </View>
        </AuraCard>

        {/* Time-of-Day Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <AuraChip
              key={f.id}
              label={f.label}
              selected={filter === f.id}
              onPress={() => setFilter(f.id)}
            />
          ))}
        </ScrollView>

        {/* Habit List */}
        <View style={styles.habitList}>
          {filteredHabits.length === 0 ? (
            <AuraCard>
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
                  Your ritual space is clear 🌿
                </Text>
                <Text
                  style={[styles.emptySub, { color: theme.colors.onSurfaceVariant }]}
                >
                  Create a mindful habit to start building your daily aura.
                </Text>
                <AuraButton
                  label="Add Your First Ritual"
                  onPress={() => router.push('/add-habit')}
                  icon={<Plus size={18} color={theme.isDark ? '#0D0D14' : theme.colors.onPrimary} />}
                />
              </View>
            </AuraCard>
          ) : (
            filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={completedIds.has(habit.id)}
                streak={calculateHabitStreak(habit.id, logs)}
                hapticsEnabled={profile?.hapticsEnabled ?? true}
                onToggle={() => handleToggleHabit(habit.id)}
                onEdit={() => router.push({ pathname: '/add-habit', params: { id: habit.id } })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating + New Ritual Button */}
      <Pressable
        onPress={() => router.push('/add-habit')}
        style={[
          styles.fab,
          theme.shadows.glow,
          { backgroundColor: theme.colors.primary },
        ]}
        accessibilityLabel="Add new ritual"
      >
        <Plus size={24} color={theme.isDark ? '#0D0D14' : theme.colors.onPrimary} />
      </Pressable>

      <CelebrationModal
        visible={showCelebration}
        completedCount={scheduledForDate.length}
        onClose={() => setShowCelebration(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 18, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  eyebrow: { fontFamily: fontFamilies.semibold, fontSize: 11, letterSpacing: 1.2 },
  title: { fontFamily: fontFamilies.bold, fontSize: 22, marginTop: 2 },
  themeBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  dayShort: {
    fontFamily: fontFamilies.medium,
    fontSize: 11,
  },
  dayNum: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
  },
  heroCard: {},
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  ringText: { fontFamily: fontFamilies.bold, fontSize: 18 },
  heroInfo: { flex: 1, gap: 4 },
  heroTitle: { fontFamily: fontFamilies.semibold, fontSize: 18 },
  heroSub: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 19 },
  filterRow: { gap: 8 },
  habitList: { gap: 12 },
  emptyState: { gap: 12, alignItems: 'flex-start' },
  emptyTitle: { fontFamily: fontFamilies.semibold, fontSize: 17 },
  emptySub: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
