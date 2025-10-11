import React from 'react';
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
import { useLanguage } from '../i18n/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageSelectionScreenProps {
  navigation: any;
}

const languages = [
  {
    code: 'tr',
    label: 'Türkçe',
    flag: '🇹🇷',
    description: 'Türkiye Türkçesi',
  },
  {
    code: 'en',
    label: 'English',
    flag: '🇬🇧',
    description: 'English (US)',
  },
];

export default function LanguageSelectionScreen({ navigation }: LanguageSelectionScreenProps) {
  const { currentTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

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
    languageList: {
      gap: 16,
    },
    languageCard: {
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    languageCardInner: {
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    languageFlag: {
      fontSize: 48,
      marginRight: 20,
    },
    languageInfo: {
      flex: 1,
    },
    languageLabel: {
      fontSize: 20,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    languageDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    checkIcon: {
      marginLeft: 12,
    },
  });

  const handleLanguageSelect = async (langCode: string) => {
    setLanguage(langCode as 'tr' | 'en');
    await AsyncStorage.setItem('language', langCode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Kısa bir gecikme sonra geri dön
    setTimeout(() => {
      navigation.goBack();
    }, 300);
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
        <Text style={dynamicStyles.headerTitle}>Dil Seçimi</Text>
      </View>

      {/* Content */}
      <ScrollView 
        style={dynamicStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={dynamicStyles.title}>🌐 Dil Seç</Text>
        <Text style={dynamicStyles.subtitle}>
          Uygulamanın dilini değiştirin
        </Text>

        <View style={dynamicStyles.infoCard}>
          <Text style={dynamicStyles.infoText}>
            💡 İpucu: Seçtiğiniz dil tüm uygulamada anında uygulanır. 
            Dil değişikliği sonrası uygulama yeniden yüklenir.
          </Text>
        </View>

        <View style={dynamicStyles.languageList}>
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={dynamicStyles.languageCard}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    isSelected
                      ? [currentTheme.colors.primary + '30', currentTheme.colors.primary + '10']
                      : [currentTheme.colors.card, currentTheme.colors.card]
                  }
                  style={dynamicStyles.languageCardInner}
                >
                  <Text style={dynamicStyles.languageFlag}>
                    {lang.flag}
                  </Text>
                  <View style={dynamicStyles.languageInfo}>
                    <Text style={dynamicStyles.languageLabel}>
                      {lang.label}
                    </Text>
                    <Text style={dynamicStyles.languageDescription}>
                      {lang.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={dynamicStyles.checkIcon}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={32} 
                        color={currentTheme.colors.primary} 
                      />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

