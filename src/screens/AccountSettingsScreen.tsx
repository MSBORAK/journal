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
import { BackupService } from '../services/backupService';
import { CustomAlert } from '../components/CustomAlert';

interface AccountSettingsScreenProps {
  navigation: any;
}

export default function AccountSettingsScreen({ navigation }: AccountSettingsScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const { user, signOut, refreshUser } = useAuth();
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
      await updateProfile(user.uid, profileData);
      setShowProfileModal(false);
      showAlert('✅ Başarılı', 'Profil bilgileriniz güncellendi!', 'success');
    } catch (error) {
      showAlert('❌ Hata', 'Profil güncellenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    // Validasyonlar
    if (!newEmail) {
      showAlert('⚠️ Uyarı', 'Email adresi giriniz!', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      showAlert('⚠️ Uyarı', 'Geçerli bir email adresi giriniz!', 'warning');
      return;
    }

    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      showAlert('⚠️ Uyarı', 'Yeni email adresi mevcut email adresinizle aynı olamaz!', 'warning');
      return;
    }
    
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await updateEmail(newEmail);
      setShowEmailModal(false);
      showAlert('✅ E-posta doğrulama gönderildi', 'Yeni e-posta adresinize doğrulama maili gönderildi. Lütfen email kutunuzu kontrol edin ve linke tıklayarak onaylayın.', 'success');
      
      // Email güncelleme sonrası UI state'ini yenile
      setTimeout(async () => {
        await refreshUser();
      }, 1000);
    } catch (error: any) {
      showAlert('❌ Hata', error.message || 'Email güncellenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    // Validasyonlar
    if (!oldPassword) {
      showAlert('⚠️ Uyarı', 'Mevcut şifrenizi giriniz!', 'warning');
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      showAlert('⚠️ Uyarı', 'Yeni şifre en az 6 karakter olmalıdır!', 'warning');
      return;
    }
    
    if (newPassword.length > 128) {
      showAlert('⚠️ Uyarı', 'Şifre çok uzun. Maksimum 128 karakter olabilir!', 'warning');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showAlert('⚠️ Uyarı', 'Yeni şifreler eşleşmiyor!', 'warning');
      return;
    }

    // Eski ve yeni şifre aynıysa uyarı ver
    if (oldPassword === newPassword) {
      showAlert('⚠️ Uyarı', 'Yeni şifre mevcut şifrenizle aynı olamaz!', 'warning');
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
      
      showAlert('✅ Başarılı', 'Şifreniz başarıyla güncellendi!', 'success');
    } catch (error: any) {
      showAlert('❌ Hata', error.message || 'Şifre güncellenirken hata oluştu.', 'error');
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
      t('welcome') === 'Welcome' ? '🚪 Logout' : '🚪 Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      'warning'
    );
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
        <Text style={dynamicStyles.headerTitle}>{t('welcome') === 'Welcome' ? 'Account Settings' : 'Hesap Ayarları'}</Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>
            👤 {t('welcome') === 'Welcome' ? 'Manage your account information from here. Update your profile information,' : 'Hesap bilgilerinizi buradan yönetebilirsiniz. Profil bilgilerinizi güncelleyin,'} 
            {t('welcome') === 'Welcome' ? 'change email and password or delete your account.' : 'email ve şifre değiştinte veya hesabınızı silin.'}
          </Text>
        </View>

        {/* Profil Bilgileri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('welcome') === 'Welcome' ? 'Profile Information' : 'Profil Bilgileri'}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="person" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('welcome') === 'Welcome' ? 'Edit Profile' : 'Profil Düzenle'}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('welcome') === 'Welcome' ? 'Update your name and bio information.' : 'Adınızı ve bio bilginizi güncelleyin.'}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => setShowProfileModal(true)}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>✏️ {t('welcome') === 'Welcome' ? 'Edit' : 'Düzenle'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hesap Güvenliği */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('welcome') === 'Welcome' ? 'Account Security' : 'Hesap Güvenliği'}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="mail" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('welcome') === 'Welcome' ? 'Change Email' : 'Email Değiştir'}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('welcome') === 'Welcome' ? 'Change your account email address. A verification email will be sent to your new email address.' : 'Hesap email adresinizi değiştirin. Yeni email adresinize doğrulama maili gönderilecek.'}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => {
                setNewEmail(user?.email || '');
                setShowEmailModal(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>📧 {t('welcome') === 'Welcome' ? 'Change' : 'Değiştir'}</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="key" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('welcome') === 'Welcome' ? 'Change Password' : 'Şifre Değiştir'}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('welcome') === 'Welcome' ? 'Update your account password. Choose a secure password.' : 'Hesap şifrenizi güncelleyin. Güvenli bir şifre seçin.'}
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
              <Text style={dynamicStyles.actionButtonText}>🔑 {t('welcome') === 'Welcome' ? 'Change' : 'Değiştir'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hesap İşlemleri */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>{t('welcome') === 'Welcome' ? 'Account Operations' : 'Hesap İşlemleri'}</Text>
          
          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="log-out" size={20} color={currentTheme.colors.primary} />
              </View>
              <Text style={dynamicStyles.settingTitle}>{t('welcome') === 'Welcome' ? 'Logout' : 'Çıkış Yap'}</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              {t('welcome') === 'Welcome' ? 'Log out securely from your account.' : 'Hesabınızdan güvenli bir şekilde çıkış yapın.'}
            </Text>
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>🚪 Çıkış Yap</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.settingCard}>
            <View style={dynamicStyles.settingHeader}>
              <View style={dynamicStyles.settingIcon}>
                <Ionicons name="trash" size={20} color="#EF4444" />
              </View>
              <Text style={dynamicStyles.settingTitle}>Hesabı Sil</Text>
            </View>
            <Text style={dynamicStyles.settingDescription}>
              Hesabınızı ve tüm verilerinizi kalıcı olarak silin. Bu işlem geri alınamaz!
            </Text>
            <TouchableOpacity
              style={[dynamicStyles.actionButton, dynamicStyles.dangerButton]}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.actionButtonText}>🗑️ Hesabı Sil</Text>
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
              placeholder="Adınızı girin"
              placeholderTextColor={currentTheme.colors.muted}
            />
            
            <Text style={dynamicStyles.inputLabel}>Bio</Text>
            <TextInput
              style={[dynamicStyles.textInput, { height: 80, textAlignVertical: 'top' }]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData({...profileData, bio: text})}
              placeholder="Kendinizden bahsedin..."
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
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={saveProfile}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
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
            <Text style={dynamicStyles.modalTitle}>Email Değiştir</Text>
            
            <Text style={dynamicStyles.inputLabel}>Yeni Email</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="yeni@email.com"
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
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handleEmailUpdate}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
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
            <Text style={dynamicStyles.modalTitle}>Şifre Değiştir</Text>
            
            <Text style={dynamicStyles.inputLabel}>Mevcut Şifre</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Mevcut şifrenizi girin"
              placeholderTextColor={currentTheme.colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <Text style={dynamicStyles.inputLabel}>Yeni Şifre</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Yeni şifrenizi girin (min. 6 karakter)"
              placeholderTextColor={currentTheme.colors.muted}
              secureTextEntry
              autoCapitalize="none"
            />
            
            <Text style={dynamicStyles.inputLabel}>Yeni Şifre Tekrar</Text>
            <TextInput
              style={dynamicStyles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Yeni şifrenizi tekrar girin"
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
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                onPress={handlePasswordUpdate}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
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
          text: 'Tamam',
          onPress: hideAlert,
          style: alertConfig.type === 'error' ? 'danger' : 'primary',
        }}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}
