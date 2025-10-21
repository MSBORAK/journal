import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ThemeSelectionScreenProps {
  navigation: any;
}

const themeDescriptions: { [key: string]: string } = {
  light: 'Açık renkli, temiz görünüm',
  dark: 'Koyu renkli, göz yormaz',
  ocean: 'Mavi tonları, sakin hissiyat',
  sunset: 'Turuncu tonları, sıcak hissiyat',
  forest: 'Yeşil tonları, doğal hissiyat',
  lavender: 'Mor tonları, zarif görünüm',
  rose: 'Pembe tonları, romantik hissiyat',
};

export default function ThemeSelectionScreen({ navigation }: ThemeSelectionScreenProps) {
  const { currentTheme, setTheme, themes } = useTheme();
  const [filter, setFilter] = useState<'cozy' | 'luxury'>('cozy');

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.primary + '20',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginLeft: 16,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
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
      marginBottom: 24,
      lineHeight: 24,
    },
    infoCard: {
      backgroundColor: currentTheme.colors.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: currentTheme.colors.primary + '20',
    },
    infoText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
    },
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    themeCard: {
      width: '47%',
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
    },
    themeCardInner: {
      padding: 16,
    },
    themePreview: {
      width: '100%',
      height: 80,
      borderRadius: 12,
      marginBottom: 12,
      padding: 12,
      backgroundColor: currentTheme.colors.background,
    },
    swatchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    swatch: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
    },
    themeLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    themeDescription: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      lineHeight: 16,
    },
    selectedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
  });

  const handleThemeSelect = async (themeName: string) => {
    await setTheme(themeName);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
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
        <Text style={dynamicStyles.headerTitle}>Tema Seçimi</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={dynamicStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={dynamicStyles.title}>🎨 Tema Seç</Text>
        <Text style={dynamicStyles.subtitle}>
          Uygulamanızın görünümünü kişiselleştirin
        </Text>

        {/* Style (Cozy / Luxury) quick selector */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => {
              setFilter('cozy');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{ flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: currentTheme.colors.border }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[ currentTheme.colors.card, currentTheme.colors.primary ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 14, alignItems: 'center', opacity: filter === 'cozy' ? 1 : 0.8 }}
            >
              <Text style={{ fontWeight: '700', color: currentTheme.colors.text }}>🌿 Cozy</Text>
              <Text style={{ color: currentTheme.colors.secondary, marginTop: 4, fontSize: 12 }}>Warm & soft</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setFilter('luxury');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{ flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: currentTheme.colors.border }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[ currentTheme.colors.card, currentTheme.colors.secondary ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 14, alignItems: 'center', opacity: filter === 'luxury' ? 1 : 0.8 }}
            >
              <Text style={{ fontWeight: '700', color: currentTheme.colors.text }}>💎 Luxury</Text>
              <Text style={{ color: currentTheme.colors.secondary, marginTop: 4, fontSize: 12 }}>Bold & elegant</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>
            💡 İpucu: Seçtiğiniz tema tüm uygulamada anında uygulanır. 
            Gözlerinize en uygun temayı seçerek daha konforlu bir deneyim yaşayın.
          </Text>
        </View>

        {/* Grouped lists */}
        {(() => {
          const cozyKeys = [
            'cozy', 'alabaster', 'columbia', 'cherry', 'cambridge', 'peach',
            'linen', 'khaki', 'oldRose', 'ocean', 'weldonBlue', 'silverPink', 'buttermilk', 'softMinimal'
          ];
          const luxuryKeys = [
            'luxury', 'softMinimalDark', 'darkSlate', 'oldBurgundy', 'garnet',
            'policeBlue', 'rackley', 'chineseBlack'
          ];

          const renderCard = (key: string) => {
            const theme = (themes as any)[key];
            if (!theme) return null;
            const isSelected = currentTheme.name === theme.name;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  dynamicStyles.themeCard,
                  {
                    backgroundColor: currentTheme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : currentTheme.colors.primary + '20',
                  },
                ]}
                onPress={() => handleThemeSelect(key)}
                activeOpacity={0.7}
              >
                <View style={dynamicStyles.themeCardInner}>
                  <View style={dynamicStyles.themePreview}>
                    <View style={dynamicStyles.swatchRow}>
                      <View style={[dynamicStyles.swatch, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]} />
                      <View style={[dynamicStyles.swatch, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} />
                      <View style={[dynamicStyles.swatch, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]} />
                      <View style={[dynamicStyles.swatch, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary }]} />
                    </View>
                  </View>
                  <Text style={dynamicStyles.themeLabel}>{theme.name}</Text>
                  <Text style={dynamicStyles.themeDescription}>
                    {themeDescriptions[theme.name] || 'Özel tema'}
                  </Text>
                  {isSelected && (
                    <View style={dynamicStyles.selectedBadge}>
                      <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          };

          if (filter === 'cozy') {
            return (
              <>
                <Text style={[dynamicStyles.title, { fontSize: 20, marginTop: 8 }]}>🌿 Cozy (Light)</Text>
                <View style={dynamicStyles.themeGrid}>{cozyKeys.map(renderCard)}</View>
              </>
            );
          }
          return (
            <>
              <Text style={[dynamicStyles.title, { fontSize: 20, marginTop: 8 }]}>💎 Luxury (Dark)</Text>
              <View style={dynamicStyles.themeGrid}>{luxuryKeys.map(renderCard)}</View>
            </>
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
}
