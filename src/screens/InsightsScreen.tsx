import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useDiary } from '../hooks/useDiary';
import { getAllInsights, Insight } from '../utils/insightsEngine';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface InsightsScreenProps {
  navigation: any;
}

export default function InsightsScreen({ navigation }: InsightsScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const { entries } = useDiary(user?.uid);
  
  const [insights, setInsights] = useState<Insight[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // İçgörüleri hesapla
  useEffect(() => {
    const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
    if (entries.length > 0) {
      const allInsights = getAllInsights(entries, t, locale);
      setInsights(allInsights);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      setInsights([]);
      fadeAnim.setValue(0);
    }
  }, [entries, t, currentLanguage]);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      marginBottom: 20,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    insightsContainer: {
      padding: 20,
      paddingTop: 0,
    },
    insightCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    insightHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    insightIcon: {
      fontSize: 28,
      marginRight: 12,
    },
    insightTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      flex: 1,
    },
    insightDescription: {
      fontSize: 15,
      color: currentTheme.colors.secondary,
      lineHeight: 22,
      marginLeft: 40,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginLeft: 8,
    },
    priorityText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
  });

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return { backgroundColor: '#ef4444' + '20', color: '#ef4444' };
      case 'medium':
        return { backgroundColor: '#f59e0b' + '20', color: '#f59e0b' };
      case 'low':
        return { backgroundColor: '#10b981' + '20', color: '#10b981' };
      default:
        return { backgroundColor: currentTheme.colors.border, color: currentTheme.colors.text };
    }
  };

  if (insights.length === 0) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>💡 {t('dashboard.yourPersonalInsights')}</Text>
          <Text style={dynamicStyles.subtitle}>{t('insights.noInsightsYet') || 'Henüz içgörü yok'}</Text>
        </View>
        <View style={dynamicStyles.emptyState}>
          <Text style={dynamicStyles.emptyIcon}>📊</Text>
          <Text style={dynamicStyles.emptyTitle}>{t('insights.writeFirstDiary') || 'İlk Günlüğünü Yaz'}</Text>
          <Text style={dynamicStyles.emptyDescription}>
            {t('insights.writeFirstDiaryDesc') || 'Daha fazla günlük yazdıkça, kişiselleştirilmiş içgörüler görmeye başlayacaksın!'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>💡 {t('dashboard.yourPersonalInsights')}</Text>
        <Text style={dynamicStyles.subtitle}>
          {t('insights.discoverYourself') || `${insights.length} ${t('insights.insights') || 'içgörü'} keşfet`}
        </Text>
      </View>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={dynamicStyles.container}
          contentContainerStyle={dynamicStyles.insightsContainer}
          showsVerticalScrollIndicator={false}
        >
          {insights.map((insight, index) => {
            const priorityStyle = getPriorityColor(insight.priority);
            return (
              <View
                key={`${insight.type}-${index}`}
                style={[
                  dynamicStyles.insightCard,
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: insight.color || currentTheme.colors.primary,
                  }
                ]}
              >
                <View style={dynamicStyles.insightHeader}>
                  <Text style={dynamicStyles.insightIcon}>{insight.icon}</Text>
                  <Text style={dynamicStyles.insightTitle}>{insight.title}</Text>
                  <View style={[dynamicStyles.priorityBadge, { backgroundColor: priorityStyle.backgroundColor }]}>
                    <Text style={[dynamicStyles.priorityText, { color: priorityStyle.color }]}>
                      {insight.priority === 'high' ? t('common.high') :
                       insight.priority === 'medium' ? t('common.medium') :
                       t('common.low')}
                    </Text>
                  </View>
                </View>
                <Text style={dynamicStyles.insightDescription}>
                  {insight.description}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

