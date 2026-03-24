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
  paymongoPublicKey: getPublicEnvVar('EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE') || 'pk_live_UJhfSgBMCuEM7JsmPHVr9Qb7',
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
