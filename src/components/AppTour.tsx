import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { TourStep } from '../services/tourService';
import { soundService } from '../services/soundService';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AppTourProps {
  visible: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export default function AppTour({
  visible,
  currentStep,
  totalSteps,
  step,
  onNext,
  onSkip,
  onComplete,
}: AppTourProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNext = async () => {
    await soundService.playTap();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }

    if (currentStep < totalSteps - 1) {
      onNext();
    } else {
      await soundService.playSuccess();
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
      onComplete();
    }
  };

  const handleSkip = async () => {
    await soundService.playTap();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }
    onSkip();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tourCard: {
      width: screenWidth * 0.9,
      maxWidth: 400,
      borderRadius: 24,
      padding: 24,
      backgroundColor: currentTheme.colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    stepIndicator: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
      fontFamily: 'Poppins_600SemiBold',
    },
    skipButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    skipButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: currentTheme.colors.secondary,
      fontFamily: 'Poppins_500Medium',
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 12,
      fontFamily: 'Poppins_700Bold',
    },
    description: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      lineHeight: 24,
      marginBottom: 24,
      fontFamily: 'Poppins_400Regular',
    },
    progressBar: {
      height: 4,
      backgroundColor: currentTheme.colors.background + '40',
      borderRadius: 2,
      marginBottom: 24,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 2,
      width: `${((currentStep + 1) / totalSteps) * 100}%`,
    },
    buttons: {
      flexDirection: 'row',
      gap: 12,
    },
    nextButton: {
      flex: 1,
      backgroundColor: currentTheme.colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    nextButtonText: {
      color: currentTheme.colors.background,
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
      fontFamily: 'Poppins_600SemiBold',
    },
    skipButtonMain: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 16,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: currentTheme.colors.secondary + '40',
    },
    skipButtonTextMain: {
      color: currentTheme.colors.secondary,
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins_600SemiBold',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
      presentationStyle="overFullScreen"
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.7)" />
      
      <View style={styles.overlay}>
        <TouchableOpacity 
          activeOpacity={1}
          style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
          onPress={handleSkip}
        >
          <Animated.View
            style={[
              styles.tourCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
          <View style={styles.header}>
            <Text style={styles.stepIndicator}>
              {`${currentStep + 1}/${totalSteps}`}
            </Text>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>{t('tour.skip')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <View style={styles.buttons}>
            {currentStep < totalSteps - 1 && (
              <TouchableOpacity style={styles.skipButtonMain} onPress={handleSkip}>
                <Text style={styles.skipButtonTextMain}>{t('tour.skip')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentStep < totalSteps - 1 ? t('tour.next') : t('tour.complete')}
              </Text>
              <Ionicons
                name={currentStep < totalSteps - 1 ? 'arrow-forward' : 'checkmark'}
                size={20}
                color={currentTheme.colors.background}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

