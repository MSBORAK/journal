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
    description: 'Daily, seni her gün biraz daha iyi hissettiren bir yolculuğa davet ediyor. Günlük yaz, hedeflerini belirle, ilerlemeni izle 💫',
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
    description: 'Daily iki farklı dünyada seni bekliyor. Hangisi senin enerjine daha yakın?',
    icon: 'color-palette',
    gradient: ['#8FBC93', '#C9B297'],
  },
];

export const setOnboardingCompleted = async (userId?: string): Promise<void> => {
  try {
    const key = userId ? `${ONBOARDING_KEY}_${userId}` : ONBOARDING_KEY;
    await AsyncStorage.setItem(key, 'true');
    console.log(`Onboarding completed for user ${userId || 'anonymous'}`);
  } catch (error) {
    console.error('Error setting onboarding completed:', error);
    // Don't throw, just log the error
  }
};

export const isOnboardingCompleted = async (userId?: string): Promise<boolean> => {
  try {
    const key = userId ? `${ONBOARDING_KEY}_${userId}` : ONBOARDING_KEY;
    const completed = await AsyncStorage.getItem(key);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
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

export const resetOnboarding = async (userId?: string): Promise<void> => {
  const onboardingKey = userId ? `${ONBOARDING_KEY}_${userId}` : ONBOARDING_KEY;
  const firstTimeKey = userId ? `${FIRST_TIME_KEY}_${userId}` : FIRST_TIME_KEY;
  
  await AsyncStorage.multiRemove([onboardingKey, firstTimeKey]);
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
