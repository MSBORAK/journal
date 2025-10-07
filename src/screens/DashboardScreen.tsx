import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFont } from '../contexts/FontContext';
import { useDiary } from '../hooks/useDiary';
import { useTasks } from '../hooks/useTasks';
import { useReminders } from '../hooks/useReminders';
import { Ionicons } from '@expo/vector-icons';
import { DiaryEntry } from '../types';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { fontConfig } = useFont();
  const { entries } = useDiary(user?.uid);
  const { 
    getTodayTasks, 
    getTodayCompletedCount, 
    getTodayCompletionRate, 
    toggleTaskCompletion,
    getCategoryById
  } = useTasks(user?.uid);
  const { getTodayReminders } = useReminders(user?.uid);

  const todayTasks = getTodayTasks();
  const todayCompletedCount = getTodayCompletedCount();
  const todayCompletionRate = getTodayCompletionRate();
  const todayReminders = getTodayReminders();

  const getCurrentStreak = (): number => {
    // Calculate current streak logic
    let streak = 0;
    const today = new Date();
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWellnessScore = (): number => {
    // Simple wellness score calculation
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(entry => entry.date === today);
    
    if (!todayEntry) return 0;
    
    let score = 50; // Base score
    
    // Mood factor
    if (todayEntry.mood) {
      score += todayEntry.mood * 10; // 10-100 points based on mood
    }
    
    // Content quality factor
    if (todayEntry.content && todayEntry.content.length > 100) {
      score += 20;
    }
    
    // Streak bonus
    const streak = getCurrentStreak();
    score += Math.min(streak * 5, 25); // Max 25 bonus points
    
    return Math.min(Math.max(score, 0), 100);
  };

  const getTodayMood = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = entries.find(entry => entry.date === today);
    if (!todayEntry) return null;
    
    const moodOptions = [
      { value: 1, label: 'Çok Kötü', emoji: '😢' },
      { value: 2, label: 'Kötü', emoji: '😔' },
      { value: 3, label: 'Normal', emoji: '😐' },
      { value: 4, label: 'İyi', emoji: '😊' },
      { value: 5, label: 'Çok İyi', emoji: '🤩' },
    ];
    
    return moodOptions.find(mood => mood.value === todayEntry.mood);
  };

  const getMotivationMessage = () => {
    const messages = [
      // Günlük motivasyon
      'Bugün de harika bir gün geçireceğini biliyorum! 🌟',
      'Her yeni gün yeni fırsatlar demek! Sen hazırsın! 🚀',
      'Bugün de kendini dinlemeye zaman ayır! 🎧',
      'Güne pozitif başla, güzel bitecek! ☀️',
      'Bugün kendin için bir şeyler yap! Sen değerlisin! 💎',
      
      // Streak motivasyonu
      'Günlük yazma alışkanlığın muhteşem! Devam et! 🔥',
      'Her günlük yazdığın satır, seni hedefine yaklaştırıyor! 📝',
      'Tutarlılık güçtür! Sen bu gücü gösteriyorsun! ⚡',
      'Küçük adımlar büyük değişimler yaratır! 🦋',
      
      // Kişisel gelişim
      'Kendini keşfetmek en büyük macera! Sen bu maceradasın! 🗺️',
      'Her günlük, seni daha iyi tanıyor ve anlıyor! 💫',
      'Düşüncelerini yazmak, onları gerçeğe dönüştürür! ✨',
      'Geçmişini hatırla, geleceğini planla, bugünü yaşa! 🕰️',
      
      // Cesaret verici
      'Zorluklar seni güçlendirir! Bugün de büyüyorsun! 🌱',
      'Her gün bir fırsat! Bugün ne öğreneceksin? 🎓',
      'Sen değişimin kendisisin! Her gün yenileniyorsun! 🌀',
      'İçindeki güç, sandığından çok daha büyük! 💪',
      
      // Sevgili ve pozitif
      'Kendinle konuşmak, en değerli sohbet! 💬',
      'Bugün kendine ne kadar nazik davranacaksın? 🤗',
      'Her günlük yazdığın, kendine verdiğin bir hediye! 🎁',
      'Sen muhteşemsin! Bugün de bunu hatırla! 🌈',
      
      // İlham verici
      'Hayallerinin peşinden git! Bugün bir adım daha! 🌟',
      'Başarı, hazırlık ve fırsatın buluşmasıdır! Sen hazırsın! 🎯',
      'Her gün yeni bir başlangıç! Bugün ne başlatacaksın? 🚀',
      'Senin hikayen muhteşem! Bugün hangi bölümü yazacaksın? 📖',
    ];
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  const recentEntries = entries.slice(0, 3);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: fontConfig.size + 12,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: fontConfig.size,
      color: currentTheme.colors.secondary,
      lineHeight: 24,
      marginBottom: 16,
    },
    userGreeting: {
      fontSize: fontConfig.size + 2,
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: fontConfig.size - 2,
      color: currentTheme.colors.secondary,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginBottom: 20,
      marginTop: 16,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 0.5,
      borderColor: currentTheme.colors.border,
      minHeight: 80,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    writeCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    writeContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    writeLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    writeIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    writeTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    writeSubtitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    wellnessScoreCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    wellnessScoreContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    wellnessScoreLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    wellnessScoreIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    wellnessScoreTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    wellnessScoreNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 4,
    },
    wellnessScoreSubtitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    moodCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    moodTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 12,
    },
    moodContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    recentMood: {
      fontSize: 32,
    },
    moodLabel: {
      fontSize: 16,
      color: currentTheme.colors.text,
    },
    motivationCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 20,
      padding: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    motivationTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    motivationMessage: {
      fontSize: 18,
      color: currentTheme.colors.text,
      lineHeight: 28,
      textAlign: 'center',
      fontWeight: '400',
      fontStyle: 'italic',
      letterSpacing: 0.5,
    },
    // Tasks Styles
    tasksCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 16,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    tasksHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    tasksTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    tasksProgressContainer: {
      marginBottom: 16,
    },
    tasksProgressBar: {
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      marginBottom: 8,
    },
    tasksProgressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 4,
    },
    tasksProgressText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    tasksList: {
      gap: 8,
    },
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    taskLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    taskEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    taskTitle: {
      fontSize: 16,
      color: currentTheme.colors.text,
      flex: 1,
    },
    taskCompleted: {
      textDecorationLine: 'line-through',
      color: currentTheme.colors.secondary,
    },
    taskCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    taskCheckboxCompleted: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    tasksMoreText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '500',
    },
    tasksEmpty: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    tasksEmptyText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 12,
    },
    tasksAddButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    tasksAddButtonText: {
      fontSize: 14,
      color: 'white',
      fontWeight: '500',
    },
    // Reminders Styles
    remindersCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 16,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    remindersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    remindersTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    remindersList: {
      gap: 8,
    },
    reminderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    reminderEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    reminderContent: {
      flex: 1,
    },
    reminderTitle: {
      fontSize: 16,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    reminderTime: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    reminderPriority: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 8,
    },
    remindersMoreText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '500',
    },
    recentCard: {
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    recentTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    recentViewAll: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      fontWeight: '500',
    },
    recentList: {
      gap: 12,
    },
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    recentContent: {
      flex: 1,
      marginLeft: 12,
    },
    recentDate: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    recentEmpty: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    recentEmptyText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Hoş Geldin! 🌟</Text>
        <Text style={dynamicStyles.headerSubtitle}>
          Burası senin gizli dünyan - ruhunu dinlediğin, anlam bulduğun güvenli limanın. 
          Her kelime, her hissiyat burada değerli. Seni bekleyen hikayeler var.
        </Text>
        <Text style={dynamicStyles.userGreeting}>Merhaba, {user?.email}</Text>
        <Text style={dynamicStyles.userEmail}>Bugün nasıl hissediyorsun? 💭</Text>
      </View>

      {/* Quick Stats */}
      <View style={dynamicStyles.statsContainer}>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>{entries.length}</Text>
          <Text style={dynamicStyles.statLabel}>Günlük</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>{getCurrentStreak()}</Text>
          <Text style={dynamicStyles.statLabel}>Seri</Text>
        </View>
        <View style={dynamicStyles.statCard}>
          <Text style={dynamicStyles.statNumber}>{getWellnessScore()}</Text>
          <Text style={dynamicStyles.statLabel}>Sağlık</Text>
        </View>
      </View>

      {/* Write Diary Card */}
      <TouchableOpacity 
        style={dynamicStyles.writeCard}
        onPress={() => navigation.navigate('WriteDiaryStep1' as never)}
      >
        <View style={dynamicStyles.writeContent}>
          <View style={dynamicStyles.writeLeft}>
            <Text style={dynamicStyles.writeIcon}>✍️</Text>
            <View>
              <Text style={dynamicStyles.writeTitle}>Günlük Yaz</Text>
              <Text style={dynamicStyles.writeSubtitle}>Bugünkü deneyimlerini kaydet</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Wellness Score Card */}
      <TouchableOpacity 
        style={dynamicStyles.wellnessScoreCard}
        onPress={() => navigation.navigate('WellnessTracking' as never)}
        activeOpacity={0.7}
      >
        <View style={dynamicStyles.wellnessScoreContent}>
          <View style={dynamicStyles.wellnessScoreLeft}>
            <Text style={dynamicStyles.wellnessScoreIcon}>💚</Text>
            <View>
              <Text style={dynamicStyles.wellnessScoreTitle}>Sağlık Skoru</Text>
              <Text style={dynamicStyles.wellnessScoreNumber}>{getWellnessScore()}</Text>
              <Text style={dynamicStyles.wellnessScoreSubtitle}>Bugünkü durumun</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.colors.primary} />
        </View>
      </TouchableOpacity>

      {/* Today's Mood */}
      {getTodayMood() && (
        <View style={dynamicStyles.moodCard}>
          <Text style={dynamicStyles.moodTitle}>Bugünkü Ruh Halin</Text>
          <View style={dynamicStyles.moodContent}>
            <Text style={dynamicStyles.recentMood}>{getTodayMood()?.emoji}</Text>
            <Text style={dynamicStyles.moodLabel}>{getTodayMood()?.label}</Text>
          </View>
        </View>
      )}

      {/* Motivation Message */}
      <View style={dynamicStyles.motivationCard}>
        <Text style={dynamicStyles.motivationTitle}>✨ Günün İlhamı</Text>
        <Text style={dynamicStyles.motivationMessage}>
          {getMotivationMessage()}
        </Text>
      </View>

      {/* Daily Tasks */}
      <View style={dynamicStyles.tasksCard}>
        <View style={dynamicStyles.tasksHeader}>
          <Text style={dynamicStyles.tasksTitle}>📋 Günlük Görevler</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks' as never)}>
            <Ionicons name="add-circle" size={24} color={currentTheme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={dynamicStyles.tasksProgressContainer}>
          <View style={dynamicStyles.tasksProgressBar}>
            <View 
              style={[
                dynamicStyles.tasksProgressFill, 
                { width: `${todayCompletionRate}%` }
              ]} 
            />
          </View>
          <Text style={dynamicStyles.tasksProgressText}>
            {todayCompletedCount}/{todayTasks.length} tamamlandı ({todayCompletionRate}%)
          </Text>
        </View>

        {todayTasks.length > 0 ? (
          <View style={dynamicStyles.tasksList}>
            {todayTasks.slice(0, 3).map((task) => {
              const category = getCategoryById(task.category);
              return (
                <TouchableOpacity
                  key={task.id}
                  style={dynamicStyles.taskItem}
                  onPress={() => toggleTaskCompletion(task.id)}
                >
                  <View style={dynamicStyles.taskLeft}>
                    <Text style={dynamicStyles.taskEmoji}>{task.emoji}</Text>
                    <Text style={[
                      dynamicStyles.taskTitle,
                      task.isCompleted && dynamicStyles.taskCompleted
                    ]}>
                      {task.title}
                    </Text>
                  </View>
                  <View style={[
                    dynamicStyles.taskCheckbox,
                    task.isCompleted && dynamicStyles.taskCheckboxCompleted
                  ]}>
                    {task.isCompleted && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            {todayTasks.length > 3 && (
              <Text style={dynamicStyles.tasksMoreText}>
                +{todayTasks.length - 3} görev daha
              </Text>
            )}
          </View>
        ) : (
          <View style={dynamicStyles.tasksEmpty}>
            <Text style={dynamicStyles.tasksEmptyText}>
              Henüz görev eklenmemiş
            </Text>
            <TouchableOpacity 
              style={dynamicStyles.tasksAddButton}
              onPress={() => navigation.navigate('Tasks' as never)}
            >
              <Text style={dynamicStyles.tasksAddButtonText}>İlk Görevi Ekle</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <View style={dynamicStyles.remindersCard}>
          <View style={dynamicStyles.remindersHeader}>
            <Text style={dynamicStyles.remindersTitle}>⏰ Bugünkü Hatırlatıcılar</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reminders' as never)}>
              <Ionicons name="settings" size={20} color={currentTheme.colors.secondary} />
            </TouchableOpacity>
          </View>
          
          <View style={dynamicStyles.remindersList}>
            {todayReminders.slice(0, 3).map((reminder) => (
              <View key={reminder.id} style={dynamicStyles.reminderItem}>
                <Text style={dynamicStyles.reminderEmoji}>{reminder.emoji}</Text>
                <View style={dynamicStyles.reminderContent}>
                  <Text style={dynamicStyles.reminderTitle}>{reminder.title}</Text>
                  <Text style={dynamicStyles.reminderTime}>{reminder.time}</Text>
                </View>
                <View style={[
                  dynamicStyles.reminderPriority,
                  { backgroundColor: reminder.priority === 'high' ? '#ef4444' : 
                                     reminder.priority === 'medium' ? '#f59e0b' : '#10b981' }
                ]} />
              </View>
            ))}
            {todayReminders.length > 3 && (
              <Text style={dynamicStyles.remindersMoreText}>
                +{todayReminders.length - 3} hatırlatıcı daha
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Recent Entries */}
      <View style={dynamicStyles.recentCard}>
        <View style={dynamicStyles.recentHeader}>
          <Text style={dynamicStyles.recentTitle}>Son Günlükler</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Archive' as never)}>
            <Text style={dynamicStyles.recentViewAll}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        {recentEntries.length > 0 ? (
          <View style={dynamicStyles.recentList}>
            {recentEntries.slice(0, 3).map((entry: DiaryEntry) => (
              <TouchableOpacity
                key={entry.id}
                style={dynamicStyles.recentItem}
                onPress={() => navigation.navigate('WriteDiaryStep3' as never, {
                  entry,
                  answers: {},
                  freeWriting: ''
                })}
              >
                <Text style={dynamicStyles.recentMood}>{getTodayMood()?.emoji}</Text>
                <View style={dynamicStyles.recentContent}>
                  <Text style={dynamicStyles.recentTitle} numberOfLines={1}>
                    {entry.title}
                  </Text>
                  <Text style={dynamicStyles.recentDate}>
                    {new Date(entry.date).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={dynamicStyles.recentEmpty}>
            <Text style={dynamicStyles.recentEmptyText}>
              Henüz günlük yazmamışsın
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}