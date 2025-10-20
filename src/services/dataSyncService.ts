import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SyncResult {
  success: boolean;
  error?: string;
  syncedCount?: number;
}

export class DataSyncService {
  private static readonly CACHE_PREFIX = 'cache_';
  private static readonly LAST_SYNC_KEY = 'last_sync_timestamp';

  /**
   * Sync all user data from Supabase to local cache
   */
  static async syncFromCloud(userId: string): Promise<SyncResult> {
    try {
      console.log('🔄 Starting cloud sync for user:', userId);

      const tables = [
        'journals', 'goals', 'habits', 'tasks', 'reminders', 
        'reflections', 'achievements', 'user_settings'
      ];

      let totalSynced = 0;

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error(`Error syncing ${table}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          await AsyncStorage.setItem(
            `${this.CACHE_PREFIX}${table}`,
            JSON.stringify(data)
          );
          totalSynced += data.length;
          console.log(`✅ Synced ${data.length} records from ${table}`);
        }
      }

      // Update last sync timestamp
      await AsyncStorage.setItem(
        this.LAST_SYNC_KEY,
        new Date().toISOString()
      );

      console.log(`🎉 Cloud sync completed. Total records: ${totalSynced}`);
      
      return {
        success: true,
        syncedCount: totalSynced,
      };
    } catch (error) {
      console.error('Cloud sync error:', error);
      return {
        success: false,
        error: 'Failed to sync data from cloud',
      };
    }
  }

  /**
   * Push local changes to Supabase
   */
  static async pushToCloud(userId: string): Promise<SyncResult> {
    try {
      console.log('📤 Starting push to cloud for user:', userId);

      const tables = [
        'journals', 'goals', 'habits', 'tasks', 'reminders', 
        'reflections', 'achievements', 'user_settings'
      ];

      let totalPushed = 0;

      for (const table of tables) {
        const cachedData = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${table}`);
        if (!cachedData) continue;

        const data = JSON.parse(cachedData);
        if (!Array.isArray(data) || data.length === 0) continue;

        // Push each record to Supabase
        for (const record of data) {
          const { error } = await supabase
            .from(table)
            .upsert({
              ...record,
              user_id: userId,
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error(`Error pushing to ${table}:`, error);
            continue;
          }

          totalPushed++;
        }

        console.log(`✅ Pushed ${data.length} records to ${table}`);
      }

      console.log(`🎉 Push to cloud completed. Total records: ${totalPushed}`);
      
      return {
        success: true,
        syncedCount: totalPushed,
      };
    } catch (error) {
      console.error('Push to cloud error:', error);
      return {
        success: false,
        error: 'Failed to push data to cloud',
      };
    }
  }

  /**
   * Get cached data for a specific table
   */
  static async getCachedData(table: string): Promise<any[]> {
    try {
      const cachedData = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${table}`);
      return cachedData ? JSON.parse(cachedData) : [];
    } catch (error) {
      console.error(`Error getting cached data for ${table}:`, error);
      return [];
    }
  }

  /**
   * Cache data locally
   */
  static async cacheData(table: string, data: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(`${this.CACHE_PREFIX}${table}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error caching data for ${table}:`, error);
    }
  }

  /**
   * Check if sync is needed
   */
  static async isSyncNeeded(): Promise<boolean> {
    try {
      const lastSync = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
      if (!lastSync) return true;

      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const diffInMinutes = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60);

      // Sync if last sync was more than 5 minutes ago
      return diffInMinutes > 5;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return true;
    }
  }

  /**
   * Clear all cached data
   */
  static async clearCache(): Promise<void> {
    try {
      const tables = [
        'journals', 'goals.data', 'habits', 'tasks', 'reminders', 
        'reflections', 'achievements', 'user_settings'
      ];

      for (const table of tables) {
        await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${table}`);
      }

      await AsyncStorage.removeItem(this.LAST_SYNC_KEY);
      console.log('🧹 Cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}
