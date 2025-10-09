import { supabase } from '../lib/supabase';

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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116 means no rows found - this is normal for new users
      if (error.code === 'PGRST116') {
        console.log('No profile found for user:', userId);
        return null;
      }
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
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

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.full_name !== undefined) {
      updateData.full_name = updates.full_name?.trim() || '';
    }
    if (updates.bio !== undefined) {
      updateData.bio = updates.bio?.trim() || null;
    }
    if (updates.avatar_url !== undefined) {
      updateData.avatar_url = updates.avatar_url?.trim() || null;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error updating profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    console.log('✅ Profile updated successfully:', data);
    return data;
  } catch (error: any) {
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
