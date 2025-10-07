import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://demo.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  display_name?: string;
  photo_url?: string;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: number; // 1-5 scale
  tags: string[];
  date: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  user_id: string;
  reminder_time?: string; // HH:MM format
  theme: 'light' | 'dark' | 'lavender' | 'mint' | 'cream';
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}
