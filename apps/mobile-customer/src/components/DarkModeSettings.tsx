import React from 'react';
import { View, Text, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { Appearance } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeColors } from '../contexts/ThemeContext';

export default function DarkModeSettings() {
  const {
    theme,
    colorScheme,
    isManualOverride,
    toggleTheme,
    resetToSystemTheme,
    setThemeMode,
    debugInfo
  } = useTheme();
  const colors = useThemeColors();
  const systemColorScheme = useColorScheme();

  const themeOptions = [
    {
      id: 'system',
      title: 'Use System Settings',
      subtitle: 'Automatically match your device theme',
      icon: 'phone-portrait-outline',
      isSelected: !isManualOverride,
    },
    {
      id: 'light',
      title: 'Light Mode',
      subtitle: 'Always use light theme',
      icon: 'sunny-outline',
      isSelected: isManualOverride && colorScheme === 'light',
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      subtitle: 'Always use dark theme',
      icon: 'moon-outline',
      isSelected: isManualOverride && colorScheme === 'dark',
    },
  ];

  const handleThemeSelection = (optionId: string) => {
    switch (optionId) {
      case 'system':
        resetToSystemTheme();
        Alert.alert(
          'System Theme Enabled',
          'The app will now automatically match your device theme settings.',
          [{ text: 'OK' }]
        );
        break;
      case 'light':
        setThemeMode('light');
        Alert.alert(
          'Light Mode Enabled',
          'The app will always use light theme regardless of your device settings.',
          [{ text: 'OK' }]
        );
        break;
      case 'dark':
        setThemeMode('dark');
        Alert.alert(
          'Dark Mode Enabled',
          'The app will always use dark theme regardless of your device settings.',
          [{ text: 'OK' }]
        );
        break;
    }
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 12,
      }}>
        <Ionicons 
          name="contrast-outline" 
          size={20} 
          color={colors.primary} 
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 2,
          }}>
            Appearance
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
          }}>
            Choose how the app looks
          </Text>
        </View>
        <View style={{
          backgroundColor: theme.isDark ? colors.primary : colors.background,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.isDark ? colors.surface : colors.textSecondary,
          }}>
            {theme.isDark ? '🌙 DARK' : '☀️ LIGHT'}
          </Text>
        </View>
      </View>

      {/* Theme Options */}
      {themeOptions.map((option, index) => (
        <TouchableOpacity
          key={option.id}
          onPress={() => handleThemeSelection(option.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderTopWidth: index > 0 ? 1 : 0,
            borderTopColor: colors.border,
            backgroundColor: option.isSelected ? colors.primaryLight : 'transparent',
          }}
        >
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: option.isSelected ? colors.primary : colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons 
              name={option.icon as any} 
              size={20} 
              color={option.isSelected ? colors.surface : colors.textSecondary} 
            />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: option.isSelected ? '600' : '400',
              color: colors.text,
              marginBottom: 2,
            }}>
              {option.title}
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
            }}>
              {option.subtitle}
            </Text>
          </View>

          {option.isSelected && (
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color={colors.primary} 
            />
          )}
        </TouchableOpacity>
      ))}

      {/* Current Status Info */}
      <View style={{
        backgroundColor: colors.background,
        margin: 16,
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        <Text style={{
          fontSize: 12,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 16,
        }}>
          {isManualOverride
            ? `Manual override: ${colorScheme} mode`
            : `System mode: ${systemColorScheme || Appearance.getColorScheme() || 'unknown'} → App: ${colorScheme}`
          }
        </Text>
      </View>
    </View>
  );
}
