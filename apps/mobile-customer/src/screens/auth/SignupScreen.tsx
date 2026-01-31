import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '../../navigation/NavigationContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
import { UserRegistrationSchema, UserRegistrationData, AuthService } from '@encreasl/client-services';
import { Ionicons } from '@expo/vector-icons';

// ========================================
// HELPER COMPONENTS
// ========================================

const FormLabel = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
  <Text className="text-gray-700 font-medium mb-1 text-sm">
    {children} {required && <Text className="text-red-500">*</Text>}
  </Text>
);

const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <Text className="text-red-500 text-xs mt-1">{message}</Text>;
};

const SectionHeader = ({ title, icon }: { title: string, icon: any }) => (
  <View className="flex-row items-center mb-4 mt-6 border-b border-gray-100 pb-2">
    <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
      <Ionicons name={icon} size={18} color="#2563EB" />
    </View>
    <Text className="text-lg font-bold text-gray-800">{title}</Text>
  </View>
);

// Simple Select Modal
const SelectInput = ({ label, value, options, onChange, error }: any) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel = options.find((opt: any) => opt.value === value)?.label || 'Select ' + label;

  return (
    <View className="mb-4">
      <FormLabel required>{label}</FormLabel>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
      >
        <Text className={value ? "text-gray-900" : "text-gray-400"}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      <ErrorMessage message={error} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-1/2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Select {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((option: any) => (
                <TouchableOpacity
                  key={option.value}
                  className={`py-4 border-b border-gray-100 flex-row justify-between items-center ${value === option.value ? 'bg-blue-50 -mx-6 px-6' : ''}`}
                  onPress={() => {
                    onChange(option.value);
                    setModalVisible(false);
                  }}
                >
                  <Text className={`text-base ${value === option.value ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                    {option.label}
                  </Text>
                  {value === option.value && <Ionicons name="checkmark" size={20} color="#2563EB" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

export default function SignupScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Extend schema to handle date string input for form, then transform
  // But our schema expects Date object or string? Let's check schema.
  // The schema uses DateSchema which expects string or date and transforms.
  // We'll pass string from TextInput.
  
  const { control, handleSubmit, formState: { errors } } = useForm<UserRegistrationData>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      middleName: '',
      nameExtension: '',
      gender: 'prefer_not_to_say',
      civilStatus: 'single',
      srn: '',
      nationality: '',
      birthDate: '', // Will handle as string input YYYY-MM-DD
      placeOfBirth: '',
      completeAddress: '',
      email: '',
      phoneNumber: '',
      username: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: true, // Default true for smoother UX? Or false to force?
      // Emergency fields optional
    },
  });

  const onSubmit = async (data: UserRegistrationData) => {
    try {
      setIsLoading(true);
      setGeneralError(null);
      
      // Call register service (need to add register to AuthService if not present, but usually login is enough? No, we need register)
      // I checked AuthService in shared package, it has `login` and `me`. It might NOT have `register`.
      // I need to check AuthService again.
      
      // If missing, I will add it.
      // Assuming I might need to add it.
      
      // Temporary: Simulate or call if exists.
      // I will update AuthService first if needed.
      
      // Let's assume I need to check AuthService.
      // For now, I'll put a placeholder or use fetch directly if service is missing.
      
      // Actually, I'll update AuthService in the next step if missing.
      // I'll assume it exists for this file content.
      
      await AuthService.register(data);
      
      Alert.alert(
        "Registration Successful",
        "Your account has been created. Please log in.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
      
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Registration failed');
      // Scroll to top to see error?
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View className="flex-row items-center p-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Create Account</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          
          {generalError && (
            <View className="bg-red-50 p-3 rounded-lg mb-6 border border-red-100">
              <Text className="text-red-600 text-sm">{generalError}</Text>
            </View>
          )}

          <Text className="text-gray-500 mb-6">
            Please fill in the details below to create your customer account.
          </Text>

          {/* ======================================== */}
          {/* PERSONAL INFORMATION */}
          {/* ======================================== */}
          <SectionHeader title="Personal Information" icon="person-outline" />

          <View className="flex-row space-x-3">
            <View className="flex-1 mb-4">
              <FormLabel required>First Name</FormLabel>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <ErrorMessage message={errors.firstName?.message} />
            </View>

            <View className="flex-1 mb-4">
              <FormLabel required>Last Name</FormLabel>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <ErrorMessage message={errors.lastName?.message} />
            </View>
          </View>

          <View className="flex-row space-x-3">
            <View className="flex-1 mb-4">
              <FormLabel>Middle Name</FormLabel>
              <Controller
                control={control}
                name="middleName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ''}
                  />
                )}
              />
              <ErrorMessage message={errors.middleName?.message} />
            </View>
            
             <View className="w-1/3 mb-4">
              <FormLabel>Ext.</FormLabel>
              <Controller
                control={control}
                name="nameExtension"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                    placeholder="Jr/Sr"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ''}
                  />
                )}
              />
              <ErrorMessage message={errors.nameExtension?.message} />
            </View>
          </View>

          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                label="Gender"
                value={value}
                onChange={onChange}
                error={errors.gender?.message}
                options={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                  { label: 'Other', value: 'other' },
                  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
                ]}
              />
            )}
          />

          <Controller
            control={control}
            name="civilStatus"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                label="Civil Status"
                value={value}
                onChange={onChange}
                error={errors.civilStatus?.message}
                options={[
                  { label: 'Single', value: 'single' },
                  { label: 'Married', value: 'married' },
                  { label: 'Widowed', value: 'widowed' },
                  { label: 'Separated', value: 'separated' },
                  { label: 'Divorced', value: 'divorced' },
                ]}
              />
            )}
          />

          <View className="mb-4">
            <FormLabel required>Birth Date (YYYY-MM-DD)</FormLabel>
            <Controller
              control={control}
              name="birthDate"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="1990-01-31"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value as string}
                  keyboardType="numeric"
                />
              )}
            />
            <ErrorMessage message={(errors.birthDate as any)?.message} />
          </View>

          <View className="mb-4">
            <FormLabel required>Nationality</FormLabel>
            <Controller
              control={control}
              name="nationality"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <ErrorMessage message={errors.nationality?.message} />
          </View>

          <View className="mb-4">
            <FormLabel required>Place of Birth</FormLabel>
            <Controller
              control={control}
              name="placeOfBirth"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <ErrorMessage message={errors.placeOfBirth?.message} />
          </View>
          
           <View className="mb-4">
            <FormLabel required>SRN (Student/Service ID)</FormLabel>
            <Controller
              control={control}
              name="srn"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="characters"
                />
              )}
            />
            <ErrorMessage message={errors.srn?.message} />
          </View>

          {/* ======================================== */}
          {/* CONTACT INFORMATION */}
          {/* ======================================== */}
          <SectionHeader title="Contact Information" icon="call-outline" />

          <View className="mb-4">
            <FormLabel required>Email Address</FormLabel>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
            <ErrorMessage message={errors.email?.message} />
          </View>

          <View className="mb-4">
            <FormLabel required>Phone Number</FormLabel>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="09123456789"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="phone-pad"
                />
              )}
            />
            <ErrorMessage message={errors.phoneNumber?.message} />
          </View>

          <View className="mb-4">
            <FormLabel required>Complete Address</FormLabel>
            <Controller
              control={control}
              name="completeAddress"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
              )}
            />
            <ErrorMessage message={errors.completeAddress?.message} />
          </View>

          {/* ======================================== */}
          {/* ACCOUNT SECURITY */}
          {/* ======================================== */}
          <SectionHeader title="Account Security" icon="lock-closed-outline" />

          <View className="mb-4">
            <FormLabel required>Username</FormLabel>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                />
              )}
            />
            <ErrorMessage message={errors.username?.message} />
          </View>

          <View className="mb-4">
            <FormLabel required>Password</FormLabel>
            <View className="relative">
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 pr-12"
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity 
                className="absolute right-4 top-3.5"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
            <ErrorMessage message={errors.password?.message} />
          </View>

          <View className="mb-4">
            <FormLabel required>Confirm Password</FormLabel>
            <View className="relative">
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 pr-12"
                    secureTextEntry={!showConfirmPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity 
                className="absolute right-4 top-3.5"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
            <ErrorMessage message={errors.confirmPassword?.message} />
          </View>

          {/* ======================================== */}
          {/* MARKETING & TERMS */}
          {/* ======================================== */}
          <View className="flex-row items-center mt-6 mb-8">
            <Controller
              control={control}
              name="agreeToTerms"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity 
                  className="flex-row items-center"
                  onPress={() => onChange(!value)}
                >
                  <View className={`w-6 h-6 rounded border ${value ? 'bg-blue-600 border-blue-600' : 'border-gray-300'} items-center justify-center mr-3`}>
                    {value && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <Text className="text-gray-600 flex-1">
                    I agree to the <Text className="text-blue-600 font-bold">Terms of Service</Text> and <Text className="text-blue-600 font-bold">Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <ErrorMessage message={errors.agreeToTerms?.message} />

          <TouchableOpacity
            className={`w-full bg-blue-600 rounded-xl py-4 items-center mb-8 ${isLoading ? 'opacity-70' : ''}`}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
