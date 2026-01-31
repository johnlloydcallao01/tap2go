export const firebaseConfig = {};

export const supabaseConfig = {};

const getPublicEnvVar = (key: string): string => {
  try {
    const value = process.env?.[key];
    return value ? String(value) : '';
  } catch {
    return '';
  }
};

export const apiConfig = {
  baseUrl: getPublicEnvVar('EXPO_PUBLIC_API_URL') || 'https://cms.tap2goph.com/api',
  payloadApiKey: getPublicEnvVar('EXPO_PUBLIC_PAYLOAD_API_KEY') || '1331d981-b6b7-4ff5-aab6-b9ddbb0c63ae',
};

export type EnvValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const validateEnvironment = (): EnvValidationResult => {
  return { isValid: true, errors: [] };
};

export const debugEnvironmentVariables = () => {
  return;
};
