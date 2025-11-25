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
  linkAccount: (email: string, password: string) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateAppAlias: (appAlias: string) => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
  isAnonymous: boolean;
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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousErrorShown, setAnonymousErrorShown] = useState(false);

  const createAnonymousUser = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        // Özel hata mesajı göster (sadece bir kez)
        if ((error.message?.includes('disabled') || error.message?.includes('Anonymous sign-ins')) && !anonymousErrorShown) {
          console.error('⚠️ IMPORTANT: Anonymous sign-ins are disabled in Supabase!');
          console.error('📋 Please follow these steps:');
          console.error('   1. Go to Supabase Dashboard: https://app.supabase.com');
          console.error('   2. Select your project');
          console.error('   3. Go to Authentication → Settings');
          console.error('   4. Enable "Allow anonymous sign-ins"');
          console.error('   5. Click "Save changes"');
          console.error('   6. Restart the app');
          setAnonymousErrorShown(true);
        }
        throw error;
      }
      
      if (data.user) {
        setIsAnonymous(true);
        setAnonymousErrorShown(false); // Başarılı olduğunda reset et
        const user: User = {
          uid: data.user.id,
          email: '',
          displayName: 'Guest',
          photoURL: undefined,
          appAlias: data.user.user_metadata?.app_alias || 'Rhythm',
          nickname: data.user.user_metadata?.nickname || 'Guest',
        };
        setUser(user);
        console.log('✅ Anonymous user created:', user.uid);
      }
    } catch (error) {
      // Sadece ilk hatada logla, tekrarlayan hataları loglama
      if (!anonymousErrorShown) {
        console.error('❌ Failed to create anonymous user:', error);
      }
      throw error;
    }
  };

  const initializeAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const isAnon = currentUser.is_anonymous || false;
        setIsAnonymous(isAnon);
        const user: User = {
          uid: currentUser.id,
          email: currentUser.email || '',
          displayName: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '',
          photoURL: currentUser.user_metadata?.avatar_url || undefined,
          appAlias: currentUser.user_metadata?.app_alias || 'Rhythm',
          nickname: currentUser.user_metadata?.nickname || 'Guest',
        };
        setUser(user);
      } else {
        // Kullanıcı yoksa otomatik olarak anonim kullanıcı oluştur
        await createAnonymousUser();
      }
      setLoading(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Hata durumunda da anonim kullanıcı oluşturmayı dene
      try {
        await createAnonymousUser();
      } catch (anonError: any) {
        // Hata mesajı createAnonymousUser içinde gösterildi, burada tekrar gösterme
        setUser(null);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let subscription: any = null;

    // Initialize auth state
    const init = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();
    
    // Listen for auth changes
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;

          console.log('🔄 Auth state changed:', event, session?.user?.id);
          
          if (session?.user) {
            const isAnon = session.user.is_anonymous || false;
            setIsAnonymous(isAnon);
            const user: User = {
              uid: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Guest',
              photoURL: session.user.user_metadata?.avatar_url || undefined,
              appAlias: session.user.user_metadata?.app_alias || 'Rhythm',
              nickname: session.user.user_metadata?.nickname || 'Guest',
            };
            setUser(user);
            setLoading(false);
          } else {
            // Session yoksa anonim kullanıcı oluştur (sadece SIGNED_OUT event'inde)
            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
              try {
                await createAnonymousUser();
              } catch (error: any) {
                console.error('Failed to create anonymous user:', error);
                if (isMounted) {
                  setUser(null);
                  setLoading(false);
                }
              }
            } else {
              setLoading(false);
            }
          }
        }
      );
      subscription = authSubscription;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

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
                appAlias: data.user.user_metadata?.app_alias || 'Rhythm',
                nickname: data.user.user_metadata?.nickname || 'Guest',
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
                appAlias: data.user.user_metadata?.app_alias || 'Rhythm',
                nickname: data.user.user_metadata?.nickname || 'Guest',
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
      setIsAnonymous(false);
      // Çıkış yaptıktan sonra yeni anonim kullanıcı oluştur
      await createAnonymousUser();
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null);
      setIsAnonymous(false);
      // Hata olsa bile yeni anonim kullanıcı oluşturmayı dene
      try {
        await createAnonymousUser();
      } catch (anonError) {
        console.error('Failed to create anonymous user after sign out:', anonError);
      }
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
        const isAnon = currentUser.is_anonymous || false;
        setIsAnonymous(isAnon);
        const updatedUser: User = {
          uid: currentUser.id,
          email: currentUser.email || '',
          displayName: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Guest',
          photoURL: currentUser.user_metadata?.avatar_url || undefined,
          appAlias: currentUser.user_metadata?.app_alias || 'Rhythm',
          nickname: currentUser.user_metadata?.nickname || 'Guest',
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

  const linkAccount = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // Validasyon
      if (!email || !password) {
        throw new Error('Email ve şifre zorunludur');
      }

      if (password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }

      const trimmedEmail = email.toLowerCase().trim();

      // Email ve şifreyi aynı anda güncellemeyi dene
      // Anonim kullanıcılar için bu daha güvenilir
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        email: trimmedEmail,
        password: password,
      });

      if (updateError) {
        console.error('❌ Link account update error:', updateError);
        const errorMessage = updateError?.message || '';
        
        // Eğer aynı anda güncelleme başarısız olursa, önce email'i güncellemeyi dene
        if (errorMessage.toLowerCase().includes('password') || 
            errorMessage.toLowerCase().includes('invalid')) {
          console.log('⚠️ Trying to update email first, then password...');
          
          // Önce email'i güncelle
          const { data: emailData, error: emailError } = await supabase.auth.updateUser({
            email: trimmedEmail,
          });

          if (emailError) {
            console.error('❌ Link account email error:', emailError);
            const emailErrorMessage = emailError?.message || '';
            if (emailErrorMessage.toLowerCase().includes('already registered') || 
                emailErrorMessage.toLowerCase().includes('already been registered')) {
              throw new Error('Bu email adresi zaten kullanılıyor.');
            }
            if (emailErrorMessage.toLowerCase().includes('invalid email')) {
              throw new Error('Geçersiz email adresi.');
            }
            throw new Error(emailErrorMessage || 'Email güncellenemedi');
          }

          // Email güncelleme başarılı, şimdi şifreyi güncelle
          // Kısa bir bekleme ekle (email güncelleme işleminin tamamlanması için)
          await new Promise(resolve => setTimeout(resolve, 500));

          const { data: passwordData, error: passwordError } = await supabase.auth.updateUser({
            password: password,
          });

          if (passwordError) {
            console.error('❌ Link account password error:', passwordError);
            const passwordErrorMessage = passwordError?.message || '';
            
            // Şifre güncelleme hatası için daha açıklayıcı mesaj
            if (passwordErrorMessage.toLowerCase().includes('same') || 
                passwordErrorMessage.toLowerCase().includes('identical')) {
              throw new Error('Yeni şifre mevcut şifreyle aynı olamaz.');
            }
            if (passwordErrorMessage.toLowerCase().includes('weak') || 
                passwordErrorMessage.toLowerCase().includes('strength')) {
              throw new Error('Şifre çok zayıf. Daha güçlü bir şifre seçin.');
            }
            throw new Error('Şifre güncellenemedi. Lütfen tekrar deneyin.');
          }

          // Başarılı - email ve şifre ayrı ayrı güncellendi
          const finalUser = passwordData?.user || emailData?.user;
          if (finalUser) {
            setIsAnonymous(false);
            const updatedUser: User = {
              uid: finalUser.id,
              email: finalUser.email || trimmedEmail,
              displayName: finalUser.user_metadata?.full_name || trimmedEmail.split('@')[0],
              photoURL: finalUser.user_metadata?.avatar_url || undefined,
              appAlias: finalUser.user_metadata?.app_alias || 'Rhythm',
              nickname: finalUser.user_metadata?.nickname || 'Guest',
            };
            setUser(updatedUser);
            console.log('✅ Account linked successfully (separate updates):', updatedUser);
          }
        } else {
          // Diğer hatalar
          if (errorMessage.toLowerCase().includes('already registered') || 
              errorMessage.toLowerCase().includes('already been registered')) {
            throw new Error('Bu email adresi zaten kullanılıyor.');
          }
          if (errorMessage.toLowerCase().includes('invalid email')) {
            throw new Error('Geçersiz email adresi.');
          }
          throw new Error(errorMessage || 'Hesap bağlanamadı. Lütfen tekrar deneyin.');
        }
      } else {
        // Başarılı - email ve şifre aynı anda güncellendi
        if (updateData?.user) {
          setIsAnonymous(false);
          const updatedUser: User = {
            uid: updateData.user.id,
            email: updateData.user.email || trimmedEmail,
            displayName: updateData.user.user_metadata?.full_name || trimmedEmail.split('@')[0],
            photoURL: updateData.user.user_metadata?.avatar_url || undefined,
            appAlias: updateData.user.user_metadata?.app_alias || 'Rhythm',
            nickname: updateData.user.user_metadata?.nickname || 'Guest',
          };
          setUser(updatedUser);
          console.log('✅ Account linked successfully (simultaneous update):', updatedUser);
        }
      }
    } catch (error: any) {
      console.error('❌ Link account catch error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayName = async (displayName: string): Promise<void> => {
    setLoading(true);
    try {
      if (!displayName || displayName.trim().length === 0) {
        throw new Error('İsim boş olamaz');
      }

      const trimmedName = displayName.trim();
      
      // Supabase user_metadata'yı güncelle
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: trimmedName },
      });

      if (error) {
        console.error('❌ Update display name error:', error);
        throw new Error('İsim güncellenemedi. Lütfen tekrar deneyin.');
      }

      if (data?.user) {
        // Local user state'i güncelle
        const updatedUser: User = {
          uid: data.user.id,
          email: data.user.email || user?.email || '',
          displayName: trimmedName,
          photoURL: data.user.user_metadata?.avatar_url || user?.photoURL || undefined,
          appAlias: data.user.user_metadata?.app_alias || user?.appAlias || 'Rhythm',
          nickname: data.user.user_metadata?.nickname || user?.nickname || 'Guest',
        };
        setUser(updatedUser);
        console.log('✅ Display name updated successfully:', trimmedName);
      }
    } catch (error: any) {
      console.error('❌ Update display name catch error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAppAlias = async (appAlias: string): Promise<void> => {
    setLoading(true);
    try {
      if (!appAlias || appAlias.trim().length === 0) {
        throw new Error('Uygulama ismi boş olamaz');
      }

      const trimmedAlias = appAlias.trim();
      
      // Max 25 karakter kontrolü
      if (trimmedAlias.length > 25) {
        throw new Error('Uygulama ismi en fazla 25 karakter olabilir');
      }
      
      // Supabase user_metadata'yı güncelle
      const { data, error } = await supabase.auth.updateUser({
        data: { app_alias: trimmedAlias },
      });

      if (error) {
        console.error('❌ Update app alias error:', error);
        throw new Error('Uygulama ismi güncellenemedi. Lütfen tekrar deneyin.');
      }

      if (data?.user) {
        // Local user state'i güncelle
        const updatedUser: User = {
          uid: data.user.id,
          email: data.user.email || user?.email || '',
          displayName: data.user.user_metadata?.full_name || user?.displayName || '',
          photoURL: data.user.user_metadata?.avatar_url || user?.photoURL || undefined,
          appAlias: trimmedAlias,
        };
        setUser(updatedUser);
        console.log('✅ App alias updated successfully:', trimmedAlias);
      }
    } catch (error: any) {
      console.error('❌ Update app alias catch error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateNickname = async (nickname: string): Promise<void> => {
    setLoading(true);
    try {
      if (!nickname || nickname.trim().length === 0) {
        throw new Error('Takma isim boş olamaz');
      }

      const trimmedNickname = nickname.trim();
      
      // Max 25 karakter kontrolü
      if (trimmedNickname.length > 25) {
        throw new Error('Takma isim en fazla 25 karakter olabilir');
      }
      
      // Supabase user_metadata'yı güncelle
      const { data, error } = await supabase.auth.updateUser({
        data: { nickname: trimmedNickname },
      });

      if (error) {
        console.error('❌ Update nickname error:', error);
        throw new Error('Takma isim güncellenemedi. Lütfen tekrar deneyin.');
      }

      if (data?.user) {
        // Local user state'i güncelle
        const updatedUser: User = {
          uid: data.user.id,
          email: data.user.email || user?.email || '',
          displayName: data.user.user_metadata?.full_name || user?.displayName || '',
          photoURL: data.user.user_metadata?.avatar_url || user?.photoURL || undefined,
          appAlias: data.user.user_metadata?.app_alias || user?.appAlias || 'Rhythm',
          nickname: trimmedNickname,
        };
        setUser(updatedUser);
        console.log('✅ Nickname updated successfully:', trimmedNickname);
      }
    } catch (error: any) {
      console.error('❌ Update nickname catch error:', error);
      throw error;
    } finally {
      setLoading(false);
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
    linkAccount,
    updateDisplayName,
    updateAppAlias,
    updateNickname,
    isAnonymous,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};