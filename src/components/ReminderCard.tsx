import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Reminder } from '../types';

interface ReminderCardProps {
  reminder: Reminder;
  style?: any;
}

export default function ReminderCard({ reminder, style }: ReminderCardProps) {
  const { currentTheme } = useTheme();

  const dynamicStyles = StyleSheet.create({
    reminderCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: 'rgba(0,0,0,0.25)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 2,
    },
    reminderEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    reminderContent: {
      flex: 1,
    },
    reminderTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      fontFamily: 'Poppins_600SemiBold',
    },
    reminderTime: {
      fontSize: 12,
      color: currentTheme.colors.muted,
      marginTop: 2,
      fontFamily: 'Poppins_400Regular',
    },
  });

  return (
    <View style={[dynamicStyles.reminderCard, style]}>
      <Text style={dynamicStyles.reminderEmoji}>{reminder.emoji || '🔔'}</Text>
      <View style={dynamicStyles.reminderContent}>
        <Text style={dynamicStyles.reminderTitle}>{reminder.title}</Text>
        <Text style={dynamicStyles.reminderTime}>
          {reminder.time || '15 dk kaldı'}
        </Text>
      </View>
    </View>
  );
}
