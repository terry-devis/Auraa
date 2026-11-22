import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { useAuraStore } from '@/store/useAuraStore';
import { HabitCategory, TimeOfDay } from '@/db/schema';
import { AuraButton } from '@/components/ui/AuraButton';
import { AuraCard } from '@/components/ui/AuraCard';
import { triggerTapHaptic } from '@/utils/haptics';

interface StarterRitual {
  key: string;
  title: string;
  icon: string;
  category: HabitCategory;
  timeOfDay: TimeOfDay;
  accentColor: string;
}

const STARTER_RITUALS: StarterRitual[] = [
  {
    key: 'hydrate',
    title: 'Morning Hydration',
    icon: '💧',
    category: 'wellness',
    timeOfDay: 'morning',
    accentColor: '#60A5FA',
  },
  {
    key: 'breath',
    title: '5-Min Breathwork',
    icon: '🧘‍♀️',
    category: 'mindfulness',
    timeOfDay: 'morning',
    accentColor: '#A78BFA',
  },
  {
    key: 'walk',
    title: 'Sunlight Walk',
    icon: '🌿',
    category: 'movement',
    timeOfDay: 'afternoon',
    accentColor: '#6EE7B7',
  },
  {
    key: 'read',
    title: 'Read 10 Pages',
    icon: '📖',
    category: 'mindfulness',
    timeOfDay: 'evening',
    accentColor: '#FBBF24',
  },
  {
    key: 'journal',
    title: 'Gratitude Journal',
    icon: '📝',
    category: 'evening',
    timeOfDay: 'evening',
    accentColor: '#F472B6',
  },
  {
    key: 'unwind',
    title: 'Screen-Free Wind Down',
    icon: '🌙',
    category: 'evening',
    timeOfDay: 'evening',
    accentColor: '#A78BFA',
  },
];

export default function RitualSelectionScreen() {
  const { theme } = useAuraTheme();
  const { habits, addHabit } = useAuraStore();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    'hydrate',
    'breath',
    'journal',
  ]);
  const [saving, setSaving] = useState(false);

  const toggleKey = (key: string) => {
    triggerTapHaptic(true);
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      const existingTitles = new Set(habits.map((h) => h.title.toLowerCase()));
      for (const r of STARTER_RITUALS) {
        if (selectedKeys.includes(r.key) && !existingTitles.has(r.title.toLowerCase())) {
          await addHabit({
            title: r.title,
            icon: r.icon,
            category: r.category,
            timeOfDay: r.timeOfDay,
            frequencyDays: [0, 1, 2, 3, 4, 5, 6],
            reminderTime: null,
            accentColor: r.accentColor,
          });
        }
      }
      router.push('/(onboarding)/reminders-soundscapes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <ChevronLeft size={24} color={theme.colors.onSurface} />
          </Pressable>
          <Text style={[styles.stepBadge, { color: theme.colors.secondary }]}>
            STEP 2 OF 3
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.heroText}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Curate your sacred rituals 🌿
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Pick a few gentle habits to start with. You can always customize them later.
          </Text>
        </View>

        <View style={styles.list}>
          {STARTER_RITUALS.map((ritual) => {
            const active = selectedKeys.includes(ritual.key);
            return (
              <Pressable key={ritual.key} onPress={() => toggleKey(ritual.key)}>
                <AuraCard variant={active ? 'completed' : 'default'} padding="md">
                  <View style={styles.row}>
                    <Text style={styles.emoji}>{ritual.icon}</Text>
                    <View style={styles.info}>
                      <Text style={[styles.ritualTitle, { color: theme.colors.onSurface }]}>
                        {ritual.title}
                      </Text>
                      <Text
                        style={[
                          styles.ritualMeta,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {ritual.timeOfDay.toUpperCase()} • {ritual.category.toUpperCase()}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkCircle,
                        {
                          backgroundColor: active
                            ? theme.colors.sage
                            : 'transparent',
                          borderColor: active
                            ? theme.colors.sage
                            : theme.colors.outlineVariant,
                        },
                      ]}
                    >
                      {active && (
                        <Check
                          size={14}
                          strokeWidth={3}
                          color={theme.isDark ? '#0D0D14' : '#1A1A1E'}
                        />
                      )}
                    </View>
                  </View>
                </AuraCard>
              </Pressable>
            );
          })}
        </View>

        <AuraButton
          label={`Continue (${selectedKeys.length} selected)`}
          onPress={handleNext}
          loading={saving}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 22, gap: 22, paddingBottom: 40 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBadge: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  heroText: { gap: 8 },
  title: { fontFamily: fontFamilies.bold, fontSize: 28, lineHeight: 36 },
  subtitle: { fontFamily: fontFamilies.regular, fontSize: 15, lineHeight: 22 },
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emoji: { fontSize: 24 },
  info: { flex: 1, gap: 3 },
  ritualTitle: { fontFamily: fontFamilies.semibold, fontSize: 16 },
  ritualMeta: { fontFamily: fontFamilies.medium, fontSize: 11, letterSpacing: 0.6 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
