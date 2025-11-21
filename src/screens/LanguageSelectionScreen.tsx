import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supportedLanguages, Language } from '../services/languageService';
import { getButtonTextColor } from '../utils/colorUtils';

interface LanguageSelectionScreenProps {
  navigation: any;
}

const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t, setCurrentLanguage, currentLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Dil değiştiğinde bildirimleri de yeniden zamanla (senkronizasyon)
    await setCurrentLanguage(languageCode, user?.uid);
  };

  const handleContinue = () => {
    navigation.goBack();
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: currentTheme.colors.background,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginLeft: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      marginBottom: 40,
      lineHeight: 24,
    },
    languageList: {
      marginBottom: 40,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 12,
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedLanguageItem: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.primary + '10',
    },
    flag: {
      fontSize: 32,
      marginRight: 16,
    },
    languageInfo: {
      flex: 1,
    },
    languageName: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 4,
    },
    languageNativeName: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
    },
    checkIcon: {
      marginLeft: 12,
    },
    continueButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    continueButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 18,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8 }}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={currentTheme.colors.text} 
          />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>
          {t('settings.language')}
        </Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={{ marginBottom: 40 }}>
          <Text style={dynamicStyles.title}>
            {t('onboarding.selectLanguage')}
          </Text>
          <Text style={dynamicStyles.subtitle}>
            {t('onboarding.selectLanguageDescription')}
          </Text>
        </View>

        {/* Language List */}
        <View style={dynamicStyles.languageList}>
          {supportedLanguages.map((language: Language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                dynamicStyles.languageItem,
                selectedLanguage === language.code && dynamicStyles.selectedLanguageItem,
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <Text style={dynamicStyles.flag}>{language.flag}</Text>
              <View style={dynamicStyles.languageInfo}>
                <Text style={dynamicStyles.languageName}>
                  {language.name}
                </Text>
                <Text style={dynamicStyles.languageNativeName}>
                  {language.nativeName}
                </Text>
              </View>
              {selectedLanguage === language.code && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={currentTheme.colors.primary}
                  style={dynamicStyles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={dynamicStyles.continueButton}
          onPress={handleContinue}
        >
          <Text style={dynamicStyles.continueButtonText}>
            {t('common.done')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageSelectionScreen;