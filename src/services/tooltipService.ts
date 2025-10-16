import AsyncStorage from '@react-native-async-storage/async-storage';

const TOOLTIP_KEY_PREFIX = 'tooltip_shown_';

export interface TooltipData {
  id: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  targetElement: string;
  screen: string;
}

export const TOOLTIPS: TooltipData[] = [
  {
    id: 'dashboard_mood',
    title: 'Ruh Halini Kaydet',
    description: 'Buraya tıklayarak günlük ruh halinizi kaydedebilirsiniz',
    position: 'bottom',
    targetElement: 'mood_selector',
    screen: 'Dashboard',
  },
  {
    id: 'dashboard_quick_add',
    title: 'Hızlı Giriş',
    description: 'Günlük yazmaya hızlıca başlamak için buraya tıklayın',
    position: 'bottom',
    targetElement: 'quick_add_button',
    screen: 'Dashboard',
  },
  {
    id: 'dreams_goals_add',
    title: 'Hayal & Hedef Ekle',
    description: 'Yeni hayaller ve hedefler eklemek için + butonuna tıklayın',
    position: 'bottom',
    targetElement: 'add_button',
    screen: 'DreamsGoals',
  },
  {
    id: 'dreams_goals_card',
    title: 'İlerleme Takibi',
    description: 'Kartlara tıklayarak detayları görüntüleyebilir ve ilerleme kaydedebilirsiniz',
    position: 'bottom',
    targetElement: 'goal_card',
    screen: 'DreamsGoals',
  },
  {
    id: 'history_filter',
    title: 'Filtreleme',
    description: 'Günlük girişlerinizi tarih veya ruh haline göre filtreleyebilirsiniz',
    position: 'top',
    targetElement: 'filter_button',
    screen: 'History',
  },
  {
    id: 'statistics_insights',
    title: 'İstatistikler',
    description: 'İlerlemenizi ve trendlerinizi buradan takip edebilirsiniz',
    position: 'bottom',
    targetElement: 'stats_container',
    screen: 'Statistics',
  },
  {
    id: 'settings_theme',
    title: 'Tema Değiştir',
    description: 'Uygulamanızın görünümünü buradan özelleştirebilirsiniz',
    position: 'left',
    targetElement: 'theme_button',
    screen: 'Settings',
  },
];

export const isTooltipShown = async (tooltipId: string, userId?: string): Promise<boolean> => {
  try {
    const key = userId ? `${TOOLTIP_KEY_PREFIX}${userId}_${tooltipId}` : `${TOOLTIP_KEY_PREFIX}${tooltipId}`;
    const shown = await AsyncStorage.getItem(key);
    return shown === 'true';
  } catch (error) {
    console.error('Error checking tooltip status:', error);
    return false;
  }
};

export const markTooltipAsShown = async (tooltipId: string, userId?: string): Promise<void> => {
  try {
    const key = userId ? `${TOOLTIP_KEY_PREFIX}${userId}_${tooltipId}` : `${TOOLTIP_KEY_PREFIX}${tooltipId}`;
    await AsyncStorage.setItem(key, 'true');
  } catch (error) {
    console.error('Error marking tooltip as shown:', error);
  }
};

export const resetAllTooltips = async (userId?: string): Promise<void> => {
  try {
    const keys = TOOLTIPS.map(tooltip => 
      userId ? `${TOOLTIP_KEY_PREFIX}${userId}_${tooltip.id}` : `${TOOLTIP_KEY_PREFIX}${tooltip.id}`
    );
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error resetting tooltips:', error);
  }
};

export const getTooltipsForScreen = (screenName: string): TooltipData[] => {
  return TOOLTIPS.filter(tooltip => tooltip.screen === screenName);
};
