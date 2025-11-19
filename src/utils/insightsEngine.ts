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
export const analyzeMood = (entries: DiaryEntry[], t: any, locale: string): Insight[] => {
  const insights: Insight[] = [];
  
  if (entries.length === 0) return insights;

  // Son 7 günün mood ortalaması
  const last7Days = entries.slice(0, 7);
  const avgMood = last7Days.reduce((sum, entry) => sum + entry.mood, 0) / last7Days.length;
  
  if (avgMood >= 4) {
    insights.push({
      type: 'mood',
      title: t('insights.greatWeek'),
      description: t('insights.greatWeekDesc').replace('{avgMood}', avgMood.toFixed(1)),
      icon: '🎉',
      color: '#10b981',
      priority: 'high',
      data: { avgMood }
    });
  } else if (avgMood < 2.5) {
    insights.push({
      type: 'mood',
      title: t('insights.toughPeriod'),
      description: t('insights.toughPeriodDesc'),
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
        title: t('insights.risingTrend'),
        description: t('insights.risingTrendDesc'),
        icon: '📈',
        color: '#10b981',
        priority: 'medium'
      });
    } else if (secondHalf < firstHalf - 0.5) {
      insights.push({
        type: 'mood',
        title: t('insights.payAttention'),
        description: t('insights.payAttentionDesc'),
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
  const dayName = happyDate.toLocaleDateString(locale || 'en-US', { weekday: 'long' });
  
  insights.push({
    type: 'pattern',
    title: t('insights.happiestDay'),
    description: t('insights.happiestDayDesc').replace('{day}', dayName).replace('{mood}', happiest.mood.toString()),
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
export const analyzeWritingHabits = (entries: DiaryEntry[], t: any, _locale: string): Insight[] => {
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
    title: t('insights.productiveHour'),
    description: t('insights.productiveHourDesc').replace('{hour}', `${mostActiveHour}:00`),
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
      title: t('insights.detailedWriter'),
      description: t('insights.detailedWriterDesc'),
      icon: '📝',
      color: '#6366f1',
      priority: 'low'
    });
  } else if (avgLength < 150) {
    insights.push({
      type: 'suggestion',
      title: t('insights.openUpMore'),
      description: t('insights.openUpMoreDesc'),
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
        title: t('insights.weekendHappiness'),
        description: t('insights.weekendHappinessDesc'),
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
export const analyzeStreak = (entries: DiaryEntry[], t: any, _locale: string): Insight[] => {
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
      title: t('insights.dayStreak').replace('{count}', currentStreak.toString()),
      description: t('insights.streakIncredible'),
      icon: '🔥',
      color: '#ef4444',
      priority: 'high',
      data: { streak: currentStreak }
    });
  } else if (currentStreak >= 3) {
    insights.push({
      type: 'streak',
      title: t('insights.daysInRow').replace('{count}', currentStreak.toString()),
      description: t('insights.streakDoingGreat'),
      icon: '⭐',
      color: '#f59e0b',
      priority: 'medium',
      data: { streak: currentStreak }
    });
  } else if (currentStreak === 0 && entries.length > 0) {
    insights.push({
      type: 'suggestion',
      title: t('insights.startAgain'),
      description: t('insights.startAgainDesc'),
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
      title: t('insights.longestStreak').replace('{count}', maxStreak.toString()),
      description: t('insights.canBreakRecord'),
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
export const analyzeWords = (entries: DiaryEntry[], t: any, _locale: string): Insight[] => {
  const insights: Insight[] = [];
  
  if (entries.length === 0) return insights;

  // Tüm kelimeleri topla - hem content hem de answers'dan
  const getAllTextFromEntry = (entry: DiaryEntry): string => {
    let text = entry.content?.toLowerCase() || '';
    
    // answers alanındaki tüm cevapları ekle
    if (entry.answers) {
      const answerTexts = Object.values(entry.answers)
        .filter((answer): answer is string => typeof answer === 'string' && answer.trim().length > 0)
        .map(answer => answer.toLowerCase());
      text += ' ' + answerTexts.join(' ');
    }
    
    // freeWriting varsa onu da ekle
    if (entry.freeWriting) {
      text += ' ' + entry.freeWriting.toLowerCase();
    }
    
    return text;
  };

  const allWords = entries
    .map(entry => getAllTextFromEntry(entry))
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
      title: t('insights.mostUsedWords'),
      description: (t('insights.mostUsedWordsDesc') || '').replace('{words}', topWords.slice(0, 3).join(', ')),
      icon: '💬',
      color: '#06b6d4',
      priority: 'low',
      data: { topWords }
    });
  }

  // Pozitif kelime analizi - genişletilmiş liste
  const positiveWords = [
    'mutlu', 'güzel', 'harika', 'muhteşem', 'iyi', 'sevindim', 'başardım', 'keyifli',
    'mükemmel', 'neşeli', 'sevinçli', 'başarılı', 'gururlu',
    'huzurlu', 'rahat', 'keyif', 'zevk', 'coşku', 'heyecan', 'umut', 'iyimser',
    'pozitif', 'enerjik', 'canlı', 'dinç', 'şükür', 'minnettar', 'teşekkür',
    'gülümseme', 'gülmek', 'eğlenceli', 'eğlence', 'mutluluk', 'sevinç', 'yüksek'
  ];
  
  const negativeWords = [
    'kötü', 'üzgün', 'stres', 'yorgun', 'zor', 'problem', 'sıkıntı', 'endişe',
    'kaygı', 'korku', 'panik', 'sinir', 'öfke', 'kızgın', 'hayal', 'kırıklığı',
    'umutsuz', 'çaresiz', 'bitkin', 'tükenmiş', 'bunalım', 'depresif',
    'mutsuz', 'hüzünlü', 'kederli', 'acı', 'ağrı', 'sıkıntılı', 'bunaltıcı',
    'yok', 'boş', 'anlamsız', 'değersiz', 'başarısız', 'kayıp', 'düşük'
  ];
  
  // Tüm metni birleştir (çok kelimeli ifadeler için)
  const fullText = entries
    .map(entry => getAllTextFromEntry(entry))
    .join(' ')
    .toLowerCase();
  
  // Çok kelimeli negatif ifadeler
  const negativePhrases = ['hiçbir şey', 'hiç bir şey', 'hiçbirşey', 'hiç birşey'];
  let negativePhraseCount = 0;
  negativePhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    const matches = fullText.match(regex);
    if (matches) {
      negativePhraseCount += matches.length;
    }
  });
  
  // Tek kelime analizi
  const positiveCount = allWords.filter(word => positiveWords.includes(word)).length;
  const negativeCount = allWords.filter(word => negativeWords.includes(word)).length + negativePhraseCount;
  
  // Eğer hiç kelime yoksa içgörü gösterme
  if (positiveCount === 0 && negativeCount === 0) {
    return insights;
  }
  
  // Pozitif/negatif oranına göre içgörü oluştur
  if (positiveCount > negativeCount * 1.5 && positiveCount >= 2) {
    insights.push({
      type: 'mood',
      title: t('insights.positiveEnergy'),
      description: t('insights.positiveEnergyDesc'),
      icon: '✨',
      color: '#10b981',
      priority: 'medium',
      data: { positiveCount, negativeCount }
    });
  } else if (negativeCount > positiveCount * 1.5 && negativeCount >= 2) {
    insights.push({
      type: 'suggestion',
      title: t('insights.takeCare'),
      description: t('insights.takeCareDesc'),
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
export const analyzeAchievements = (entries: DiaryEntry[], t: any, _locale: string): Insight[] => {
  const insights: Insight[] = [];

  // First diary
  if (entries.length === 1) {
    insights.push({
      type: 'achievement',
      title: t('insights.firstDiary'),
      description: t('insights.firstDiaryDesc'),
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
        title: t('insights.milestoneDiary').replace('{count}', milestone.toString()),
        description: t('insights.milestoneDiaryDesc').replace('{count}', milestone.toString()),
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
      title: t('insights.wordMaster'),
      description: t('insights.wordMasterDesc')
        ? t('insights.wordMasterDesc').replace('{count}', totalWords.toLocaleString('en-US'))
        : `${totalWords.toLocaleString('en-US')} words milestone!`,
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
export const getAllInsights = (entries: DiaryEntry[], t: any, locale: string): Insight[] => {
  const allInsights = [
    ...analyzeMood(entries, t, locale),
    ...analyzeWritingHabits(entries, t, locale),
    ...analyzeStreak(entries, t, locale),
    ...analyzeWords(entries, t, locale),
    ...analyzeAchievements(entries, t, locale)
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
export const generateSuggestions = (entries: DiaryEntry[], t: any): Insight[] => {
  const suggestions: Insight[] = [];
  
  if (entries.length === 0) {
    suggestions.push({
      type: 'suggestion',
      title: t('insights.writeFirstDiary'),
      description: t('insights.writeFirstDiaryDesc'),
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
      title: t('insights.missYou'),
      description: (t('insights.missYouDesc') || '').replace('{days}', daysSinceLastEntry.toString()),
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
        title: t('insights.regularGoal'),
        description: t('insights.regularGoalDesc'),
        icon: '🎯',
        color: '#10b981',
        priority: 'medium'
      });
    }
  }

  return suggestions;
};

