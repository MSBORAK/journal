import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { themes, ThemeName } from '../themes';
import { useTheme } from '../contexts/ThemeContext';

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'dream' | 'goal' | 'promise';
  themeName?: ThemeName | string;
}

const { width, height } = Dimensions.get('window');

export default function CelebrationModal({
  visible,
  onClose,
  title,
  message,
  type,
  themeName = 'dark'
}: CelebrationModalProps) {
  const { currentTheme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Modal animasyonu
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 3 saniye sonra otomatik kapat
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'dream': return '🌟';
      case 'goal': return '🎯';
      case 'promise': return '🤝';
      default: return '🎉';
    }
  };

  // Premium minimalist tema renkleri
  const getThemeColors = () => {
    // Resolve theme by key, by display name, or fall back to currentTheme
    let theme: any = currentTheme;
    if (themeName && typeof themeName === 'string') {
      if ((themeName as string) in themes) {
        theme = (themes as any)[themeName as ThemeName];
      } else {
        const byName = (Object.values(themes) as any[]).find(t => t.name === themeName);
        if (byName) theme = byName;
      }
    }
    
    // Primary + Secondary kombinasyonları (canlı accent'ler)
    return {
      dream: [theme.primary, theme.secondary], // Ana renk kombinasyonu
      goal: [theme.secondary, theme.primary], // Ters kombinasyon
      promise: [theme.muted, theme.primary], // Muted + Primary
    };
  };

  const getGradientColors = (): [string, string] => {
    const themeColors = getThemeColors();
    const colors = themeColors[type];
    return [colors[0], colors[1]] as [string, string];
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        {/* Konfeti Efekti */}
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: -10 }}
          fadeOut
          autoStart
          colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#9B5CFF', '#FFD93D', '#6BCF7F']}
        />

        {/* Modal Container */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Gradient Background */}
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Floating Elements */}
            <View style={styles.floatingElements}>
              <Text style={[styles.floatingIcon, { top: '10%', left: '10%' }]}>✨</Text>
              <Text style={[styles.floatingIcon, { top: '20%', right: '15%' }]}>🌟</Text>
              <Text style={[styles.floatingIcon, { bottom: '30%', left: '20%' }]}>💫</Text>
              <Text style={[styles.floatingIcon, { bottom: '20%', right: '10%' }]}>⭐</Text>
            </View>

            {/* İkon ve Başlık */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{getIcon()}</Text>
                <View style={styles.iconGlow} />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.titleEmoji}>🎉</Text>
                <Text style={styles.title}>Congratulations!</Text>
              </View>
            </View>

            {/* Message */}
            <View style={styles.content}>
              <View style={styles.messageCard}>
                <Text style={styles.messageTitle}>"{title}"</Text>
                <Text style={styles.message}>{message}</Text>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.closeButtonGradient}
              >
                <Text style={styles.closeButtonText}>Close ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    marginHorizontal: 40,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 20,
    minWidth: width * 0.85,
  },
  gradientBackground: {
    padding: 40,
    alignItems: 'center',
    position: 'relative',
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingIcon: {
    position: 'absolute',
    fontSize: 24,
    opacity: 0.7,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 2,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  icon: {
    fontSize: 64,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  iconGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleEmoji: {
    fontSize: 36,
    marginRight: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 2,
  },
  messageCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontStyle: 'italic',
  },
  message: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  closeButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 2,
  },
  closeButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
