import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAuraTheme } from '@/theme/ThemeProvider';
import { fontFamilies } from '@/theme/tokens';
import { AuraButton } from '@/components/ui/AuraButton';

interface CelebrationModalProps {
  visible: boolean;
  completedCount: number;
  onClose: () => void;
}

export function CelebrationModal({
  visible,
  completedCount,
  onClose,
}: CelebrationModalProps) {
  const { theme } = useAuraTheme();
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.set(withTiming(1, { duration: 220 }));
      scale.set(withSpring(1, { damping: 14, stiffness: 160 }));
    } else {
      opacity.set(0);
      scale.set(0.85);
    }
  }, [visible, opacity, scale]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.card,
            theme.shadows.glow,
            cardStyle,
            {
              backgroundColor: theme.colors.surfaceContainer,
              borderColor: theme.colors.cardActiveBorder,
              borderRadius: theme.radius.xl,
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.inner}>
            <View
              style={[
                styles.haloBadge,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(110, 231, 183, 0.16)'
                    : theme.colors.sage,
                },
              ]}
            >
              <Sparkles size={32} color={theme.isDark ? '#6EE7B7' : '#092011'} />
            </View>

            <Text style={[styles.eyebrow, { color: theme.colors.secondary }]}>
              FULL AURA UNLOCKED
            </Text>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              All {completedCount} rituals complete ✨
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              You showed up for yourself today. Take a deep breath and let that calm sink in.
            </Text>

            <AuraButton label="Keep Glowing" onPress={onClose} style={styles.btn} />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 20, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    padding: 24,
  },
  inner: {
    alignItems: 'center',
    gap: 12,
  },
  haloBadge: {
    width: 68,
    height: 68,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  eyebrow: {
    fontFamily: fontFamilies.bold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: 22,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  btn: {
    width: '100%',
  },
});
