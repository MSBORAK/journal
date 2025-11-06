export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  appAlias?: string; // Uygulamanın kullanıcıya hitap etme şekli (örn: "Rhythm")
  nickname?: string; // Kullanıcıya nasıl hitap edileceği (örn: "Luna", "Melis", "Friend")
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
  answers?: {
    happiness?: string;
    lesson?: string;
    communication?: string;
    challenge?: string;
    gratitude?: string;
    energy?: string;
    accomplishment?: string;
    emotion?: string;
    growth?: string;
    tomorrow?: string;
  };
  freeWriting?: string;
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

// Kişisel Gelişim Types - Goal artık Hayal & Hedef Panosu'nda tanımlı

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'streak' | 'mood' | 'writing' | 'goals';
}

// Habit Tracking Types
export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  category: 'health' | 'productivity' | 'mindfulness' | 'learning' | 'social' | 'creative';
  frequency: 'daily' | 'weekly' | 'custom';
  target: number; // hedef sayı/süre
  unit: 'times' | 'minutes' | 'glasses' | 'pages' | 'hours';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value: number; // gerçekleşen miktar
  notes?: string;
  createdAt: string;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  totalCompletions: number;
  completionRate: number; // yüzde
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

// Günlük Aktiviteler - Basit sağlık takibi
export interface HealthData {
  date: string; // YYYY-MM-DD format
  water: number; // 0-12 bardak
  exercise: number; // 0-120 dakika
  sleep: number; // 0-12 saat
  meditation: number; // 0-60 dakika
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
  date: string; // YYYY-MM-DD format - görevin planlandığı/tamamlanması gereken tarih
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: number; // dakika - görevi tamamlamak için tahmini süre
  frequency?: 'daily' | 'weekly' | 'monthly' | 'once'; // Görev tekrar tipi
  dueDate?: string; // YYYY-MM-DD format - son tamamlanma tarihi (gelecek görevler için)
  dueTime?: string; // HH:MM format - son tamamlanma saati (gelecek görevler için)
  // Akıllı Entegrasyon
  linkedReminderId?: string; // Bağlı hatırlatıcı ID'si
  hasReminder?: boolean; // Hatırlatıcı var mı?
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  time: string; // HH:MM format
  date?: string; // YYYY-MM-DD format for scheduled reminders
  isActive: boolean;
  repeatType: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  repeatDays?: number[]; // 0-6 (Pazartesi-Pazar) for weekly
  category: 'general' | 'medicine' | 'appointment' | 'birthday' | 'meeting' | 'health' | 'exercise' | 'meal' | 'personal' | 'work' | 'study' | 'custom';
  priority: 'low' | 'medium' | 'high';
  reminderType: 'today' | 'scheduled'; // Bugün için mi yoksa gelecek tarih için mi
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  // Akıllı Entegrasyon
  linkedTaskId?: string; // Bağlı görev ID'si
  isTaskReminder?: boolean; // Görev hatırlatıcısı mı?
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

// Hayal & Hedef Panosu Types 🌠
export interface Dream {
  id: string;
  title: string;
  description: string;
  emoji: string;
  imageUrl?: string; // Opsiyonel fotoğraf
  category: 'personal' | 'career' | 'health' | 'spiritual' | 'relationship' | 'travel' | 'learning' | 'creative' | 'financial' | 'custom';
  notes?: string; // İlham notları
  tags?: string[]; // Etiketler
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean; // Arşivlenen hayaller
  isFavorite?: boolean; // Favori hayaller
  isCompleted?: boolean; // Gerçekleşen hayaller
  completedAt?: string; // Gerçekleşme tarihi
}

export interface Goal {
  id: string;
  dreamId?: string; // Hangi hayale bağlı (opsiyonel)
  title: string;
  description: string;
  emoji: string;
  type: 'short' | 'medium' | 'long'; // Kısa/Orta/Uzun vadeli
  category: 'personal' | 'career' | 'health' | 'spiritual' | 'relationship' | 'travel' | 'learning' | 'creative' | 'financial' | 'custom';
  targetDate?: string; // Hedef tarihi
  progress: number; // 0-100
  milestones: GoalMilestone[]; // Ara hedefler
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  reminder?: boolean; // Hatırlatıcı var mı?
}

export interface GoalMilestone {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  emoji?: string;
}

export interface Promise {
  id: string;
  text: string; // "Kendime söz veriyorum..."
  emoji: string;
  createdAt: string;
  isActive: boolean;
  isCompleted?: boolean; // Söz tutuldu mu
  completedAt?: string; // Söz tutulma tarihi
}
