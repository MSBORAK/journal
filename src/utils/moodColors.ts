/**
 * Mood-based Color System
 * Ruh haline göre dinamik renk ve gradient sistemleri
 */

export interface MoodColorScheme {
  primary: string;
  gradient: string[];
  shadow: string;
  glow: string;
  emoji: string;
}

// Ruh hali seviyelerine göre renk şemaları (1-5)
export const MOOD_COLOR_SCHEMES: Record<number, MoodColorScheme> = {
  1: { // Çok Üzgün
    primary: '#8b5cf6',
    gradient: ['#f3e8ff', '#e9d5ff', '#ddd6fe'],
    shadow: 'rgba(139, 92, 246, 0.3)',
    glow: 'rgba(139, 92, 246, 0.2)',
    emoji: '💜'
  },
  2: { // Üzgün
    primary: '#3b82f6',
    gradient: ['#dbeafe', '#bfdbfe', '#93c5fd'],
    shadow: 'rgba(59, 130, 246, 0.3)',
    glow: 'rgba(59, 130, 246, 0.2)',
    emoji: '💙'
  },
  3: { // Nötr - DAHA POZİTİF!
    primary: '#10b981',
    gradient: ['#d1fae5', '#a7f3d0', '#6ee7b7'],
    shadow: 'rgba(16, 185, 129, 0.3)',
    glow: 'rgba(16, 185, 129, 0.2)',
    emoji: '✨'
  },
  4: { // Mutlu
    primary: '#f59e0b',
    gradient: ['#fef3c7', '#fde68a', '#fcd34d'],
    shadow: 'rgba(245, 158, 11, 0.3)',
    glow: 'rgba(245, 158, 11, 0.2)',
    emoji: '🌻'
  },
  5: { // Çok Mutlu
    primary: '#ec4899',
    gradient: ['#fce7f3', '#fbcfe8', '#f9a8d4'],
    shadow: 'rgba(236, 72, 153, 0.3)',
    glow: 'rgba(236, 72, 153, 0.2)',
    emoji: '🌸'
  }
};

// Zaman bazlı gradient sistemleri
export const getTimeBasedGradient = (): string[] => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    // Sabah - Sıcak tonlar (daha parlak)
    return ['#fef3c7', '#fde68a', '#fbbf24'];
  } else if (hour >= 12 && hour < 17) {
    // Öğlen - Parlak tonlar
    return ['#fde68a', '#fbbf24', '#f59e0b'];
  } else if (hour >= 17 && hour < 21) {
    // Akşam - Soğuk tonlar (daha parlak)
    return ['#ddd6fe', '#c4b5fd', '#a78bfa'];
  } else {
    // Gece - Sıcak tonlar (gece de pozitif olsun)
    return ['#f3e8ff', '#e9d5ff', '#ddd6fe'];
  }
};

// Mood'a göre renk şemasını al
export const getMoodColorScheme = (mood: number): MoodColorScheme => {
  const validMood = Math.max(1, Math.min(5, mood || 3));
  return MOOD_COLOR_SCHEMES[validMood];
};

// Glassmorphism stili oluştur
export const createGlassmorphism = (
  backgroundColor: string, 
  opacity: number = 0.3,
  blur: number = 25
) => ({
  backgroundColor: `${backgroundColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  backdropFilter: `blur(${blur}px)`,
  // React Native için alternatif (tam blur desteği yok)
  // Bu stil web'de çalışır, native'de overlay ile simüle edilmeli
});

// Smooth gölge efekti
export const createSmoothShadow = (
  color: string = '#000000',
  elevation: number = 5
) => ({
  shadowColor: color,
  shadowOffset: {
    width: 0,
    height: elevation / 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: elevation,
  elevation: elevation,
});

// Border radius standartları
export const BORDER_RADIUS = {
  small: 16,
  medium: 24,
  large: 32,
  xl: 40,
};

// Animasyon için yumuşak geçiş
export const SMOOTH_TRANSITION = {
  duration: 300,
  useNativeDriver: true,
};

