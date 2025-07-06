import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme, useThemeColors, useIsDarkMode } from '../contexts/ThemeContext';

export default function DarkModeTest() {
  const { 
    theme, 
    colorScheme, 
    isManualOverride, 
    toggleTheme, 
    resetToSystemTheme, 
    debugInfo 
  } = useTheme();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            🌙 Dark Mode Test & Debug
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Complete theme system testing
          </Text>
        </View>

        {/* Current Status */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Status</Text>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Active Theme:</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
              borderColor: colors.border 
            }]}>
              <Text style={[styles.statusValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                {isDark ? '🌙 Dark' : '☀️ Light'}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Manual Override:</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: isManualOverride ? colors.primary : colors.surface,
              borderColor: colors.border 
            }]}>
              <Text style={[styles.statusValue, { 
                color: isManualOverride ? '#ffffff' : colors.text 
              }]}>
                {isManualOverride ? 'ON' : 'OFF'}
              </Text>
            </View>
          </View>
        </View>

        {/* Debug Information */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Debug Information</Text>
          
          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>
              📱 System Color Scheme (useColorScheme):
            </Text>
            <Text style={[styles.debugValue, { color: colors.text }]}>
              {debugInfo.systemColorScheme || 'null'}
            </Text>
          </View>

          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>
              🎨 Theme Context Color Scheme:
            </Text>
            <Text style={[styles.debugValue, { color: colors.text }]}>
              {debugInfo.contextColorScheme}
            </Text>
          </View>

          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>
              🔍 Appearance.getColorScheme():
            </Text>
            <Text style={[styles.debugValue, { color: colors.text }]}>
              {debugInfo.appearanceColorScheme || 'null'}
            </Text>
          </View>

          <View style={styles.debugRow}>
            <Text style={[styles.debugLabel, { color: colors.textSecondary }]}>
              🌑 Is Dark Mode Active:
            </Text>
            <Text style={[styles.debugValue, { color: colors.text }]}>
              {isDark ? 'true' : 'false'}
            </Text>
          </View>
        </View>

        {/* Theme Colors Preview */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme Colors</Text>
          
          <View style={styles.colorGrid}>
            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.background }]} />
              <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Background</Text>
              <Text style={[styles.colorValue, { color: colors.text }]}>{colors.background}</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.surface }]} />
              <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Surface</Text>
              <Text style={[styles.colorValue, { color: colors.text }]}>{colors.surface}</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.primary }]} />
              <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Primary</Text>
              <Text style={[styles.colorValue, { color: colors.text }]}>{colors.primary}</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.text }]} />
              <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Text</Text>
              <Text style={[styles.colorValue, { color: colors.text }]}>{colors.text}</Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Controls</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={toggleTheme}
          >
            <Text style={styles.buttonText}>
              {isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
            </Text>
          </TouchableOpacity>

          {isManualOverride && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border 
              }]}
              onPress={resetToSystemTheme}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                🔄 Reset to System Theme
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Instructions */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Testing Instructions</Text>
          
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            1. Change your device's system theme in Settings
          </Text>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            2. Watch the debug values update automatically
          </Text>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            3. Use manual toggle to override system theme
          </Text>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            4. Reset to system theme when done testing
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  debugRow: {
    marginBottom: 8,
  },
  debugLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  debugValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  colorValue: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  instruction: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
});
