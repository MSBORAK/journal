import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTimer } from '../contexts/TimerContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as Haptics from 'expo-haptics';
import { soundService } from '../services/soundService';
import { CustomAlert } from './CustomAlert';

interface FocusModeProps {
  visible: boolean;
  onClose: () => void;
}

export default function FocusMode({ visible, onClose }: FocusModeProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const {
    isActive,
    isPaused,
    timeLeft,
    selectedDuration,
    progressAnim,
    scaleAnim,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
  } = useTimer();
  
  // States
  const [showReflection, setShowReflection] = useState(false);
  const [focusSubject, setFocusSubject] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    primaryButton: undefined as any,
    secondaryButton: undefined as any,
  });

  // Get gradient colors based on theme
  const getGradientColors = (): [string, string] => {
    if (currentTheme.name === 'cozy' || currentTheme.name === 'softMinimal') {
      return ['#EDE3DE', '#C6AA96'];
    } else if (currentTheme.name === 'luxury') {
      return ['#1A1A1A', '#2D2D2D'];
    } else if (currentTheme.name === 'dark') {
      return ['#1A1A1A', '#2D2D2D'];
    } else {
      return [currentTheme.colors.background, currentTheme.colors.card];
    }
  };

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Duration options
  const durations = [
    { label: `15 ${t('focus.minuteAbbr')}`, value: 15 },
    { label: `25 ${t('focus.minuteAbbr')}`, value: 25 },
    { label: `45 ${t('focus.minuteAbbr')}`, value: 45 },
  ];

  // Mood options
  const moods = [
    { emoji: '😊', label: t('focus.moods.happy') },
    { emoji: '😌', label: t('focus.moods.calm') },
    { emoji: '💪', label: t('focus.moods.strong') },
    { emoji: '🎯', label: t('focus.moods.focused') },
    { emoji: '✨', label: t('focus.moods.energetic') },
    { emoji: '🧘', label: t('focus.moods.peaceful') },
  ];

  // Handle duration change
  const handleDurationChange = (duration: number) => {
    setDuration(duration);
  };

  // Handle completion
  const handleComplete = async () => {
    setShowConfetti(true);
    await soundService.playSuccess();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setTimeout(() => {
      setShowConfetti(false);
      setShowReflection(true);
    }, 3000);
  };

  // Handle reflection submit
  const handleReflectionSubmit = async () => {
    await soundService.playTap();
    setShowReflection(false);
    setFocusSubject('');
    setSelectedMood('');
    resetTimer();
    
    setAlertConfig({
      visible: true,
      title: t('focus.completedTitle'),
      message: t('focus.sessionComplete'),
      type: 'success',
      primaryButton: {
        text: t('common.ok') || 'OK',
        onPress: () => {
          setAlertConfig({ ...alertConfig, visible: false });
          onClose();
        },
        style: 'primary',
      },
      secondaryButton: undefined,
    });
  };

  // Handle close with confirmation
  const handleClose = () => {
    if (isActive && !isPaused) {
      setAlertConfig({
        visible: true,
        title: t('focus.quitTitle'),
        message: t('focus.quitMessage'),
        type: 'warning',
        primaryButton: {
          text: t('focus.quit'),
          onPress: () => {
            setAlertConfig({ ...alertConfig, visible: false });
            resetTimer();
            setTimeout(() => {
              onClose();
            }, 100);
          },
          style: 'danger',
        },
        secondaryButton: {
          text: t('focus.continue'),
          onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
          style: 'secondary',
        },
      });
    } else {
      resetTimer();
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      padding: 10,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
    },
    content: {
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 16,
      fontFamily: 'Poppins_700Bold',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '400',
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginBottom: 40,
      fontFamily: 'Poppins_400Regular',
      lineHeight: 22,
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    durationSelector: {
      flexDirection: 'row',
      marginBottom: 40,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 25,
      padding: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    durationButton: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      marginHorizontal: 4,
    },
    durationButtonActive: {
      backgroundColor: currentTheme.colors.primary,
    },
    durationText: {
      color: currentTheme.colors.secondary,
      fontSize: 16,
      fontFamily: 'Poppins_600SemiBold',
    },
    durationTextActive: {
      color: currentTheme.colors.background,
    },
    timerContainer: {
      width: 250,
      height: 250,
      marginBottom: 40,
    },
    timerCircle: {
      width: '100%',
      height: '100%',
      borderRadius: 125,
      backgroundColor: currentTheme.colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: currentTheme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    progressCircle: {
      position: 'absolute',
      width: 250,
      height: 250,
      borderRadius: 125,
      borderWidth: 3,
      borderColor: currentTheme.colors.primary,
      borderStyle: 'solid',
      transform: [{ rotate: '-90deg' }],
    },
    timeText: {
      fontSize: 48,
      fontWeight: '700',
      color: currentTheme.colors.text,
      fontFamily: 'Poppins_700Bold',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 3,
    },
    statusText: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      marginTop: 8,
      fontFamily: 'Poppins_400Regular',
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    controls: {
      flexDirection: 'row',
      gap: 16,
    },
    controlButton: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 30,
      backgroundColor: currentTheme.colors.card,
      minWidth: 120,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    primaryButton: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
      fontFamily: 'Poppins_600SemiBold',
    },
    primaryButtonText: {
      color: currentTheme.colors.background,
    },
    
    // Reflection styles
    reflectionContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 24,
      margin: 20,
      width: '90%',
      maxWidth: 400,
    },
    reflectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 24,
      fontFamily: 'Poppins_700Bold',
    },
    reflectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 12,
      fontFamily: 'Poppins_600SemiBold',
    },
    reflectionInput: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: currentTheme.colors.text,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      fontFamily: 'Poppins_400Regular',
      minHeight: 80,
      textAlignVertical: 'top',
    },
    moodContainer: {
      marginBottom: 24,
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'center',
    },
    moodButton: {
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.background,
      borderWidth: 2,
      borderColor: 'transparent',
      minWidth: 80,
    },
    moodButtonActive: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.primary + '20',
    },
    moodEmoji: {
      fontSize: 32,
      marginBottom: 4,
    },
    moodLabel: {
      fontSize: 12,
      color: currentTheme.colors.text,
      fontFamily: 'Poppins_400Regular',
    },
    submitButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    submitButtonText: {
      color: currentTheme.colors.background,
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins_600SemiBold',
    },
    
    // Confetti
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
    },
  });

  return (
      <View style={dynamicStyles.container}>
        <LinearGradient
          colors={getGradientColors()}
          style={dynamicStyles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={dynamicStyles.closeButton}
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color={currentTheme.colors.text} />
          </TouchableOpacity>

          {!showReflection ? (
            <View style={dynamicStyles.content}>
              <Text style={dynamicStyles.title}>{t('focus.screenTitle')}</Text>
              <Text style={dynamicStyles.subtitle}>
                {t('focus.subtitle')}
              </Text>

              {/* Duration Selector */}
              <View style={dynamicStyles.durationSelector}>
                {durations.map((duration) => (
                  <TouchableOpacity
                    key={duration.value}
                    style={[
                      dynamicStyles.durationButton,
                      selectedDuration === duration.value && dynamicStyles.durationButtonActive,
                    ]}
                    onPress={() => handleDurationChange(duration.value)}
                    disabled={isActive}
                  >
                    <Text
                      style={[
                        dynamicStyles.durationText,
                        selectedDuration === duration.value && dynamicStyles.durationTextActive,
                      ]}
                    >
                      {duration.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Timer Display */}
              <Animated.View
                style={[
                  dynamicStyles.timerContainer,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <View style={dynamicStyles.timerCircle}>
                  <Animated.View
                    style={[
                      dynamicStyles.progressCircle,
                      {
                        borderRightColor: 'transparent',
                        borderBottomColor: 'transparent',
                        borderLeftColor: progressAnim.interpolate({
                          inputRange: [0, 50, 100],
                          outputRange: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.8)', 'transparent'],
                        }),
                        borderTopColor: progressAnim.interpolate({
                          inputRange: [0, 50, 100],
                          outputRange: ['rgba(255,255,255,0.8)', 'transparent', 'transparent'],
                        }),
                      },
                    ]}
                  />
                  <Text style={dynamicStyles.timeText}>{formatTime(timeLeft)}</Text>
                  {isActive && (
                    <Text style={dynamicStyles.statusText}>
                      {isPaused ? t('focus.paused') : t('focus.focusing')}
                    </Text>
                  )}
                </View>
              </Animated.View>

              {/* Controls */}
              <View style={dynamicStyles.controls}>
                {!isActive ? (
                  <TouchableOpacity
                    style={[dynamicStyles.controlButton, dynamicStyles.primaryButton]}
                    onPress={startTimer}
                  >
                    <Text style={[dynamicStyles.buttonText, dynamicStyles.primaryButtonText]}>
                      {t('focus.start')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[dynamicStyles.controlButton, dynamicStyles.primaryButton]}
                      onPress={isPaused ? startTimer : pauseTimer}
                    >
                      <Text style={[dynamicStyles.buttonText, dynamicStyles.primaryButtonText]}>
                        {isPaused ? t('focus.resume') : t('focus.pause')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={dynamicStyles.controlButton}
                      onPress={resetTimer}
                    >
                      <Text style={dynamicStyles.buttonText}>{t('focus.reset')}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ) : (
            <View style={dynamicStyles.reflectionContainer}>
              <Text style={dynamicStyles.reflectionTitle}>{t('focus.completedTitle')}</Text>

              <Text style={dynamicStyles.reflectionLabel}>{t('focus.completedQuestion')}</Text>
              <TextInput
                style={dynamicStyles.reflectionInput}
                placeholder={t('focus.completedPlaceholder')}
                placeholderTextColor={currentTheme.colors.muted}
                value={focusSubject}
                onChangeText={setFocusSubject}
                multiline
              />

              <View style={dynamicStyles.moodContainer}>
                <Text style={dynamicStyles.reflectionLabel}>{t('focus.howDoYouFeel')}</Text>
                <View style={dynamicStyles.moodGrid}>
                  {moods.map((mood) => (
                    <TouchableOpacity
                      key={mood.label}
                      style={[
                        dynamicStyles.moodButton,
                        selectedMood === mood.label && dynamicStyles.moodButtonActive,
                      ]}
                      onPress={() => setSelectedMood(mood.label)}
                    >
                      <Text style={dynamicStyles.moodEmoji}>{mood.emoji}</Text>
                      <Text style={dynamicStyles.moodLabel}>{mood.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={dynamicStyles.submitButton}
                onPress={handleReflectionSubmit}
              >
                <Text style={dynamicStyles.submitButtonText}>{t('focus.complete')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        {/* Confetti */}
        {showConfetti && (
          <View style={dynamicStyles.confettiContainer}>
            {/* Confetti animation placeholder - Lottie dosyası eklenince aktif edilecek */}
            <Text style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: [{ translateX: -50 }, { translateY: -50 }],
              fontSize: 72,
            }}>
              🎉
            </Text>
          </View>
        )}

        {/* Custom Alert */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          primaryButton={alertConfig.primaryButton}
          secondaryButton={alertConfig.secondaryButton}
        />
      </View>
  );
}
