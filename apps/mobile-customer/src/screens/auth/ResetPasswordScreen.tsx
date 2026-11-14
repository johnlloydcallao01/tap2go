import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '@encreasl/client-services';

const isPasswordValid = (password: string) =>
  password.length >= 8 &&
  password.length <= 40 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (!token) {
      setError('This reset link is invalid or has expired. Request a new one.');
      return;
    }
    if (!isPasswordValid(password)) {
      setError('Use 8–40 characters with an uppercase letter, a number, and a special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.resetPassword(token, password);
      setIsSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="rounded-2xl bg-white p-6 shadow-sm">
            <View className="mb-6 h-16 w-16 items-center justify-center self-center rounded-full bg-[#fff4df]">
              <Ionicons
                name={isSuccess ? 'checkmark-circle-outline' : 'lock-closed-outline'}
                size={36}
                color={isSuccess ? '#16A34A' : '#eba336'}
              />
            </View>
            <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
              {isSuccess ? 'Password reset' : 'Create a new password'}
            </Text>
            <Text className="mb-6 text-center text-gray-500">
              {isSuccess
                ? 'Your password has been updated. You can now sign in with it.'
                : 'Choose a new password for your Tap2Go account.'}
            </Text>

            {error && (
              <View className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3">
                <Text className="text-sm text-red-600">{error}</Text>
              </View>
            )}

            {!isSuccess && (
              <>
                <Text className="mb-1 font-medium text-gray-700">New password</Text>
                <TextInput
                  className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  maxLength={40}
                  textContentType="newPassword"
                  autoComplete="new-password"
                />
                <Text className="mb-1 font-medium text-gray-700">Confirm password</Text>
                <TextInput
                  className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  maxLength={40}
                  textContentType="newPassword"
                  autoComplete="new-password"
                />
              </>
            )}

            <TouchableOpacity
              className={`items-center rounded-xl bg-[#eba336] py-4 ${isLoading ? 'opacity-70' : ''}`}
              onPress={() => {
                if (isSuccess) router.replace('/(auth)/login');
                else void onSubmit();
              }}
              disabled={isLoading}
            >
              <Text className="text-lg font-bold text-white">
                {isSuccess ? 'Back to Login' : isLoading ? 'Updating...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
