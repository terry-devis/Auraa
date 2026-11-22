import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Flame, Pencil } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Habit } from '@/db/schema';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { AuraCard } from '@/components/ui/AuraCard';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  hapticsEnabled?: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export function HabitCard({
  habit,
  completed,
  streak,
  hapticsEnabled = true,
  onToggle,
  onEdit,
}: HabitCardProps) {
  const { theme } = useAuraTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.set(
      withSpring(0.97, { damping: 14 }, () => {
        scale.set(withSpring(1, { damping: 12 }));
      })
    );
    if (hapticsEnabled) {
      Haptics.notificationAsync(
        completed
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
    }
    onToggle();
  };

  const checkboxBg = completed ? theme.colors.sage : 'transparent';
  const checkboxBorder = completed
    ? theme.colors.sage
    : theme.isDark
      ? 'rgba(206, 189, 255, 0.35)'
      : 'rgba(26, 26, 30, 0.18)';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onEdit}
      onPressIn={() => {
        scale.set(withTiming(0.985, { duration: 100 }));
      }}
      onPressOut={() => {
        scale.set(withTiming(1, { duration: 140 }));
      }}
      style={animatedStyle}
    >
      <AuraCard variant={completed ? 'completed' : 'default'} padding="md">
        <View style={styles.row}>
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255,255,255,0.06)'
                  : theme.colors.surfaceLow,
              },
            ]}
          >
            <Text style={styles.emoji}>{habit.icon}</Text>
          </View>

          <View style={styles.content}>
            <Text
              numberOfLines={1}
              style={[
                styles.title,
                {
                  color: theme.colors.onSurface,
                  textDecorationLine: completed ? 'line-through' : 'none',
                  opacity: completed ? 0.72 : 1,
                },
              ]}
            >
              {habit.title}
            </Text>

            <View style={styles.metaRow}>
              <Text style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                {habit.timeOfDay.toUpperCase()}
              </Text>
              {streak > 0 && (
                <View
                  style={[
                    styles.streakPill,
                    {
                      backgroundColor: theme.isDark
                        ? 'rgba(244, 114, 182, 0.14)'
                        : theme.colors.blush,
                    },
                  ]}
                >
                  <Flame size={11} color={theme.isDark ? '#FDA4AF' : '#9D174D'} />
                  <Text
                    style={[
                      styles.streakText,
                      { color: theme.isDark ? '#FDA4AF' : '#9D174D' },
                    ]}
                  >
                    {streak}d
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Pressable
            onPress={onEdit}
            hitSlop={10}
            style={styles.editBtn}
            accessibilityLabel={`Edit ${habit.title}`}
          >
            <Pencil size={15} color={theme.colors.outline} />
          </Pressable>

          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: checkboxBg,
                borderColor: checkboxBorder,
              },
            ]}
          >
            {completed && (
              <Check
                size={15}
                strokeWidth={3}
                color={theme.isDark ? '#0D0D14' : '#1A1A1E'}
              />
            )}
          </View>
        </View>
      </AuraCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fontFamilies.semibold,
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontFamily: fontFamilies.medium,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  streakText: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
  },
  editBtn: {
    padding: 6,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
