import { themes, Theme } from '../themes.ts';
import { getContrastRatio, isAccessible } from './colorUtils.ts';

interface ThemeIssue {
  themeName: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

export function validateThemes(): ThemeIssue[] {
  const issues: ThemeIssue[] = [];
  
  Object.entries(themes).forEach(([name, theme]) => {
    // Check text on background contrast
    const textBackgroundContrast = getContrastRatio(theme.text, theme.background);
    if (!isAccessible(theme.text, theme.background)) {
      issues.push({
        themeName: name,
        issue: `Text on background contrast too low: ${textBackgroundContrast.toFixed(2)}:1`,
        severity: textBackgroundContrast < 3 ? 'high' : 'medium',
        suggestion: 'Increase text color contrast or adjust background'
      });
    }
    
    // Check primary on background contrast
    const primaryBackgroundContrast = getContrastRatio(theme.primary, theme.background);
    if (primaryBackgroundContrast < 3) {
      issues.push({
        themeName: name,
        issue: `Primary on background contrast too low: ${primaryBackgroundContrast.toFixed(2)}:1`,
        severity: primaryBackgroundContrast < 2 ? 'high' : 'medium',
        suggestion: 'Adjust primary color for better visibility'
      });
    }
    
    // Check text on card contrast
    const textCardContrast = getContrastRatio(theme.text, theme.card);
    if (!isAccessible(theme.text, theme.card)) {
      issues.push({
        themeName: name,
        issue: `Text on card contrast too low: ${textCardContrast.toFixed(2)}:1`,
        severity: textCardContrast < 3 ? 'high' : 'medium',
        suggestion: 'Adjust card background or text color'
      });
    }
    
    // Check muted text contrast
    const mutedBackgroundContrast = getContrastRatio(theme.muted, theme.background);
    if (mutedBackgroundContrast < 2) {
      issues.push({
        themeName: name,
        issue: `Muted text on background contrast too low: ${mutedBackgroundContrast.toFixed(2)}:1`,
        severity: 'medium',
        suggestion: 'Adjust muted color for better readability'
      });
    }
  });
  
  return issues;
}

// Fix problematic themes
export function fixThemeContrast(themeName: string): Theme {
  const theme = themes[themeName as keyof typeof themes];
  if (!theme) return theme;
  
  // Create a copy to modify
  const fixedTheme = { ...theme };
  
  // Fix common contrast issues
  const textBackgroundContrast = getContrastRatio(theme.text, theme.background);
  if (textBackgroundContrast < 4.5) {
    // If background is light, make text darker
    // If background is dark, make text lighter
    const backgroundLuminance = getLuminanceFromHex(theme.background);
    if (backgroundLuminance > 0.5) {
      // Light background - use darker text
      fixedTheme.text = '#1A1A1A' as any;
    } else {
      // Dark background - use lighter text
      fixedTheme.text = '#FFFFFF' as any;
    }
  }
  
  // Fix muted text
  const mutedContrast = getContrastRatio(theme.muted, theme.background);
  if (mutedContrast < 3) {
    const backgroundLuminance = getLuminanceFromHex(theme.background);
    if (backgroundLuminance > 0.5) {
      fixedTheme.muted = '#666666' as any;
    } else {
      fixedTheme.muted = '#CCCCCC' as any;
    }
  }
  
  return fixedTheme;
}

function getLuminanceFromHex(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Print theme validation results
export function printThemeValidation(): void {
  const issues = validateThemes();
  
  console.log('\n🎨 Theme Accessibility Report:');
  console.log('================================');
  
  if (issues.length === 0) {
    console.log('✅ All themes have good contrast!');
    return;
  }
  
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.themeName]) {
      acc[issue.themeName] = [];
    }
    acc[issue.themeName].push(issue);
    return acc;
  }, {} as Record<string, ThemeIssue[]>);
  
  Object.entries(groupedIssues).forEach(([themeName, themeIssues]) => {
    console.log(`\n📱 ${themeName}:`);
    themeIssues.forEach(issue => {
      const severity = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
      console.log(`  ${severity} ${issue.issue}`);
      console.log(`     💡 ${issue.suggestion}`);
    });
  });
}
