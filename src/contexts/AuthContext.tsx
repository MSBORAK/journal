import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase, signOut as supabaseSignOut, getCurrentUser } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
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
            // Validate input
            if (!email || !password) {
              throw new Error('Email ve şifre zorunludur');
            }

            const { data, error } = await supabase.auth.signInWithPassword({
              email: email.toLowerCase().trim(),
              password,
            });
            
            if (error) {
              console.error('❌ Sign in error:', error);
              const errorMessage = error?.message || '';
              // Supabase hatalarını Türkçe'ye çevir
              if (errorMessage.toLowerCase().includes('invalid login credentials') || 
                  errorMessage.toLowerCase().includes('invalid credentials')) {
                throw new Error('Email veya şifre hatalı.');
              }
              if (errorMessage.toLowerCase().includes('email not confirmed')) {
                throw new Error('Email adresinizi onaylamanız gerekiyor. Lütfen email kutunuzu kontrol edin.');
              }
              if (errorMessage.toLowerCase().includes('too many') || 
                  errorMessage.toLowerCase().includes('rate limit')) {
                throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.');
              }
              throw new Error(errorMessage || 'Giriş yapılamadı');
            }
            
            if (data.user) {
              const user: User = {
                uid: data.user.id,
                email: data.user.email || '',
                displayName: data.user.user_metadata?.full_name || email.split('@')[0],
                photoURL: data.user.user_metadata?.avatar_url || undefined,
              };
              setUser(user);
              console.log('✅ User signed in successfully:', user);
            }
          } catch (error: any) {
            console.error('❌ Sign in catch error:', error);
            
            // Network hatalarını kontrol et
            const errorMessage = error?.message || error?.toString() || '';
            if (errorMessage.toLowerCase().includes('network request failed') ||
                errorMessage.toLowerCase().includes('network error') ||
                errorMessage.toLowerCase().includes('fetch failed') ||
                errorMessage.toLowerCase().includes('connection') ||
                error?.code === 'NETWORK_ERROR' ||
                error?.name === 'NetworkError') {
              throw new Error('İnternet bağlantınızı kontrol edin. Bağlantı hatası oluştu.');
            }
            
            // Eğer error zaten bir Error object ise direkt throw et
            if (error instanceof Error) {
              throw error;
            }
            // Değilse generic mesaj ver
            throw new Error('Giriş yapılamadı. Lütfen tekrar deneyin.');
          } finally {
            setLoading(false);
          }
        };

        const signUp = async (email: string, password: string, displayName: string) => {
          setLoading(true);
          try {
            // Validate input
            if (!email || !password || !displayName) {
              throw new Error('Tüm alanlar zorunludur');
            }

            if (password.length < 6) {
              throw new Error('Şifre en az 6 karakter olmalıdır');
            }

            const { data, error } = await supabase.auth.signUp({
              email: email.toLowerCase().trim(),
              password,
              options: {
                data: {
                  full_name: displayName.trim(),
                },
              },
            });
            
            if (error) {
              console.error('❌ Sign up error:', error);
              const errorMessage = error?.message || '';
              // Supabase hatalarını Türkçe'ye çevir
              if (errorMessage.toLowerCase().includes('already registered') || 
                  errorMessage.toLowerCase().includes('already been registered')) {
                throw new Error('Bu email adresi zaten kullanılıyor.');
              }
              if (errorMessage.toLowerCase().includes('invalid email')) {
                throw new Error('Geçersiz email adresi.');
              }
              if (errorMessage.toLowerCase().includes('password should be at least')) {
                throw new Error('Şifre en az 6 karakter olmalıdır.');
              }
              if (errorMessage.toLowerCase().includes('too many') || 
                  errorMessage.toLowerCase().includes('rate limit')) {
                throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.');
              }
              throw new Error(errorMessage || 'Hesap oluşturulamadı');
            }
            
            if (data.user) {
              const user: User = {
                uid: data.user.id,
                email: data.user.email || '',
                displayName: displayName.trim(),
                photoURL: data.user.user_metadata?.avatar_url || undefined,
              };
              setUser(user);
              console.log('✅ User signed up successfully:', user);
            }
          } catch (error: any) {
            console.error('❌ Sign up catch error:', error);
            
            // Network hatalarını kontrol et
            const errorMessage = error?.message || error?.toString() || '';
            if (errorMessage.toLowerCase().includes('network request failed') ||
                errorMessage.toLowerCase().includes('network error') ||
                errorMessage.toLowerCase().includes('fetch failed') ||
                errorMessage.toLowerCase().includes('connection') ||
                error?.code === 'NETWORK_ERROR' ||
                error?.name === 'NetworkError') {
              throw new Error('İnternet bağlantınızı kontrol edin. Bağlantı hatası oluştu.');
            }
            
            // Eğer error zaten bir Error object ise direkt throw et
            if (error instanceof Error) {
              throw error;
            }
            // Değilse generic mesaj ver
            throw new Error('Hesap oluşturulamadı. Lütfen tekrar deneyin.');
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

  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }
      console.log('Session refreshed successfully');
      return true;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  };

  // Kullanıcı bilgilerini yenile - email güncelleme sonrası UI state'ini güncellemek için
  const refreshUser = async (): Promise<void> => {
    try {
      console.log('🔄 Refreshing user data...');
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const updatedUser: User = {
          uid: currentUser.id,
          email: currentUser.email || '',
          displayName: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '',
          photoURL: currentUser.user_metadata?.avatar_url || undefined,
        };
        setUser(updatedUser);
        console.log('✅ User data refreshed:', updatedUser);
      } else {
        console.warn('⚠️ No user found during refresh');
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};