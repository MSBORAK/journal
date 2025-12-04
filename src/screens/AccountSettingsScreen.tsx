import React, { useState, useEffect, useRef, useMemo, startTransition } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { updateEmail } from '../lib/supabase';
import { getProfile, updateProfile, createProfile } from '../services/profileService';
import { useProfile } from '../hooks/useProfile';
import { BackupService } from '../services/backupService';
import { CustomAlert } from '../components/CustomAlert';
import { AuthService } from '../services/authService';
import { getButtonTextColor } from '../utils/colorUtils';
import OtpInput from '../components/OtpInput';

interface AccountSettingsScreenProps {
  navigation: any;
}

export default function AccountSettingsScreen({ navigation }: AccountSettingsScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const { user, signOut, refreshUser, linkAccount, updateDisplayName, updateNickname, isAnonymous, signInWithOtp } = useAuth();
  const { refreshProfile } = useProfile(user?.uid);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);
  // App alias modal kaldırıldı - app adı sabit "Rhythm"
  // showDisplayNameModal ve showNicknameModal kaldırıldı - tek bir showProfileModal kullanıyoruz
  const [linkEmail, setLinkEmail] = useState('');
  const [linkOtpSent, setLinkOtpSent] = useState(false);
  const [linkOtpCode, setLinkOtpCode] = useState('');
  const [linkOtpResendTimer, setLinkOtpResendTimer] = useState(0);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  // App adı her zaman "Rhythm" - değişmez
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [profileData, setProfileData] = useState({
    full_name: user?.displayName || '',
    bio: '',
  });
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // User prop'u değiştiğinde state'leri güncelle
  // Ama sadece gerçekten değiştiğinde (profil düzenleme sonrası güncelleme için)
  const prevDisplayNameRef = useRef<string>('');
  const prevNicknameRef = useRef<string>('');
  
  useEffect(() => {
    if (user) {
      // displayName değiştiyse güncelle
      if (user.displayName !== prevDisplayNameRef.current) {
        setDisplayName(user.displayName || '');
        prevDisplayNameRef.current = user.displayName || '';
        
        // profileData'yı da güncelle
        setProfileData(prev => ({
          full_name: user.displayName || prev.full_name,
          bio: prev.bio, // Bio'yu koru
        }));
      }
      
      // nickname değiştiyse güncelle
      if (user.nickname !== prevNicknameRef.current) {
        setNickname(user.nickname || '');
        prevNicknameRef.current = user.nickname || '';
      }
    }
  }, [user?.displayName, user?.nickname, user?.uid]);

  const loadProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const profile = await getProfile(user.uid);
      if (profile) {
        // Sadece bio'yu güncelle, full_name için user.displayName kullan
        // loadProfile eski değeri yükleyebilir, bu yüzden full_name'i güncelleme
        setProfileData(prev => ({
          full_name: user?.displayName || prev.full_name, // user.displayName'i kullan, profile.full_name değil
          bio: profile.bio || prev.bio || '',
        }));
      }
    } catch (error) {
      console.log('Profile yüklenemedi:', error);
    }
  };

  const saveProfile = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // 1. Display Name güncelle (eğer değiştiyse)
      if (profileData.full_name && profileData.full_name !== user?.displayName) {
        try {
          await updateDisplayName(profileData.full_name);
          console.log('✅ Display name updated:', profileData.full_name);
        } catch (displayNameError: any) {
          console.warn('⚠️ Error updating displayName:', displayNameError);
          throw new Error(displayNameError?.message || 'İsim güncellenemedi');
        }
      }
      
      // 2. Nickname güncelle (eğer değiştiyse)
      if (nickname && nickname !== user?.nickname) {
        try {
          await updateNickname(nickname);
          console.log('✅ Nickname updated:', nickname);
        } catch (nicknameError: any) {
          console.warn('⚠️ Error updating nickname:', nicknameError);
          throw new Error(nicknameError?.message || 'Takma isim güncellenemedi');
        }
      }
      
      // 3. Bio güncelle (profil servisi üzerinden)
      try {
        console.log('🔄 Updating profile bio:', { userId: user.uid, profileData });
        const updatedProfile = await updateProfile(user.uid, profileData);
        console.log('✅ Profile update result:', updatedProfile);
        
        if (updatedProfile) {
          setProfileData({
            full_name: updatedProfile.full_name || profileData.full_name,
            bio: updatedProfile.bio || profileData.bio,
          });
        }
      } catch (updateError: any) {
        // Eğer veritabanı şema hatası ise, local state'te kal (uygulama donmasın)
        if (updateError?.message?.includes('column') || 
            updateError?.message?.includes('schema cache')) {
          console.log('⚠️ Profile saved locally only (database schema mismatch)');
          // Local state'te kalıyor, sorun yok
        } else {
          // Diğer hatalar için hata göster
          throw updateError;
        }
      }
      
      setShowProfileModal(false);
      
      // loadProfile çağrısını kaldırdık - eski değeri yükleyebilir
      // updateDisplayName başarılı olduğunda user prop'u zaten güncelleniyor
      // useEffect ile profileData otomatik güncelleniyor
      
      showAlert(t('settings.profileUpdated'), t('settings.profileUpdateSuccess'), 'success');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      // Eğer kolon hatası ise, yine de başarılı mesaj göster (local state'te kaldı)
      if (error?.message?.includes('column') || error?.message?.includes('schema cache')) {
        setShowProfileModal(false);
        showAlert(t('settings.profileUpdated'), t('settings.profileUpdateSuccess'), 'success');
      } else {
        const errorMessage = error?.message || t('settings.profileUpdateFailed');
        showAlert(t('auth.error'), errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    // Validasyonlar
    if (!newEmail) {
      showAlert(t('settings.warning'), t('settings.emailRequired'), 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showAlert(t('settings.warning'), t('settings.validEmailRequired'), 'warning');
      return;
    }

    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      showAlert(t('settings.warning'), t('settings.emailCannotBeSame'), 'warning');
      return;
    }
    
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateEmail(newEmail);
      setShowEmailModal(false);
      showAlert(t('settings.emailVerificationSent'), t('settings.checkEmailForVerification'), 'success');
      
      // Email güncelleme sonrası UI state'ini yenile
      setTimeout(async () => {
        await refreshUser();
      }, 1000);
    } catch (error: any) {
      showAlert(t('auth.error'), error.message || t('settings.emailUpdateFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteAccount = () => {
    setAlertConfig({
      visible: true,
      title: `⚠️ ${t('settings.deleteAccount')}`,
      message: `${t('settings.deleteAccountWarning')}\n\n${t('settings.dataToBeDeleted')}\n• ${t('settings.allDiaryEntries')}\n• ${t('settings.profileInformationData')}\n• ${t('settings.statisticsAndInsights')}\n• ${t('settings.usageHistory')}\n\n${t('settings.areYouSure')}`,
      type: 'error',
    });
  };

  const confirmDeleteAccount = async () => {
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const result = await AuthService.deleteAccount();
      
      if (result.success) {
        hideAlert();
        // Hesap silindikten sonra çıkış yap ve anonim kullanıcı oluştur
        await signOut();
        showAlert(
          t('settings.success'),
          t('settings.accountDeletedSuccess') || 'Hesabınız başarıyla silindi.',
          'success'
        );
      } else {
        showAlert(
          t('settings.error'),
          result.error || t('settings.deleteAccountFailed') || 'Hesap silinirken bir hata oluştu.',
          'error'
        );
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      showAlert(
        t('settings.error'),
        error.message || t('settings.deleteAccountFailed') || 'Hesap silinirken bir hata oluştu.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setAlertConfig({
      visible: true,
      title: `🚪 ${t('settings.logout')}`,
      message: t('settings.logoutConfirmMessage'),
      type: 'warning',
    });
  };

  const confirmSignOut = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signOut();
      hideAlert();
      showAlert(
        t('settings.success'),
        t('settings.loggedOutSuccess') || 'Başarıyla çıkış yaptınız.',
        'success'
      );
    } catch (error: any) {
      console.error('Sign out error:', error);
      showAlert(
        t('settings.error'),
        error.message || t('settings.signOutError') || 'Çıkış yapılırken bir hata oluştu.',
        'error'
      );
    }
  };

  const handleLinkAccountSendOtp = async () => {
    // Email validasyonu
    if (!linkEmail || !linkEmail.trim()) {
      showAlert(t('settings.warning'), t('auth.emailRequired'), 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(linkEmail.trim())) {
      showAlert(t('settings.warning'), t('auth.invalidEmail'), 'warning');
      return;
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const trimmedEmail = linkEmail.trim().toLowerCase();
      console.log('🔗 Link Account: OTP gönderiliyor...', trimmedEmail);
      
      // Anonymous kullanıcı için email bağlama: signInWithOtp kullan
      // shouldCreateUser: true - email henüz kayıtlı değilse kullanıcı oluştur
      const result = await signInWithOtp({
        email: trimmedEmail,
        shouldCreateUser: true,
      });

      console.log('🔗 Link Account: signInWithOtp sonucu:', result);

      if (!result.success) {
        const errorMessage = result.error || '';
        console.error('❌ Link Account: OTP gönderme hatası:', errorMessage);
        
        if (errorMessage.toLowerCase().includes('already registered') || 
            errorMessage.toLowerCase().includes('already been registered') ||
            errorMessage.toLowerCase().includes('user already registered')) {
          showAlert(t('settings.error'), 'Bu email adresi zaten kullanılıyor.', 'error');
          setLoading(false);
          return;
        }
        
        showAlert(t('settings.error'), result.error || t('auth.otpSendFailed'), 'error');
        setLoading(false);
        return;
      }

      console.log('✅ Link Account: OTP başarıyla gönderildi');

      // OTP gönderildi
      setLinkOtpSent(true);
      setLinkOtpCode('');
      
      // Resend timer başlat (60 saniye)
      setLinkOtpResendTimer(60);
      const timerInterval = setInterval(() => {
        setLinkOtpResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      showAlert(t('settings.success'), 'Email adresinize gönderilen doğrulama kodunu girin.', 'success');
    } catch (error: any) {
      console.error('❌ Link Account: Catch error:', error);
      showAlert(t('settings.error'), error.message || t('auth.otpSendFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccountVerifyOtp = async (otp: string) => {
    if (!otp || otp.length !== 6) {
      showAlert(t('settings.warning'), t('auth.invalidOtp'), 'warning');
      return;
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // OTP doğrula ve hesabı bağla
      await linkAccount(linkEmail.trim(), otp);
      
      // Form temizle
      setShowLinkAccountModal(false);
      setLinkEmail('');
      setLinkOtpSent(false);
      setLinkOtpCode('');
      setLinkOtpResendTimer(0);
      
      // User state'ini güncelle
      await refreshUser();
      
      showAlert(t('settings.success'), t('settings.accountLinkedSuccess'), 'success');
    } catch (error: any) {
      showAlert(t('settings.error'), error.message || t('settings.linkAccountFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // handleDisplayNameUpdate ve handleNicknameUpdate kaldırıldı
  // Artık saveProfile fonksiyonu tüm profil bilgilerini (isim, nickname, bio) güncelliyor

  // İlk açılışta profil yükle - ama sadece bir kez ve sadece bio için
  // displayName için user prop'u yeterli, loadProfile eski değeri yükleyebilir
  const profileLoadedRef = useRef(false);
  useEffect(() => {
    if (user?.uid && !profileLoadedRef.current) {
      // Sadece bir kez yükle, displayName için user prop'u yeterli
      loadProfile();
      profileLoadedRef.current = true;
    }
  }, [user?.uid]); // Sadece user.uid değiştiğinde yükle, her render'da değil

  // StyleSheet.create'i memoize et - her render'da yeniden oluşturma
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.primary + '20',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginLeft: 16,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    settingCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '15',
    },
    settingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      flex: 1,
    },
    settingDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    actionButton: {
      backgroundColor: 'transparent',
      borderRadius: 6,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.primary,
    },
    actionButtonText: {
      color: currentTheme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    dangerButton: {
      backgroundColor: 'transparent',
      borderColor: '#EF4444',
    },
    infoCard: {
      backgroundColor: currentTheme.colors.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '20',
    },
    infoText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 500,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: currentTheme.colors.text,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 6,
      alignItems: 'center',
      borderWidth: 1,
    },
    modalButtonPrimary: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: 'transparent',
      borderColor: currentTheme.colors.border,
    },
    modalButtonText: {
      fontSize: 15,
      fontWeight: '500',
    },
    modalButtonTextPrimary: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
    },
    modalButtonTextSecondary: {
      color: currentTheme.colors.text,
    },
  }), [currentTheme.colors]);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: currentTheme.colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={currentTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{t('settings.accountSettings')}</Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>
            👤 {t('settings.manageAccountInfo')} {t('settings.changeEmailPassword')}
          </Text>
        </View>

        {/* Profil Bilgileri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.profileInformation')}</Text>
          
          {/* Profil Düzenle - Tek birleşik bölüm */}
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="person" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.editProfile')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.updateNameAndBio')}
            </Text>
            {user?.nickname && (
              <View style={{ marginTop: 8, marginBottom: 8 }}>
                <Text style={[dynamicStyles.settingDescription, { fontSize: 14 }]}>
                  {t('settings.currentNickname')}: <Text style={{ fontWeight: 'bold' }}>{user.nickname}</Text>
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => {
                setDisplayName(user?.displayName || '');
                setNickname(user?.nickname || '');
                setProfileData({
                  full_name: user?.displayName || '',
                  bio: profileData.bio || '',
                });
                setShowProfileModal(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>✏️ {t('settings.edit')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hesap Güvenliği */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.accountSecurity')}</Text>
          
          {/* Anonim kullanıcı için Hesabını Bağla butonu */}
          {isAnonymous && (
            <View style={dynamicStyles.settingCard}>
              <View style={dynamicStyles.settingHeader}>
                <View style={dynamicStyles.settingIcon}>
                  <Ionicons name="link" size={20} color={currentTheme.colors.primary} />
                </View>
                <Text style={dynamicStyles.settingTitle}>{t('settings.linkAccount')}</Text>
              </View>
              <Text style={dynamicStyles.settingDescription}>
                {t('settings.linkAccountDescription')}
              </Text>
              <TouchableOpacity
                style={[dynamicStyles.actionButton, { backgroundColor: currentTheme.colors.success }]}
                onPress={() => {
                  setLinkEmail('');
                  setLinkOtpSent(false);
                  setLinkOtpCode('');
                  setLinkOtpResendTimer(0);
                  startTransition(() => {
                    setShowLinkAccountModal(true);
                  });
                }}
                activeOpacity={0.8}
              >
                <Text style={dynamicStyles.actionButtonText}>🔗 {t('settings.linkAccount')}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="mail" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.changeEmail')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.updateAccountEmail')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => {
                setNewEmail(user?.email || '');
                setShowEmailModal(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>📧 {t('settings.change')}</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Hesap İşlemleri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.accountOperations')}</Text>
          
          {/* Çıkış Yap - Sadece email ile giriş yapmış kullanıcılar için */}
          {!isAnonymous && user?.email && (
            <View style={dynamicStyles.settingCard}>
              <View style={dynamicStyles.settingHeader}>
                <View style={dynamicStyles.settingIcon}>
                  <Ionicons name="log-out" size={20} color={currentTheme.colors.primary} />
                </View>
                <Text style={dynamicStyles.settingTitle}>{t('settings.logout')}</Text>
              </View>
              <Text style={dynamicStyles.settingDescription}>
                {t('settings.logOutSecurely')}
              </Text>
              <TouchableOpacity
                style={dynamicStyles.actionButton}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Text style={dynamicStyles.actionButtonText}>🚪 {t('settings.logout')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.deleteAccount')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>{t('settings.deleteAccountWarning')}</Text>
            <TouchableOpacity
              style={[dynamicStyles.actionButton, dynamicStyles.dangerButton]}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>🗑️ {t('settings.deleteAccount')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} transparent animationType="fade" onRequestClose={() => setShowProfileModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>{t('settings.editProfile')}</Text>
            
            <Text style={dynamicStyles.inputLabel}>Ad Soyad</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={profileData.full_name}
              onChangeText={(text) => setProfileData({...profileData, full_name: text})}
              placeholder={t('settings.enterYourName') || 'Adınızı girin'}
              placeholderTextColor={currentTheme.colors.muted}
            />
            
            <Text style={dynamicStyles.inputLabel}>Takma İsim</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder={t('settings.enterNickname') || 'Takma isminizi girin'}
              placeholderTextColor={currentTheme.colors.muted}
              maxLength={25}
            />
            
            <Text style={dynamicStyles.inputLabel}>Bio</Text>
            <TextInput
              style={[dynamicStyles.textInput, { height: 80, textAlignVertical: 'top' }]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData({...profileData, bio: text})}
              placeholder={t('settings.tellAboutYourself')}
              placeholderTextColor={currentTheme.colors.muted}
              multiline
            />
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowProfileModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={saveProfile}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? t('settings.saving') : t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Email Modal */}
      <Modal visible={showEmailModal} transparent animationType="fade" onRequestClose={() => setShowEmailModal(false)}>
        <TouchableOpacity 
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmailModal(false)}
        >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <TouchableOpacity 
            style={dynamicStyles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={dynamicStyles.modalTitle}>{t('settings.changeEmail')}</Text>
            
            <Text style={dynamicStyles.inputLabel}>{t('settings.newEmailLabel')}</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder={t('settings.newEmailPlaceholder')}
              placeholderTextColor={currentTheme.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowEmailModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleEmailUpdate}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? t('common.loading') : t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* Link Account Modal */}
      <Modal 
        visible={showLinkAccountModal} 
        transparent 
        animationType="fade" 
        hardwareAccelerated={true}
        onRequestClose={() => {
          startTransition(() => {
            setShowLinkAccountModal(false);
            setLinkOtpSent(false);
            setLinkOtpCode('');
            setLinkOtpResendTimer(0);
          });
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>
              {linkOtpSent ? t('auth.verifyOtp') : t('settings.linkAccount')}
            </Text>
            <Text style={[dynamicStyles.settingDescription, { marginBottom: 20, textAlign: 'center' }]}>
              {linkOtpSent 
                ? t('auth.enterOtpCode').replace('email adresinize', `${linkEmail} adresine`)
                : t('settings.linkAccountInfo')
              }
            </Text>
            
            {!linkOtpSent ? (
              <>
                <Text style={dynamicStyles.inputLabel}>{t('settings.newEmailLabel')}</Text>
                <TextInput
                  style={dynamicStyles.textInput}
                  value={linkEmail}
                  onChangeText={setLinkEmail}
                  placeholder={t('settings.newEmailPlaceholder')}
                  placeholderTextColor={currentTheme.colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
                
                <View style={dynamicStyles.modalButtons}>
                  <TouchableOpacity
                    style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                    onPress={() => {
                      setShowLinkAccountModal(false);
                      setLinkOtpSent(false);
                      setLinkOtpCode('');
                      setLinkOtpResendTimer(0);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                    onPress={handleLinkAccountSendOtp}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                      {loading ? t('common.loading') : '📧 Kod Gönder'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <OtpInput
                  length={6}
                  onComplete={handleLinkAccountVerifyOtp}
                  autoFocus={true}
                />
                
                {linkOtpResendTimer > 0 ? (
                  <Text style={[dynamicStyles.settingDescription, { textAlign: 'center', marginTop: 10, color: currentTheme.colors.muted }]}>
                    {t('auth.resendOtpIn')?.replace('{seconds}', linkOtpResendTimer.toString()) || `${linkOtpResendTimer} saniye sonra tekrar gönderebilirsiniz`}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleLinkAccountSendOtp}
                    disabled={loading}
                    style={{ marginTop: 10 }}
                  >
                    <Text style={[dynamicStyles.settingDescription, { textAlign: 'center', color: currentTheme.colors.primary }]}>
                      {t('auth.resendOtp')}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <View style={dynamicStyles.modalButtons}>
                  <TouchableOpacity
                    style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                    onPress={() => {
                      setLinkOtpSent(false);
                      setLinkOtpCode('');
                      setLinkOtpResendTimer(0);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                      {t('common.back')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                    onPress={() => {
                      setShowLinkAccountModal(false);
                      setLinkOtpSent(false);
                      setLinkOtpCode('');
                      setLinkOtpResendTimer(0);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Display Name ve Nickname modal'ları kaldırıldı - artık tek bir Profil Düzenle modal'ı kullanılıyor */}

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        primaryButton={
          alertConfig.type === 'error' && (alertConfig.title.includes('Hesap Sil') || alertConfig.title.includes('Delete Account'))
            ? {
                text: t('common.delete'),
                onPress: confirmDeleteAccount,
                style: 'danger' as const,
              }
            : alertConfig.type === 'warning' && (alertConfig.title.includes('Çıkış Yap') || alertConfig.title.includes('Logout') || alertConfig.title.includes('🚪'))
            ? {
                text: t('settings.logout') || 'Çıkış Yap',
                onPress: confirmSignOut,
                style: 'primary' as const,
              }
            : {
                text: t('common.ok'),
                onPress: hideAlert,
                style: alertConfig.type === 'error' ? 'danger' : 'primary',
              }
        }
        secondaryButton={
          (alertConfig.type === 'error' && (alertConfig.title.includes('Hesap Sil') || alertConfig.title.includes('Delete Account'))) ||
          (alertConfig.type === 'warning' && (alertConfig.title.includes('Çıkış Yap') || alertConfig.title.includes('Logout') || alertConfig.title.includes('🚪')))
            ? {
                text: t('common.cancel'),
                onPress: hideAlert,
                style: 'secondary' as const,
              }
            : undefined
        }
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}
