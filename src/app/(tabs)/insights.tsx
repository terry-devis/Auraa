import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Sparkles, Trophy } from 'lucide-react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { useAuraStore } from '@/store/useAuraStore';
import { AuraCard } from '@/components/ui/AuraCard';
import { AuraChip } from '@/components/ui/AuraChip';
import {
  addDays,
  calculateHabitStreak,
  getLocalDateString,
} from '@/utils/streak';

type InsightTab = 'calendar' | 'monthly' | 'yearly' | 'deep_dive';

const TABS: { id: InsightTab; label: string }[] = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'deep_dive', label: 'Deep Dive' },
];

const WEEK_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function InsightsScreen() {
  const { theme } = useAuraTheme();
  const { habits, logs } = useAuraStore();
  const [activeTab, setActiveTab] = useState<InsightTab>('calendar');

  const logsByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of logs) {
      map.set(log.completedDate, (map.get(log.completedDate) ?? 0) + 1);
    }
    return map;
  }, [logs]);

  const bestStreak = useMemo(() => {
    let max = 0;
    for (const h of habits) {
      const s = calculateHabitStreak(h.id, logs);
      if (s > max) max = s;
    }
    return max;
  }, [habits, logs]);

  const monthLabel = useMemo(
    () =>
      new Date().toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  // Calendar grid for current month
  const calendarCells = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells: { day: number | null; dateStr: string | null; count: number }[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, dateStr: null, count: 0 });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        dateStr,
        count: logsByDate.get(dateStr) ?? 0,
      });
    }
    return cells;
  }, [logsByDate]);

  // Last 4 weeks (weekly bars for Monthly tab)
  const weeklyBars = useMemo(() => {
    const now = new Date();
    const bars: { label: string; count: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      let sum = 0;
      for (let d = 0; d < 7; d++) {
        const target = addDays(now, -(w * 7 + d));
        sum += logsByDate.get(getLocalDateString(target)) ?? 0;
      }
      bars.push({ label: w === 0 ? 'This Wk' : `${w}w ago`, count: sum });
    }
    return bars;
  }, [logsByDate]);

  const maxBar = Math.max(1, ...weeklyBars.map((b) => b.count));

  // Last 12 weeks (84 days) for Yearly heatmap
  const heatmapDays = useMemo(() => {
    const now = new Date();
    const items: { dateStr: string; count: number }[] = [];
    for (let i = 83; i >= 0; i--) {
      const d = addDays(now, -i);
      const dateStr = getLocalDateString(d);
      items.push({ dateStr, count: logsByDate.get(dateStr) ?? 0 });
    }
    return items;
  }, [logsByDate]);

  const getIntensityColor = (count: number) => {
    if (count === 0) {
      return theme.isDark ? theme.colors.surfaceLow : theme.colors.surfaceHigh;
    }
    if (count === 1) {
      return theme.isDark ? 'rgba(167, 139, 250, 0.35)' : theme.colors.lavender;
    }
    if (count === 2) {
      return theme.isDark ? 'rgba(110, 231, 183, 0.55)' : theme.colors.sage;
    }
    return theme.colors.sage;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={[styles.eyebrow, { color: theme.colors.onSurfaceVariant }]}>
            CONSISTENCY & RHYTHM
          </Text>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Insights ✨
          </Text>
        </View>

        {/* Summary KPI Row */}
        <View style={styles.kpiRow}>
          <AuraCard padding="md" style={styles.kpiCard}>
            <Sparkles size={18} color={theme.colors.primary} />
            <Text style={[styles.kpiVal, { color: theme.colors.onSurface }]}>
              {logs.length}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.colors.onSurfaceVariant }]}>
              Total Check-ins
            </Text>
          </AuraCard>

          <AuraCard padding="md" style={styles.kpiCard}>
            <Flame size={18} color={theme.colors.blush} />
            <Text style={[styles.kpiVal, { color: theme.colors.onSurface }]}>
              {bestStreak}d
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.colors.onSurfaceVariant }]}>
              Best Streak
            </Text>
          </AuraCard>

          <AuraCard padding="md" style={styles.kpiCard}>
            <Trophy size={18} color={theme.colors.sage} />
            <Text style={[styles.kpiVal, { color: theme.colors.onSurface }]}>
              {habits.length}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.colors.onSurfaceVariant }]}>
              Active Rituals
            </Text>
          </AuraCard>
        </View>

        {/* View Switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map((tab) => (
            <AuraChip
              key={tab.id}
              label={tab.label}
              selected={activeTab === tab.id}
              onPress={() => setActiveTab(tab.id)}
            />
          ))}
        </ScrollView>

        {/* 1. Calendar Consistency View */}
        {activeTab === 'calendar' && (
          <AuraCard>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              {monthLabel}
            </Text>
            <View style={styles.weekHeaderRow}>
              {WEEK_HEADERS.map((h, i) => (
                <Text
                  key={`${h}_${i}`}
                  style={[styles.weekHeaderText, { color: theme.colors.outline }]}
                >
                  {h}
                </Text>
              ))}
            </View>
            <View style={styles.calGrid}>
              {calendarCells.map((cell, idx) => (
                <View key={idx} style={styles.calCellWrap}>
                  {cell.day !== null && (
                    <View
                      style={[
                        styles.calCell,
                        { backgroundColor: getIntensityColor(cell.count) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.calDayText,
                          {
                            color:
                              cell.count >= 2 && theme.isDark
                                ? '#0D0D14'
                                : theme.colors.onSurface,
                          },
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </AuraCard>
        )}

        {/* 2. Monthly Bar View */}
        {activeTab === 'monthly' && (
          <AuraCard>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              4-Week Momentum
            </Text>
            <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>
              Completed rituals per week over the past month
            </Text>
            <View style={styles.barsContainer}>
              {weeklyBars.map((bar) => {
                const heightPct = Math.max(12, Math.round((bar.count / maxBar) * 100));
                return (
                  <View key={bar.label} style={styles.barCol}>
                    <Text style={[styles.barCount, { color: theme.colors.onSurface }]}>
                      {bar.count}
                    </Text>
                    <View
                      style={[
                        styles.barTrack,
                        { backgroundColor: theme.colors.surfaceLow },
                      ]}
                    >
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${heightPct}%`,
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.barLabel, { color: theme.colors.onSurfaceVariant }]}
                    >
                      {bar.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </AuraCard>
        )}

        {/* 3. Yearly Heatmap View */}
        {activeTab === 'yearly' && (
          <AuraCard>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
              12-Week Aura Heatmap
            </Text>
            <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>
              Every glowing tile represents a day you showed up
            </Text>
            <View style={styles.heatmapGrid}>
              {heatmapDays.map((item) => (
                <View
                  key={item.dateStr}
                  style={[
                    styles.heatTile,
                    { backgroundColor: getIntensityColor(item.count) },
                  ]}
                />
              ))}
            </View>
          </AuraCard>
        )}

        {/* 4. Deep Dive Per-Habit View */}
        {activeTab === 'deep_dive' && (
          <View style={styles.deepList}>
            {habits.length === 0 ? (
              <AuraCard>
                <Text style={[styles.cardSub, { color: theme.colors.onSurfaceVariant }]}>
                  Add rituals to unlock per-habit consistency breakdowns.
                </Text>
              </AuraCard>
            ) : (
              habits.map((h) => {
                const count = logs.filter((l) => l.habitId === h.id).length;
                const streak = calculateHabitStreak(h.id, logs);
                return (
                  <AuraCard key={h.id} padding="md">
                    <View style={styles.deepRow}>
                      <Text style={styles.deepEmoji}>{h.icon}</Text>
                      <View style={styles.deepInfo}>
                        <Text
                          style={[styles.deepTitle, { color: theme.colors.onSurface }]}
                        >
                          {h.title}
                        </Text>
                        <Text
                          style={[
                            styles.deepMeta,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          {count} total check-ins • {streak}d current streak
                        </Text>
                      </View>
                    </View>
                  </AuraCard>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 18, paddingBottom: 40 },
  eyebrow: { fontFamily: fontFamilies.semibold, fontSize: 11, letterSpacing: 1.2 },
  title: { fontFamily: fontFamilies.bold, fontSize: 28, marginTop: 4 },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpiCard: { flex: 1, gap: 6, alignItems: 'flex-start' },
  kpiVal: { fontFamily: fontFamilies.bold, fontSize: 22 },
  kpiLabel: { fontFamily: fontFamilies.medium, fontSize: 11 },
  tabRow: { gap: 8 },
  cardTitle: { fontFamily: fontFamilies.semibold, fontSize: 18, marginBottom: 4 },
  cardSub: { fontFamily: fontFamilies.regular, fontSize: 13, marginBottom: 14 },
  weekHeaderRow: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 8,
  },
  weekHeaderText: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCellWrap: {
    width: '14.28%',
    padding: 3,
    aspectRatio: 1,
  },
  calCell: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayText: { fontFamily: fontFamilies.semibold, fontSize: 12 },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 170,
    gap: 12,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barCount: { fontFamily: fontFamilies.bold, fontSize: 13 },
  barTrack: {
    flex: 1,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 12 },
  barLabel: { fontFamily: fontFamilies.medium, fontSize: 11 },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  heatTile: {
    width: 18,
    height: 18,
    borderRadius: 5,
  },
  deepList: { gap: 10 },
  deepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deepEmoji: { fontSize: 22 },
  deepInfo: { flex: 1, gap: 3 },
  deepTitle: { fontFamily: fontFamilies.semibold, fontSize: 16 },
  deepMeta: { fontFamily: fontFamilies.regular, fontSize: 13 },
});
