import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isNetworkError } from '../utils/networkUtils';

const PROFILE_STORAGE_KEY = 'user_profile';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    // Önce tüm kolonları seçmeyi dene
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Network hatası ise AsyncStorage'dan yükle
      if (isNetworkError(error)) {
        console.warn('⚠️ Network error fetching profile, using local data');
        try {
          const storedProfile = await AsyncStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
          if (storedProfile) {
            return JSON.parse(storedProfile) as Profile;
          }
        } catch (e) {
          console.log('⚠️ Error reading profile from AsyncStorage:', e);
        }
        return null;
      }
      
      // PGRST116 means no rows found - this is normal for new users
      if (error.code === 'PGRST116') {
        console.log('✅ No profile found for user (normal for new users):', userId);
        // AsyncStorage'dan kontrol et
        try {
          const storedProfile = await AsyncStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
          if (storedProfile) {
            return JSON.parse(storedProfile) as Profile;
          }
        } catch (e) {
          console.log('⚠️ Error reading profile from AsyncStorage:', e);
        }
        return null;
      }
      
      // Eğer kolon hatası varsa (full_name, bio vs yoksa), AsyncStorage'dan oku
      if (error.message?.includes('column') || error.code === '42703' || error.message?.includes('schema cache')) {
        console.log('⚠️ Database schema mismatch - profile columns not available:', error.message);
        // AsyncStorage'dan oku
        try {
          const storedProfile = await AsyncStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
          if (storedProfile) {
            console.log('✅ Profile loaded from AsyncStorage');
            return JSON.parse(storedProfile) as Profile;
          }
        } catch (e) {
          console.log('⚠️ Error reading profile from AsyncStorage:', e);
        }
        return null;
      }
      
      console.error('❌ Error fetching profile:', error);
      // AsyncStorage'dan oku (fallback)
      try {
        const storedProfile = await AsyncStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
        if (storedProfile) {
          return JSON.parse(storedProfile) as Profile;
        }
      } catch (e) {
        console.log('⚠️ Error reading profile from AsyncStorage:', e);
      }
      return null;
    }

    // Mevcut kolonları Profile interface'ine uyarla
    const profile: Profile = {
      id: data.id || userId,
      user_id: data.user_id || userId,
      full_name: data.full_name || data.name || data.display_name || '',
      avatar_url: data.avatar_url || data.photo_url || null,
      bio: data.bio || null,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
    
    // AsyncStorage'a kaydet (backup)
    try {
      await AsyncStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(profile));
    } catch (e) {
      console.log('⚠️ Error saving profile to AsyncStorage:', e);
    }
    
    return profile;
  } catch (error: any) {
    // Network hatası ise AsyncStorage'dan yükle
    if (isNetworkError(error)) {
      console.warn('⚠️ Network error fetching profile, using local data');
      try {
        const storedProfile = await AsyncStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
        if (storedProfile) {
          console.log('✅ Profile loaded from AsyncStorage (network error fallback)');
          return JSON.parse(storedProfile) as Profile;
        }
      } catch (e) {
        console.log('⚠️ Error reading profile from AsyncStorage:', e);
      }
      return null;
    }
    
    // Herhangi bir hata durumunda AsyncStorage'dan oku (fallback)
    try {
      const storedProfile = await AsyncStorage.getItem(`${PROFILE_STORAGE_KEY}_${userId}`);
      if (storedProfile) {
        console.log('✅ Profile loaded from AsyncStorage (fallback)');
        return JSON.parse(storedProfile) as Profile;
      }
    } catch (e) {
      console.log('⚠️ Error reading profile from AsyncStorage:', e);
    }
    console.log('⚠️ Profile fetch error (non-critical):', error?.message || error);
    return null;
  }
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> => {
  try {
    // Validate input data
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Veritabanı şemasını kontrol etmeden önce update etmeyi dene
    // Eğer kolonlar yoksa hata verecek, o zaman sadece başarılı döneceğiz (local state'te kalır)
    const updateData: any = {};

    // Sadece undefined olmayan değerleri ekle
    if (updates.full_name !== undefined) {
      updateData.full_name = updates.full_name?.trim() || '';
    }
    
    if (updates.bio !== undefined) {
      updateData.bio = updates.bio?.trim() || null;
    }
    
    if (updates.avatar_url !== undefined) {
      updateData.avatar_url = updates.avatar_url?.trim() || null;
    }

    // Eğer güncellenecek bir şey yoksa, mevcut profili döndür
    if (Object.keys(updateData).length === 0) {
      return await getProfile(userId);
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // Eğer kolon hatası varsa (full_name, bio vs veritabanında yoksa)
      if (error.message?.includes('column') || 
          error.message?.includes('schema cache') ||
          error.code === '42703') {
        console.log('⚠️ Database schema mismatch - profile columns not available. Profile will be saved locally only.');
        // Veritabanı hatası ama uygulama donmasın - sadece local state'te kalır
        // AsyncStorage'a kaydet (local backup)
        const localProfile: Profile = {
          id: userId,
          user_id: userId,
          full_name: updates.full_name || '',
          avatar_url: updates.avatar_url || undefined,
          bio: updates.bio || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        try {
          await AsyncStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(localProfile));
          console.log('✅ Profile saved to AsyncStorage');
        } catch (error) {
          console.log('⚠️ Error saving profile to AsyncStorage:', error);
        }
        
        return localProfile;
      }
      
      // Diğer hatalar için hata fırlat
      console.error('❌ Supabase error updating profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    console.log('✅ Profile updated successfully:', data);
    
    // Mevcut kolonları Profile interface'ine uyarla
    const updatedProfile: Profile = {
      id: data.id || userId,
      user_id: data.user_id || userId,
      full_name: data.full_name || data.name || data.display_name || '',
      avatar_url: data.avatar_url || data.photo_url || null,
      bio: data.bio || null,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
    };
    
    // AsyncStorage'a kaydet (local backup)
    try {
      await AsyncStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(updatedProfile));
    } catch (error) {
      console.log('⚠️ Error saving profile to AsyncStorage:', error);
    }
    
    // Supabase Auth'un user_metadata'sını da güncelle (displayName için)
    if (updates.full_name !== undefined) {
      try {
        const { error: authError } = await supabase.auth.updateUser({
          data: { 
            full_name: updates.full_name.trim(),
            ...(updates.avatar_url && { avatar_url: updates.avatar_url }),
          }
        });
        if (authError) {
          console.log('⚠️ Error updating user_metadata (non-critical):', authError.message);
        } else {
          console.log('✅ User metadata updated successfully');
        }
      } catch (authError) {
        console.log('⚠️ Error updating user_metadata (non-critical):', authError);
      }
    }
    
    return updatedProfile;
  } catch (error: any) {
    // Eğer kolon hatası ise, local state'te kalması için başarılı döndür
    if (error?.message?.includes('column') || 
        error?.message?.includes('schema cache') ||
        error?.code === '42703') {
      console.log('⚠️ Profile update failed due to schema mismatch, keeping local state');
      // AsyncStorage'a kaydet (local backup)
      const localProfile: Profile = {
        id: userId,
        user_id: userId,
        full_name: updates.full_name || '',
        avatar_url: updates.avatar_url || undefined,
        bio: updates.bio || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      try {
        await AsyncStorage.setItem(`${PROFILE_STORAGE_KEY}_${userId}`, JSON.stringify(localProfile));
        console.log('✅ Profile saved to AsyncStorage');
      } catch (error) {
        console.log('⚠️ Error saving profile to AsyncStorage:', error);
      }
      
      // Supabase Auth'un user_metadata'sını da güncelle (displayName için)
      if (updates.full_name !== undefined) {
        try {
          const { error: authError } = await supabase.auth.updateUser({
            data: { 
              full_name: updates.full_name.trim(),
              ...(updates.avatar_url && { avatar_url: updates.avatar_url }),
            }
          });
          if (authError) {
            console.log('⚠️ Error updating user_metadata (non-critical):', authError.message);
          } else {
            console.log('✅ User metadata updated successfully');
          }
        } catch (authError) {
          console.log('⚠️ Error updating user_metadata (non-critical):', authError);
        }
      }
      
      return localProfile;
    }
    
    console.error('❌ Error updating profile:', error);
    throw error;
  }
};

export const createProfile = async (
  userId: string,
  profileData: Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Profile | null> => {
  try {
    // Validate input data
    if (!userId || !profileData.full_name?.trim()) {
      throw new Error('User ID and full name are required');
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        full_name: profileData.full_name.trim(),
        bio: profileData.bio?.trim() || null,
        avatar_url: profileData.avatar_url?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error creating profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    console.log('✅ Profile created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error creating profile:', error);
    throw error;
  }
};
