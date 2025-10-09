import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '../contexts/TimerContext';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function FloatingTimer() {
  const { timerState, pauseTimer, resumeTimer, stopTimer } = useTimer();
  const { currentTheme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Timer aktif olduğunda slide in
  useEffect(() => {
    if (timerState.isActive) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [timerState.isActive]);

  // Pulse animasyonu (timer çalışırken)
  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [timerState.isActive, timerState.isPaused]);

  if (!timerState.isActive) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerIcon = () => {
    switch (timerState.type) {
      case 'focus':
        return '🎯';
      case 'break':
        return '☕';
      default:
        return '⏱️';
    }
  };

  const getTimerColor = () => {
    switch (timerState.type) {
      case 'focus':
        return '#8b5cf6';
      case 'break':
        return '#10b981';
      default:
        return currentTheme.colors.primary;
    }
  };

  const handlePauseResume = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (timerState.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleStop = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    stopTimer();
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 10,
      right: 16,
      zIndex: 9999,
      elevation: 10,
    },
    timerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: getTimerColor(),
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      gap: 8,
    },
    timerIcon: {
      fontSize: 20,
    },
    timerContent: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    timerLabel: {
      fontSize: 10,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '600',
    },
    timerTime: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    timerControls: {
      flexDirection: 'row',
      gap: 8,
      marginLeft: 4,
    },
    controlButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <Animated.View
      style={[
        dynamicStyles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <View style={dynamicStyles.timerCard}>
        <Text style={dynamicStyles.timerIcon}>{getTimerIcon()}</Text>
        
        <View style={dynamicStyles.timerContent}>
          <Text style={dynamicStyles.timerLabel}>{timerState.label}</Text>
          <Text style={dynamicStyles.timerTime}>{formatTime(timerState.remainingTime)}</Text>
        </View>

        <View style={dynamicStyles.timerControls}>
          <TouchableOpacity
            style={dynamicStyles.controlButton}
            onPress={handlePauseResume}
            activeOpacity={0.7}
          >
            <Ionicons
              name={timerState.isPaused ? 'play' : 'pause'}
              size={14}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamicStyles.controlButton}
            onPress={handleStop}
            activeOpacity={0.7}
          >
            <Ionicons name="stop" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
