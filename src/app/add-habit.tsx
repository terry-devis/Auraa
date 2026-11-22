import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Trash2, X } from 'lucide-react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { useAuraStore } from '@/store/useAuraStore';
import { HabitCategory, TimeOfDay } from '@/db/schema';
import { AuraButton } from '@/components/ui/AuraButton';
import { AuraChip } from '@/components/ui/AuraChip';

const EMOJI_OPTIONS = ['✨', '🧘‍♀️', '💧', '📖', '🌿', '🏃‍♀️', '🌙', '🍵', '🎧', '📝'];
const CATEGORIES: { id: HabitCategory; label: string }[] = [
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'movement', label: 'Movement' },
  { id: 'evening', label: 'Evening' },
  { id: 'custom', label: 'Custom' },
];
const TIMES: { id: TimeOfDay; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'anytime', label: 'Anytime' },
];
const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ACCENT_COLORS = ['#A78BFA', '#6EE7B7', '#F472B6', '#FBBF24', '#60A5FA'];

export default function AddHabitModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { theme } = useAuraTheme();
  const { habits, addHabit, updateHabit, archiveHabit } = useAuraStore();

  const existingHabit = useMemo(
    () => (id ? habits.find((h) => h.id === id) : undefined),
    [habits, id]
  );

  const [title, setTitle] = useState(existingHabit?.title ?? '');
  const [icon, setIcon] = useState(existingHabit?.icon ?? '✨');
  const [category, setCategory] = useState<HabitCategory>(
    existingHabit?.category ?? 'mindfulness'
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    existingHabit?.timeOfDay ?? 'morning'
  );
  const [frequencyDays, setFrequencyDays] = useState<number[]>(
    existingHabit?.frequencyDays ?? [0, 1, 2, 3, 4, 5, 6]
  );
  const [accentColor, setAccentColor] = useState(
    existingHabit?.accentColor ?? ACCENT_COLORS[0]
  );
  const [saving, setSaving] = useState(false);

  const toggleDay = (dayIdx: number) => {
    setFrequencyDays((prev) =>
      prev.includes(dayIdx)
        ? prev.length > 1
          ? prev.filter((d) => d !== dayIdx)
          : prev
        : [...prev, dayIdx].sort((a, b) => a - b)
    );
  };

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      if (existingHabit) {
        await updateHabit(existingHabit.id, {
          title: trimmed,
          icon,
          category,
          timeOfDay,
          frequencyDays,
          accentColor,
        });
      } else {
        await addHabit({
          title: trimmed,
          icon,
          category,
          timeOfDay,
          frequencyDays,
          reminderTime: null,
          accentColor,
        });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existingHabit) return;
    Alert.alert('Archive Ritual?', `Remove "${existingHabit.title}" from your daily list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          await archiveHabit(existingHabit.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          {existingHabit ? 'Edit Ritual' : 'New Ritual'}
        </Text>
        <View style={styles.topActions}>
          {existingHabit && (
            <Pressable onPress={handleDelete} hitSlop={10} style={styles.iconBtn}>
              <Trash2 size={20} color={theme.colors.error} />
            </Pressable>
          )}
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
            <X size={22} color={theme.colors.onSurface} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            RITUAL NAME
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. 10 min morning journaling"
            placeholderTextColor={theme.colors.outline}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceContainer,
                color: theme.colors.onSurface,
                borderColor: theme.colors.cardBorder,
                borderRadius: theme.radius.card,
              },
            ]}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            CHOOSE AN ICON
          </Text>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map((em) => {
              const active = icon === em;
              return (
                <Pressable
                  key={em}
                  onPress={() => setIcon(em)}
                  style={[
                    styles.emojiItem,
                    {
                      backgroundColor: active
                        ? theme.isDark
                          ? 'rgba(167, 139, 250, 0.25)'
                          : theme.colors.lavender
                        : theme.colors.surfaceContainer,
                      borderColor: active
                        ? theme.colors.lavender
                        : theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Text style={styles.emojiChar}>{em}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            TIME OF DAY
          </Text>
          <View style={styles.chipWrap}>
            {TIMES.map((t) => (
              <AuraChip
                key={t.id}
                label={t.label}
                selected={timeOfDay === t.id}
                onPress={() => setTimeOfDay(t.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            CATEGORY
          </Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((c) => (
              <AuraChip
                key={c.id}
                label={c.label}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            FREQUENCY
          </Text>
          <View style={styles.daysRow}>
            {WEEK_DAYS.map((day, idx) => {
              const active = frequencyDays.includes(idx);
              return (
                <Pressable
                  key={`${day}_${idx}`}
                  onPress={() => toggleDay(idx)}
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: active
                        ? theme.colors.primary
                        : theme.colors.surfaceContainer,
                      borderColor: theme.colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: active ? theme.colors.onPrimary : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            AURA ACCENT
          </Text>
          <View style={styles.colorRow}>
            {ACCENT_COLORS.map((col) => {
              const active = accentColor === col;
              return (
                <Pressable
                  key={col}
                  onPress={() => setAccentColor(col)}
                  style={[
                    styles.colorSwatch,
                    {
                      backgroundColor: col,
                      borderWidth: active ? 3 : 0,
                      borderColor: theme.colors.onSurface,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <AuraButton
          label={existingHabit ? 'Save Changes' : 'Create Ritual'}
          onPress={handleSave}
          disabled={!title.trim()}
          loading={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 22,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  scroll: {
    padding: 20,
    gap: 22,
    paddingBottom: 40,
  },
  section: {
    gap: 10,
  },
  label: {
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    letterSpacing: 1,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontFamily: fontFamilies.medium,
    fontSize: 15,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiItem: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChar: {
    fontSize: 22,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontFamily: fontFamilies.semibold,
    fontSize: 13,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 14,
  },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 999,
  },
  saveBtn: {
    marginTop: 8,
  },
});
