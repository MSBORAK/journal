import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface DaySummaryCardProps {
  completedTasks: number;
  totalTasks: number;
  completedPomodoros: number;
  totalSessions: number;
  totalWorkTime: string;
  onAddTask: () => void;
  onAddReminder: () => void;
  style?: any;
}

export default function DaySummaryCard({
  completedTasks,
  totalTasks,
  completedPomodoros,
  totalSessions,
  totalWorkTime,
  onAddTask,
  onAddReminder,
  style
}: DaySummaryCardProps) {
  const { currentTheme } = useTheme();

  const dynamicStyles = StyleSheet.create({
    summaryCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 20,
      margin: 20,
      shadowColor: 'rgba(0,0,0,0.25)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 6,
    },
    summaryTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
      fontFamily: 'Poppins_700Bold',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
      fontFamily: 'Poppins_600SemiBold',
    },
    statLabel: {
      fontSize: 12,
      color: currentTheme.colors.muted,
      fontFamily: 'Poppins_400Regular',
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.colors.background,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      fontFamily: 'Poppins_600SemiBold',
      marginLeft: 6,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  return (
    <View style={[dynamicStyles.summaryCard, style]}>
      <Text style={dynamicStyles.summaryTitle}>🎯 Bugün</Text>
      
      <View style={dynamicStyles.statsRow}>
        <View style={dynamicStyles.statItem}>
          <Text style={dynamicStyles.statNumber}>{completedTasks}/{totalTasks}</Text>
          <Text style={dynamicStyles.statLabel}>Görev Tamamlandı</Text>
        </View>
        <View style={dynamicStyles.statItem}>
          <Text style={dynamicStyles.statNumber}>{completedPomodoros}/{totalSessions || 4}</Text>
          <Text style={dynamicStyles.statLabel}>Pomodoro</Text>
        </View>
        <View style={dynamicStyles.statItem}>
          <Text style={dynamicStyles.statNumber}>{totalWorkTime}</Text>
          <Text style={dynamicStyles.statLabel}>Çalışma Süresi</Text>
        </View>
      </View>

      <View style={dynamicStyles.buttonsRow}>
        <TouchableOpacity 
          style={dynamicStyles.actionButton}
          onPress={onAddTask}
          activeOpacity={0.8}
        >
          <View style={dynamicStyles.buttonContent}>
            <Ionicons name="add" size={20} color={currentTheme.colors.primary} />
            <Text style={dynamicStyles.actionButtonText}>Görev Ekle</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={dynamicStyles.actionButton}
          onPress={onAddReminder}
          activeOpacity={0.8}
        >
          <View style={dynamicStyles.buttonContent}>
            <Ionicons name="alarm-outline" size={20} color={currentTheme.colors.primary} />
            <Text style={dynamicStyles.actionButtonText}>Hatırlatıcı Ekle</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
