import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supportedLanguages } from '../services/languageService';

interface LanguageSelectionScreenProps {
  navigation: any;
}

export default function LanguageSelectionScreen({ navigation }: LanguageSelectionScreenProps) {
  const { currentTheme } = useTheme();
  const { t, setCurrentLanguage, currentLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    await setCurrentLanguage(languageCode);
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
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border + '30',
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      marginBottom: 40,
      textAlign: 'center',
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
    languageItemSelected: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.primary + '10',
    },
    languageFlag: {
      fontSize: 24,
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
    selectedIcon: {
      marginLeft: 12,
    },
    continueButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 24,
      alignItems: 'center',
      marginBottom: 20,
    },
    continueButtonText: {
      color: currentTheme.colors.background,
      fontSize: 18,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={currentTheme.name === 'luxury' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity 
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={currentTheme.colors.text} 
          />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{t('languageSettings')}</Text>
      </View>

      {/* Content */}
      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        <Text style={dynamicStyles.title}>
          {currentLanguage === 'tr' ? 'Dil Seçimi' : 'Language Selection'}
        </Text>
        <Text style={dynamicStyles.subtitle}>
          {currentLanguage === 'tr' 
            ? 'Uygulamanın dilini seçin. Bu ayar daha sonra değiştirilebilir.'
            : 'Choose your app language. This setting can be changed later.'
          }
        </Text>

        {/* Language List */}
        <View style={dynamicStyles.languageList}>
          {supportedLanguages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                dynamicStyles.languageItem,
                selectedLanguage === language.code && dynamicStyles.languageItemSelected
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <Text style={dynamicStyles.languageFlag}>{language.flag}</Text>
              <View style={dynamicStyles.languageInfo}>
                <Text style={dynamicStyles.languageName}>{language.name}</Text>
                <Text style={dynamicStyles.languageNativeName}>{language.nativeName}</Text>
              </View>
              {selectedLanguage === language.code && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={currentTheme.colors.primary}
                  style={dynamicStyles.selectedIcon}
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
            {currentLanguage === 'tr' ? 'Devam Et' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}