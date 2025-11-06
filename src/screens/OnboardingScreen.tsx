import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
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
import { ONBOARDING_STEPS, setOnboardingCompleted, setSelectedTheme } from '../services/onboardingService';
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
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { user, updateDisplayName, refreshUser } = useAuth();
  const { currentTheme, setTheme, themes } = useTheme();
  const { t, setCurrentLanguage, currentLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);
  const [selectedTheme, setSelectedTheme] = useState<string>('cozy');
  const [userName, setUserName] = useState<string>(user?.displayName || '');
  const [userEmail, setUserEmail] = useState<string>(user?.email || '');
  // App adı her zaman "Rhythm" - değişmez
  const appAlias = 'Rhythm';
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

  // Step 2'ye geçildiğinde scroll'u en üste al
  useEffect(() => {
    if (currentStep === 2 && scrollViewRef.current) {
      // Scroll'u en üste al - birkaç kez kontrol et
      const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      };
      // Hemen scroll et
      scrollToTop();
      // Sonra tekrar kontrol et
      setTimeout(scrollToTop, 100);
      setTimeout(scrollToTop, 300);
      setTimeout(scrollToTop, 500);
    }
  }, [currentStep]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 20,
      color: '#1A1A1A', // Koyu renk - açık arka planlar için iyi kontrast
      fontFamily: 'Poppins_700Bold',
    },
    description: {
      fontSize: 18,
      textAlign: 'center',
      color: '#2D2D2D', // Koyu gri - okunabilirlik için yeterli kontrast
      marginBottom: 40,
      lineHeight: 28,
      fontFamily: 'Poppins_400Regular',
    },
    nextButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 40,
      paddingVertical: 16,
      borderRadius: 30,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 8,
    },
    nextButtonText: {
      color: currentTheme.colors.background,
      fontWeight: '600',
      fontSize: 18,
      fontFamily: 'Poppins_600SemiBold',
    },
    inputContainer: {
      width: '100%',
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1A1A1A',
      marginBottom: 8,
      fontFamily: 'Poppins_600SemiBold',
    },
    textInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 14,
      fontSize: 16,
      color: '#1A1A1A',
      borderWidth: 2,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      fontFamily: 'Poppins_400Regular',
    },
    helperText: {
      fontSize: 13,
      color: '#666',
      marginTop: 6,
      fontFamily: 'Poppins_400Regular',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
      color: '#1A1A1A',
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
      color: '#1A1A1A', // Varsayılan koyu renk - Cozy butonu için
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
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderWidth: 2,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    },
    languageBtnSelected: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.primary + '15',
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
      color: '#1A1A1A',
      marginBottom: 2,
      fontFamily: 'Poppins_600SemiBold',
    },
    languageNativeName: {
      fontSize: 13,
      color: '#666',
      fontFamily: 'Poppins_400Regular',
    },
    paginationContainer: {
      position: 'absolute',
      bottom: 60,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 6,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    paginationDotActive: {
      backgroundColor: currentTheme.colors.primary,
      width: 30,
      height: 10,
      borderRadius: 5,
    },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
  });

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      // Play sound and haptic
      await soundService.playTap();
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
      
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      await handleComplete();
    }
  };

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
    // ThemeContext'in setTheme fonksiyonunu çağır - tema hemen uygulanır
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
        // Eğer t() key'i döndürdüyse (çeviri bulunamadı), fallback kullan
        const finalTitle = (title === titleKey || !title) ? 'İsim Gerekli' : title;
        const finalMessage = (message === messageKey || !message) ? 'Lütfen isminizi girin. Bu alan zorunludur.' : message;
        showAlert('⚠️ ' + finalTitle, finalMessage, 'warning');
        return;
      }

      // Validation: Nickname zorunlu (boşsa veya "Guest" ise hata ver)
      const trimmedNickname = nickname.trim();
      if (!trimmedNickname || trimmedNickname === 'Guest' || trimmedNickname.length === 0) {
        const titleKey = 'onboarding.nicknameRequired';
        const messageKey = 'onboarding.nicknameRequiredMessage';
        const title = t(titleKey);
        const message = t(messageKey);
        // Eğer t() key'i döndürdüyse (çeviri bulunamadı), fallback kullan
        const finalTitle = (title === titleKey || !title) ? 'Takma İsim Gerekli' : title;
        const finalMessage = (message === messageKey || !message) ? 'Lütfen size nasıl hitap edilmesini istediğinizi girin. Bu alan zorunludur.' : message;
        showAlert('⚠️ ' + finalTitle, finalMessage, 'warning');
        return;
      }

      // Nickname'i kaydet (validation geçtiyse kullanıcının girdiği değeri kullan)
      const nicknameToSave = trimmedNickname;

      // İsim ve email'i kaydet (şifre olmadan)
      if (trimmedName && user?.uid) {
        try {
          await updateDisplayName(trimmedName);
          console.log('✅ Display name updated:', trimmedName);
        } catch (error) {
          console.error('❌ Error updating display name:', error);
        }
      }

      // Email'i user_metadata'ya kaydet (şifre olmadan)
      if (userEmail.trim() && user?.uid) {
        try {
          const { supabase } = await import('../lib/supabase');
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(userEmail.trim())) {
            // Email'i user_metadata'ya kaydet (email field'ı güncellemeden)
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

      // App adı her zaman "Rhythm" - değişmez
      if (user?.uid) {
        try {
          const { supabase } = await import('../lib/supabase');
          console.log('💾 Saving app_alias: Rhythm (fixed)');
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

      // Nickname'i kaydet (nickname) - artık zorunlu, validation yukarıda yapıldı
      if (user?.uid) {
        try {
          const { supabase } = await import('../lib/supabase');
          // Nickname zorunlu, validation yukarıda yapıldı - nicknameToSave yukarıda tanımlandı
          console.log('💾 Saving nickname:', nicknameToSave, '(original:', nickname, ')');
          const { error: nicknameError } = await supabase.auth.updateUser({
            data: { 
              nickname: nicknameToSave,
            }
          });
          if (nicknameError) {
            console.error('❌ Error saving nickname to metadata:', nicknameError);
          } else {
            console.log('✅ Nickname saved to user_metadata:', nicknameToSave);
          }
        } catch (error) {
          console.error('❌ Error saving nickname:', error);
        }
      }

      // Tema ve dili kaydet - ThemeContext'in setTheme'ini kullan
      await setTheme(selectedTheme as 'cozy' | 'luxury');
      await setSelectedTheme(selectedTheme as 'cozy' | 'luxury'); // AsyncStorage'a da kaydet
      await setCurrentLanguage(selectedLanguage, user?.uid);
      
      // Onboarding'i tamamlandı olarak işaretle - user.uid varsa kullan, yoksa genel key kullan
      if (user?.uid) {
        await setOnboardingCompleted(user.uid);
        console.log('✅ Onboarding completed for user:', user.uid);
      } else {
        // User henüz yoksa genel key kullan (anonim kullanıcı oluşturulana kadar)
        await setOnboardingCompleted();
        console.log('✅ Onboarding completed for anonymous user');
      }
      
      // AsyncStorage'a yazılması için yeterli delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // User state'ini refresh et
      if (user?.uid) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('❌ Error refreshing user:', error);
        }
      }
      
      // Play success sound
      await soundService.playSuccess();
      setShowConfetti(true);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
      
      // Localized mesajlar kullan
      showAlert(
        `🎉 ${t('onboarding.greatChoice')}`, 
        selectedTheme === 'cozy' 
          ? t('onboarding.cozyThemeMessage')
          : t('onboarding.luxuryThemeMessage'),
        'success'
      );
      
      // Tercihler seçimi sonrası onboarding'i tamamla - alert gösterildikten sonra
      setTimeout(() => {
        handleComplete();
      }, 1500); // 1.5 saniye bekle, alert'i göster
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      // handlePreferencesComplete zaten setOnboardingCompleted'i çağırdı ve delay bekledi
      // Ek bir delay eklemeden direkt onComplete'i çağır
      // onComplete callback'ini çağır - bu App.tsx'teki handleOnboardingComplete'i tetikler
      onComplete();
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      // Hata olsa bile onboarding'i tamamla ve devam et
      onComplete();
    }
  };

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {ONBOARDING_STEPS.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentStep && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  const currentStepData = ONBOARDING_STEPS[currentStep];
  // Tema seçimine göre gradient'i değiştir
  let currentGradient: [string, string, ...string[]] = currentStepData?.gradient as [string, string, ...string[]] || ['#FFF9F0', '#FFECD1'];
  
  // Eğer step 2'deyse (preferences) ve tema seçilmişse, tema gradient'ini kullan
  if (currentStep === 2) {
    if (selectedTheme === 'luxury') {
      // Luxury tema için gradient (koyu gri/siyah tonları - luxury tema background rengine uygun)
      currentGradient = ['#1A1A1A', '#2D2D2D', '#3A3A3A'];
    } else if (selectedTheme === 'cozy') {
      // Cozy tema için gradient (açık yeşil tonları)
      currentGradient = ['#8FBC93', '#A8C9AB', '#C9B297'];
    }
  }

  return (
    <LinearGradient
      colors={currentGradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar 
        barStyle={selectedTheme === 'luxury' && currentStep === 2 ? "light-content" : "dark-content"} 
        translucent={true} 
        backgroundColor="transparent" 
      />

      {currentStep < 2 ? (
        <Animated.View 
          style={[styles.content, { opacity: fadeAnim }]}
        >
          <Text style={[
            styles.title,
            selectedTheme === 'luxury' && currentStep === 2 && { color: '#FFFFFF' }
          ]}>
            {currentStep === 0 ? t('onboarding.welcome') + ' 🌞' :
             currentStep === 1 ? t('onboarding.routineTitle') + ' 🌿' :
             currentStep === 2 ? t('onboarding.themeTitle') + ' 💫' :
             currentStepData.title}
          </Text>
          <Text style={[
            styles.description,
            selectedTheme === 'luxury' && currentStep === 2 && { color: '#CCCCCC' }
          ]}>
            {currentStep === 0 ? t('onboarding.welcomeDescription') + ' 💫' :
             currentStep === 1 ? t('onboarding.routineDescription') + ' ✨' :
             currentStep === 2 ? t('onboarding.themeDescription') :
             currentStepData.description}
          </Text>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{t('onboarding.continue')}</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
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
                  paddingTop: 20,
                  paddingHorizontal: 20
                }}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                bounces={true}
                nestedScrollEnabled={true}
                scrollEnabled={true}
              >
            {/* İsim ve Email Girişi */}
            <View style={{ marginTop: 20, marginBottom: 30 }}>
              <Text style={[
                styles.sectionTitle, 
                { textAlign: 'center' },
                selectedTheme === 'luxury' && { color: '#FFFFFF' }
              ]}>{t('onboarding.yourInfo')}</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={[
                styles.inputLabel,
                selectedTheme === 'luxury' && { color: '#FFFFFF' }
              ]}>{t('onboarding.yourName')} *</Text>
              <TextInput
                style={styles.textInput}
                value={userName}
                onChangeText={(text) => {
                  setUserName(text);
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: false });
                  }
                }}
                placeholder={t('onboarding.enterYourName')}
                placeholderTextColor="#999"
                autoCapitalize="words"
                maxLength={50}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[
                styles.inputLabel,
                selectedTheme === 'luxury' && { color: '#FFFFFF' }
              ]}>{t('onboarding.yourEmail')}</Text>
              <TextInput
                style={styles.textInput}
                value={userEmail}
                onChangeText={setUserEmail}
                placeholder={t('onboarding.enterYourEmail')}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[
                styles.inputLabel,
                selectedTheme === 'luxury' && { color: '#FFFFFF' }
              ]}>{t('onboarding.howShouldWeAddressYouNickname')} *</Text>
              <TextInput
                style={styles.textInput}
                value={nickname}
                onChangeText={(text) => {
                  setNickname(text);
                  if (validationErrors.nickname) {
                    setValidationErrors({ ...validationErrors, nickname: false });
                  }
                }}
                placeholder={t('onboarding.enterNickname') || 'Luna, Melis, Friend...'}
                placeholderTextColor="#999"
                autoCapitalize="words"
                maxLength={25}
              />
              <Text style={[
                styles.helperText,
                selectedTheme === 'luxury' && { color: '#CCCCCC' }
              ]}>{t('onboarding.nicknameHint')}</Text>
              {nickname.trim().length > 0 && (
                <Text style={[styles.helperText, { 
                  marginTop: 8, 
                  color: selectedTheme === 'luxury' ? '#FFFFFF' : currentTheme.colors.primary, 
                  fontWeight: '600',
                  textShadowColor: selectedTheme === 'luxury' ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
                  textShadowOffset: selectedTheme === 'luxury' ? { width: 0, height: 1 } : { width: 0, height: 0 },
                  textShadowRadius: selectedTheme === 'luxury' ? 2 : 0,
                }]}>
                  {replaceNickname(t('onboarding.niceToMeetYou'), nickname.trim())}
                </Text>
              )}
            </View>

            {/* Tema Seçimi */}
            <Text style={[
              styles.sectionTitle,
              selectedTheme === 'luxury' && { color: '#FFFFFF' }
            ]}>{t('onboarding.selectTheme')}</Text>
            <View style={styles.themeButtons}>
              <TouchableOpacity
                style={[
                  styles.themeBtn, 
                  { 
                    backgroundColor: '#8FBC93',
                    borderWidth: selectedTheme === 'cozy' ? 3 : 0,
                    borderColor: currentTheme.colors.primary,
                  }
                ]}
                onPress={() => handleThemeSelect('cozy')}
              >
                <Text style={[styles.themeText, { color: '#1A1A1A' }]}>Cozy 🌿</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeBtn, 
                  { 
                    backgroundColor: '#2D423B',
                    borderWidth: selectedTheme === 'luxury' ? 3 : 0,
                    borderColor: currentTheme.colors.primary,
                  }
                ]}
                onPress={() => handleThemeSelect('luxury')}
              >
                <Text style={[styles.themeText, { color: '#FFFFFF' }]}>Luxury ✨</Text>
              </TouchableOpacity>
            </View>

            {/* Dil Seçimi */}
            <Text style={[
              styles.sectionTitle,
              selectedTheme === 'luxury' && { color: '#FFFFFF' }
            ]}>{t('onboarding.selectLanguage')}</Text>
            <View style={styles.languageButtons}>
              {supportedLanguages.map((language: Language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageBtn,
                    selectedLanguage === language.code && styles.languageBtnSelected,
                  ]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageName}>{language.name}</Text>
                    <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                  </View>
                  {selectedLanguage === language.code && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={currentTheme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Tamamla Butonu */}
            <View style={{ marginTop: 30, marginBottom: 30 }}>
              <TouchableOpacity style={styles.nextButton} onPress={handlePreferencesComplete}>
                <Text style={styles.nextButtonText}>{t('onboarding.letsStart')}</Text>
              </TouchableOpacity>
            </View>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}

      {renderPaginationDots()}

      {showConfetti && (
        <View style={styles.confettiContainer}>
          {/* Basit konfeti animasyonu */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
            }}
          />
        </View>
      )}

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
            // Eğer validation hatası varsa (warning), dashboard'a geçme
            if (alertConfig.type !== 'warning') {
              setTimeout(() => {
                handleComplete();
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
