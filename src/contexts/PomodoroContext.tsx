import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PomodoroState {
  isActive: boolean;
  isPaused: boolean;
  currentSession: 'work' | 'break' | 'longBreak';
  timeLeft: number;
  completedPomodoros: number;
  totalSessions: number;
  isFloating: boolean;
}

interface PomodoroContextType extends PomodoroState {
  setIsActive: (active: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  setCurrentSession: (session: 'work' | 'break' | 'longBreak') => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  setCompletedPomodoros: (count: number | ((prev: number) => number)) => void;
  setTotalSessions: (count: number | ((prev: number) => number)) => void;
  setIsFloating: (floating: boolean) => void;
  resetPomodoro: () => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

interface PomodoroProviderProps {
  children: ReactNode;
}

export function PomodoroProvider({ children }: PomodoroProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'break' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isFloating, setIsFloating] = useState(false);

  const resetPomodoro = () => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentSession('work');
    setTimeLeft(25 * 60);
    setCompletedPomodoros(0);
    setTotalSessions(0);
    setIsFloating(false);
  };

  const value: PomodoroContextType = {
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
    resetPomodoro,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
