import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { soundService } from '../services/soundService';

const FOCUS_TIME_STORAGE_KEY = 'focus_time_data';
const WORK_TIME_STORAGE_KEY = 'work_time_data';

interface TimerContextType {
  // Timer states
  isActive: boolean;
  isPaused: boolean;
  timeLeft: number;
  selectedDuration: number;
  showTimer: boolean;
  
  // Focus tracking
  totalFocusTime: number; // Toplam odaklanma süresi (dakika)
  totalWorkTime: number; // Toplam çalışma süresi (dakika)
  sessionStartTime: number | null; // Mevcut session başlangıç zamanı
  
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
  
  // Focus tracking states
  const [totalFocusTime, setTotalFocusTime] = useState(0); // Bugünkü toplam odaklanma süresi (dakika)
  const [totalWorkTime, setTotalWorkTime] = useState(0); // Bugünkü toplam çalışma süresi (dakika)
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
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı
        
        // Focus time yükle
        const focusData = await AsyncStorage.getItem(FOCUS_TIME_STORAGE_KEY);
        if (focusData) {
          const focus = JSON.parse(focusData);
          if (focus.date === today) {
            setTotalFocusTime(focus.totalFocusTime || 0);
            if (__DEV__) {
              console.log('📊 Loaded today\'s focus time:', focus.totalFocusTime, 'minutes');
            }
          } else {
            setTotalFocusTime(0);
            await saveFocusTime(0);
            if (__DEV__) {
              console.log('📅 New day, resetting focus time');
            }
          }
        } else {
          setTotalFocusTime(0);
          await saveFocusTime(0);
        }
        
        // Work time yükle
        const workData = await AsyncStorage.getItem(WORK_TIME_STORAGE_KEY);
        if (workData) {
          const work = JSON.parse(workData);
          if (work.date === today) {
            setTotalWorkTime(work.totalWorkTime || 0);
            if (__DEV__) {
              console.log('📊 Loaded today\'s work time:', work.totalWorkTime, 'minutes');
            }
          } else {
            setTotalWorkTime(0);
            await saveWorkTime(0);
            if (__DEV__) {
              console.log('📅 New day, resetting work time');
            }
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
  
  // Timer controls
  const startTimer = async () => {
    setIsActive(true);
    setIsPaused(false);
    setShowTimer(true);
    setSessionStartTime(Date.now()); // Session başlangıç zamanını kaydet
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
    // Timer durdurulduğunda odaklanma ve çalışma süresini hesapla ve ekle
    if (isActive && sessionStartTime) {
      const sessionDuration = (Date.now() - sessionStartTime) / (1000 * 60); // dakika
      
      // Focus time'a ekle (functional update ile - stale closure önlenir)
      setTotalFocusTime((prevFocusTime) => {
        const newFocusTime = prevFocusTime + sessionDuration;
        saveFocusTime(newFocusTime).catch(err => {
          if (__DEV__) console.error('Error saving focus time:', err);
        });
        return newFocusTime;
      });
      
      // Work time'a ekle (functional update ile - stale closure önlenir)
      setTotalWorkTime((prevWorkTime) => {
        const newWorkTime = prevWorkTime + sessionDuration;
        saveWorkTime(newWorkTime).catch(err => {
          if (__DEV__) console.error('Error saving work time:', err);
        });
        if (__DEV__) {
          console.log('⏸️ Paused timer, added', sessionDuration.toFixed(2), 'minutes');
        }
        return newWorkTime;
      });
      
      setSessionStartTime(null); // Session'ı sıfırla
    }
    
    setIsPaused(true);
    await soundService.playTap();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const resetTimer = async () => {
    // Eğer timer aktifse, odaklanma ve çalışma süresini hesapla ve ekle
    if (isActive && sessionStartTime) {
      const sessionDuration = (Date.now() - sessionStartTime) / (1000 * 60); // dakika
      
      // Focus time'a ekle (functional update ile - stale closure önlenir)
      setTotalFocusTime((prevFocusTime) => {
        const newFocusTime = prevFocusTime + sessionDuration;
        saveFocusTime(newFocusTime).catch(err => {
          if (__DEV__) console.error('Error saving focus time:', err);
        });
        return newFocusTime;
      });
      
      // Work time'a ekle (functional update ile - stale closure önlenir)
      setTotalWorkTime((prevWorkTime) => {
        const newWorkTime = prevWorkTime + sessionDuration;
        saveWorkTime(newWorkTime).catch(err => {
          if (__DEV__) console.error('Error saving work time:', err);
        });
        if (__DEV__) {
          console.log('🔄 Reset timer, added', sessionDuration.toFixed(2), 'minutes. Focus:', (prevWorkTime + sessionDuration).toFixed(2), 'Work:', newWorkTime.toFixed(2));
        }
        return newWorkTime;
      });
    }
    
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(selectedDuration * 60);
    setShowTimer(false);
    setSessionStartTime(null); // Session'ı sıfırla
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
            // Odaklanma ve çalışma süresini hesapla ve ekle
            // Functional update kullanarak stale closure sorununu önle
            if (sessionStartTime) {
              const sessionDuration = (Date.now() - sessionStartTime) / (1000 * 60); // dakika
              
              // Focus time'a ekle (functional update ile - stale closure önlenir)
              setTotalFocusTime((prevFocusTime) => {
                const newFocusTime = prevFocusTime + sessionDuration;
                saveFocusTime(newFocusTime).catch(err => {
                  if (__DEV__) console.error('Error saving focus time:', err);
                });
                if (__DEV__) {
                  console.log('✅ Timer completed, added', sessionDuration.toFixed(2), 'minutes to focus time. Total:', newFocusTime.toFixed(2));
                }
                return newFocusTime;
              });
              
              // Work time'a ekle (functional update ile - stale closure önlenir)
              setTotalWorkTime((prevWorkTime) => {
                const newWorkTime = prevWorkTime + sessionDuration;
                saveWorkTime(newWorkTime).catch(err => {
                  if (__DEV__) console.error('Error saving work time:', err);
                });
                if (__DEV__) {
                  console.log('✅ Timer completed, added', sessionDuration.toFixed(2), 'minutes to work time. Total:', newWorkTime.toFixed(2));
                }
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
  }, [isActive, isPaused, timeLeft, sessionStartTime, saveFocusTime, saveWorkTime]);
  
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
    progressAnim,
    scaleAnim,
  };
  
  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};