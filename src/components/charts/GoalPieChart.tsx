/**
 * Goal Pie Chart Component
 * Hedef/Hayal tamamlama oranları - Basit versiyon
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useDreamsGoals } from '../../hooks/useDreamsGoals';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface GoalPieChartProps {
  type: 'goals' | 'dreams';
}

export const GoalPieChart: React.FC<GoalPieChartProps> = ({ type }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { dreams, goals } = useDreamsGoals(user?.uid);

  // Hedef/Hayal verilerini hazırla
  const getGoalData = () => {
    const data = type === 'goals' ? goals : dreams;
    
    if (!data || data.length === 0) {
      return {
        completed: 0,
        inProgress: 0,
        total: 0,
        completionRate: 0,
        items: []
      };
    }

    if (type === 'goals') {
      // Goals için status kullan
      const completed = data.filter(item => 
        'status' in item && item.status === 'completed'
      ).length;
      const inProgress = data.filter(item => 
        'status' in item && item.status === 'active'
      ).length;
      const total = data.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        completed,
        inProgress,
        total,
        completionRate,
        items: data
      };
    } else {
      // Dreams için isCompleted kullan
      const completed = data.filter(item => 
        'isCompleted' in item && item.isCompleted === true
      ).length;
      const inProgress = data.filter(item => 
        'isCompleted' in item && item.isCompleted === false
      ).length;
      const total = data.length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        completed,
        inProgress,
        total,
        completionRate,
        items: data
      };
    }
  };

  const goalData = getGoalData();

  // Basit dairesel progress göstergesi
  const renderSimplePieChart = () => {
    if (goalData.total === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: currentTheme.colors.secondary }]}>
            Henüz {type === 'goals' ? 'hedef' : 'hayal'} eklenmemiş
          </Text>
        </View>
      );
    }

    const size = 120;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = goalData.completionRate / 100;

    return (
      <View style={styles.pieContainer}>
        <View style={styles.pieChart}>
          {/* Background circle */}
          <View style={[styles.circle, { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: currentTheme.colors.border + '30',
          }]} />
          
          {/* Progress circle */}
          <View style={[styles.circle, { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: currentTheme.colors.primary,
            borderTopColor: 'transparent',
            borderRightColor: progress > 0.25 ? currentTheme.colors.primary : 'transparent',
            borderBottomColor: progress > 0.5 ? currentTheme.colors.primary : 'transparent',
            borderLeftColor: progress > 0.75 ? currentTheme.colors.primary : 'transparent',
            transform: [{ rotate: '-90deg' }],
            position: 'absolute',
          }]} />
          
          {/* Center text */}
          <View style={styles.centerText}>
            <Text style={[styles.percentageText, { color: currentTheme.colors.primary }]}>
              {goalData.completionRate}%
            </Text>
            <Text style={[styles.percentageLabel, { color: currentTheme.colors.secondary }]}>
              Tamamlandı
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getTypeLabel = () => {
    return type === 'goals' ? 'Hedef' : 'Hayal';
  };

  const getTypeEmoji = () => {
    return type === 'goals' ? '🎯' : '✨';
  };

  const isItemCompleted = (item: any) => {
    if (type === 'goals') {
      return 'status' in item && item.status === 'completed';
    } else {
      return 'isCompleted' in item && item.isCompleted === true;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        {getTypeEmoji()} {getTypeLabel()} Tamamlama Oranı
      </Text>
      <Text style={[styles.subtitle, { color: currentTheme.colors.secondary }]}>
        Toplam {goalData.total} {getTypeLabel().toLowerCase()} - {goalData.completed} tamamlandı
      </Text>
      
      {renderSimplePieChart()}
      
      {/* Detaylı istatistikler */}
      {goalData.total > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIndicator, { backgroundColor: currentTheme.colors.primary }]} />
            <Text style={[styles.statLabel, { color: currentTheme.colors.text }]}>
              Tamamlandı: {goalData.completed}
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIndicator, { backgroundColor: currentTheme.colors.accent }]} />
            <Text style={[styles.statLabel, { color: currentTheme.colors.text }]}>
              Devam Ediyor: {goalData.inProgress}
            </Text>
          </View>
        </View>
      )}

      {/* Son eklenen öğeler */}
      {goalData.items.length > 0 && (
        <View style={styles.recentItems}>
          <Text style={[styles.recentTitle, { color: currentTheme.colors.text }]}>
            Son {getTypeLabel().toLowerCase()}lar:
          </Text>
          {goalData.items.slice(0, 3).map((item, index) => (
            <View key={item.id} style={styles.recentItem}>
              <Text style={styles.recentEmoji}>{item.emoji}</Text>
              <Text style={[styles.recentName, { color: currentTheme.colors.text }]}>
                {item.title}
              </Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: isItemCompleted(item) ? currentTheme.colors.primary + '20' : currentTheme.colors.accent + '20' }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: isItemCompleted(item) ? currentTheme.colors.primary : currentTheme.colors.accent }
                ]}>
                  {isItemCompleted(item) ? 'Tamamlandı' : (type === 'goals' ? 'Aktif' : 'Devam Ediyor')}
                </Text>
              </View>
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
  pieContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
  },
  centerText: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 2,
  },
  percentageLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentItems: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentEmoji: {
    fontSize: 16,
    marginRight: 12,
  },
  recentName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});