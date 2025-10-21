/**
 * İçgörü Motoru
 * Kullanıcı verilerinden anlamlı içgörüler üretir (AI olmadan)
 */

import { DiaryEntry } from '../types';

export interface Insight {
  type: 'mood' | 'habit' | 'streak' | 'pattern' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  icon: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
  data?: any;
}

/**
 * Mood Analizi
 */
export const analyzeMood = (entries: DiaryEntry[]): Insight[] => {
  const insights: Insight[] = [];
  
  if (entries.length === 0) return insights;

  // Son 7 günün mood ortalaması
  const last7Days = entries.slice(0, 7);
  const avgMood = last7Days.reduce((sum, entry) => sum + entry.mood, 0) / last7Days.length;
  
  if (avgMood >= 4) {
    insights.push({
      type: 'mood',
      title: 'Great Week! 😊',
      description: `Your average mood in the last 7 days is ${avgMood.toFixed(1)}/5. You're doing great!`,
      icon: '🎉',
      color: '#10b981',
      priority: 'high',
      data: { avgMood }
    });
  } else if (avgMood < 2.5) {
    insights.push({
      type: 'mood',
      title: 'Tough Period 💙',
      description: `The last few days have been a bit difficult. Take extra good care of yourself.`,
      icon: '💙',
      color: '#3b82f6',
      priority: 'high',
      data: { avgMood }
    });
  }

  // Mood trendi
  if (entries.length >= 7) {
    const firstHalf = entries.slice(3, 7).reduce((sum, e) => sum + e.mood, 0) / 4;
    const secondHalf = entries.slice(0, 3).reduce((sum, e) => sum + e.mood, 0) / 3;
    
    if (secondHalf > firstHalf + 0.5) {
      insights.push({
        type: 'mood',
        title: 'Rising Trend! 📈',
        description: 'Your mood has been rising in recent days. Keep it up!',
        icon: '📈',
        color: '#10b981',
        priority: 'medium'
      });
    } else if (secondHalf < firstHalf - 0.5) {
      insights.push({
        type: 'mood',
        title: 'Pay Attention 💭',
        description: 'Your mood has been declining recently. Would you like to think about why?',
        icon: '💭',
        color: '#f59e0b',
        priority: 'medium'
      });
    }
  }

  // En mutlu gün
  const happiest = entries.reduce((max, entry) => 
    entry.mood > max.mood ? entry : max, entries[0]
  );
  
  const happyDate = new Date(happiest.createdAt);
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][happyDate.getDay()];
  
  insights.push({
    type: 'pattern',
    title: 'Your Happiest Day 🌟',
    description: `You felt happiest on ${dayName} (${happiest.mood}/5)`,
    icon: '🌟',
    color: '#f59e0b',
    priority: 'low',
    data: { day: dayName, mood: happiest.mood }
  });

  return insights;
};

/**
 * Yazma Alışkanlıkları Analizi
 */
export const analyzeWritingHabits = (entries: DiaryEntry[]): Insight[] => {
  const insights: Insight[] = [];
  
  if (entries.length === 0) return insights;

  // En aktif yazma saati
  const hours = entries.map(entry => new Date(entry.createdAt).getHours());
  const hourCounts: { [key: number]: number } = {};
  
  hours.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const mostActiveHour = Object.keys(hourCounts).reduce((a, b) => 
    hourCounts[parseInt(a)] > hourCounts[parseInt(b)] ? a : b
  );
  
  const timeOfDay = parseInt(mostActiveHour) < 12 ? 'morning' :
                    parseInt(mostActiveHour) < 17 ? 'afternoon' :
                    parseInt(mostActiveHour) < 21 ? 'evening' : 'night';
  
  insights.push({
    type: 'habit',
    title: 'Your Most Productive Hour ⏰',
    description: `You usually write in the ${timeOfDay} (${mostActiveHour}:00)`,
    icon: '⏰',
    color: '#8b5cf6',
    priority: 'medium',
    data: { hour: mostActiveHour, timeOfDay }
  });

  // Ortalama yazı uzunluğu
  const avgLength = entries.reduce((sum, entry) => 
    sum + (entry.content?.length || 0), 0) / entries.length;
  
  if (avgLength > 500) {
    insights.push({
      type: 'habit',
      title: 'Detailed Writer! 📝',
      description: `You write an average of ${Math.round(avgLength)} characters. How much you share!`,
      icon: '📝',
      color: '#6366f1',
      priority: 'low'
    });
  } else if (avgLength < 150) {
    insights.push({
      type: 'suggestion',
      title: 'Open Up a Bit More 💭',
      description: 'If you share more details, your insights will be richer',
      icon: '💭',
      color: '#3b82f6',
      priority: 'low'
    });
  }

  // Hafta içi vs hafta sonu
  const weekdayEntries = entries.filter(e => {
    const day = new Date(e.createdAt).getDay();
    return day !== 0 && day !== 6;
  });
  
  const weekendEntries = entries.filter(e => {
    const day = new Date(e.createdAt).getDay();
    return day === 0 || day === 6;
  });

  if (weekendEntries.length > 0 && weekdayEntries.length > 0) {
    const weekdayAvg = weekdayEntries.reduce((sum, e) => sum + e.mood, 0) / weekdayEntries.length;
    const weekendAvg = weekendEntries.reduce((sum, e) => sum + e.mood, 0) / weekendEntries.length;
    
    if (weekendAvg > weekdayAvg + 0.5) {
      insights.push({
        type: 'pattern',
        title: 'Weekend Happiness 🎉',
        description: 'You are much happier on weekends. Pay attention to work-life balance!',
        icon: '🎉',
        color: '#ec4899',
        priority: 'medium'
      });
    }
  }

  return insights;
};

