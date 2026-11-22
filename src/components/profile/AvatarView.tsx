import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PRESET_AVATARS } from '@/constants/avatars';
import { AvatarType } from '@/db/schema';
import { useAuraTheme } from '@/theme/ThemeProvider';

interface AvatarViewProps {
  avatarType: AvatarType;
  avatarValue: string;
  size?: number;
}

export function AvatarView({
  avatarType,
  avatarValue,
  size = 48,
}: AvatarViewProps) {
  const { theme } = useAuraTheme();

  if (avatarType === 'custom' && avatarValue) {
    return (
      <View
        style={[
          styles.frame,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: theme.colors.cardActiveBorder,
          },
        ]}
      >
        <Image
          source={{ uri: avatarValue }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      </View>
    );
  }

  const preset =
    PRESET_AVATARS.find((a) => a.id === avatarValue) ?? PRESET_AVATARS[0];

  return (
    <LinearGradient
      colors={preset.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: theme.colors.cardBorder,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.48 }}>{preset.emoji}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
