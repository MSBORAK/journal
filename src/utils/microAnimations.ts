/**
 * Micro Animations Utility
 * Küçük ve etkili animasyonlar için yardımcı fonksiyonlar
 */

import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Buton basımı animasyonu - Scale down efekti
 */
export const animateButtonPress = (
  animValue: Animated.Value,
  onComplete?: () => void
) => {
  Animated.sequence([
    Animated.timing(animValue, {
      toValue: 0.92,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.spring(animValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }),
  ]).start(onComplete);
};

/**
 * Kart hover efekti - Hafif tilt animasyonu
 */
export const animateCardHover = (
  scaleValue: Animated.Value,
  rotateValue: Animated.Value
) => {
  Animated.parallel([
    Animated.spring(scaleValue, {
      toValue: 1.02,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }),
    Animated.spring(rotateValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }),
  ]).start();
};

/**
 * Kart hover bitişi - Normal duruma dön
 */
export const animateCardHoverEnd = (
  scaleValue: Animated.Value,
  rotateValue: Animated.Value
) => {
  Animated.parallel([
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }),
    Animated.spring(rotateValue, {
      toValue: 0,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }),
  ]).start();
};

/**
 * Başarı tamamlama animasyonu - Konfeti + Titreşim
 */
export const animateSuccess = (
  scaleValue: Animated.Value,
  onComplete?: () => void
) => {
  // Haptic feedback
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
  Animated.sequence([
    Animated.spring(scaleValue, {
      toValue: 1.2,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }),
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }),
  ]).start(onComplete);
};

/**
 * Fade-in + Slide-up animasyonu
 */
export const animateFadeInUp = (
  fadeValue: Animated.Value,
  slideValue: Animated.Value,
  delay: number = 0
) => {
  Animated.parallel([
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }),
    Animated.spring(slideValue, {
      toValue: 0,
      friction: 8,
      tension: 40,
      delay,
      useNativeDriver: true,
    }),
  ]).start();
};

/**
 * Pulse animasyonu - Sürekli tekrar eden
 */
export const animatePulse = (
  pulseValue: Animated.Value,
  minScale: number = 0.95,
  maxScale: number = 1.05
) => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseValue, {
        toValue: maxScale,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseValue, {
        toValue: minScale,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  ).start();
};

/**
 * Shake animasyonu - Hata durumunda
 */
export const animateShake = (
  shakeValue: Animated.Value,
  onComplete?: () => void
) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  
  Animated.sequence([
    Animated.timing(shakeValue, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeValue, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeValue, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(shakeValue, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]).start(onComplete);
};

/**
 * Glow animasyonu - Parlama efekti
 */
export const animateGlow = (
  glowValue: Animated.Value,
  duration: number = 1500
) => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(glowValue, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(glowValue, {
        toValue: 0,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ])
  ).start();
};

/**
 * Stagger animasyon - Sıralı kartlar için
 */
export const animateStagger = (
  items: Animated.Value[],
  delay: number = 100
) => {
  const animations = items.map((item, index) =>
    Animated.timing(item, {
      toValue: 1,
      duration: 400,
      delay: index * delay,
      useNativeDriver: true,
    })
  );
  
  Animated.stagger(delay, animations).start();
};

/**
 * Breathing animasyonu - Sakin nefes alma efekti (3 saniye)
 */
export const animateBreathing = (breathValue: Animated.Value) => {
  Animated.loop(
    Animated.sequence([
      // Nefes al - 3 saniye
      Animated.timing(breathValue, {
        toValue: 1.1,
        duration: 3000,
        useNativeDriver: true,
      }),
      // Nefes ver - 3 saniye
      Animated.timing(breathValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ])
  ).start();
};

/**
 * Haptic feedback yardımcı fonksiyonları
 */
export const triggerHaptic = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
};

