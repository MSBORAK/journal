import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface WriteDiaryStep2ScreenProps {
  navigation: any;
  route: any;
}

const questions = (t: any) => [
  {
    id: 'happiness',
    title: t('diary.guidedQuestions.happiness.title'),
    placeholder: t('diary.guidedQuestions.happiness.placeholder'),
    icon: '😊',
  },
  {
    id: 'gratitude',
    title: t('diary.guidedQuestions.gratitude.title'),
    placeholder: t('diary.guidedQuestions.gratitude.placeholder'),
    icon: '🙏',
  },
  {
    id: 'accomplishment',
    title: t('diary.guidedQuestions.accomplishment.title'),
    placeholder: t('diary.guidedQuestions.accomplishment.placeholder'),
    icon: '🎯',
  },
  {
    id: 'lesson',
    title: t('diary.guidedQuestions.lesson.title'),
    placeholder: t('diary.guidedQuestions.lesson.placeholder'),
    icon: '💡',
  },
  {
    id: 'communication',
    title: t('diary.guidedQuestions.communication.title'),
    placeholder: t('diary.guidedQuestions.communication.placeholder'),
    icon: '👥',
  },
  {
    id: 'energy',
    title: t('diary.guidedQuestions.energy.title'),
    placeholder: t('diary.guidedQuestions.energy.placeholder'),
    icon: '🔋',
  },
  {
    id: 'growth',
    title: t('diary.guidedQuestions.growth.title'),
    placeholder: t('diary.guidedQuestions.growth.placeholder'),
    icon: '🌸',
  },
  {
    id: 'emotion',
    title: t('diary.guidedQuestions.emotion.title'),
    placeholder: t('diary.guidedQuestions.emotion.placeholder'),
    icon: '🌈',
  },
  {
    id: 'tomorrow',
    title: t('diary.guidedQuestions.tomorrow.title'),
    placeholder: t('diary.guidedQuestions.tomorrow.placeholder'),
    icon: '✨',
  },
  {
    id: 'challenge',
    title: t('diary.guidedQuestions.challenge.title'),
    placeholder: t('diary.guidedQuestions.challenge.placeholder'),
    icon: '🏆',
  },
];

export default function WriteDiaryStep2Screen({ navigation, route }: WriteDiaryStep2ScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const { title, mood } = route.params;
  
  const [answers, setAnswers] = useState({
    happiness: '',
    lesson: '',
    communication: '',
    challenge: '',
  });
  const [freeWriting, setFreeWriting] = useState('');

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
      marginBottom: 32,
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
      width: '66%',
    },
    progressText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    questionContainer: {
      marginBottom: 32,
    },
    questionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    questionIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    questionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      flex: 1,
    },
    answerInput: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: currentTheme.colors.text,
      textAlignVertical: 'top',
      minHeight: 100,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    freeWritingDescription: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    skipButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 20,
      alignSelf: 'center',
      marginBottom: 24,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    skipButtonText: {
      color: currentTheme.colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const handleAnswerChange = useCallback((questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text,
    }));
  }, []);

  const handleNext = () => {
    navigation.navigate('WriteDiaryStep3', {
      title,
      mood,
      answers,
      freeWriting,
    });
  };

  const handleSkip = () => {
    navigation.navigate('WriteDiaryStep3', {
      title,
      mood,
      answers: {
        happiness: '',
        lesson: '',
        communication: '',
        challenge: '',
      },
      freeWriting: '',
    });
  };

  const answeredQuestions = Object.values(answers).filter(answer => answer.trim().length > 0).length;

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
        <Text style={dynamicStyles.headerTitle}>{t('diary.newDiaryTitle')}</Text>
        <TouchableOpacity
          style={dynamicStyles.nextButton}
          onPress={handleNext}
        >
          <Text style={dynamicStyles.nextButtonText}>{t('diary.forwardButton')}</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={dynamicStyles.content}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={true}
        keyboardDismissMode="interactive"
      >
        {/* Progress */}
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.progressBar}>
            <View style={dynamicStyles.progressFill} />
          </View>
          <Text style={dynamicStyles.progressText}>2/3</Text>
        </View>

        <Text style={dynamicStyles.title}>{t('diary.tellAboutYourDay')}</Text>
        <Text style={dynamicStyles.subtitle}>
          {t('diary.canAnswerOrWrite')}
        </Text>

        <TouchableOpacity style={dynamicStyles.skipButton} onPress={handleSkip}>
          <Text style={dynamicStyles.skipButtonText}>{t('diary.skipQuestions')}</Text>
        </TouchableOpacity>

        {questions(t).map((question) => (
          <View key={question.id} style={dynamicStyles.questionContainer}>
            <View style={dynamicStyles.questionHeader}>
              <Text style={dynamicStyles.questionIcon}>{question.icon}</Text>
              <Text style={dynamicStyles.questionTitle}>{question.title}</Text>
            </View>
            <TextInput
              style={dynamicStyles.answerInput}
              value={answers[question.id as keyof typeof answers]}
              onChangeText={(text) => handleAnswerChange(question.id, text)}
              placeholder={question.placeholder}
              placeholderTextColor={currentTheme.colors.muted}
              multiline
              autoCorrect={false}
              autoCapitalize="sentences"
              textContentType="none"
              autoComplete="off"
              returnKeyType="default"
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={false}
            />
          </View>
        ))}

        {/* Serbest Yazma Bölümü */}
        <View style={dynamicStyles.questionContainer}>
          <View style={dynamicStyles.questionHeader}>
            <Text style={dynamicStyles.questionIcon}>📝</Text>
            <Text style={dynamicStyles.questionTitle}>{t('diary.freeWriting')}</Text>
          </View>
          <Text style={dynamicStyles.freeWritingDescription}>
            {t('diary.freeWritingDescription')}
          </Text>
          <TextInput
            style={[dynamicStyles.answerInput, { minHeight: 150 }]}
            value={freeWriting}
            onChangeText={setFreeWriting}
            placeholder={t('diary.freeWritingPlaceholder')}
            placeholderTextColor={currentTheme.colors.muted}
            multiline
            autoCorrect={false}
            autoCapitalize="sentences"
            textContentType="none"
            autoComplete="off"
            returnKeyType="default"
            blurOnSubmit={false}
            enablesReturnKeyAutomatically={false}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
