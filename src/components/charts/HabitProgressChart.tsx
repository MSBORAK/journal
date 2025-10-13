/**
 * Habit Progress Chart Component
 * Alışkanlık tamamlama oranları - Basit versiyon
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useHabits } from '../../hooks/useHabits';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface HabitProgressChartProps {
  period?: 'week' | 'month' | 'year';
}

export const HabitProgressChart: React.FC<HabitProgressChartProps> = ({ period = 'week' }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { habits, getWeeklyStats } = useHabits(user?.uid);

  // Haftalık istatistikleri hesapla
  const getHabitStats = () => {
    if (!habits || habits.length === 0) {
      return [];
    }

    return habits.map(habit => {
      const weeklyStats = getWeeklyStats();
      const completionRate = weeklyStats.completionRate;

      return {
        id: habit.id,
        name: habit.title,
        emoji: '🔥',
        completionRate,
        completedDays: weeklyStats.totalCompletions,
        totalDays: 7, // Haftalık veri
      };
    });
  };

  const habitStats = getHabitStats();
  const averageCompletion = habitStats.length > 0 
    ? habitStats.reduce((sum, habit) => sum + habit.completionRate, 0) / habitStats.length 
    : 0;

  // Basit bar chart oluştur
  const renderSimpleChart = () => {
    if (habitStats.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: currentTheme.colors.secondary }]}>
            Henüz alışkanlık eklenmemiş
          </Text>
        </View>
      );
    }

    const maxHeight = 100;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartArea}>
          {habitStats.map((habit, index) => {
            const barHeight = (habit.completionRate / 100) * maxHeight;
            
            return (
              <View key={habit.id} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight, 
                        backgroundColor: currentTheme.colors.primary,
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.percentageLabel, { color: currentTheme.colors.secondary }]}>
                  {habit.completionRate}%
                </Text>
                <Text style={[styles.habitLabel, { color: currentTheme.colors.secondary }]}>
                  {habit.emoji}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        🔥 Alışkanlık İlerlemesi
      </Text>
      <Text style={[styles.subtitle, { color: currentTheme.colors.secondary }]}>
        Bu hafta - Ortalama: {averageCompletion.toFixed(0)}% tamamlama
      </Text>
      
      {renderSimpleChart()}
      
      {/* Alışkanlık detayları */}
      {habitStats.length > 0 && (
        <View style={styles.habitDetails}>
          {habitStats.map((habit, index) => (
            <View key={habit.id} style={styles.habitDetail}>
              <Text style={styles.habitEmoji}>{habit.emoji}</Text>
              <View style={styles.habitInfo}>
                <Text style={[styles.habitName, { color: currentTheme.colors.text }]}>
                  {habit.name}
                </Text>
                <Text style={[styles.habitProgress, { color: currentTheme.colors.secondary }]}>
                  {habit.completedDays}/{habit.totalDays} gün
                </Text>
              </View>
              <Text style={[styles.habitPercentage, { color: currentTheme.colors.primary }]}>
                {habit.completionRate}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 100,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 16,
    borderRadius: 8,
    minHeight: 4,
  },
  percentageLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  habitLabel: {
    fontSize: 16,
    marginTop: 4,
  },
  habitDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  habitDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  habitProgress: {
    fontSize: 12,
  },
  habitPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
});