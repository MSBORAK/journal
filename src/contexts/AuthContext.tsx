import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase, signInWithGoogle, signOut as supabaseSignOut, getCurrentUser } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user: User = {
            uid: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
            photoURL: session.user.user_metadata?.avatar_url || undefined,
          };
          setUser(user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const user: User = {
          uid: currentUser.id,
          email: currentUser.email || '',
          displayName: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '',
          photoURL: currentUser.user_metadata?.avatar_url || undefined,
        };
        setUser(user);
      } else {
        // No user logged in - this is normal
        setUser(null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const user: User = {
          uid: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.full_name || email.split('@')[0],
          photoURL: data.user.user_metadata?.avatar_url || undefined,
        };
        setUser(user);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        const user: User = {
          uid: data.user.id,
          email: data.user.email || '',
          displayName: displayName,
          photoURL: data.user.user_metadata?.avatar_url || undefined,
        };
        setUser(user);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Hesap oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Google Sign-In will be implemented here
      // For now, throw an error to indicate it's not implemented
      throw new Error('Google Sign-In henüz aktif değil. Önce Supabase projesi kurulmalı.');
    } catch (error: any) {
      throw new Error(error.message || 'Google ile giriş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabaseSignOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null); // Force sign out even if there's an error
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};