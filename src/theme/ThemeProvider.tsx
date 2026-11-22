import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
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
