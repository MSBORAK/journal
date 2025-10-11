import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import * as Haptics from 'expo-haptics';

interface PomodoroTimerProps {
  onComplete?: () => void;
}

export default function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const { currentTheme } = useTheme();
  const {
    isActive,
    isPaused,
    currentSession,
    timeLeft,
    completedPomodoros,
    totalSessions,
    isFloating,
    setIsActive,
    setIsPaused,
    setCurrentSession,
    setTimeLeft,
    setCompletedPomodoros,
    setTotalSessions,
    setIsFloating,
  } = usePomodoro();

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            // Session completed
            setIsActive(false);
            setIsPaused(false);
            Vibration.vibrate([500, 500, 500]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            if (currentSession === 'work') {
              setCompletedPomodoros((prev) => prev + 1);
              if ((completedPomodoros + 1) % 4 === 0) {
                setCurrentSession('longBreak');
                setTimeLeft(15 * 60); // 15 minutes
              } else {
                setCurrentSession('break');
                setTimeLeft(5 * 60); // 5 minutes
              }
            } else {
              setCurrentSession('work');
              setTimeLeft(25 * 60); // 25 minutes
            }
            
            setTotalSessions((prev) => prev + 1);
            onComplete?.();
            return getCurrentSessionDuration();
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, currentSession, completedPomodoros, onComplete]);

  useEffect(() => {
    const totalTime = getCurrentSessionDuration();
    const progress = (totalTime - timeLeft) / totalTime;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, currentSession]);

  const getCurrentSessionDuration = () => {
    switch (currentSession) {
      case 'work': return 25 * 60;
      case 'break': return 5 * 60;
      case 'longBreak': return 15 * 60;
      default: return 25 * 60;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isActive) {
      setIsPaused(!isPaused);
    } else {
      setIsActive(true);
      setIsPaused(false);
    }
    
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(getCurrentSessionDuration());
    setCompletedPomodoros(0);
    setTotalSessions(0);
    setCurrentSession('work');
    progressAnim.setValue(0);
  };

  const switchSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(false);
    setIsPaused(false);
    
    if (currentSession === 'work') {
      setCurrentSession('break');
      setTimeLeft(5 * 60);
    } else if (currentSession === 'break') {
      setCurrentSession('longBreak');
      setTimeLeft(15 * 60);
    } else {
      setCurrentSession('work');
      setTimeLeft(25 * 60);
    }
    
    progressAnim.setValue(0);
  };

  const getSessionInfo = () => {
    switch (currentSession) {
      case 'work':
        return { 
          emoji: '🍅', 
          color: '#EF4444', 
          title: 'Odaklanma Zamanı!',
          bgColor: '#FEE2E2'
        };
      case 'break':
        return { 
          emoji: '☕', 
          color: '#10B981', 
          title: 'Kısa Mola!',
          bgColor: '#D1FAE5'
        };
      case 'longBreak':
        return { 
          emoji: '🌅', 
          color: '#8B5CF6', 
          title: 'Uzun Mola!',
          bgColor: '#EDE9FE'
        };
      default:
        return { 
          emoji: '🍅', 
          color: '#EF4444', 
          title: 'Odaklanma Zamanı!',
          bgColor: '#FEE2E2'
        };
    }
  };

  const sessionInfo = getSessionInfo();

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      marginHorizontal: 20,
      marginBottom: 12,
      shadowColor: sessionInfo.color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderTopWidth: 2,
      borderTopColor: sessionInfo.color,
      transform: [{ translateY: -1 }],
      overflow: 'hidden',
    },
    gradientBackground: {
      padding: 12,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIcon: {
      fontSize: 16,
      marginRight: 6,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressBadge: {
      backgroundColor: sessionInfo.color + '20',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 3,
      marginRight: 6,
    },
    progressText: {
      fontSize: 10,
      fontWeight: '600',
      color: sessionInfo.color,
    },
    floatingButton: {
      backgroundColor: sessionInfo.color + '15',
      borderRadius: 8,
      padding: 4,
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    timerSection: {
      flex: 1,
      alignItems: 'center',
    },
    circularProgress: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: currentTheme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 2,
      borderColor: sessionInfo.color + '30',
    },
    progressRing: {
      position: 'absolute',
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
    },
    progressFill: {
      position: 'absolute',
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 2,
      borderColor: sessionInfo.color,
      transform: [{ rotate: '-90deg' }],
    },
    timeDisplay: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 2,
    },
    controlsSection: {
      flex: 1,
      alignItems: 'center',
    },
    controlsColumn: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 6,
    },
    controlButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    playButton: {
      backgroundColor: sessionInfo.color,
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    pauseButton: {
      backgroundColor: '#F59E0B',
    },
    resetButton: {
      backgroundColor: currentTheme.colors.border,
    },
    sessionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: sessionInfo.color,
      textAlign: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: currentTheme.colors.border,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: sessionInfo.color,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
    },
  });

  return (
    <Animated.View style={[dynamicStyles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={[sessionInfo.color + '15', sessionInfo.color + '08']}
        style={dynamicStyles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Row */}
        <View style={dynamicStyles.headerRow}>
          <View style={dynamicStyles.headerLeft}>
            <Text style={dynamicStyles.headerIcon}>{sessionInfo.emoji}</Text>
            <Text style={dynamicStyles.headerTitle}>Pomodoro</Text>
          </View>
          <View style={dynamicStyles.headerRight}>
            <View style={dynamicStyles.progressBadge}>
              <Text style={dynamicStyles.progressText}>{completedPomodoros}/4</Text>
            </View>
            <TouchableOpacity
              style={dynamicStyles.floatingButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsFloating(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="expand-outline" size={12} color={sessionInfo.color} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Row */}
        <View style={dynamicStyles.mainRow}>
          {/* Timer Section */}
          <View style={dynamicStyles.timerSection}>
            <View style={dynamicStyles.circularProgress}>
              <View style={dynamicStyles.progressRing} />
              <Animated.View
                style={[
                  dynamicStyles.progressFill,
                  {
                    borderLeftColor: 'transparent',
                    borderBottomColor: 'transparent',
                    borderRightColor: 'transparent',
                  },
                ]}
              />
              <Text style={dynamicStyles.timeDisplay}>{formatTime(timeLeft)}</Text>
            </View>
          </View>

          {/* Controls Section */}
          <View style={dynamicStyles.controlsSection}>
            <View style={dynamicStyles.controlsColumn}>
              <TouchableOpacity
                style={[dynamicStyles.controlButton, dynamicStyles.resetButton]}
                onPress={resetTimer}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={14} color={currentTheme.colors.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  dynamicStyles.controlButton,
                  dynamicStyles.playButton,
                  isPaused && dynamicStyles.pauseButton,
                ]}
                onPress={toggleTimer}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isActive && !isPaused ? 'pause' : 'play'}
                  size={18}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[dynamicStyles.controlButton, dynamicStyles.resetButton]}
                onPress={switchSession}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal" size={14} color={currentTheme.colors.secondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={dynamicStyles.sessionTitle}>{sessionInfo.title}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={dynamicStyles.statsRow}>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{completedPomodoros}</Text>
            <Text style={dynamicStyles.statLabel}>Tamamlanan</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{totalSessions}</Text>
            <Text style={dynamicStyles.statLabel}>Oturum</Text>
          </View>
          <View style={dynamicStyles.statItem}>
            <Text style={dynamicStyles.statValue}>{Math.floor(completedPomodoros / 4)}</Text>
            <Text style={dynamicStyles.statLabel}>Uzun Mola</Text>
          </View>
        </View>
      </LinearGradient>

    </Animated.View>
  );
}