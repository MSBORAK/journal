import AsyncStorage from '@react-native-async-storage/async-storage';

const TOUR_COMPLETED_KEY = 'app_tour_completed';
const TOUR_STEP_KEY = 'app_tour_current_step';

export interface TourStep {
  id: string;
  screen: string;
  title: string;
  description: string;
  targetElement?: string;
  action?: 'navigate' | 'highlight' | 'info';
  nextScreen?: string;
}

// Tour adımları dinamik olarak i18n ile çevrilecek
export const getTourSteps = (t: (key: string) => string): TourStep[] => [
  {
    id: 'dashboard_welcome',
    screen: 'Dashboard',
    title: t('tour.welcome'),
    description: t('tour.dashboardWelcome'),
    action: 'info',
  },
  {
    id: 'dashboard_write_diary',
    screen: 'Dashboard',
    title: '✍️ ' + t('diary.writeDiary'),
    description: t('tour.dashboardWriteDiary'),
    targetElement: 'write_diary_button',
    action: 'highlight',
  },
  {
    id: 'dreams_goals',
    screen: 'DreamsGoals',
    title: '🎯 ' + t('navigation.dreams'),
    description: t('tour.dreamsGoals'),
    action: 'navigate',
    nextScreen: 'DreamsGoals',
  },
  {
    id: 'statistics',
    screen: 'Statistics',
    title: '📊 ' + t('navigation.statistics'),
    description: t('tour.statistics'),
    action: 'navigate',
    nextScreen: 'Statistics',
  },
  {
    id: 'tasks',
    screen: 'Tasks',
    title: '✅ ' + t('navigation.tasks'),
    description: t('tour.tasks'),
    action: 'navigate',
    nextScreen: 'Tasks',
  },
  {
    id: 'settings',
    screen: 'Settings',
    title: '⚙️ ' + t('navigation.settings'),
    description: t('tour.settings'),
    action: 'navigate',
    nextScreen: 'Settings',
  },
];

export const isTourCompleted = async (userId?: string): Promise<boolean> => {
  try {
    const key = userId ? `${TOUR_COMPLETED_KEY}_${userId}` : TOUR_COMPLETED_KEY;
    const completed = await AsyncStorage.getItem(key);
    return completed === 'true';
  } catch (error) {
    console.error('Error checking tour status:', error);
    return false;
  }
};

export const setTourCompleted = async (userId?: string): Promise<void> => {
  try {
    const key = userId ? `${TOUR_COMPLETED_KEY}_${userId}` : TOUR_COMPLETED_KEY;
    await AsyncStorage.setItem(key, 'true');
    console.log(`Tour completed for user ${userId || 'anonymous'}`);
  } catch (error) {
    console.error('Error setting tour completed:', error);
  }
};

export const getTourStep = async (userId?: string): Promise<number> => {
  try {
    const key = userId ? `${TOUR_STEP_KEY}_${userId}` : TOUR_STEP_KEY;
    const step = await AsyncStorage.getItem(key);
    return step ? parseInt(step, 10) : 0;
  } catch (error) {
    console.error('Error getting tour step:', error);
    return 0;
  }
};

export const setTourStep = async (step: number, userId?: string): Promise<void> => {
  try {
    const key = userId ? `${TOUR_STEP_KEY}_${userId}` : TOUR_STEP_KEY;
    await AsyncStorage.setItem(key, step.toString());
  } catch (error) {
    console.error('Error setting tour step:', error);
  }
};

export const resetTour = async (userId?: string): Promise<void> => {
  try {
    const completedKey = userId ? `${TOUR_COMPLETED_KEY}_${userId}` : TOUR_COMPLETED_KEY;
    const stepKey = userId ? `${TOUR_STEP_KEY}_${userId}` : TOUR_STEP_KEY;
    await AsyncStorage.multiRemove([completedKey, stepKey]);
  } catch (error) {
    console.error('Error resetting tour:', error);
  }
};

