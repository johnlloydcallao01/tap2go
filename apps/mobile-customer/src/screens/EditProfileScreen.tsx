import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { apiConfig } from '../config/environment';

export default function EditProfileScreen() {
  const colors = useThemeColors();
  const { user, updateUser, token } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [middleName, setMiddleName] = useState(user?.middleName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      firstName !== (user?.firstName ?? '') ||
      lastName !== (user?.lastName ?? '') ||
      (middleName || '') !== (user?.middleName ?? '') ||
      (username || '') !== (user?.username ?? '');
    setHasChanges(changed);
  }, [firstName, lastName, middleName, username, user]);

  const handleSave = async () => {
    if (!user?.id || !hasChanges) return;

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      Alert.alert('Required Fields', 'First name and last name are required.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string | null> = {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        middleName: middleName.trim() || null,
        username: username.trim() || null,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiConfig.payloadApiKey) {
        headers['Authorization'] = `users API-Key ${apiConfig.payloadApiKey}`;
      } else if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiConfig.baseUrl}/users/${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.errors?.[0]?.message ||
            err?.message ||
            'Failed to update profile',
        );
      }

      const updatedUser = {
        ...user,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        middleName: middleName.trim() || null,
        username: username.trim() || null,
      };

      updateUser(updatedUser as any);

      Alert.alert('Profile Updated', 'Your profile has been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Profile update error:', err);
      Alert.alert(
        'Update Failed',
        err instanceof Error ? err.message : 'Could not save profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text as string,
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ backgroundColor: colors.primary }} edges={['top']} />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 8, marginRight: 8, marginLeft: -8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text,
                flex: 1,
              }}
            >
              Edit Profile
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || !hasChanges}
              style={{
                backgroundColor: hasChanges ? colors.primary : colors.border,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.surface} />
              ) : (
                <Text
                  style={{
                    color: hasChanges ? colors.surface : colors.textSecondary,
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Read-only email */}
            <View style={{ marginBottom: 20 }}>
              <Text style={labelStyle}>Email</Text>
              <View
                style={{
                  ...fieldStyle,
                  backgroundColor: colors.background,
                  opacity: 0.7,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.textSecondary }}>
                  {user?.email || '—'}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                Contact support to change your email address.
              </Text>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={labelStyle}>First Name *</Text>
              <TextInput
                style={fieldStyle}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={labelStyle}>Last Name *</Text>
              <TextInput
                style={fieldStyle}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={labelStyle}>Middle Name</Text>
              <TextInput
                style={fieldStyle}
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="Optional"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={labelStyle}>Username</Text>
              <TextInput
                style={fieldStyle}
                value={username}
                onChangeText={setUsername}
                placeholder="Optional — choose a unique username"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
