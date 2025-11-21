/**
 * Personality Card Component
 * 3D flip animation ile kişilik kartı
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useDiary } from '../hooks/useDiary';
import { useHabits } from '../hooks/useHabits';
import { useDreamsGoals } from '../hooks/useDreamsGoals';
import { createSmoothShadow, BORDER_RADIUS } from '../utils/moodColors';

const { width } = Dimensions.get('window');

interface PersonalityCardProps {
  onPress?: () => void;
}

export const PersonalityCard: React.FC<PersonalityCardProps> = ({ onPress }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const { entries, getStreak } = useDiary(user?.uid);
  const { habits } = useHabits(user?.uid);
  const { dreams, goals } = useDreamsGoals(user?.uid);

  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Yeni animasyonlar
  const pulseAnim = useRef(new Animated.Value(1)).current; // Nabız efekti için
  const sparkleAnim = useRef(new Animated.Value(0)).current; // Yıldız tozu için
  const waveAnim = useRef(new Animated.Value(0)).current; // Ritim dalgaları için
  const flamePulseAnim = useRef(new Animated.Value(1)).current; // Alev ikonu için

  // Kişilik analizi
  const getPersonalityAnalysis = () => {
    const totalEntries = entries.length;
    const currentStreak = getStreak();
    const totalHabits = habits.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalDreams = dreams.length;

    // Debug log
    console.log('🎭 Personality Debug:', {
      totalEntries,
      currentStreak,
      totalHabits,
      completedGoals,
      totalDreams
    });

    // Mood analizi
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const dominantMood = Object.entries(moodCounts).reduce((a, b) => 
      (moodCounts as any)[a[0]] > (moodCounts as any)[b[0]] ? a : b, ['3', 0]
    )[0];

    // Gelişmiş kişilik tipi belirleme
    let personalityType = currentLanguage === 'en' ? 'New Traveler' : 'Yeni Yolcu';
    let personalityTraits = currentLanguage === 'en' ? ['Open to discovery', 'Curious', 'Brave'] : ['Keşfetmeye açık', 'Meraklı', 'Cesur'];
    let personalityEmoji = '🌱';
    let personalityColor = '#10b981';
    let personalityDescription = currentLanguage === 'en' ? 'At the beginning of your life journey, every step is a discovery!' : 'Hayat yolculuğunun başında, her adım bir keşif!';
    let personalityMotivation = currentLanguage === 'en' ? 'You are writing a new story every day!' : 'Her gün yeni bir hikaye yazıyorsun!';

    console.log('🎭 Seviye Kontrol:', { totalEntries, currentStreak });

    if (totalEntries >= 100) {
      personalityType = currentLanguage === 'en' ? 'Soul Master' : 'Ruh Ustası';
      personalityTraits = currentLanguage === 'en' ? ['Wise', 'Balanced', 'Inner strength'] : ['Bilge', 'Dengeli', 'İçsel güçlü'];
      personalityEmoji = '🧘‍♀️';
      personalityColor = '#8b5cf6';
      personalityDescription = currentLanguage === 'en' ? 'A person who has reached spiritual maturity and knows the inner world deeply!' : 'Ruhsal olgunluğa ulaşmış, iç dünyasını derinlemesine tanıyan bir kişi!';
      personalityMotivation = currentLanguage === 'en' ? 'You are a guide of the soul!' : 'Sen bir ruh rehberisin!';
    } else if (totalEntries >= 50) {
      personalityType = currentLanguage === 'en' ? 'Consistency Hero' : 'İstikrar Kahramanı';
      personalityTraits = currentLanguage === 'en' ? ['Disciplined', 'Determined', 'Reliable'] : ['Disiplinli', 'Kararlı', 'Güvenilir'];
      personalityEmoji = '💪';
      personalityColor = '#f59e0b';
      personalityDescription = currentLanguage === 'en' ? 'You have the discipline and determination to reach your goals!' : 'Hedeflerine ulaşmak için gerekli disiplin ve kararlılığa sahip!';
      personalityMotivation = currentLanguage === 'en' ? 'Your consistency will take you to the top!' : 'İstikrarın seni zirveye taşıyacak!';
    } else if (totalEntries >= 30) {
      personalityType = currentLanguage === 'en' ? 'Growth Warrior' : 'Gelişim Savaşçısı';
      personalityTraits = currentLanguage === 'en' ? ['Goal-oriented', 'Progressive', 'Motivated'] : ['Hedef odaklı', 'İlerici', 'Motivasyonlu'];
      personalityEmoji = '🎯';
      personalityColor = '#3b82f6';
      personalityDescription = currentLanguage === 'en' ? 'Always focused on growth, moving towards goals with determination!' : 'Sürekli gelişim odaklı, hedeflerine kararlılıkla ilerleyen!';
      personalityMotivation = currentLanguage === 'en' ? 'Your growth knows no bounds!' : 'Gelişimin sınır tanımıyor!';
    } else if (totalEntries >= 15) {
      personalityType = currentLanguage === 'en' ? 'Discovery Hunter' : 'Keşif Avcısı';
      personalityTraits = currentLanguage === 'en' ? ['Curious', 'Experimental', 'Open-minded'] : ['Meraklı', 'Deneyimci', 'Açık fikirli'];
      personalityEmoji = '🔍';
      personalityColor = '#06b6d4';
      personalityDescription = currentLanguage === 'en' ? 'Open to discovering every detail of life, eager to learn!' : 'Hayatın her detayını keşfetmeye açık, öğrenmeye istekli!';
      personalityMotivation = currentLanguage === 'en' ? 'Every discovery makes you grow!' : 'Her keşif seni büyütüyor!';
    } else if (totalEntries >= 5) {
      personalityType = currentLanguage === 'en' ? 'Traveler' : 'Yolcu';
      personalityTraits = currentLanguage === 'en' ? ['Brave', 'Hopeful', 'Determined'] : ['Cesur', 'Umutlu', 'Kararlı'];
      personalityEmoji = '🚶‍♀️';
      personalityColor = '#84cc16';
      personalityDescription = currentLanguage === 'en' ? 'Just starting your journey, growing with every step!' : 'Yolculuğuna yeni başlamış, her adımda büyüyen!';
      personalityMotivation = currentLanguage === 'en' ? 'Every step makes you stronger!' : 'Her adım seni daha güçlü yapıyor!';
    } else if (totalEntries >= 1) {
      personalityType = currentLanguage === 'en' ? 'New Traveler' : 'Yeni Yolcu';
      personalityTraits = currentLanguage === 'en' ? ['Open to discovery', 'Curious', 'Brave'] : ['Keşfetmeye açık', 'Meraklı', 'Cesur'];
      personalityEmoji = '🌱';
      personalityColor = '#10b981';
      personalityDescription = currentLanguage === 'en' ? 'At the beginning of your life journey, every step is a discovery!' : 'Hayat yolculuğunun başında, her adım bir keşif!';
      personalityMotivation = currentLanguage === 'en' ? 'You are writing a new story every day!' : 'Her gün yeni bir hikaye yazıyorsun!';
    }

    // Wellness skoru hesapla
    const wellnessScore = Math.min(100, Math.round(
      (totalEntries * 2) + 
      (currentStreak * 3) + 
      (completedGoals * 5) + 
      (totalDreams * 2)
    ));

    return {
      type: personalityType,
      traits: personalityTraits,
      emoji: personalityEmoji,
      color: personalityColor,
      description: personalityDescription,
      motivation: personalityMotivation,
      wellnessScore,
      stats: {
        totalEntries,
        currentStreak,
        totalHabits,
        completedGoals,
        totalDreams,
      }
    };
  };

  const personality = getPersonalityAnalysis();

  // Circular progress animasyonu
  useEffect(() => {
    const progress = Math.min((personality.stats.totalEntries / 100) * 100, 100);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [personality.stats.totalEntries]);

  // Nabız animasyonu (kişilik ikonu için)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Yıldız tozu animasyonu (Yeni Yolcu seviyesinde)
  useEffect(() => {
    if (personality.stats.totalEntries < 5) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [personality.stats.totalEntries]);

  // Ritim dalgaları animasyonu
  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Alev ikonu parıltı animasyonu
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flamePulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(flamePulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Scale animasyonu
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Flip animasyonu
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);
    
    Animated.timing(flipAnim, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();

    onPress?.();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <TouchableOpacity
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Front Side */}
      <Animated.View style={[styles.card, frontAnimatedStyle]}>
        <LinearGradient
          colors={[
            currentTheme.colors.card,
            currentTheme.colors.card,
            currentTheme.colors.primary + '08',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.frontCard}
        >
          {/* Ritim Dalgaları Deseni */}
          <Animated.View
            style={[
              styles.wavePattern,
              {
                opacity: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.03, 0.06, 0.03],
                }),
                transform: [
                  {
                    translateX: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 20],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.waveCircle, { borderColor: currentTheme.colors.primary + '20' }]} />
            <View style={[styles.waveCircle, { borderColor: currentTheme.colors.primary + '15', top: 30, left: 40 }]} />
            <View style={[styles.waveCircle, { borderColor: currentTheme.colors.primary + '10', top: 60, left: 20 }]} />
          </Animated.View>

          {/* Yıldız Tozu Efekti (Yeni Yolcu seviyesinde) */}
          {personality.stats.totalEntries < 5 && (
            <Animated.View
              style={[
                styles.sparkleContainer,
                {
                  opacity: sparkleAnim,
                },
              ]}
            >
              <Text style={[styles.sparkle, { top: 20, left: 30 }]}>✨</Text>
              <Text style={[styles.sparkle, { top: 50, right: 40 }]}>✨</Text>
              <Text style={[styles.sparkle, { bottom: 40, left: 50 }]}>✨</Text>
              <Text style={[styles.sparkle, { bottom: 20, right: 30 }]}>✨</Text>
            </Animated.View>
          )}

          <View style={styles.frontContent}>
            {/* Header */}
            <View style={styles.frontHeader}>
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Text style={styles.emoji}>{personality.emoji}</Text>
              </Animated.View>
              <Text style={[styles.title, { color: currentTheme.colors.text }]}>
                {t('personality.personalityCard')}
              </Text>
              <Text style={[styles.personalityType, { color: currentTheme.colors.primary }]}>
                {personality.type} 🪶
              </Text>
            </View>
            
            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: currentTheme.colors.secondary }]}>
                {personality.description}
              </Text>
            </View>
            
            {/* Stats - 3 Kritik Veri: Wellness Skoru, Gün Serisi, Hedefler */}
            <View style={styles.statsContainer}>
              <View style={[styles.statItem, styles.statItemHighlight]}>
                <View style={[styles.statIconContainer, { backgroundColor: currentTheme.colors.primary + '20' }]}>
                  <Text style={styles.statEmoji}>💎</Text>
                </View>
                <Text style={[styles.statNumber, { color: currentTheme.colors.primary, fontSize: 24 }]}>
                  {personality.wellnessScore}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.colors.text, fontWeight: '700' }]}>
                  {t('personality.wellnessScore') || 'Wellness'}
                </Text>
                {/* Wellness İlerleme Çubuğu */}
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarBg, { backgroundColor: currentTheme.colors.border + '30' }]}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(personality.wellnessScore, 100)}%`,
                          backgroundColor: currentTheme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <View style={[styles.statItem, styles.statItemHighlight]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#f59e0b20' }]}>
                  <Animated.View
                    style={{
                      transform: [{ scale: flamePulseAnim }],
                    }}
                  >
                    <Text style={styles.statEmoji}>🔥</Text>
                  </Animated.View>
                </View>
                <Text style={[styles.statNumber, { color: '#f59e0b', fontSize: 24 }]}>
                  {personality.stats.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.colors.text, fontWeight: '700' }]}>
                  {t('dashboard.dayStreak')}
                </Text>
                {/* Gün Serisi İlerleme Çubuğu (100 güne göre) */}
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarBg, { backgroundColor: '#f59e0b30' }]}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min((personality.stats.currentStreak / 100) * 100, 100)}%`,
                          backgroundColor: '#f59e0b',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressBarLabel, { color: currentTheme.colors.secondary }]}>
                    {personality.stats.currentStreak}/100
                  </Text>
                </View>
              </View>
              <View style={[styles.statItem, styles.statItemHighlight]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#3b82f620' }]}>
                  <Text style={styles.statEmoji}>🎯</Text>
                </View>
                <Text style={[styles.statNumber, { color: '#3b82f6', fontSize: 24 }]}>
                  {personality.stats.completedGoals}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.colors.text, fontWeight: '700' }]}>
                  {t('dreams.goals')}
                </Text>
                {/* Hedefler İlerleme Çubuğu */}
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarBg, { backgroundColor: '#3b82f630' }]}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${goals.length > 0 ? Math.min((personality.stats.completedGoals / goals.length) * 100, 100) : 0}%`,
                          backgroundColor: '#3b82f6',
                        },
                      ]}
                    />
                  </View>
                  {goals.length > 0 && (
                    <Text style={[styles.progressBarLabel, { color: currentTheme.colors.secondary }]}>
                      {personality.stats.completedGoals}/{goals.length}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Flip Hint */}
            <View style={styles.flipHint}>
              <Ionicons name="refresh" size={14} color={currentTheme.colors.secondary} />
              <Text style={[styles.flipText, { color: currentTheme.colors.secondary }]}>
                {t('personality.tapToFlip')}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Back Side */}
      <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
        <View style={[styles.backCard, { backgroundColor: currentTheme.colors.card }]}>
          <View style={styles.backContent}>
            {/* Back Header */}
            <View style={styles.backHeader}>
              <Text style={[styles.backTitle, { color: currentTheme.colors.text }]}>
                {t('personality.developmentProfile')}
              </Text>
              <Text style={[styles.motivation, { color: currentTheme.colors.secondary }]}>
                {personality.motivation}
              </Text>
            </View>
            
            {/* Circular Progress for Diary Entries */}
            <View style={styles.circularProgressContainer}>
              <View style={styles.circularProgressWrapper}>
                {/* Background Circle */}
                <View style={[styles.circularProgressBg, {
                  borderColor: currentTheme.colors.border + '40',
                }]} />
                {/* Progress Circle */}
                <Animated.View style={[styles.circularProgressFill, {
                  borderColor: currentTheme.colors.primary,
                  borderTopColor: Math.min((personality.stats.totalEntries / 100) * 100, 100) > 0 ? currentTheme.colors.primary : 'transparent',
                  borderRightColor: Math.min((personality.stats.totalEntries / 100) * 100, 100) > 25 ? currentTheme.colors.primary : 'transparent',
                  borderBottomColor: Math.min((personality.stats.totalEntries / 100) * 100, 100) > 50 ? currentTheme.colors.primary : 'transparent',
                  borderLeftColor: Math.min((personality.stats.totalEntries / 100) * 100, 100) > 75 ? currentTheme.colors.primary : 'transparent',
                }]} />
                {/* Center Text */}
                <View style={styles.circularProgressCenter}>
                  <Text style={[styles.circularProgressNumber, { color: currentTheme.colors.text }]}>
                    {personality.stats.totalEntries}
                  </Text>
                  <Text style={[styles.circularProgressLabel, { color: currentTheme.colors.secondary }]}>
                    / 100
                  </Text>
                  <Text style={[styles.circularProgressSubLabel, { color: currentTheme.colors.secondary }]}>
                    {t('statistics.diaries')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Unlock System - Clean */}
            <View style={styles.unlockContainer}>
              <Text style={[styles.unlockTitle, { color: currentTheme.colors.text }]}>
                {t('personality.levelRequirements')}
              </Text>
              
              
              <View style={styles.unlockGrid}>
                {/* Row 1 */}
                <View style={styles.unlockRow}>
                  <View style={[
                    styles.unlockItemBox, 
                    personality.stats.totalEntries >= 1 ? 
                      { backgroundColor: currentTheme.colors.primary + '15', borderColor: currentTheme.colors.primary } : 
                      { backgroundColor: currentTheme.colors.border + '20', borderColor: currentTheme.colors.border }
                  ]}>
                    {personality.stats.totalEntries >= 1 ? (
                      <Text style={styles.unlockEmojiBox}>📝</Text>
                    ) : (
                      <View style={styles.lockedIconContainer}>
                        <Text style={styles.unlockEmojiBox}>📝</Text>
                        <Ionicons name="lock-closed" size={8} color={currentTheme.colors.secondary} style={styles.lockIcon} />
                      </View>
                    )}
                    <Text style={[
                      styles.unlockTextBox, 
                      { color: personality.stats.totalEntries >= 1 ? currentTheme.colors.primary : currentTheme.colors.secondary }
                    ]}>{t('diary.writeDiary')}</Text>
                  </View>
                  <View style={[
                    styles.unlockItemBox, 
                    personality.stats.totalEntries >= 5 ? 
                      { backgroundColor: currentTheme.colors.primary + '15', borderColor: currentTheme.colors.primary } : 
                      { backgroundColor: currentTheme.colors.border + '20', borderColor: currentTheme.colors.border }
                  ]}>
                    {personality.stats.totalEntries >= 5 ? (
                      <Text style={styles.unlockEmojiBox}>🎯</Text>
                    ) : (
                      <View style={styles.lockedIconContainer}>
                        <Text style={styles.unlockEmojiBox}>🎯</Text>
                        <Ionicons name="lock-closed" size={8} color={currentTheme.colors.secondary} style={styles.lockIcon} />
                      </View>
                    )}
                    <Text style={[
                      styles.unlockTextBox, 
                      { color: personality.stats.totalEntries >= 5 ? currentTheme.colors.primary : currentTheme.colors.secondary }
                    ]}>{t('dreams.goals')}</Text>
                  </View>
                  <View style={[
                    styles.unlockItemBox, 
                    personality.stats.totalEntries >= 15 ? 
                      { backgroundColor: currentTheme.colors.primary + '15', borderColor: currentTheme.colors.primary } : 
                      { backgroundColor: currentTheme.colors.border + '20', borderColor: currentTheme.colors.border }
                  ]}>
                    {personality.stats.totalEntries >= 15 ? (
                      <Text style={styles.unlockEmojiBox}>✨</Text>
                    ) : (
                      <View style={styles.lockedIconContainer}>
                        <Text style={styles.unlockEmojiBox}>✨</Text>
                        <Ionicons name="lock-closed" size={8} color={currentTheme.colors.secondary} style={styles.lockIcon} />
                      </View>
                    )}
                    <Text style={[
                      styles.unlockTextBox, 
                      { color: personality.stats.totalEntries >= 15 ? currentTheme.colors.primary : currentTheme.colors.secondary }
                    ]}>{t('dreams.dreams')}</Text>
                  </View>
                </View>
                
                {/* Row 2 */}
                <View style={styles.unlockRow}>
                  <View style={[
                    styles.unlockItemBox, 
                    personality.stats.totalEntries >= 30 ? 
                      { backgroundColor: currentTheme.colors.primary + '15', borderColor: currentTheme.colors.primary } : 
                      { backgroundColor: currentTheme.colors.border + '20', borderColor: currentTheme.colors.border }
                  ]}>
                    {personality.stats.totalEntries >= 30 ? (
                      <Text style={styles.unlockEmojiBox}>🔥</Text>
                    ) : (
                      <View style={styles.lockedIconContainer}>
                        <Text style={styles.unlockEmojiBox}>🔥</Text>
                        <Ionicons name="lock-closed" size={8} color={currentTheme.colors.secondary} style={styles.lockIcon} />
                      </View>
                    )}
                    <Text style={[
                      styles.unlockTextBox, 
                      { color: personality.stats.totalEntries >= 30 ? currentTheme.colors.primary : currentTheme.colors.secondary }
                    ]}>{t('statistics.habitsLabel')}</Text>
                  </View>
                  <View style={[
                    styles.unlockItemBox, 
                    personality.stats.totalEntries >= 50 ? 
                      { backgroundColor: currentTheme.colors.primary + '15', borderColor: currentTheme.colors.primary } : 
                      { backgroundColor: currentTheme.colors.border + '20', borderColor: currentTheme.colors.border }
                  ]}>
                    {personality.stats.totalEntries >= 50 ? (
                      <Text style={styles.unlockEmojiBox}>🏆</Text>
                    ) : (
                      <View style={styles.lockedIconContainer}>
                        <Text style={styles.unlockEmojiBox}>🏆</Text>
                        <Ionicons name="lock-closed" size={8} color={currentTheme.colors.secondary} style={styles.lockIcon} />
                      </View>
                    )}
                    <Text style={[
                      styles.unlockTextBox, 
                      { color: personality.stats.totalEntries >= 50 ? currentTheme.colors.primary : currentTheme.colors.secondary }
                    ]}>{t('achievements.achievements')}</Text>
                  </View>
                  <View style={[
                    styles.unlockItemBox, 
                    personality.stats.totalEntries >= 100 ? 
                      { backgroundColor: currentTheme.colors.primary + '15', borderColor: currentTheme.colors.primary } : 
                      { backgroundColor: currentTheme.colors.border + '20', borderColor: currentTheme.colors.border }
                  ]}>
                    {personality.stats.totalEntries >= 100 ? (
                      <Text style={styles.unlockEmojiBox}>🧘‍♀️</Text>
                    ) : (
                      <View style={styles.lockedIconContainer}>
                        <Text style={styles.unlockEmojiBox}>🧘‍♀️</Text>
                        <Ionicons name="lock-closed" size={8} color={currentTheme.colors.secondary} style={styles.lockIcon} />
                      </View>
                    )}
                    <Text style={[
                      styles.unlockTextBox, 
                      { color: personality.stats.totalEntries >= 100 ? currentTheme.colors.primary : currentTheme.colors.secondary }
                    ]}>{t('personality.master')}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Flip Hint */}
            <View style={styles.flipHint}>
              <Ionicons name="refresh" size={12} color={currentTheme.colors.secondary} />
              <Text style={[styles.flipText, { color: currentTheme.colors.secondary }]}>
                {t('personality.tapToFlip')}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    height: 420,
    alignSelf: 'center',
    marginVertical: 20,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    // Soft, emotional shadow
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    backfaceVisibility: 'hidden',
  },
  frontCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    // Soft border
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  backCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    // Soft border
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  frontContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  frontHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  personalityType: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descriptionContainer: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    // İnce gri çizgi
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  statItemHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statIcon: {
    marginBottom: 4,
  },
  statEmoji: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  flipText: {
    fontSize: 10,
    marginLeft: 3,
    fontWeight: '400',
  },
  backContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  backHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  backTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  motivation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  traitsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 12,
  },
  traitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    paddingHorizontal: 8,
  },
  traitIcon: {
    marginRight: 8,
  },
  traitEmoji: {
    fontSize: 14,
  },
  traitText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
    flex: 1,
  },
  detailedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  detailedStat: {
    alignItems: 'center',
    flex: 1,
  },
  detailedStatEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailedStatNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    marginBottom: 1,
  },
  detailedStatLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  developmentLevel: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  levelLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  levelBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  levelProgress: {
    height: '100%',
    borderRadius: 2,
  },
  levelText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
  },
  quoteContainer: {
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  quote: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 14,
  },
  simpleProgress: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  circularProgressWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circularProgressBg: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
  },
  circularProgressFill: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    transform: [{ rotate: '-90deg' }],
  },
  circularProgressCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressNumber: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  circularProgressLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: -2,
  },
  circularProgressSubLabel: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 1,
  },
  unlockContainer: {
    marginBottom: 16,
  },
  unlockTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  unlockGrid: {
    gap: 8,
  },
  unlockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  unlockItemBox: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 55,
    // Box style
  },
  unlockEmojiBox: {
    fontSize: 16,
    marginBottom: 4,
  },
  unlockTextBox: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },
  lockedIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
    padding: 1,
  },
  // Yeni animasyon stilleri
  wavePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  waveCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    top: 10,
    left: 20,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.6,
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 6,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressBarLabel: {
    fontSize: 8,
    marginTop: 2,
    fontWeight: '600',
  },
});
