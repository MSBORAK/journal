import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ONBOARDING_STEPS, setOnboardingCompleted, setSelectedTheme } from '../services/onboardingService';
import { soundService } from '../services/soundService';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '../components/CustomAlert';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  
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
      color: currentTheme.colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    description: {
      fontSize: 18,
      textAlign: 'center',
      color: currentTheme.colors.text,
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
    skipButton: {
      position: 'absolute',
      top: 60,
      right: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    skipButtonText: {
      color: currentTheme.colors.text,
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'Poppins_500Medium',
    },
    themeButtons: {
      flexDirection: 'row',
      gap: 20,
      marginTop: 20,
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

  const handleSkip = async () => {
    await soundService.playTap();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }
    await handleComplete();
  };

  const handleThemeSelect = async (theme: 'cozy' | 'luxury') => {
    try {
      await setSelectedTheme(theme);
      
      // Play success sound
      await soundService.playSuccess();
      setShowConfetti(true);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
      
      showAlert(
        '🎉 Harika seçim!', 
        theme === 'cozy' 
          ? 'Sıcak, huzurlu tonlar seni bekliyor.' 
          : 'Zarif ve modern bir atmosfer seni bekliyor!',
        'success'
      );
      
      // Tema seçimi sonrası onboarding'i tamamla
      setTimeout(() => {
        handleComplete();
      }, 2000); // 2 saniye bekle, alert'i göster
    } catch (error) {
      console.error('❌ Error selecting theme:', error);
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await setOnboardingCompleted(user?.uid);
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      onComplete(); // Continue anyway
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
  const currentGradient = currentStepData?.gradient as [string, string, ...string[]] || ['#FFF9F0', '#FFECD1'];

  return (
    <LinearGradient
      colors={currentGradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" />
      
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Atla</Text>
      </TouchableOpacity>

      <Animated.View 
        style={[styles.content, { opacity: fadeAnim }]}
      >
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>

        {currentStep < 2 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Devam Et →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: '#8FBC93' }]}
              onPress={() => handleThemeSelect('cozy')}
            >
              <Text style={styles.themeText}>Cozy 🌿</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: '#2D423B' }]}
              onPress={() => handleThemeSelect('luxury')}
            >
              <Text style={[styles.themeText, { color: currentTheme.colors.background }]}>Luxury ✨</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

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
          text: 'Başlayalım!',
          onPress: () => {
            hideAlert();
            setTimeout(() => {
              handleComplete();
            }, 500);
          },
          style: 'primary',
        }}
        onClose={hideAlert}
      />
    </LinearGradient>
  );
}
