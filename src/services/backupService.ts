import { supabase } from '../lib/supabase';
// Use legacy API to avoid SDK 52 deprecation error for writeAsStringAsync
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataSyncService } from './dataSyncService';

export interface BackupData {
  journals: any[];
  goals: any[];
  habits: any[];
  tasks: any[];
  reminders: any[];
  reflections: any[];
  achievements: any[];
  user_settings: any[];
  metadata: {
    export_date: string;
    user_id: string;
    version: string;
  };
}

export interface CloudBackup {
  id: string;
  backup_data: BackupData;
  backup_type: string;
  description: string;
  created_at: string;
}

export class BackupService {
  /**
   * Export all user data as JSON
   */
  static async exportData(userId: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      console.log('📤 Starting data export for user:', userId);

      // Get all user data
      const tables = [
        'journals', 'goals', 'habits', 'tasks', 'reminders', 
        'reflections', 'achievements', 'user_settings'
      ];

      const exportData: BackupData = {
        journals: [],
        goals: [],
        habits: [],
        tasks: [],
        reminders: [],
        reflections: [],
        achievements: [],
        user_settings: [],
        metadata: {
          export_date: new Date().toISOString(),
          user_id: userId,
          version: '1.0',
        },
      };

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error(`Error fetching ${table}:`, error);
          continue;
        }

        if (data) {
          (exportData as any)[table] = data;
          console.log(`✅ Exported ${data.length} records from ${table}`);
        }
      }

      // Save to file
      const fileName = `daily_backup_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));

      console.log(`🎉 Data export completed: ${fileName}`);

      return {
        success: true,
        filePath,
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: 'Failed to export data',
      };
    }
  }

  /**
   * Share exported data
   */
  static async shareData(filePath: string): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.error('Sharing is not available on this device');
        return false;
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Daily Data',
      });

      return true;
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  }

  /**
   * Create cloud backup
   */
  static async createCloudBackup(userId: string, description?: string): Promise<{ success: boolean; backupId?: string; error?: string }> {
    try {
      console.log('☁️ Creating cloud backup for user:', userId);

      // Get all user data
      const tables = [
        'journals', 'goals', 'habits', 'tasks', 'reminders', 
        'reflections', 'achievements', 'user_settings'
      ];

      const backupData: BackupData = {
        journals: [],
        goals: [],
        habits: [],
        tasks: [],
        reminders: [],
        reflections: [],
        achievements: [],
        user_settings: [],
        metadata: {
          export_date: new Date().toISOString(),
          user_id: userId,
          version: '1.0',
        },
      };

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.error(`Error fetching ${table} for backup:`, error);
          continue;
        }

        if (data) {
          (backupData as any)[table] = data;
        }
      }

      // Save to backups table
      const { data, error } = await supabase
        .from('backups')
        .insert({
          user_id: userId,
          backup_data: backupData,
          backup_type: 'full',
          description: description || `Backup created on ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating cloud backup:', error);
        return {
          success: false,
          error: 'Failed to create cloud backup',
        };
      }

      console.log(`🎉 Cloud backup created: ${data.id}`);

      return {
        success: true,
        backupId: data.id,
      };
    } catch (error) {
      console.error('Cloud backup error:', error);
      return {
        success: false,
        error: 'Failed to create cloud backup',
      };
    }
  }

  /**
   * Get all cloud backups for user
   */
  static async getCloudBackups(userId: string): Promise<{ success: boolean; backups?: CloudBackup[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cloud backups:', error);
        return {
          success: false,
          error: 'Failed to fetch cloud backups',
        };
      }

      return {
        success: true,
        backups: data || [],
      };
    } catch (error) {
      console.error('Get cloud backups error:', error);
      return {
        success: false,
        error: 'Failed to fetch cloud backups',
      };
    }
  }

  /**
   * Restore from cloud backup
   */
  static async restoreFromCloudBackup(userId: string, backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Restoring from cloud backup:', backupId);

      // Get backup data
      const { data: backup, error: fetchError } = await supabase
        .from('backups')
        .select('*')
        .eq('id', backupId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !backup) {
        console.error('Error fetching backup:', fetchError);
        return {
          success: false,
          error: 'Backup not found',
        };
      }

      const backupData = backup.backup_data as BackupData;
      const tables = [
        'journals', 'goals', 'habits', 'tasks', 'reminders', 
        'reflections', 'achievements', 'user_settings'
      ];

      // Clear existing data
      for (const table of tables) {
        await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
      }

      // Restore data
      for (const table of tables) {
        const data = (backupData as any)[table];
        if (data && data.length > 0) {
          const recordsToInsert = data.map((record: any) => ({
            ...record,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          const { error } = await supabase
            .from(table)
            .insert(recordsToInsert);

          if (error) {
            console.error(`Error restoring ${table}:`, error);
            continue;
          }

          console.log(`✅ Restored ${recordsToInsert.length} records to ${table}`);
        }
      }

      // Update local cache
      await DataSyncService.syncFromCloud(userId);

      console.log('🎉 Restore from cloud backup completed');

      return {
        success: true,
      };
    } catch (error) {
      console.error('Restore from cloud backup error:', error);
      return {
        success: false,
        error: 'Failed to restore from cloud backup',
      };
    }
  }

  /**
   * Download user data (alias for exportData)
   */
  static async downloadUserData(userId: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    return this.exportData(userId);
  }

  /**
   * Delete cloud backup
   */
  static async deleteCloudBackup(userId: string, backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('backups')
        .delete()
        .eq('id', backupId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting cloud backup:', error);
        return {
          success: false,
          error: 'Failed to delete cloud backup',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Delete cloud backup error:', error);
      return {
        success: false,
        error: 'Failed to delete cloud backup',
      };
    }
  }

  /**
   * Backup data to cloud
   */
  static async backupToCloud(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const exportResult = await this.exportData(userId);
      if (!exportResult.success || !exportResult.filePath) {
        return {
          success: false,
          error: 'Failed to export data for backup',
        };
      }

      const { data, error } = await supabase.storage
        .from('backups')
        .upload(`${userId}/backup_${Date.now()}.json`, exportResult.filePath, {
          contentType: 'application/json',
        });

      if (error) {
        console.error('Error uploading backup to cloud:', error);
        return {
          success: false,
          error: 'Failed to upload backup to cloud',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Backup to cloud error:', error);
      return {
        success: false,
        error: 'Failed to backup to cloud',
      };
    }
  }

  /**
   * Restore data from cloud
   */
  static async restoreFromCloud(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: files, error } = await supabase.storage
        .from('backups')
        .list(userId, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error || !files || files.length === 0) {
        return {
          success: false,
          error: 'No backup found',
        };
      }

      const { data, error: downloadError } = await supabase.storage
        .from('backups')
        .download(files[0].name);

      if (downloadError) {
        console.error('Error downloading backup:', downloadError);
        return {
          success: false,
          error: 'Failed to download backup',
        };
      }

      // TODO: Implement restore logic here
      return {
        success: true,
      };
    } catch (error) {
      console.error('Restore from cloud error:', error);
      return {
        success: false,
        error: 'Failed to restore from cloud',
      };
    }
  }

  /**
   * Clear all data
   */
  static async clearAllData(): Promise<{ success: boolean; error?: string }> {
    try {
      await AsyncStorage.clear();
      return {
        success: true,
      };
    } catch (error) {
      console.error('Clear all data error:', error);
      return {
        success: false,
        error: 'Failed to clear all data',
      };
    }
  }
}