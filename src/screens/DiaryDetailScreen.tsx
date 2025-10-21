import React from 'react';
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
import { DiaryEntry } from '../types';

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
  const { t } = useLanguage();
  const { entry } = route.params;

  const questions = [
    { id: 'happiness', label: '✨ Bugün seni gülümseten an neydi?' },
    { id: 'gratitude', label: '🌟 Bugün için şükrettiğin 3 şey?' },
    { id: 'accomplishment', label: '🎉 Bugün gurur duyduğun başarın ne?' },
    { id: 'lesson', label: '💎 Bugün keşfettiğin güzel bir şey?' },
    { id: 'communication', label: '💝 Bugün kimle güzel vakit geçirdin?' },
    { id: 'energy', label: '⚡ Bugün seni canlı hissettiren şey?' },
    { id: 'growth', label: '🌱 Bugün kendine verdiğin hediye ne?' },
    { id: 'emotion', label: '🎨 Bugün hayatına renk katan şey ne?' },
    { id: 'tomorrow', label: '🚀 Yarın için heyecanlandığın şey?' },
    { id: 'challenge', label: '💪 Bugün kendini güçlü hissettiğin an?' },
  ];

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
      backgroundColor: currentTheme.colors.card,
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
        <Text style={dynamicStyles.headerTitle}>{t('welcome') === 'Welcome' ? 'Diary Detail' : 'Günlük Detayı'}</Text>
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
            {new Date(entry.date).toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          
          <Text style={dynamicStyles.entryContent}>{entry.content}</Text>
          
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
            <Text style={dynamicStyles.sectionTitle}>
              📝 Cevaplanan Sorular ({answeredQuestions.length})
            </Text>
            {answeredQuestions.map(([questionId, answer]) => {
              const question = questions.find(q => q.id === questionId);
              return (
                <View key={questionId} style={dynamicStyles.questionCard}>
                  <Text style={dynamicStyles.questionLabel}>{question?.label}</Text>
                  <Text style={dynamicStyles.questionAnswer}>{answer}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Free Writing */}
        {entry.freeWriting && entry.freeWriting.trim() !== '' && (
          <View style={dynamicStyles.freeWritingCard}>
            <Text style={dynamicStyles.freeWritingLabel}>✍️ Serbest Yazım</Text>
            <Text style={dynamicStyles.freeWritingContent}>{entry.freeWriting}</Text>
          </View>
        )}

        {/* Empty State for No Questions */}
        {answeredQuestions.length === 0 && !entry.freeWriting && (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyIcon}>📝</Text>
            <Text style={dynamicStyles.emptyTitle}>{t('welcome') === 'Welcome' ? 'Question Not Answered' : 'Soru Cevaplanmamış'}</Text>
            <Text style={dynamicStyles.emptyMessage}>
              {t('welcome') === 'Welcome' ? 'No questions were answered or free writing was done in this diary entry.' : 'Bu günlük girişinde herhangi bir soru cevaplanmamış veya serbest yazım yapılmamış.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
