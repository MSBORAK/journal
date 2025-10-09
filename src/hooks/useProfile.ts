import { useState, useEffect } from 'react';
import { getProfile } from '../services/profileService';

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile(userId);
        setProfile(profileData);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const refreshProfile = async () => {
    if (!userId) return;
    
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);
    } catch (err: any) {
      console.error('Error refreshing profile:', err);
      setError(err.message);
    }
  };

  return {
    profile,
    loading,
    error,
    refreshProfile,
  };
};
