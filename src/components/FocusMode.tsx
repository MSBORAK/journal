import React, { useState, useEffect, useRef, useMemo, memo, startTransition } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  InteractionManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTimerControl, useTimerValue } from '../contexts/TimerContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as Haptics from 'expo-haptics';
import { soundService } from '../services/soundService';
import { CustomAlert } from './CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FocusModeProps {
  visible: boolean;
  onClose: () => void;
  selectedTaskTitle?: string;
}

// CRITICAL FIX: Isolate timer display to prevent full component re-renders
// Timer display component subscribes directly to value context, so only it re-renders every second
const TimerDisplay = memo(({ 
  scaleAnim, 
  isActive, 
  isPaused,
  currentTheme,
  t 
}: {
  scaleAnim: Animated.Value;
  isActive: boolean;
  isPaused: boolean;
  currentTheme: any;
  t: (key: string) => string;
}) => {
  // CRITICAL: Subscribe to value context INSIDE this component
  // This way only TimerDisplay re-renders every second, not the entire FocusMode
  const { timeLeft, progressAnim } = useTimerValue();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dynamicStyles = useMemo(() => StyleSheet.create({
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
  }), [currentTheme]);

  return (
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
  );
});

// CRITICAL FIX: Memoize FocusMode to prevent unnecessary re-renders
// Timer display is isolated, so FocusMode only re-renders when control values change
const FocusMode = memo(function FocusMode({ visible, onClose, selectedTaskTitle }: FocusModeProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  
  // CRITICAL FIX: Split context subscription
  // Control context: Stable values (rarely changes) - prevents unnecessary re-renders
  // Value context (timeLeft, progressAnim) is subscribed inside TimerDisplay component only
  const {
    isActive,
    isPaused,
    selectedDuration,
    scaleAnim,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
  } = useTimerControl();
  
  // States
  const [showReflection, setShowReflection] = useState(false);
  const [focusSubject, setFocusSubject] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [customDurations, setCustomDurations] = useState<number[]>([]);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState('');

  // Seçili görev varsa focusSubject'i otomatik set et
  // CRITICAL FIX: Use startTransition to prevent blocking when modal opens
  useEffect(() => {
    if (selectedTaskTitle && visible) {
      startTransition(() => {
        setFocusSubject(selectedTaskTitle);
        console.log('✅ Seçili görev FocusMode\'e geçirildi:', selectedTaskTitle);
      });
    } else if (!visible) {
      // Modal kapandığında temizle - use startTransition to prevent blocking
      startTransition(() => {
        setFocusSubject('');
        setSelectedMood('');
        setShowReflection(false);
        setShowConfetti(false);
      });
    }
  }, [selectedTaskTitle, visible]);

  // CRITICAL FIX: Don't reset timer when modal closes - let user control it
  // Timer will continue running in background and can be controlled via floating button
  // This prevents screen freeze when closing Focus Mode
  
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

  // Load custom durations from AsyncStorage
  // CRITICAL FIX: Only load when modal is visible to prevent blocking on mount
  useEffect(() => {
    if (!visible) return;
    
    const loadCustomDurations = async () => {
      try {
        const stored = await AsyncStorage.getItem('custom_focus_durations');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Use startTransition to prevent blocking
          startTransition(() => {
            setCustomDurations(parsed);
          });
        }
      } catch (error) {
        console.error('Error loading custom durations:', error);
      }
    };
    loadCustomDurations();
  }, [visible]);

  // Save custom durations to AsyncStorage
  const saveCustomDurations = async (durations: number[]) => {
    try {
      await AsyncStorage.setItem('custom_focus_durations', JSON.stringify(durations));
      setCustomDurations(durations);
    } catch (error) {
      console.error('Error saving custom durations:', error);
    }
  };

  // Duration options - default + custom
  const defaultDurations = [
    { label: `15 ${t('focus.minuteAbbr')}`, value: 15 },
    { label: `25 ${t('focus.minuteAbbr')}`, value: 25 },
    { label: `45 ${t('focus.minuteAbbr')}`, value: 45 },
  ];
  
  const customDurationOptions = customDurations.map((duration) => ({
    label: `${duration} ${t('focus.minuteAbbr')}`,
    value: duration,
    isCustom: true,
  }));
  
  const durations = [...defaultDurations, ...customDurationOptions];

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

  // Handle add custom duration
  const handleAddCustomDuration = async () => {
    const minutes = parseInt(customDurationInput);
    if (isNaN(minutes) || minutes <= 0 || minutes > 999) {
      setAlertConfig({
        visible: true,
        title: t('focus.invalidDuration') || 'Geçersiz Süre',
        message: t('focus.invalidDurationMessage') || 'Lütfen 1-999 arası bir sayı girin.',
        type: 'error',
        primaryButton: {
          text: t('common.ok') || 'OK',
          onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
          style: 'primary',
        },
        secondaryButton: undefined,
      });
      return;
    }
    
    if (customDurations.includes(minutes)) {
      setAlertConfig({
        visible: true,
        title: t('focus.duplicateDuration') || 'Zaten Mevcut',
        message: t('focus.duplicateDurationMessage') || 'Bu süre zaten eklenmiş.',
        type: 'warning',
        primaryButton: {
          text: t('common.ok') || 'OK',
          onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
          style: 'primary',
        },
        secondaryButton: undefined,
      });
      return;
    }
    
    // Check if it's already in default durations
    if (defaultDurations.some(d => d.value === minutes)) {
      setAlertConfig({
        visible: true,
        title: t('focus.duplicateDuration') || 'Zaten Mevcut',
        message: t('focus.duplicateDurationMessage') || 'Bu süre zaten mevcut.',
        type: 'warning',
        primaryButton: {
          text: t('common.ok') || 'OK',
          onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
          style: 'primary',
        },
        secondaryButton: undefined,
      });
      return;
    }
    
    const newCustomDurations = [...customDurations, minutes].sort((a, b) => a - b);
    await saveCustomDurations(newCustomDurations);
    setCustomDurationInput('');
    setShowAddCustomModal(false);
    setDuration(minutes); // Yeni eklenen süreyi seç
    
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Handle delete custom duration
  const handleDeleteCustomDuration = async (duration: number) => {
    const newCustomDurations = customDurations.filter(d => d !== duration);
    await saveCustomDurations(newCustomDurations);
    
    // Eğer silinen süre seçiliyse, varsayılan bir süre seç
    if (selectedDuration === duration) {
      setDuration(25); // Varsayılan 25 dakika
    }
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    // Reset timer after reflection is submitted
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
  // CRITICAL FIX: Don't reset timer on close - just close the modal
  // Timer will continue running and can be controlled via floating button
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
            // CRITICAL FIX: Batch state updates - React 18 auto-batches, but be explicit
            setAlertConfig(prev => ({ ...prev, visible: false }));
            // Just pause timer, don't reset - prevents freeze
            pauseTimer();
            // Close modal immediately - no setTimeout needed, React batches updates
            onClose();
          },
          style: 'danger',
        },
        secondaryButton: {
          text: t('focus.continue'),
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })),
          style: 'secondary',
        },
      });
    } else {
      // Just close modal, don't reset timer
      onClose();
    }
  };

  // CRITICAL FIX: Memoize StyleSheet.create to prevent recreation on every render
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
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
    addCustomButton: {
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
      borderStyle: 'dashed',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteCustomButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 10,
      padding: 2,
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
    
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
    },
    modalCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: currentTheme.colors.text,
      fontFamily: 'Poppins_700Bold',
    },
    modalCloseButton: {
      padding: 4,
    },
    modalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 12,
      fontFamily: 'Poppins_600SemiBold',
    },
    modalInput: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      padding: 16,
      fontSize: 18,
      color: currentTheme.colors.text,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      fontFamily: 'Poppins_400Regular',
      marginBottom: 24,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
    },
    modalButtonPrimary: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: currentTheme.colors.background,
      borderColor: currentTheme.colors.border,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins_600SemiBold',
    },
    modalButtonTextPrimary: {
      color: currentTheme.colors.background,
    },
    modalButtonTextSecondary: {
      color: currentTheme.colors.text,
    },
  }), [currentTheme]);

  // CRITICAL FIX: Don't render Modal at all when not visible to prevent performance issues
  // React Native Modals can cause performance problems when rendered but hidden
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
      hardwareAccelerated={true}
    >
      <SafeAreaView style={dynamicStyles.container}>
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

              {/* Seçili Görev Bilgisi */}
              {focusSubject && !isActive && (
                <View style={{
                  backgroundColor: currentTheme.colors.primary + '20',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  borderWidth: 2,
                  borderColor: currentTheme.colors.primary + '40',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <Text style={{ fontSize: 24 }}>🎯</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 12,
                      color: currentTheme.colors.secondary,
                      marginBottom: 4,
                      fontWeight: '600',
                    }}>
                      {t('focus.selectedTask') || 'Seçili Görev'}
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: currentTheme.colors.text,
                      fontWeight: '700',
                    }}>
                      {focusSubject}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setFocusSubject('')}
                    style={{
                      padding: 8,
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color={currentTheme.colors.secondary} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Odaklanma Konusu Input (Seçili görev yoksa) */}
              {!focusSubject && !isActive && (
                <View style={{ marginBottom: 20, width: '100%' }}>
                  <Text style={{
                    fontSize: 14,
                    color: currentTheme.colors.secondary,
                    marginBottom: 8,
                    textAlign: 'center',
                    fontWeight: '600',
                  }}>
                    {t('focus.whatAreYouFocusingOn') || 'Neye odaklanacaksın?'}
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: currentTheme.colors.card,
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: currentTheme.colors.text,
                      borderWidth: 1,
                      borderColor: currentTheme.colors.border,
                      textAlign: 'center',
                    }}
                    placeholder={t('focus.focusPlaceholder') || 'Örn: Proje X üzerinde çalışmak'}
                    placeholderTextColor={currentTheme.colors.muted}
                    value={focusSubject}
                    onChangeText={setFocusSubject}
                  />
                </View>
              )}

              {/* Duration Selector */}
              <View style={dynamicStyles.durationSelector}>
                {durations.map((duration) => (
                  <View key={duration.value} style={{ position: 'relative' }}>
                    <TouchableOpacity
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
                    {/* Özel süre silme butonu */}
                    {(duration as any).isCustom && !isActive && (
                      <TouchableOpacity
                        style={dynamicStyles.deleteCustomButton}
                        onPress={() => handleDeleteCustomDuration(duration.value)}
                      >
                        <Ionicons name="close-circle" size={18} color={currentTheme.colors.danger} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {/* Özel Süre Ekle Butonu */}
                {!isActive && (
                  <TouchableOpacity
                    style={[
                      dynamicStyles.durationButton,
                      dynamicStyles.addCustomButton,
                    ]}
                    onPress={() => {
                      setShowAddCustomModal(true);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Ionicons name="add" size={20} color={currentTheme.colors.primary} />
                    <Text style={[dynamicStyles.durationText, { color: currentTheme.colors.primary, marginLeft: 4 }]}>
                      {t('focus.addCustom') || 'Özel'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Timer Display - Isolated component to prevent full re-renders */}
              {/* TimerDisplay subscribes to value context internally, so only it re-renders every second */}
              <TimerDisplay
                scaleAnim={scaleAnim}
                isActive={isActive}
                isPaused={isPaused}
                currentTheme={currentTheme}
                t={t}
              />

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

        {/* Özel Süre Ekleme Modalı */}
        <Modal
          visible={showAddCustomModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAddCustomModal(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={dynamicStyles.modalContent}
            >
              <View style={dynamicStyles.modalCard}>
                <View style={dynamicStyles.modalHeader}>
                  <Text style={dynamicStyles.modalTitle}>
                    {t('focus.addCustomDuration') || 'Özel Süre Ekle'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddCustomModal(false);
                      setCustomDurationInput('');
                    }}
                    style={dynamicStyles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color={currentTheme.colors.text} />
                  </TouchableOpacity>
                </View>
                
                <Text style={dynamicStyles.modalLabel}>
                  {t('focus.durationInMinutes') || 'Süre (dakika)'}
                </Text>
                <TextInput
                  style={dynamicStyles.modalInput}
                  placeholder={t('focus.enterDuration') || 'Örn: 30'}
                  placeholderTextColor={currentTheme.colors.muted}
                  value={customDurationInput}
                  onChangeText={setCustomDurationInput}
                  keyboardType="number-pad"
                  autoFocus={true}
                />
                
                <View style={dynamicStyles.modalButtons}>
                  <TouchableOpacity
                    style={[dynamicStyles.modalButton, dynamicStyles.modalButtonSecondary]}
                    onPress={() => {
                      setShowAddCustomModal(false);
                      setCustomDurationInput('');
                    }}
                  >
                    <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextSecondary]}>
                      {t('common.cancel') || 'İptal'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[dynamicStyles.modalButton, dynamicStyles.modalButtonPrimary]}
                    onPress={handleAddCustomDuration}
                  >
                    <Text style={[dynamicStyles.modalButtonText, dynamicStyles.modalButtonTextPrimary]}>
                      {t('common.add') || 'Ekle'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
});

export default FocusMode;
