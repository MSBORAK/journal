import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'onboarding_completed';
const FIRST_TIME_KEY = 'first_time_user';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
  action?: string;
  targetScreen?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Hoş Geldin 🌞',
    description: 'Rhythm, seni her gün biraz daha iyi hissettiren bir yolculuğa davet ediyor. Günlük yaz, hedeflerini belirle, ilerlemeni izle 💫',
    icon: 'sparkles',
    gradient: ['#FFF9F0', '#FFECD1'],
  },
  {
    id: 'routine',
    title: 'Rutinini Kur 🌿',
    description: 'Günlük yaz, alışkanlıklarını takip et, ruh halini gözlemle. Küçük adımlar, büyük farklar yaratır ✨',
    icon: 'leaf',
    gradient: ['#FCEBBF', '#E9ACBB'],
  },
  {
    id: 'preferences',
    title: 'Tarzını Seç 💫',
    description: 'Rhythm iki farklı dünyada seni bekliyor. Hangisi senin enerjine daha yakın?',
    icon: 'color-palette',
    gradient: ['#8FBC93', '#C9B297'],
  },
];

// ✅ ÇÖZÜM 1: userId parametresi kaldırıldı - tek key kullanılıyor
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    console.log(`✅ Onboarding completed set`);
  } catch (error) {
    console.error('❌ Error setting onboarding completed:', error);
  }
};

// ✅ ÇÖZÜM 1: userId parametresi kaldırıldı - tek key kullanılıyor
export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
    console.log(`🔍 Onboarding completed check → ${completed === 'true'}`);
    return completed === 'true';
  } catch (error) {
    console.error('❌ Error checking onboarding status:', error);
    return false;
  }
};

export const setFirstTimeUser = async (userId?: string): Promise<void> => {
  const key = userId ? `${FIRST_TIME_KEY}_${userId}` : FIRST_TIME_KEY;
  await AsyncStorage.setItem(key, 'true');
};

export const isFirstTimeUser = async (userId?: string): Promise<boolean> => {
  try {
    const key = userId ? `${FIRST_TIME_KEY}_${userId}` : FIRST_TIME_KEY;
    const isFirstTime = await AsyncStorage.getItem(key);
    return isFirstTime !== 'true';
  } catch (error) {
    console.error('Error checking first time user status:', error);
    return true; // Default to first time if error
  }
};

// ✅ ÇÖZÜM 1: userId parametresi kaldırıldı - tek key kullanılıyor
export const resetOnboarding = async (): Promise<void> => {
  await AsyncStorage.multiRemove([ONBOARDING_KEY, FIRST_TIME_KEY]);
};

const APP_THEME_KEY = 'app_theme';

export const setSelectedTheme = async (theme: 'cozy' | 'luxury'): Promise<void> => {
  await AsyncStorage.setItem(APP_THEME_KEY, theme);
};

export const getSelectedTheme = async (): Promise<'cozy' | 'luxury' | null> => {
  try {
    const theme = await AsyncStorage.getItem(APP_THEME_KEY);
    return theme as 'cozy' | 'luxury' | null;
  } catch (error) {
    console.error('Error getting selected theme:', error);
    return null;
  }
};
