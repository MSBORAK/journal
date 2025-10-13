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

    // Mood analizi
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const dominantMood = Object.entries(moodCounts).reduce((a, b) => 
      (moodCounts as any)[a[0]] > (moodCounts as any)[b[0]] ? a : b, ['3', 0]
    )[0];

    // Gelişmiş kişilik tipi belirleme
    let personalityType = 'Yeni Yolcu';
    let personalityTraits = ['Keşfetmeye açık', 'Meraklı', 'Cesur'];
    let personalityEmoji = '🌱';
    let personalityColor = '#10b981';
    let personalityDescription = 'Hayat yolculuğunun başında, her adım bir keşif!';
    let personalityMotivation = 'Her gün yeni bir hikaye yazıyorsun!';

    if (totalEntries >= 100 && currentStreak >= 21) {
      personalityType = 'Ruh Ustası';
      personalityTraits = ['Bilge', 'Dengeli', 'İçsel güçlü'];
      personalityEmoji = '🧘‍♀️';
      personalityColor = '#8b5cf6';
      personalityDescription = 'Ruhsal olgunluğa ulaşmış, iç dünyasını derinlemesine tanıyan bir kişi!';
      personalityMotivation = 'Sen bir ruh rehberisin!';
    } else if (totalEntries >= 50 && currentStreak >= 14) {
      personalityType = 'İstikrar Kahramanı';
      personalityTraits = ['Disiplinli', 'Kararlı', 'Güvenilir'];
      personalityEmoji = '💪';
      personalityColor = '#f59e0b';
      personalityDescription = 'Hedeflerine ulaşmak için gerekli disiplin ve kararlılığa sahip!';
      personalityMotivation = 'İstikrarın seni zirveye taşıyacak!';
    } else if (totalEntries >= 30 && currentStreak >= 7) {
      personalityType = 'Gelişim Savaşçısı';
      personalityTraits = ['Hedef odaklı', 'İlerici', 'Motivasyonlu'];
      personalityEmoji = '🎯';
      personalityColor = '#3b82f6';
      personalityDescription = 'Sürekli gelişim odaklı, hedeflerine kararlılıkla ilerleyen!';
      personalityMotivation = 'Gelişimin sınır tanımıyor!';
    } else if (totalEntries >= 15 && currentStreak >= 3) {
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
        <LinearGradient
          colors={[
            personality.color + 'FF', 
            personality.color + 'DD', 
            personality.color + 'BB',
            personality.color + '99'
          ]}
          style={[styles.gradient, styles.frontGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.3, 0.7, 1]}
        >
          <View style={styles.frontContent}>
            {/* Header */}
            <View style={styles.frontHeader}>
              <Text style={styles.emoji}>{personality.emoji}</Text>
              <Text style={styles.title}>Kişilik Kartım</Text>
              <Text style={styles.personalityType}>{personality.type} 🪶</Text>
            </View>
            
            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{personality.description}</Text>
            </View>
            
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>💎</Text>
                </View>
                <Text style={styles.statNumber}>{personality.wellnessScore}</Text>
                <Text style={styles.statLabel}>Wellness</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>🔥</Text>
                </View>
                <Text style={styles.statNumber}>{personality.stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Günlük Seri</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Text style={styles.statEmoji}>🎯</Text>
                </View>
                <Text style={styles.statNumber}>{personality.stats.completedGoals}</Text>
                <Text style={styles.statLabel}>Hedef</Text>
              </View>
            </View>

            {/* Flip Hint */}
            <View style={styles.flipHint}>
              <Ionicons name="refresh" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.flipText}>Dokunarak detayları gör</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Back Side */}
      <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
        <LinearGradient
          colors={[
            personality.color + '99', 
            personality.color + 'BB', 
            personality.color + 'DD',
            personality.color + 'FF'
          ]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.3, 0.7, 1]}
        >
          <View style={styles.backContent}>
            {/* Back Header */}
            <View style={styles.backHeader}>
              <Text style={styles.backTitle}>Gelişim Profilim</Text>
              <Text style={styles.motivation}>{personality.motivation}</Text>
            </View>
            
            {/* Development Level */}
            <View style={styles.developmentLevel}>
              <Text style={styles.levelLabel}>Gelişim Seviyesi</Text>
              <View style={styles.levelBar}>
                <View style={[styles.levelProgress, { 
                  width: `${Math.min((personality.stats.totalEntries / 100) * 100, 100)}%`,
                  backgroundColor: personality.color 
                }]} />
              </View>
              <Text style={styles.levelText}>
                {personality.stats.totalEntries < 10 ? 'Başlangıç' : 
                 personality.stats.totalEntries < 30 ? 'Gelişim' : 
                 personality.stats.totalEntries < 50 ? 'İlerleme' : 'Ustalık'}
              </Text>
            </View>
            
            {/* Traits */}
            <View style={styles.traitsContainer}>
              {personality.traits.map((trait, index) => (
                <View key={index} style={styles.traitItem}>
                  <View style={styles.traitIcon}>
                    <Text style={styles.traitEmoji}>✨</Text>
                  </View>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>

            {/* Detailed Stats */}
            <View style={styles.detailedStats}>
              <View style={styles.detailedStat}>
                <Text style={styles.detailedStatEmoji}>📝</Text>
                <Text style={styles.detailedStatNumber}>{personality.stats.totalEntries}</Text>
                <Text style={styles.detailedStatLabel}>Günlük</Text>
              </View>
              <View style={styles.detailedStat}>
                <Text style={styles.detailedStatEmoji}>🎯</Text>
                <Text style={styles.detailedStatNumber}>{personality.stats.completedGoals}</Text>
                <Text style={styles.detailedStatLabel}>Hedef</Text>
              </View>
              <View style={styles.detailedStat}>
                <Text style={styles.detailedStatEmoji}>✨</Text>
                <Text style={styles.detailedStatNumber}>{personality.stats.totalDreams}</Text>
                <Text style={styles.detailedStatLabel}>Hayal</Text>
              </View>
              <View style={styles.detailedStat}>
                <Text style={styles.detailedStatEmoji}>🔥</Text>
                <Text style={styles.detailedStatNumber}>{personality.stats.totalHabits}</Text>
                <Text style={styles.detailedStatLabel}>Alışkanlık</Text>
              </View>
            </View>

            {/* Inspirational Quote */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quote}>"Küçük adımlar büyük dönüşümler yaratır 🌱"</Text>
            </View>

            {/* Flip Hint */}
            <View style={styles.flipHint}>
              <Ionicons name="refresh" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.flipText}>Tekrar dokunarak çevir</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    height: 260,
    alignSelf: 'center',
    marginVertical: 20,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.large,
    // Subtle shadow for floating effect
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    backfaceVisibility: 'hidden',
  },
  backCard: {
    backgroundColor: 'transparent',
  },
          gradient: {
            flex: 1,
            borderRadius: BORDER_RADIUS.large,
            padding: 16,
            justifyContent: 'space-between',
            // Soft light glow
            shadowColor: 'rgba(255, 255, 255, 0.15)',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 0,
          },
  frontGradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: 'rgba(255, 255, 255, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 0,
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
    opacity: 0.8,
  },
  flipText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
    fontWeight: '500',
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
});
