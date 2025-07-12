import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from './collections';
import { PlatformConfigDocument } from './schema';

// ===== PLATFORM CONFIG OPERATIONS =====

export const getPlatformConfig = async (): Promise<PlatformConfigDocument | null> => {
  const configRef = doc(db, COLLECTIONS.PLATFORM_CONFIG, 'config');
  const configSnap = await getDoc(configRef);

  if (configSnap.exists()) {
    return configSnap.data() as unknown as PlatformConfigDocument;
  }
  return null;
};

export const updatePlatformConfig = async (
  updates: Partial<PlatformConfigDocument>,
  updatedBy: string
): Promise<void> => {
  const configRef = doc(db, COLLECTIONS.PLATFORM_CONFIG, 'config');
  await updateDoc(configRef, {
    ...updates,
    updatedAt: serverTimestamp(),
    updatedBy,
  });
};

// ===== COMMISSION RATE OPERATIONS =====

export const updateCommissionRates = async (
  rates: Partial<PlatformConfigDocument['defaultCommissionRates']>,
  updatedBy: string
): Promise<void> => {
  const config = await getPlatformConfig();
  if (!config) throw new Error('Platform config not found');

  const updatedRates = {
    ...config.defaultCommissionRates,
    ...rates
  };

  await updatePlatformConfig({
    defaultCommissionRates: updatedRates
  }, updatedBy);
};

export const getCommissionRates = async (): Promise<PlatformConfigDocument['defaultCommissionRates'] | null> => {
  const config = await getPlatformConfig();
  return config?.defaultCommissionRates || null;
};

// ===== DELIVERY SETTINGS OPERATIONS =====

export const updateDeliverySettings = async (
  settings: Partial<PlatformConfigDocument['deliverySettings']>,
  updatedBy: string
): Promise<void> => {
  const config = await getPlatformConfig();
  if (!config) throw new Error('Platform config not found');

  const updatedSettings = {
    ...config.deliverySettings,
    ...settings
  };

  await updatePlatformConfig({
    deliverySettings: updatedSettings
  }, updatedBy);
};

export const getDeliverySettings = async (): Promise<PlatformConfigDocument['deliverySettings'] | null> => {
  const config = await getPlatformConfig();
  return config?.deliverySettings || null;
};

// ===== FEATURE FLAGS OPERATIONS =====

export const updateFeatureFlags = async (
  features: Partial<PlatformConfigDocument['features']>,
  updatedBy: string
): Promise<void> => {
  const config = await getPlatformConfig();
  if (!config) throw new Error('Platform config not found');

  const updatedFeatures = {
    ...config.features,
    ...features
  };

  await updatePlatformConfig({
    features: updatedFeatures
  }, updatedBy);
};

export const getFeatureFlags = async (): Promise<PlatformConfigDocument['features'] | null> => {
  const config = await getPlatformConfig();
  return config?.features || null;
};

export const isFeatureEnabled = async (featureName: keyof PlatformConfigDocument['features']): Promise<boolean> => {
  const features = await getFeatureFlags();
  return features?.[featureName] || false;
};

// ===== OPERATING HOURS OPERATIONS =====

export const updateOperatingHours = async (
  hours: Partial<PlatformConfigDocument['platformOperatingHours']>,
  updatedBy: string
): Promise<void> => {
  const config = await getPlatformConfig();
  if (!config) throw new Error('Platform config not found');

  const updatedHours = {
    ...config.platformOperatingHours,
    ...hours
  };

  await updatePlatformConfig({
    platformOperatingHours: updatedHours
  }, updatedBy);
};

export const getOperatingHours = async (): Promise<PlatformConfigDocument['platformOperatingHours'] | null> => {
  const config = await getPlatformConfig();
  return config?.platformOperatingHours || null;
};

export const isPlatformOpen = async (day?: string, time?: string): Promise<boolean> => {
  const hours = await getOperatingHours();
  if (!hours) return false;

  const currentDay = day || new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = time || new Date().toTimeString().substring(0, 5);

  const dayHours = hours[currentDay as keyof typeof hours];
  if (!dayHours || dayHours.length === 0) return false;

  return dayHours.some(period => {
    return currentTime >= period.open && currentTime <= period.close;
  });
};

// ===== SUPPORTED REGIONS OPERATIONS =====

