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
    { q: t('welcome') === 'Welcome' ? 'How to write a diary?' : 'Günlük nasıl yazılır?', a: t('welcome') === 'Welcome' ? 'Press the "Write Today" button on the main page, write your feelings and thoughts.' : 'Ana sayfadaki "Bugün Yaz" butonuna bas, hislerini ve düşüncelerini yaz.' },
    { q: t('welcome') === 'Welcome' ? 'What is the difference between Dream and Goal?' : 'Hayal ve Hedef arasındaki fark nedir?', a: t('welcome') === 'Welcome' ? 'Dream is vision, goal is measurable step. Goals progress with milestones.' : 'Hayal vizyonundur, hedef ise ölçülebilir bir adımdır. Hedefler milestone ile ilerler.' },
    { q: t('welcome') === 'Welcome' ? 'What are promises for?' : 'Sözler ne işe yarar?', a: t('welcome') === 'Welcome' ? 'Simple commitments you make to yourself. Increases confidence as you complete them.' : 'Kendine verdiğin basit taahhütlerdir. Tamamladıkça güvenini artırır.' },
    { q: t('welcome') === 'Welcome' ? 'How do I set up notifications?' : 'Bildirimleri nasıl ayarlarım?', a: t('welcome') === 'Welcome' ? 'Manage morning/evening, silent hours and summary options from Settings > Notifications.' : 'Ayarlar > Bildirimler ekranından sabah/akşam, sessiz saatler ve özet seçeneklerini yönet.' },
    { q: t('welcome') === 'Welcome' ? 'How does theme change?' : 'Tema nasıl değişir?', a: t('welcome') === 'Welcome' ? 'You can change it instantly via Settings > Theme Selection.' : 'Ayarlar > Tema Seçimi üzerinden anında değiştirebilirsin.' },
    { q: t('welcome') === 'Welcome' ? 'What is Milestone?' : 'Milestone nedir?', a: t('welcome') === 'Welcome' ? 'Sub-tasks within goals. Percentage automatically increases as you mark them, mini celebration at 100%.' : 'Hedef içindeki alt görevlerdir. İşaretledikçe yüzde otomatik artar, yüzde 100 de mini kutlama olur.' },
    { q: t('welcome') === 'Welcome' ? 'Will my data be lost?' : 'Verilerim kaybolur mu?', a: t('welcome') === 'Welcome' ? 'Data is stored on device; use "Data Backup" screen for regular backups.' : 'Veriler cihazında saklanır; düzenli yedekleme için "Veri Yedekleme" ekranını kullan.' },
    { q: t('welcome') === 'Welcome' ? 'How is language changed?' : 'Dil nasıl değiştirilir?', a: t('welcome') === 'Welcome' ? 'Switch between Turkish/English via Settings > Language Selection.' : 'Ayarlar > Dil Seçimi üzerinden Türkçe/İngilizce arasında geçiş yap.' },
    { q: t('welcome') === 'Welcome' ? 'Are motivation messages personal?' : 'Motivasyon mesajları kişisel mi?', a: t('welcome') === 'Welcome' ? 'Messages become dynamic according to your mood and goal trends.' : 'Ruh halin ve hedef trendlerine göre mesajlar dinamikleşir.' },
    { q: t('welcome') === 'Welcome' ? 'I want to report a problem.' : 'Sorun bildirmek isterim.', a: t('welcome') === 'Welcome' ? 'You can reach us from Settings > Help & Support section.' : 'Ayarlar > Yardım & Destek bölümünden bize ulaşabilirsin.' },
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
          <Text style={s.title}>📘 {t('welcome') === 'Welcome' ? 'Help & Guide' : 'Yardım & Kılavuz'}</Text>
          <Text style={s.subtitle}>{t('welcome') === 'Welcome' ? 'Start with quick steps, find quick answers with FAQ.' : 'Kısa adımlarla başla, SSS ile hızlı cevapları bul.'}</Text>
        </View>

        {/* Hızlı Başlangıç */}
        <View style={s.section}>
          <View style={s.card}>
            {[ 
              { t: t('welcome') === 'Welcome' ? 'Write Diary' : 'Günlük Yaz', d: t('welcome') === 'Welcome' ? 'Touch "Write Today" on main page, note your feelings.' : 'Ana sayfada "Bugün Yaz"a dokun, hislerini not al.' },
              { t: t('welcome') === 'Welcome' ? 'Add Dream/Goal' : 'Hayal/Hedef Ekle', d: t('welcome') === 'Welcome' ? 'Create new dream or goal from dreams screen.' : 'Hayaller ekranından yeni hayal ya da hedef oluştur.' },
              { t: t('welcome') === 'Welcome' ? 'Mark Milestones' : 'Milestone İşaretle', d: t('welcome') === 'Welcome' ? 'Percentage automatically increases as you complete subtasks within goals.' : 'Hedef içindeki alt görevleri tamamladıkça yüzde otomatik artar.' },
              { t: t('welcome') === 'Welcome' ? 'Set Notifications' : 'Bildirimleri Ayarla', d: t('welcome') === 'Welcome' ? 'Settings > Notifications: morning/evening, silent hours and summary.' : 'Ayarlar > Bildirimler: sabah/akşam, sessiz saatler ve özet.' },
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
            <Text style={s.stepTitle}>{t('welcome') === 'Welcome' ? 'More Help' : 'Daha Fazla Yardım'}</Text>
            <Text style={s.stepDesc}>{t('welcome') === 'Welcome' ? 'Contact us for issues, suggestions or support.' : 'Sorun, öneri veya destek için bizimle iletişime geç.'}</Text>
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


