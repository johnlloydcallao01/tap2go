'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, AuthContextType } from '@/types';
import { createUser, getUser, updateUser, updateUserLastLogin } from '@/lib/database/users';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore using new database functions
          const userData = await getUser(firebaseUser.uid);
          if (userData) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              role: userData.role,
              phone: userData.phoneNumber,
              isActive: userData.isActive,
              isVerified: userData.isVerified,
              createdAt: userData.createdAt?.toDate(),
              updatedAt: userData.updatedAt?.toDate(),
            });

            // Update last login time
            await updateUserLastLogin(firebaseUser.uid);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: User['role']) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth profile
      await updateFirebaseProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore using new database functions
      await createUser(firebaseUser.uid, {
        email,
        role,
        isActive: true,
        isVerified: false,
      });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    try {
      // Update Firestore document using new database functions
      await updateUser(user.id, {
        phoneNumber: data.phone,
        profileImageUrl: data.profileImage,
      });

      // Update local state
      setUser(prev => prev ? { ...prev, ...data, updatedAt: new Date() } : null);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
