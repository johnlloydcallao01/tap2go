/**
 * Database utilities - Firestore schemas removed
 * Focus on PayloadCMS with PostgreSQL/Supabase for structured business data
 *
 * Note: This file previously contained Firestore collection definitions and utilities.
 * All Firestore schemas have been removed to avoid developer confusion.
 * Use PayloadCMS collections in apps/cms/src/collections/ for structured data.
 */

// This file is kept for potential future non-structured data needs
// but all current business data should use PayloadCMS collections

export const DEPRECATED_NOTICE = {
  message: 'Firestore schemas removed - use PayloadCMS collections instead',
  payloadCollections: 'apps/cms/src/collections/',
  payloadConfig: 'apps/cms/src/payload.config.ts',
  generatedTypes: 'apps/cms/src/payload-types.ts'
} as const;
