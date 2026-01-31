import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme, Platform, Appearance } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  primaryLight: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  notification: string;
  isDark: boolean;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    primary: '#f3a823',
    primaryLight: '#fef3e2',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E5E5E5',
    card: '#ffffff',
    notification: '#FF3B30',
    isDark: false,
  },
  isDark: false,
};

const darkTheme: Theme = {
  colors: {
    background: '#000000',
    surface: '#1C1C1E',
    primary: '#f3a823',
    primaryLight: '#2a2416',
    text: '#ffffff',
    textSecondary: '#8E8E93',
    border: '#38383A',
    card: '#1C1C1E',
    notification: '#FF453A',
    isDark: true,
  },
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  isManualOverride: boolean;
  toggleTheme: () => void;
  resetToSystemTheme: () => void;
  setThemeMode: (mode: ColorScheme) => void;
  setNavigationBarStyle: () => Promise<void>;
  debugInfo: {
    systemColorScheme: ColorScheme | null;
    contextColorScheme: ColorScheme;
    appearanceColorScheme: ColorScheme | null;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isManualOverride, setIsManualOverride] = useState(false);
  
  // Force light mode
  const colorScheme = 'light';
  const theme = lightTheme;

  // No-op functions for theme switching
  const toggleTheme = useCallback(() => {}, []);
  const resetToSystemTheme = useCallback(() => {}, []);
  const setThemeMode = useCallback(() => {}, []);
  
  const setNavigationBarStyle = useCallback(async () => {
    try {
      await NavigationBar.setBackgroundColorAsync(theme.colors.background);
      await NavigationBar.setButtonStyleAsync('dark'); // Always dark buttons for light background
    } catch (error) {
      console.warn('Failed to set navigation bar style:', error);
    }
  }, [theme]);
  
  // Apply theme-related system UI settings
  useEffect(() => {
    setNavigationBarStyle();
    
    // Set root view background color
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(console.warn);
  }, [theme, setNavigationBarStyle]);

  const value: ThemeContextType = {
    theme,
    colorScheme,
    isManualOverride,
    toggleTheme,
    resetToSystemTheme,
    setThemeMode,
    setNavigationBarStyle,
    debugInfo: {
      systemColorScheme: 'light' as ColorScheme,
      contextColorScheme: 'light' as ColorScheme,
      appearanceColorScheme: 'light' as ColorScheme,
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper hook for getting theme colors directly
export const useThemeColors = (): ThemeColors => {
  const { theme } = useTheme();
  return theme.colors;
};

// Helper hook for getting dark mode status
export const useIsDarkMode = (): boolean => {
  const { theme } = useTheme();
  return theme.isDark;
};
