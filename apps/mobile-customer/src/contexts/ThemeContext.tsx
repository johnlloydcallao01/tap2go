import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    // Enhanced initialization with multiple fallbacks
    const hookScheme = systemColorScheme;
    const appearanceScheme = Appearance.getColorScheme();

    // Priority: useColorScheme hook > Appearance API > default light
    const initialScheme = hookScheme || appearanceScheme || 'light';

    // Debug logging for initialization
    if (__DEV__) {
      console.log('🎨 ThemeProvider Initialization:', {
        hookScheme,
        appearanceScheme,
        selectedScheme: initialScheme,
        platform: Platform.OS
      });
    }

    return initialScheme;
  });

  // Enhanced system color scheme listener
  useEffect(() => {
    if (isManualOverride) {
      return; // Don't update if user has manually set a theme
    }

    // Primary: Use useColorScheme hook result
    if (systemColorScheme) {
      if (__DEV__) {
        console.log('🎨 Theme updated via useColorScheme:', systemColorScheme);
      }
      setColorScheme(systemColorScheme);
      return;
    }

    // Fallback: Use Appearance API
    const fallbackScheme = Appearance.getColorScheme();
    if (fallbackScheme) {
      if (__DEV__) {
        console.log('🎨 Theme updated via Appearance API fallback:', fallbackScheme);
      }
      setColorScheme(fallbackScheme);
      return;
    }

    // Last resort: Keep current scheme or default to light
    if (__DEV__) {
      console.log('🎨 No system theme detected, keeping current:', colorScheme);
    }
  }, [systemColorScheme, isManualOverride, colorScheme]);

  // Enhanced Appearance API listener with better error handling
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      if (isManualOverride) {
        return; // Don't update if user has manually set a theme
      }

      if (newColorScheme) {
        if (__DEV__) {
          console.log('🎨 Theme changed via Appearance listener:', newColorScheme);
        }
        setColorScheme(newColorScheme);
      } else {
        // Handle case where newColorScheme is null
        if (__DEV__) {
          console.log('🎨 Appearance listener received null, checking current system state');
        }

        // Try to get current system theme
        const currentSystemScheme = Appearance.getColorScheme();
        if (currentSystemScheme) {
          setColorScheme(currentSystemScheme);
        }
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [isManualOverride]);

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  // Manual theme toggle
  const toggleTheme = () => {
    setIsManualOverride(true);
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
  };

  // Enhanced reset to system theme with immediate detection
  const resetToSystemTheme = () => {
    setIsManualOverride(false);

    // Immediately try to detect system theme
    const currentSystemScheme = systemColorScheme || Appearance.getColorScheme();
    if (currentSystemScheme) {
      setColorScheme(currentSystemScheme);
      if (__DEV__) {
        console.log('🎨 Reset to system theme:', currentSystemScheme);
      }
    } else {
      // If no system theme detected, force a re-check after a short delay
      setTimeout(() => {
        const delayedCheck = Appearance.getColorScheme();
        if (delayedCheck) {
          setColorScheme(delayedCheck);
          if (__DEV__) {
            console.log('🎨 Delayed system theme detection:', delayedCheck);
          }
        }
      }, 100);
    }
  };

  // Set specific theme mode (manual override)
  const setThemeMode = (mode: ColorScheme) => {
    setIsManualOverride(true);
    setColorScheme(mode);
  };

  const setNavigationBarStyle = async () => {
    if (Platform.OS === 'android') {
      try {
        // Set navigation bar button style
        await NavigationBar.setButtonStyleAsync(theme.isDark ? 'light' : 'dark');

        // Set system UI background color for better integration
        await SystemUI.setBackgroundColorAsync(theme.colors.background);
      } catch (error) {
        console.warn('Failed to set navigation bar style:', error);
      }
    }
  };

  // Apply navigation bar styling when theme changes
  useEffect(() => {
    setNavigationBarStyle();
  }, [theme]);

  // Enhanced debug information
  const debugInfo = {
    systemColorScheme,
    contextColorScheme: colorScheme,
    appearanceColorScheme: Appearance.getColorScheme(),
    isManualOverride,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
  };

  const contextValue: ThemeContextType = {
    theme,
    colorScheme,
    isManualOverride,
    toggleTheme,
    resetToSystemTheme,
    setThemeMode,
    setNavigationBarStyle,
    debugInfo,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
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
