import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
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

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 50,
      backgroundColor: currentTheme.colors.card,
      marginHorizontal: 20,
      marginTop: 100,
      marginBottom: 40,
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
    journeyHeader: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 24,
      padding: 28,
      marginHorizontal: 20,
      marginBottom: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderTopWidth: 4,
      borderTopColor: currentTheme.colors.primary,
    },
    journeyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 12,
    },
    journeyDate: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: 8,
    },
    journeyDuration: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
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
      flexDirection: 'column',
      gap: 16,
      marginBottom: 32,
      paddingHorizontal: 20,
    },
    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 12,
      minHeight: 60,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    streakCard: {
      borderTopWidth: 4,
      borderTopColor: '#ff6b35',
      backgroundColor: '#fff7f0',
    },
    entriesCard: {
      borderTopWidth: 4,
      borderTopColor: '#4ade80',
      backgroundColor: '#f0fdf4',
    },
    moodCard: {
      borderTopWidth: 4,
      borderTopColor: '#f59e0b',
      backgroundColor: '#fffbeb',
    },
    cardIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: currentTheme.colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardContent: {
      flex: 1,
      alignItems: 'flex-start',
      marginLeft: 16,
    },
    summaryTitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      fontWeight: '600',
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '800',
      color: currentTheme.colors.text,
      marginBottom: 2,
    },
    summaryLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '400',
    },
    milestoneContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 24,
      padding: 24,
      marginHorizontal: 20,
      marginBottom: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderTopWidth: 4,
      borderTopColor: '#F59E0B',
    },
    milestoneTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    milestoneItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.background,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    milestoneIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    milestoneContent: {
      flex: 1,
    },
    milestoneLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 2,
    },
    milestoneStatus: {
      fontSize: 13,
      color: currentTheme.colors.secondary,
    },
    highlightContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 24,
      padding: 24,
      marginHorizontal: 20,
      marginBottom: 24,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      borderTopWidth: 4,
      borderTopColor: '#8B5CF6',
    },
    highlightTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    highlightItem: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    highlightEmoji: {
      fontSize: 24,
      marginBottom: 8,
    },
    highlightLabel: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 4,
    },
    highlightValue: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    chartsContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    chartContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
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
    barWrapper: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: 160,
    },
    moodSummary: {
      marginTop: 16,
    },
    moodSummaryTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
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
      maxHeight: '90%',
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
      flex: 1,
    },
    expandedChart: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 16,
      padding: 16,
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

  // Calculate journey data
  const firstEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const firstDate = firstEntry ? new Date(firstEntry.date) : new Date();
  const daysSinceStart = firstEntry 
    ? Math.floor((new Date().getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate milestones
  const milestones = [
    { 
      icon: '✍️', 
      label: 'İlk Günlük', 
      status: entries.length > 0 ? 'Tamamlandı ✅' : 'Henüz başlamadın',
      completed: entries.length > 0,
      color: '#4ade80'
    },
    { 
      icon: '🔥', 
      label: '7 Gün Seri', 
      status: stats.currentStreak >= 7 ? 'Tamamlandı ✅' : `${stats.currentStreak}/7 gün`,
      completed: stats.currentStreak >= 7,
      color: '#f59e0b'
    },
    { 
      icon: '🎯', 
      label: '30 Gün Hedefi', 
      status: stats.totalEntries >= 30 ? 'Tamamlandı ✅' : `${stats.totalEntries}/30 günlük`,
      completed: stats.totalEntries >= 30,
      color: '#8b5cf6'
    },
    { 
      icon: '💎', 
      label: '100 Gün Efsanesi', 
      status: stats.totalEntries >= 100 ? 'Tamamlandı ✅' : `${stats.totalEntries}/100 günlük`,
      completed: stats.totalEntries >= 100,
      color: '#ef4444'
    },
  ];

  // Calculate highlights
  const happiestDay = entries.length > 0 
    ? entries.reduce((max, entry) => entry.mood > max.mood ? entry : max, entries[0])
    : null;
  
  const longestEntry = entries.length > 0
    ? entries.reduce((max, entry) => entry.content.length > max.content.length ? entry : max, entries[0])
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background }}>
      <ScrollView 
        style={dynamicStyles.container}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>🗺️ Yolculuğum</Text>
          <Text style={dynamicStyles.titleSubtitle}>Günlük yazma serüvenin</Text>
        </View>

        {/* Başlangıç Bölümü */}
      <View style={dynamicStyles.journeyHeader}>
        <Text style={dynamicStyles.journeyTitle}>🌅 Başlangıç</Text>
        <Text style={dynamicStyles.journeyDate}>
          {firstEntry ? new Date(firstEntry.date).toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }) : 'Henüz başlamadın'}
        </Text>
        <Text style={dynamicStyles.journeyDuration}>
          {daysSinceStart > 0 ? `${daysSinceStart} gün önce başladın` : 'İlk günlüğünü yaz!'}
        </Text>
      </View>

      {/* Kilometre Taşları */}
      <View style={dynamicStyles.milestoneContainer}>
          <Text style={dynamicStyles.milestoneTitle}>🏆 Kilometre Taşları</Text>
          {milestones.map((milestone, index) => (
            <View key={index} style={dynamicStyles.milestoneItem}>
              <View style={[dynamicStyles.milestoneIcon, { backgroundColor: milestone.completed ? milestone.color : currentTheme.colors.border }]}>
                <Text style={{ fontSize: 20 }}>{milestone.icon}</Text>
              </View>
              <View style={dynamicStyles.milestoneContent}>
                <Text style={dynamicStyles.milestoneLabel}>{milestone.label}</Text>
                <Text style={dynamicStyles.milestoneStatus}>{milestone.status}</Text>
              </View>
              {milestone.completed && (
                <Ionicons name="checkmark-circle" size={24} color={milestone.color} />
              )}
            </View>
          ))}
        </View>

        {/* Üretkenlik Bölümü */}
        <View style={dynamicStyles.highlightContainer}>
          <Text style={dynamicStyles.highlightTitle}>🎯 Üretkenlik</Text>
          
          <View style={dynamicStyles.highlightItem}>
            <Text style={dynamicStyles.highlightEmoji}>📈</Text>
            <Text style={dynamicStyles.highlightLabel}>İlerleme Takibi</Text>
            <Text style={dynamicStyles.highlightValue}>
              {entries.length} günlük yazdın • {entries.reduce((total, entry) => total + (entry.content?.length || 0), 0)} kelime
            </Text>
          </View>

          <View style={dynamicStyles.highlightItem}>
            <Text style={dynamicStyles.highlightEmoji}>🏆</Text>
            <Text style={dynamicStyles.highlightLabel}>Başarılarım</Text>
            <Text style={dynamicStyles.highlightValue}>
              {milestones.filter(m => m.completed).length}/{milestones.length} hedef tamamlandı
            </Text>
          </View>

          <View style={dynamicStyles.highlightItem}>
            <Text style={dynamicStyles.highlightEmoji}>📅</Text>
            <Text style={dynamicStyles.highlightLabel}>Haftalık Rapor</Text>
            <Text style={dynamicStyles.highlightValue}>
              Bu hafta {(() => {
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                const weeklyEntries = entries.filter(entry => new Date(entry.date) >= startOfWeek);
                return weeklyEntries.length;
              })()} günlük yazdın
            </Text>
          </View>

          <View style={dynamicStyles.highlightItem}>
            <Text style={dynamicStyles.highlightEmoji}>⏰</Text>
            <Text style={dynamicStyles.highlightLabel}>Odaklanma Süresi</Text>
            <Text style={dynamicStyles.highlightValue}>
              Ortalama günlük yazma süresi: {entries.length > 0 ? Math.round(entries.reduce((total, entry) => total + (entry.content?.length || 0), 0) / entries.length / 10) : 0} dakika
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}