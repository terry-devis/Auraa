import React from 'react';
import { Stack } from 'expo-router';
import { useAuraTheme } from '@/theme/ThemeProvider';

export default function OnboardingLayout() {
  const { theme } = useAuraTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="ritual-selection" />
      <Stack.Screen name="reminders-soundscapes" />
    </Stack>
  );
}
