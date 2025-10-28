import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HelpGuideScreenProps {
  navigation: any;
}


export default function HelpGuideScreen({ navigation }: HelpGuideScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();

  const FAQ_ITEMS: { q: string; a: string }[] = [
    { q: t('settings.howToWriteDiary'), a: t('settings.diaryInstructions') },
    { q: t('settings.dreamVsGoal'), a: t('settings.dreamVsGoalAnswer') },
    { q: t('settings.whatArePromisesFor'), a: t('settings.promisesAnswer') },
    { q: t('settings.howToSetupNotifications'), a: t('settings.notificationsAnswer') },
    { q: t('settings.howThemeChange'), a: t('settings.themeChangeAnswer') },
    { q: t('settings.whatIsMilestone'), a: t('settings.milestoneAnswer') },
    { q: t('settings.willDataBeLost'), a: t('settings.dataBackupAnswer') },
    { q: t('settings.howLanguageChanged'), a: t('settings.languageChangeAnswer') },
    { q: t('settings.areMessagesPersonal'), a: t('settings.messagesPersonalAnswer') },
    { q: t('settings.wantToReportProblem'), a: t('settings.reportProblemAnswer') },
  ];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: currentTheme.colors.background },
    header: { paddingTop: 100, paddingHorizontal: 20, paddingBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: currentTheme.colors.text, marginBottom: 8 },
    subtitle: { fontSize: 14, color: currentTheme.colors.secondary },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    card: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
    stepBadge: {
      width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
      backgroundColor: currentTheme.colors.primary + '20', borderWidth: 1, borderColor: currentTheme.colors.primary + '35',
    },
    stepBadgeText: { color: currentTheme.colors.primary, fontWeight: '700' },
    stepTitle: { color: currentTheme.colors.text, fontWeight: '700', marginBottom: 4 },
    stepDesc: { color: currentTheme.colors.secondary },
    faqQ: { color: currentTheme.colors.text, fontWeight: '700', marginBottom: 6 },
    faqA: { color: currentTheme.colors.secondary, lineHeight: 20 },
    actionButton: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    actionText: { color: currentTheme.colors.card, fontWeight: '700' },
  });

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={s.header}>
          <Text style={s.title}>📘 {t('settings.helpGuide')}</Text>
          <Text style={s.subtitle}>{t('settings.startWithQuickSteps')}</Text>
        </View>

        {/* Hızlı Başlangıç */}
        <View style={s.section}>
          <View style={s.card}>
            {[ 
              { t: t('settings.writeDiary'), d: t('settings.diaryDescription') },
              { t: t('settings.addDreamGoal'), d: t('settings.dreamGoalDescription') },
              { t: t('settings.markMilestones'), d: t('settings.milestonesDescription') },
              { t: t('settings.setNotifications'), d: t('settings.notificationsDescription') },
            ].map((sItem, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepBadge}><Text style={s.stepBadgeText}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepTitle}>{sItem.t}</Text>
                  <Text style={s.stepDesc}>{sItem.d}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* SSS */}
        <View style={s.section}>
          {FAQ_ITEMS.map((item, idx) => (
            <View key={idx} style={s.card}>
              <Text style={s.faqQ}>❓ {item.q}</Text>
              <Text style={s.faqA}>{item.a}</Text>
            </View>
          ))}
        </View>

        {/* Yardım */}
        <View style={s.section}>
          <View style={s.card}>
            <Text style={s.stepTitle}>{t('settings.moreHelp')}</Text>
            <Text style={s.stepDesc}>{t('settings.contactForSupport')}</Text>
            <TouchableOpacity
              style={s.actionButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              activeOpacity={0.9}
            >
              <Text style={s.actionText}>📩 msesoftware1425@gmail.com</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


