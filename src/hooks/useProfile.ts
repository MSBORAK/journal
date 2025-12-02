import { useState, useEffect } from 'react';
import { getProfile } from '../services/profileService';
import { isNetworkError } from '../utils/networkUtils';

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
        // Network hatası ise kritik değil, sadece logla
        if (isNetworkError(err)) {
          console.warn('⚠️ Network error loading profile (non-critical)');
          setError(null); // Network hatası kritik değil, profil null olabilir
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const refreshProfile = async () => {
    if (!userId) return;
    
    try {
      setError(null);
      const profileData = await getProfile(userId);
      setProfile(profileData);
    } catch (err: any) {
      console.error('Error refreshing profile:', err);
      // Network hatası ise kritik değil
      if (isNetworkError(err)) {
        console.warn('⚠️ Network error refreshing profile (non-critical)');
        setError(null);
        return; // Network hatasında profil güncellemesi yapma
      }
      // Bio kolonu hatası varsa, profil null olarak ayarla (kritik hata değil)
      if (err?.message?.includes('bio') || err?.message?.includes("column 'bio'")) {
        console.log('⚠️ Bio column error in refreshProfile, setting profile to null');
        setProfile(null);
        setError(null); // Bio hatası kritik değil
      } else {
        setError(err.message);
      }
    }
  };

  return {
    profile,
    loading,
    error,
    refreshProfile,
  };
};
