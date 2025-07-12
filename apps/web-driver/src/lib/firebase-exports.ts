/**
 * Firebase Exports - Vercel Build Compatibility Layer
 * 
 * This file provides a robust export layer for Firebase services
 * that handles Vercel build environment edge cases.
 */

// Re-export Firebase services with additional safety
export { auth, db, storage, app } from './firebase';

// Type exports for better TypeScript support
export type { Auth } from 'firebase/auth';
export type { Firestore } from 'firebase/firestore';
export type { FirebaseStorage } from 'firebase/storage';
export type { FirebaseApp } from 'firebase/app';

// Utility function to check if Firebase is initialized
export function isFirebaseInitialized(): boolean {
  try {
    const { auth } = require('./firebase');
    return auth !== null && auth !== undefined;
  } catch {
    return false;
  }
}

// Safe getter functions with fallbacks
export function getFirebaseAuth() {
  try {
    const { auth } = require('./firebase');
    return auth;
  } catch (error) {
    console.warn('Failed to get Firebase auth:', error);
    return null;
  }
}

export function getFirebaseDb() {
  try {
    const { db } = require('./firebase');
    return db;
  } catch (error) {
    console.warn('Failed to get Firebase db:', error);
    return null;
  }
}

export function getFirebaseStorage() {
  try {
    const { storage } = require('./firebase');
    return storage;
  } catch (error) {
    console.warn('Failed to get Firebase storage:', error);
    return null;
  }
}
