import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { soundService } from '../services/soundService';

interface TimerContextType {
  // Timer states
  isActive: boolean;
  isPaused: boolean;
  timeLeft: number;
  selectedDuration: number;
  showTimer: boolean;
  
  // Timer controls
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setDuration: (duration: number) => void;
  toggleTimer: () => void;
  
  // UI states
  showFocusMode: boolean;
  setShowFocusMode: (show: boolean) => void;
  
  // Animation values
  progressAnim: Animated.Value;
  scaleAnim: Animated.Value;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  // Timer states
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [showTimer, setShowTimer] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Timer controls
  const startTimer = async () => {
    setIsActive(true);
    setIsPaused(false);
    setShowTimer(true);
    await soundService.playTap();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const pauseTimer = async () => {
    setIsPaused(true);
    await soundService.playTap();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(selectedDuration * 60);
    setShowTimer(false);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  const setDuration = (duration: number) => {
    if (!isActive) {
      setSelectedDuration(duration);
      setTimeLeft(duration * 60);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };
  
  const toggleTimer = () => {
    if (isActive) {
      if (isPaused) {
        startTimer();
      } else {
        pauseTimer();
      }
    } else {
      startTimer();
    }
  };
  
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            // Handle completion inline to avoid dependency issues
            setIsActive(false);
            setShowTimer(false);
            soundService.playSuccess();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            setTimeout(() => {
              setShowFocusMode(true);
            }, 1000);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);
  
  // Progress animation
  useEffect(() => {
    const totalTime = selectedDuration * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, selectedDuration]);
  
  const value: TimerContextType = {
    isActive,
    isPaused,
    timeLeft,
    selectedDuration,
    showTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
    toggleTimer,
    showFocusMode,
    setShowFocusMode,
    progressAnim,
    scaleAnim,
  };
  
  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};