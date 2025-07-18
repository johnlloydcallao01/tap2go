/**
 * User Database Service
 * Handles user data operations in Firestore using shared database package
 */

import {
  getFirebaseDb,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  Firestore,
} from '@tap2go/firebase-config';
import { COLLECTIONS } from '@tap2go/database';
import { User } from '@tap2go/shared-types';
import {
  UserDocumentData,
  DriverDocumentData,
  DriverUser,
  CustomerUser,
  VendorUser,
  AdminUser,
  AnyAuthUser,
} from '../types/auth';

/**
 * Get Firebase Firestore instance (SSR-safe)
 */
async function getDb(): Promise<Firestore> {
  if (typeof window === 'undefined') {
    throw new Error('Database operations can only be performed on the client side');
  }

  try {
    const db = await getFirebaseDb();
    if (!db) {
      throw new Error('Firebase database instance is null or undefined');
    }
    return db;
  } catch (error) {
    console.error('Failed to get Firebase database:', error);
    if (error instanceof Error) {
      throw new Error(`Firebase database error: ${error.message}`);
    }
    throw new Error('Firebase database is not available. Please try again.');
  }
}

/**
 * User Database Service Class
 * Provides centralized user data operations for all user types
 */
export class UserDatabaseService {
  /**
   * Create a new user document in Firestore
   */
  async createUser(
    uid: string,
    email: string,
    role: User['role'],
    additionalData?: Record<string, any>
  ): Promise<void> {
    const database = await getDb();
    const userRef = doc(database, COLLECTIONS.USERS, uid);

    const userData: UserDocumentData = {
      email,
      role,
      isActive: true,
      isVerified: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      ...additionalData,
    };

    await setDoc(userRef, userData);
  }

