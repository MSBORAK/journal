import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes as newThemes, Theme as BaseTheme, ThemeName } from '../themes';

export interface Theme extends BaseTheme {
  // Eski interface için backward compatibility: colors artık ZORUNLU
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    accent: string;
    secondary: string;
    border: string;
    shadow: string;
    muted?: string;
    success?: string;
    danger?: string;
  };
}

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeName: string) => Promise<void>;
  themes: { [key: string]: Theme };
}

// Yeni pastel tema sistemi kullan
const themes: Record<ThemeName, BaseTheme> = newThemes;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Eski colors yapısını da ekle (backward compatibility)
  const addColorsCompat = (theme: BaseTheme): Theme => ({
    ...theme,
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      accent: theme.muted, // muted -> accent
      secondary: theme.secondary,
      border: theme.muted, // muted -> border
      shadow: theme.text, // text -> shadow
      muted: theme.muted,
      success: theme.success,
      danger: theme.danger,
    }
  });

  const defaultKey = (('alabaster' as ThemeName) in themes ? ('alabaster' as ThemeName) : (Object.keys(themes)[0] as ThemeName));
  const [currentTheme, setCurrentTheme] = useState<Theme>(addColorsCompat(themes[defaultKey]));

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme) {
        const key = (savedTheme as ThemeName) in themes ? (savedTheme as ThemeName) : ('alabaster' as ThemeName);
        setCurrentTheme(addColorsCompat(themes[key]));
      } else {
        const key = ('alabaster' as ThemeName) in themes ? ('alabaster' as ThemeName) : (Object.keys(themes)[0] as ThemeName);
        setCurrentTheme(addColorsCompat(themes[key]));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (themeName: string) => {
    try {
      const key = (themeName as ThemeName) in themes ? (themeName as ThemeName) : (('alabaster' as ThemeName) in themes ? ('alabaster' as ThemeName) : (Object.keys(themes)[0] as ThemeName));
      setCurrentTheme(addColorsCompat(themes[key]));
      await AsyncStorage.setItem('selectedTheme', key);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes: Object.fromEntries(
      (Object.keys(themes) as ThemeName[]).map((k) => [k, addColorsCompat(themes[k])])
    ),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};