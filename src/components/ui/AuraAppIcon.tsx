import React from 'react';
import { Image, StyleProp, ImageStyle } from 'react-native';
import { useAuraTheme } from '@/theme/ThemeProvider';

const LIGHT_ICON = require('@/assets/images/icon-light.png');
const DARK_ICON = require('@/assets/images/icon-dark.png');

interface AuraAppIconProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function AuraAppIcon({ size = 32, style }: AuraAppIconProps) {
  const { theme } = useAuraTheme();
  return (
    <Image
      source={theme.isDark ? DARK_ICON : LIGHT_ICON}
      style={[{ width: size, height: size, borderRadius: size * 0.24 }, style]}
      resizeMode="contain"
    />
  );
}