/**
 * Streak (Ardışık Gün) Analizi
 */
export const analyzeStreak = (entries: DiaryEntry[]): Insight[] => {
  const insights: Insight[] = [];
  
  if (entries.length === 0) return insights;

  // Mevcut streak hesapla
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  let currentStreak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.createdAt);
    entryDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === currentStreak) {
      currentStreak++;
    } else if (diffDays > currentStreak) {
      break;
    }
  }

  // Streak içgörüleri
  if (currentStreak >= 7) {
    insights.push({
      type: 'streak',
      title: `${currentStreak} Day Streak! 🔥`,
      description: 'Incredible discipline! Keep it up',
      icon: '🔥',
      color: '#ef4444',
      priority: 'high',
      data: { streak: currentStreak }
    });
  } else if (currentStreak >= 3) {
    insights.push({
      type: 'streak',
      title: `${currentStreak} Days in a Row! ⭐`,
      description: 'You\'re doing great! You can reach 7 days',
      icon: '⭐',
      color: '#f59e0b',
      priority: 'medium',
      data: { streak: currentStreak }
    });
  } else if (currentStreak === 0 && entries.length > 0) {
    insights.push({
      type: 'suggestion',
      title: 'Start Again 💪',
      description: 'Your streak is broken but it\'s okay. Start again today!',
      icon: '💪',
      color: '#3b82f6',
      priority: 'medium'
    });
  }

  // En uzun streak
  let maxStreak = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i - 1].createdAt);
    const currDate = new Date(sortedEntries[i].createdAt);
    
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      maxStreak = Math.max(maxStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  maxStreak = Math.max(maxStreak, tempStreak);
  
  if (maxStreak >= 7 && maxStreak > currentStreak) {
    insights.push({
      type: 'achievement',
      title: `Longest Streak: ${maxStreak} Days! 🏆`,
      description: 'You can break this record again!',
      icon: '🏆',
      color: '#f59e0b',
      priority: 'low',
      data: { maxStreak }
    });
  }

  return insights;
};

/**
 * Kelime Analizi
 */
