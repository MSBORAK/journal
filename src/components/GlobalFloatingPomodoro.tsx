import React from 'react';
import { View } from 'react-native';
import { usePomodoro } from '../contexts/PomodoroContext';
import FloatingPomodoro from './FloatingPomodoro';

export default function GlobalFloatingPomodoro() {
  const {
    isActive,
    isPaused,
    currentSession,
    timeLeft,
    isFloating,
    setIsFloating,
  } = usePomodoro();

  if (!isFloating) return null;

  return (
    <View style={{ position: 'absolute', zIndex: 1000, elevation: 10 }}>
      <FloatingPomodoro
        isActive={isActive && !isPaused}
        timeLeft={timeLeft}
        sessionType={currentSession}
        onPress={() => setIsFloating(false)}
        onClose={() => setIsFloating(false)}
      />
    </View>
  );
}
