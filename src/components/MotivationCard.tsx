import React, { useEffect, useState } from 'react';
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
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motivationService, MotivationData } from '../services/motivationService';
import { soundService } from '../services/soundService';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface MotivationCardProps {
  userId?: string;
  onDismiss?: () => void;
  autoShow?: boolean;
  delay?: number;
}

export default function MotivationCard({ 
  userId, 
  onDismiss, 
  autoShow = true, 
  delay = 2000 
}: MotivationCardProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();

  // Translation map for motivation titles and messages - using message ID for i18n keys
  const getTranslatedTitle = (title: string, messageId?: string) => {
    // Use message ID to get i18n key if available
    if (messageId) {
      const idToKeyMap: { [key: string]: string } = {
        'mood_excellent_week': 'motivation.titles.shiningBrightly',
        'mood_good_week': 'motivation.titles.peacefulSoul',
        'mood_encouragement': 'motivation.titles.newBeginning',
        'goal_almost_there': 'motivation.titles.closeToDreams',
        'goal_good_progress': 'motivation.titles.halfwayThere',
        'streak_amazing': 'motivation.titles.legend',
        'streak_good': 'motivation.titles.amazingRhythm',
        'general_encouragement_1': 'motivation.titles.innerLightShining',
        'general_encouragement_2': 'motivation.titles.strongerEveryDay',
        'reflection_insight': 'motivation.titles.listenToFeelings',
        'gratitude_practice': 'motivation.titles.lifeSmiling',
        'emotional_awareness': 'motivation.titles.valueFeelings',
        'growth_mindset': 'motivation.titles.growingSoul',
        'self_compassion': 'motivation.titles.beKind',
        'future_planning': 'motivation.titles.brightTomorrow',
        'energy_awareness': 'motivation.titles.valuableEnergy',
        'communication_skills': 'motivation.titles.connectionsEmpower',
        'accomplishment_celebration': 'motivation.titles.celebrateSuccess',
        'mindful_living': 'motivation.titles.liveMoment',
        'peace_within': 'motivation.titles.innerPeace',
        'self_love': 'motivation.titles.loveYourself',
        'beautiful_soul': 'motivation.titles.beautifulSoul',
        'breathe_relax': 'motivation.titles.breatheRelax',
        'smile_today': 'motivation.titles.smile',
      };
      
      const i18nKey = idToKeyMap[messageId];
      if (i18nKey) {
        const translated = t(i18nKey);
        if (translated !== i18nKey) return translated; // Only return if translation exists
      }
    }
    
    // Fallback to string-based translation
    const translations: { [key: string]: string } = {
      'Her Gün Yeni Bir Başlangıç! 🌅': t('motivation.titles.newBeginning'),
      'Hayallerine Çok Yakınsın! ✨': t('motivation.titles.closeToDreams'),
      'Yolun Yarısını Geçtin! 🌈': t('motivation.titles.passedHalfway'),
      'Duygularını Dinlemek Güzel! 🎵': t('motivation.titles.listenToFeelings'),
      'Işıl Işıl Parlıyorsun! ✨': t('motivation.titles.shiningBrightly'),
      'Ruhun Huzurlu! 🌸': t('motivation.titles.peacefulSoul'),
      'Sen Bir Efsanesin! 🔥': t('motivation.titles.legend'),
      'Harika Bir Ritm! ⭐': t('motivation.titles.amazingRhythm'),
      'İçindeki Işık Parlıyor! ✨': t('motivation.titles.innerLightShining'),
      'Her Gün Daha Güçlüsün! 🌱': t('motivation.titles.strongerEveryDay'),
      'Hayat Sana Gülüyor! 🌻': t('motivation.titles.lifeSmiling'),
      'Duygularına Değer Ver! 💖': t('motivation.titles.valueFeelings'),
      'Büyüyen Bir Ruh! 🦋': t('motivation.titles.growingSoul'),
      'Kendine Nazik Ol! 🌸': t('motivation.titles.beKind'),
      'Yarınların Parlak! 🌅': t('motivation.titles.brightTomorrow'),
      'Enerjin Çok Değerli! 💫': t('motivation.titles.valuableEnergy'),
      'Her Başarı Kutlanmalı! 🎊': t('motivation.titles.celebrateSuccess'),
      'Anı Yaşa! 🌺': t('motivation.titles.liveMoment'),
      'İçsel Huzur! 🕊️': t('motivation.titles.innerPeace'),
      'Kendini Sev! 💕': t('motivation.titles.loveYourself'),
      'Güzel Bir Ruhsun! 🌟': t('motivation.titles.beautifulSoul'),
      'Nefes Al, Rahatla! 🌬️': t('motivation.titles.breatheRelax'),
      'Gülümse! 😊': t('motivation.titles.smile'),
      'Connections Empower You! 🤝': t('motivation.titles.connectionsEmpower'),
    };
    return translations[title] || title;
  };

  const getTranslatedMessage = (message: string, messageId?: string) => {
    // Use message ID to get i18n key if available
    if (messageId) {
      const idToKeyMap: { [key: string]: string } = {
        'mood_excellent_week': 'motivation.messages.strongLight',
        'mood_good_week': 'motivation.messages.beautifulEnergy',
        'mood_encouragement': 'motivation.messages.cloudsAndSun',
        'goal_almost_there': 'motivation.messages.lookHowFar',
        'goal_good_progress': 'motivation.messages.smallSteps',
        'streak_amazing': 'motivation.messages.valueYourself',
        'streak_good': 'motivation.messages.regularTime',
        'general_encouragement_1': 'motivation.messages.nourishSoul',
        'general_encouragement_2': 'motivation.messages.strongerEveryDay',
        'reflection_insight': 'motivation.messages.listenToVoice',
        'gratitude_practice': 'motivation.messages.gratitudePractice',
        'emotional_awareness': 'motivation.messages.emotionalAwareness',
        'growth_mindset': 'motivation.messages.growthMindset',
        'self_compassion': 'motivation.messages.treatYourselfAsYouWould',
        'future_planning': 'motivation.messages.futurePlanning',
        'energy_awareness': 'motivation.messages.energyAwareness',
        'communication_skills': 'motivation.messages.communicationSkills',
        'accomplishment_celebration': 'motivation.messages.accomplishmentCelebration',
        'mindful_living': 'motivation.messages.mindfulLiving',
        'peace_within': 'motivation.messages.peaceWithin',
        'self_love': 'motivation.messages.selfLove',
        'beautiful_soul': 'motivation.messages.beautifulSoul',
        'breathe_relax': 'motivation.messages.breatheRelax',
        'smile_today': 'motivation.messages.smileToday',
      };
      
      const i18nKey = idToKeyMap[messageId];
      if (i18nKey) {
        const translated = t(i18nKey);
        if (translated !== i18nKey) return translated; // Only return if translation exists
      }
    }
    
    // Fallback to string-based translation
    const translations: { [key: string]: string } = {
      'Bazen bulutlar güneşi örter ama güneş hep oradadır. Senin içindeki ışık da öyle. Bugün daha güzel olacak!': t('motivation.messages.cloudsAndSun'),
      'Bak ne kadar yol kattettin! Her adım seni daha güçlü yapıyor. Devam et, sen harikasın!': t('motivation.messages.lookHowFar'),
      'Her küçük adım büyük değişimlerin başlangıcı. Sen harika şeyler başarıyorsun!': t('motivation.messages.smallSteps'),
      'İçindeki sese kulak vermek seni daha huzurlu yapıyor. Kendini dinlemeye devam et!': t('motivation.messages.listenToVoice'),
      'Bu hafta içindeki ışık öyle güçlü ki, etrafına pozitif enerji saçıyorsun. Kendini hissettiğin gibi yaşamaya devam et!': t('motivation.messages.strongLight'),
      'İçindeki o güzel enerji çok değerli. Hayatın sana sunduğu bu güzel anları doya doya yaşa!': t('motivation.messages.beautifulEnergy'),
      'Kendine verdiğin değere bak! Her gün kendine zaman ayırman ne kadar güzel. Gurur duymalısın!': t('motivation.messages.valueYourself'),
      'Kendine düzenli zaman ayırmak en güzel hediye. Sen çok değerlisin ve bunu hak ediyorsun!': t('motivation.messages.regularTime'),
      'Kendine ayırdığın her an, ruhunu besliyor. Sen çok özelsin ve bunu unutma!': t('motivation.messages.nourishSoul'),
      'En sevdiğin insana davrandığın gibi kendine de davran. Sen de şefkat hak ediyorsun!': t('motivation.messages.treatYourselfAsYouWould'),
      'Bazen fark etmesen de her gün biraz daha güçleniyorsun. Kendine inan, sen muhteşemsin!': t('motivation.messages.strongerEveryDay'),
      'Şükretmek kalbi ferahlatır. İşte şu an sahip olduğun her şey bir nimet. Hayattan keyif al!': t('motivation.messages.gratitudePractice'),
      'Her duygun seni sen yapan şeylerden biri. Onları kabul et, onlarla barış. Çok güzelsin!': t('motivation.messages.emotionalAwareness'),
      'Her yeni gün, yeni bir sen olmak için bir fırsat. Sen sürekli dönüşüyorsun ve bu çok güzel!': t('motivation.messages.growthMindset'),
      'Her yeni gün yeni umutlar, yeni başlangıçlar demek. Hayallerine adım adım yaklaşıyorsun!': t('motivation.messages.futurePlanning'),
      'Kendini yorma, dinlenmeyi bil. Enerjini korumak seni daha mutlu yapar. Kendine iyi bak!': t('motivation.messages.energyAwareness'),
      'The beautiful connections you build with people enrich your life. Share with love!': t('motivation.messages.communicationSkills'),
      'Küçük de olsa her adımın önemli! Kendini kutlamayı unutma, sen harikasın!': t('motivation.messages.accomplishmentCelebration'),
      'Şu an burada olmak ne güzel değil mi? Her anın tadını çıkar, yaşamın güzelliğini hisset!': t('motivation.messages.mindfulLiving'),
      'Huzur dışarıda değil, içinde. Kendine zaman ayırarak içindeki huzuru büyütüyorsun. Ne güzel!': t('motivation.messages.peaceWithin'),
      'Sen bu dünyada bir tanesin. Kendini olduğun gibi kabul et ve sev. Çok değerlisin!': t('motivation.messages.selfLove'),
      'İçindeki güzellik her geçen gün daha çok parlıyor. Kendini olduğun gibi yaşa!': t('motivation.messages.beautifulSoul'),
      'Derin bir nefes al. Omuzlarını gevşet. Her şey yoluna girecek. Sen harikasın!': t('motivation.messages.breatheRelax'),
      'Bugün mutlu olman için sana bir neden: Sen varsın! Hayatın güzel sürprizlerle dolu!': t('motivation.messages.smileToday'),
    };
    return translations[message] || message;
  };
  const [motivation, setMotivation] = useState<MotivationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const slideAnim = React.useRef(new Animated.Value(screenWidth)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (autoShow) {
      const timer = setTimeout(() => {
        loadMotivation();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, delay]);

  const loadMotivation = async () => {
    try {
      setIsLoading(true);
      const motivationData = await motivationService.getPersonalizedMotivation(userId);
      
      if (motivationData) {
        setMotivation(motivationData);
        showCard();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading motivation:', error);
      setIsLoading(false);
    }
  };

  const showCard = () => {
    setIsVisible(true);
    setIsLoading(false);
    
    // Play notification sound
    soundService.playNotification();
    
    // Haptic feedback
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }

    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideCard = async () => {
    // Play tap sound
    await soundService.playTap();
    
    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }

    // Slide out animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  const getGradientColors = (priority: string) => {
    switch (priority) {
      case 'high':
        return [currentTheme.colors.primary, currentTheme.colors.secondary];
      case 'medium':
        return [currentTheme.colors.primary + 'CC', currentTheme.colors.secondary + 'CC'];
      case 'low':
        return [currentTheme.colors.primary + 'AA', currentTheme.colors.secondary + 'AA'];
      default:
        return [currentTheme.colors.primary, currentTheme.colors.secondary];
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      left: 16,
      right: 16,
      zIndex: 1000,
    },
    card: {
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    emoji: {
      fontSize: 32,
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.background,
      flex: 1,
      fontFamily: 'Poppins_700Bold',
    },
    message: {
      fontSize: 14,
      color: currentTheme.colors.background + 'E6',
      lineHeight: 20,
      marginBottom: 16,
      fontFamily: 'Poppins_400Regular',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priorityIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priorityText: {
      fontSize: 12,
      color: currentTheme.colors.background + 'B3',
      marginLeft: 4,
      fontFamily: 'Poppins_400Regular',
    },
    closeButton: {
      padding: 8,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.background + '33',
    },
  });

  if (isLoading) {
    return null;
  }

  if (!isVisible || !motivation) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={getGradientColors(motivation.priority) as [string, string, ...string[]]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>{motivation.emoji}</Text>
          <Text style={styles.title}>{getTranslatedTitle(motivation.title, motivation.id)}</Text>
        </View>
        
        <Text style={styles.message}>{getTranslatedMessage(motivation.message, motivation.id)}</Text>
        
        <View style={styles.footer}>
          <View style={styles.priorityIndicator}>
            <Ionicons 
              name={motivation.priority === 'high' ? 'star' : motivation.priority === 'medium' ? 'star-half' : 'star-outline'} 
              size={14} 
              color={currentTheme.colors.background + 'B3'} 
            />
            <Text style={styles.priorityText}>
              {motivation.priority === 'high' ? (t('welcome') === 'Welcome' ? 'Important' : 'Önemli') : 
               motivation.priority === 'medium' ? (t('welcome') === 'Welcome' ? 'Medium' : 'Orta') : 
               (t('welcome') === 'Welcome' ? 'Info' : 'Bilgi')}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={hideCard}>
            <Ionicons name="close" size={16} color={currentTheme.colors.background} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
