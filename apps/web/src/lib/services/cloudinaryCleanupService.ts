/**
 * Cloudinary Cleanup Service
 * Processes the cleanup queue for files that need to be deleted from Cloudinary
 * when they are deleted directly from the database
 */

import { supabase, supabaseAdmin } from '@/lib/supabase/client';
import { deleteFromCloudinary } from '@/lib/cloudinary';

interface CloudinaryCleanupItem {
  id: number;
  cloudinary_public_id: string;
  original_filename: string | null;
  deleted_at: string;
  trigger_source: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  retry_count: number;
  created_at: string;
}

export class CloudinaryCleanupService {
  private static instance: CloudinaryCleanupService;
  private isProcessing = false;

  private constructor() {}

  static getInstance(): CloudinaryCleanupService {
    if (!CloudinaryCleanupService.instance) {
      CloudinaryCleanupService.instance = new CloudinaryCleanupService();
    }
    return CloudinaryCleanupService.instance;
  }

  /**
   * Process pending cleanup items from the queue
   */
  async processCleanupQueue(batchSize: number = 10): Promise<{
    processed: number;
    failed: number;
    pending: number;
  }> {
    if (this.isProcessing) {
      console.log('⏳ Cleanup queue processing already in progress');
      return { processed: 0, failed: 0, pending: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;

    try {
      const client = supabaseAdmin || supabase;

      // Get pending items
      const { data: pendingItems, error: fetchError } = await client
        .from('cloudinary_cleanup_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(batchSize);

      if (fetchError) {
        console.error('❌ Error fetching cleanup queue:', fetchError);
        throw fetchError;
      }

      if (!pendingItems || pendingItems.length === 0) {
        console.log('✅ No pending Cloudinary cleanup items');
        return { processed: 0, failed: 0, pending: 0 };
      }

      console.log(`🔄 Processing ${pendingItems.length} Cloudinary cleanup items`);

      // Process each item
      for (const item of pendingItems as CloudinaryCleanupItem[]) {
        try {
          // Mark as processing
          await this.markAsProcessing(item.id);

          // Delete from Cloudinary
          console.log(`🌩️ Deleting from Cloudinary: ${item.cloudinary_public_id}`);
          const deleted = await deleteFromCloudinary(item.cloudinary_public_id);

          if (deleted) {
            // Mark as completed
            await this.markAsCompleted(item.id);
            processed++;
            console.log(`✅ Successfully deleted from Cloudinary: ${item.cloudinary_public_id}`);
          } else {
            // Mark as failed
            await this.markAsFailed(item.id, 'Cloudinary deletion returned false');
            failed++;
            console.log(`❌ Failed to delete from Cloudinary: ${item.cloudinary_public_id}`);
          }
        } catch (error) {
          // Mark as failed with error message
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await this.markAsFailed(item.id, errorMessage);
          failed++;
          console.error(`❌ Error processing cleanup item ${item.id}:`, error);
        }

        // Small delay to avoid overwhelming Cloudinary API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get remaining pending count
      const { count: pendingCount } = await client
        .from('cloudinary_cleanup_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      console.log(`📊 Cleanup batch completed: ${processed} processed, ${failed} failed, ${pendingCount || 0} pending`);

      return {
        processed,
        failed,
        pending: pendingCount || 0
      };

    } catch (error) {
      console.error('❌ Error processing cleanup queue:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Mark cleanup item as processing
   */
  private async markAsProcessing(id: number): Promise<void> {
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('cloudinary_cleanup_queue')
      .update({
        status: 'processing',
        processed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error marking cleanup item as processing:', error);
    }
  }

  /**
   * Mark cleanup item as completed
   */
  private async markAsCompleted(id: number): Promise<void> {
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('cloudinary_cleanup_queue')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error marking cleanup item as completed:', error);
    }
  }

  /**
   * Mark cleanup item as failed
   */
  private async markAsFailed(id: number, errorMessage: string): Promise<void> {
    const client = supabaseAdmin || supabase;

    // First get current retry count
    const { data: currentItem } = await client
      .from('cloudinary_cleanup_queue')
      .select('retry_count')
      .eq('id', id)
      .single();

    const newRetryCount = (currentItem?.retry_count || 0) + 1;

    const { error } = await client
      .from('cloudinary_cleanup_queue')
      .update({
        status: 'failed',
        processed_at: new Date().toISOString(),
        error_message: errorMessage,
        retry_count: newRetryCount
      })
      .eq('id', id);

    if (error) {
      console.error('Error marking cleanup item as failed:', error);
    }
  }

  /**
   * Retry failed cleanup items
   */
  async retryFailedCleanups(maxRetries: number = 3): Promise<number> {
    try {
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('cloudinary_cleanup_queue')
        .update({
          status: 'pending',
          processed_at: null,
          error_message: null
        })
        .eq('status', 'failed')
        .lt('retry_count', maxRetries)
        .select('id');

      if (error) {
        console.error('Error retrying failed cleanups:', error);
        throw error;
      }

      const retryCount = data?.length || 0;
      console.log(`🔄 Retrying ${retryCount} failed cleanup items`);
      return retryCount;

    } catch (error) {
      console.error('Error retrying failed cleanups:', error);
      throw error;
    }
  }

  /**
   * Get cleanup queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    try {
      const client = supabaseAdmin || supabase;
      
      const { data, error } = await client
        .from('cloudinary_cleanup_queue')
        .select('status')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting queue stats:', error);
        throw error;
      }

      const stats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: data?.length || 0
      };

      data?.forEach(item => {
        stats[item.status as keyof typeof stats]++;
      });

      return stats;

    } catch (error) {
      console.error('Error getting queue stats:', error);
      throw error;
    }
  }

  /**
   * Clean up old completed records
   */
  async cleanupOldRecords(daysOld: number = 30): Promise<number> {
    try {
      const client = supabaseAdmin || supabase;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await client
        .from('cloudinary_cleanup_queue')
        .delete()
        .eq('status', 'completed')
        .lt('processed_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error('Error cleaning up old records:', error);
        throw error;
      }

      const deletedCount = data?.length || 0;
      console.log(`🧹 Cleaned up ${deletedCount} old completed records`);
      return deletedCount;

    } catch (error) {
      console.error('Error cleaning up old records:', error);
      throw error;
    }
  }
}

export default CloudinaryCleanupService;
