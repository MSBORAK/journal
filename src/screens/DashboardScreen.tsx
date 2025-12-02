import React, { useEffect, useState, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { themes } from '../themes';
// import { useFont } from '../contexts/FontContext'; // Kaldırıldı
import { useDiary } from '../hooks/useDiary';
import { useProfile } from '../hooks/useProfile';
import { useTasks } from '../hooks/useTasks';
import { useReminders } from '../hooks/useReminders';
import { useAchievements } from '../hooks/useAchievements';
import { useDreamsGoals } from '../hooks/useDreamsGoals';
import { Ionicons } from '@expo/vector-icons';
import { DiaryEntry } from '../types';
import { PersonalityCard } from '../components/PersonalityCard';
import { 
  requestNotificationPermissions, 
  scheduleAllNotifications 
} from '../services/notificationService';
import { getInspirationByMood, InspirationMessage } from '../data/inspirationMessages';
import { getGreetingMessage, getUserTimezone } from '../utils/dateTimeUtils';
import { useTooltips } from '../hooks/useTooltips';
import Tooltip from '../components/Tooltip';
import MotivationCard from '../components/MotivationCard';
import { useAppTour } from '../hooks/useAppTour';
import AppTour from '../components/AppTour';
import { replaceAppName, replaceNickname, replacePlaceholders } from '../utils/textUtils';
import { getButtonTextColor } from '../utils/colorUtils';
import { isIPad, getMaxContentWidth, getHorizontalPadding } from '../utils/deviceUtils';
import { isNetworkError } from '../utils/networkUtils';

const { width, height: screenHeight } = Dimensions.get('window');

interface WellnessData {
  waterGlasses: number;
  exerciseMinutes: number;
  sleepHours: number;
  meditationMinutes: number;
  date: string;
}

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen = React.memo(function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t, currentLanguage } = useLanguage();
  
  // Tooltips
  const tooltipManager = useTooltips('Dashboard');
  
  // App Tour
  const tour = useAppTour(navigation, 'Dashboard');

  // ScrollView ref for resetting after App Tour closes
  const scrollViewRef = useRef<ScrollView>(null);
  const prevTourVisible = useRef<boolean>(false);

  // Reset ScrollView when App Tour closes
  useEffect(() => {
    if (prevTourVisible.current && !tour.tourVisible) {
      // App Tour just closed - force re-enable scrolling and reset gesture handler
      setTimeout(() => {
        if (scrollViewRef.current) {
          // Force re-enable scrolling by setting native props
          scrollViewRef.current.setNativeProps({ 
            scrollEnabled: true,
            bounces: true,
          });
        }
      }, 150);
    }
    prevTourVisible.current = tour.tourVisible;
  }, [tour.tourVisible]);

  // Animation values
  const fadeAnims = useRef({
    mood: new Animated.Value(0),
    tasks: new Animated.Value(0),
    health: new Animated.Value(0),
    welcome: new Animated.Value(0),
    motivation: new Animated.Value(0),
    insights: new Animated.Value(0),
    reminders: new Animated.Value(0),
  }).current;

  const scaleAnims = useRef({
    mood: new Animated.Value(0.95),
    tasks: new Animated.Value(0.95),
    health: new Animated.Value(0.95),
  }).current;

  const pulseAnims = useRef({
    mood: new Animated.Value(1),
    motivation: new Animated.Value(1),
    reminders: new Animated.Value(1),
  }).current;
  // const { fontConfig } = useFont(); // Kaldırıldı
  const { entries, error: diaryError } = useDiary(user?.uid);
  const { profile, refreshProfile } = useProfile(user?.uid);
  const { 
    getTodayTasks, 
    getTodayCompletedCount, 
    getTodayCompletionRate, 
    toggleTaskCompletion,
    getCategoryById
  } = useTasks(user?.uid);
  const { getTodayReminders } = useReminders(user?.uid);
  const { achievements, getAchievementStats } = useAchievements(user?.uid);
  const { getActivePromises } = useDreamsGoals(user?.uid);

  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [dailyInspiration, setDailyInspiration] = useState<InspirationMessage | null>(null);
  const [inspirationRefreshing, setInspirationRefreshing] = useState(false);
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    waterGlasses: 0,
    exerciseMinutes: 0,
    sleepHours: 0,
    meditationMinutes: 0,
    date: new Date().toISOString().split('T')[0],
  });

  // Animation functions
  const startCardAnimations = () => {
    const animations = [
      Animated.timing(fadeAnims.welcome, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnims.mood, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnims.tasks, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnims.health, {
        toValue: 1,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnims.motivation, {
        toValue: 1,
        duration: 800,
        delay: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnims.insights, {
        toValue: 1,
        duration: 800,
        delay: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnims.reminders, {
        toValue: 1,
        duration: 800,
        delay: 1200,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();

    // Pulse animations for interactive elements
    setTimeout(() => {
      const pulseAnimations = [
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnims.mood, {
              toValue: 1.03,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnims.mood, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnims.motivation, {
              toValue: 1.02,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnims.motivation, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnims.reminders, {
              toValue: 1.01,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnims.reminders, {
              toValue: 1,
              duration: 2500,
              useNativeDriver: true,
            }),
          ])
        ),
      ];

      pulseAnimations.forEach(anim => anim.start());
    }, 1500);
  };

  const animateCardPress = (cardName: 'mood' | 'tasks' | 'health') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.sequence([
      Animated.timing(scaleAnims[cardName], {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[cardName], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Animasyon state'leri
  const [animatingTasks, setAnimatingTasks] = useState<Set<string>>(new Set());
  const scaleAnimations = useRef<{[key: string]: Animated.Value}>({});
  const glowAnimations = useRef<{[key: string]: Animated.Value}>({});
  const checkmarkAnimations = useRef<{[key: string]: Animated.Value}>({});
  

  const todayTasks = getTodayTasks();
  const todayCompletedCount = getTodayCompletedCount();
  const todayCompletionRate = getTodayCompletionRate();
  const todayReminders = getTodayReminders();

  // Debug: Task state değişikliklerini logla
  useEffect(() => {
    console.log('Dashboard - Tasks updated:', {
      totalTasks: todayTasks.length,
      completedCount: todayCompletedCount,
      completionRate: todayCompletionRate,
      tasks: todayTasks.map(t => ({ id: t.id, title: t.title, isCompleted: t.isCompleted }))
    });
  }, [todayTasks, todayCompletedCount, todayCompletionRate]);

  // Start animations on mount
  useEffect(() => {
    startCardAnimations();
  }, []);

  // Günün ilhamını yükle
  useEffect(() => {
    loadDailyInspiration();
  }, [entries]); // Entries değiştiğinde yeniden yükle (ruh hali güncellendiğinde)

  // Dashboard'a focus olduğunda profili refresh et (profil güncellemesi sonrası)
  useFocusEffect(
    React.useCallback(() => {
      if (user?.uid) {
        refreshProfile();
      }
    }, [user?.uid])
  );

  // Network hatalarını sessizce logla (kullanıcıya gösterme)
  useEffect(() => {
    if (diaryError && !isNetworkError(diaryError)) {
      // Sadece network olmayan hataları logla
      console.warn('⚠️ Non-network error detected:', diaryError);
    }
  }, [diaryError]);

  // Animasyon fonksiyonları
  const animateTaskCompletion = async (taskId: string) => {
    // GÜÇLÜ Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Başarı ses efekti (gelecekte eklenebilir)
    // await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Animasyon state'ini ekle
    setAnimatingTasks(prev => new Set([...prev, taskId]));
    
    // Scale animasyonu
    if (!scaleAnimations.current[taskId]) {
      scaleAnimations.current[taskId] = new Animated.Value(1);
    }
    
    // Glow animasyonu
    if (!glowAnimations.current[taskId]) {
      glowAnimations.current[taskId] = new Animated.Value(0);
    }
    
    // Checkmark animasyonu
    if (!checkmarkAnimations.current[taskId]) {
      checkmarkAnimations.current[taskId] = new Animated.Value(0);
    }
    
    // Animasyon sequence - DAHA DRAMATİK!
    Animated.sequence([
      // 1. BÜYÜK scale up + glow
      Animated.parallel([
        Animated.timing(scaleAnimations.current[taskId], {
          toValue: 1.4,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimations.current[taskId], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 2. Bounce back + Checkmark pop
      Animated.parallel([
        Animated.spring(scaleAnimations.current[taskId], {
          toValue: 1,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(checkmarkAnimations.current[taskId], {
          toValue: 1,
          tension: 150,
          friction: 4,
          useNativeDriver: true,
        }),
      ]),
      // 3. Glow fade out
      Animated.timing(glowAnimations.current[taskId], {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Animasyon bittiğinde state'ten çıkar
      setAnimatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    });
  };

  // Bildirim izinlerini başlat ve bildirimleri planla
  useEffect(() => {
    const initializeNotifications = async () => {
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        try {
          const last = await AsyncStorage.getItem('notificationsScheduledAt');
          const today = new Date().toDateString();
          if (last !== today) {
            await scheduleAllNotifications(user?.uid);
            await AsyncStorage.setItem('notificationsScheduledAt', today);
          }
        } catch {
          await scheduleAllNotifications(user?.uid);
        }
      }
    };

    initializeNotifications();
  }, []);


  // Wellness verilerini yükle
  useEffect(() => {
    loadTodayWellnessData();
  }, []);

  // İlk kullanıcı kontrolü - hoşgeldin mesajı
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean>(false);
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenWelcome');
        if (!hasSeen) {
          // İlk kullanıcı - modal göster
          setTimeout(() => {
            setShowWelcomeModal(true);
            setHasSeenWelcome(false);
            // Hoşgeldin modalının animasyonunu başlat
            Animated.timing(fadeAnims.welcome, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }).start();
          }, 1000);
        } else {
          // Daha önce görmüş - modal gösterme
          setHasSeenWelcome(true);
        }
      } catch (error) {
        console.error('Error checking first time user:', error);
        // Hata durumunda modal gösterme
        setHasSeenWelcome(true);
      }
    };
    
    checkFirstTimeUser();
  }, []);

  // Kart animasyonlarını başlat
  useEffect(() => {
    const animations = [
      { anim: fadeAnims.mood, delay: 0 },
      { anim: fadeAnims.motivation, delay: 100 },
      { anim: fadeAnims.insights, delay: 200 },
      { anim: fadeAnims.tasks, delay: 300 },
      { anim: fadeAnims.reminders, delay: 400 },
      { anim: fadeAnims.health, delay: 500 },
    ];

    const animationSequence = animations.map(({ anim, delay }) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    Animated.parallel(animationSequence).start();
  }, []);

  const loadTodayWellnessData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedData = await AsyncStorage.getItem(`wellness_${today}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setWellnessData({
          waterGlasses: parsedData.waterGlasses || 0,
          exerciseMinutes: parsedData.exerciseMinutes || 0,
          sleepHours: parsedData.sleepHours || 0,
          meditationMinutes: parsedData.meditationMinutes || 0,
          date: today,
        });
      }
    } catch (error) {
      console.error('Error loading wellness data:', error);
    }
  };

  // Hoşgeldin modalını kapat
  const closeWelcomeModal = async () => {
    try {
      await AsyncStorage.setItem('hasSeenWelcome', 'true');
      setShowWelcomeModal(false);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error saving welcome status:', error);
    }
  };

  const updateWellnessData = async (key: keyof Omit<WellnessData, 'date'>, value: number) => {
    try {
      const newData = { ...wellnessData, [key]: value };
      setWellnessData(newData);
      await AsyncStorage.setItem(`wellness_${wellnessData.date}`, JSON.stringify(newData));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error saving wellness data:', error);
    }
  };

  const getCurrentStreak = (): number => {
    // Calculate current streak logic
    let streak = 0;
    const today = new Date();
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getLongestStreak = (): number => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(sortedEntries[i - 1].date);
      const currDate = new Date(sortedEntries[i].date);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }
    
    return longestStreak;
  };

  const getStreakMessage = (): string => {
    const streak = getCurrentStreak();
    if (streak === 0) return "Hadi başla! İlk günlüğünü yaz! 🚀";
    if (streak === 1) return "Harika başlangıç! Devam et! 💪";
    if (streak === 3) return "3 gün üst üste! Muhteşemsin! 🔥";
    if (streak === 7) return "1 hafta tamamlandı! İnanılmaz! 🏆";
    if (streak === 14) return "2 hafta! Sen bir efsanesin! ⭐";
    if (streak === 30) return "30 gün! Artık bir alışkanlık! 🎉";
    if (streak === 100) return "100 GÜN! SEN BİR ŞAMPİYONSUN! 👑";
    if (streak >= 365) return "1 YIL! İNANILMAZ BİR BAŞARI! 🌟";
    return `${streak} gün üst üste! Harikasın! 🔥`;
  };

  const getStreakBadges = () => {
    const streak = getCurrentStreak();
    const longest = getLongestStreak();
    const badges = [];
    
    if (streak >= 3) badges.push({ icon: '🔥', title: t('dashboard.streakBadges.threeDayFire'), desc: t('dashboard.streakBadges.threeDayFireDesc') });
    if (streak >= 7) badges.push({ icon: '🏆', title: t('dashboard.streakBadges.weeklyChampion'), desc: t('dashboard.streakBadges.weeklyChampionDesc') });
    if (streak >= 14) badges.push({ icon: '⭐', title: t('dashboard.streakBadges.twoWeekStar'), desc: t('dashboard.streakBadges.twoWeekStarDesc') });
    if (streak >= 30) badges.push({ icon: '💎', title: t('dashboard.streakBadges.monthlyDiamond'), desc: t('dashboard.streakBadges.monthlyDiamondDesc') });
    if (streak >= 100) badges.push({ icon: '👑', title: t('dashboard.streakBadges.hundredKing'), desc: t('dashboard.streakBadges.hundredKingDesc') });
    if (longest >= 365) badges.push({ icon: '🌟', title: t('dashboard.streakBadges.yearlyLegend'), desc: t('dashboard.streakBadges.yearlyLegendDesc') });
    
    return badges;
  };

  const getWellnessScore = (): number => {
    // Simple wellness score calculation
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(entry => entry.date === today);
    
    if (!todayEntry) return 0;
    
    let score = 50; // Base score
    
    // Mood factor
    if (todayEntry.mood) {
      score += todayEntry.mood * 10; // 10-100 points based on mood
    }
    
    // Content quality factor
    if (todayEntry.content && todayEntry.content.length > 100) {
      score += 20;
    }
    
    // Streak bonus
    const streak = getCurrentStreak();
    score += Math.min(streak * 5, 25); // Max 25 bonus points
    
    return Math.min(Math.max(score, 0), 100);
  };

  // Gelişmiş Sağlık Skoru Hesaplamaları
  const getHealthCategories = () => {
    const last7Days = entries.slice(-7);
    
    // Ruh Hali Skoru (0-100)
    const moodScore = (() => {
      if (last7Days.length === 0) return 0;
      const avgMood = last7Days.reduce((sum, e) => sum + (e.mood || 0), 0) / last7Days.length;
      return Math.round((avgMood / 5) * 100);
    })();
    
    
    // Daily Score (Content quality)
    const diaryScore = (() => {
      if (last7Days.length === 0) return 0;
      const avgLength = last7Days.reduce((sum, e) => sum + (e.content?.length || 0), 0) / last7Days.length;
      return Math.min(Math.round((avgLength / 500) * 100), 100); // 500+ karakter = 100 puan
    })();
    
    // Düzenlilik Skoru (Görev tamamlama)
    const regularityScore = todayCompletionRate;
    
    return [
      { emoji: '😊', label: 'Ruh Hali', score: moodScore, color: currentTheme.colors.primary },
      { emoji: '✍️', label: 'Rhythm', score: diaryScore, color: currentTheme.colors.secondary },
      { emoji: '⚡', label: 'Düzenlilik', score: regularityScore, color: currentTheme.colors.success },
    ];
  };

  const getHealthTrend = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateStr);
      
      let dayScore = 0;
      if (entry) {
        dayScore += (entry.mood || 0) * 15;
        dayScore += entry.content && entry.content.length > 100 ? 25 : 0;
      }
      
      return {
        day: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][date.getDay()],
        score: Math.min(dayScore, 100),
        isToday: dateStr === new Date().toISOString().split('T')[0]
      };
    });
  };

  const getHealthRecommendations = () => {
    const categories = getHealthCategories();
    const recommendations = [];

    categories.forEach(cat => {
      if (cat.score < 50) {
        if (cat.label === 'Ruh Hali') {
          recommendations.push({
            icon: '🌈',
            title: t('dashboard.tips.improveMood'),
            description: t('dashboard.tips.improveMoodDesc')
          });
        } else if (cat.label === 'Rhythm') {
          recommendations.push({
            icon: '📝',
            title: t('dashboard.tips.writeDetailed'),
            description: t('dashboard.tips.writeDetailedDesc')
          });
        } else if (cat.label === 'Düzenlilik') {
          recommendations.push({
            icon: '✅',
            title: t('dashboard.tips.completeTasks'),
            description: t('dashboard.tips.completeTasksDesc')
          });
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push({
        icon: '🎉',
        title: 'Harika Gidiyorsun!',
        description: 'Tüm kategorilerde mükemmel bir performans gösteriyorsun. Böyle devam et!'
      });
    }

    return recommendations.slice(0, 3);
  };

  // Günün ilhamını yükle
  const loadDailyInspiration = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedDate = await AsyncStorage.getItem('inspiration_date');
      const savedMessage = await AsyncStorage.getItem('inspiration_message');

      // Eğer bugünün mesajı varsa, onu kullan
      if (savedDate === today && savedMessage) {
        setDailyInspiration(JSON.parse(savedMessage));
      } else {
        // Yeni mesaj oluştur
        await refreshInspiration();
      }
    } catch (error) {
      console.error('İlham mesajı yüklenirken hata:', error);
      // Hata olursa rastgele bir mesaj göster
      const today = getTodayMood();
      const moodValue = today && typeof today === 'object' && 'value' in today ? today.value : 3;
      const moodType = moodValue >= 5 ? 'happy' : moodValue === 4 ? 'happy' : moodValue === 3 ? 'neutral' : 'sad';
      setDailyInspiration(getInspirationByMood(moodType as any));
    }
  };

  // İlham mesajını yenile
  const refreshInspiration = async () => {
    setInspirationRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayMood = getTodayMood();
      const moodValue = todayMood && typeof todayMood === 'object' && 'value' in todayMood ? todayMood.value : 3;
      
      // Ruh haline göre mesaj seç
      let moodType: any = 'neutral';
      if (moodValue >= 5) moodType = 'happy';        // Harika
      else if (moodValue === 4) moodType = 'happy';  // Mutlu
      else if (moodValue === 3) moodType = 'neutral'; // Yorgun
      else if (moodValue <= 2) moodType = 'sad';     // Üzgün/Normal
      
      const newMessage = getInspirationByMood(moodType);
      setDailyInspiration(newMessage);
      
      // Kaydet
      await AsyncStorage.setItem('inspiration_date', today);
      await AsyncStorage.setItem('inspiration_message', JSON.stringify(newMessage));
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('İlham mesajı yenilenirken hata:', error);
    } finally {
      setTimeout(() => setInspirationRefreshing(false), 500);
    }
  };

  const getTodayMood = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(entry => entry.date === today);
    
    const moodOptions = [
      { value: 0, label: 'Henüz Belirtilmedi', emoji: '📝' }, // Varsayılan
      { value: 1, label: 'Üzgün', emoji: '😔' },        // WriteDiary ile uyumlu
      { value: 2, label: 'Normal', emoji: '😐' },
      { value: 3, label: 'Yorgun', emoji: '🫠' },       // WriteDiary ile uyumlu
      { value: 4, label: 'Mutlu', emoji: '😎' },        // WriteDiary ile uyumlu
      { value: 5, label: 'Harika', emoji: '🤩' },       // WriteDiary ile uyumlu
    ];
    
    if (!todayEntry) {
      return { ...moodOptions[0], isDefault: true }; // Varsayılan mood döndür
    }
    
    return moodOptions.find(mood => mood.value === todayEntry.mood);
  };

  const getMoodEmoji = (moodValue: number) => {
    const moodEmojis: { [key: number]: string } = {
      0: '📝',  // Henüz Belirtilmedi
      1: '😔',  // Üzgün
      2: '😐',  // Normal
      3: '🫠',  // Yorgun
      4: '😎',  // Mutlu
      5: '🤩',  // Harika
    };
    return moodEmojis[moodValue] || '📝';
  };

  const getMotivationMessage = () => {
    // Basit pozitif mesajlar - rastgele seç
    const messages = [
      // Pozitif ve motive edici mesajlar
      t('motivation.messages.innerLightShining'),
      t('motivation.messages.youAreValuable'),
      t('motivation.messages.strongerEveryDay'),
      t('motivation.messages.beKindToYourself'),
      t('motivation.messages.youAreAmazing'),
      t('motivation.messages.breatheRelax'),
      t('motivation.messages.smileToday'),
      t('motivation.messages.loveYourself'),
      t('motivation.messages.innerPeace'),
      t('motivation.messages.youAreStar'),
      
      // Daha fazla pozitif mesaj
      t('motivation.messages.youAreMagnificent'),
      t('motivation.messages.lifeSmiling'),
      t('motivation.messages.youAreSpecial'),
      t('motivation.messages.beAtPeace'),
      t('motivation.messages.youAreLight'),
      t('motivation.messages.todayBeautiful'),
      t('motivation.messages.youArePrecious'),
      t('motivation.messages.innerBeautyShining'),
      t('motivation.messages.youAreMiracle'),
      t('motivation.messages.acceptYourself'),
      t('motivation.messages.youAreBeautiful'),
      t('motivation.messages.innerLoveGreat'),
      t('motivation.messages.youAreBrave'),
      t('motivation.messages.everyDayGift'),
      t('motivation.messages.youAreSuccessful'),
      t('motivation.messages.youAreLeader'),
      
      // Kişisel gelişim
      t('motivation.messages.discoveringYourself'),
      t('motivation.messages.listenInnerStory'),
      t('motivation.messages.knowingYourself'),
      t('motivation.messages.rememberPastPlanFuture'),
      
      // Cesaret verici ve iyileştirici
      t('motivation.messages.challengesMakeStronger'),
      t('motivation.messages.everyDayOpportunity'),
      t('motivation.messages.youAreChange'),
      t('motivation.messages.powerWithin'),
      t('motivation.messages.everyChallengeStronger'),
      t('motivation.messages.believeInYourself'),
      t('motivation.messages.changeCanBeScary'),
      
      // Modu düşük insanlar için anlamlı mesajlar
      t('motivation.messages.ifTodayTough'),
      t('motivation.messages.everyDayDifferent'),
      t('motivation.messages.listenToYourself'),
      t('motivation.messages.evenSmallSteps'),
      t('motivation.messages.difficultTimesTemporary'),
      t('motivation.messages.beCompassionateToYourself'),
      t('motivation.messages.justBreathingEnough'),
      t('motivation.messages.notSameEnergyEveryDay'),
      t('motivation.messages.restTodayTomorrowBetter'),
      t('motivation.messages.valuableNoMatterMood'),
      t('motivation.messages.acceptYourselfWithoutJudgment'),
      t('motivation.messages.beHappySmallThings'),
      t('motivation.messages.differenceBeautiful'),
      t('motivation.messages.giveYourselfTime'),
      t('motivation.messages.justExistingEnough'),
      
      // Sevgili ve pozitif
      t('motivation.messages.talkingToYourselfMostValuable'),
      t('motivation.messages.howKindToYourselfToday'),
      t('motivation.messages.youAreMagnificentRemember'),
      t('motivation.messages.lovingYourselfBeautifulHabit'),
      t('motivation.messages.beAtPeaceYourselfToday'),
      t('motivation.messages.youAreSpecialRememberToday'),
      
      // Daha derin ve anlamlı mesajlar
      t('motivation.messages.acceptYourselfEnough'),
      t('motivation.messages.ifStrugglingTodayNormal'),
      t('motivation.messages.bePatientHealingTakesTime'),
      t('motivation.messages.existingTodayAlreadySuccess'),
      t('motivation.messages.lovingYourselfProcess'),
      t('motivation.messages.beHappySmallThingsGreat'),
      t('motivation.messages.loveYourselfWithoutJudgment'),
      t('motivation.messages.restStrongerTomorrow'),
      t('motivation.messages.showYourselfCompassion'),
      t('motivation.messages.discoveringYourselfPatience'),
      t('motivation.messages.ifTodayToughTomorrowBetter'),
      t('motivation.messages.believeInYourselfCanDoIt'),
      t('motivation.messages.takeSmallStepsToday'),
      
      // İlham verici
      t('motivation.messages.followYourDreamsOneMoreStep'),
      t('motivation.messages.successPreparationOpportunity'),
      t('motivation.messages.everyDayNewBeginningWhat'),
      t('motivation.messages.yourStoryMagnificentWhichChapter'),
      t('motivation.messages.yourDreamsWillComeTrue'),
      t('motivation.messages.youAreStarShineToday'),
      t('motivation.messages.noSuchThingAsImpossible'),
      
      // Felsefi ve derin
      t('motivation.messages.noticeBeautyOfMoment'),
      t('motivation.messages.yourThoughtsChangeWorld'),
      t('motivation.messages.truePowerKnowingYourself'),
      t('motivation.messages.continueDiscoveringYourself'),
      t('motivation.messages.everyMomentTeacher'),
      t('motivation.messages.youAreArtistMostBeautiful'),
      
      // Eğlenceli ve neşeli
      t('motivation.messages.dontForgetHaveFun'),
      t('motivation.messages.smileMostBeautifulMakeup'),
      t('motivation.messages.spreadPositiveEnergy'),
      t('motivation.messages.lifeGameHowPlay'),
      t('motivation.messages.youAreSuperhero'),
      
      // Spritüel ve huzurlu
      t('motivation.messages.findPeaceWithin'),
      t('motivation.messages.beAtPeaceToday'),
      t('motivation.messages.yourSoulBeautifulNourish'),
      t('motivation.messages.youAreLightShineToday'),
      
      // Daha fazla genel motivasyon
      t('motivation.messages.trustYourselfTodayAmazing'),
      t('motivation.messages.everyDayChanceHowUse'),
      t('motivation.messages.youAreValuableRememberToday'),
      t('motivation.messages.celebrateYourselfTodaySuccessful'),
      t('motivation.messages.everyDayGiftHowOpen'),
      t('motivation.messages.youAreStrongShowToday'),
      t('motivation.messages.thinkPositiveTodayBeautiful'),
      
      // Cesaret ve güç - artık hardcoded Türkçe mesajlar
      'Bugün de gülümse! Hayat güzel! 😊',
      'Sen cesursun! Bugün de bunu göster! 🦁',
      'Her zorluk bir fırsat! Bugün ne öğreneceksin? 🌱',
      'Sen güçlüsün! Bugün de bunu kanıtla! ⚡',
      'Bugün de kendine inan! Sen harikasın! 🌟',
      'Her gün bir zafer! Bugün hangi zaferi kazanacaksın? 🏆',
      'Sen bir savaşçısın! Bugün de mücadele et! ⚔️',
      'Bugün de kendini aş! Sen sınırlarını zorlayabilirsin! 🚀',
      'Her gün bir macera! Bugün ne keşfedeceksin? 🗺️',
      
      // Sevgi ve şefkat
      'Kendini sevmek en önemli! Bugün de sev! 💕',
      'Sen değerlisin! Bugün de bunu hatırla! 💎',
      'Bugün de kendine nazik ol! Sen özelsin! 🤗',
      'Her gün bir sevgi! Bugün kime vereceksin? 💝',
      'Sen güzelsin! Bugün de bunu yaşa! 🌺',
      'Bugün de kendinle barışık ol! Sen huzurlusun! 🕊️',
      'Her gün bir öpücük! Bugün kendine ver! 💋',
      'Sen muhteşemsin! Bugün de bunu hatırla! ✨',
      
      // Eğlence ve neşe
      'Bugün de gülümse! Hayat güzel! 😊',
      'Her gün bir parti! Bugün nasıl kutlayacaksın? 🎉',
      'Sen eğlencelisin! Bugün de bunu göster! 🎪',
      'Bugün de neşeli ol! Sen mutlusun! 😄',
      'Her gün bir dans! Bugün nasıl dans edeceksin? 💃',
      'Sen komiksin! Bugün de güldür! 😂',
      'Bugün de pozitif ol! Sen enerjiksin! ⚡',
      'Her gün bir şarkı! Bugün hangi şarkıyı söyleyeceksin? 🎵',
      
      // Başarı ve hedefler
      'Sen başarılısın! Bugün de bunu göster! 🏆',
      'Her gün bir hedef! Bugün hangi hedefe ulaşacaksın? 🎯',
      'Bugün de kendini aş! Sen sınırsızsın! 🚀',
      'Sen bir şampiyonsun! Bugün de bunu kanıtla! 👑',
      'Her gün bir zafer! Bugün hangi zaferi kazanacaksın? 🏅',
      'Bugün de mükemmel ol! Sen harikasın! 💫',
      'Sen bir lider! Bugün de yönet! 👑',
      'Her gün bir başarı! Bugün ne başaracaksın? 🌟',
      
      // Mod yükseltici ve özgüven getirici
      'Sen muhteşemsin! Bugün de bunu hatırla! 🌟',
      'Kendine güven! Sen harikasın! 💎',
      'Sen özel birisin! Bugün de bunu yaşa! ✨',
      'İçindeki güçü hisset! Sen süper güçlüsün! ⚡',
      'Sen bir yıldızsın! Bugün de parla! ⭐',
      'Kendine inan! Sen başarabilirsin! 💪',
      'Sen değerlisin! Bugün de bunu hatırla! 💖',
      'Sen güçlüsün! Bugün de bunu göster! 🦁',
      'Sen cesursun! Bugün de bunu kanıtla! 🦸‍♀️',
      'Sen özelsin! Bugün de bunu yaşa! 🌈',
      'Sen harikasın! Bugün de bunu hatırla! 🎉',
      'Sen mükemmelsin! Bugün de bunu bil! 💫',
      'Sen bir şampiyonsun! Bugün de bunu göster! 🏆',
      'Sen bir lider! Bugün de yönet! 👑',
      'Sen bir süper kahramansın! Bugün de bunu hatırla! 🦸‍♂️',
      
      // Sabah için özel mesajlar
      'Günaydın! Bugün de kendini dinlemeye hazır mısın? 🎧',
      'Yeni güne nazik başla! Sen değerlisin! 💙',
      'Bugün kendin için ne yapmak istiyorsun? 🎯',
      'Günaydın! Bugün de kendine şefkatli ol! 🤗',
      'Yeni gün, yeni şanslar! Bugün nasıl geçirmek istiyorsun? 🌅',
      'Bugün de kendini kabul et! Sen yeterlisin! ✨',
      'Günaydın! Bugün de küçük adımlarla ilerle! 👣',
      'Yeni güne güvenle başla! Sen harikasın! 💪',
      
      // Öğlen için özel mesajlar
      'Günün yarısı geçti! Kendini nasıl hissediyorsun? 🤔',
      'Öğle molanda kendini dinle! İhtiyacın olan ne? 🎧',
      'Bugün kendin için ne yaptın? Küçük şeyler de değerli! 💎',
      'Gün ortasında dur! Kendini nasıl besleyeceksin? 🌱',
      'Öğlen molanda kendine nazik ol! Sen yoruldun! 😌',
      'Bugün kendinle nasıl konuşuyorsun? Sevgiyle mi? 💕',
      'Gün ortasında kendini hatırla! Sen önemlisin! 🌟',
      'Öğle molanda kendini güçlendir! Sen harikasın! ⚡',
      
      // Akşam için özel mesajlar
      'Günün nasıl geçti? Kendini nasıl hissettin? 🌅',
      'Bugünü değerlendir! Kendine ne kadar nazik davrandın? 🤗',
      'Akşamda kendinle barışık ol! Sen yeterlisin! 🕊️',
      'Bugün kendin için ne yaptın? Her şey değerli! 💝',
      'Günün sonunda kendini dinle! İhtiyacın olan ne? 🎧',
      'Bugünü kabul et! Yarın daha iyi olacak! 🌅',
      'Akşamda kendine şefkat göster! Sen değerlisin! 💙',
      'Günün sonunda kendinle barışık ol! Sen harikasın! ✨',
      'Bugünü kutla! Sen başardın! 🎊',
      
      // Yeni çeşitli mesajlar (i18n)
      t('motivation.messages.todayNewChapter'),
      t('motivation.messages.yourJourneyUnique'),
      t('motivation.messages.innerWisdomGuide'),
      t('motivation.messages.everyEmotionValid'),
      t('motivation.messages.selfCareNotSelfish'),
      t('motivation.messages.progressNotPerfection'),
      t('motivation.messages.yourVoiceMatters'),
      t('motivation.messages.healingTakesTime'),
      t('motivation.messages.youAreEnoughToday'),
      t('motivation.messages.smallWinsMatter'),
      t('motivation.messages.yourStoryWorthTelling'),
      t('motivation.messages.growthInDiscomfort'),
      t('motivation.messages.selfLoveDailyPractice'),
      t('motivation.messages.yourEnergyPrecious'),
      t('motivation.messages.restIsProductive'),
      t('motivation.messages.comparisonThief'),
      t('motivation.messages.mistakesAreTeachers'),
      t('motivation.messages.gratitudeShiftsPerspective'),
      t('motivation.messages.yourPresenceGift'),
      t('motivation.messages.authenticityYourPower'),
      t('motivation.messages.boundariesAreLove'),
      t('motivation.messages.youDeserveHappiness'),
      t('motivation.messages.yourIntuitionWise'),
      t('motivation.messages.vulnerabilityStrength'),
      t('motivation.messages.selfCompassionFirst'),
      t('motivation.messages.yourPacePerfect'),
      t('motivation.messages.celebrateProgress'),
      t('motivation.messages.youAreResilient'),
      t('motivation.messages.mindfulnessPresent'),
      t('motivation.messages.yourDreamsValid'),
      t('motivation.messages.selfAcceptanceFreedom'),
      t('motivation.messages.youAreNotAlone'),
      t('motivation.messages.yourFeelingsReal'),
      t('motivation.messages.kindnessStartsWithin'),
      t('motivation.messages.youAreGrowing'),
      t('motivation.messages.patienceWithYourself'),
      t('motivation.messages.yourLightShines'),
      t('motivation.messages.selfTalkMatters'),
      t('motivation.messages.youAreWorthy'),
      t('motivation.messages.restRecharges'),
      t('motivation.messages.yourPathUnique'),
      t('motivation.messages.selfLoveRadiates'),
      t('motivation.messages.youAreBraveEnough'),
      t('motivation.messages.gratitudeMultiplies'),
      t('motivation.messages.yourStoryEvolving'),
      t('motivation.messages.selfCarePriority'),
      t('motivation.messages.youAreEnoughAlways'),
      t('motivation.messages.progressOverPerfection'),
    ];
    
    // Ruh haline göre mesaj seç
    const todayMood = getTodayMood();
    const moodValue = todayMood && typeof todayMood === 'object' && 'value' in todayMood ? todayMood.value : 3;
    
    let selectedMessages = messages;
    
    if (moodValue >= 5) {
      // Harika ruh hali - çok pozitif mesajlar (i18n)
      selectedMessages = [
        t('motivation.messages.youAreAmazing'),
        t('motivation.messages.youAreStarShineToday'),
        t('motivation.messages.followYourDreamsOneMoreStep'),
        t('motivation.messages.believeInYourselfCanDoIt'),
        t('motivation.messages.successPreparationOpportunity'),
        t('motivation.messages.todayBeautiful'),
        t('motivation.messages.youAreMagnificentRemember'),
      ];
    } else if (moodValue === 4) {
      // Mutlu ruh hali - pozitif mesajlar (i18n)
      selectedMessages = [
        t('motivation.messages.todayBeautiful'),
        t('motivation.messages.youAreAmazing'),
        t('motivation.messages.believeInYourself'),
        t('motivation.messages.loveYourself'),
        t('motivation.messages.youAreSuccessful'),
        t('motivation.messages.thinkPositiveTodayBeautiful'),
        t('motivation.messages.youAreMagnificentRemember'),
      ];
    } else if (moodValue === 3) {
      // Yorgun ruh hali - dinlenme mesajları
      selectedMessages = [
        t('motivation.messages.ifTodayTough'),
        t('motivation.messages.restTodayTomorrowBetter'),
        t('motivation.messages.justBreathingEnough'),
        t('motivation.messages.beCompassionateToYourself'),
        t('motivation.messages.restStrongerTomorrow'),
        t('motivation.messages.valuableNoMatterMood'),
        t('motivation.messages.notSameEnergyEveryDay'),
      ];
    } else if (moodValue <= 2) {
      // Düşük ruh hali - destekleyici mesajlar
      selectedMessages = [
        t('motivation.messages.ifTodayTough'),
        t('motivation.messages.everyDayDifferent'),
        t('motivation.messages.listenToYourself'),
        t('motivation.messages.evenSmallSteps'),
        t('motivation.messages.difficultTimesTemporary'),
        t('motivation.messages.beCompassionateToYourself'),
        t('motivation.messages.justBreathingEnough'),
        t('motivation.messages.restTodayTomorrowBetter'),
        t('motivation.messages.valuableNoMatterMood'),
        t('motivation.messages.acceptYourselfWithoutJudgment'),
        t('motivation.messages.beHappySmallThings'),
        t('motivation.messages.giveYourselfTime'),
        t('motivation.messages.justExistingEnough'),
      ];
    }
    
    const randomIndex = Math.floor(Math.random() * selectedMessages.length);
    return selectedMessages[randomIndex];
  };


  // Premium minimalist tema sistemi - artık direkt kullanabiliriz
  const currentThemeColors = currentTheme;
  
  // iPad için responsive değerler
  const horizontalMargin = isIPad() ? getHorizontalPadding() : 20;
  const horizontalPadding = isIPad() ? getHorizontalPadding() : 20;

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentThemeColors.background, // Pastel taban
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
    },
    scrollContainer: {
      backgroundColor: currentThemeColors.background, // Tema arka plan rengi
    },
    scrollContent: {
      paddingBottom: 120,
    },
    header: {
      paddingHorizontal: horizontalPadding,
      paddingTop: 50,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 32,
      fontFamily: 'BodoniModa_700Bold',
      color: currentThemeColors.text, // Yüksek kontrast
      marginBottom: 8,
      letterSpacing: 1,
    },
    headerSubtitle: {
      fontSize: 16,
      fontFamily: 'Poppins_400Regular',
      color: currentThemeColors.muted, // Soft renk
      lineHeight: 24,
      marginBottom: 16,
      letterSpacing: 0.2,
    },
    userGreeting: {
      fontSize: 18,
      fontFamily: 'Poppins_600SemiBold',
      color: currentThemeColors.text,
      marginBottom: 4,
      letterSpacing: 0.3,
    },
    userEmail: {
      fontSize: 14,
      color: currentThemeColors.muted, // Soft renk
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: horizontalPadding,
      marginBottom: 20,
      marginTop: 16,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: currentThemeColors.card, // Beyaz kartlar
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      shadowColor: currentThemeColors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 0.5,
      borderColor: currentThemeColors.muted, // Soft border
      minHeight: 80,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: currentThemeColors.primary, // Canlı accent
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      color: currentThemeColors.muted, // Soft renk
      fontWeight: '500',
      textAlign: 'center',
    },
    miniProgressBar: {
      width: '100%',
      height: 4,
      backgroundColor: currentThemeColors.muted, // Soft progress bar
      borderRadius: 2,
      marginTop: 8,
      overflow: 'hidden',
    },
    miniProgressFill: {
      height: '100%',
      borderRadius: 2,
    },
    statBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      fontSize: 16,
    },
    wellnessScoreCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: horizontalMargin,
      marginBottom: 20,
      borderRadius: 20,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    wellnessScoreContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    wellnessScoreLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    wellnessScoreIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    wellnessScoreTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    wellnessScoreNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    wellnessScoreSubtitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    moodCard: {
      marginHorizontal: horizontalMargin,
      marginBottom: 40,
      borderRadius: 28,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 12,
      minHeight: 160,
      transform: [{ translateY: -4 }],
    },
    moodCardGradient: {
      borderRadius: 28,
      padding: 24,
      minHeight: 160,
    },
    // İlham Kartı Stilleri
    inspirationCard: {
      marginHorizontal: horizontalMargin,
      marginBottom: 32,
      borderRadius: 24,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
      transform: [{ translateY: -2 }],
      overflow: 'hidden',
    },
    inspirationGradient: {
      borderRadius: 24,
      padding: 24,
      minHeight: 140,
    },
    inspirationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    inspirationTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: currentTheme.colors.text,
      opacity: 0.8,
    },
    inspirationEmoji: {
      fontSize: 32,
      marginBottom: 12,
    },
    inspirationText: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      lineHeight: 28,
      marginBottom: 8,
    },
    inspirationAuthor: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
      fontStyle: 'italic',
      marginTop: 8,
    },
    refreshButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: currentTheme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    moodTitle: {
      fontSize: 24,
      fontFamily: 'Poppins_700Bold',
      color: currentTheme.colors.text,
      marginBottom: 12,
      letterSpacing: 0.8,
    },
    moodContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    recentMood: {
      fontSize: 32,
    },
    moodLabel: {
      fontSize: 16,
      fontFamily: 'Poppins_600SemiBold',
      color: currentTheme.colors.text,
    },
    moodSubtitle: {
      fontSize: 12,
      fontFamily: 'Poppins_400Regular',
      color: currentTheme.colors.text,
      opacity: 0.8,
      textAlign: 'center',
      marginTop: 8,
    },
    moodHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    moodBadge: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    moodBadgeText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 10,
      fontWeight: 'bold',
    },
    moodEmojiContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    moodEmojiContainerDefault: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 30,
      width: 60,
      height: 60,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
      borderStyle: 'dashed',
    },
    moodPlusIcon: {
      position: 'absolute',
      bottom: -5,
      right: -5,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
    },
    moodTextContainer: {
      flex: 1,
      marginLeft: 16,
      alignItems: 'flex-start',
    },
    moodActionContainer: {
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: currentTheme.colors.border,
      alignItems: 'center',
    },
    moodActionButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    moodActionText: {
      fontSize: 16,
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontWeight: '700',
      fontFamily: 'Poppins_700Bold',
      letterSpacing: 0.5,
    },
    motivationCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: horizontalMargin,
      marginBottom: 20,
      borderRadius: 28,
      padding: 24,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
      transform: [{ translateY: -2 }],
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: currentTheme.colors.primary + '20',
    },
    motivationTitle: {
      fontSize: 22,
      fontFamily: 'Poppins_700Bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
      letterSpacing: 1,
    },
    motivationMessage: {
      fontSize: 20,
      color: currentTheme.colors.text,
      lineHeight: 32,
      textAlign: 'center',
      fontFamily: 'DMSerifText_400Regular',
      letterSpacing: 0.5,
      opacity: 0.95,
    },
    // Insights Styles
    // Achievements Styles
    achievementsCard: {
      backgroundColor: currentTheme.colors.card + 'F8',
      marginHorizontal: horizontalMargin,
      marginBottom: 20,
      borderRadius: 28,
      padding: 24,
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
      transform: [{ translateY: -1 }],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#FFD700' + '15',
    },
    achievementsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    achievementsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      flex: 1,
    },
    achievementsIcon: {
      fontSize: 24,
      marginRight: 8,
    },
    achievementsStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    achievementStat: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: currentTheme.colors.background + 'F0',
      borderRadius: 16,
      padding: 12,
      minHeight: 80,
    },
    achievementStatNumber: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFD700',
      marginBottom: 6,
    },
    achievementStatLabel: {
      fontSize: 11,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 14,
      fontWeight: '500',
    },
    achievementsProgress: {
      marginTop: 8,
    },
    achievementsProgressText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    achievementsProgressBar: {
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    achievementsProgressFill: {
      height: '100%',
      backgroundColor: '#FFD700',
      borderRadius: 4,
    },
    achievementsButton: {
      backgroundColor: '#FFD700' + '15',
      borderWidth: 1,
      borderColor: '#FFD700' + '25',
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginTop: 12,
    },
    achievementsButtonText: {
      fontSize: 14,
      color: '#FFD700',
      fontWeight: '600',
    },
    promisesCard: {
      backgroundColor: currentTheme.colors.card + 'F8',
      marginHorizontal: horizontalMargin,
      marginBottom: 20,
      borderRadius: 28,
      padding: 24,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
      transform: [{ translateY: -1 }],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '15',
    },
    promisesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    promisesTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      flex: 1,
    },
    promisesIcon: {
      fontSize: 24,
      marginRight: 8,
    },
    promiseItem: {
      backgroundColor: currentTheme.colors.background + 'F0',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderLeftWidth: 3,
      borderLeftColor: currentTheme.colors.primary,
    },
    promiseEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    promiseText: {
      flex: 1,
      fontSize: 15,
      color: currentTheme.colors.text,
      fontWeight: '500',
      lineHeight: 22,
    },
    promisesButton: {
      backgroundColor: currentTheme.colors.primary + '15',
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '25',
      borderRadius: 20,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginTop: 8,
    },
    promisesButtonText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentThemeColors.text, // Yüksek kontrast
      marginBottom: 16,
    },
    insightCard: {
      backgroundColor: currentThemeColors.card, // Beyaz kartlar
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: currentThemeColors.muted, // Soft border
      borderLeftWidth: 3,
      shadowColor: currentThemeColors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    insightHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    insightIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    insightTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: currentTheme.colors.text,
      flex: 1,
    },
    insightDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
      marginLeft: 36,
    },
    // Tasks Styles
    tasksCard: {
      marginHorizontal: horizontalMargin,
      marginBottom: 80,
      borderRadius: 20,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
      transform: [{ translateY: -2 }],
    },
    tasksCardGradient: {
      borderRadius: 20,
      padding: 20,
    },
    tasksHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    tasksTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    tasksStatsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
      paddingVertical: 10,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    tasksStatItem: {
      alignItems: 'center',
      flex: 1,
    },
    tasksStatNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    tasksStatLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    tasksProgressContainer: {
      marginBottom: 16,
    },
    tasksProgressBar: {
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      marginBottom: 8,
    },
    tasksProgressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 4,
    },
    tasksProgressText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    tasksList: {
      gap: 8,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      position: 'relative',
    },
    taskTouchable: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    taskGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 12,
      backgroundColor: currentTheme.colors.primary,
      opacity: 0.1,
      zIndex: -1,
    },
    taskLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    taskEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    taskTitle: {
      fontSize: 16,
      color: currentTheme.colors.text,
      flex: 1,
    },
    taskCompleted: {
      textDecorationLine: 'line-through',
      color: currentTheme.colors.secondary,
    },
    taskCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    taskCheckboxCompleted: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    tasksMoreText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '500',
    },
    tasksEmpty: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    tasksEmptyText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 12,
    },
    tasksAddButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    tasksAddButtonText: {
      fontSize: 14,
      color: currentTheme.colors.background,
      fontWeight: '500',
    },
    // Reminders Styles
    remindersCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: horizontalMargin,
      marginBottom: 20,
      borderRadius: 20,
      padding: 18,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    remindersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    remindersTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    remindersList: {
      gap: 8,
    },
    reminderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    reminderEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    reminderContent: {
      flex: 1,
    },
    reminderTitle: {
      fontSize: 16,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    reminderTime: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    reminderPriority: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 8,
    },
    remindersMoreText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '500',
    },
    // Şirin Baloncuk Hatırlatıcılar 🎈
    remindersBubblesContainer: {
      marginHorizontal: horizontalMargin,
      marginBottom: 24,
    },
    remindersBubblesTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    bubbleScrollContainer: {
      paddingRight: 20,
      gap: 12,
    },
    reminderBubble: {
      width: 100,
      height: 120,
      borderRadius: 20,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    bubbleTime: {
      fontSize: 12,
      fontWeight: '700',
      color: currentTheme.colors.text,
      textAlign: 'center',
    },
    bubbleEmoji: {
      fontSize: 36,
      textAlign: 'center',
    },
    bubbleTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: currentTheme.colors.text,
      textAlign: 'center',
    },
    moreBubble: {
      width: 100,
      height: 120,
      borderRadius: 20,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.colors.accent,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
      borderStyle: 'dashed',
      gap: 8,
    },
    moreBubbleNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
    },
    moreBubbleText: {
      fontSize: 12,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
    },
    // Gelişmiş Sağlık Skoru Stilleri
    healthScoreCard: {
      marginHorizontal: horizontalMargin,
      marginTop: 20,
      marginBottom: 40,
      borderRadius: 28,
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 10,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      transform: [{ translateY: -3 }],
    },
    healthScoreCardGradient: {
      borderRadius: 28,
      padding: 24,
    },
    healthScoreHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    healthScoreHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    healthScoreTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    healthScoreSubtitle: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    healthScoreBadge: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    healthScoreBadgeNumber: {
      fontSize: 32,
      fontWeight: '900',
      color: currentTheme.colors.background,
    },
    healthScoreBadgeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.8)',
      marginLeft: 2,
    },
    healthCategoriesContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 20,
    },
    healthCategoryItem: {
      flex: 1,
      alignItems: 'center',
    },
    healthCategoryHeader: {
      alignItems: 'center',
      marginBottom: 8,
    },
    healthCategoryEmoji: {
      fontSize: 24,
      marginBottom: 4,
    },
    healthCategoryScore: {
      fontSize: 16,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    healthCategoryBar: {
      width: '100%',
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      marginBottom: 6,
      overflow: 'hidden',
    },
    healthCategoryBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    healthCategoryLabel: {
      fontSize: 11,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    healthScoreFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: currentTheme.colors.border,
    },
    healthScoreFooterText: {
      fontSize: 14,
      color: currentTheme.colors.text,
      fontWeight: '600',
    },
    // Modal Stilleri
    modalContainer: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    modalScroll: {
      flex: 1,
    },
    modalHeader: {
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 24,
      backgroundColor: currentTheme.colors.card,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    modalCloseButton: {
      position: 'absolute',
      top: 60,
      right: 20,
      zIndex: 10,
    },
    modalTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    modalHeaderScore: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    modalHeaderScoreNumber: {
      fontSize: 48,
      fontWeight: '900',
      color: currentTheme.colors.primary,
    },
    modalHeaderScoreLabel: {
      fontSize: 20,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
      marginLeft: 4,
    },
    modalSection: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    modalSectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    trendChartContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 16,
      height: 180,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    trendChartBar: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
    trendChartBarContainer: {
      width: '100%',
      height: 100,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 8,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    trendChartBarFill: {
      width: '100%',
      borderRadius: 8,
    },
    trendChartLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '600',
    },
    trendChartScore: {
      fontSize: 11,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    modalCategoryCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    modalCategoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    modalCategoryLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalCategoryEmoji: {
      fontSize: 28,
    },
    modalCategoryLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    modalCategoryScore: {
      fontSize: 18,
      fontWeight: '800',
      color: currentTheme.colors.primary,
    },
    modalCategoryBarContainer: {
      width: '100%',
      height: 10,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 5,
      marginBottom: 8,
      overflow: 'hidden',
    },
    modalCategoryBarFill: {
      height: '100%',
      borderRadius: 5,
    },
    modalCategoryStatus: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    modalRecommendationCard: {
      flexDirection: 'row',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: currentTheme.colors.primary,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    modalRecommendationIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    modalRecommendationContent: {
      flex: 1,
    },
    modalRecommendationTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 6,
    },
    modalRecommendationDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
    },
    modalAchievementsContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    modalAchievementCard: {
      flex: 1,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    modalAchievementIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    modalAchievementNumber: {
      fontSize: 24,
      fontWeight: '800',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    modalAchievementLabel: {
      fontSize: 11,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    // Wellness Redirect Stilleri
    wellnessRedirectCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1.5,
      borderColor: currentTheme.colors.primary + '30',
    },
    wellnessRedirectContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    wellnessRedirectLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 16,
    },
    wellnessRedirectIcons: {
      flexDirection: 'row',
      gap: 4,
    },
    wellnessRedirectIcon: {
      fontSize: 20,
    },
    wellnessRedirectTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    wellnessRedirectSubtitle: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
    },
    // Streak Modal Stilleri
    streakHeaderStats: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 16,
    },
    streakHeaderStatItem: {
      flex: 1,
      backgroundColor: currentTheme.colors.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    streakHeaderStatNumber: {
      fontSize: 32,
      fontWeight: '900',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    streakHeaderStatLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '600',
    },
    streakMessageCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    streakMessageText: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      textAlign: 'center',
      lineHeight: 26,
    },
    streakBadgeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    streakBadgeIcon: {
      fontSize: 40,
      marginRight: 16,
    },
    streakBadgeContent: {
      flex: 1,
    },
    streakBadgeTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    streakBadgeDesc: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    streakTipCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    streakTipIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    streakTipText: {
      fontSize: 14,
      color: currentTheme.colors.text,
      flex: 1,
    },
    streakGoalCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    streakGoalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    streakGoalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    streakGoalStatus: {
      fontSize: 14,
      fontWeight: '700',
      color: currentTheme.colors.primary,
    },
    streakGoalBar: {
      width: '100%',
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    streakGoalBarFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 4,
    },
  });

  const healthCategories = getHealthCategories();
  const healthTrend = getHealthTrend();
  const healthRecommendations = getHealthRecommendations();
  const streakBadges = getStreakBadges();

  const displayName = profile?.full_name || user?.displayName || user?.email || 'Sude';
  const greeting = getGreetingMessage(getUserTimezone(), currentLanguage as 'tr' | 'en');

  return (
    <>
      {/* Streak Modal */}
      <Modal
        visible={showStreakModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowStreakModal(false)}
      >
        <View style={dynamicStyles.modalContainer}>
          <ScrollView style={dynamicStyles.modalScroll}>
            {/* Modal Header */}
            <View style={dynamicStyles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowStreakModal(false);
                }}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={28} color={currentTheme.colors.text} />
              </TouchableOpacity>
              <Text style={dynamicStyles.modalTitle}>🔥 Seri Takibi</Text>
              <View style={dynamicStyles.streakHeaderStats}>
                <View style={dynamicStyles.streakHeaderStatItem}>
                  <Text style={dynamicStyles.streakHeaderStatNumber}>{getCurrentStreak()}</Text>
                  <Text style={dynamicStyles.streakHeaderStatLabel}>Güncel Seri</Text>
                </View>
                <View style={dynamicStyles.streakHeaderStatItem}>
                  <Text style={dynamicStyles.streakHeaderStatNumber}>{getLongestStreak()}</Text>
                  <Text style={dynamicStyles.streakHeaderStatLabel}>En Uzun Seri</Text>
                </View>
              </View>
      </View>

            {/* Motivasyon Mesajı */}
            <View style={dynamicStyles.modalSection}>
              <View style={dynamicStyles.streakMessageCard}>
                <Text style={dynamicStyles.streakMessageText}>{getStreakMessage()}</Text>
        </View>
        </View>

            {/* Rozetler */}
            {streakBadges.length > 0 && (
              <View style={dynamicStyles.modalSection}>
                <Text style={dynamicStyles.modalSectionTitle}>
                  🏆 {t('dashboard.earnedBadges')}
                </Text>
                {streakBadges.map((badge, index) => (
                  <View key={index} style={dynamicStyles.streakBadgeCard}>
                    <Text style={dynamicStyles.streakBadgeIcon}>{badge.icon}</Text>
                    <View style={dynamicStyles.streakBadgeContent}>
                      <Text style={dynamicStyles.streakBadgeTitle}>{badge.title}</Text>
                      <Text style={dynamicStyles.streakBadgeDesc}>{badge.desc}</Text>
        </View>
                    <Ionicons name="checkmark-circle" size={28} color={currentTheme.colors.primary} />
      </View>
                ))}
              </View>
            )}

            {/* İpuçları */}
            <View style={dynamicStyles.modalSection}>
              <Text style={dynamicStyles.modalSectionTitle}>💡 Seriyi Koruma İpuçları</Text>
              <View style={dynamicStyles.streakTipCard}>
                <Text style={dynamicStyles.streakTipIcon}>⏰</Text>
                <Text style={dynamicStyles.streakTipText}>{t('dashboard.writeDiarySameTime')}</Text>
            </View>
              <View style={dynamicStyles.streakTipCard}>
                <Text style={dynamicStyles.streakTipIcon}>📝</Text>
                <Text style={dynamicStyles.streakTipText}>Kısa da olsa bir şeyler yaz</Text>
          </View>
              <View style={dynamicStyles.streakTipCard}>
                <Text style={dynamicStyles.streakTipIcon}>🔔</Text>
                <Text style={dynamicStyles.streakTipText}>Hatırlatıcıları aktif et</Text>
        </View>
              <View style={dynamicStyles.streakTipCard}>
                <Text style={dynamicStyles.streakTipIcon}>💪</Text>
                <Text style={dynamicStyles.streakTipText}>Motivasyonunu yüksek tut!</Text>
              </View>
            </View>

            {/* Hedefler */}
            <View style={dynamicStyles.modalSection}>
              <Text style={dynamicStyles.modalSectionTitle}>🎯 Hedefler</Text>
              <View style={dynamicStyles.streakGoalCard}>
                <View style={dynamicStyles.streakGoalHeader}>
                  <Text style={dynamicStyles.streakGoalTitle}>{t('dashboard.threeDayGoal')}</Text>
                  <Text style={dynamicStyles.streakGoalStatus}>
                    {getCurrentStreak() >= 3 ? t('dashboard.completed') : `${getCurrentStreak()}/3`}
                  </Text>
            </View>
                <View style={dynamicStyles.streakGoalBar}>
                  <View 
                    style={[
                      dynamicStyles.streakGoalBarFill,
                      { width: `${Math.min((getCurrentStreak() / 3) * 100, 100)}%` }
                    ]}
                  />
          </View>
        </View>

              <View style={dynamicStyles.streakGoalCard}>
                <View style={dynamicStyles.streakGoalHeader}>
                  <Text style={dynamicStyles.streakGoalTitle}>{t('dashboard.sevenDayGoal')}</Text>
                  <Text style={dynamicStyles.streakGoalStatus}>
                    {getCurrentStreak() >= 7 ? t('dashboard.completed') : `${getCurrentStreak()}/7`}
                  </Text>
          </View>
                <View style={dynamicStyles.streakGoalBar}>
                  <View 
                    style={[
                      dynamicStyles.streakGoalBarFill,
                      { width: `${Math.min((getCurrentStreak() / 7) * 100, 100)}%` }
                    ]}
                  />
        </View>
              </View>

              <View style={dynamicStyles.streakGoalCard}>
                <View style={dynamicStyles.streakGoalHeader}>
                  <Text style={dynamicStyles.streakGoalTitle}>{t('dashboard.thirtyDayGoal')}</Text>
                  <Text style={dynamicStyles.streakGoalStatus}>
                    {getCurrentStreak() >= 30 ? t('dashboard.completed') : `${getCurrentStreak()}/30`}
        </Text>
                </View>
                <View style={dynamicStyles.streakGoalBar}>
                  <View 
                    style={[
                      dynamicStyles.streakGoalBarFill,
                      { width: `${Math.min((getCurrentStreak() / 30) * 100, 100)}%` }
                    ]}
                  />
                </View>
              </View>
      </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Detaylı Sağlık Skoru Modal */}
      <Modal
        visible={showHealthModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowHealthModal(false)}
      >
        <View style={dynamicStyles.modalContainer}>
          <ScrollView style={dynamicStyles.modalScroll}>
            {/* Modal Header */}
            <View style={dynamicStyles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowHealthModal(false);
                }}
                style={dynamicStyles.modalCloseButton}
              >
                <Ionicons name="close" size={28} color={currentTheme.colors.text} />
          </TouchableOpacity>
              <Text style={dynamicStyles.modalTitle}>🌟 Yaşam Haritası</Text>
              <View style={dynamicStyles.modalHeaderScore}>
                <Text style={dynamicStyles.modalHeaderScoreNumber}>{getWellnessScore()}</Text>
                <Text style={dynamicStyles.modalHeaderScoreLabel}>/100</Text>
              </View>
        </View>
        
            {/* Weekly Trend Chart */}
            <View style={dynamicStyles.modalSection}>
              <Text style={dynamicStyles.modalSectionTitle}>📈 {t('dashboard.weeklyTrend')}</Text>
              <View style={dynamicStyles.trendChartContainer}>
                {healthTrend.map((day, index) => (
                  <View key={index} style={dynamicStyles.trendChartBar}>
                    <View style={dynamicStyles.trendChartBarContainer}>
            <View 
              style={[
                          dynamicStyles.trendChartBarFill,
                          { 
                            height: `${day.score}%`,
                            backgroundColor: day.isToday ? currentTheme.colors.primary : currentTheme.colors.secondary
                          }
              ]} 
            />
          </View>
                    <Text style={[
                      dynamicStyles.trendChartLabel,
                      day.isToday && { color: currentTheme.colors.primary, fontWeight: 'bold' }
                    ]}>
                      {day.day}
          </Text>
                    <Text style={dynamicStyles.trendChartScore}>{day.score}</Text>
                  </View>
                ))}
              </View>
        </View>

            {/* Wellness Takibi Yönlendirme */}
            <View style={dynamicStyles.modalSection}>
              <Text style={dynamicStyles.modalSectionTitle}>💪 Wellness Takibi</Text>
                <TouchableOpacity
                style={dynamicStyles.wellnessRedirectCard}
                onPress={() => {
                  setShowHealthModal(false);
                  navigation.navigate('WellnessTracking' as never);
                }}
              >
                <View style={dynamicStyles.wellnessRedirectContent}>
                  <View style={dynamicStyles.wellnessRedirectLeft}>
                    <View style={dynamicStyles.wellnessRedirectIcons}>
                      <Text style={dynamicStyles.wellnessRedirectIcon}>💧</Text>
                      <Text style={dynamicStyles.wellnessRedirectIcon}>😴</Text>
                      <Text style={dynamicStyles.wellnessRedirectIcon}>🏃</Text>
                      <Text style={dynamicStyles.wellnessRedirectIcon}>🧘</Text>
                    </View>
                    <View>
                      <Text style={dynamicStyles.wellnessRedirectTitle}>Detaylı Wellness Takibi</Text>
                      <Text style={dynamicStyles.wellnessRedirectSubtitle}>Su, uyku, egzersiz ve daha fazlası</Text>
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={24} color={currentTheme.colors.primary} />
                </View>
              </TouchableOpacity>
            </View>


            {/* Kategori Detayları */}
            <View style={dynamicStyles.modalSection}>
              <Text style={dynamicStyles.modalSectionTitle}>📊 Kategori Detayları</Text>
              {healthCategories.map((cat, index) => (
                <View key={index} style={dynamicStyles.modalCategoryCard}>
                  <View style={dynamicStyles.modalCategoryHeader}>
                    <View style={dynamicStyles.modalCategoryLeft}>
                      <Text style={dynamicStyles.modalCategoryEmoji}>{cat.emoji}</Text>
                      <Text style={dynamicStyles.modalCategoryLabel}>{cat.label}</Text>
                    </View>
                    <Text style={dynamicStyles.modalCategoryScore}>{cat.score}/100</Text>
                  </View>
                  <View style={dynamicStyles.modalCategoryBarContainer}>
                    <View 
                      style={[
                        dynamicStyles.modalCategoryBarFill,
                        { width: `${cat.score}%`, backgroundColor: cat.color }
                      ]}
                    />
                  </View>
                  <Text style={dynamicStyles.modalCategoryStatus}>
                    {cat.score >= 80 ? '🎉 Mükemmel!' :
                     cat.score >= 60 ? '👍 İyi!' :
                     cat.score >= 40 ? '🌱 Gelişiyor' :
                     '💪 Gelişme Alanı'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Öneriler */}
            <View style={dynamicStyles.modalSection}>
              <Text style={dynamicStyles.modalSectionTitle}>💡 Kişiselleştirilmiş Öneriler</Text>
              {healthRecommendations.map((rec, index) => (
                <View key={index} style={dynamicStyles.modalRecommendationCard}>
                  <Text style={dynamicStyles.modalRecommendationIcon}>{rec.icon}</Text>
                  <View style={dynamicStyles.modalRecommendationContent}>
                    <Text style={dynamicStyles.modalRecommendationTitle}>{rec.title}</Text>
                    <Text style={dynamicStyles.modalRecommendationDescription}>{rec.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Başarılar */}
            <View style={dynamicStyles.modalSection}>
              <Text style={dynamicStyles.modalSectionTitle}>
                🏆 {t('dashboard.myAchievements')}
              </Text>
              <View style={dynamicStyles.modalAchievementsContainer}>
                <View style={dynamicStyles.modalAchievementCard}>
                  <Text style={dynamicStyles.modalAchievementIcon}>📔</Text>
                  <Text style={dynamicStyles.modalAchievementNumber}>{entries.length}</Text>
                  <Text style={dynamicStyles.modalAchievementLabel}>{t('dashboard.dailyLabel')}</Text>
                </View>
                <View style={dynamicStyles.modalAchievementCard}>
                  <Text style={dynamicStyles.modalAchievementIcon}>🔥</Text>
                  <Text style={dynamicStyles.modalAchievementNumber}>{getCurrentStreak()}</Text>
                  <Text style={dynamicStyles.modalAchievementLabel}>{t('dashboard.dayStreak')}</Text>
                </View>
                <View style={dynamicStyles.modalAchievementCard}>
                  <Text style={dynamicStyles.modalAchievementIcon}>✅</Text>
                  <Text style={dynamicStyles.modalAchievementNumber}>{todayCompletedCount}</Text>
                  <Text style={dynamicStyles.modalAchievementLabel}>{t('dashboard.completedLabel')}</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

    <SafeAreaView style={dynamicStyles.container}>
      <View style={[
        dynamicStyles.contentWrapper,
        isIPad() && {
          maxWidth: getMaxContentWidth(),
          alignSelf: 'center',
          width: '100%',
        }
      ]}>
        <ScrollView 
          ref={scrollViewRef}
          style={dynamicStyles.scrollContainer}
          contentContainerStyle={dynamicStyles.scrollContent}
          showsVerticalScrollIndicator={true}
          scrollEnabled={!tour.tourVisible}
          nestedScrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          bounces={!tour.tourVisible}
        >
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>
          {replaceAppName(t('dashboard.welcomeBack') || t('dashboard.welcome'), user?.appAlias || 'Rhythm')} 🌟
        </Text>
        <Text style={dynamicStyles.headerSubtitle}>
          {t('dashboard.headerSubtitle')}
        </Text>
        <Text style={dynamicStyles.userGreeting}>
          {replaceNickname(greeting, user?.nickname || displayName)}
        </Text>
        <Text style={dynamicStyles.userEmail}>{t('dashboard.howAreYou')}</Text>
      </View>

      {/* Today's Mood */}
      <Animated.View
        style={{
          opacity: fadeAnims.mood,
          transform: [{ scale: Animated.multiply(scaleAnims.mood, pulseAnims.mood) }],
        }}
      >
          <View style={[
            dynamicStyles.moodCard,
            {
              backgroundColor: currentTheme.colors.card,
              borderWidth: 1,
              borderColor: currentTheme.colors.border,
            },
          ]}>
          <View
            style={[
              dynamicStyles.moodCardGradient,
              (getTodayMood() as any)?.isDefault && { 
                opacity: 0.95,
                borderWidth: 2,
                borderColor: currentTheme.colors.primary,
                borderStyle: 'dashed'
              }
            ]}
          >
        <View style={dynamicStyles.moodHeader}>
          <Text style={dynamicStyles.moodTitle}>
            {t('dashboard.expressYourself')}
                    </Text>
                  </View>
        
        <View style={dynamicStyles.moodContent}>
                  <View style={[
            dynamicStyles.moodEmojiContainer,
            dynamicStyles.moodEmojiContainerDefault
                  ]}>
            <Text style={dynamicStyles.recentMood}>✍️</Text>
                  </View>
          <View style={dynamicStyles.moodTextContainer}>
            <Text style={dynamicStyles.moodLabel}>
              {t('dashboard.captureThisMomentLabel')}
              </Text>
            <Text style={dynamicStyles.moodSubtitle}>
              {t('dashboard.yourThoughtsYourStory')}
            </Text>
          </View>
        </View>
        
        <View style={dynamicStyles.moodActionContainer}>
            <TouchableOpacity 
            style={dynamicStyles.moodActionButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              animateCardPress('mood');
              navigation.navigate('WriteDiaryStep1' as never);
            }}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.moodActionText}>
              <Ionicons name="create-outline" size={18} color={currentTheme.colors.primary} />
              {' '}{t('diary.writeDiary')}
            </Text>
            </TouchableOpacity>
          </View>
      </View>
        </View>
      </Animated.View>

      {/* Nefes Egzersizi Hızlı Butonu */}
      <Animated.View
        style={{
          opacity: fadeAnims.motivation,
          transform: [{
            scale: fadeAnims.motivation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            })
          }]
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: currentTheme.colors.card,
            marginHorizontal: horizontalMargin,
            marginBottom: 20,
            borderRadius: 20,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: currentTheme.colors.primary + '20',
            shadowColor: currentTheme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Mindfulness' as never);
          }}
          activeOpacity={0.8}
        >
          <Text style={{
            fontSize: 17,
            fontWeight: '700',
            color: currentTheme.colors.primary,
            letterSpacing: 0.3,
          }}>
            {t('settings.breathingExerciseQuick')}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Motivation Message (hide for first-time until welcome dismissed) */}
      {(!showWelcomeModal && hasSeenWelcome) && (
      <Animated.View
        style={{
          opacity: fadeAnims.motivation,
          transform: [{
            scale: Animated.multiply(
              fadeAnims.motivation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
              pulseAnims.motivation
            )
          }]
        }}
      >
        <View style={[
          dynamicStyles.motivationCard,
          {
            backgroundColor: currentTheme.colors.card,
            borderWidth: 1,
            borderColor: currentTheme.colors.border,
          }
        ]}>
            <Text style={dynamicStyles.motivationTitle}>
              {t('dashboard.dailyReflectionLabel')}
            </Text>
            <Text style={dynamicStyles.motivationMessage}>
              {getMotivationMessage()}
            </Text>
          </View>
      </Animated.View>
      )}

      {/* Personality Card */}
      <PersonalityCard />

      {/* Achievements Card */}
      <Animated.View
        style={{
          opacity: fadeAnims.insights,
          transform: [{
            scale: fadeAnims.insights.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            })
          }]
        }}
      >
        <TouchableOpacity
          style={dynamicStyles.achievementsCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Achievements');
          }}
          activeOpacity={0.8}
        >
          <View style={dynamicStyles.achievementsHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={dynamicStyles.achievementsIcon}>🏆</Text>
              <Text style={dynamicStyles.achievementsTitle}>
                {t('dashboard.myAchievements')}
              </Text>
                </View>
            <Ionicons name="chevron-forward" size={20} color={currentTheme.colors.secondary} />
              </View>

          <View style={dynamicStyles.achievementsStats}>
            <View style={dynamicStyles.achievementStat}>
              <Text style={dynamicStyles.achievementStatNumber}>
                {getAchievementStats().unlocked}
              </Text>
              <Text style={dynamicStyles.achievementStatLabel}>
                {t('dashboard.earned')}
              </Text>
          </View>
            <View style={dynamicStyles.achievementStat}>
              <Text style={dynamicStyles.achievementStatNumber}>
                {getAchievementStats().total}
              </Text>
              <Text style={dynamicStyles.achievementStatLabel}>
                {t('dashboard.total')}
              </Text>
        </View>
            <View style={dynamicStyles.achievementStat}>
              <Text style={dynamicStyles.achievementStatNumber}>
                {Math.round(getAchievementStats().completionRate)}%
              </Text>
              <Text style={dynamicStyles.achievementStatLabel}>
                {t('dashboard.completion')}
              </Text>
            </View>
          </View>

          <View style={dynamicStyles.achievementsProgress}>
            <Text style={dynamicStyles.achievementsProgressText}>
              {getAchievementStats().unlocked} / {getAchievementStats().total} {t('dashboard.badgesEarned')}
            </Text>
            <View style={dynamicStyles.achievementsProgressBar}>
              <View 
                style={[
                  dynamicStyles.achievementsProgressFill,
                  { width: `${getAchievementStats().completionRate}%` }
                ]} 
              />
        </View>
          </View>

              <TouchableOpacity
            style={dynamicStyles.achievementsButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('Achievements');
            }}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.achievementsButtonText}>
              {t('dashboard.seeAllAchievements')} 🏆
                  </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>

      {/* Promises Widget */}
      {getActivePromises().length > 0 && (
        <Animated.View
          style={{
            opacity: fadeAnims.insights,
            transform: [{
              scale: fadeAnims.insights.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              })
            }]
          }}
        >
          <TouchableOpacity
            style={dynamicStyles.promisesCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('DreamsGoals');
            }}
            activeOpacity={0.8}
          >
            <View style={dynamicStyles.promisesHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={dynamicStyles.promisesIcon}>💫</Text>
                <Text style={dynamicStyles.promisesTitle}>
                  {t('dashboard.myPromises') || 'Kendine Verdiğin Sözler'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={currentTheme.colors.secondary} />
            </View>

            {getActivePromises().slice(0, 2).map((promise) => (
              <View key={promise.id} style={dynamicStyles.promiseItem}>
                <Text style={dynamicStyles.promiseEmoji}>{promise.emoji}</Text>
                <Text style={dynamicStyles.promiseText}>{promise.text}</Text>
              </View>
            ))}

            {getActivePromises().length > 2 && (
              <Text style={[dynamicStyles.promisesButtonText, { marginTop: 8, textAlign: 'center' }]}>
                +{getActivePromises().length - 2} {t('dashboard.morePromises') || 'daha fazla söz'}
              </Text>
            )}

            <TouchableOpacity
              style={dynamicStyles.promisesButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('DreamsGoals');
              }}
              activeOpacity={0.8}
            >
              <Text style={dynamicStyles.promisesButtonText}>
                {t('dashboard.seeAllPromises') || 'Tüm Sözleri Gör'} 💫
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}





        </ScrollView>
      </View>
    </SafeAreaView>

    {/* Hoşgeldin Modalı */}
    {showWelcomeModal && (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <Animated.View style={{
          backgroundColor: currentTheme.colors.card,
          borderRadius: 24,
          margin: 20,
          maxWidth: '90%',
          shadowColor: currentTheme.colors.shadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
          opacity: fadeAnims.welcome,
        }}>
          <View style={{ padding: 24, alignItems: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🎉</Text>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: currentTheme.colors.text,
                textAlign: 'center',
              }}>{replaceAppName(t('dashboard.welcomeBack') || t('dashboard.welcome'), user?.appAlias)}</Text>
            </View>
            
            <Text style={{
              fontSize: 16,
              color: currentTheme.colors.text,
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 20,
            }}>
              {t('dashboard.nowThisIsYourWorld')}{'\n\n'}
              {t('dashboard.yourRulesApply')}{'\n\n'}
              {t('dashboard.readyToDiscover')}
            </Text>
            
            <View style={{ width: '100%', marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 20, marginRight: 12, width: 24 }}>📝</Text>
                <Text style={{ fontSize: 14, color: currentTheme.colors.text, flex: 1 }}>{t('dashboard.writeDiaryListenSoul')}</Text>
          </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 20, marginRight: 12, width: 24 }}>🎯</Text>
                <Text style={{ fontSize: 14, color: currentTheme.colors.text, flex: 1 }}>{t('dashboard.trackYourGoals')}</Text>
      </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 20, marginRight: 12, width: 24 }}>💖</Text>
                <Text style={{ fontSize: 14, color: currentTheme.colors.text, flex: 1 }}>{t('dashboard.loveAndGrow')}</Text>
              </View>
            </View>
            
            {/* Ayarlara yönlendirme mesajı */}
            <View style={{
              backgroundColor: currentTheme.colors.primary + '15',
              borderRadius: 12,
              padding: 12,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: currentTheme.colors.primary + '30',
            }}>
              <Text style={{
                fontSize: 13,
                color: currentTheme.colors.text,
                textAlign: 'center',
                lineHeight: 18,
              }}>
                {t('dashboard.customizeInSettings')}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowWelcomeModal(false);
                setHasSeenWelcome(true);
                AsyncStorage.setItem('hasSeenWelcome', 'true').catch(() => {});
              }}
              style={{
                backgroundColor: currentTheme.colors.primary,
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 20,
                shadowColor: currentTheme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{
                color: currentTheme.colors.background,
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>{t('dashboard.greatLetsStart')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    )}

    {/* Tooltip */}
    {tooltipManager.currentTooltip && (
      <Tooltip
        tooltip={tooltipManager.currentTooltip}
        visible={tooltipManager.isVisible}
        onClose={tooltipManager.hideTooltip}
        onNext={tooltipManager.nextTooltip}
        targetPosition={tooltipManager.targetPosition}
      />
    )}

    {/* Motivation Card (hide for first-time until welcome dismissed) */}
    {(!showWelcomeModal && hasSeenWelcome) && (
      <MotivationCard 
        userId={user?.uid}
        autoShow={true}
        delay={3000}
      />
    )}

    {/* App Tour */}
    {tour.currentStep && (
      <AppTour
        visible={tour.tourVisible}
        currentStep={tour.currentTourStep}
        totalSteps={tour.totalSteps}
        step={tour.currentStep}
        onNext={tour.handleNext}
        onSkip={tour.handleSkip}
        onComplete={tour.handleComplete}
      />
    )}

    </>
  );
});

export default DashboardScreen;