import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface WriteDiaryStep1ScreenProps {
  navigation: any;
  route: any;
}

export default function WriteDiaryStep1Screen({ navigation, route }: WriteDiaryStep1ScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [mood, setMood] = useState<number | null>(null);

  const moodOptions = [
    { emoji: '😔', label: t('welcome') === 'Welcome' ? 'Sad' : 'Üzgün', value: 1 },
    { emoji: '😐', label: t('welcome') === 'Welcome' ? 'Normal' : 'Normal', value: 2 },
    { emoji: '🫠', label: t('welcome') === 'Welcome' ? 'Tired' : 'Yorgun', value: 3 },
    { emoji: '😎', label: t('welcome') === 'Welcome' ? 'Happy' : 'Mutlu', value: 4 },
    { emoji: '🤩', label: t('welcome') === 'Welcome' ? 'Amazing' : 'Harika', value: 5 },
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    backButton: {
      padding: 8,
    },
    nextButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    nextButtonText: {
      color: currentTheme.colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    titleInput: {
      backgroundColor: 'transparent',
      borderBottomWidth: 2,
      borderBottomColor: currentTheme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 0,
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    moodSection: {
      marginBottom: 32,
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    moodOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.card,
      padding: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      flex: 1,
      minWidth: '45%',
    },
    selectedMoodOption: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.accent,
    },
    moodEmoji: {
      fontSize: 20,
      marginRight: 8,
    },
    moodLabel: {
      fontSize: 14,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    selectedMoodLabel: {
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    progressBar: {
      flex: 1,
      height: 4,
      backgroundColor: currentTheme.colors.border,
      borderRadius: 2,
      marginRight: 12,
    },
    progressFill: {
      height: '100%',
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 2,
      width: '33%',
    },
    progressText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
  });

  const handleNext = () => {
    if (!title.trim() || mood === null) {
      return;
    }
    
    navigation.navigate('WriteDiaryStep2', {
      title: title.trim(),
      mood: mood,
    });
  };

  return (
    <KeyboardAvoidingView 
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{t('welcome') === 'Welcome' ? 'New Diary' : 'Yeni Günlük'}</Text>
        <TouchableOpacity
          style={[dynamicStyles.nextButton, (!title.trim() || mood === null) && { opacity: 0.5 }]}
          onPress={handleNext}
          disabled={!title.trim() || mood === null}
        >
          <Text style={dynamicStyles.nextButtonText}>{t('welcome') === 'Welcome' ? 'Next' : 'İleri'}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={dynamicStyles.content}>
        {/* Progress */}
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.progressBar}>
            <View style={dynamicStyles.progressFill} />
          </View>
          <Text style={dynamicStyles.progressText}>1/3</Text>
        </View>

        <Text style={dynamicStyles.title}>{t('welcome') === 'Welcome' ? 'Basic Information' : 'Temel Bilgiler'}</Text>
        <Text style={dynamicStyles.subtitle}>
          {t('welcome') === 'Welcome' ? 'Choose a title for your diary and today\'s mood' : 'Günlüğün için başlık ve bugünkü ruh halini seç'}
        </Text>

        {/* Title Input */}
        <View style={dynamicStyles.inputContainer}>
          <Text style={dynamicStyles.label}>{t('welcome') === 'Welcome' ? 'Title' : 'Başlık'}</Text>
          <TextInput
            style={dynamicStyles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder={t('welcome') === 'Welcome' ? 'How was your day?' : 'Bugün nasıl geçti?'}
            placeholderTextColor={currentTheme.colors.muted}
          />
        </View>

        {/* Mood Selection */}
        <View style={dynamicStyles.moodSection}>
          <Text style={dynamicStyles.label}>{t('welcome') === 'Welcome' ? 'Today\'s mood' : 'Bugünkü mood\'un'}</Text>
          <View style={dynamicStyles.moodGrid}>
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  dynamicStyles.moodOption,
                  mood === option.value && dynamicStyles.selectedMoodOption,
                ]}
                onPress={() => setMood(option.value)}
              >
                <Text style={dynamicStyles.moodEmoji}>{option.emoji}</Text>
                <Text style={[
                  dynamicStyles.moodLabel,
                  mood === option.value && dynamicStyles.selectedMoodLabel,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
