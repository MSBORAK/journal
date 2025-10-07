export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: number; // 1-5 scale
  tags: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoodOption {
  value: number;
  emoji: string;
  label: string;
}

export interface Theme {
  name: string;
  label: string;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
  };
}

export interface Settings {
  reminderTime?: string;
  theme: string;
  notificationsEnabled: boolean;
}

// Kişisel Gelişim Types
export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'completed' | 'paused';
  targetDate?: string;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'streak' | 'mood' | 'writing' | 'goals';
}

export interface MotivationMessage {
  id: string;
  message: string;
  category: 'daily' | 'achievement' | 'encouragement' | 'celebration' | 'love' | 'dream' | 'energy' | 'support';
  emoji: string;
}

// Sağlık & Wellness Types
export interface WellnessCheck {
  id: string;
  date: string;
  stressLevel: number; // 1-10
  energyLevel: number; // 1-10
  sleepQuality: number; // 1-10
  exerciseMinutes: number;
  waterGlasses: number;
  mood: number; // 1-5
  notes?: string;
  createdAt: string;
}

export interface WellnessInsight {
  type: 'stress' | 'energy' | 'sleep' | 'exercise' | 'hydration';
  message: string;
  recommendation: string;
  emoji: string;
  color: string;
}

// Çizim/Doodle Types
export interface Doodle {
  id: string;
  data: string; // SVG path data
  color: string;
  strokeWidth: number;
  timestamp: string;
}

export interface DrawingTool {
  name: string;
  icon: string;
  color: string;
  strokeWidth: number;
}

// Günlük Görevler & Hatırlatıcılar Types
export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  category: 'health' | 'personal' | 'work' | 'hobby' | 'custom';
  emoji: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: number; // dakika
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  time: string; // HH:MM format
  isActive: boolean;
  repeatType: 'daily' | 'weekly' | 'monthly' | 'once';
  repeatDays?: number[]; // 0-6 (Pazartesi-Pazar) for weekly
  category: 'task' | 'medicine' | 'health' | 'personal' | 'custom';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
}

export interface TaskProgress {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // 0-100
}

export interface TaskAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'completion' | 'consistency' | 'milestone';
  unlockedAt: string;
  requirement: {
    type: 'streak' | 'total' | 'percentage' | 'consecutive';
    value: number;
    period?: 'daily' | 'weekly' | 'monthly';
  };
}
