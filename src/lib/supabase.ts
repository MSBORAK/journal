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
    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error('Geçerli bir email adresi giriniz.');
    }

    // Önce kullanıcı oturumunu kontrol et
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
    }

    // Eski email ile aynıysa hata ver
    if (user.email?.toLowerCase() === newEmail.toLowerCase()) {
      throw new Error('Yeni email adresi mevcut email adresinizle aynı olamaz.');
    }

    const { data, error } = await supabase.auth.updateUser({
      email: newEmail.toLowerCase().trim(),
    }, {
      emailRedirectTo: 'rhythm://auth/callback?type=email_confirm',
    });
    
    if (error) {
      // Supabase hatalarını Türkçe'ye çevir
      const errorMessage = error?.message || '';
      if (errorMessage.toLowerCase().includes('already registered') || 
          errorMessage.toLowerCase().includes('already been registered')) {
        throw new Error('Bu email adresi zaten kullanılıyor.');
      }
      if (errorMessage.toLowerCase().includes('rate limit') || 
          errorMessage.toLowerCase().includes('too many')) {
        throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.');
      }
      if (errorMessage.toLowerCase().includes('invalid email')) {
        throw new Error('Geçersiz email adresi.');
      }
      throw new Error('Email güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
    
    return data;
  } catch (error) {
    console.error('Update email error:', error);
    throw error;
  }
};

// Şifre değiştirme
export const updatePassword = async (newPassword: string, oldPassword?: string) => {
  try {
    // Şifre validasyonu
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Şifre en az 6 karakter olmalıdır.');
    }

    if (newPassword.length > 128) {
      throw new Error('Şifre çok uzun. Maksimum 128 karakter olabilir.');
    }

    // Şifre güçlülük kontrolü
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    
    if (!hasLowerCase || !hasNumbers) {
      throw new Error('Şifre en az bir küçük harf ve bir rakam içermelidir.');
    }

    // Önce kullanıcı oturumunu kontrol et
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
    }

    // Eski şifre kontrolü (eğer sağlanmışsa)
    if (oldPassword && user.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });
      
      if (signInError) {
        throw new Error('Mevcut şifreniz yanlış.');
      }
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      // Supabase hatalarını Türkçe'ye çevir
      const errorMessage = error?.message || '';
      if (errorMessage.toLowerCase().includes('password')) {
        throw new Error('Şifre çok zayıf. Daha güçlü bir şifre seçin.');
      }
      if (errorMessage.toLowerCase().includes('rate limit') || 
          errorMessage.toLowerCase().includes('too many')) {
        throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.');
      }
      throw new Error('Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
    
    return data;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};
