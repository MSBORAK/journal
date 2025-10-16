// Color utility functions for theme accessibility

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 * AA: 4.5:1 for normal text, 3:1 for large text
 * AAA: 7:1 for normal text, 4.5:1 for large text
 */
export function isAccessible(foreground: string, background: string, largeText: boolean = false): boolean {
  const contrast = getContrastRatio(foreground, background);
  return largeText ? contrast >= 3 : contrast >= 4.5;
}

/**
 * Get accessible text color for background
 */
export function getAccessibleTextColor(background: string, lightText: string = '#FFFFFF', darkText: string = '#000000'): string {
  const lightContrast = getContrastRatio(lightText, background);
  const darkContrast = getContrastRatio(darkText, background);
  
  return lightContrast > darkContrast ? lightText : darkText;
}

/**
 * Adjust color opacity for better contrast
 */
export function adjustColorOpacity(color: string, opacity: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Get better text color for theme
 */
export function getThemeTextColor(background: string, theme: 'light' | 'dark' = 'light'): string {
  if (theme === 'dark') {
    return getAccessibleTextColor(background, '#FFFFFF', '#E5E5E5');
  } else {
    return getAccessibleTextColor(background, '#FFFFFF', '#2D423B');
  }
}
