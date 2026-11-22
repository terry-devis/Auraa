import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';

interface AuraCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'completed';
  padding?: 'none' | 'md' | 'lg';
}

export function AuraCard({
  children,
  style,
  variant = 'default',
  padding = 'lg',
}: AuraCardProps) {
  const { theme } = useAuraTheme();

  const backgroundColor =
    variant === 'completed'
      ? theme.isDark
        ? 'rgba(110, 231, 183, 0.10)'
        : theme.colors.sage
      : variant === 'elevated'
        ? theme.colors.surfaceHigh
        : theme.colors.surfaceContainer;

  const borderColor =
    variant === 'completed' ? theme.colors.cardActiveBorder : theme.colors.cardBorder;

  const paddingValue =
    padding === 'none' ? 0 : padding === 'md' ? theme.spacing.md : theme.spacing.lg;

  return (
    <View
      style={[
        styles.card,
        theme.shadows.card,
        {
          backgroundColor,
          borderColor,
          borderRadius: theme.radius.card,
          padding: paddingValue,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
