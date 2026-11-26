import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@pupil_theme_mode';

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const DARK_THEME = {
  mode: 'dark',
  isDark: true,
  background: '#080D1A',
  backgroundSecondary: '#0F172A',
  gradientColors: ['#080D1A', '#0F172A', '#111827'],
  cardBg: 'rgba(30, 41, 59, 0.65)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  cardElevated: 'rgba(30, 41, 59, 0.85)',
  statCardBg: 'rgba(30, 41, 59, 0.65)',
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0F172A',
  },
  input: {
    bg: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.18)',
    focusBorder: '#60A5FA',
    text: '#FFFFFF',
    placeholder: 'rgba(255, 255, 255, 0.45)',
  },
  taskbar: {
    blurTint: 'dark',
    overlay: 'rgba(15, 23, 42, 0.72)',
    border: 'rgba(255, 255, 255, 0.16)',
    activeTabBg: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    bg: 'rgba(15, 23, 42, 0.92)',
    border: 'rgba(255, 255, 255, 0.08)',
    title: '#FFFFFF',
    subtitle: '#94A3B8',
  },
  statusBarStyle: 'light-content',
};

export const LIGHT_THEME = {
  mode: 'light',
  isDark: false,
  background: '#F1F5F9',
  backgroundSecondary: '#FFFFFF',
  gradientColors: ['#F8FAFC', '#EFF6FF', '#E2E8F0'],
  cardBg: '#FFFFFF',
  cardBorder: 'rgba(226, 232, 240, 0.9)',
  cardElevated: '#FFFFFF',
  statCardBg: '#FFFFFF',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },
  input: {
    bg: '#F8FAFC',
    border: '#CBD5E1',
    focusBorder: '#2563EB',
    text: '#0F172A',
    placeholder: '#94A3B8',
  },
  taskbar: {
    blurTint: 'light',
    overlay: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(0, 0, 0, 0.08)',
    activeTabBg: 'rgba(0, 0, 0, 0.06)',
  },
  header: {
    bg: 'rgba(255, 255, 255, 0.95)',
    border: '#E2E8F0',
    title: '#0F172A',
    subtitle: '#475569',
  },
  statusBarStyle: 'dark-content',
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const hookScheme = useColorScheme(); // 'light' | 'dark' | null
  const [currentSystemScheme, setCurrentSystemScheme] = useState(
    hookScheme || Appearance.getColorScheme() || 'dark'
  );
  const [themeMode, setThemeModeState] = useState(THEME_MODES.DARK);

  // Subscribe to hardware/OS system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setCurrentSystemScheme(colorScheme);
      }
    });

    if (hookScheme) {
      setCurrentSystemScheme(hookScheme);
    }

    // Load persisted theme preference
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && Object.values(THEME_MODES).includes(saved)) {
          setThemeModeState(saved);
        }
      } catch {
        // Fallback to dark
      }
    };
    loadTheme();

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [hookScheme]);

  const setThemeMode = async (mode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignored
    }
  };

  const toggleTheme = () => {
    const activeIsDark =
      themeMode === THEME_MODES.DARK ||
      (themeMode === THEME_MODES.SYSTEM && currentSystemScheme === 'dark');
    setThemeMode(activeIsDark ? THEME_MODES.LIGHT : THEME_MODES.DARK);
  };

  const resolvedTheme = useMemo(() => {
    let isDarkTheme = true;

    if (themeMode === THEME_MODES.DARK) {
      isDarkTheme = true;
    } else if (themeMode === THEME_MODES.LIGHT) {
      isDarkTheme = false;
    } else if (themeMode === THEME_MODES.SYSTEM) {
      const activeSys = currentSystemScheme || Appearance.getColorScheme() || 'dark';
      isDarkTheme = activeSys === 'dark';
    }

    return isDarkTheme ? DARK_THEME : LIGHT_THEME;
  }, [themeMode, currentSystemScheme]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleTheme,
      isDark: resolvedTheme.isDark,
      colors: resolvedTheme,
      systemScheme: currentSystemScheme,
    }),
    [themeMode, resolvedTheme, currentSystemScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
