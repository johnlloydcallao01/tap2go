import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme, useThemeColors, useIsDarkMode } from '../contexts/ThemeContext';

export default function ThemeDebugger() {
  const { theme, colorScheme, setNavigationBarStyle } = useTheme();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <View style={{
      position: 'absolute',
      top: 100,
      right: 10,
      backgroundColor: colors.surface,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 1000,
    }}>
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: 'bold' }}>
        Theme Debug
      </Text>
      <Text style={{ color: colors.text, fontSize: 10 }}>
        System: {colorScheme}
      </Text>
      <Text style={{ color: colors.text, fontSize: 10 }}>
        Dark: {isDark ? 'Yes' : 'No'}
      </Text>
      <Text style={{ color: colors.text, fontSize: 10 }}>
        BG: {colors.background}
      </Text>
      <TouchableOpacity
        onPress={setNavigationBarStyle}
        style={{
          backgroundColor: colors.primary,
          padding: 4,
          borderRadius: 4,
          marginTop: 4,
        }}
      >
        <Text style={{ color: 'white', fontSize: 8 }}>
          Update Nav Bar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
