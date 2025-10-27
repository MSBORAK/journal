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

  // Translation map for motivation titles and messages
  const getTranslatedTitle = (title: string) => {
    const translations: { [key: string]: string } = {
      'Her Gün Yeni Bir Başlangıç! 🌅': t('welcome') === 'Welcome' ? 'Every Day a New Beginning! 🌅' : 'Her Gün Yeni Bir Başlangıç! 🌅',
      'Hayallerine Çok Yakınsın! ✨': t('welcome') === 'Welcome' ? 'You\'re So Close to Your Dreams! ✨' : 'Hayallerine Çok Yakınsın! ✨',
      'Yolun Yarısını Geçtin! 🌈': t('welcome') === 'Welcome' ? 'You\'ve Passed Halfway! 🌈' : 'Yolun Yarısını Geçtin! 🌈',
      'Duygularını Dinlemek Güzel! 🎵': t('welcome') === 'Welcome' ? 'It\'s Beautiful to Listen to Your Feelings! 🎵' : 'Duygularını Dinlemek Güzel! 🎵',
      'Işıl Işıl Parlıyorsun! ✨': t('welcome') === 'Welcome' ? 'You\'re Shining Brightly! ✨' : 'Işıl Işıl Parlıyorsun! ✨',
      'Ruhun Huzurlu! 🌸': t('welcome') === 'Welcome' ? 'Your Soul is Peaceful! 🌸' : 'Ruhun Huzurlu! 🌸',
      'Sen Bir Efsanesin! 🔥': t('welcome') === 'Welcome' ? 'You\'re a Legend! 🔥' : 'Sen Bir Efsanesin! 🔥',
      'Harika Bir Ritm! ⭐': t('welcome') === 'Welcome' ? 'Amazing Rhythm! ⭐' : 'Harika Bir Ritm! ⭐',
      'İçindeki Işık Parlıyor! ✨': t('welcome') === 'Welcome' ? 'The Light Within You is Shining! ✨' : 'İçindeki Işık Parlıyor! ✨',
      'Her Gün Daha Güçlüsün! 🌱': t('welcome') === 'Welcome' ? 'You\'re Stronger Every Day! 🌱' : 'Her Gün Daha Güçlüsün! 🌱',
      'Hayat Sana Gülüyor! 🌻': t('welcome') === 'Welcome' ? 'Life is Smiling at You! 🌻' : 'Hayat Sana Gülüyor! 🌻',
      'Duygularına Değer Ver! 💖': t('welcome') === 'Welcome' ? 'Value Your Feelings! 💖' : 'Duygularına Değer Ver! 💖',
      'Büyüyen Bir Ruh! 🦋': t('welcome') === 'Welcome' ? 'A Growing Soul! 🦋' : 'Büyüyen Bir Ruh! 🦋',
      'Kendine Nazik Ol! 🌸': t('welcome') === 'Welcome' ? 'Be Kind to Yourself! 🌸' : 'Kendine Nazik Ol! 🌸',
      'Yarınların Parlak! 🌅': t('welcome') === 'Welcome' ? 'Your Tomorrows are Bright! 🌅' : 'Yarınların Parlak! 🌅',
      'Enerjin Çok Değerli! 💫': t('welcome') === 'Welcome' ? 'Your Energy is Very Valuable! 💫' : 'Enerjin Çok Değerli! 💫',
      'Her Başarı Kutlanmalı! 🎊': t('welcome') === 'Welcome' ? 'Every Success Should be Celebrated! 🎊' : 'Her Başarı Kutlanmalı! 🎊',
      'Anı Yaşa! 🌺': t('welcome') === 'Welcome' ? 'Live the Moment! 🌺' : 'Anı Yaşa! 🌺',
      'İçsel Huzur! 🕊️': t('welcome') === 'Welcome' ? 'Inner Peace! 🕊️' : 'İçsel Huzur! 🕊️',
      'Kendini Sev! 💕': t('welcome') === 'Welcome' ? 'Love Yourself! 💕' : 'Kendini Sev! 💕',
      'Güzel Bir Ruhsun! 🌟': t('welcome') === 'Welcome' ? 'You\'re a Beautiful Soul! 🌟' : 'Güzel Bir Ruhsun! 🌟',
      'Nefes Al, Rahatla! 🌬️': t('welcome') === 'Welcome' ? 'Breathe, Relax! 🌬️' : 'Nefes Al, Rahatla! 🌬️',
      'Gülümse! 😊': t('welcome') === 'Welcome' ? 'Smile! 😊' : 'Gülümse! 😊',
    };
    return translations[title] || title;
  };

  const getTranslatedMessage = (message: string) => {
    const translations: { [key: string]: string } = {
      'Bazen bulutlar güneşi örter ama güneş hep oradadır. Senin içindeki ışık da öyle. Bugün daha güzel olacak!': t('welcome') === 'Welcome' ? 'Sometimes clouds cover the sun, but the sun is always there. So is the light within you. Today will be even better!' : 'Bazen bulutlar güneşi örter ama güneş hep oradadır. Senin içindeki ışık da öyle. Bugün daha güzel olacak!',
      'Bak ne kadar yol kattettin! Her adım seni daha güçlü yapıyor. Devam et, sen harikasın!': t('welcome') === 'Welcome' ? 'Look how far you\'ve come! Every step makes you stronger. Keep going, you\'re amazing!' : 'Bak ne kadar yol kattettin! Her adım seni daha güçlü yapıyor. Devam et, sen harikasın!',
      'Her küçük adım büyük değişimlerin başlangıcı. Sen harika şeyler başarıyorsun!': t('welcome') === 'Welcome' ? 'Every small step is the beginning of great changes. You\'re achieving amazing things!' : 'Her küçük adım büyük değişimlerin başlangıcı. Sen harika şeyler başarıyorsun!',
      'İçindeki sese kulak vermek seni daha huzurlu yapıyor. Kendini dinlemeye devam et!': t('welcome') === 'Welcome' ? 'Listening to the voice within makes you more peaceful. Keep listening to yourself!' : 'İçindeki sese kulak vermek seni daha huzurlu yapıyor. Kendini dinlemeye devam et!',
      'Bu hafta içindeki ışık öyle güçlü ki, etrafına pozitif enerji saçıyorsun. Kendini hissettiğin gibi yaşamaya devam et!': t('welcome') === 'Welcome' ? 'This week the light within you is so strong that you\'re radiating positive energy around you. Keep living as you feel!' : 'Bu hafta içindeki ışık öyle güçlü ki, etrafına pozitif enerji saçıyorsun. Kendini hissettiğin gibi yaşamaya devam et!',
      'İçindeki o güzel enerji çok değerli. Hayatın sana sunduğu bu güzel anları doya doya yaşa!': t('welcome') === 'Welcome' ? 'That beautiful energy within you is very valuable. Live these beautiful moments that life offers you to the fullest!' : 'İçindeki o güzel enerji çok değerli. Hayatın sana sunduğu bu güzel anları doya doya yaşa!',
      'Kendine verdiğin değere bak! Her gün kendine zaman ayırman ne kadar güzel. Gurur duymalısın!': t('welcome') === 'Welcome' ? 'Look at the value you give yourself! How beautiful it is that you take time for yourself every day. You should be proud!' : 'Kendine verdiğin değere bak! Her gün kendine zaman ayırman ne kadar güzel. Gurur duymalısın!',
      'Kendine düzenli zaman ayırmak en güzel hediye. Sen çok değerlisin ve bunu hak ediyorsun!': t('welcome') === 'Welcome' ? 'Taking regular time for yourself is the most beautiful gift. You are very valuable and you deserve this!' : 'Kendine düzenli zaman ayırmak en güzel hediye. Sen çok değerlisin ve bunu hak ediyorsun!',
      'Kendine ayırdığın her an, ruhunu besliyor. Sen çok özelsin ve bunu unutma!': t('welcome') === 'Welcome' ? 'Every moment you dedicate to yourself nourishes your soul. You are very special and don\'t forget this!' : 'Kendine ayırdığın her an, ruhunu besliyor. Sen çok özelsin ve bunu unutma!',
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
          <Text style={styles.title}>{getTranslatedTitle(motivation.title)}</Text>
        </View>
        
        <Text style={styles.message}>{getTranslatedMessage(motivation.message)}</Text>
        
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