  /**
   * Create a driver user with profile
   */
  async createDriverUser(
    uid: string,
    email: string,
    firstName: string,
    lastName: string
  ): Promise<void> {
    const database = await getDb();
    const userRef = doc(database, COLLECTIONS.USERS, uid);
    const driverRef = doc(database, COLLECTIONS.DRIVERS, uid);

    // Create user document
    const userData: UserDocumentData = {
      email,
      role: 'driver',
      isActive: true,
      isVerified: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Create driver profile document
    const driverData: DriverDocumentData = {
      userRef: `users/${uid}`,
      firstName,
      lastName,
      status: 'pending_approval',
      verificationStatus: 'pending',
      isOnline: false,
      isAvailable: false,
      totalDeliveries: 0,
      totalEarnings: 0,
      joinedAt: serverTimestamp() as Timestamp,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Create both documents atomically
    await Promise.all([
      setDoc(userRef, userData),
      setDoc(driverRef, driverData),
    ]);
  }

  /**
   * Create a customer user
   */
  async createCustomerUser(
    uid: string,
    email: string,
    name?: string
  ): Promise<void> {
    const database = await getDb();
    const userRef = doc(database, COLLECTIONS.USERS, uid);
    const customerRef = doc(database, COLLECTIONS.CUSTOMERS, uid);

    // Create user document
    const userData: UserDocumentData = {
      email,
      role: 'customer',
      isActive: true,
      isVerified: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Create customer profile document
    const customerData = {
      userRef: `users/${uid}`,
      name: name || '',
      totalOrders: 0,
      totalSpent: 0,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Create both documents atomically
    await Promise.all([
      setDoc(userRef, userData),
      setDoc(customerRef, customerData),
    ]);
  }

  /**
   * Create a vendor user
   */
  async createVendorUser(
    uid: string,
    email: string,
    businessName: string,
    contactName: string
  ): Promise<void> {
    const database = await getDb();
    const userRef = doc(database, COLLECTIONS.USERS, uid);
    const vendorRef = doc(database, COLLECTIONS.VENDORS, uid);

    // Create user document
    const userData: UserDocumentData = {
      email,
      role: 'vendor',
      isActive: true,
      isVerified: false,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Create vendor profile document
    const vendorData = {
      userRef: `users/${uid}`,
      businessName,
      contactName,
      status: 'pending',
      commissionRate: 0.15, // Default 15%
      totalEarnings: 0,
      totalOrders: 0,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // Create both documents atomically
    await Promise.all([
      setDoc(userRef, userData),
      setDoc(vendorRef, vendorData),
    ]);
  }

  /**
   * Get user data by UID
   */
  async getUser(uid: string): Promise<UserDocumentData | null> {
    const database = await getDb();
    const userRef = doc(database, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserDocumentData;
    }

    return null;
  }

  /**
   * Get driver user with profile
   */
  async getDriverUser(uid: string): Promise<DriverUser | null> {
    const [userData, driverData] = await Promise.all([
      this.getUser(uid),
      this.getDriverProfile(uid),
    ]);

    if (!userData || !driverData || userData.role !== 'driver') {
      return null;
    }

    return {
      id: uid,
      firebaseUid: uid,
      email: userData.email,
      role: 'driver',
      firstName: driverData.firstName,
      lastName: driverData.lastName,
      name: `${driverData.firstName} ${driverData.lastName}`,
      phoneNumber: driverData.phoneNumber,
      profileImageUrl: driverData.profileImageUrl,
      isActive: userData.isActive,
      isVerified: userData.isVerified,
      status: driverData.status,
      verificationStatus: driverData.verificationStatus,
      isOnline: driverData.isOnline,
      isAvailable: driverData.isAvailable,
      currentLocation: driverData.currentLocation,
      vehicleType: driverData.vehicleType,
      vehicleDetails: driverData.vehicleDetails ? {
        ...driverData.vehicleDetails,
        insuranceExpiry: driverData.vehicleDetails.insuranceExpiry?.toDate?.() || undefined,
      } : undefined,
      totalDeliveries: driverData.totalDeliveries,
      totalEarnings: driverData.totalEarnings,
      rating: driverData.rating,
      joinedAt: driverData.joinedAt?.toDate?.() || new Date(),
      createdAt: userData.createdAt?.toDate?.() || new Date(),
      updatedAt: userData.updatedAt?.toDate?.() || new Date(),
      lastLoginAt: userData.lastLoginAt?.toDate?.() || undefined,
      fcmTokens: userData.fcmTokens,
      preferredLanguage: userData.preferredLanguage,
      timezone: userData.timezone,
    };
  }

  /**
   * Get driver profile data
   */
  async getDriverProfile(uid: string): Promise<DriverDocumentData | null> {
    const database = await getDb();
    const driverRef = doc(database, COLLECTIONS.DRIVERS, uid);
    const driverSnap = await getDoc(driverRef);

    if (driverSnap.exists()) {
      return driverSnap.data() as DriverDocumentData;
    }

    return null;
  }

  /**
   * Update user last login time
   */
  async updateUserLastLogin(uid: string): Promise<void> {
    const database = await getDb();
    const userRef = doc(database, COLLECTIONS.USERS, uid);

    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update user data
   */
  async updateUser(
    uid: string,
    updates: Partial<Omit<UserDocumentData, 'createdAt'>>
  ): Promise<void> {
    const database = await getDb();
    const userRef = doc(database, COLLECTIONS.USERS, uid);

    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update driver profile
   */
  async updateDriverProfile(
    uid: string,
    updates: Partial<Omit<DriverDocumentData, 'userRef' | 'createdAt'>>
  ): Promise<void> {
    const database = await getDb();
    const driverRef = doc(database, COLLECTIONS.DRIVERS, uid);

    await updateDoc(driverRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Check if user exists
   */
  async userExists(uid: string): Promise<boolean> {
    const user = await this.getUser(uid);
    return user !== null;
  }

  /**
   * Check if user is active
   */
  async isUserActive(uid: string): Promise<boolean> {
    const user = await this.getUser(uid);
    return user?.isActive === true;
  }

  /**
   * Check if user is verified
   */
  async isUserVerified(uid: string): Promise<boolean> {
    const user = await this.getUser(uid);
    return user?.isVerified === true;
  }

  // ===== ADMIN USER OPERATIONS =====

  /**
   * Get admin user by Firebase UID
   */
  async getAdminUser(uid: string): Promise<AdminUser | null> {
    try {
      const database = await getDb();
      const userRef = doc(database, COLLECTIONS.USERS, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const userData = userSnap.data() as UserDocumentData;

      // Verify user is an admin
      if (userData.role !== 'admin') {
        return null;
      }

      // Get admin profile from admins collection
      const adminRef = doc(database, COLLECTIONS.ADMINS, uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        console.warn('Admin user found but no admin profile:', uid);
        return null;
      }

      const adminData = adminSnap.data();

      return {
        id: uid,
        firebaseUid: uid,
        email: userData.email,
        role: 'admin',
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
        lastLoginAt: userData.lastLoginAt?.toDate(),
        fcmTokens: userData.fcmTokens || [],
        preferredLanguage: userData.preferredLanguage || 'en',
        timezone: userData.timezone || 'UTC',

        // Admin-specific fields
        permissions: adminData.permissions || [],
        department: adminData.department,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        displayName: `${adminData.firstName} ${adminData.lastName}`,
        phoneNumber: adminData.phoneNumber,
        profileImageUrl: adminData.profileImageUrl,
      };
    } catch (error) {
      console.error('Error getting admin user:', error);
      throw new Error('Failed to retrieve admin user');
    }
  }

  /**
   * Create admin user (typically called by other admins)
   */
  async createAdminUser(
    uid: string,
    email: string,
    firstName: string,
    lastName: string,
    permissions: string[] = [],
    department?: string
  ): Promise<AdminUser> {
    try {
      const database = await getDb();
      const now = serverTimestamp();

      // Create user document
      const userRef = doc(database, COLLECTIONS.USERS, uid);
      const userData: UserDocumentData = {
        email,
        role: 'admin',
        isActive: true,
        isVerified: true, // Admins are pre-verified
        createdAt: now as any,
        updatedAt: now as any,
        preferredLanguage: 'en',
        timezone: 'UTC',
      };

      await setDoc(userRef, userData);

      // Create admin profile document
      const adminRef = doc(database, COLLECTIONS.ADMINS, uid);
      const adminData = {
        userRef: userRef,
        firstName,
        lastName,
        permissions,
        department,
        createdAt: now as any,
        updatedAt: now as any,
      };

      await setDoc(adminRef, adminData);

      // Return the created admin user
      const adminUser = await this.getAdminUser(uid);
      if (!adminUser) {
        throw new Error('Failed to retrieve created admin user');
      }

      return adminUser;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw new Error('Failed to create admin user');
    }
  }

  /**
   * Update admin permissions
   */
  async updateAdminPermissions(uid: string, permissions: string[]): Promise<void> {
    try {
      const database = await getDb();
      const adminRef = doc(database, COLLECTIONS.ADMINS, uid);

      await updateDoc(adminRef, {
        permissions,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating admin permissions:', error);
      throw new Error('Failed to update admin permissions');
    }
  }

  /**
   * Update admin profile
   */
  async updateAdminProfile(
    uid: string,
    updates: {
      firstName?: string;
      lastName?: string;
      department?: string;
      phoneNumber?: string;
      profileImageUrl?: string;
    }
  ): Promise<void> {
    try {
      const database = await getDb();
      const adminRef = doc(database, COLLECTIONS.ADMINS, uid);

      await updateDoc(adminRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw new Error('Failed to update admin profile');
    }
  }

  /**
   * Check if user has admin permissions
   */
  async hasAdminPermission(uid: string, permission: string): Promise<boolean> {
    try {
      const adminUser = await this.getAdminUser(uid);
      if (!adminUser) return false;

      return adminUser.permissions.includes(permission) || adminUser.permissions.includes('*');
    } catch (error) {
      console.error('Error checking admin permission:', error);
      return false;
    }
  }
}
