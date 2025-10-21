import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HelpGuideScreenProps {
  navigation: any;
}

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: 'Günlük nasıl yazılır?', a: 'Ana sayfadaki “Bugün Yaz” butonuna bas, hislerini ve düşüncelerini yaz.' },
  { q: 'Hayal ve Hedef arasındaki fark nedir?', a: 'Hayal vizyonundur, hedef ise ölçülebilir bir adımdır. Hedefler milestone’larla ilerler.' },
  { q: 'Sözler ne işe yarar?', a: 'Kendine verdiğin basit taahhütlerdir. Tamamladıkça güvenini artırır.' },
  { q: 'Bildirimleri nasıl ayarlarım?', a: 'Ayarlar > Bildirimler ekranından sabah/akşam, sessiz saatler ve özet seçeneklerini yönet.' },
  { q: 'Tema nasıl değişir?', a: 'Ayarlar > Tema Seçimi üzerinden anında değiştirebilirsin.' },
  { q: 'Milestone nedir?', a: 'Hedef içindeki alt görevlerdir. İşaretledikçe yüzde otomatik artar, %100’de mini kutlama olur.' },
  { q: 'Verilerim kaybolur mu?', a: 'Veriler cihazında saklanır; düzenli yedekleme için “Veri Yedekleme” ekranını kullan.' },
  { q: 'Dil nasıl değiştirilir?', a: 'Ayarlar > Dil Seçimi üzerinden Türkçe/İngilizce arasında geçiş yap.' },
  { q: 'Motivasyon mesajları kişisel mi?', a: 'Ruh halin ve hedef trendlerine göre mesajlar dinamikleşir.' },
  { q: 'Sorun bildirmek isterim.', a: 'Ayarlar > Yardım & Destek bölümünden bize ulaşabilirsin.' },
];

export default function HelpGuideScreen({ navigation }: HelpGuideScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();

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
          <Text style={s.title}>📘 Yardım & Kılavuz</Text>
          <Text style={s.subtitle}>Kısa adımlarla başla, SSS ile hızlı cevapları bul.</Text>
        </View>

        {/* Hızlı Başlangıç */}
        <View style={s.section}>
          <View style={s.card}>
            {[ 
              { t: 'Günlük Yaz', d: 'Ana sayfada “Bugün Yaz”a dokun, hislerini not al.' },
              { t: 'Hayal/Hedef Ekle', d: 'Hayaller ekranından yeni hayal ya da hedef oluştur.' },
              { t: 'Milestone’ları İşaretle', d: 'Hedef içindeki alt görevleri tamamladıkça yüzde otomatik artar.' },
              { t: 'Bildirimleri Ayarla', d: 'Ayarlar > Bildirimler: sabah/akşam, sessiz saatler ve özet.' },
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
            <Text style={s.stepTitle}>Daha Fazla Yardım</Text>
            <Text style={s.stepDesc}>Sorun, öneri veya destek için bizimle iletişime geç.</Text>
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


