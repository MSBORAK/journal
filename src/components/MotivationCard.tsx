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
          <Text style={styles.title}>{motivation.title}</Text>
        </View>
        
        <Text style={styles.message}>{motivation.message}</Text>
        
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
