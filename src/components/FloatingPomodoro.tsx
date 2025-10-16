import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface FloatingPomodoroProps {
  isActive: boolean;
  timeLeft: number;
  sessionType: 'work' | 'break' | 'longBreak';
  onPress: () => void;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FloatingPomodoro({ 
  isActive, 
  timeLeft, 
  sessionType, 
  onPress, 
  onClose 
}: FloatingPomodoroProps) {
  const { currentTheme } = useTheme();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Last tap for double tap detection
  const lastTap = useRef(0);

  // Fixed position - no dragging
  const fixedX = screenWidth - 80;
  const fixedY = 120;

  useEffect(() => {
    // Fade in animation
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation when active
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);


  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionInfo = () => {
    switch (sessionType) {
      case 'work':
        return { emoji: '🍅', color: currentTheme.colors.danger };
      case 'break':
        return { emoji: '☕', color: currentTheme.colors.success };
      case 'longBreak':
        return { emoji: '🌅', color: currentTheme.colors.primary };
      default:
        return { emoji: '🍅', color: currentTheme.colors.danger };
    }
  };

  const sessionInfo = getSessionInfo();

  const dynamicStyles = StyleSheet.create({
    container: {
      position: 'absolute',
      zIndex: 1000,
      elevation: 10,
      left: fixedX,
      top: fixedY,
    },
    bubble: {
      width: 60,
      height: 60,
      borderRadius: 30,
      shadowColor: sessionInfo.color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    bubbleContent: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    timeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      marginBottom: 2,
    },
    emoji: {
      fontSize: 16,
      marginBottom: 2,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isActive ? currentTheme.colors.success : currentTheme.colors.muted,
      position: 'absolute',
      top: 4,
      right: 4,
      borderWidth: 1.5,
      borderColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    closeButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
  });

  return (
    <Animated.View
      style={[
        dynamicStyles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={dynamicStyles.bubble}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[sessionInfo.color || currentTheme.colors.primary, (sessionInfo.color || currentTheme.colors.primary) + 'DD']}
          style={dynamicStyles.bubbleContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={dynamicStyles.timeText}>{formatTime(timeLeft)}</Text>
          <Text style={dynamicStyles.emoji}>{sessionInfo.emoji}</Text>
          <View style={dynamicStyles.statusDot} />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={dynamicStyles.closeButton}
        onPress={handleClose}
        activeOpacity={0.8}
      >
        <Ionicons name="close" size={12} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
}
