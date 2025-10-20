import { createClient } from '@supabase/supabase-js';

// Supabase proje bilgileri
const supabaseUrl = 'https://jblqkhgwitktbfeppume.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibHFraGd3aXRrdGJmZXBwdW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ1MDQsImV4cCI6MjA3NTI1MDUwNH0._TnZRl3PBrP5xqZ5HyQn4p6WTAzN1DCj1IG0QuM3Nl0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helper functions

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // Auth session missing is normal when user is not logged in
      if (error.message?.includes('Auth session missing')) {
        return null;
      }
      throw error;
    }
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

// Email değiştirme
export const updateEmail = async (newEmail: string) => {
  try {
    // Önce kullanıcı oturumunu kontrol et
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
    }

    const { data, error } = await supabase.auth.updateUser({
      email: newEmail.toLowerCase().trim(),
      emailRedirectTo: 'daily://auth/callback?type=email_confirm',
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update email error:', error);
    throw error;
  }
};

// Şifre değiştirme
export const updatePassword = async (newPassword: string) => {
  try {
    // Önce kullanıcı oturumunu kontrol et
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};
