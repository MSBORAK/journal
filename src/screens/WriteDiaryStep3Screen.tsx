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
import { useDiary } from '../hooks/useDiary';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '../components/CustomAlert';

interface WriteDiaryStep3ScreenProps {
  navigation: any;
  route: any;
}

export default function WriteDiaryStep3Screen({ navigation, route }: WriteDiaryStep3ScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { addEntry } = useDiary(user?.uid);
  
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
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    saveButtonText: {
      color: 'white',
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
      width: '100%',
    },
    progressText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    tagsSection: {
      marginBottom: 24,
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
      color: 'white',
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
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    summaryItem: {
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 16,
      color: currentTheme.colors.text,
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
    const contentParts = [];
    
    // Rehber sorular cevapları
    if (answers.happiness) {
      contentParts.push(`Bugün beni en çok mutlu eden şey: ${answers.happiness}`);
    }
    
    if (answers.lesson) {
      contentParts.push(`Bugün öğrendiklerim: ${answers.lesson}`);
    }
    
    if (answers.communication) {
      contentParts.push(`İletişim deneyimim: ${answers.communication}`);
    }
    
    if (answers.challenge) {
      contentParts.push(`Karşılaştığım zorluklar: ${answers.challenge}`);
    }
    
    // Serbest yazma
    if (freeWriting) {
      if (contentParts.length > 0) {
        contentParts.push('\n---\n'); // Ayırıcı
      }
      contentParts.push(freeWriting);
    }
    
    return contentParts.join('\n\n');
  };

  const handleSave = async () => {
    if (loading) return;
    
    console.log('handleSave called');
    console.log('user:', user);
    console.log('user?.uid:', user?.uid);
    
    setLoading(true);
    
    try {
      const content = generateContent();
      console.log('Generated content:', content);
      
      const entry = {
        title: title.trim(),
        content: content || 'Bugün güzel bir gün geçirdim.',
        mood: mood,
        tags: tags,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      
      console.log('Entry to save:', entry);
      await addEntry(entry);
      console.log('Entry saved successfully');
      
      showAlert(
        '🎉 Başarılı!',
        'Günlüğün kaydedildi! Artık günlüklerin arasında görebilirsin.',
        'success',
        {
          text: '📖 Günlükleri Gör',
          onPress: () => {
            setShowCustomAlert(false);
            navigation.navigate('MainTabs', { screen: 'History' });
          },
          style: 'primary'
        }
      );
    } catch (error) {
      console.error('Error saving entry:', error);
      showAlert(
        '❌ Hata',
        'Günlük kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.',
        'error',
        {
          text: 'Tamam',
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
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
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

        <Text style={dynamicStyles.title}>Son Dokunuşlar</Text>
        <Text style={dynamicStyles.subtitle}>
          Etiketler ekle ve günlüğünü kaydet
        </Text>

        {/* Summary */}
        <View style={dynamicStyles.summarySection}>
          <Text style={dynamicStyles.summaryTitle}>Günlük Özeti</Text>
          
          <View style={dynamicStyles.summaryItem}>
            <Text style={dynamicStyles.summaryLabel}>Başlık:</Text>
            <Text style={dynamicStyles.summaryValue}>{title}</Text>
          </View>
          
          <View style={dynamicStyles.summaryItem}>
            <Text style={dynamicStyles.summaryLabel}>Mood:</Text>
            <Text style={dynamicStyles.summaryValue}>
              {mood === 1 && '😔 Üzgün'}
              {mood === 2 && '😐 Normal'}
              {mood === 3 && '🫠 Yorgun'}
              {mood === 4 && '😎 Mutlu'}
              {mood === 5 && '🤩 Harika'}
            </Text>
          </View>
          
          <View style={dynamicStyles.summaryItem}>
            <Text style={dynamicStyles.summaryLabel}>Cevaplanan Sorular:</Text>
            <Text style={dynamicStyles.summaryValue}>
              {Object.values(answers).filter((answer: any) => answer && answer.trim().length > 0).length}/4
            </Text>
          </View>
          
          <View style={dynamicStyles.summaryItem}>
            <Text style={dynamicStyles.summaryLabel}>Serbest Yazma:</Text>
            <Text style={dynamicStyles.summaryValue}>
              {freeWriting ? `${freeWriting.length} karakter` : 'Yok'}
            </Text>
          </View>
        </View>

        {/* Tags */}
        <View style={dynamicStyles.tagsSection}>
          <Text style={dynamicStyles.label}>Etiketler</Text>
          <TextInput
            style={dynamicStyles.tagInput}
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Etiket ekle (örn: #heyecan, #proje)"
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
                    <Ionicons name="close" size={16} color="white" />
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
