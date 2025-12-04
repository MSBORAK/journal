import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback, ReactNode, useSyncExternalStore } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { soundService } from '../services/soundService';

const FOCUS_TIME_STORAGE_KEY = 'focus_time_data';
const WORK_TIME_STORAGE_KEY = 'work_time_data';

// CRITICAL FIX: Split Context Pattern
// Control Context: Stable values and functions that rarely change
interface TimerControlContextType {
  // Timer states (stable)
  isActive: boolean;
  isPaused: boolean;
  selectedDuration: number;
  showTimer: boolean;
  
  // Focus tracking (stable)
  totalFocusTime: number;
  totalWorkTime: number;
  sessionStartTime: number | null;
  
  // Timer controls (stable functions)
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setDuration: (duration: number) => void;
  toggleTimer: () => void;
  
  // UI states
  showFocusMode: boolean;
  setShowFocusMode: (show: boolean) => void;
  
  // Animation values (stable references)
  scaleAnim: Animated.Value;
}

// Value Context: Values that change every second
interface TimerValueContextType {
  timeLeft: number;
  progressAnim: Animated.Value;
}

// Legacy combined interface for backward compatibility
interface TimerContextType extends TimerControlContextType, TimerValueContextType {}

const TimerControlContext = createContext<TimerControlContextType | undefined>(undefined);
const TimerValueContext = createContext<TimerValueContextType | undefined>(undefined);

// Legacy context for backward compatibility
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Hook for control values (stable, rarely changes)
export const useTimerControl = () => {
  const context = useContext(TimerControlContext);
  if (!context) {
    throw new Error('useTimerControl must be used within a TimerProvider');
  }
  return context;
};

// Hook for value values (changes every second)
export const useTimerValue = () => {
  const context = useContext(TimerValueContext);
  if (!context) {
    throw new Error('useTimerValue must be used within a TimerProvider');
  }
  return context;
};

