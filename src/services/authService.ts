import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthResponse {
  success: boolean;
  user?: User | null;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface OtpRequestData {
  email: string;
  shouldCreateUser?: boolean;
  emailRedirectTo?: string;
}

export interface OtpVerifyData {
  email: string;
  token: string;
  type?: 'email' | 'recovery' | 'invite' | 'email_change';
}

export class AuthService {
  /**
   * Register a new user
   */
  static async signUp({ email, password, fullName }: SignUpData): Promise<AuthResponse> {
    try {
      // Production için email confirmation URL'i
      const emailRedirectUrl = 'https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-confirm/auth-confirm.html';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
          emailRedirectTo: emailRedirectUrl,
        },
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during registration',
      };
    }
  }

  /**
   * Sign in existing user
   */
  static async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during sign in',
      };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: null,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during sign out',
      };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const redirectUrl = 'https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html';
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during password reset',
      };
    }
  }

  /**
   * Update user email
   */
  static async updateEmail(newEmail: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail,
      }, {
        emailRedirectTo: 'https://daily-app.netlify.app/email-confirm',
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during email update',
      };
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        };
      }

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'An unexpected error occurred during password update',
      };
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
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
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Passwordless Authentication: Request OTP (One-Time Password)
   * Sends a unique, time-sensitive code to the user's email
   * 
   * @param {OtpRequestData} data - Email and optional configuration
   * @returns {Promise<AuthResponse>} Success status (no user returned until verification)
   */
  static async signInWithOtp({ 
    email, 
    shouldCreateUser = true,
    emailRedirectTo 
  }: OtpRequestData): Promise<AuthResponse> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return {
          success: false,
          error: 'Geçersiz e-posta adresi',
        };
      }

      console.log('📧 AuthService: Supabase signInWithOtp çağrılıyor...', email.toLowerCase().trim());
      console.log('📧 AuthService: shouldCreateUser:', shouldCreateUser);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser, // Auto-create user if they don't exist
          // emailRedirectTo kaldırıldı - OTP flow'unda magic link'e gerek yok
          // Kullanıcı kodu direkt uygulamaya girecek
        },
      });

      console.log('📧 AuthService: Supabase response - data:', JSON.stringify(data, null, 2));
      console.log('📧 AuthService: Supabase response - error:', error ? {
        message: error.message,
        status: error.status,
        name: error.name,
      } : null);

      if (error) {
        console.error('❌ AuthService: Supabase hatası:', error);
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        };
      }

      // OTP sent successfully (no session created yet)
      console.log('✅ AuthService: OTP başarıyla gönderildi');
      return {
        success: true,
        user: null, // User will be set after OTP verification
      };
    } catch (error: any) {
      console.error('Sign in with OTP error:', error);
      return {
        success: false,
        error: error?.message || 'OTP gönderilirken beklenmeyen bir hata oluştu',
      };
    }
  }

  /**
   * Passwordless Authentication: Verify OTP (One-Time Password)
   * Verifies the email and OTP code, creates a session if valid
   * 
   * @param {OtpVerifyData} data - Email, token (OTP code), and verification type
   * @returns {Promise<AuthResponse>} Success status with authenticated user and session
   */
  static async verifyOtp({ 
    email, 
    token, 
    type = 'email' 
  }: OtpVerifyData): Promise<AuthResponse> {
    try {
      // Validate inputs
      if (!email || !token) {
        return {
          success: false,
          error: 'E-posta ve kod gereklidir',
        };
      }

      if (token.length < 4 || token.length > 8) {
        return {
          success: false,
          error: 'Geçersiz kod formatı',
        };
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: token.trim(),
        type: type || 'email',
      });

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        };
      }

      // Check if session was created
      if (!data.session) {
        return {
          success: false,
          error: 'Oturum oluşturulamadı. Lütfen tekrar deneyin.',
        };
      }

      // Authentication successful
      return {
        success: true,
        user: data.user,
      };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error?.message || 'OTP doğrulanırken beklenmeyen bir hata oluştu',
      };
    }
  }

  /**
   * Delete user account and all data (GDPR compliance)
   * Note: Supabase doesn't allow users to delete their own accounts via client SDK.
   * We delete all user data and sign them out instead.
   */
  static async deleteAccount(): Promise<AuthResponse> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found',
        };
      }

      // Delete all user data from all tables
      const tables = [
        'journals', 'goals', 'habits', 'tasks', 'reminders', 
        'reflections', 'achievements', 'user_settings', 'backups'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          // Continue with other tables even if one fails
        }
      }

      // Note: supabase.auth.admin.deleteUser() requires admin privileges and cannot be called from client
      // Instead, we delete all local data and sign out the user
      // The account will remain in Supabase but all data is deleted
      
      // Delete all local data from AsyncStorage
      try {
        const userId = user.id;
        const keysToDelete = [
          `diary_entries_${userId}`,
          `@daily_dreams_${userId}`,
          `@daily_goals_${userId}`,
          `@daily_promises_${userId}`,
          `@daily_tasks_${userId}`,
          `@daily_reminders_${userId}`,
          `@daily_achievements`,
          `@daily_user_stats`,
          `@daily_habits_${userId}`,
          `@daily_wellness_${userId}`,
          `user_profile_${userId}`,
          `user_settings_${userId}`,
        ];
        
        await AsyncStorage.multiRemove(keysToDelete);
        console.log('✅ All local data deleted from AsyncStorage');
      } catch (storageError) {
        console.error('Error deleting local data:', storageError);
        // Continue even if local deletion fails
      }
      
      // Sign out the user
      await supabase.auth.signOut();

      return {
        success: true,
        user: null,
      };
    } catch (error: any) {
      console.error('Delete account error:', error);
      return {
        success: false,
        error: error?.message || 'An unexpected error occurred during account deletion',
      };
    }
  }

  /**
   * Convert Supabase error messages to user-friendly messages
   */
  private static getErrorMessage(error: string): string {
    const errorLower = error.toLowerCase();

    if (errorLower.includes('invalid login credentials')) {
      return 'Geçersiz giriş bilgileri';
    }
    if (errorLower.includes('email not confirmed')) {
      return 'E-posta adresinizi onaylamanız gerekiyor';
    }
    if (errorLower.includes('user already registered')) {
      return 'Bu e-posta adresi zaten kayıtlı';
    }
    if (errorLower.includes('password should be at least')) {
      return 'Şifre en az 6 karakter olmalıdır';
    }
    if (errorLower.includes('invalid email')) {
      return 'Geçersiz e-posta adresi';
    }
    if (errorLower.includes('too many requests')) {
      return 'Çok fazla deneme yapıldı. Lütfen biraz bekleyin';
    }
    if (errorLower.includes('user not found')) {
      return 'Kullanıcı bulunamadı';
    }
    if (errorLower.includes('invalid otp') || errorLower.includes('invalid token')) {
      return 'Geçersiz veya süresi dolmuş kod. Lütfen yeni bir kod isteyin.';
    }
    if (errorLower.includes('otp expired') || errorLower.includes('token expired')) {
      return 'Kodun süresi dolmuş. Lütfen yeni bir kod isteyin.';
    }
    if (errorLower.includes('otp') && errorLower.includes('rate limit')) {
      return 'Çok fazla kod istendi. Lütfen birkaç dakika bekleyin.';
    }

    return error;
  }
}
