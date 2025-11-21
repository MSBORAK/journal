import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getButtonTextColor } from '../utils/colorUtils';
import { useMindfulnessRoutines } from '../hooks/useMindfulnessRoutines';

interface MindfulnessScreenProps {
  navigation: any;
}

export default function MindfulnessScreen({ navigation }: MindfulnessScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const { morningRoutines, eveningRoutines, toggleRoutine } = useMindfulnessRoutines(user?.uid);
  
  const [activeTab, setActiveTab] = useState<'morning' | 'evening' | 'weekly'>('morning');
  const [showAffirmationModal, setShowAffirmationModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [currentBreathNumber, setCurrentBreathNumber] = useState(1); // Mevcut nefes numarası
  const [breathingPattern, setBreathingPattern] = useState<'3-3-3' | '4-4-4' | '4-7-8'>('4-4-4'); // Nefes deseni
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null); // Seans başlangıç zamanı
  const [totalSessionTime, setTotalSessionTime] = useState(0); // Toplam seans süresi (saniye)
  const isBreathingRef = useRef(false);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [animationValues] = useState({
    fadeAnim: new Animated.Value(0),
    scaleAnim: new Animated.Value(0.9),
  });
  const [breathingAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(animationValues.fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(animationValues.scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabChange = (tab: 'morning' | 'evening' | 'weekly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  // Nefes egzersizi animasyonu
  const breathingCycleRef = useRef<NodeJS.Timeout | null>(null);

  const startBreathingExercise = () => {
    // Önce tüm animasyonları durdur
    breathingAnim.stopAnimation();
    if (breathingCycleRef.current) {
      clearTimeout(breathingCycleRef.current);
      breathingCycleRef.current = null;
    }
    
    // State'leri sıfırla
    isBreathingRef.current = true;
    setIsBreathing(true);
    setBreathCount(0);
    setCurrentBreathNumber(1);
    setBreathingPhase('inhale');
    breathingAnim.setValue(1);
    const startTime = new Date();
    setSessionStartTime(startTime);
    setTotalSessionTime(0);
    
    // Seans süresi sayacını başlat
    sessionTimerRef.current = setInterval(() => {
      if (isBreathingRef.current && startTime) {
        const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        setTotalSessionTime(elapsed);
      }
    }, 1000);
    
    // Kısa bir gecikme ile animasyonu başlat (render'ın tamamlanması için)
    setTimeout(() => {
      if (isBreathingRef.current) {
        breathingCycle();
      }
    }, 100);
  };

  const stopBreathingExercise = () => {
    isBreathingRef.current = false;
    setIsBreathing(false);
    if (breathingCycleRef.current) {
      clearTimeout(breathingCycleRef.current);
      breathingCycleRef.current = null;
    }
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    breathingAnim.stopAnimation();
    breathingAnim.setValue(1);
    setBreathingPhase('inhale');
    setSessionStartTime(null);
  };

  const breathingCycle = () => {
    if (!isBreathingRef.current) return;

    // Nefes desenine göre süreleri al
    const [inhaleDuration, holdDuration, exhaleDuration] = breathingPattern.split('-').map(Number);
    const pauseDuration = 2; // Bekleme süresi sabit 2 saniye

    // Nefes Al
    setBreathingPhase('inhale');
    Animated.timing(breathingAnim, {
      toValue: 1.5,
      duration: inhaleDuration * 1000,
      useNativeDriver: true,
    }).start(() => {
      if (!isBreathingRef.current) return;
      // Tut
      setBreathingPhase('hold');
      breathingCycleRef.current = setTimeout(() => {
        if (!isBreathingRef.current) return;
        // Nefes Ver
        setBreathingPhase('exhale');
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: exhaleDuration * 1000,
          useNativeDriver: true,
        }).start(() => {
          if (!isBreathingRef.current) return;
          // Bekle
          setBreathingPhase('pause');
          breathingCycleRef.current = setTimeout(() => {
            if (isBreathingRef.current) {
              setBreathCount(prev => prev + 1);
              setCurrentBreathNumber(prev => prev + 1);
              breathingCycle();
            }
          }, pauseDuration * 1000);
        });
      }, holdDuration * 1000);
    });
  };

  useEffect(() => {
    if (!showBreathingModal) {
      stopBreathingExercise();
    }
    return () => {
      if (breathingCycleRef.current) {
        clearTimeout(breathingCycleRef.current);
      }
    };
  }, [showBreathingModal]);


  const positiveAffirmations = [
    "Bugün harika bir gün olacak! 🌟",
    "Ben değerli ve sevilmeye layığım 💖",
    "Her gün yeni fırsatlar sunuyor 🚀",
    "İçimde güçlü ve güvenli hissediyorum 💪",
    "Hayallerim gerçek olacak ✨",
    "Bugün kendime karşı nazik olacağım 🤗",
    "Zorluklar beni güçlendiriyor 🌱",
    "Minettarım ve mutluyum 🙏",
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 36,
      fontWeight: '800',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textShadowColor: currentTheme.colors.primary + '20',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      lineHeight: 24,
    },
    tabBar: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 24,
      padding: 6,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 20,
    },
    activeTab: {
      backgroundColor: currentTheme.colors.primary + '20',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
    },
    activeTabText: {
      color: currentTheme.colors.primary,
      fontWeight: '700',
    },
    contentContainer: {
      paddingHorizontal: 20,
    },
    routineCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    routineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    routineIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    routineTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    routineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: currentTheme.colors.background + '40',
      borderRadius: 16,
      marginBottom: 8,
    },
    routineItemEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    routineItemText: {
      flex: 1,
      fontSize: 16,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    routineItemCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    affirmationButton: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      marginTop: 20,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    affirmationButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 16,
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    modalContent: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 28,
      padding: 28,
      width: '100%',
      maxWidth: 350,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 30,
      elevation: 20,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary + '20',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    affirmationText: {
      fontSize: 18,
      color: currentTheme.colors.text,
      textAlign: 'center',
      lineHeight: 28,
      marginBottom: 24,
    },
    modalButton: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    modalButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 16,
      fontWeight: '700',
    },
    breathingButton: {
      backgroundColor: currentTheme.colors.primary + '15',
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      marginTop: 12,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '30',
    },
    breathingButtonText: {
      color: currentTheme.colors.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    breathingModalContent: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 32,
      padding: 40,
      width: '100%',
      maxWidth: 420,
      alignItems: 'center',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.4,
      shadowRadius: 40,
      elevation: 25,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '30',
    },
    breathingCircle: {
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: currentTheme.colors.primary + '15',
      borderWidth: 4,
      borderColor: currentTheme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 40,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 15,
    },
    breathingInstruction: {
      fontSize: 28,
      fontWeight: '800',
      color: currentTheme.colors.text,
      textAlign: 'center',
      letterSpacing: 1,
    },
    breathingSubtext: {
      fontSize: 15,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 22,
      opacity: 0.8,
    },
    breathingCount: {
      fontSize: 16,
      color: currentTheme.colors.primary,
      fontWeight: '700',
      marginTop: 30,
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: currentTheme.colors.primary + '15',
      borderRadius: 20,
      overflow: 'hidden',
    },
    breathingControlButton: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 40,
      alignItems: 'center',
      marginTop: 30,
      minWidth: 180,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    breathingControlButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    breathingStopButton: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 40,
      alignItems: 'center',
      marginTop: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      minWidth: 180,
    },
    breathingStopButtonText: {
      color: currentTheme.colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
  });

  const toggleRoutineItem = (id: number, isMorning: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleRoutine(isMorning ? 'morning' : 'evening', id);
  };

  const renderRoutineItem = (item: any, index: number, isMorning: boolean) => (
    <TouchableOpacity
      key={item.id}
      style={dynamicStyles.routineItem}
      onPress={() => toggleRoutineItem(item.id, isMorning)}
      activeOpacity={0.7}
    >
      <Text style={dynamicStyles.routineItemEmoji}>{item.emoji}</Text>
      <Text style={dynamicStyles.routineItemText}>{item.title}</Text>
      <View style={[
        dynamicStyles.routineItemCheck,
        item.completed && {
          backgroundColor: currentTheme.colors.primary,
          borderColor: currentTheme.colors.primary,
        }
      ]}>
        {item.completed && (
          <Ionicons name="checkmark" size={16} color={currentTheme.colors.background} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (activeTab === 'morning') {
      return (
        <View style={dynamicStyles.routineCard}>
          <View style={dynamicStyles.routineHeader}>
            <Text style={dynamicStyles.routineIcon}>🌅</Text>
            <Text style={dynamicStyles.routineTitle}>{t('settings.morningRoutine')}</Text>
          </View>
          {morningRoutines.map((item, index) => renderRoutineItem(item, index, true))}
        </View>
      );
    } else if (activeTab === 'evening') {
      return (
        <View style={dynamicStyles.routineCard}>
          <View style={dynamicStyles.routineHeader}>
            <Text style={dynamicStyles.routineIcon}>🌙</Text>
            <Text style={dynamicStyles.routineTitle}>{t('settings.eveningRoutine')}</Text>
          </View>
          {eveningRoutines.map((item, index) => renderRoutineItem(item, index, false))}
        </View>
      );
    } else {
      return (
        <View style={dynamicStyles.routineCard}>
          <View style={dynamicStyles.routineHeader}>
            <Text style={dynamicStyles.routineIcon}>📊</Text>
            <Text style={dynamicStyles.routineTitle}>{t('settings.weeklySummary')}</Text>
          </View>
          <Text style={{ color: currentTheme.colors.secondary, textAlign: 'center', marginTop: 20 }}>
            {t('settings.weeklySummaryDesc')}
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Animated.View 
        style={[
          dynamicStyles.container,
          {
            opacity: animationValues.fadeAnim,
            transform: [{ scale: animationValues.scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>🧘‍♀️ Farkındalık</Text>
            <Text style={dynamicStyles.headerSubtitle}>
            {t('settings.mindfulnessSubtitle')}
          </Text>
        </View>

        {/* Tab Bar */}
        <View style={dynamicStyles.tabBar}>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'morning' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('morning')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'morning' && dynamicStyles.activeTabText]}>
              🌅 Sabah
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'evening' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('evening')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'evening' && dynamicStyles.activeTabText]}>
              🌙 Akşam
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'weekly' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('weekly')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'weekly' && dynamicStyles.activeTabText]}>
              📊 Haftalık
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={dynamicStyles.contentContainer} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
          
          <TouchableOpacity
            style={dynamicStyles.affirmationButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowAffirmationModal(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.affirmationButtonText}>
              💫 {t('settings.getPositiveAffirmation')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.breathingButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowBreathingModal(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.breathingButtonText}>
              🌬️ {t('settings.breathingExercise')}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Affirmation Modal */}
        <Modal
          visible={showAffirmationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAffirmationModal(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalTitle}>💫 {t('settings.positiveAffirmation')}</Text>
              <Text style={dynamicStyles.affirmationText}>
                {positiveAffirmations[Math.floor(Math.random() * positiveAffirmations.length)]}
              </Text>
              <TouchableOpacity
                style={dynamicStyles.modalButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowAffirmationModal(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={dynamicStyles.modalButtonText}>Harika! 🌟</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Breathing Exercise Modal */}
        <Modal
          visible={showBreathingModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            stopBreathingExercise();
            setShowBreathingModal(false);
          }}
        >
          <View style={dynamicStyles.modalOverlay}>
            <LinearGradient
              colors={[
                currentTheme.colors.card,
                currentTheme.colors.card,
                currentTheme.colors.primary + '08',
              ]}
              style={dynamicStyles.breathingModalContent}
            >
              <Text style={[dynamicStyles.modalTitle, { marginBottom: 8 }]}>
                🌬️ {t('settings.breathingExercise')}
              </Text>
              <Text style={dynamicStyles.breathingSubtext}>
                {t('settings.breathingExerciseDesc')}
              </Text>

              <Animated.View
                style={[
                  dynamicStyles.breathingCircle,
                  {
                    transform: [{ scale: breathingAnim }],
                    borderColor: currentTheme.colors.primary + '90',
                    backgroundColor: currentTheme.colors.primary + '12',
                  },
                ]}
              >
                <Text style={dynamicStyles.breathingInstruction}>
                  {breathingPhase === 'inhale' && '✨ ' + t('settings.breatheIn')}
                  {breathingPhase === 'hold' && '⏸ ' + t('settings.hold')}
                  {breathingPhase === 'exhale' && '💨 ' + t('settings.breatheOut')}
                  {breathingPhase === 'pause' && '⏸ ' + t('settings.pause')}
                </Text>
              </Animated.View>

              {breathCount > 0 && (
                <Animated.View
                  style={{
                    opacity: breathCount > 0 ? 1 : 0,
                  }}
                >
                  <Text style={dynamicStyles.breathingCount}>
                    ✨ {breathCount} {t('settings.breathsCompleted')}
                  </Text>
                </Animated.View>
              )}

              {/* Aşama Sayacı */}
              {isBreathing && (
                <Text style={{
                  marginTop: 12,
                  fontSize: 14,
                  color: currentTheme.colors.secondary,
                  opacity: 0.8,
                  fontWeight: '600',
                }}>
                  {currentBreathNumber}. {t('settings.breath')} - {
                    breathingPhase === 'inhale' ? t('settings.breatheIn') :
                    breathingPhase === 'hold' ? t('settings.hold') :
                    breathingPhase === 'exhale' ? t('settings.breatheOut') :
                    t('settings.pause')
                  }
                </Text>
              )}

              {/* Seans Süresi */}
              {isBreathing && totalSessionTime > 0 && (
                <Text style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: currentTheme.colors.secondary,
                  opacity: 0.7,
                }}>
                  {Math.floor(totalSessionTime / 60)}:{(totalSessionTime % 60).toString().padStart(2, '0')} {t('settings.sessionTime')}
                </Text>
              )}

              {/* Nefes Deseni Seçimi - Sadece başlamadan önce */}
              {!isBreathing && (
                <View style={{
                  marginTop: 20,
                  width: '100%',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: currentTheme.colors.secondary,
                    marginBottom: 12,
                    fontWeight: '600',
                  }}>
                    {t('settings.breathingPattern')}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    gap: 10,
                    justifyContent: 'center',
                  }}>
                    {(['3-3-3', '4-4-4', '4-7-8'] as const).map((pattern) => (
                      <TouchableOpacity
                        key={pattern}
                        onPress={() => setBreathingPattern(pattern)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          backgroundColor: breathingPattern === pattern 
                            ? currentTheme.colors.primary + '20' 
                            : currentTheme.colors.background,
                          borderWidth: 2,
                          borderColor: breathingPattern === pattern 
                            ? currentTheme.colors.primary 
                            : currentTheme.colors.border,
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: breathingPattern === pattern 
                            ? currentTheme.colors.primary 
                            : currentTheme.colors.text,
                        }}>
                          {pattern}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {!isBreathing ? (
                <TouchableOpacity
                  style={dynamicStyles.breathingControlButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    startBreathingExercise();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={dynamicStyles.breathingControlButtonText}>
                    ▶️ {t('settings.start')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[dynamicStyles.breathingStopButton, {
                    borderColor: currentTheme.colors.primary + '40',
                    backgroundColor: currentTheme.colors.primary + '10',
                  }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    stopBreathingExercise();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[dynamicStyles.breathingStopButtonText, {
                    color: currentTheme.colors.primary,
                  }]}>
                    ⏸️ {t('settings.stop')}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[dynamicStyles.breathingStopButton, { marginTop: 12 }]}
                onPress={() => {
                  stopBreathingExercise();
                  setShowBreathingModal(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={dynamicStyles.breathingStopButtonText}>
                  ✕ {t('settings.close')}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>
      </Animated.View>
    </SafeAreaView>
  );
}
