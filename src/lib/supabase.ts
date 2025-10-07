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
export const signInWithGoogle = async () => {
  try {
    // Google Sign-In implementation will be added here
    console.log('Google Sign-In not implemented yet');
    return null;
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
};

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
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};
