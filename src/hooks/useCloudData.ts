import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DataSyncService } from '../services/dataSyncService';

export const useCloudData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Sync data from cloud
  const syncFromCloud = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await DataSyncService.syncFromCloud(user.uid);
      if (!result.success) {
        setError(result.error || 'Sync failed');
      }
      return result;
    } catch (err) {
      setError('Sync failed');
      return { success: false, error: 'Sync failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Push data to cloud
  const pushToCloud = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await DataSyncService.pushToCloud(user.uid);
      if (!result.success) {
        setError(result.error || 'Push failed');
      }
      return result;
    } catch (err) {
      setError('Push failed');
      return { success: false, error: 'Push failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Check if sync is needed
  const checkSyncStatus = async () => {
    return await DataSyncService.isSyncNeeded();
  };

  // Auto sync on mount
  useEffect(() => {
    if (user?.uid) {
      checkSyncStatus().then((needed) => {
        if (needed) {
          syncFromCloud();
        }
      });
    }
  }, [user?.uid]);

  return {
    syncFromCloud,
    pushToCloud,
    checkSyncStatus,
    isLoading,
    error,
  };
};
