import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../i18n/LanguageContext';
// import { useFont } from '../contexts/FontContext'; // Kaldırıldı
import { useDiary } from '../hooks/useDiary';
import { useProfile } from '../hooks/useProfile';
import { useTasks } from '../hooks/useTasks';
import { useReminders } from '../hooks/useReminders';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DiaryEntry } from '../types';
import { getAllInsights, Insight } from '../utils/insightsEngine';
import { 
  requestNotificationPermissions, 
  scheduleAllNotifications 
} from '../services/notificationService';

const { width } = Dimensions.get('window');

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

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useTranslation();
  // const { fontConfig } = useFont(); // Kaldırıldı
  const { entries } = useDiary(user?.uid);
  const { profile } = useProfile(user?.uid);
  const { 
    getTodayTasks, 
    getTodayCompletedCount, 
    getTodayCompletionRate, 
    toggleTaskCompletion,
    getCategoryById
  } = useTasks(user?.uid);
  const { getTodayReminders } = useReminders(user?.uid);

  const [insights, setInsights] = useState<Insight[]>([]);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    waterGlasses: 0,
    exerciseMinutes: 0,
    sleepHours: 0,
    meditationMinutes: 0,
    date: new Date().toISOString().split('T')[0],
  });
  
  // Animasyon state'leri
  const [animatingTasks, setAnimatingTasks] = useState<Set<string>>(new Set());
  const scaleAnimations = useRef<{[key: string]: Animated.Value}>({});
  const glowAnimations = useRef<{[key: string]: Animated.Value}>({});
  const checkmarkAnimations = useRef<{[key: string]: Animated.Value}>({});
  
  // Kart animasyonları
  const fadeAnims = useRef({
    health: new Animated.Value(0),
    mood: new Animated.Value(0),
    motivation: new Animated.Value(0),
    insights: new Animated.Value(0),
    tasks: new Animated.Value(0),
    welcome: new Animated.Value(0),
    reminders: new Animated.Value(0),
  }).current;

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
        await scheduleAllNotifications();
      }
    };

    initializeNotifications();
  }, []);

  // İçgörüleri hesapla
  useEffect(() => {
    if (entries.length > 0) {
      const allInsights = getAllInsights(entries);
      setInsights(allInsights.slice(0, 3)); // En önemli 3 içgörüyü göster
    }
  }, [entries]);

  // Wellness verilerini yükle
  useEffect(() => {
    loadTodayWellnessData();
  }, []);

  // İlk kullanıcı kontrolü - hoşgeldin mesajı
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const isFirstTime = await AsyncStorage.getItem('hasSeenWelcome');
        if (!isFirstTime) {
          // 1 saniye bekle ki sayfa yüklensin
          setTimeout(() => {
            setShowWelcomeModal(true);
            // Hoşgeldin modalının animasyonunu başlat
            Animated.timing(fadeAnims.welcome, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }).start();
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking first time user:', error);
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
    
    if (streak >= 3) badges.push({ icon: '🔥', title: '3 Günlük Ateş', desc: '3 gün üst üste yazdın!' });
    if (streak >= 7) badges.push({ icon: '🏆', title: 'Haftalık Şampiyon', desc: '7 gün üst üste yazdın!' });
    if (streak >= 14) badges.push({ icon: '⭐', title: '2 Haftalık Yıldız', desc: '14 gün üst üste yazdın!' });
    if (streak >= 30) badges.push({ icon: '💎', title: 'Aylık Elmas', desc: '30 gün üst üste yazdın!' });
    if (streak >= 100) badges.push({ icon: '👑', title: 'Yüzlük Kral', desc: '100 gün üst üste yazdın!' });
    if (longest >= 365) badges.push({ icon: '🌟', title: 'Yıllık Efsane', desc: '365 gün üst üste yazdın!' });
    
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
    
    
    // Günlük Skoru (İçerik kalitesi)
    const diaryScore = (() => {
      if (last7Days.length === 0) return 0;
      const avgLength = last7Days.reduce((sum, e) => sum + (e.content?.length || 0), 0) / last7Days.length;
      return Math.min(Math.round((avgLength / 500) * 100), 100); // 500+ karakter = 100 puan
    })();
    
    // Düzenlilik Skoru (Görev tamamlama)
    const regularityScore = todayCompletionRate;
    
    return [
      { emoji: '😊', label: 'Ruh Hali', score: moodScore, color: '#8B5CF6' },
      { emoji: '✍️', label: 'Günlük', score: diaryScore, color: '#F59E0B' },
      { emoji: '⚡', label: 'Düzenlilik', score: regularityScore, color: '#EF4444' },
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
            title: 'Ruh Halini İyileştir',
            description: 'Kendini daha iyi hissetmek için günlük yazarken pozitif anılarını hatırla.'
          });
        } else if (cat.label === 'Günlük') {
          recommendations.push({
            icon: '📝',
            title: 'Daha Detaylı Yaz',
            description: 'Düşüncelerini daha detaylı ifade et. Her şey önemli!'
          });
        } else if (cat.label === 'Düzenlilik') {
          recommendations.push({
            icon: '✅',
            title: 'Görevlerini Tamamla',
            description: 'Küçük adımlarla başla. Her tamamlanan görev seni güçlendirir!'
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

  const getTodayMood = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(entry => entry.date === today);
    
    const moodOptions = [
      { value: 0, label: 'Henüz Belirtilmedi', emoji: '📝' }, // Varsayılan
      { value: 1, label: 'Çok Kötü', emoji: '😢' },
      { value: 2, label: 'Kötü', emoji: '😔' },
      { value: 3, label: 'Normal', emoji: '😐' },
      { value: 4, label: 'İyi', emoji: '😊' },
      { value: 5, label: 'Çok İyi', emoji: '🤩' },
    ];
    
    if (!todayEntry) {
      return { ...moodOptions[0], isDefault: true }; // Varsayılan mood döndür
    }
    
    return moodOptions.find(mood => mood.value === todayEntry.mood);
  };

  const getMoodEmoji = (moodValue: number) => {
    const moodEmojis: { [key: number]: string } = {
      0: '📝',
      1: '😢',
      2: '😔',
      3: '😐',
      4: '😊',
      5: '🤩',
    };
    return moodEmojis[moodValue] || '📝';
  };

  const getMotivationMessage = () => {
    const messages = [
      // Genel motivasyon
      'Bugün de harika bir gün geçireceğini biliyorum! 🌟',
      'Her yeni gün yeni fırsatlar demek! Sen hazırsın! 🚀',
      'Bugün de kendini dinlemeye zaman ayır! 🎧',
      'Güne pozitif başla, güzel bitecek! ☀️',
      'Bugün kendin için bir şeyler yap! Sen değerlisin! 💎',
      'Bugünün en güzel anını yakalamaya hazır mısın? 📸',
      'Her gün bir hediye! Bugün nasıl kullanacaksın? 🎁',
      'Bugün de kendini sevmeye devam et! 💕',
      
      // Kişisel gelişim
      'Kendini keşfetmek en büyük macera! Sen bu maceradasın! 🗺️',
      'İçindeki hikayeyi dinle! O çok değerli! 📚',
      'Kendini tanımak, en büyük başarı! Sen bunu yapıyorsun! 🎯',
      'Geçmişini hatırla, geleceğini planla, bugünü yaşa! 🕰️',
      
      // Cesaret verici ve iyileştirici
      'Zorluklar seni güçlendirir! Bugün de büyüyorsun! 🌱',
      'Her gün bir fırsat! Bugün ne öğreneceksin? 🎓',
      'Sen değişimin kendisisin! Her gün yenileniyorsun! 🌀',
      'İçindeki güç, sandığından çok daha büyük! 💪',
      'Her zorluk, seni daha da güçlü yapar! 🛡️',
      'Bugün de kendine inan! Sen başarabilirsin! 🌟',
      'Değişim korkutucu olabilir, ama sen cesursun! 🦁',
      
      // Modu düşük insanlar için anlamlı mesajlar
      'Bugün zor geçiyorsa, bu normal! Sen güçlüsün! 💙',
      'Her gün aynı olmak zorunda değil! Bugün farklı olabilir! 🌈',
      'Kendini dinle! İhtiyacın olan şey ne? 🤗',
      'Bugün küçük adımlar atsan da yeter! Her adım değerli! 👣',
      'Zor zamanlar geçici! Sen kalıcısın! ⏳',
      'Kendine şefkatli ol! Sen insansın! 💝',
      'Bugün sadece nefes almak bile yeter! Sen iyisin! 🌬️',
      'Her gün aynı enerjide olmak zorunda değilsin! 🌀',
      'Bugün dinlen! Yarın daha iyi olacak! 😴',
      'Sen değerlisin, modun nasıl olursa olsun! 💎',
      'Kendini yargılamadan kabul et! Sen mükemmelsin! 🕊️',
      'Bugün küçük şeylerle mutlu ol! 🌸',
      'Her gün aynı olmak zorunda değil! Farklılık güzel! 🌺',
      'Kendine zaman ver! Her şey yerli yerine gelecek! ⏰',
      'Bugün sadece var olmak bile yeter! Sen özelsin! ✨',
      
      // Sevgili ve pozitif
      'Kendinle konuşmak, en değerli sohbet! 💬',
      'Bugün kendine ne kadar nazik davranacaksın? 🤗',
      'Sen muhteşemsin! Bugün de bunu hatırla! 🌈',
      'Kendini sevmek, en güzel alışkanlık! 💝',
      'Bugün de kendinle barışık ol! 🕊️',
      'Sen özel birisin! Bugün de bunu hatırla! ✨',
      
      // Daha derin ve anlamlı mesajlar
      'Kendini olduğun gibi kabul et! Sen yeterlisin! 🤲',
      'Bugün zorlanıyorsan, bu da normal! Herkes zorlanır! 💙',
      'Kendine sabırlı ol! İyileşme zaman alır! 🌱',
      'Bugün sadece var olmak bile bir başarı! Sen harikasın! 🌟',
      'Kendini sevmek bir süreç! Her gün biraz daha! 💕',
      'Bugün küçük şeylerle mutlu ol! Büyük mutluluklar orada! 🌸',
      'Kendini yargılamadan sev! Sen mükemmelsin! 🕊️',
      'Bugün dinlen! Yarın daha güçlü olacaksın! 😴',
      'Kendine şefkat göster! Sen değerlisin! 💝',
      'Bugün sadece nefes almak bile yeter! Sen iyisin! 🌬️',
      'Kendini keşfetmek sabır ister! Her gün biraz daha! 🔍',
      'Bugün zor geçiyorsa, yarın daha iyi olacak! 🌅',
      'Kendine inan! Sen başarabilirsin! 💪',
      'Bugün küçük adımlar at! Her adım değerli! 👣',
      
      // İlham verici
      'Hayallerinin peşinden git! Bugün bir adım daha! 🌟',
      'Başarı, hazırlık ve fırsatın buluşmasıdır! Sen hazırsın! 🎯',
      'Her gün yeni bir başlangıç! Bugün ne başlatacaksın? 🚀',
      'Senin hikayen muhteşem! Bugün hangi bölümü yazacaksın? 📖',
      'Hayallerin gerçek olacak! Bugün bir adım daha at! 🌠',
      'Sen bir yıldızsın! Bugün de parla! ⭐',
      'İmkansız diye bir şey yok! Sen kanıtlayacaksın! 🌈',
      
      // Felsefi ve derin
      'Anın güzelliğini fark et! Her an özel! 🕰️',
      'Düşüncelerin dünyayı değiştirir! Sen değiştiriyorsun! 🌍',
      'Gerçek güç, kendini tanımaktan gelir! 💎',
      'Bugün de kendini keşfetmeye devam et! 🔍',
      'Her an bir öğretmen! Bugün ne öğreneceksin? 📚',
      'Sen bir sanatçısın! Hayatın en güzel eserisin! 🎨',
      
      // Eğlenceli ve neşeli
      'Bugün de eğlenmeyi unutma! Hayat güzel! 🎉',
      'Gülümseme en güzel makyajdır! Bugün de gülümse! 😊',
      'Bugün de pozitif enerji yay! ⚡',
      'Hayat bir oyun! Bugün nasıl oynayacaksın? 🎮',
      'Sen bir süper kahramansın! Bugün kimi kurtaracaksın? 🦸‍♀️',
      
      // Spritüel ve huzurlu
      'İçindeki huzuru bul! O hep orada! 🕯️',
      'Bugün de kendinle barış içinde ol! ☮️',
      'Ruhun güzel! Onu beslemeye devam et! 🕊️',
      'Sen bir ışıksın! Bugün de parla! 💡',
      
      // Daha fazla genel motivasyon
      'Bugün de kendine güven! Sen harikasın! 🌟',
      'Her gün bir şans! Bugün nasıl kullanacaksın? 🎲',
      'Sen değerlisin! Bugün de bunu hatırla! 💎',
      'Bugün de kendini kutla! Sen başarılısın! 🎊',
      'Her gün bir hediye! Bugün nasıl açacaksın? 🎁',
      'Sen güçlüsün! Bugün de bunu göster! 💪',
      'Bugün de pozitif düşün! Her şey güzel olacak! 🌈',
      'Sen özelsin! Bugün de bunu yaşa! ✨',
      
      // Hayat felsefesi
      'Hayat güzel! Bugün de keyfini çıkar! 🌸',
      'Her gün yeni bir başlangıç! Bugün ne başlatacaksın? 🌅',
      'Sen değişimin kendisisin! Her gün yenileniyorsun! 🌀',
      'Bugün de kendini sev! Sen değerlisin! 💖',
      'Hayat bir yolculuk! Bugün hangi yolu seçeceksin? 🛤️',
      'Sen bir mucizesin! Bugün de bunu hatırla! 🌟',
      'Her gün bir öğretmen! Bugün ne öğreneceksin? 📚',
      'Bugün de kendine inan! Sen başarabilirsin! 🎯',
      
      // Cesaret ve güç
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
    ];
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };


  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 80,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      lineHeight: 24,
      marginBottom: 16,
    },
    userGreeting: {
      fontSize: 18,
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      marginTop: 16,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 0.5,
      borderColor: currentTheme.colors.border,
      minHeight: 80,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    miniProgressBar: {
      width: '100%',
      height: 4,
      backgroundColor: currentTheme.colors.border,
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
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
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
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 32,
      borderRadius: 20,
      padding: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      minHeight: 160,
    },
    moodTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 12,
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
      color: currentTheme.colors.text,
    },
    moodSubtitle: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
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
      color: 'white',
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
    moodActionText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    motivationCard: {
      backgroundColor: currentTheme.colors.accent,
      marginHorizontal: 20,
      marginBottom: 32,
      borderRadius: 20,
      padding: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 5,
      borderWidth: 1.5,
      borderColor: currentTheme.colors.primary + '20',
    },
    motivationTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    motivationMessage: {
      fontSize: 18,
      color: currentTheme.colors.text,
      lineHeight: 28,
      textAlign: 'center',
      fontWeight: '400',
      fontStyle: 'italic',
      letterSpacing: 0.5,
    },
    // Insights Styles
    insightsSection: {
      marginHorizontal: 20,
      marginBottom: 32,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    insightCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderLeftWidth: 3,
      shadowColor: currentTheme.colors.shadow,
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
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 32,
      borderRadius: 16,
      padding: 18,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
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
      paddingVertical: 12,
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
      color: 'white',
      fontWeight: '500',
    },
    // Reminders Styles
    remindersCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 32,
      borderRadius: 16,
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
    // Gelişmiş Sağlık Skoru Stilleri
    healthScoreCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 32,
      borderRadius: 20,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    healthScoreHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
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
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    healthScoreBadgeNumber: {
      fontSize: 32,
      fontWeight: '900',
      color: 'white',
    },
    healthScoreBadgeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.8)',
      marginLeft: 2,
    },
    healthCategoriesContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
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
      borderRadius: 16,
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
      borderRadius: 16,
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
      borderRadius: 16,
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
      borderRadius: 16,
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
      borderRadius: 16,
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
      borderRadius: 16,
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
      borderRadius: 16,
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
      borderRadius: 16,
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
                onPress={() => setShowStreakModal(false)}
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
                <Text style={dynamicStyles.modalSectionTitle}>🏆 Kazanılan Rozetler</Text>
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
                <Text style={dynamicStyles.streakTipText}>Her gün aynı saatte günlük yaz</Text>
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
                  <Text style={dynamicStyles.streakGoalTitle}>3 Günlük Hedef</Text>
                  <Text style={dynamicStyles.streakGoalStatus}>
                    {getCurrentStreak() >= 3 ? '✅ Tamamlandı!' : `${getCurrentStreak()}/3`}
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
                  <Text style={dynamicStyles.streakGoalTitle}>7 Günlük Hedef</Text>
                  <Text style={dynamicStyles.streakGoalStatus}>
                    {getCurrentStreak() >= 7 ? '✅ Tamamlandı!' : `${getCurrentStreak()}/7`}
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
                  <Text style={dynamicStyles.streakGoalTitle}>30 Günlük Hedef</Text>
                  <Text style={dynamicStyles.streakGoalStatus}>
                    {getCurrentStreak() >= 30 ? '✅ Tamamlandı!' : `${getCurrentStreak()}/30`}
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
                onPress={() => setShowHealthModal(false)}
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

            {/* Haftalık Trend Grafiği */}
            <View style={dynamicStyles.modalSection}>
              <Text style={dynamicStyles.modalSectionTitle}>📈 Haftalık Trend</Text>
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
              <Text style={dynamicStyles.modalSectionTitle}>🏆 Başarılarım</Text>
              <View style={dynamicStyles.modalAchievementsContainer}>
                <View style={dynamicStyles.modalAchievementCard}>
                  <Text style={dynamicStyles.modalAchievementIcon}>📔</Text>
                  <Text style={dynamicStyles.modalAchievementNumber}>{entries.length}</Text>
                  <Text style={dynamicStyles.modalAchievementLabel}>Günlük</Text>
                </View>
                <View style={dynamicStyles.modalAchievementCard}>
                  <Text style={dynamicStyles.modalAchievementIcon}>🔥</Text>
                  <Text style={dynamicStyles.modalAchievementNumber}>{getCurrentStreak()}</Text>
                  <Text style={dynamicStyles.modalAchievementLabel}>Gün Seri</Text>
                </View>
                <View style={dynamicStyles.modalAchievementCard}>
                  <Text style={dynamicStyles.modalAchievementIcon}>✅</Text>
                  <Text style={dynamicStyles.modalAchievementNumber}>{todayCompletedCount}</Text>
                  <Text style={dynamicStyles.modalAchievementLabel}>Tamamlanan</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

    <ScrollView 
      style={dynamicStyles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Hoş Geldin! 🌟</Text>
        <Text style={dynamicStyles.headerSubtitle}>
          Burası senin gizli dünyan - ruhunu dinlediğin, anlam bulduğun güvenli limanın. 
          Her kelime, her hissiyat burada değerli. Seni bekleyen hikayeler var.
        </Text>
        <Text style={dynamicStyles.userGreeting}>
          {t('dashboard.greeting', { name: profile?.full_name || user?.displayName || user?.email || 'User' })}
        </Text>
        <Text style={dynamicStyles.userEmail}>{t('dashboard.howAreYou')}</Text>
      </View>



      {/* Today's Mood */}
      <Animated.View
        style={{
          opacity: fadeAnims.mood,
          transform: [{
            scale: fadeAnims.mood.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            })
          }]
        }}
      >
        <TouchableOpacity
          style={[
            dynamicStyles.moodCard,
          (getTodayMood() as any)?.isDefault && { 
            opacity: 0.9,
            borderWidth: 2,
            borderColor: currentTheme.colors.primary,
            borderStyle: 'dashed'
          }
        ]}
        onPress={() => {
          if ((getTodayMood() as any)?.isDefault) {
            navigation.navigate('WriteDiaryStep1' as never);
          }
        }}
        activeOpacity={(getTodayMood() as any)?.isDefault ? 0.8 : 1}
        disabled={!(getTodayMood() as any)?.isDefault}
      >
        <View style={dynamicStyles.moodHeader}>
          <Text style={dynamicStyles.moodTitle}>
            {(getTodayMood() as any)?.isDefault ? '💭 Bugünkü Ruh Halin' : '🪄 Bugünkü Ruh Halin'}
          </Text>
          {(getTodayMood() as any)?.isDefault && (
            <View style={dynamicStyles.moodBadge}>
              <Text style={dynamicStyles.moodBadgeText}>Yeni</Text>
            </View>
          )}
        </View>
        
        <View style={dynamicStyles.moodContent}>
          <View style={[
            dynamicStyles.moodEmojiContainer,
            (getTodayMood() as any)?.isDefault && dynamicStyles.moodEmojiContainerDefault
          ]}>
            <Text style={dynamicStyles.recentMood}>{getTodayMood()?.emoji}</Text>
            {(getTodayMood() as any)?.isDefault && (
              <View style={dynamicStyles.moodPlusIcon}>
                <Ionicons name="add" size={16} color={currentTheme.colors.primary} />
              </View>
            )}
          </View>
          <View style={dynamicStyles.moodTextContainer}>
            <Text style={dynamicStyles.moodLabel}>{getTodayMood()?.label}</Text>
            {(getTodayMood() as any)?.isDefault && (
              <Text style={dynamicStyles.moodSubtitle}>
                Günlük yazarak ruh halini belirt
              </Text>
            )}
          </View>
        </View>
        
        {(getTodayMood() as any)?.isDefault && (
          <View style={dynamicStyles.moodActionContainer}>
            <Text style={dynamicStyles.moodActionText}>
              <Ionicons name="arrow-forward" size={16} color={currentTheme.colors.primary} />
              {' '}Günlük Yazmaya Başla
            </Text>
          </View>
        )}
        </TouchableOpacity>
      </Animated.View>

      {/* Motivation Message */}
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
        <View style={dynamicStyles.motivationCard}>
          <Text style={dynamicStyles.motivationTitle}>✨ Günün İlhamı</Text>
          <Text style={dynamicStyles.motivationMessage}>
            {getMotivationMessage()}
          </Text>
        </View>
      </Animated.View>




      {/* Insights Section */}
      {insights.length > 0 && (
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
          <View style={dynamicStyles.insightsSection}>
          <Text style={dynamicStyles.sectionTitle}>💡 Senin İçin İçgörüler</Text>
          {insights.map((insight, index) => (
            <View 
              key={index} 
              style={[
                dynamicStyles.insightCard,
                { borderLeftColor: insight.color }
              ]}
            >
              <View style={dynamicStyles.insightHeader}>
                <Text style={dynamicStyles.insightIcon}>{insight.icon}</Text>
                <Text style={dynamicStyles.insightTitle}>{insight.title}</Text>
              </View>
              <Text style={dynamicStyles.insightDescription}>
                {insight.description}
              </Text>
            </View>
          ))}
          </View>
        </Animated.View>
      )}

      {/* Daily Tasks */}
      <Animated.View
        style={{
          opacity: fadeAnims.tasks,
          transform: [{
            scale: fadeAnims.tasks.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            })
          }]
        }}
      >
        <View style={dynamicStyles.tasksCard}>
        <View style={dynamicStyles.tasksHeader}>
          <Text style={dynamicStyles.tasksTitle}>📋 {t('dashboard.dailyTasks')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks' as never)}>
            <Ionicons name="add-circle" size={24} color={currentTheme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Gelişmiş İstatistikler */}
        <View style={dynamicStyles.tasksStatsContainer}>
          <View style={dynamicStyles.tasksStatItem}>
            <Text style={dynamicStyles.tasksStatNumber}>{todayTasks.length}</Text>
            <Text style={dynamicStyles.tasksStatLabel}>{t('dashboard.totalTasks')}</Text>
          </View>
          <View style={dynamicStyles.tasksStatItem}>
            <Text style={dynamicStyles.tasksStatNumber}>{todayCompletedCount}</Text>
            <Text style={dynamicStyles.tasksStatLabel}>{t('dashboard.completedTasks')}</Text>
          </View>
          <View style={dynamicStyles.tasksStatItem}>
            <Text style={dynamicStyles.tasksStatNumber}>{todayCompletionRate}%</Text>
            <Text style={dynamicStyles.tasksStatLabel}>{t('dashboard.completionRate')}</Text>
          </View>
        </View>

        <View style={dynamicStyles.tasksProgressContainer}>
          <View style={dynamicStyles.tasksProgressBar}>
            <View 
              style={[
                dynamicStyles.tasksProgressFill, 
                { width: `${todayCompletionRate}%` }
              ]} 
            />
          </View>
          <Text style={dynamicStyles.tasksProgressText}>
            {todayCompletionRate === 100 ? '🎉 Tüm görevler tamamlandı!' : 
             todayCompletionRate >= 75 ? '🔥 Harika gidiyorsun!' :
             todayCompletionRate >= 50 ? '💪 Devam et!' :
             '🚀 Başlayalım!'}
          </Text>
        </View>

        {todayTasks.length > 0 ? (
          <View style={dynamicStyles.tasksList}>
            {todayTasks.slice(0, 3).map((task) => {
              const category = getCategoryById(task.category);
              const isAnimating = animatingTasks.has(task.id);
              const scaleAnim = scaleAnimations.current[task.id] || new Animated.Value(1);
              const glowAnim = glowAnimations.current[task.id] || new Animated.Value(0);
              
              return (
                <Animated.View
                  key={task.id}
                  style={[
                    dynamicStyles.taskItem,
                    {
                      transform: [{ scale: scaleAnim }],
                      shadowOpacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.1, 0.6],
                      }),
                      shadowRadius: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, 20],
                      }),
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={dynamicStyles.taskTouchable}
                    onPress={async () => {
                      await animateTaskCompletion(task.id);
                      toggleTaskCompletion(task.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={dynamicStyles.taskLeft}>
                      <Text style={dynamicStyles.taskEmoji}>{task.emoji}</Text>
                      <Text style={[
                        dynamicStyles.taskTitle,
                        task.isCompleted && dynamicStyles.taskCompleted
                      ]}>
                        {task.title}
                      </Text>
                    </View>
                    <View style={[
                      dynamicStyles.taskCheckbox,
                      task.isCompleted && dynamicStyles.taskCheckboxCompleted
                    ]}>
                      {task.isCompleted && (
                        <Animated.View
                          style={{
                            transform: [{
                              scale: checkmarkAnimations.current[task.id] || new Animated.Value(1)
                            }]
                          }}
                        >
                          <Ionicons name="checkmark" size={16} color="white" />
                        </Animated.View>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  {/* Glow Effect - DAHA GÖRÜNÜR! */}
                  {isAnimating && (
                    <Animated.View
                      style={[
                        dynamicStyles.taskGlow,
                        {
                          opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.3],
                          }),
                          transform: [{
                            scale: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.5, 1.5],
                            })
                          }]
                        }
                      ]}
                    />
                  )}
                </Animated.View>
              );
            })}
            {todayTasks.length > 3 && (
              <Text style={dynamicStyles.tasksMoreText}>
                +{todayTasks.length - 3} görev daha
              </Text>
            )}
          </View>
        ) : (
          <View style={dynamicStyles.tasksEmpty}>
            <Text style={dynamicStyles.tasksEmptyText}>
              Henüz görev eklenmemiş
            </Text>
            <TouchableOpacity 
              style={dynamicStyles.tasksAddButton}
              onPress={() => navigation.navigate('Tasks' as never)}
            >
              <Text style={dynamicStyles.tasksAddButtonText}>İlk Görevi Ekle</Text>
            </TouchableOpacity>
          </View>
        )}
        </View>
      </Animated.View>

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <Animated.View
          style={{
            opacity: fadeAnims.reminders,
            transform: [{
              scale: fadeAnims.reminders.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              })
            }]
          }}
        >
          <View style={dynamicStyles.remindersCard}>
          <View style={dynamicStyles.remindersHeader}>
            <Text style={dynamicStyles.remindersTitle}>⏰ Bugünkü Hatırlatıcılar</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reminders' as never)}>
              <Ionicons name="settings" size={20} color={currentTheme.colors.secondary} />
            </TouchableOpacity>
          </View>
          
          <View style={dynamicStyles.remindersList}>
            {todayReminders.slice(0, 3).map((reminder) => (
              <View key={reminder.id} style={dynamicStyles.reminderItem}>
                <Text style={dynamicStyles.reminderEmoji}>{reminder.emoji}</Text>
                <View style={dynamicStyles.reminderContent}>
                  <Text style={dynamicStyles.reminderTitle}>{reminder.title}</Text>
                  <Text style={dynamicStyles.reminderTime}>{reminder.time}</Text>
                </View>
                <View style={[
                  dynamicStyles.reminderPriority,
                  { backgroundColor: reminder.priority === 'high' ? '#ef4444' : 
                                     reminder.priority === 'medium' ? '#f59e0b' : '#10b981' }
                ]} />
              </View>
            ))}
            {todayReminders.length > 3 && (
              <Text style={dynamicStyles.remindersMoreText}>
                +{todayReminders.length - 3} hatırlatıcı daha
              </Text>
            )}
          </View>
          </View>
        </Animated.View>
      )}

      {/* Gelişmiş Sağlık Skoru Card */}
      <Animated.View
        style={{
          opacity: fadeAnims.health,
          transform: [{
            scale: fadeAnims.health.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            })
          }]
        }}
      >
        <TouchableOpacity 
          style={dynamicStyles.healthScoreCard}
          onPress={() => setShowHealthModal(true)}
          activeOpacity={0.7}
        >
        <View style={dynamicStyles.healthScoreHeader}>
          <View style={dynamicStyles.healthScoreHeaderLeft}>
            <View>
              <Text style={dynamicStyles.healthScoreTitle}>🌟 Yaşam Haritası</Text>
              <Text style={dynamicStyles.healthScoreSubtitle}>Son 7 gün ortalaması</Text>
            </View>
          </View>
          <View style={dynamicStyles.healthScoreBadge}>
            <Text style={dynamicStyles.healthScoreBadgeNumber}>{getWellnessScore()}</Text>
            <Text style={dynamicStyles.healthScoreBadgeLabel}>/100</Text>
          </View>
        </View>

        <View style={dynamicStyles.healthCategoriesContainer}>
          {getHealthCategories().map((cat, index) => (
            <View key={index} style={dynamicStyles.healthCategoryItem}>
              <View style={dynamicStyles.healthCategoryHeader}>
                <Text style={dynamicStyles.healthCategoryEmoji}>{cat.emoji}</Text>
                <Text style={dynamicStyles.healthCategoryScore}>{cat.score}</Text>
              </View>
              <View style={dynamicStyles.healthCategoryBar}>
                <View 
                  style={[
                    dynamicStyles.healthCategoryBarFill, 
                    { width: `${cat.score}%`, backgroundColor: cat.color }
                  ]} 
                />
              </View>
              <Text style={dynamicStyles.healthCategoryLabel}>{cat.label}</Text>
            </View>
          ))}
        </View>

        <View style={dynamicStyles.healthScoreFooter}>
          <Text style={dynamicStyles.healthScoreFooterText}>
            {getWellnessScore() >= 80 ? '🎉 Harika gidiyorsun!' :
             getWellnessScore() >= 60 ? '💪 İyi performans!' :
             getWellnessScore() >= 40 ? '🌱 İyiye gidiyorsun!' :
             '💫 Her gün yeni bir başlangıç!'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={currentTheme.colors.primary} />
        </View>
        </TouchableOpacity>
      </Animated.View>

    </ScrollView>

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
              }}>Hoşgeldin!</Text>
            </View>
            
            <Text style={{
              fontSize: 16,
              color: currentTheme.colors.text,
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 24,
            }}>
              Artık burası senin dünyan! 🌟{'\n\n'}
              Senin kuralların geçerli, senin hikayen burada yazılacak.{'\n\n'}
              Her gün biraz daha kendini keşfetmeye hazır mısın? ✨
            </Text>
            
            <View style={{ width: '100%', marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 20, marginRight: 12, width: 24 }}>📝</Text>
                <Text style={{ fontSize: 14, color: currentTheme.colors.text, flex: 1 }}>Günlük yaz, ruhunu dinle</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 20, marginRight: 12, width: 24 }}>🎯</Text>
                <Text style={{ fontSize: 14, color: currentTheme.colors.text, flex: 1 }}>Hedeflerini takip et</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
                <Text style={{ fontSize: 20, marginRight: 12, width: 24 }}>💖</Text>
                <Text style={{ fontSize: 14, color: currentTheme.colors.text, flex: 1 }}>Kendini sev ve büyüt</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={{
                backgroundColor: currentTheme.colors.primary,
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 16,
                shadowColor: currentTheme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={closeWelcomeModal}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
              }}>Harika! Başlayalım 🚀</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    )}

    </>
  );
}