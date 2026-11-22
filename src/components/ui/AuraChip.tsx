import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';

interface AuraChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

export function AuraChip({ label, selected = false, onPress, icon }: AuraChipProps) {
  const { theme } = useAuraTheme();

  const backgroundColor = selected
    ? theme.isDark
      ? 'rgba(167, 139, 250, 0.22)'
      : theme.colors.blush
    : theme.isDark
      ? theme.colors.surfaceLow
      : theme.colors.surfaceContainer;

  const borderColor = selected
    ? theme.isDark
      ? theme.colors.lavender
      : 'rgba(26, 26, 30, 0.12)'
    : theme.colors.cardBorder;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.onSurface,
            fontFamily: selected ? fontFamilies.semibold : fontFamilies.medium,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
  },
});
