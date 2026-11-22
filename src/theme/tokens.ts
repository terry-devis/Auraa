export type AuraThemeName = 'serene' | 'midnight';
export type ThemePreference = AuraThemeName | 'system';

export interface AuraTheme {
  name: AuraThemeName;
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceLow: string;
    surfaceContainer: string;
    surfaceHigh: string;
    surfaceHighest: string;
    onSurface: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    sage: string;
    blush: string;
    lavender: string;
    error: string;
    cardBorder: string;
    cardActiveBorder: string;
    glassSurface: string;
  };
  radius: {
    sm: number;
    md: number;
    card: number;
    xl: number;
    full: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    screenMargin: number;
  };
  shadows: {
    card: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    glow: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

export const sereneGlowTheme: AuraTheme = {
  name: 'serene',
  isDark: false,
  colors: {
    background: '#fff8f4',
    surface: '#fff8f4',
    surfaceLow: '#fbf2ec',
    surfaceContainer: '#ffffff',
    surfaceHigh: '#efe7e1',
    surfaceHighest: '#e9e1db',
    onSurface: '#1e1b18',
    onSurfaceVariant: '#47464b',
    outline: '#78767b',
    outlineVariant: '#c8c5cb',
    primary: '#1a1a1e',
    onPrimary: '#fff6f0',
    primaryContainer: '#1b1b1f',
    secondary: '#605982',
    onSecondary: '#ffffff',
    secondaryContainer: '#d7cefe',
    tertiary: '#354c3a',
    onTertiary: '#ffffff',
    tertiaryContainer: '#cde8d0',
    sage: '#cde8d0',
    blush: '#ffd1dc',
    lavender: '#d8cfff',
    error: '#ba1a1a',
    cardBorder: 'rgba(26, 26, 30, 0.04)',
    cardActiveBorder: 'rgba(96, 89, 130, 0.28)',
    glassSurface: 'rgba(255, 248, 244, 0.85)',
  },
  radius: {
    sm: 8,
    md: 12,
    card: 20,
    xl: 24,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 32,
    screenMargin: 20,
  },
  shadows: {
    card: {
      shadowColor: '#1a1a1e',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 2,
    },
    glow: {
      shadowColor: '#d8cfff',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 4,
    },
  },
};

export const midnightGlowTheme: AuraTheme = {
  name: 'midnight',
  isDark: true,
  colors: {
    background: '#13131a',
    surface: '#13131a',
    surfaceLow: '#1b1b22',
    surfaceContainer: '#1f1f26',
    surfaceHigh: '#2a2931',
    surfaceHighest: '#34343c',
    onSurface: '#e4e1ec',
    onSurfaceVariant: '#cac4d4',
    outline: '#948e9d',
    outlineVariant: '#494552',
    primary: '#cebdff',
    onPrimary: '#381385',
    primaryContainer: '#a78bfa',
    secondary: '#62dcad',
    onSecondary: '#003827',
    secondaryContainer: '#18a479',
    tertiary: '#ffafd3',
    onTertiary: '#620040',
    tertiaryContainer: '#f170b4',
    sage: '#6ee7b7',
    blush: '#f472b6',
    lavender: '#a78bfa',
    error: '#ffb4ab',
    cardBorder: 'rgba(196, 181, 253, 0.12)',
    cardActiveBorder: 'rgba(110, 231, 183, 0.40)',
    glassSurface: 'rgba(20, 20, 32, 0.78)',
  },
  radius: {
    sm: 8,
    md: 12,
    card: 20,
    xl: 24,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 32,
    screenMargin: 20,
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 4,
    },
    glow: {
      shadowColor: '#a78bfa',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 20,
      elevation: 6,
    },
  },
};

export const fontFamilies = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;