export const updateSupportedRegions = async (
  regions: string[],
  updatedBy: string
): Promise<void> => {
  await updatePlatformConfig({
    supportedRegions: regions
  }, updatedBy);
};

export const addSupportedRegion = async (
  region: string,
  updatedBy: string
): Promise<void> => {
  const config = await getPlatformConfig();
  if (!config) throw new Error('Platform config not found');

  if (!config.supportedRegions.includes(region)) {
    const updatedRegions = [...config.supportedRegions, region];
    await updateSupportedRegions(updatedRegions, updatedBy);
  }
};

export const removeSupportedRegion = async (
  region: string,
  updatedBy: string
): Promise<void> => {
  const config = await getPlatformConfig();
  if (!config) throw new Error('Platform config not found');

  const updatedRegions = config.supportedRegions.filter(r => r !== region);
  await updateSupportedRegions(updatedRegions, updatedBy);
};

export const getSupportedRegions = async (): Promise<string[]> => {
  const config = await getPlatformConfig();
  return config?.supportedRegions || [];
};

// ===== MOBILE APP CONFIG OPERATIONS =====

export const updateMobileAppConfig = async (
  appConfig: Partial<PlatformConfigDocument['mobileAppConfig']>,
  updatedBy: string
): Promise<void> => {
  const config = await getPlatformConfig();
  if (!config) throw new Error('Platform config not found');

  const updatedAppConfig = {
    ...config.mobileAppConfig,
    ...appConfig
  };

  await updatePlatformConfig({
    mobileAppConfig: updatedAppConfig
  }, updatedBy);
};

export const getMobileAppConfig = async (): Promise<PlatformConfigDocument['mobileAppConfig'] | null> => {
  const config = await getPlatformConfig();
  return config?.mobileAppConfig || null;
};

export const setMaintenanceMode = async (
  enabled: boolean,
  message: string | null,
  updatedBy: string
): Promise<void> => {
  await updateMobileAppConfig({
    maintenanceMode: enabled,
    maintenanceMessage: message || undefined
  }, updatedBy);
};

// ===== NOTIFICATION TEMPLATES OPERATIONS =====

export const updateNotificationTemplate = async (
  templateName: keyof PlatformConfigDocument['notificationTemplates'],
  template: { title: string; body: string },
  updatedBy: string
): Promise<void> => {
  const config = await getPlatformConfig();
  if (!config) throw new Error('Platform config not found');

  const updatedTemplates = {
    ...config.notificationTemplates,
    [templateName]: template
  };

  await updatePlatformConfig({
    notificationTemplates: updatedTemplates
  }, updatedBy);
};

export const getNotificationTemplate = async (
  templateName: keyof PlatformConfigDocument['notificationTemplates']
): Promise<{ title: string; body: string } | null> => {
  const config = await getPlatformConfig();
  return config?.notificationTemplates[templateName] || null;
};

export const getAllNotificationTemplates = async (): Promise<PlatformConfigDocument['notificationTemplates'] | null> => {
  const config = await getPlatformConfig();
  return config?.notificationTemplates || null;
};

// ===== UTILITY FUNCTIONS =====

export const checkPlatformConfigExists = async (): Promise<boolean> => {
  const config = await getPlatformConfig();
  return config !== null;
};

export const getMinimumOrderValue = async (): Promise<number> => {
  const settings = await getDeliverySettings();
  return settings?.minimumOrderValue || 10.0;
};

export const getMaxDeliveryRadius = async (): Promise<number> => {
  const settings = await getDeliverySettings();
  return settings?.maxDeliveryRadius || 15;
};

export const getAvgDeliveryTime = async (): Promise<number> => {
  const settings = await getDeliverySettings();
  return settings?.avgDeliveryTime || 35;
};

export const getSupportedCurrencies = async (): Promise<string[]> => {
  const config = await getPlatformConfig();
  return config?.supportedCurrencies || ['USD'];
};

export const getSupportedLanguages = async (): Promise<string[]> => {
  const config = await getPlatformConfig();
  return config?.supportedLanguages || ['en'];
};

export const isPlatformInMaintenanceMode = async (): Promise<boolean> => {
  const appConfig = await getMobileAppConfig();
  return appConfig?.maintenanceMode || false;
};
