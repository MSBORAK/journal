import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { DailyTask } from '../types';

interface TaskCardProps {
  task: DailyTask;
  onComplete: (taskId: string) => void;
  style?: any;
}

export default function TaskCard({ task, onComplete, style }: TaskCardProps) {
  const { currentTheme } = useTheme();

  const dynamicStyles = StyleSheet.create({
    taskCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: 'rgba(0,0,0,0.25)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 4,
    },
    completedTaskCard: {
      opacity: 0.6,
      backgroundColor: currentTheme.colors.secondary,
    },
    taskLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    taskEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    taskContent: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
      fontFamily: 'Poppins_600SemiBold',
    },
    completedTaskTitle: {
      textDecorationLine: 'line-through',
      opacity: 0.7,
    },
    taskDetails: {
      fontSize: 14,
      color: currentTheme.colors.muted,
      fontFamily: 'Poppins_400Regular',
    },
    completeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    completedButton: {
      backgroundColor: currentTheme.colors.primary,
    },
  });

  return (
    <View style={[
      dynamicStyles.taskCard,
      task.isCompleted && dynamicStyles.completedTaskCard,
      style
    ]}>
      <View style={dynamicStyles.taskLeft}>
        <Text style={dynamicStyles.taskEmoji}>{task.emoji || '📝'}</Text>
        <View style={dynamicStyles.taskContent}>
          <Text style={[
            dynamicStyles.taskTitle,
            task.isCompleted && dynamicStyles.completedTaskTitle
          ]}>
            {task.title}
          </Text>
          <Text style={dynamicStyles.taskDetails}>
            {task.category} • {task.estimatedTime ? `${task.estimatedTime} dk` : '15 dk'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          dynamicStyles.completeButton,
          task.isCompleted && dynamicStyles.completedButton
        ]}
        onPress={() => onComplete(task.id)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={task.isCompleted ? "checkmark-done" : "checkmark"} 
          size={20} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
}
