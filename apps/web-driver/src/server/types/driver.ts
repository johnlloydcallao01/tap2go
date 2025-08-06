/**
 * Driver Types
 * 
 * TypeScript types for driver-specific data and operations.
 */

/**
 * Driver user interface (extends base User)
 */
export interface DriverUser {
  id: string;
  email: string;
  name: string;
  role: 'driver';
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Driver-specific fields
  licenseNumber: string;
  vehicleInfo: VehicleInfo;
  status: 'pending' | 'approved' | 'active' | 'inactive' | 'suspended';
  isOnline: boolean;
  currentLocation?: DriverLocation;
  totalDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  documents: DriverDocument[];
  
  // Performance metrics
  completionRate: number;
  onTimeRate: number;
  customerRating: number;
  totalRatings: number;
  
  // Availability
  workingHours?: WorkingHours;
  availableZones?: string[];
  
  // Emergency contact
  emergencyContact?: EmergencyContact;
}

/**
 * Vehicle information
 */
export interface VehicleInfo {
  id: string;
  type: 'motorcycle' | 'car' | 'bicycle' | 'scooter' | 'van';
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  capacity?: {
    weight: number; // in kg
    volume: number; // in liters
  };
  insurance: InsuranceInfo;
  registration: RegistrationInfo;
  inspection?: InspectionInfo;
}

/**
 * Insurance information
 */
export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  expiryDate: Date;
  coverageAmount: number;
  isActive: boolean;
  documentUrl?: string;
}

/**
 * Registration information
 */
export interface RegistrationInfo {
  registrationNumber: string;
  expiryDate: Date;
  issuingAuthority: string;
  documentUrl?: string;
}

/**
 * Inspection information
 */
export interface InspectionInfo {
  inspectionDate: Date;
  expiryDate: Date;
  certificateNumber: string;
  issuingAuthority: string;
  documentUrl?: string;
}

/**
 * Driver location with timestamp
 */
export interface DriverLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

/**
 * Driver document types
 */
export interface DriverDocument {
  id: string;
  type: 'drivers_license' | 'vehicle_registration' | 'insurance' | 'background_check' | 'vehicle_inspection' | 'profile_photo';
  url: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiryDate?: Date;
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
  rejectionReason?: string;
}

/**
 * Working hours configuration
 */
export interface WorkingHours {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

/**
 * Time slot for working hours
 */
export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

/**
 * Emergency contact information
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

/**
 * Driver statistics
 */
export interface DriverStats {
  driverId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  
  // Delivery stats
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  
  // Time stats
  totalOnlineTime: number; // in minutes
  totalActiveTime: number; // in minutes
  averageDeliveryTime: number; // in minutes
  
  // Earnings stats
  totalEarnings: number;
  basePay: number;
  tips: number;
  bonuses: number;
  
  // Performance stats
  averageRating: number;
  totalRatings: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  
  // Distance stats
  totalDistance: number; // in km
  averageDistancePerDelivery: number; // in km
}

/**
 * Driver notification preferences
 */
export interface DriverNotificationPreferences {
  push: {
    newDeliveries: boolean;
    deliveryUpdates: boolean;
    earnings: boolean;
    promotions: boolean;
    systemAlerts: boolean;
  };
  sms: {
    emergencyAlerts: boolean;
    importantUpdates: boolean;
  };
  email: {
    weeklyReports: boolean;
    monthlyStatements: boolean;
    promotions: boolean;
    systemUpdates: boolean;
  };
}

/**
 * Driver app preferences
 */
export interface DriverAppPreferences {
  mapProvider: 'google' | 'apple' | 'waze';
  navigationVoice: boolean;
  autoAcceptDeliveries: boolean;
  maxDeliveryDistance: number; // in km
  preferredZones: string[];
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Driver shift information
 */
export interface DriverShift {
  id: string;
  driverId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'paused' | 'ended';
  startLocation: DriverLocation;
  endLocation?: DriverLocation;
  totalDistance: number;
  totalEarnings: number;
  deliveriesCompleted: number;
  onlineTime: number; // in minutes
  activeTime: number; // in minutes
}

/**
 * Driver performance metrics
 */
export interface DriverPerformance {
  driverId: string;
  period: string;
  
  // Efficiency metrics
  deliveriesPerHour: number;
  averageDeliveryTime: number;
  completionRate: number;
  
  // Quality metrics
  customerRating: number;
  onTimeRate: number;
  accuracyRate: number;
  
  // Reliability metrics
  acceptanceRate: number;
  cancellationRate: number;
  noShowRate: number;
  
  // Earnings metrics
  earningsPerHour: number;
  earningsPerDelivery: number;
  tipRate: number;
}

/**
 * Driver zone assignment
 */
export interface DriverZone {
  id: string;
  name: string;
  boundaries: {
    lat: number;
    lng: number;
  }[];
  isActive: boolean;
  priority: number;
  maxDrivers?: number;
  currentDrivers: number;
}

/**
 * Driver training record
 */
export interface DriverTraining {
  id: string;
  driverId: string;
  type: 'onboarding' | 'safety' | 'customer_service' | 'app_usage' | 'compliance';
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  startedAt?: Date;
  completedAt?: Date;
  expiryDate?: Date;
  score?: number;
  certificateUrl?: string;
  isRequired: boolean;
}
