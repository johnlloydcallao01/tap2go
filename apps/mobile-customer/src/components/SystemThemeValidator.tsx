import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useColorScheme, Appearance, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useThemeColors, useIsDarkMode } from '../contexts/ThemeContext';

export default function SystemThemeValidator() {
  const { theme, colorScheme, isManualOverride, debugInfo, resetToSystemTheme } = useTheme();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const systemColorScheme = useColorScheme();
  
  const [testResults, setTestResults] = useState<{
    hookDetection: boolean;
    appearanceDetection: boolean;
    contextSync: boolean;
    manualOverride: boolean;
  }>({
    hookDetection: false,
    appearanceDetection: false,
    contextSync: false,
    manualOverride: false,
  });

  // Run validation tests
  useEffect(() => {
    const runTests = () => {
      const hookScheme = useColorScheme();
      const appearanceScheme = Appearance.getColorScheme();
      
      setTestResults({
        hookDetection: hookScheme !== null,
        appearanceDetection: appearanceScheme !== null,
        contextSync: !isManualOverride && (colorScheme === hookScheme || colorScheme === appearanceScheme),
        manualOverride: isManualOverride,
      });
    };

    runTests();
    const interval = setInterval(runTests, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [colorScheme, isManualOverride]);

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  const getStatusColor = (status: boolean) => {
    return status ? '#10B981' : '#EF4444';
  };

  const handleForceRefresh = () => {
    resetToSystemTheme();
    Alert.alert(
      'Theme Refreshed',
      'Forced system theme detection refresh. Check if the theme matches your device settings.',
      [{ text: 'OK' }]
    );
  };

  const handleTestSystemChange = () => {
    Alert.alert(
      'Test Instructions',
      'To test system theme detection:\n\n1. Go to your device Settings\n2. Change between Light/Dark mode\n3. Return to this app\n4. Check if the theme updates automatically\n\nNote: You must have "Use System Settings" selected in the Account screen.',
      [{ text: 'Got it' }]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
          }}>
            System Theme Detection Validator
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
          }}>
            This tool helps diagnose dark mode detection issues
          </Text>
        </View>

        {/* Current Status */}
        <View style={{
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>
            Current Status
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textSecondary }}>Active Theme:</Text>
            <Text style={{ color: colors.text, fontWeight: '500' }}>
              {colorScheme} {isDark ? '🌙' : '☀️'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: colors.textSecondary }}>Manual Override:</Text>
            <Text style={{ color: colors.text, fontWeight: '500' }}>
              {isManualOverride ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.textSecondary }}>Platform:</Text>
            <Text style={{ color: colors.text, fontWeight: '500' }}>
              {Platform.OS}
            </Text>
          </View>
        </View>

        {/* Test Results */}
        <View style={{
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>
            Detection Tests
          </Text>
          
          {[
            {
              label: 'useColorScheme Hook',
              status: testResults.hookDetection,
              description: 'React Native hook detects system theme'
            },
            {
              label: 'Appearance API',
              status: testResults.appearanceDetection,
              description: 'Fallback API detects system theme'
            },
            {
              label: 'Context Sync',
              status: testResults.contextSync,
              description: 'Theme context matches system detection'
            }
          ].map((test, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              padding: 12,
              backgroundColor: colors.background,
              borderRadius: 8,
            }}>
              <Text style={{ fontSize: 18, marginRight: 12 }}>
                {getStatusIcon(test.status)}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: colors.text,
                  marginBottom: 2,
                }}>
                  {test.label}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                }}>
                  {test.description}
                </Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: getStatusColor(test.status),
                fontWeight: '500',
              }}>
                {test.status ? 'PASS' : 'FAIL'}
              </Text>
            </View>
          ))}
        </View>

        {/* Debug Information */}
        <View style={{
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}>
            Debug Information
          </Text>
          
          <Text style={{
            fontSize: 12,
            color: colors.textSecondary,
            fontFamily: 'monospace',
            lineHeight: 16,
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={handleForceRefresh}
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="refresh" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
            }}>
              Force Refresh System Theme
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTestSystemChange}
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="help-circle" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: '600',
            }}>
              How to Test
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
