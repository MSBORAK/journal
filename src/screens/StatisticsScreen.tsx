import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useDiary } from '../hooks/useDiary';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface StatisticsScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export default function StatisticsScreen({ navigation }: StatisticsScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { entries, getStreak } = useDiary(user?.uid);

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [expandedChart, setExpandedChart] = useState<'mood' | 'activity' | 'distribution' | null>(null);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 24,
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginTop: 10,
      borderRadius: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    titleSubtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginBottom: 24,
      fontWeight: '500',
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    activePeriodButton: {
      backgroundColor: currentTheme.colors.primary,
    },
    periodButtonText: {
      fontSize: 14,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    activePeriodButtonText: {
      color: 'white',
      fontWeight: '600',
    },
    summaryContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
      paddingHorizontal: 20,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      minHeight: 140,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 0.5,
      borderColor: currentTheme.colors.border,
    },
    streakCard: {
      borderTopWidth: 4,
      borderTopColor: '#ff6b35',
    },
    entriesCard: {
      borderTopWidth: 4,
      borderTopColor: '#4ade80',
    },
    moodCard: {
      borderTopWidth: 4,
      borderTopColor: '#f59e0b',
    },
    cardIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: currentTheme.colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      alignSelf: 'center',
    },
    cardContent: {
      alignItems: 'center',
    },
    summaryTitle: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
      marginBottom: 4,
      textAlign: 'center',
    },
    summaryValue: {
      fontSize: 28,
      fontWeight: '800',
      color: currentTheme.colors.text,
      marginBottom: 2,
      textAlign: 'center',
    },
    summaryLabel: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      fontWeight: '400',
      textAlign: 'center',
    },
    chartsContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    chartContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 24,
      padding: 24,
      marginBottom: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    chartTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chartTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginLeft: 8,
    },
    chartActionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: currentTheme.colors.background,
    },
    modernChart: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 20,
      minHeight: 180,
    },
    chartVisual: {
      alignItems: 'center',
      marginBottom: 16,
    },
    barChart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 120,
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 12,
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
    },
    bar: {
      width: 24,
      borderRadius: 12,
      marginBottom: 8,
    },
    barLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: currentTheme.colors.border,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    activityGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    activityDay: {
      alignItems: 'center',
    },
    activityDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginBottom: 8,
    },
    activityLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    activityStats: {
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: currentTheme.colors.border,
    },
    activityStatText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    activityStatSubtext: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    moodDistribution: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    moodItem: {
      alignItems: 'center',
    },
    moodCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    moodEmoji: {
      fontSize: 24,
    },
    moodLabel: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 4,
      fontWeight: '500',
    },
    moodPercent: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    moodCount: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      marginTop: 2,
    },
    barValue: {
      fontSize: 10,
      color: currentTheme.colors.text,
      fontWeight: 'bold',
      marginTop: 2,
    },
    progressBar: {
      width: '100%',
      height: 4,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 2,
      marginTop: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 24,
      margin: 20,
      maxHeight: '85%',
      width: '95%',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
    },
    modalCloseButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.background,
    },
    modalContent: {
      padding: 20,
    },
    expandedChart: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 16,
      minHeight: 280,
    },
    expandedChartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    activityWeekContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
      paddingHorizontal: 5,
    },
    activityDayItem: {
      alignItems: 'center',
      flex: 1,
    },
    activityDayLabel: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      marginTop: 6,
      textAlign: 'center',
      fontWeight: '500',
    },
    activitySummary: {
      marginTop: 20,
      padding: 16,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
    },
    activitySummaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    activityGoalText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 12,
    },
    activityProgressBar: {
      height: 8,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    activityProgressFill: {
      height: '100%',
      backgroundColor: '#10b981',
      borderRadius: 4,
    },
    moodTrendChart: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 200,
      marginBottom: 20,
      paddingHorizontal: 5,
    },
    moodTrendItem: {
      alignItems: 'center',
      flex: 1,
    },
    moodTrendValue: {
      fontSize: 24,
      marginBottom: 8,
    },
    moodTrendBar: {
      width: 20,
      backgroundColor: '#10b981',
      borderRadius: 10,
      marginBottom: 8,
    },
    moodTrendLabel: {
      fontSize: 10,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    moodTrendSummary: {
      marginTop: 20,
      padding: 16,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
    },
    moodTrendSummaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    moodTrendInsight: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      fontStyle: 'italic',
    },
  });

  const filteredEntries = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return entries.filter(entry => new Date(entry.date) >= filterDate);
  }, [entries, selectedPeriod]);

  const stats = useMemo(() => {
    const totalEntries = filteredEntries.length;
    const avgMood = totalEntries > 0 
      ? filteredEntries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries 
      : 0;
    const currentStreak = getStreak();

    // Calculate mood distribution
    const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredEntries.forEach(entry => {
      moodCounts[entry.mood as keyof typeof moodCounts]++;
    });

    // Calculate weekly activity
    const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateStr = date.toISOString().split('T')[0];
      return filteredEntries.some(entry => entry.date === dateStr);
    });

    // Get last 7 days mood data
    const last7DaysMood = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateStr = date.toISOString().split('T')[0];
      const entry = filteredEntries.find(e => e.date === dateStr);
      return entry ? entry.mood : 0;
    });

    return {
      totalEntries,
      avgMood: Math.round(avgMood * 10) / 10,
      currentStreak,
      moodCounts,
      weeklyActivity,
      last7DaysMood,
    };
  }, [filteredEntries, getStreak]);

  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>📊 İstatistikler</Text>
        <Text style={dynamicStyles.titleSubtitle}>Günlük alışkanlıklarınızı analiz edin</Text>
        
        <View style={dynamicStyles.periodSelector}>
          <TouchableOpacity
            style={[
              dynamicStyles.periodButton,
              selectedPeriod === 'week' && dynamicStyles.activePeriodButton
            ]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[
              dynamicStyles.periodButtonText,
              selectedPeriod === 'week' && dynamicStyles.activePeriodButtonText
            ]}>
              Hafta
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              dynamicStyles.periodButton,
              selectedPeriod === 'month' && dynamicStyles.activePeriodButton
            ]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[
              dynamicStyles.periodButtonText,
              selectedPeriod === 'month' && dynamicStyles.activePeriodButtonText
            ]}>
              Ay
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              dynamicStyles.periodButton,
              selectedPeriod === 'year' && dynamicStyles.activePeriodButton
            ]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text style={[
              dynamicStyles.periodButtonText,
              selectedPeriod === 'year' && dynamicStyles.activePeriodButtonText
            ]}>
              Yıl
            </Text>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.summaryContainer}>
          <TouchableOpacity style={[dynamicStyles.summaryCard, dynamicStyles.streakCard]}>
            <View style={dynamicStyles.cardIconContainer}>
              <Ionicons name="flame" size={22} color="#ff6b35" />
            </View>
            <View style={dynamicStyles.cardContent}>
              <Text style={dynamicStyles.summaryTitle}>Seri</Text>
              <Text style={dynamicStyles.summaryValue}>{stats.currentStreak}</Text>
              <Text style={dynamicStyles.summaryLabel}>gün üst üste</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[dynamicStyles.summaryCard, dynamicStyles.entriesCard]}>
            <View style={dynamicStyles.cardIconContainer}>
              <Ionicons name="book" size={22} color="#4ade80" />
            </View>
            <View style={dynamicStyles.cardContent}>
              <Text style={dynamicStyles.summaryTitle}>Toplam</Text>
              <Text style={dynamicStyles.summaryValue}>{stats.totalEntries}</Text>
              <Text style={dynamicStyles.summaryLabel}>günlük</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[dynamicStyles.summaryCard, dynamicStyles.moodCard]}>
            <View style={dynamicStyles.cardIconContainer}>
              <Ionicons name="heart" size={22} color="#f59e0b" />
            </View>
            <View style={dynamicStyles.cardContent}>
              <Text style={dynamicStyles.summaryTitle}>Mood</Text>
              <Text style={dynamicStyles.summaryValue}>
                {stats.avgMood > 0 ? stats.avgMood.toFixed(1) : '-'}
              </Text>
              <Text style={dynamicStyles.summaryLabel}>ortalama</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={dynamicStyles.chartsContainer}>
        <View style={dynamicStyles.chartContainer}>
          <View style={dynamicStyles.chartHeader}>
            <View style={dynamicStyles.chartTitleContainer}>
              <Ionicons name="trending-up" size={20} color={currentTheme.colors.primary} />
              <Text style={dynamicStyles.chartTitle}>📈 Son 7 Gün Mood Trendi</Text>
            </View>
            <TouchableOpacity 
              style={dynamicStyles.chartActionButton}
              onPress={() => setExpandedChart('mood')}
            >
              <Ionicons name="expand" size={16} color={currentTheme.colors.secondary} />
            </TouchableOpacity>
          </View>
          <View style={dynamicStyles.modernChart}>
            <View style={dynamicStyles.chartVisual}>
              <View style={dynamicStyles.barChart}>
                {stats.last7DaysMood.map((value, index) => (
                  <TouchableOpacity key={index} style={dynamicStyles.barContainer}>
                    <View 
                      style={[
                        dynamicStyles.bar, 
                        { 
                          height: value > 0 ? (value / 5) * 80 : 8,
                          backgroundColor: value >= 4 ? '#4ade80' : value >= 3 ? '#f59e0b' : value > 0 ? '#ef4444' : currentTheme.colors.border
                        }
                      ]} 
                    />
                    <Text style={dynamicStyles.barLabel}>{['P', 'S', 'Ç', 'P', 'C', 'C', 'P'][index]}</Text>
                    {value > 0 && (
                      <Text style={dynamicStyles.barValue}>{value}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={dynamicStyles.chartLegend}>
              <View style={dynamicStyles.legendItem}>
                <View style={[dynamicStyles.legendDot, { backgroundColor: '#4ade80' }]} />
                <Text style={dynamicStyles.legendText}>İyi (4-5)</Text>
              </View>
              <View style={dynamicStyles.legendItem}>
                <View style={[dynamicStyles.legendDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={dynamicStyles.legendText}>Orta (3)</Text>
              </View>
              <View style={dynamicStyles.legendItem}>
                <View style={[dynamicStyles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={dynamicStyles.legendText}>Kötü (1-2)</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={dynamicStyles.chartContainer}>
          <View style={dynamicStyles.chartHeader}>
            <View style={dynamicStyles.chartTitleContainer}>
              <Ionicons name="calendar" size={20} color={currentTheme.colors.primary} />
              <Text style={dynamicStyles.chartTitle}>📅 Haftalık Aktivite</Text>
            </View>
            <TouchableOpacity 
              style={dynamicStyles.chartActionButton}
              onPress={() => setExpandedChart('activity')}
            >
              <Ionicons name="expand" size={16} color={currentTheme.colors.secondary} />
            </TouchableOpacity>
          </View>
          <View style={dynamicStyles.modernChart}>
            <View style={dynamicStyles.activityGrid}>
              {stats.weeklyActivity.map((hasEntry, index) => {
                const dayNames = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
                return (
                  <TouchableOpacity key={index} style={dynamicStyles.activityDay}>
                    <View style={[
                      dynamicStyles.activityDot,
                      { backgroundColor: hasEntry ? currentTheme.colors.primary : currentTheme.colors.border }
                    ]} />
                    <Text style={dynamicStyles.activityLabel}>{dayNames[index]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={dynamicStyles.activityStats}>
              <Text style={dynamicStyles.activityStatText}>
                Bu hafta {stats.weeklyActivity.filter(Boolean).length} gün günlük yazdın
              </Text>
              <Text style={dynamicStyles.activityStatSubtext}>
                Hedef: 7 gün
              </Text>
              <View style={dynamicStyles.progressBar}>
                <View style={[
                  dynamicStyles.progressFill,
                  { width: `${(stats.weeklyActivity.filter(Boolean).length / 7) * 100}%` }
                ]} />
              </View>
            </View>
          </View>
        </View>

        <View style={dynamicStyles.chartContainer}>
          <View style={dynamicStyles.chartHeader}>
            <View style={dynamicStyles.chartTitleContainer}>
              <Ionicons name="pie-chart" size={20} color={currentTheme.colors.primary} />
              <Text style={dynamicStyles.chartTitle}>🥧 Mood Dağılımı</Text>
            </View>
            <TouchableOpacity 
              style={dynamicStyles.chartActionButton}
              onPress={() => setExpandedChart('distribution')}
            >
              <Ionicons name="expand" size={16} color={currentTheme.colors.secondary} />
            </TouchableOpacity>
          </View>
          <View style={dynamicStyles.modernChart}>
            <View style={dynamicStyles.moodDistribution}>
              <View style={dynamicStyles.moodItem}>
                <TouchableOpacity style={[dynamicStyles.moodCircle, { backgroundColor: '#ef4444' }]}>
                  <Text style={dynamicStyles.moodEmoji}>😢</Text>
                </TouchableOpacity>
                <Text style={dynamicStyles.moodLabel}>Kötü (1-2)</Text>
                <Text style={dynamicStyles.moodPercent}>
                  {stats.totalEntries > 0 ? Math.round(((stats.moodCounts[1] + stats.moodCounts[2]) / stats.totalEntries) * 100) : 0}%
                </Text>
                <Text style={dynamicStyles.moodCount}>
                  {stats.moodCounts[1] + stats.moodCounts[2]} gün
                </Text>
              </View>
              <View style={dynamicStyles.moodItem}>
                <TouchableOpacity style={[dynamicStyles.moodCircle, { backgroundColor: '#f59e0b' }]}>
                  <Text style={dynamicStyles.moodEmoji}>😐</Text>
                </TouchableOpacity>
                <Text style={dynamicStyles.moodLabel}>Orta (3)</Text>
                <Text style={dynamicStyles.moodPercent}>
                  {stats.totalEntries > 0 ? Math.round((stats.moodCounts[3] / stats.totalEntries) * 100) : 0}%
                </Text>
                <Text style={dynamicStyles.moodCount}>
                  {stats.moodCounts[3]} gün
                </Text>
              </View>
              <View style={dynamicStyles.moodItem}>
                <TouchableOpacity style={[dynamicStyles.moodCircle, { backgroundColor: '#4ade80' }]}>
                  <Text style={dynamicStyles.moodEmoji}>😊</Text>
                </TouchableOpacity>
                <Text style={dynamicStyles.moodLabel}>İyi (4-5)</Text>
                <Text style={dynamicStyles.moodPercent}>
                  {stats.totalEntries > 0 ? Math.round(((stats.moodCounts[4] + stats.moodCounts[5]) / stats.totalEntries) * 100) : 0}%
                </Text>
                <Text style={dynamicStyles.moodCount}>
                  {stats.moodCounts[4] + stats.moodCounts[5]} gün
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Expanded Chart Modal */}
      <Modal
        visible={expandedChart !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setExpandedChart(null)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>
                {expandedChart === 'mood' && '📈 Mood Trendi Detayı'}
                {expandedChart === 'activity' && '📅 Aktivite Detayı'}
                {expandedChart === 'distribution' && '🥧 Mood Dağılımı Detayı'}
              </Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setExpandedChart(null)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.expandedChart}>
                {expandedChart === 'mood' && (
                  <>
                    <Text style={{ fontSize: 16, color: currentTheme.colors.text, marginBottom: 16, textAlign: 'center' }}>
                      Son 7 günlük ruh halinizin detaylı analizi
                    </Text>
                    <View style={dynamicStyles.barChart}>
                      {stats.last7DaysMood.map((value, index) => (
                        <View key={index} style={dynamicStyles.barContainer}>
                          <View 
                            style={[
                              dynamicStyles.bar, 
                              { 
                                height: value > 0 ? (value / 5) * 150 : 12,
                                backgroundColor: value >= 4 ? '#4ade80' : value >= 3 ? '#f59e0b' : value > 0 ? '#ef4444' : currentTheme.colors.border
                              }
                            ]} 
                          />
                          <Text style={dynamicStyles.barLabel}>{['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][index]}</Text>
                          {value > 0 && (
                            <Text style={dynamicStyles.barValue}>{value}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                    <View style={dynamicStyles.chartLegend}>
                      <View style={dynamicStyles.legendItem}>
                        <View style={[dynamicStyles.legendDot, { backgroundColor: '#4ade80' }]} />
                        <Text style={dynamicStyles.legendText}>İyi (4-5)</Text>
                      </View>
                      <View style={dynamicStyles.legendItem}>
                        <View style={[dynamicStyles.legendDot, { backgroundColor: '#f59e0b' }]} />
                        <Text style={dynamicStyles.legendText}>Orta (3)</Text>
                      </View>
                      <View style={dynamicStyles.legendItem}>
                        <View style={[dynamicStyles.legendDot, { backgroundColor: '#ef4444' }]} />
                        <Text style={dynamicStyles.legendText}>Kötü (1-2)</Text>
                      </View>
                    </View>
                  </>
                )}
                
                {expandedChart === 'activity' && (
                  <>
                    <Text style={{ fontSize: 16, color: currentTheme.colors.text, marginBottom: 16, textAlign: 'center' }}>
                      Bu haftaki günlük yazma aktiviteniz
                    </Text>
                    <View style={dynamicStyles.activityGrid}>
                      {stats.weeklyActivity.map((hasEntry, index) => {
                        const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
                        return (
                          <View key={index} style={{ alignItems: 'center', marginBottom: 16 }}>
                            <View style={[
                              dynamicStyles.activityDot,
                              { backgroundColor: hasEntry ? currentTheme.colors.primary : currentTheme.colors.border }
                            ]} />
                            <Text style={[dynamicStyles.activityLabel, { marginTop: 8, fontSize: 14 }]}>
                              {dayNames[index]}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    <View style={dynamicStyles.activityStats}>
                      <Text style={dynamicStyles.activityStatText}>
                        Bu hafta {stats.weeklyActivity.filter(Boolean).length} gün günlük yazdın
                      </Text>
                      <Text style={dynamicStyles.activityStatSubtext}>
                        Hedef: 7 gün
                      </Text>
                      <View style={dynamicStyles.progressBar}>
                        <View style={[
                          dynamicStyles.progressFill,
                          { width: `${(stats.weeklyActivity.filter(Boolean).length / 7) * 100}%` }
                        ]} />
                      </View>
                    </View>
                  </>
                )}
                
                {expandedChart === 'distribution' && (
                  <>
                    <Text style={{ fontSize: 16, color: currentTheme.colors.text, marginBottom: 24, textAlign: 'center' }}>
                      Ruh hali dağılımınızın detaylı analizi
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
                      <View style={{ alignItems: 'center' }}>
                        <View style={[dynamicStyles.moodCircle, { backgroundColor: '#ef4444', width: 80, height: 80, borderRadius: 40 }]}>
                          <Text style={{ fontSize: 32 }}>😢</Text>
                        </View>
                        <Text style={[dynamicStyles.moodLabel, { marginTop: 12, fontSize: 16, fontWeight: '600' }]}>Kötü (1-2)</Text>
                        <Text style={[dynamicStyles.moodPercent, { fontSize: 20, marginTop: 4 }]}>
                          {stats.totalEntries > 0 ? Math.round(((stats.moodCounts[1] + stats.moodCounts[2]) / stats.totalEntries) * 100) : 0}%
                        </Text>
                        <Text style={[dynamicStyles.moodCount, { fontSize: 14, marginTop: 2 }]}>
                          {stats.moodCounts[1] + stats.moodCounts[2]} gün
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <View style={[dynamicStyles.moodCircle, { backgroundColor: '#f59e0b', width: 80, height: 80, borderRadius: 40 }]}>
                          <Text style={{ fontSize: 32 }}>😐</Text>
                        </View>
                        <Text style={[dynamicStyles.moodLabel, { marginTop: 12, fontSize: 16, fontWeight: '600' }]}>Orta (3)</Text>
                        <Text style={[dynamicStyles.moodPercent, { fontSize: 20, marginTop: 4 }]}>
                          {stats.totalEntries > 0 ? Math.round((stats.moodCounts[3] / stats.totalEntries) * 100) : 0}%
                        </Text>
                        <Text style={[dynamicStyles.moodCount, { fontSize: 14, marginTop: 2 }]}>
                          {stats.moodCounts[3]} gün
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <View style={[dynamicStyles.moodCircle, { backgroundColor: '#4ade80', width: 80, height: 80, borderRadius: 40 }]}>
                          <Text style={{ fontSize: 32 }}>😊</Text>
                        </View>
                        <Text style={[dynamicStyles.moodLabel, { marginTop: 12, fontSize: 16, fontWeight: '600' }]}>İyi (4-5)</Text>
                        <Text style={[dynamicStyles.moodPercent, { fontSize: 20, marginTop: 4 }]}>
                          {stats.totalEntries > 0 ? Math.round(((stats.moodCounts[4] + stats.moodCounts[5]) / stats.totalEntries) * 100) : 0}%
                        </Text>
                        <Text style={[dynamicStyles.moodCount, { fontSize: 14, marginTop: 2 }]}>
                          {stats.moodCounts[4] + stats.moodCounts[5]} gün
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Activity Detail Modal */}
      <Modal
        visible={expandedChart === 'activity'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setExpandedChart(null)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>📅 Aktivite Detayı</Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setExpandedChart(null)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.expandedChart}>
                <Text style={dynamicStyles.expandedChartTitle}>Bu haftaki günlük yazma aktiviteniz</Text>
                
                <View style={dynamicStyles.activityWeekContainer}>
                  {stats.weeklyActivity.map((isActive, index) => {
                    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
                    return (
                      <View key={index} style={dynamicStyles.activityDayItem}>
                        <View style={[
                          dynamicStyles.activityDot, 
                          { backgroundColor: isActive ? '#10b981' : '#e5e7eb' }
                        ]} />
                        <Text style={dynamicStyles.activityDayLabel}>{dayNames[index]}</Text>
                      </View>
                    );
                  })}
                </View>
                
                <View style={dynamicStyles.activitySummary}>
                  <Text style={dynamicStyles.activitySummaryText}>
                    Bu hafta {stats.weeklyActivity.filter(active => active).length} gün günlük yazdın
                  </Text>
                  <Text style={dynamicStyles.activityGoalText}>Hedef: 7 gün</Text>
                  <View style={dynamicStyles.activityProgressBar}>
                    <View style={[
                      dynamicStyles.activityProgressFill, 
                      { width: `${(stats.weeklyActivity.filter(active => active).length / 7) * 100}%` }
                    ]} />
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Mood Trend Detail Modal */}
      <Modal
        visible={expandedChart === 'mood'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setExpandedChart(null)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContainer}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>📈 Mood Trendi Detayı</Text>
              <TouchableOpacity 
                style={dynamicStyles.modalCloseButton}
                onPress={() => setExpandedChart(null)}
              >
                <Ionicons name="close" size={24} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.expandedChart}>
                <Text style={dynamicStyles.expandedChartTitle}>Son 7 gün mood değişiminiz</Text>
                
                <View style={dynamicStyles.moodTrendChart}>
                  {stats.last7DaysMood.map((mood, index) => {
                    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
                    const moodEmojis = ['', '😔', '😐', '😊', '😄', '🤩'];
                    return (
                      <View key={index} style={dynamicStyles.moodTrendItem}>
                        <Text style={dynamicStyles.moodTrendValue}>{moodEmojis[mood]}</Text>
                        <View style={[
                          dynamicStyles.moodTrendBar, 
                          { height: mood > 0 ? mood * 20 : 10 }
                        ]} />
                        <Text style={dynamicStyles.moodTrendLabel}>{dayNames[index]}</Text>
                      </View>
                    );
                  })}
                </View>
                
                <View style={dynamicStyles.moodTrendSummary}>
                  <Text style={dynamicStyles.moodTrendSummaryText}>
                    Ortalama mood: {stats.avgMood}/5
                  </Text>
                  <Text style={dynamicStyles.moodTrendInsight}>
                    {stats.avgMood >= 4 ? 'Harika bir hafta geçirmişsin! 😊' : 
                     stats.avgMood >= 3 ? 'İyi bir hafta geçirmişsin 👍' : 
                     'Gelecek hafta daha iyi olacak! 💪'}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}