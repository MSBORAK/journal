import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export default function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const { currentTheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      {children}
    </View>
  );
}

