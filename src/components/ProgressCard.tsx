import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ProgressCardProps {
  completionRate: number;
  style?: any;
}

export default function ProgressCard({ completionRate, style }: ProgressCardProps) {
  const { currentTheme } = useTheme();

  const dynamicStyles = StyleSheet.create({
    progressContainer: {
      marginTop: 16,
      padding: 16,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    progressText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
      fontFamily: 'Poppins_600SemiBold',
    },
    progressBar: {
      height: 6,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.success,
      borderRadius: 3,
      width: `${completionRate}%`,
    },
  });

  if (completionRate === 0) {
    return null; // Don't show progress bar if no tasks
  }

  return (
    <View style={[dynamicStyles.progressContainer, style]}>
      <Text style={dynamicStyles.progressText}>
        🟩 %{completionRate} completed
      </Text>
      <View style={dynamicStyles.progressBar}>
        <View style={dynamicStyles.progressFill} />
      </View>
    </View>
  );
}
