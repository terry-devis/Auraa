import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import {
  getAppIconName,
  setAlternateAppIcon,
  supportsAlternateIcons,
} from 'expo-alternate-app-icons';
import {
  AuraTheme,
  AuraThemeName,
  ThemePreference,
  midnightGlowTheme,
  sereneGlowTheme,
} from './tokens';

interface ThemeContextValue {
  theme: AuraTheme;
  themeName: AuraThemeName;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: midnightGlowTheme,
  themeName: 'midnight',
  preference: 'system',
  setPreference: () => {},
  toggleTheme: () => {},
});

interface AuraThemeProviderProps {
  preference: ThemePreference;
  onChangePreference: (pref: ThemePreference) => void;
  children: React.ReactNode;
}

export function AuraThemeProvider({
  preference,
  onChangePreference,
  children,
}: AuraThemeProviderProps) {
  const systemScheme = useColorScheme();

  const resolvedName: AuraThemeName = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'light' ? 'serene' : 'midnight';
    }
    return preference;
  }, [preference, systemScheme]);

  const theme = resolvedName === 'serene' ? sereneGlowTheme : midnightGlowTheme;

  // Sync home-screen launcher icon:
  // Pink (default / null) for 'system' or 'serene'; Dark ('MidnightIcon') when user switches to 'midnight'
  useEffect(() => {
    if (Platform.OS === 'web' || !supportsAlternateIcons) return;
    const targetIcon = preference === 'midnight' ? 'MidnightIcon' : null;
    try {
      const current = getAppIconName();
      if (current !== targetIcon) {
        setAlternateAppIcon(targetIcon).catch(() => {});
      }
    } catch {
      // Ignore in Expo Go where native alternate icon module is not linked
    }
  }, [preference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeName: resolvedName,
      preference,
      setPreference: onChangePreference,
      toggleTheme: () => {
        const next: AuraThemeName = resolvedName === 'midnight' ? 'serene' : 'midnight';
        onChangePreference(next);
      },
    }),
    [theme, resolvedName, preference, onChangePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAuraTheme() {
  return useContext(ThemeContext);
}
