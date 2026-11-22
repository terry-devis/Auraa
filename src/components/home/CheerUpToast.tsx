import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';

export const CHEER_UP_MESSAGES = [
  'Main character energy ✨',
  'Consistency looks good on you 🌿',
  'Future you is smiling 🌙',
  'Soft progress counts 💫',
  'Protecting your peace 🕊️',
  'Glowing from the inside out 🌸',
];

interface CheerUpToastProps {
  message: string | null;
}

export function CheerUpToast({ message }: CheerUpToastProps) {
  const { theme } = useAuraTheme();
  const translateY = useSharedValue(-30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (message) {
      translateY.set(withSpring(0, { damping: 14, stiffness: 180 }));
      opacity.set(withTiming(1, { duration: 180 }));
    } else {
      translateY.set(withTiming(-24, { duration: 180 }));
      opacity.set(withTiming(0, { duration: 180 }));
    }
  }, [message, translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        theme.shadows.glow,
        animStyle,
        {
          backgroundColor: theme.isDark
            ? theme.colors.surfaceHigh
            : theme.colors.primary,
          borderColor: theme.colors.cardActiveBorder,
        },
      ]}
    >
      <Sparkles
        size={15}
        color={theme.isDark ? theme.colors.sage : theme.colors.blush}
      />
      <Text
        style={[
          styles.text,
          { color: theme.isDark ? theme.colors.onSurface : theme.colors.onPrimary },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontFamily: fontFamilies.semibold,
    fontSize: 13,
  },
});
