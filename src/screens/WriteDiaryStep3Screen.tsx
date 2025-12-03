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
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useDiary } from '../hooks/useDiary';
import { useAchievements } from '../hooks/useAchievements';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '../components/CustomAlert';
import { QUESTION_ORDER } from '../constants/diaryQuestions';
import { getButtonTextColor } from '../utils/colorUtils';

interface WriteDiaryStep3ScreenProps {
  navigation: any;
  route: any;
}

export default function WriteDiaryStep3Screen({ navigation, route }: WriteDiaryStep3ScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const { addEntry, entries, refetch } = useDiary(user?.uid);
  const { checkDiaryAchievements } = useAchievements(user?.uid);
  
  const { title, mood, answers, freeWriting } = route.params;

  const showAlert = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info', primaryButton?: any, secondaryButton?: any) => {
    setAlertConfig({
      title,
      message,
      type,
      primaryButton,
      secondaryButton,
    });
    setShowCustomAlert(true);
  };
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Custom Alert States
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    primaryButton: null as any,
    secondaryButton: null as any,
  });

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
    saveButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 24,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    saveButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 18,
      fontWeight: '700',
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
      width: '100%',
    },
    progressText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    tagsSection: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    tagInput: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: currentTheme.colors.text,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      marginBottom: 12,
    },
    tagsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tagText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 14,
      fontWeight: '500',
      marginRight: 4,
      textAlign: 'center',
      lineHeight: 18,
    },
    tagRemove: {
      marginLeft: 4,
    },
    summarySection: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    summaryItem: {
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginBottom: 4,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    summaryValue: {
      fontSize: 16,
      color: currentTheme.colors.text,
      fontWeight: '600',
    },
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const generateContent = () => {
    // Artık rehber soruların özetini metne eklemiyoruz.
    // Yalnızca serbest yazımı kaydediyoruz; sorular ayrı listede gösterilecek.
    const text = (freeWriting || '').trim();
    return text;
  };

  // Streak hesaplama fonksiyonu
  const getCurrentStreak = (allEntries: any[], currentDate: string): number => {
    if (allEntries.length === 0) return 1;
    
    const sortedEntries = [...allEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 1;
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - (i + 1));
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleSave = async () => {
    if (loading || isSaved) return;
    
    console.log('handleSave called');
    console.log('user:', user);
    console.log('user?.uid:', user?.uid);
    
    setLoading(true);
    
    try {
      const content = generateContent();
      console.log('Generated content:', content);
      
      const entry = {
        title: title.trim(),
        content: content || t('settings.defaultDiaryContent'),
        mood: mood,
        tags: tags,
        date: new Date().toISOString().split('T')[0],
        answers: answers,
        freeWriting: freeWriting,
      };
      
      console.log('Entry to save:', entry);
      const savedEntry = await addEntry(entry);
      console.log('Entry saved successfully:', savedEntry);
      
      // State'i güncellemek için refetch çağır
      if (refetch) {
        await refetch();
      }
      
      // addEntry state'i güncelledi, ama React state güncellemesi asenkron olduğu için
      // entries state'i henüz güncellenmemiş olabilir. Bu yüzden manuel olarak hesaplıyoruz.
      // Refetch sonrası entries güncellenmiş olmalı, ama yine de manuel hesaplama yapalım
      const allEntries = [savedEntry, ...entries];
      const totalEntries = allEntries.length;
      const currentStreak = getCurrentStreak(allEntries, entry.date);
      
      console.log('🔍 Checking achievements:', { 
        entriesLengthBefore: entries.length,
        entriesLengthAfter: allEntries.length,
        totalEntries, 
        currentStreak,
        entryDate: entry.date,
        savedEntryId: savedEntry.id,
        savedEntry: savedEntry,
        allEntries: allEntries.map(e => ({ id: e.id, date: e.date, title: e.title }))
      });
      
      // Başarıları kontrol et
      try {
        console.log('🚀 Calling checkDiaryAchievements with:', { 
          totalEntries, 
          currentStreak,
          entryCount: totalEntries,
          expectedFirstEntry: totalEntries >= 1 ? 'Should unlock first_entry' : 'Will NOT unlock first_entry'
        });
        const newAchievements = await checkDiaryAchievements(totalEntries, currentStreak);
        
        if (newAchievements && newAchievements.length > 0) {
          console.log('🎉 SUCCESS! New achievements unlocked:', newAchievements.length, newAchievements);
          console.log('Achievement IDs:', newAchievements.map(a => a.id));
        } else {
          console.log('⚠️ No new achievements unlocked. Current stats:', {
            totalDiaryEntries: totalEntries,
            currentStreak: currentStreak
          });
        }
      } catch (achievementError) {
        console.error('❌ Error checking achievements:', achievementError);
        console.error('Error stack:', achievementError instanceof Error ? achievementError.stack : 'No stack');
        // Başarı kontrolü hatası günlük kaydetmeyi engellemesin
      }
      
      setIsSaved(true);
      
      showAlert(
        '🎉 Başarılı!',
        'Günlüğün kaydedildi! Artık günlüklerin arasında görebilirsin.',
        'success',
        {
          text: '📖 Günlükleri Gör',
          onPress: () => {
            setShowCustomAlert(false);
            // Journal tab'ına git
            navigation.navigate('MainTabs', { screen: 'Journal' });
          },
          style: 'primary'
        }
      );
    } catch (error) {
      console.error('Error saving entry:', error);
      showAlert(
        t('common.error'),
        t('diary.diaryNotSaved'),
        'error',
        {
          text: t('common.ok'),
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        }
      );
    } finally {
      setLoading(false);
    }
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
        <Text style={dynamicStyles.headerTitle}>Yeni Günlük</Text>
        <TouchableOpacity
          style={[dynamicStyles.saveButton, loading && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={dynamicStyles.saveButtonText}>
            {loading ? t('mood.saving') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={dynamicStyles.content}>
        {/* Progress */}
        <View style={dynamicStyles.progressContainer}>
          <View style={dynamicStyles.progressBar}>
            <View style={dynamicStyles.progressFill} />
          </View>
          <Text style={dynamicStyles.progressText}>3/3</Text>
        </View>

        <Text style={dynamicStyles.title}>{t('mood.finalTouches')}</Text>
        <Text style={dynamicStyles.subtitle}>
          {t('mood.addTagsAndSave')}
        </Text>

        {/* Summary */}
        <View style={dynamicStyles.summarySection}>
          <Text style={dynamicStyles.summaryTitle}>{t('mood.diarySummary')}</Text>
          
          <View style={dynamicStyles.summaryItem}>
            <Text style={dynamicStyles.summaryLabel}>{t('mood.titleLabel')}</Text>
            <Text style={dynamicStyles.summaryValue}>{title}</Text>
          </View>
          
          <View style={dynamicStyles.summaryItem}>
            <Text style={dynamicStyles.summaryLabel}>Mood:</Text>
            <Text style={dynamicStyles.summaryValue}>
              {mood === 1 && t('mood.emojiSad')}
              {mood === 2 && t('mood.emojiNormal')}
              {mood === 3 && t('mood.emojiTired')}
              {mood === 4 && t('mood.emojiHappy')}
              {mood === 5 && t('mood.emojiAmazing')}
            </Text>
          </View>
          
          <View style={dynamicStyles.summaryItem}>
            <Text style={dynamicStyles.summaryLabel}>{t('mood.answeredQuestions')}</Text>
            <Text style={dynamicStyles.summaryValue}>
              {Object.entries(answers || {})
                .filter(([key, value]: any) => QUESTION_ORDER.includes(key as any) && value && String(value).trim().length > 0)
                .length}/{QUESTION_ORDER.length}
            </Text>
          </View>
          
          <View style={dynamicStyles.summaryItem}>
            <Text style={dynamicStyles.summaryLabel}>{t('mood.freeWriting')}</Text>
            <Text style={dynamicStyles.summaryValue}>
              {freeWriting ? `${freeWriting.length} ${t('mood.characters')}` : t('mood.none')}
            </Text>
          </View>
        </View>

        {/* Tags */}
        <View style={dynamicStyles.tagsSection}>
          <Text style={dynamicStyles.label}>{t('mood.tags')}</Text>
          <TextInput
            style={dynamicStyles.tagInput}
            value={newTag}
            onChangeText={setNewTag}
            placeholder={t('mood.addTag')}
            placeholderTextColor={currentTheme.colors.muted}
            onSubmitEditing={addTag}
            returnKeyType="done"
          />
          
          {tags.length > 0 && (
            <View style={dynamicStyles.tagsList}>
              {tags.map((tag, index) => (
                <View key={index} style={dynamicStyles.tag}>
                  <Text style={dynamicStyles.tagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Ionicons name="close" size={16} color={currentTheme.colors.background} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={showCustomAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        primaryButton={alertConfig.primaryButton}
        secondaryButton={alertConfig.secondaryButton}
        onClose={() => setShowCustomAlert(false)}
      />
    </KeyboardAvoidingView>
  );
}
