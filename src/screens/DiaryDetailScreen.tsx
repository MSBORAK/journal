import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryEntry } from '../types';
import { useGuidedQuestions, QUESTION_ORDER } from '../constants/diaryQuestions';

const { width } = Dimensions.get('window');

interface DiaryDetailScreenProps {
  navigation: any;
  route: {
    params: {
      entry: DiaryEntry;
    };
  };
}

export default function DiaryDetailScreen({ navigation, route }: DiaryDetailScreenProps) {
  const { currentTheme } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
  const { entry } = route.params;
  const [questionsExpanded, setQuestionsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const loadPref = async () => {
      try {
        const val = await AsyncStorage.getItem('diaryDetail_questionsExpanded');
        if (val !== null) setQuestionsExpanded(val === 'true');
      } catch {}
    };
    loadPref();
  }, []);

  const toggleQuestions = async () => {
    const next = !questionsExpanded;
    setQuestionsExpanded(next);
    try { await AsyncStorage.setItem('diaryDetail_questionsExpanded', next ? 'true' : 'false'); } catch {}
  };

  const guidedQuestions = useGuidedQuestions();

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
      backgroundColor: currentTheme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    entryCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginVertical: 20,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    entryTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: currentTheme.colors.text,
      flex: 1,
      marginRight: 16,
    },
    moodContainer: {
      backgroundColor: currentTheme.colors.primary + '15',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    moodEmoji: {
      fontSize: 24,
    },
    entryDate: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 16,
    },
    entryContent: {
      fontSize: 16,
      color: currentTheme.colors.text,
      lineHeight: 24,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    questionsContainer: {
      marginTop: 20,
    },
    questionCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: currentTheme.colors.primary,
    },
    questionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.primary,
      marginBottom: 8,
    },
    questionAnswer: {
      fontSize: 15,
      color: currentTheme.colors.text,
      lineHeight: 22,
    },
    freeWritingCard: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
      borderLeftWidth: 4,
      borderLeftColor: currentTheme.colors.accent,
    },
    freeWritingLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.accent,
      marginBottom: 8,
    },
    freeWritingContent: {
      fontSize: 15,
      color: currentTheme.colors.text,
      lineHeight: 22,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 16,
    },
    tag: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      fontSize: 12,
      color: currentTheme.colors.background,
      fontWeight: '500',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
      opacity: 0.5,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  const getMoodEmoji = (mood: number) => {
    const moodOptions = ['😢', '😔', '😐', '😊', '😄'];
    return moodOptions[mood - 1] || '😐';
  };

  const answeredQuestions = entry.answers ? Object.entries(entry.answers).filter(([_, answer]) => answer && answer.trim() !== '') : [];
  const freeWritingText = (entry.freeWriting || '').trim();
  const isPlaceholderFreeWriting = ['şuan yok', 'yok', 'none', 'no', 'not available', '-', '—', '--']
    .includes(freeWritingText.toLowerCase());
  const isFreeWritingDuplicatedInContent = freeWritingText.length > 0 && (entry.content || '').toLowerCase().includes(freeWritingText.toLowerCase());
  const shouldShowFreeWriting = freeWritingText.length > 0 && !isPlaceholderFreeWriting && !isFreeWritingDuplicatedInContent;

  const aqLabelRaw = t('diary.answeredQuestions');
  const aqLabel = aqLabelRaw && aqLabelRaw.includes('.') ? (currentLanguage === 'tr' ? 'Cevaplanan Sorular' : 'Answered Questions') : aqLabelRaw;
  const contentText = (entry.content || '').trim();
  const colonLineCount = contentText.split('\n').filter(l => l.includes(':')).length;
  const looksLikeGuidedSummary = colonLineCount >= 3; // e.g., multiple "Label: answer" lines
  const shouldShowEntryContent = (answeredQuestions.length === 0) && !looksLikeGuidedSummary;
  
  // Debug log
  console.log('DiaryDetailScreen Debug:');
  console.log('entry.answers:', entry.answers);
  console.log('answeredQuestions:', answeredQuestions);
  console.log('entry.freeWriting:', entry.freeWriting);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={currentTheme.colors.primary} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{t('diary.diaryDetail')}</Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Main Entry Card */}
        <View style={dynamicStyles.entryCard}>
          <View style={dynamicStyles.entryHeader}>
            <Text style={dynamicStyles.entryTitle}>{entry.title}</Text>
            <View style={dynamicStyles.moodContainer}>
              <Text style={dynamicStyles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
            </View>
          </View>
          
          <Text style={dynamicStyles.entryDate}>
            {new Date(entry.date).toLocaleDateString(locale, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          
          {shouldShowEntryContent && (
            <Text style={dynamicStyles.entryContent}>{entry.content}</Text>
          )}
          
          {entry.tags && entry.tags.length > 0 && (
            <View style={dynamicStyles.tagsContainer}>
              {entry.tags.map((tag, index) => (
                <View key={index} style={dynamicStyles.tag}>
                  <Text style={dynamicStyles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Answered Questions */}
        {answeredQuestions.length > 0 && (
          <View style={dynamicStyles.questionsContainer}>
            <TouchableOpacity onPress={toggleQuestions} activeOpacity={0.8} style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
              <Text style={dynamicStyles.sectionTitle}>📝 {aqLabel} ({answeredQuestions.length})</Text>
              <Ionicons name={questionsExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={currentTheme.colors.secondary} />
            </TouchableOpacity>
            {questionsExpanded && QUESTION_ORDER.filter(id => answeredQuestions.some(([q]) => q === id)).map((questionId) => {
              const answer = answeredQuestions.find(([q]) => q === questionId)?.[1] as string;
              const question = guidedQuestions.find(q => q.id === questionId);
              return (
                <View key={questionId} style={dynamicStyles.questionCard}>
                  <Text style={dynamicStyles.questionLabel}>{question?.title}</Text>
                  <Text style={dynamicStyles.questionAnswer}>{answer}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Free Writing */}
        {shouldShowFreeWriting && (
          <View style={dynamicStyles.freeWritingCard}>
            <Text style={dynamicStyles.freeWritingLabel}>✍️ {t('diary.freeWriting')}</Text>
            <Text style={dynamicStyles.freeWritingContent}>{freeWritingText}</Text>
          </View>
        )}

        {/* Empty State for No Questions */}
        {answeredQuestions.length === 0 && !entry.freeWriting && (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyIcon}>📝</Text>
            <Text style={dynamicStyles.emptyTitle}>{t('diary.questionNotAnswered')}</Text>
            <Text style={dynamicStyles.emptyMessage}>
              {t('diary.noQuestionsAnswered')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
