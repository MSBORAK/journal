import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const TIMER_STORAGE_KEY = 'active_timer_state';

interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  duration: number; // dakika cinsinden
  remainingTime: number; // saniye cinsinden
  startTime: number | null;
  type: 'focus' | 'break' | 'custom';
  label: string;
}

interface TimerContextType {
  timerState: TimerState;
  startTimer: (duration: number, type?: 'focus' | 'break' | 'custom', label?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

const defaultTimerState: TimerState = {
  isActive: false,
  isPaused: false,
  duration: 25,
  remainingTime: 0,
  startTime: null,
  type: 'focus',
  label: 'Odaklanma',
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timerState, setTimerState] = useState<TimerState>(defaultTimerState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer durumunu yükle
  useEffect(() => {
    loadTimerState();
  }, []);

  // Timer durumunu kaydet
  useEffect(() => {
    if (timerState.isActive || timerState.remainingTime > 0) {
      saveTimerState();
    }
  }, [timerState]);

  // Timer çalışırken countdown
  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          if (prev.remainingTime <= 1) {
            // Timer bitti
            handleTimerComplete();
            return {
              ...prev,
              isActive: false,
              remainingTime: 0,
            };
          }
          return {
            ...prev,
            remainingTime: prev.remainingTime - 1,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isActive, timerState.isPaused]);

  const loadTimerState = async () => {
    try {
      const stored = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (stored) {
        const parsed: TimerState = JSON.parse(stored);
        
        // Eğer timer aktifse ve başlangıç zamanı varsa, geçen süreyi hesapla
        if (parsed.isActive && parsed.startTime) {
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - parsed.startTime) / 1000);
          const newRemainingTime = Math.max(0, parsed.remainingTime - elapsedSeconds);
          
          if (newRemainingTime > 0) {
            setTimerState({
              ...parsed,
              remainingTime: newRemainingTime,
            });
          } else {
            // Timer bitmiş
            setTimerState(defaultTimerState);
            await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
          }
        }
      }
    } catch (error) {
      console.error('❌ Timer durumu yüklenemedi:', error);
    }
  };

  const saveTimerState = async () => {
    try {
      await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState));
    } catch (error) {
      console.error('❌ Timer durumu kaydedilemedi:', error);
    }
  };

  const handleTimerComplete = async () => {
    try {
      // Bildirim gönder
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Süre Doldu!',
          body: `${timerState.label} tamamlandı! Harika iş çıkardın! 🎉`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        },
      });

      // Timer durumunu temizle
      await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
      console.log('✅ Timer tamamlandı!');
    } catch (error) {
      console.error('❌ Timer tamamlama hatası:', error);
    }
  };

  const startTimer = (duration: number, type: 'focus' | 'break' | 'custom' = 'focus', label: string = 'Odaklanma') => {
    const newState: TimerState = {
      isActive: true,
      isPaused: false,
      duration,
      remainingTime: duration * 60, // dakikayı saniyeye çevir
      startTime: Date.now(),
      type,
      label,
    };
    setTimerState(newState);
    console.log(`✅ Timer başlatıldı: ${duration} dakika - ${label}`);
  };

  const pauseTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isPaused: true,
    }));
    console.log('⏸️ Timer duraklatıldı');
  };

  const resumeTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isPaused: false,
      startTime: Date.now(), // Yeni başlangıç zamanı
    }));
    console.log('▶️ Timer devam ediyor');
  };

  const stopTimer = async () => {
    setTimerState(defaultTimerState);
    await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
    console.log('⏹️ Timer durduruldu');
  };

  const resetTimer = () => {
    setTimerState(prev => ({
      ...prev,
      remainingTime: prev.duration * 60,
      startTime: Date.now(),
    }));
    console.log('🔄 Timer sıfırlandı');
  };

  return (
    <TimerContext.Provider
      value={{
        timerState,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};
