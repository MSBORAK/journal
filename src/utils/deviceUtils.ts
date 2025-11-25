import { Dimensions, Platform } from 'react-native';
import * as Device from 'expo-device';

/**
 * Cihazın iPad olup olmadığını kontrol eder
 */
export const isIPad = (): boolean => {
  if (Platform.OS !== 'ios') return false;
  
  const { width, height } = Dimensions.get('window');
  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  
  // iPad'ler genellikle daha büyük ekran ve farklı aspect ratio'ya sahiptir
  // iPad'in minimum genişliği genellikle 768pt'dir
  const minDimension = Math.min(width, height);
  const isTabletSize = minDimension >= 768;
  
  // Device.modelName kullanarak da kontrol edebiliriz
  try {
    if (Device.modelName && Device.modelName.toLowerCase().includes('ipad')) {
      return true;
    }
  } catch (e) {
    // Device.modelName mevcut değilse boyut kontrolüne güveniyoruz
  }
  
  return isTabletSize;
};

/**
 * iPad için optimal maksimum genişlik döndürür
 */
export const getMaxContentWidth = (): number => {
  const { width } = Dimensions.get('window');
  
  if (isIPad()) {
    // iPad için maksimum 800px genişlik (okunabilirlik için)
    return Math.min(width, 800);
  }
  
  // iPhone için tam genişlik
  return width;
};

/**
 * iPad için yatay padding döndürür
 */
export const getHorizontalPadding = (): number => {
  if (isIPad()) {
    const { width } = Dimensions.get('window');
    const maxWidth = getMaxContentWidth();
    // İçeriği ortalamak için padding hesapla
    return Math.max(40, (width - maxWidth) / 2);
  }
  
  // iPhone için standart padding
  return 20;
};

/**
 * Cihazın landscape modda olup olmadığını kontrol eder
 */
export const isLandscape = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return width > height;
};

