/**
 * Mood Chart Component
 * 7-day mood change chart - Simple version
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useDiary } from '../../hooks/useDiary';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface MoodChartProps {
  period?: 'week' | 'month' | 'year';
}

export const MoodChart: React.FC<MoodChartProps> = ({ period = 'week' }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { entries } = useDiary(user?.uid);

  // Prepare mood data for the last 7 days
  const getMoodData = () => {
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const entry = entries.find(e => e.date === dateString);
      const moodValue = entry?.mood || 3; // Default 3 (neutral)
      
      data.push({
        x: date.getDate(), // Day number
        y: moodValue,
        date: dateString,
        emoji: getMoodEmoji(moodValue)
      });
    }
    
    return data;
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['', '😢', '😔', '😐', '😊', '🤩'];
    return emojis[mood] || '😐';
  };

  const chartData = getMoodData();
  const averageMood = chartData.reduce((sum, point) => sum + point.y, 0) / chartData.length;

  // Basit bar chart oluştur
  const renderSimpleChart = () => {
    const maxHeight = 120;
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartArea}>
          {chartData.map((point, index) => {
            const barHeight = (point.y / 5) * maxHeight;
            const barColor = getMoodColor(point.y);
            
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight, 
                        backgroundColor: barColor,
                        borderColor: barColor,
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.dayLabel, { color: currentTheme.colors.secondary }]}>
                  {point.x}
                </Text>
              </View>
            );
          })}
        </View>
        
        {/* Y ekseni etiketleri */}
        <View style={styles.yAxisLabels}>
          <Text style={[styles.yLabel, { color: currentTheme.colors.secondary }]}>5</Text>
          <Text style={[styles.yLabel, { color: currentTheme.colors.secondary }]}>4</Text>
          <Text style={[styles.yLabel, { color: currentTheme.colors.secondary }]}>3</Text>
          <Text style={[styles.yLabel, { color: currentTheme.colors.secondary }]}>2</Text>
          <Text style={[styles.yLabel, { color: currentTheme.colors.secondary }]}>1</Text>
        </View>
      </View>
    );
  };

  const getMoodColor = (mood: number) => {
    const colors = ['', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
    return colors[mood] || '#10b981';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        📈 {t('welcome') === 'Welcome' ? 'Mood Trend' : 'Ruh Hali Trendi'}
      </Text>
      <Text style={[styles.subtitle, { color: currentTheme.colors.secondary }]}>
        {t('welcome') === 'Welcome' ? 'Last 7 days - Average:' : 'Son 7 gün - Ortalama:'} {averageMood.toFixed(1)}/5
      </Text>
      
      {renderSimpleChart()}
      
      {/* Daily mood indicator */}
      <View style={styles.moodIndicators}>
        {chartData.map((point, index) => (
          <View key={index} style={styles.moodIndicator}>
            <Text style={styles.moodEmoji}>{point.emoji}</Text>
            <Text style={[styles.moodDay, { color: currentTheme.colors.secondary }]}>
              {point.x}.{t('welcome') === 'Welcome' ? 'day' : 'gün'}
            </Text>
          </View>
        ))}
      </View>
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
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  yAxisLabels: {
    width: 20,
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  yLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  moodIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  moodIndicator: {
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodDay: {
    fontSize: 10,
    fontWeight: '600',
  },
});