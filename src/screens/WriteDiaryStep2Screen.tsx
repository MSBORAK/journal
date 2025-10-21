import React, { useState } from 'react';
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
    title: t('welcome') === 'Welcome' ? '✨ What moment made you smile today?' : '✨ Bugün seni gülümseten an neydi?',
    placeholder: t('welcome') === 'Welcome' ? 'Tell about that special moment that warmed your heart today...' : 'Bugün kalbini ısıtan o özel anı anlat...',
    icon: '😊',
  },
  {
    id: 'gratitude',
    title: t('welcome') === 'Welcome' ? '🌟 What 3 things are you grateful for today?' : '🌟 Bugün için şükrettiğin 3 şey?',
    placeholder: t('welcome') === 'Welcome' ? 'Remember and write about the beauties in your life...' : 'Hayatındaki güzellikleri hatırla ve yaz...',
    icon: '🙏',
  },
  {
    id: 'accomplishment',
    title: t('welcome') === 'Welcome' ? '🎉 What achievement are you proud of today?' : '🎉 Bugün gurur duyduğun başarın ne?',
    placeholder: t('welcome') === 'Welcome' ? 'Even if small, celebrate yourself! What did you do?' : 'Küçük de olsa, kendini kutla! Ne yaptın?',
    icon: '🎯',
  },
  {
    id: 'lesson',
    title: t('welcome') === 'Welcome' ? '💎 What beautiful thing did you discover today?' : '💎 Bugün keşfettiğin güzel bir şey?',
    placeholder: t('welcome') === 'Welcome' ? 'What did you learn that excited you?' : 'Yeni öğrendiğin, seni heyecanlandıran neydi?',
    icon: '💡',
  },
  {
    id: 'communication',
    title: t('welcome') === 'Welcome' ? '💝 Who did you spend quality time with today?' : '💝 Bugün kimle güzel vakit geçirdin?',
    placeholder: t('welcome') === 'Welcome' ? 'Write about the loving moments you shared today...' : 'Bugün paylaştığın sevgi dolu anları yaz...',
    icon: '👥',
  },
  {
    id: 'energy',
    title: t('welcome') === 'Welcome' ? '⚡ What made you feel alive today?' : '⚡ Bugün seni canlı hissettiren şey?',
    placeholder: t('welcome') === 'Welcome' ? 'Moments that gave you strength and energy...' : 'Sana güç veren, canlandıran anlar...',
    icon: '🔋',
  },
  {
    id: 'growth',
    title: t('welcome') === 'Welcome' ? '🌱 What gift did you give yourself today?' : '🌱 Bugün kendine verdiğin hediye ne?',
    placeholder: t('welcome') === 'Welcome' ? 'How did you value yourself today?' : 'Kendine nasıl değer verdin bugün?',
    icon: '🌸',
  },
  {
    id: 'emotion',
    title: t('welcome') === 'Welcome' ? '🎨 What added color to your life today?' : '🎨 Bugün hayatına renk katan şey ne?',
    placeholder: t('welcome') === 'Welcome' ? 'Share the colorful moments that made you happy...' : 'Seni mutlu eden renkli anları paylaş...',
    icon: '🌈',
  },
  {
    id: 'tomorrow',
    title: t('welcome') === 'Welcome' ? '🚀 What are you excited about for tomorrow?' : '🚀 Yarın için heyecanlandığın şey?',
    placeholder: t('welcome') === 'Welcome' ? 'A reason to look forward to tomorrow with hope...' : 'Yarına umutla bakmak için bir neden...',
    icon: '✨',
  },
  {
    id: 'challenge',
    title: t('welcome') === 'Welcome' ? '💪 When did you feel strong today?' : '💪 Bugün kendini güçlü hissettiğin an?',
    placeholder: t('welcome') === 'Welcome' ? 'When did you say "I can do it" today?' : 'Bugün ne zaman "ben yapabilirim" dedin?',
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

  const handleAnswerChange = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text,
    }));
  };

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
        <Text style={dynamicStyles.headerTitle}>Yeni Günlük</Text>
        <TouchableOpacity
          style={dynamicStyles.nextButton}
          onPress={handleNext}
        >
          <Text style={dynamicStyles.nextButtonText}>İleri</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={dynamicStyles.content}>
        {/* Progress */}
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.progressBar}>
            <View style={dynamicStyles.progressFill} />
          </View>
          <Text style={dynamicStyles.progressText}>2/3</Text>
        </View>

        <Text style={dynamicStyles.title}>{t('welcome') === 'Welcome' ? 'Tell About Your Day' : 'Bugününü Anlat'}</Text>
        <Text style={dynamicStyles.subtitle}>
          {t('welcome') === 'Welcome' ? 'You can answer guide questions or write freely' : 'Rehber soruları cevaplayabilir veya serbestçe yazabilirsin'}
        </Text>

        <TouchableOpacity style={dynamicStyles.skipButton} onPress={handleSkip}>
          <Text style={dynamicStyles.skipButtonText}>{t('welcome') === 'Welcome' ? 'Skip Questions' : 'Soruları Atla'}</Text>
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
            />
          </View>
        ))}

        {/* Serbest Yazma Bölümü */}
        <View style={dynamicStyles.questionContainer}>
          <View style={dynamicStyles.questionHeader}>
            <Text style={dynamicStyles.questionIcon}>📝</Text>
            <Text style={dynamicStyles.questionTitle}>{t('welcome') === 'Welcome' ? 'Free Writing' : 'Serbest Yazma'}</Text>
          </View>
          <Text style={dynamicStyles.freeWritingDescription}>
            {t('welcome') === 'Welcome' ? 'If you want, you can also write your own thoughts and feelings here...' : 'İstersen buraya da kendi düşüncelerini, hislerini yazabilirsin...'}
          </Text>
          <TextInput
            style={[dynamicStyles.answerInput, { minHeight: 150 }]}
            value={freeWriting}
            onChangeText={setFreeWriting}
            placeholder={t('welcome') === 'Welcome' ? 'What did you experience today? How did you feel? What are you thinking? You can write everything here...' : 'Bugün neler yaşadın? Nasıl hissettin? Ne düşünüyorsun? Buraya her şeyi yazabilirsin...'}
            placeholderTextColor={currentTheme.colors.muted}
            multiline
            autoCorrect={false}
            autoCapitalize="sentences"
            textContentType="none"
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