export const analyzeWords = (entries: DiaryEntry[]): Insight[] => {
  const insights: Insight[] = [];
  
  if (entries.length === 0) return insights;

  // Tüm kelimeleri topla
  const allWords = entries
    .map(entry => entry.content?.toLowerCase() || '')
    .join(' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3); // 3 karakterden uzun kelimeler

  // Kelime sıklığı
  const wordCounts: { [key: string]: number } = {};
  allWords.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // En çok kullanılan kelimeler
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  if (topWords.length > 0) {
    insights.push({
      type: 'pattern',
      title: 'Your Most Used Words 💬',
      description: `You frequently use the words: ${topWords.slice(0, 3).join(', ')}`,
      icon: '💬',
      color: '#06b6d4',
      priority: 'low',
      data: { topWords }
    });
  }

  // Pozitif kelime analizi
  const positiveWords = ['mutlu', 'güzel', 'harika', 'muhteşem', 'iyi', 'sevindim', 'başardım', 'keyifli'];
  const negativeWords = ['kötü', 'üzgün', 'stres', 'yorgun', 'zor', 'problem', 'sıkıntı', 'endişe'];
  
  const positiveCount = allWords.filter(word => positiveWords.includes(word)).length;
  const negativeCount = allWords.filter(word => negativeWords.includes(word)).length;
  
  if (positiveCount > negativeCount * 1.5) {
    insights.push({
      type: 'mood',
      title: 'Positive Energy! ✨',
      description: 'You use more positive words in your writings. Great!',
      icon: '✨',
      color: '#10b981',
      priority: 'medium',
      data: { positiveCount, negativeCount }
    });
  } else if (negativeCount > positiveCount * 1.5) {
    insights.push({
      type: 'suggestion',
      title: 'Take Care of Yourself 💙',
      description: 'Stressful words have increased recently. Take a breath.',
      icon: '💙',
      color: '#3b82f6',
      priority: 'high',
      data: { positiveCount, negativeCount }
    });
  }

  return insights;
};

/**
 * Başarılar (Achievements)
 */
export const analyzeAchievements = (entries: DiaryEntry[]): Insight[] => {
  const insights: Insight[] = [];

  // İlk günlük
  if (entries.length === 1) {
    insights.push({
      type: 'achievement',
      title: 'Your First Diary! 🎉',
      description: 'Congratulations! You\'ve started your journey',
      icon: '🎉',
      color: '#ec4899',
      priority: 'high'
    });
  }

  // Milestone'lar
  const milestones = [10, 25, 50, 100, 200, 365];
  milestones.forEach(milestone => {
    if (entries.length === milestone) {
      insights.push({
        type: 'achievement',
        title: `Your ${milestone}th Diary! 🏆`,
        description: `You wrote ${milestone} diaries! An incredible achievement`,
        icon: '🏆',
        color: '#f59e0b',
        priority: 'high',
        data: { milestone }
      });
    }
  });

  // Toplam kelime sayısı
  const totalWords = entries.reduce((sum, entry) => {
    const words = entry.content?.split(/\s+/).length || 0;
    return sum + words;
  }, 0);

  if (totalWords > 10000) {
    insights.push({
      type: 'achievement',
      title: 'Word Master! 📚',
      description: `You wrote ${totalWords.toLocaleString('en-US')} words! This would be a book`,
      icon: '📚',
      color: '#8b5cf6',
      priority: 'medium',
      data: { totalWords }
    });
  }

  return insights;
};

/**
 * Tüm İçgörüleri Getir
 */
export const getAllInsights = (entries: DiaryEntry[]): Insight[] => {
  const allInsights = [
    ...analyzeMood(entries),
    ...analyzeWritingHabits(entries),
    ...analyzeStreak(entries),
    ...analyzeWords(entries),
    ...analyzeAchievements(entries)
  ];

  // Önceliğe göre sırala
  return allInsights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};

/**
 * Öneriler Oluştur
 */
export const generateSuggestions = (entries: DiaryEntry[]): Insight[] => {
  const suggestions: Insight[] = [];
  
  if (entries.length === 0) {
    suggestions.push({
      type: 'suggestion',
      title: 'Write Your First Diary! 🌟',
      description: 'Create your first diary to start your journey',
      icon: '🌟',
      color: '#3b82f6',
      priority: 'high'
    });
    return suggestions;
  }

  // Son yazıdan bu yana geçen süre
  const lastEntry = entries[0];
  const daysSinceLastEntry = Math.floor(
    (new Date().getTime() - new Date(lastEntry.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastEntry >= 3) {
    suggestions.push({
      type: 'suggestion',
      title: 'We Miss You! 💙',
      description: `You haven't written for ${daysSinceLastEntry} days. Come back!`,
      icon: '💙',
      color: '#3b82f6',
      priority: 'high'
    });
  }

  // Düzenli yazma
  if (entries.length >= 7) {
    const last7Days = entries.slice(0, 7);
    if (last7Days.length === 7) {
      suggestions.push({
        type: 'suggestion',
        title: 'Regular Writing Goal 🎯',
        description: 'Try writing every day, reach your 30-day goal!',
        icon: '🎯',
        color: '#10b981',
        priority: 'medium'
      });
    }
  }

  return suggestions;
};

