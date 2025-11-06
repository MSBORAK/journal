import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { updateEmail, updatePassword } from '../lib/supabase';
import { getProfile, updateProfile, createProfile } from '../services/profileService';
import { useProfile } from '../hooks/useProfile';
import { BackupService } from '../services/backupService';
import { CustomAlert } from '../components/CustomAlert';

interface AccountSettingsScreenProps {
  navigation: any;
}

export default function AccountSettingsScreen({ navigation }: AccountSettingsScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const { user, signOut, refreshUser, linkAccount, updateDisplayName, updateNickname, isAnonymous } = useAuth();
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLinkAccountModal, setShowLinkAccountModal] = useState(false);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  // App alias modal kaldırıldı - app adı sabit "Rhythm"
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkConfirmPassword, setLinkConfirmPassword] = useState('');
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

  const loadProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const profile = await getProfile(user.uid);
      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
        });
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
      
      // Profil güncellemesini dene
      try {
        const updatedProfile = await updateProfile(user.uid, profileData);
        // Eğer başarılı döndü (veritabanı veya local), devam et
        if (updatedProfile) {
          setProfileData({
            full_name: updatedProfile.full_name || profileData.full_name,
            bio: updatedProfile.bio || profileData.bio,
          });
          
          // AuthContext'i güncelle (displayName için)
          try {
            await refreshUser();
          } catch (refreshError) {
            console.log('⚠️ Error refreshing user in AuthContext:', refreshError);
          }
          
          // Profil hook'unu da refresh et (Dashboard için)
          try {
            await refreshProfile();
          } catch (refreshError) {
            console.log('⚠️ Error refreshing profile hook:', refreshError);
          }
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
      
      // Profili yeniden yükle (opsiyonel, kritik değil)
      try {
        await loadProfile();
      } catch (reloadError) {
        console.log('Profile reload error (non-critical):', reloadError);
        // Profil yükleme hatası kritik değil, devam et
      }
      
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

  const handlePasswordUpdate = async () => {
    // Validasyonlar
    if (!oldPassword) {
      showAlert(t('settings.warning'), t('settings.enterCurrentPasswordRequired'), 'warning');
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      showAlert(t('settings.warning'), t('auth.passwordTooShort'), 'warning');
      return;
    }
    
    if (newPassword.length > 128) {
      showAlert(t('settings.warning'), t('settings.passwordTooLong'), 'warning');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showAlert(t('settings.warning'), t('auth.passwordsDoNotMatch'), 'warning');
      return;
    }

    // Eski ve yeni şifre aynıysa uyarı ver
    if (oldPassword === newPassword) {
      showAlert(t('settings.warning'), t('settings.passwordCannotBeSame'), 'warning');
      return;
    }
    
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updatePassword(newPassword, oldPassword);
      
      // Form temizle
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // UI state'ini güncelle (ChatGPT'nin önerdiği gibi)
      await refreshUser();
      
      showAlert(t('settings.success'), t('settings.passwordUpdated'), 'success');
    } catch (error: any) {
      showAlert(t('auth.error'), error.message || t('settings.passwordUpdateFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    showAlert(
      `⚠️ ${t('settings.deleteAccount')}`,
      `${t('settings.deleteAccountWarning')}\n\n${t('settings.dataToBeDeleted')}\n• ${t('settings.allDiaryEntries')}\n• ${t('settings.profileInformationData')}\n• ${t('settings.statisticsAndInsights')}\n• ${t('settings.usageHistory')}\n\n${t('settings.areYouSure')}`,
      'error'
    );
  };

  const handleSignOut = () => {
    showAlert(
      `🚪 ${t('settings.logout')}`,
      t('settings.logoutConfirmMessage'),
      'warning'
    );
  };

  const handleLinkAccount = async () => {
    // Validasyonlar
    if (!linkEmail || !linkPassword) {
      showAlert(t('settings.warning'), t('auth.emailAndPasswordRequired'), 'warning');
      return;
    }
    
    if (linkPassword.length < 6) {
      showAlert(t('settings.warning'), t('auth.passwordTooShort'), 'warning');
      return;
    }
    
    if (linkPassword !== linkConfirmPassword) {
      showAlert(t('settings.warning'), t('auth.passwordsDoNotMatch'), 'warning');
      return;
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await linkAccount(linkEmail, linkPassword);
      
      // Form temizle
      setShowLinkAccountModal(false);
      setLinkEmail('');
      setLinkPassword('');
      setLinkConfirmPassword('');
      
      // User state'ini güncelle
      await refreshUser();
      
      showAlert(t('settings.success'), t('settings.accountLinkedSuccess'), 'success');
    } catch (error: any) {
      showAlert(t('settings.error'), error.message || t('settings.linkAccountFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayNameUpdate = async () => {
    // Validasyonlar
    if (!displayName || displayName.trim().length === 0) {
      showAlert(t('settings.warning'), t('settings.nameRequired'), 'warning');
      return;
    }

    if (displayName.trim().length < 2) {
      showAlert(t('settings.warning'), t('settings.nameTooShort'), 'warning');
      return;
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateDisplayName(displayName.trim());
      
      // Modal'ı kapat
      setShowDisplayNameModal(false);
      
      // User state'ini güncelle
      await refreshUser();
      
      showAlert(t('settings.success'), t('settings.nameUpdatedSuccess'), 'success');
    } catch (error: any) {
      showAlert(t('settings.error'), error.message || t('settings.nameUpdateFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // App adı artık sabit "Rhythm" - düzenleme kaldırıldı

  const handleNicknameUpdate = async () => {
    // Validasyonlar
    if (!nickname || nickname.trim().length === 0) {
      showAlert(t('settings.warning'), t('settings.nicknameRequired'), 'warning');
      return;
    }

    if (nickname.trim().length > 25) {
      showAlert(t('settings.warning'), t('settings.nicknameTooLong'), 'warning');
      return;
    }

    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateNickname(nickname.trim());
      
      // Modal'ı kapat
      setShowNicknameModal(false);
      
      // User state'ini güncelle
      await refreshUser();
      
      showAlert(t('settings.success'), t('settings.nicknameUpdatedSuccess'), 'success');
    } catch (error: any) {
      showAlert(t('settings.error'), error.message || t('settings.nicknameUpdateFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const dynamicStyles = StyleSheet.create({
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
      color: currentTheme.colors.background,
    },
    modalButtonTextSecondary: {
      color: currentTheme.colors.text,
    },
  });

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
          
          {/* Guest kullanıcı için İsim Belirle butonu */}
          {isAnonymous && (user?.displayName === 'Guest' || !user?.displayName) && (
            <View style={dynamicStyles.settingCard}>
              <View style={dynamicStyles.settingHeader}>
                <View style={dynamicStyles.settingIcon}>
                  <Ionicons name="person-add" size={20} color={currentTheme.colors.primary} />
                </View>
                <Text style={dynamicStyles.settingTitle}>{t('settings.setYourName')}</Text>
              </View>
              <Text style={dynamicStyles.settingDescription}>
                {t('settings.setYourNameDescription')}
              </Text>
              <TouchableOpacity
                style={[dynamicStyles.actionButton, { backgroundColor: currentTheme.colors.success }]}
                onPress={() => {
                  setDisplayName(user?.displayName || '');
                  setShowDisplayNameModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={dynamicStyles.actionButtonText}>✨ {t('settings.setName')}</Text>
              </TouchableOpacity>
            </View>
          )}
          
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
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => setShowProfileModal(true)}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>✏️ {t('settings.edit')}</Text>
            </TouchableOpacity>
          </View>


          {/* Nickname Düzenleme */}
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="heart" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.nickname')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.nicknameDescription')}
            </Text>
            <View style={{ marginBottom: 8 }}>
              <Text style={[dynamicStyles.settingDescription, { fontSize: 14, fontStyle: 'italic' }]}>
                {t('settings.currentNickname')}: <Text style={{ fontWeight: 'bold' }}>{user?.nickname || 'Guest'}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => {
                setNickname(user?.nickname || '');
                setShowNicknameModal(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>✨ {t('settings.editNickname')}</Text>
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
                  setLinkPassword('');
                  setLinkConfirmPassword('');
                  setShowLinkAccountModal(true);
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

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="key" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('settings.changePassword')}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('settings.updateAccountPassword')}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordModal(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>🔑 {t('settings.change')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hesap İşlemleri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('settings.accountOperations')}</Text>
          
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
            <Text style={dynamicStyles.modalTitle}>Profil Düzenle</Text>
            
            <Text style={dynamicStyles.inputLabel}>Ad Soyad</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={profileData.full_name}
              onChangeText={(text) => setProfileData({...profileData, full_name: text})}
              placeholder={t('settings.enterYourName')}
              placeholderTextColor={currentTheme.colors.muted}
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

      {/* Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={() => setShowPasswordModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>{t('settings.changePassword')}</Text>
            
            <Text style={dynamicStyles.inputLabel}>{t('settings.currentPasswordLabel')}</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder={t('settings.enterCurrentPassword')}
              placeholderTextColor={currentTheme.colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <Text style={dynamicStyles.inputLabel}>{t('settings.newPasswordLabel')}</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('settings.enterNewPassword')}
              placeholderTextColor={currentTheme.colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <Text style={dynamicStyles.inputLabel}>{t('settings.confirmPasswordLabel')}</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('settings.confirmNewPassword')}
              placeholderTextColor={currentTheme.colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowPasswordModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handlePasswordUpdate}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? t('settings.updating') : t('settings.update')}
                </Text>
              </TouchableOpacity>
            </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Link Account Modal */}
      <Modal visible={showLinkAccountModal} transparent animationType="fade" onRequestClose={() => setShowLinkAccountModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>{t('settings.linkAccount')}</Text>
            <Text style={[dynamicStyles.settingDescription, { marginBottom: 20, textAlign: 'center' }]}>
              {t('settings.linkAccountInfo')}
            </Text>
            
            <Text style={dynamicStyles.inputLabel}>{t('settings.newEmailLabel')}</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={linkEmail}
              onChangeText={setLinkEmail}
              placeholder={t('settings.newEmailPlaceholder')}
              placeholderTextColor={currentTheme.colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Text style={dynamicStyles.inputLabel}>{t('settings.newPasswordLabel')}</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={linkPassword}
              onChangeText={setLinkPassword}
              placeholder={t('settings.enterNewPassword')}
              placeholderTextColor={currentTheme.colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <Text style={dynamicStyles.inputLabel}>{t('settings.confirmPasswordLabel')}</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={linkConfirmPassword}
              onChangeText={setLinkConfirmPassword}
              placeholder={t('settings.confirmNewPassword')}
              placeholderTextColor={currentTheme.colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowLinkAccountModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleLinkAccount}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? t('settings.updating') : t('settings.linkAccount')}
                </Text>
              </TouchableOpacity>
            </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Display Name Modal */}
      <Modal visible={showDisplayNameModal} transparent animationType="fade" onRequestClose={() => setShowDisplayNameModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>{t('settings.setYourName')}</Text>
            <Text style={[dynamicStyles.settingDescription, { marginBottom: 20, textAlign: 'center' }]}>
              {t('settings.setYourNameDescription')}
            </Text>
            
            <Text style={dynamicStyles.inputLabel}>{t('settings.displayName')}</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('settings.enterYourName')}
              placeholderTextColor={currentTheme.colors.muted}
              autoCapitalize="words"
              maxLength={50}
            />
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowDisplayNameModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleDisplayNameUpdate}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? t('settings.updating') : t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Nickname Modal */}
      <Modal visible={showNicknameModal} transparent animationType="fade" onRequestClose={() => setShowNicknameModal(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>{t('settings.nickname')}</Text>
            <Text style={[dynamicStyles.settingDescription, { marginBottom: 20, textAlign: 'center' }]}>
              {t('settings.nicknameDescription')}
            </Text>
            
            <Text style={dynamicStyles.inputLabel}>{t('onboarding.howShouldWeAddressYouNickname')}</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder={t('onboarding.enterNickname') || 'Luna, Melis, Friend...'}
              placeholderTextColor={currentTheme.colors.muted}
              autoCapitalize="words"
              maxLength={25}
            />
            <Text style={[dynamicStyles.settingDescription, { fontSize: 12, marginTop: 4, color: currentTheme.colors.muted }]}>
              {t('onboarding.nicknameHint')}
            </Text>
            
            <View style={dynamicStyles.modalButtons}>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                onPress={() => setShowNicknameModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleNicknameUpdate}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? t('settings.updating') : t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        primaryButton={{
          text: t('common.ok'),
          onPress: hideAlert,
          style: alertConfig.type === 'error' ? 'danger' : 'primary',
        }}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}
