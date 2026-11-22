import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AuraThemeProvider, useAuraTheme } from '@/theme/ThemeProvider';
import { useAuraStore } from '@/store/useAuraStore';
import { ThemePreference } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { theme } = useAuraTheme();
  const { profile } = useAuraStore();
  const segments = useSegments();

  useEffect(() => {
    if (!profile) return;
    const inOnboarding = segments[0] === '(onboarding)';
    if (!profile.onboardingCompleted && !inOnboarding) {
      router.replace('/(onboarding)/profile-setup');
    }
  }, [profile, segments]);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen
          name="add-habit"
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="share-studio"
          options={{
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const { isReady, profile, bootstrap, updateProfile } = useAuraStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (fontsLoaded && isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isReady]);

  if (!fontsLoaded || !isReady) {
    return null;
  }

  const preference: ThemePreference = profile?.themeMode ?? 'system';

  return (
    <AuraThemeProvider
      preference={preference}
      onChangePreference={(next) => updateProfile({ themeMode: next })}
    >
      <RootNavigator />
    </AuraThemeProvider>
  );
}
