import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HelpGuideScreenProps {
  navigation: any;
}

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

export default function HelpGuideScreen({ navigation }: HelpGuideScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const FAQ_ITEMS: FAQItem[] = [
    { q: t('settings.howToWriteDiary'), a: t('settings.diaryInstructions'), category: 'diary' },
    { q: t('settings.dreamVsGoal'), a: t('settings.dreamVsGoalAnswer'), category: 'goals' },
    { q: t('settings.whatArePromisesFor'), a: t('settings.promisesAnswer'), category: 'goals' },
    { q: t('settings.whatIsMilestone'), a: t('settings.milestoneAnswer'), category: 'goals' },
    { q: t('settings.howToSetupNotifications'), a: t('settings.notificationsAnswer'), category: 'settings' },
    { q: t('settings.howThemeChange'), a: t('settings.themeChangeAnswer'), category: 'settings' },
    { q: t('settings.howLanguageChanged'), a: t('settings.languageChangeAnswer'), category: 'settings' },
    { q: t('settings.willDataBeLost'), a: t('settings.dataBackupAnswer'), category: 'data' },
    { q: t('settings.areMessagesPersonal'), a: t('settings.messagesPersonalAnswer'), category: 'general' },
    { q: t('settings.wantToReportProblem'), a: t('settings.reportProblemAnswer'), category: 'support' },
  ];

  const categories = [
    { id: 'diary', name: t('settings.diary'), icon: '📝', color: '#3b82f6' },
    { id: 'goals', name: t('settings.goals'), icon: '🎯', color: '#10b981' },
    { id: 'settings', name: t('settings.settings'), icon: '⚙️', color: '#8b5cf6' },
    { id: 'data', name: t('settings.data'), icon: '💾', color: '#f59e0b' },
    { id: 'general', name: t('settings.general'), icon: '💡', color: '#06b6d4' },
    { id: 'support', name: t('settings.support'), icon: '🆘', color: '#ef4444' },
  ];

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || t('settings.general');
  };

  const getCategoryIcon = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.icon || '💡';
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: currentTheme.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.primary + '20',
      paddingTop: 60,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginLeft: 16,
      flex: 1,
    },
    content: { paddingHorizontal: 20, paddingTop: 20 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    card: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 12,
    },
    stepBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: currentTheme.colors.primary + '20',
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '35',
    },
    stepBadgeText: { color: currentTheme.colors.primary, fontWeight: '700', fontSize: 14 },
    stepTitle: { color: currentTheme.colors.text, fontWeight: '700', marginBottom: 4, fontSize: 15 },
    stepDesc: { color: currentTheme.colors.secondary, fontSize: 13, lineHeight: 18 },
    faqCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      overflow: 'hidden',
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      justifyContent: 'space-between',
    },
    faqHeaderLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    faqCategoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: currentTheme.colors.primary + '15',
    },
    faqCategoryText: {
      fontSize: 10,
      fontWeight: '600',
      color: currentTheme.colors.primary,
      textTransform: 'uppercase',
    },
    faqQ: {
      color: currentTheme.colors.text,
      fontWeight: '600',
      fontSize: 14,
      flex: 1,
    },
    faqIcon: {
      marginLeft: 8,
    },
    faqA: {
      color: currentTheme.colors.secondary,
      lineHeight: 20,
      fontSize: 13,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    actionButton: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 12,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    actionText: { color: currentTheme.colors.background, fontWeight: '600', fontSize: 14 },
    quickStartCard: {
      backgroundColor: currentTheme.colors.primary + '10',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary + '30',
    },
    quickStartTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 12,
    },
    supportCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: '#10b981' + '30',
    },
    supportTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    supportDesc: {
      color: currentTheme.colors.secondary,
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 12,
    },
  });

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: currentTheme.colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={currentTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>📘 {t('settings.helpGuide')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={s.content}>
          {/* Hızlı Başlangıç */}
          <View style={s.quickStartCard}>
            <Text style={s.quickStartTitle}>🚀 {t('settings.quickStart')}</Text>
            {[
              { t: t('settings.writeDiary'), d: t('settings.diaryDescription') },
              { t: t('settings.addDreamGoal'), d: t('settings.dreamGoalDescription') },
              { t: t('settings.markMilestones'), d: t('settings.milestonesDescription') },
              { t: t('settings.setNotifications'), d: t('settings.notificationsDescription') },
            ].map((sItem, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepBadge}>
                  <Text style={s.stepBadgeText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepTitle}>{sItem.t}</Text>
                  <Text style={s.stepDesc}>{sItem.d}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* SSS */}
          <Text style={s.sectionTitle}>❓ {t('settings.frequentlyAskedQuestions')}</Text>
          {FAQ_ITEMS.map((item, idx) => {
            const isExpanded = expandedItems.has(idx);
            return (
              <TouchableOpacity
                key={idx}
                style={s.faqCard}
                onPress={() => toggleExpanded(idx)}
                activeOpacity={0.8}
              >
                <View style={s.faqHeader}>
                  <View style={s.faqHeaderLeft}>
                    <View style={s.faqCategoryBadge}>
                      <Text style={s.faqCategoryText}>
                        {getCategoryIcon(item.category)} {getCategoryName(item.category)}
                      </Text>
                    </View>
                    <Text style={s.faqQ} numberOfLines={2}>
                      {item.q}
                    </Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={currentTheme.colors.secondary}
                    style={s.faqIcon}
                  />
                </View>
                {isExpanded && <Text style={s.faqA}>{item.a}</Text>}
              </TouchableOpacity>
            );
          })}

          {/* Yardım */}
          <View style={s.supportCard}>
            <Text style={s.supportTitle}>💬 {t('settings.moreHelp')}</Text>
            <Text style={s.supportDesc}>{t('settings.contactForSupport')}</Text>
            <TouchableOpacity
              style={s.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                // Email açma işlemi buraya eklenebilir
              }}
              activeOpacity={0.9}
            >
              <Text style={s.actionText}>📩 msesoftware1425@gmail.com</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
