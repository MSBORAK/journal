import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase, signOut as supabaseSignOut, getCurrentUser } from '../lib/supabase';
import { isNetworkError } from '../utils/networkUtils';
import { AuthService, OtpRequestData, OtpVerifyData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithOtp: (data: OtpRequestData) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (data: OtpVerifyData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  linkAccount: (email: string, otp: string) => Promise<void>;
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
  const isCreatingAnonymousRef = React.useRef(false); // Infinite loop önleme

  const createAnonymousUser = async () => {
    try {
      // Timeout ekle - 3 saniye içinde cevap gelmezse devam et
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Anonymous user creation timeout')), 3000)
      );
      
      const { data, error } = await Promise.race([
        supabase.auth.signInAnonymously(),
        timeoutPromise
      ]) as any;
      
      if (error) {
        // Network hatası ise sessizce handle et (offline mod)
        if (isNetworkError(error)) {
          console.warn('⚠️ Network error creating anonymous user (offline mode)');
          // Network hatasında user null olarak kalır, uygulama offline modda çalışır
          throw error; // initializeAuth'da handle edilecek
        }
        
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
      // Timeout ekle - 5 saniye içinde cevap gelmezse devam et
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      );
      
      const currentUser = await Promise.race([
        getCurrentUser(),
        timeoutPromise
      ]) as any;
      
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
        setLoading(false);
      } else {
        // Kullanıcı yoksa otomatik olarak anonim kullanıcı oluştur
        try {
          await createAnonymousUser();
        } catch (anonErr) {
          // Anonim kullanıcı oluşturulamazsa offline modda devam et
          console.warn('⚠️ Could not create anonymous user, continuing offline');
          setUser(null);
        }
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      // Network hatası veya timeout durumunda offline modda devam et
      if (isNetworkError(error) || error?.message === 'Auth timeout') {
        console.warn('⚠️ Network/timeout error, continuing offline');
        setUser(null);
        setLoading(false);
        return;
      }
      
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
            isCreatingAnonymousRef.current = false; // Reset flag
          } else {
            // Session yoksa anonim kullanıcı oluştur (sadece SIGNED_OUT event'inde ve daha önce oluşturulmadıysa)
            if (event === 'SIGNED_OUT' && !isCreatingAnonymousRef.current && !user) {
              try {
                isCreatingAnonymousRef.current = true;
                await createAnonymousUser();
              } catch (error: any) {
                console.error('Failed to create anonymous user:', error);
                if (isMounted) {
                  setUser(null);
                  setLoading(false);
                }
              } finally {
                isCreatingAnonymousRef.current = false;
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

            // Production için email confirmation URL'i
            const emailRedirectUrl = 'https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-confirm/auth-confirm.html';
            
            const { data, error } = await supabase.auth.signUp({
              email: email.toLowerCase().trim(),
              password,
              options: {
                data: {
                  full_name: displayName.trim(),
                },
                emailRedirectTo: emailRedirectUrl,
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
            
            // Kullanıcı oluşturuldu
            if (data.user) {
              // Email confirmation açıksa kullanıcı henüz onaylanmamış olabilir
              // Session oluştur ama email confirmation gerekiyorsa kullanıcıya bilgi ver
              if (data.session) {
                // Session varsa direkt login yap
                const user: User = {
                  uid: data.user.id,
                  email: data.user.email || '',
                  displayName: displayName.trim(),
                  photoURL: data.user.user_metadata?.avatar_url || undefined,
                  appAlias: data.user.user_metadata?.app_alias || 'Rhythm',
                  nickname: data.user.user_metadata?.nickname || 'Guest',
                };
                setUser(user);
                console.log('✅ User signed up and logged in successfully:', user);
              } else {
                // Session yoksa email confirmation gerekiyor
                // Kullanıcıya email onayı gerektiğini söyle ama hata fırlatma
                console.log('📧 Email confirmation required for:', data.user.email);
                // User state'ini set et ama email confirmation mesajı gösterilecek
                const user: User = {
                  uid: data.user.id,
                  email: data.user.email || '',
                  displayName: displayName.trim(),
                  photoURL: data.user.user_metadata?.avatar_url || undefined,
                  appAlias: data.user.user_metadata?.app_alias || 'Rhythm',
                  nickname: data.user.user_metadata?.nickname || 'Guest',
                };
                // Email confirmation gerekiyor ama kullanıcı oluşturuldu
                // AuthScreen'de toast mesajı gösterilecek
              }
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
        // Kullanıcı bulunamadıysa, mevcut user state'ini koru (giriş ekranına yönlendirme)
        // Session kaybı durumunda bile user state'ini korumalıyız
        if (user) {
          console.warn('⚠️ No user found during refresh, but user exists in state - keeping current user state');
          // User state'ini koru, güncelleme yapma
          // Anonymous kullanıcı oluşturmayı deneme - bu giriş ekranına yönlendirmeye neden olabilir
        } else {
          console.warn('⚠️ No user found during refresh');
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      // Hata durumunda da user state'ini koru (giriş ekranına yönlendirme)
      if (user) {
        console.warn('⚠️ Error during refresh, keeping current user state');
      }
    }
  };

  const linkAccount = async (email: string, otp: string): Promise<void> => {
    setLoading(true);
    try {
      // Validasyon
      if (!email || !otp) {
        throw new Error('Email ve kod zorunludur');
      }

      if (otp.length !== 6) {
        throw new Error('Kod 6 haneli olmalıdır');
      }

      const trimmedEmail = email.toLowerCase().trim();

      // Anonymous kullanıcının mevcut session'ını sakla
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const anonymousUserId = currentSession?.user?.id;

      if (!anonymousUserId) {
        throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      }

      // OTP'yi doğrula (email tipinde - signInWithOtp ile gönderildi)
      // signInWithOtp "Magic Link" template'ini kullanır ve email tipinde OTP gönderir
      // Önce email tipinde dene, eğer olmazsa email_change tipinde dene
      console.log('🔗 Link Account: OTP doğrulanıyor (email)...');
      let verifyData, verifyError;
      
      // İlk olarak email tipinde dene (signInWithOtp ile gönderilen OTP'ler)
      const emailVerifyResult = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: otp,
        type: 'email',
      });
      
      verifyData = emailVerifyResult.data;
      verifyError = emailVerifyResult.error;
      
      // Eğer email tipi başarısız olduysa, email_change tipinde dene (fallback)
      if (verifyError && (verifyError.message?.toLowerCase().includes('invalid') || 
                         verifyError.message?.toLowerCase().includes('expired'))) {
        console.log('⚠️ Email tipi başarısız, email_change tipinde deneniyor...');
        const emailChangeVerifyResult = await supabase.auth.verifyOtp({
          email: trimmedEmail,
          token: otp,
          type: 'email_change',
        });
        
        verifyData = emailChangeVerifyResult.data;
        verifyError = emailChangeVerifyResult.error;
      }

      if (verifyError) {
        console.error('❌ OTP verification error:', verifyError);
        const errorMessage = verifyError?.message || '';
        if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('expired')) {
          throw new Error('Geçersiz veya süresi dolmuş kod. Lütfen yeni bir kod isteyin.');
        }
        throw new Error(errorMessage || 'Kod doğrulanamadı. Lütfen tekrar deneyin.');
      }

      // OTP doğrulandı - yeni bir session oluşturuldu
      // Artık anonymous kullanıcı değil, email ile giriş yapmış kullanıcı
      if (verifyData?.user) {
        setIsAnonymous(false);
        const updatedUser: User = {
          uid: verifyData.user.id,
          email: verifyData.user.email || trimmedEmail,
          displayName: verifyData.user.user_metadata?.full_name || trimmedEmail.split('@')[0],
          photoURL: verifyData.user.user_metadata?.avatar_url || undefined,
          appAlias: verifyData.user.user_metadata?.app_alias || 'Rhythm',
          nickname: verifyData.user.user_metadata?.nickname || 'Guest',
        };
        setUser(updatedUser);
        console.log('✅ Account linked successfully - OTP verified:', updatedUser);
        
        // NOT: Anonymous kullanıcının verileri aynı user_id ile kalır çünkü
        // OTP doğrulaması yeni kullanıcı oluşturmaz, sadece email ekler
        // Ancak eğer shouldCreateUser: true kullanıldıysa yeni kullanıcı oluşturulur
        // Bu durumda verileri transfer etmemiz gerekebilir
      } else {
        throw new Error('Kullanıcı bilgileri alınamadı. Lütfen tekrar deneyin.');
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
      
      // Mevcut kullanıcı kontrolü
      if (!user?.uid) {
        throw new Error('Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.');
      }
      
      // Supabase user_metadata'yı güncelle
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: trimmedName },
      });

      if (error) {
        console.error('❌ Update display name error:', error);
        const errorMessage = error?.message || '';
        
        // Session veya auth hatası ise özel mesaj
        if (errorMessage.toLowerCase().includes('session') || 
            errorMessage.toLowerCase().includes('jwt') ||
            errorMessage.toLowerCase().includes('auth')) {
          throw new Error('Oturum hatası. Lütfen uygulamayı yeniden başlatın.');
        }
        
        throw new Error('İsim güncellenemedi. Lütfen tekrar deneyin.');
      }

      if (data?.user) {
        // Local user state'i güncelle - mevcut user state'ini koru
        const updatedUser: User = {
          uid: data.user.id,
          email: data.user.email || user?.email || '',
          displayName: trimmedName,
          photoURL: data.user.user_metadata?.avatar_url || user?.photoURL || undefined,
          appAlias: data.user.user_metadata?.app_alias || user?.appAlias || 'Rhythm',
          nickname: data.user.user_metadata?.nickname || user?.nickname || 'Guest',
        };
        setUser(updatedUser);
        // isAnonymous değerini KESINLIKLE değiştirme - mevcut değeri koru
        // updateDisplayName sadece displayName'i günceller, isAnonymous'u değiştirmez
        // setIsAnonymous çağrısı yapma - mevcut değeri koru
        console.log('✅ Display name updated successfully:', trimmedName);
      } else {
        // Eğer data.user yoksa, sadece local state'i güncelle (fallback)
        // Bu durum anonymous kullanıcılar için normal olabilir
        if (user) {
          const updatedUser: User = {
            ...user,
            displayName: trimmedName,
          };
          setUser(updatedUser);
          console.log('✅ Display name updated locally (fallback):', trimmedName);
        }
      }
    } catch (error: any) {
      console.error('❌ Update display name catch error:', error);
      // Hata durumunda user state'ini koru (giriş ekranına yönlendirme)
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
      
      // Mevcut kullanıcı kontrolü
      if (!user?.uid) {
        throw new Error('Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.');
      }
      
      // Supabase user_metadata'yı güncelle
      const { data, error } = await supabase.auth.updateUser({
        data: { nickname: trimmedNickname },
      });

      if (error) {
        console.error('❌ Update nickname error:', error);
        const errorMessage = error?.message || '';
        
        // Session veya auth hatası ise özel mesaj
        if (errorMessage.toLowerCase().includes('session') || 
            errorMessage.toLowerCase().includes('jwt') ||
            errorMessage.toLowerCase().includes('auth')) {
          throw new Error('Oturum hatası. Lütfen uygulamayı yeniden başlatın.');
        }
        
        throw new Error('Takma isim güncellenemedi. Lütfen tekrar deneyin.');
      }

      if (data?.user) {
        // Local user state'i güncelle - mevcut user state'ini koru
        const updatedUser: User = {
          uid: data.user.id,
          email: data.user.email || user?.email || '',
          displayName: data.user.user_metadata?.full_name || user?.displayName || '',
          photoURL: data.user.user_metadata?.avatar_url || user?.photoURL || undefined,
          appAlias: data.user.user_metadata?.app_alias || user?.appAlias || 'Rhythm',
          nickname: trimmedNickname,
        };
        setUser(updatedUser);
        // isAnonymous değerini KESINLIKLE değiştirme - mevcut değeri koru
        // updateNickname sadece nickname'i günceller, isAnonymous'u değiştirmez
        // setIsAnonymous çağrısı yapma - mevcut değeri koru
        console.log('✅ Nickname updated successfully:', trimmedNickname);
      } else {
        // Eğer data.user yoksa, sadece local state'i güncelle (fallback)
        // Bu durum anonymous kullanıcılar için normal olabilir
        if (user) {
          const updatedUser: User = {
            ...user,
            nickname: trimmedNickname,
          };
          setUser(updatedUser);
          console.log('✅ Nickname updated locally (fallback):', trimmedNickname);
        }
      }
    } catch (error: any) {
      console.error('❌ Update nickname catch error:', error);
      // Hata durumunda user state'ini koru (giriş ekranına yönlendirme)
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithOtp = async (data: OtpRequestData) => {
    // Context'teki loading'i set etme, sadece AuthService'i çağır
    // Çünkü AuthScreen kendi loading state'ini yönetiyor
    try {
      console.log('🔐 AuthContext: signInWithOtp çağrıldı', data);
      const result = await AuthService.signInWithOtp(data);
      console.log('🔐 AuthContext: AuthService sonucu', result);
      
      if (!result.success) {
        console.error('❌ AuthContext: OTP başarısız', result.error);
        return {
          success: false,
          error: result.error || 'OTP gönderilemedi',
        };
      }
      
      console.log('✅ AuthContext: OTP başarılı');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthContext: Sign in with OTP catch error:', error);
      return {
        success: false,
        error: error?.message || 'OTP gönderilemedi',
      };
    }
  };

  const verifyOtp = async (data: OtpVerifyData) => {
    setLoading(true);
    try {
      const result = await AuthService.verifyOtp(data);
      if (!result.success) {
        throw new Error(result.error || 'OTP doğrulanamadı');
      }
      
      // User state'ini güncelle
      if (result.user) {
        const user: User = {
          uid: result.user.id,
          email: result.user.email || '',
          displayName: result.user.user_metadata?.full_name || result.user.email?.split('@')[0] || '',
          photoURL: result.user.user_metadata?.avatar_url || undefined,
          appAlias: result.user.user_metadata?.app_alias || 'Rhythm',
          nickname: result.user.user_metadata?.nickname || 'Guest',
        };
        setUser(user);
        setIsAnonymous(false);
        console.log('✅ OTP verified successfully:', user);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error?.message || 'OTP doğrulanamadı',
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithOtp,
    verifyOtp,
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