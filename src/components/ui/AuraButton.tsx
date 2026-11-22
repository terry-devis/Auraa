import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AuraButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export function AuraButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  icon,
}: AuraButtonProps) {
  const { theme } = useAuraTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.set(withTiming(0.98, { duration: 120 }));
  };

  const handlePressOut = () => {
    scale.set(withTiming(1, { duration: 150 }));
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  if (variant === 'primary' && theme.isDark) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          animatedStyle,
          theme.shadows.glow,
          { borderRadius: theme.radius.card, opacity: disabled ? 0.5 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={['#C4B5FD', '#A78BFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, { borderRadius: theme.radius.card }]}
        >
          {loading ? (
            <ActivityIndicator color="#0D0D14" />
          ) : (
            <>
              {icon}
              <Text style={[styles.label, { color: '#0D0D14' }]}>{label}</Text>
            </>
          )}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  const bgColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.isDark
          ? theme.colors.surfaceLow
          : theme.colors.lavender
        : 'transparent';

  const textColor =
    variant === 'primary'
      ? theme.colors.onPrimary
      : variant === 'secondary'
        ? theme.colors.onSurface
        : theme.colors.onSurfaceVariant;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        styles.button,
        {
          backgroundColor: bgColor,
          borderRadius: theme.radius.card,
          borderWidth: variant === 'secondary' && theme.isDark ? 1 : 0,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fontFamilies.semibold,
    fontSize: 15,
    letterSpacing: 0.1,
  },
});
