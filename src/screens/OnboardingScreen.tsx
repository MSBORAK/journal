import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { setOnboardingCompleted, setSelectedTheme } from '../services/onboardingService';
import { supportedLanguages, Language } from '../services/languageService';
import { soundService } from '../services/soundService';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '../components/CustomAlert';
import { replaceNickname } from '../utils/textUtils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { user, updateDisplayName } = useAuth();
  const { currentTheme, setTheme, themes } = useTheme();
  const { t, setCurrentLanguage, currentLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);
  const [selectedTheme, setSelectedTheme] = useState<string>('cozy');
  const [userName, setUserName] = useState<string>(user?.displayName || '');
  const [userEmail, setUserEmail] = useState<string>(user?.email || '');
  const [nickname, setNickname] = useState<string>(user?.nickname || '');
  const [validationErrors, setValidationErrors] = useState<{name?: boolean; nickname?: boolean}>({});
  
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
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Tema seçimine göre gradient ve renkler
  const getThemeGradient = (theme: string): [string, string, ...string[]] => {
    if (theme === 'luxury') {
      return ['#1A1A1A', '#2D2D2D', '#3A3A3A'];
    } else {
      return ['#8FBC93', '#A8C9AB', '#C9B297'];
    }
  };

  const getTextColor = (theme: string): string => {
    return theme === 'luxury' ? '#FFFFFF' : '#1A1A1A';
  };

  const getSecondaryTextColor = (theme: string): string => {
    return theme === 'luxury' ? '#CCCCCC' : '#2D2D2D';
  };

  const getInputBackground = (theme: string): string => {
    return theme === 'luxury' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)';
  };

  const getInputBorder = (theme: string): string => {
    return theme === 'luxury' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';
  };

  const getButtonBackground = (theme: string, isSelected: boolean): string => {
    if (theme === 'luxury') {
      return isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)';
    } else {
      return isSelected ? '#8FBC93' : 'rgba(255, 255, 255, 0.9)';
    }
  };

  const getButtonTextColor = (theme: string, isSelected: boolean): string => {
    if (theme === 'luxury') {
      return isSelected ? '#1A1A1A' : '#FFFFFF';
    } else {
      return isSelected ? '#FFFFFF' : '#1A1A1A';
    }
  };

  // Step 2'ye geçildiğinde scroll'u en üste al
  useEffect(() => {
    if (scrollViewRef.current) {
      const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      };
      scrollToTop();
      setTimeout(scrollToTop, 100);
      setTimeout(scrollToTop, 300);
    }
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    await setCurrentLanguage(languageCode, user?.uid);
    await soundService.playTap();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }
  };

  const handleThemeSelect = async (theme: 'cozy' | 'luxury') => {
    setSelectedTheme(theme);
    await setTheme(theme);
    await soundService.playTap();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }
  };

  const handlePreferencesComplete = async () => {
    try {
      // Validation: İsim zorunlu
      const trimmedName = userName.trim();
      if (!trimmedName || trimmedName === 'Guest' || trimmedName.length === 0) {
        const titleKey = 'onboarding.nameRequired';
        const messageKey = 'onboarding.nameRequiredMessage';
        const title = t(titleKey);
        const message = t(messageKey);
        const finalTitle = (title === titleKey || !title) ? 'İsim Gerekli' : title;
        const finalMessage = (message === messageKey || !message) ? 'Lütfen isminizi girin. Bu alan zorunludur.' : message;
        showAlert('⚠️ ' + finalTitle, finalMessage, 'warning');
        return;
      }

      // Validation: Nickname zorunlu
      const trimmedNickname = nickname.trim();
      if (!trimmedNickname || trimmedNickname === 'Guest' || trimmedNickname.length === 0) {
        const titleKey = 'onboarding.nicknameRequired';
        const messageKey = 'onboarding.nicknameRequiredMessage';
        const title = t(titleKey);
        const message = t(messageKey);
        const finalTitle = (title === titleKey || !title) ? 'Takma İsim Gerekli' : title;
        const finalMessage = (message === messageKey || !message) ? 'Lütfen size nasıl hitap edilmesini istediğinizi girin. Bu alan zorunludur.' : message;
        showAlert('⚠️ ' + finalTitle, finalMessage, 'warning');
        return;
      }

      // İsim ve email'i kaydet
      if (trimmedName && user?.uid) {
        try {
          await updateDisplayName(trimmedName);
          console.log('✅ Display name updated:', trimmedName);
        } catch (error) {
          console.error('❌ Error updating display name:', error);
        }
      }

      // Email'i user_metadata'ya kaydet
      if (userEmail.trim() && user?.uid) {
        try {
          const { supabase } = await import('../lib/supabase');
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(userEmail.trim())) {
            const { error: updateError } = await supabase.auth.updateUser({
              data: { 
                email_for_display: userEmail.trim().toLowerCase(),
                ...(trimmedName && { full_name: trimmedName }),
              }
            });
            if (updateError) {
              console.error('❌ Error saving email to metadata:', updateError);
            } else {
              console.log('✅ Email saved to user_metadata:', userEmail.trim());
            }
          }
        } catch (error) {
          console.error('❌ Error saving email:', error);
        }
      }

      // App adı her zaman "Rhythm"
      if (user?.uid) {
        try {
          const { supabase } = await import('../lib/supabase');
          const { error: aliasError } = await supabase.auth.updateUser({
            data: { 
              app_alias: 'Rhythm',
            }
          });
          if (aliasError) {
            console.error('❌ Error saving app_alias to metadata:', aliasError);
          } else {
            console.log('✅ App alias saved to user_metadata: Rhythm');
          }
        } catch (error) {
          console.error('❌ Error saving app_alias:', error);
        }
      }

      // Nickname'i kaydet
      if (user?.uid) {
        try {
          const { supabase } = await import('../lib/supabase');
          const { error: nicknameError } = await supabase.auth.updateUser({
            data: { 
              nickname: trimmedNickname,
            }
          });
          if (nicknameError) {
            console.error('❌ Error saving nickname to metadata:', nicknameError);
          } else {
            console.log('✅ Nickname saved to user_metadata:', trimmedNickname);
          }
        } catch (error) {
          console.error('❌ Error saving nickname:', error);
        }
      }

      // Tema ve dili kaydet
      await setTheme(selectedTheme as 'cozy' | 'luxury');
      await setSelectedTheme(selectedTheme as 'cozy' | 'luxury');
      await setCurrentLanguage(selectedLanguage, user?.uid);
      
      // Onboarding'i tamamlandı olarak işaretle
      console.log('💾 [OnboardingScreen] Saving onboarding completed');
      await setOnboardingCompleted();
      
      console.log('✅ [OnboardingScreen] Onboarding completed, calling onComplete()');
      onComplete();
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      onComplete();
    }
  };

  const currentGradient = getThemeGradient(selectedTheme);
  const textColor = getTextColor(selectedTheme);
  const secondaryTextColor = getSecondaryTextColor(selectedTheme);
  const inputBackground = getInputBackground(selectedTheme);
  const inputBorder = getInputBorder(selectedTheme);

  return (
    <LinearGradient
      colors={currentGradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar 
        barStyle={selectedTheme === 'luxury' ? "light-content" : "dark-content"} 
        translucent={true} 
        backgroundColor="transparent" 
      />

      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, width: '100%' }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Animated.View 
            style={[{ opacity: fadeAnim, flex: 1, width: '100%' }]}
          >
            <ScrollView 
              ref={scrollViewRef}
              style={{ flex: 1 }}
              contentContainerStyle={{ 
                flexGrow: 1,
                paddingBottom: 120,
                paddingTop: 40,
                paddingHorizontal: 20
              }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
              {/* Başlık */}
              <View style={{ marginBottom: 30, alignItems: 'center' }}>
                <Text style={[styles.title, { color: textColor }]}>
                  {t('onboarding.letsGetAcquainted') || 'Hadi Tanışalım! 🌟'}
                </Text>
                <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
                  {t('onboarding.setupYourProfile') || 'Profilini oluştur, temanı seç ve yolculuğuna başla'}
                </Text>
              </View>

              {/* İsim ve Email Girişi */}
              {/* Section title kaldırıldı - başlık zaten var */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  {t('onboarding.yourName') || 'İsmin ne?'} *
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: inputBackground,
                    borderColor: inputBorder,
                    color: textColor,
                  }]}
                  value={userName}
                  onChangeText={(text) => {
                    setUserName(text);
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: false });
                    }
                  }}
                  placeholder={t('onboarding.enterYourName') || 'İsmini yaz'}
                  placeholderTextColor={selectedTheme === 'luxury' ? '#999' : '#999'}
                  autoCapitalize="words"
                  maxLength={50}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  {t('onboarding.yourEmail') || 'Email (Opsiyonel)'}
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: inputBackground,
                    borderColor: inputBorder,
                    color: textColor,
                  }]}
                  value={userEmail}
                  onChangeText={setUserEmail}
                  placeholder={t('onboarding.enterYourEmail') || 'E-posta adresini yaz (isteğe bağlı)'}
                  placeholderTextColor={selectedTheme === 'luxury' ? '#999' : '#999'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>
                  {t('onboarding.howShouldWeAddressYouNickname') || 'Sana nasıl hitap edelim?'} *
                </Text>
                <TextInput
                  style={[styles.textInput, {
                    backgroundColor: inputBackground,
                    borderColor: inputBorder,
                    color: textColor,
                  }]}
                  value={nickname}
                  onChangeText={(text) => {
                    setNickname(text);
                    if (validationErrors.nickname) {
                      setValidationErrors({ ...validationErrors, nickname: false });
                    }
                  }}
                  placeholder={t('onboarding.enterNickname') || 'Melis, Arkadaş, Hayalperest, Kaptan...'}
                  placeholderTextColor={selectedTheme === 'luxury' ? '#999' : '#999'}
                  autoCapitalize="words"
                  maxLength={25}
                />
                <Text style={[styles.helperText, { color: secondaryTextColor }]}>
                  {t('onboarding.nicknameHint') || 'Bu isimle sana hitap edeceğiz'}
                </Text>
                {nickname.trim().length > 0 && (
                  <Text style={[styles.helperText, { 
                    marginTop: 8, 
                    color: selectedTheme === 'luxury' ? '#FFFFFF' : currentTheme.colors.primary, 
                    fontWeight: '600',
                  }]}>
                    {replaceNickname(t('onboarding.niceToMeetYou') || 'Merhaba {nickname}!', nickname.trim())}
                  </Text>
                )}
              </View>

              {/* Tema Seçimi */}
              <Text style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}>
                {t('onboarding.selectTheme') || 'Temanı Seç'}
              </Text>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeBtn, 
                    { 
                      backgroundColor: getButtonBackground(selectedTheme, selectedTheme === 'cozy'),
                      borderWidth: selectedTheme === 'cozy' ? 3 : 0,
                      borderColor: selectedTheme === 'luxury' ? '#FFFFFF' : '#8FBC93',
                    }
                  ]}
                  onPress={() => handleThemeSelect('cozy')}
                >
                  <Text style={[styles.themeText, { 
                    color: getButtonTextColor(selectedTheme, selectedTheme === 'cozy') 
                  }]}>
                    Cozy 🌿
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.themeBtn, 
                    { 
                      backgroundColor: getButtonBackground(selectedTheme, selectedTheme === 'luxury'),
                      borderWidth: selectedTheme === 'luxury' ? 3 : 0,
                      borderColor: selectedTheme === 'luxury' ? '#FFFFFF' : '#2D423B',
                    }
                  ]}
                  onPress={() => handleThemeSelect('luxury')}
                >
                  <Text style={[styles.themeText, { 
                    color: getButtonTextColor(selectedTheme, selectedTheme === 'luxury') 
                  }]}>
                    Luxury ✨
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Dil Seçimi */}
              <Text style={[styles.sectionTitle, { color: textColor, marginTop: 20 }]}>
                {t('onboarding.selectLanguage') || 'Dilini Seç'}
              </Text>
              <View style={styles.languageButtons}>
                {supportedLanguages.map((language: Language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageBtn,
                      {
                        backgroundColor: inputBackground,
                        borderColor: selectedLanguage === language.code 
                          ? (selectedTheme === 'luxury' ? '#FFFFFF' : currentTheme.colors.primary)
                          : inputBorder,
                        borderWidth: selectedLanguage === language.code ? 2 : 1,
                      },
                      selectedLanguage === language.code && {
                        backgroundColor: selectedTheme === 'luxury' 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : currentTheme.colors.primary + '15',
                      }
                    ]}
                    onPress={() => handleLanguageSelect(language.code)}
                  >
                    <Text style={styles.languageFlag}>{language.flag}</Text>
                    <View style={styles.languageInfo}>
                      <Text style={[styles.languageName, { color: textColor }]}>
                        {language.name}
                      </Text>
                      <Text style={[styles.languageNativeName, { color: secondaryTextColor }]}>
                        {language.nativeName}
                      </Text>
                    </View>
                    {selectedLanguage === language.code && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={selectedTheme === 'luxury' ? '#FFFFFF' : currentTheme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tamamla Butonu */}
              <View style={{ marginTop: 30, marginBottom: 30 }}>
                <TouchableOpacity 
                  style={[styles.nextButton, {
                    backgroundColor: selectedTheme === 'luxury' ? '#FFFFFF' : currentTheme.colors.primary,
                  }]} 
                  onPress={handlePreferencesComplete}
                >
                  <Text style={[styles.nextButtonText, {
                    color: selectedTheme === 'luxury' ? '#1A1A1A' : currentTheme.colors.background,
                  }]}>
                    {t('onboarding.letsStart') || 'Başlayalım! 🚀'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        primaryButton={{
          text: alertConfig.type === 'warning' ? (t('common.ok') || 'Tamam') : t('onboarding.letsStart'),
          onPress: () => {
            hideAlert();
            if (alertConfig.type !== 'warning') {
              setTimeout(() => {
                onComplete();
              }, 500);
            }
          },
          style: alertConfig.type === 'warning' ? 'primary' : 'primary',
        }}
        onClose={hideAlert}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
  textInput: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    fontFamily: 'Poppins_400Regular',
  },
  helperText: {
    fontSize: 13,
    marginTop: 6,
    fontFamily: 'Poppins_400Regular',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
    justifyContent: 'center',
  },
  themeBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  themeText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  languageButtons: {
    gap: 12,
    marginBottom: 20,
  },
  languageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Poppins_600SemiBold',
  },
  languageNativeName: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },
  nextButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontWeight: '600',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
});

