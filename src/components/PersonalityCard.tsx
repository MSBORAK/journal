/**
 * Personality Card Component
 * 3D flip animation ile kişilik kartı
 */

import React, { useRef, useState } from 'react';
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
  const { t } = useLanguage();
  const { entries, getStreak } = useDiary(user?.uid);
  const { habits } = useHabits(user?.uid);
  const { dreams, goals } = useDreamsGoals(user?.uid);

  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
    let personalityType = t('welcome') === 'Welcome' ? 'New Traveler' : 'Yeni Yolcu';
    let personalityTraits = ['Keşfetmeye açık', 'Meraklı', 'Cesur'];
    let personalityEmoji = '🌱';
    let personalityColor = '#10b981';
    let personalityDescription = 'Hayat yolculuğunun başında, her adım bir keşif!';
    let personalityMotivation = t('welcome') === 'Welcome' ? 'You are writing a new story every day!' : 'Her gün yeni bir hikaye yazıyorsun!';

    console.log('🎭 Seviye Kontrol:', { totalEntries, currentStreak });

    if (totalEntries >= 100) {
      personalityType = t('welcome') === 'Welcome' ? 'Soul Master' : 'Ruh Ustası';
      personalityTraits = ['Bilge', 'Dengeli', 'İçsel güçlü'];
      personalityEmoji = '🧘‍♀️';
      personalityColor = '#8b5cf6';
      personalityDescription = 'Ruhsal olgunluğa ulaşmış, iç dünyasını derinlemesine tanıyan bir kişi!';
      personalityMotivation = 'Sen bir ruh rehberisin!';
    } else if (totalEntries >= 50) {
      personalityType = 'İstikrar Kahramanı';
      personalityTraits = ['Disiplinli', 'Kararlı', 'Güvenilir'];
      personalityEmoji = '💪';
      personalityColor = '#f59e0b';
      personalityDescription = t('welcome') === 'Welcome' ? 'You have the discipline and determination to reach your goals!' : 'Hedeflerine ulaşmak için gerekli disiplin ve kararlılığa sahip!';
      personalityMotivation = 'İstikrarın seni zirveye taşıyacak!';
    } else if (totalEntries >= 30) {
      personalityType = 'Gelişim Savaşçısı';
      personalityTraits = t('welcome') === 'Welcome' ? ['Goal-oriented', 'Progressive', 'Motivated'] : ['Hedef odaklı', 'İlerici', 'Motivasyonlu'];
      personalityEmoji = '🎯';
      personalityColor = '#3b82f6';
      personalityDescription = 'Sürekli gelişim odaklı, hedeflerine kararlılıkla ilerleyen!';
      personalityMotivation = 'Gelişimin sınır tanımıyor!';
    } else if (totalEntries >= 15) {
      personalityType = 'Keşif Avcısı';
      personalityTraits = ['Meraklı', 'Deneyimci', 'Açık fikirli'];
      personalityEmoji = '🔍';
      personalityColor = '#06b6d4';
      personalityDescription = 'Hayatın her detayını keşfetmeye açık, öğrenmeye istekli!';
      personalityMotivation = 'Her keşif seni büyütüyor!';
    } else if (totalEntries >= 5) {
      personalityType = 'Yolcu';
      personalityTraits = ['Cesur', 'Umutlu', 'Kararlı'];
      personalityEmoji = '🚶‍♀️';
      personalityColor = '#84cc16';
      personalityDescription = 'Yolculuğuna yeni başlamış, her adımda büyüyen!';
      personalityMotivation = 'Her adım seni daha güçlü yapıyor!';
    } else if (totalEntries >= 1) {
      personalityType = t('welcome') === 'Welcome' ? 'New Traveler' : 'Yeni Yolcu';
      personalityTraits = ['Keşfetmeye açık', 'Meraklı', 'Cesur'];
      personalityEmoji = '🌱';
      personalityColor = '#10b981';
      personalityDescription = 'Hayat yolculuğunun başında, her adım bir keşif!';
      personalityMotivation = t('welcome') === 'Welcome' ? 'You are writing a new story every day!' : 'Her gün yeni bir hikaye yazıyorsun!';
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
        <View style={[styles.frontCard, { backgroundColor: currentTheme.colors.card }]}>
          <View style={styles.frontContent}>
            {/* Header */}
            <View style={styles.frontHeader}>
              <Text style={styles.emoji}>{personality.emoji}</Text>
              <Text style={[styles.title, { color: currentTheme.colors.text }]}>
                {t('welcome') === 'Welcome' ? 'My Personality Card' : 'Kişilik Kartım'}
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
            
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>💎</Text>
                <Text style={[styles.statNumber, { color: currentTheme.colors.text }]}>
                  {personality.wellnessScore}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.colors.secondary }]}>
                  Wellness
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={[styles.statNumber, { color: currentTheme.colors.text }]}>
                  {personality.stats.currentStreak}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.colors.secondary }]}>
                  {t('welcome') === 'Welcome' ? 'Daily Streak' : 'Günlük Seri'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={[styles.statNumber, { color: currentTheme.colors.text }]}>
                  {personality.stats.completedGoals}
                </Text>
                <Text style={[styles.statLabel, { color: currentTheme.colors.secondary }]}>
                  {t('welcome') === 'Welcome' ? 'Goal' : 'Hedef'}
                </Text>
              </View>
            </View>

            {/* Flip Hint */}
            <View style={styles.flipHint}>
              <Ionicons name="refresh" size={14} color={currentTheme.colors.secondary} />
              <Text style={[styles.flipText, { color: currentTheme.colors.secondary }]}>
                {t('welcome') === 'Welcome' ? 'Tap to see details' : 'Dokunarak detayları gör'}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Back Side */}
      <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
        <View style={[styles.backCard, { backgroundColor: currentTheme.colors.card }]}>
          <View style={styles.backContent}>
            {/* Back Header */}
            <View style={styles.backHeader}>
              <Text style={[styles.backTitle, { color: currentTheme.colors.text }]}>
                {t('welcome') === 'Welcome' ? 'My Growth Profile' : 'Gelişim Profilim'}
              </Text>
              <Text style={[styles.motivation, { color: currentTheme.colors.secondary }]}>
                {personality.motivation}
              </Text>
            </View>
            
            {/* Simple Progress */}
            <View style={styles.simpleProgress}>
              <Text style={[styles.progressLabel, { color: currentTheme.colors.secondary }]}>
                {t('welcome') === 'Welcome' ? 'Progress' : 'İlerleme'}: {personality.stats.totalEntries} / 100 {t('welcome') === 'Welcome' ? 'diaries' : 'günlük'}
              </Text>
              <View style={[styles.progressBar, { backgroundColor: currentTheme.colors.border }]}>
                <View style={[styles.progressFill, { 
                  width: `${Math.min((personality.stats.totalEntries / 100) * 100, 100)}%`,
                  backgroundColor: currentTheme.colors.primary 
                }]} />
              </View>
            </View>

            {/* Unlock System - Clean */}
            <View style={styles.unlockContainer}>
              <Text style={[styles.unlockTitle, { color: currentTheme.colors.text }]}>
                {t('welcome') === 'Welcome' ? 'Unlocked Features' : 'Açılan Özellikler'}
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
                    <Text style={styles.unlockEmojiBox}>📝</Text>
                    <Text style={[
                      styles.unlockTextBox, 
                      { color: personality.stats.totalEntries >= 1 ? currentTheme.colors.primary : currentTheme.colors.secondary }
                    ]}>{t('welcome') === 'Welcome' ? 'Diary' : 'Günlük'}</Text>
                  </View>
                  <View style={[
                    styles.unlockItemBox, 
                    personality.stats.totalEntries >= 5 ? 
                      { backgroundColor: currentTheme.colors.primary + '15', borderColor: currentTheme.colors.primary } : 
                      { backgroundColor: currentTheme.colors.border + '20', borderColor: currentTheme.colors.border }
                  ]}>
                    <Text style={styles.unlockEmojiBox}>🎯</Text>
                    <Text style={[
                      styles.unlockTextBox, 
                      { color: personality.stats.totalEntries >= 5 ? currentTheme.colors.primary : currentTheme.colors.secondary }
                    ]}>{t('welcome') === 'Welcome' ? 'Goal' : 'Hedef'}</Text>
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
                    ]}>{t('welcome') === 'Welcome' ? 'Dream' : 'Hayal'}</Text>
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
                    ]}>{t('welcome') === 'Welcome' ? 'Habit' : 'Alışkanlık'}</Text>
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
                    ]}>Başarı</Text>
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
                    ]}>Usta</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Flip Hint */}
            <View style={styles.flipHint}>
              <Ionicons name="refresh" size={12} color={currentTheme.colors.secondary} />
              <Text style={[styles.flipText, { color: currentTheme.colors.secondary }]}>
                Dokunarak çevir
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
    height: 360,
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
  },
  statIcon: {
    marginBottom: 4,
  },
  statEmoji: {
    fontSize: 16,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    marginBottom: 3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
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
});
