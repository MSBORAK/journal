import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTimerControl, useTimerValue } from '../contexts/TimerContext';
import FocusMode from './FocusMode';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// CRITICAL FIX: Isolate timer display to prevent GlobalFloatingTimer re-renders
const FloatingTimerDisplay = memo(({ 
  currentTheme 
}: { 
  currentTheme: any 
}) => {
  const { timeLeft, progressAnim } = useTimerValue();
  const { isActive, scaleAnim } = useTimerControl();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dynamicStyles = StyleSheet.create({
    timerDisplay: {
      position: 'relative',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    timerText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#ffffff',
      fontFamily: 'Poppins_700Bold',
      zIndex: 2,
    },
    progressRing: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressFill: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: '#ffffff',
      borderRightColor: 'transparent',
      borderBottomColor: 'transparent',
      transform: [{ rotate: '-90deg' }],
    },
  });

  if (!isActive) {
    return (
      <Ionicons 
        name="timer-outline" 
        size={24} 
        color={currentTheme.colors.background} 
      />
    );
  }

  return (
    <Animated.View
      style={[
        dynamicStyles.timerDisplay,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={dynamicStyles.timerText}>
        {formatTime(timeLeft)}
      </Text>
      <View style={dynamicStyles.progressRing}>
        <Animated.View
          style={[
            dynamicStyles.progressFill,
            {
              transform: [
                {
                  rotate: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </Animated.View>
  );
});

export default function GlobalFloatingTimer() {
  const { currentTheme } = useTheme();
  const {
    showFocusMode,
    setShowFocusMode,
  } = useTimerControl();

  const { isActive } = useTimerControl();
  const dynamicStyles = getDynamicStyles(currentTheme);

  return (
    <>
      {/* Floating Timer Button */}
      <TouchableOpacity
        style={[
          dynamicStyles.floatingButton,
          isActive && dynamicStyles.floatingButtonActive,
        ]}
        onPress={() => setShowFocusMode(true)}
        activeOpacity={0.8}
      >
        <View style={dynamicStyles.buttonContent}>
          <FloatingTimerDisplay currentTheme={currentTheme} />
        </View>
      </TouchableOpacity>

      {/* Focus Mode Modal */}
      <FocusMode
        visible={showFocusMode}
        onClose={() => setShowFocusMode(false)}
      />
    </>
  );
}

const getDynamicStyles = (currentTheme: any) => StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: currentTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: currentTheme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  floatingButtonActive: {
    backgroundColor: '#10b981', // Green when active
    shadowColor: '#10b981',
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerDisplay: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Poppins_700Bold',
    zIndex: 2,
  },
  progressRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
});