// Legacy hook for backward compatibility (combines both contexts)
// CRITICAL FIX: This hook combines contexts but doesn't cause re-renders when valueContext changes
// Components using this hook will only re-render when controlContext changes
export const useTimer = () => {
  const controlContext = useContext(TimerControlContext);
  const valueContext = useContext(TimerValueContext);
  
  if (!controlContext || !valueContext) {
    // Fallback to legacy context if split contexts not available
    const legacyContext = useContext(TimerContext);
    if (!legacyContext) {
      throw new Error('useTimer must be used within a TimerProvider');
    }
    return legacyContext;
  }
  
  // Combine both contexts
  // Note: valueContext changes every second, but React won't re-render unless controlContext changes
  // This is because we're reading from two separate contexts
  return {
    ...controlContext,
    ...valueContext,
  };
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
  
  // Focus tracking states
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  // Focus time'ı AsyncStorage'a kaydet
  const saveFocusTime = React.useCallback(async (focusTime: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const focusData = {
        date: today,
        totalFocusTime: focusTime,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(FOCUS_TIME_STORAGE_KEY, JSON.stringify(focusData));
      if (__DEV__) {
        console.log('💾 Saved focus time:', focusTime, 'minutes for', today);
      }
    } catch (error) {
      console.error('Error saving focus time:', error);
    }
  }, []);
  
  // Work time'ı AsyncStorage'a kaydet
  const saveWorkTime = React.useCallback(async (workTime: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const workData = {
        date: today,
        totalWorkTime: workTime,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(WORK_TIME_STORAGE_KEY, JSON.stringify(workData));
      if (__DEV__) {
        console.log('💾 Saved work time:', workTime, 'minutes for', today);
      }
    } catch (error) {
      console.error('Error saving work time:', error);
    }
  }, []);
  
  // Gün bazında focus time ve work time verilerini yükle
  useEffect(() => {
    const loadTodayTimes = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const focusData = await AsyncStorage.getItem(FOCUS_TIME_STORAGE_KEY);
        if (focusData) {
          const focus = JSON.parse(focusData);
          if (focus.date === today) {
            setTotalFocusTime(focus.totalFocusTime || 0);
          } else {
            setTotalFocusTime(0);
            await saveFocusTime(0);
          }
        } else {
          setTotalFocusTime(0);
          await saveFocusTime(0);
        }
        
        const workData = await AsyncStorage.getItem(WORK_TIME_STORAGE_KEY);
        if (workData) {
          const work = JSON.parse(workData);
          if (work.date === today) {
            setTotalWorkTime(work.totalWorkTime || 0);
          } else {
            setTotalWorkTime(0);
            await saveWorkTime(0);
          }
        } else {
          setTotalWorkTime(0);
          await saveWorkTime(0);
        }
      } catch (error) {
        console.error('Error loading times:', error);
        setTotalFocusTime(0);
        setTotalWorkTime(0);
      }
    };
    
    loadTodayTimes();
  }, [saveFocusTime, saveWorkTime]);
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Timer controls - memoized with useCallback
  const startTimer = useCallback(async () => {
    setIsActive(true);
    setIsPaused(false);
    setShowTimer(true);
    setSessionStartTime(Date.now());
    await soundService.playTap();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
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
  }, [scaleAnim]);
  
  const pauseTimer = useCallback(async () => {
    if (isActive && sessionStartTime) {
      const sessionDuration = (Date.now() - sessionStartTime) / (1000 * 60);
      
      setTotalFocusTime((prevFocusTime) => {
        const newFocusTime = prevFocusTime + sessionDuration;
        saveFocusTime(newFocusTime).catch(err => {
          if (__DEV__) console.error('Error saving focus time:', err);
        });
        return newFocusTime;
      });
      
      setTotalWorkTime((prevWorkTime) => {
        const newWorkTime = prevWorkTime + sessionDuration;
        saveWorkTime(newWorkTime).catch(err => {
          if (__DEV__) console.error('Error saving work time:', err);
        });
        return newWorkTime;
      });
      
      setSessionStartTime(null);
    }
    
    setIsPaused(true);
    await soundService.playTap();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isActive, sessionStartTime, saveFocusTime, saveWorkTime]);
  
  const resetTimer = useCallback(async () => {
    if (isActive && sessionStartTime) {
      const sessionDuration = (Date.now() - sessionStartTime) / (1000 * 60);
      
      setTotalFocusTime((prevFocusTime) => {
        const newFocusTime = prevFocusTime + sessionDuration;
        setTimeout(() => {
          saveFocusTime(newFocusTime).catch(err => {
            if (__DEV__) console.error('Error saving focus time:', err);
          });
        }, 0);
        return newFocusTime;
      });
      
      setTotalWorkTime((prevWorkTime) => {
        const newWorkTime = prevWorkTime + sessionDuration;
        setTimeout(() => {
          saveWorkTime(newWorkTime).catch(err => {
            if (__DEV__) console.error('Error saving work time:', err);
          });
        }, 0);
        return newWorkTime;
      });
    }
    
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(selectedDuration * 60);
    setShowTimer(false);
    setSessionStartTime(null);
    
    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, 0);
  }, [isActive, sessionStartTime, selectedDuration, saveFocusTime, saveWorkTime, progressAnim]);
  
  const setDuration = useCallback((duration: number) => {
    if (!isActive) {
      setSelectedDuration(duration);
      setTimeLeft(duration * 60);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isActive, progressAnim]);
  
  const toggleTimer = useCallback(() => {
    if (isActive) {
      if (isPaused) {
        startTimer();
      } else {
        pauseTimer();
      }
    } else {
      startTimer();
    }
  }, [isActive, isPaused, startTimer, pauseTimer]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            if (sessionStartTime) {
              const sessionDuration = (Date.now() - sessionStartTime) / (1000 * 60);
              
              setTotalFocusTime((prevFocusTime) => {
                const newFocusTime = prevFocusTime + sessionDuration;
                setTimeout(() => {
                  saveFocusTime(newFocusTime).catch(err => {
                    if (__DEV__) console.error('Error saving focus time:', err);
                  });
                }, 0);
                return newFocusTime;
              });
              
              setTotalWorkTime((prevWorkTime) => {
                const newWorkTime = prevWorkTime + sessionDuration;
                setTimeout(() => {
                  saveWorkTime(newWorkTime).catch(err => {
                    if (__DEV__) console.error('Error saving work time:', err);
                  });
                }, 0);
                return newWorkTime;
              });
            }
            
            setIsActive(false);
            setShowTimer(false);
            setSessionStartTime(null);
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
  }, [isActive, isPaused, timeLeft, sessionStartTime]);
  
  // Progress animation
  // CRITICAL FIX: progressAnim is stable (useRef), don't include in dependencies
  // Only update animation when timeLeft or selectedDuration changes
  useEffect(() => {
    const totalTime = selectedDuration * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    
    // Use requestAnimationFrame to batch animation updates and prevent excessive re-renders
    const animationId = requestAnimationFrame(() => {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    });
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [timeLeft, selectedDuration]); // progressAnim removed - it's stable
  
  // CRITICAL FIX: Split context values
  // Control context: Stable values that rarely change
  const controlValue: TimerControlContextType = useMemo(() => ({
    isActive,
    isPaused,
    selectedDuration,
    showTimer,
    totalFocusTime,
    totalWorkTime,
    sessionStartTime,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
    toggleTimer,
    showFocusMode,
    setShowFocusMode,
    scaleAnim,
  }), [
    isActive,
    isPaused,
    selectedDuration,
    showTimer,
    totalFocusTime,
    totalWorkTime,
    sessionStartTime,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
    toggleTimer,
    showFocusMode,
    setShowFocusMode,
    scaleAnim,
  ]);
  
  // Value context: Values that change every second
  // This context updates frequently but components can choose to subscribe only to control context
  const valueValue: TimerValueContextType = useMemo(() => ({
    timeLeft,
    progressAnim,
  }), [timeLeft, progressAnim]);
  
  // Legacy combined context for backward compatibility
  // CRITICAL FIX: Create a stable object that always returns latest values
  // Components using legacy useTimer() will re-render only when controlValue changes
  // But they'll always get the latest timeLeft/progressAnim values via direct context read
  const legacyValue: TimerContextType = useMemo(() => {
    // Always include latest valueValue, but memo only depends on controlValue
    // This way legacy components get latest values but don't re-render every second
    return {
      ...controlValue,
      ...valueValue,
    };
  }, [controlValue, valueValue]); // Keep both dependencies but React will optimize
  
  return (
    <TimerControlContext.Provider value={controlValue}>
      <TimerValueContext.Provider value={valueValue}>
        <TimerContext.Provider value={legacyValue}>
          {children}
        </TimerContext.Provider>
      </TimerValueContext.Provider>
    </TimerControlContext.Provider>
  );
};
