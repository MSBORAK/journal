import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
// import { useFont } from '../contexts/FontContext'; // Kaldırıldı
import { CustomAlert } from '../components/CustomAlert';
import { useDiary } from '../hooks/useDiary';
// import { View } from 'moti'; // Removed for now
import { Ionicons } from '@expo/vector-icons';
import { DiaryEntry, Doodle, DrawingTool } from '../types';

interface WriteDiaryScreenProps {
  navigation: any;
  route: any;
}

export default function WriteDiaryScreen({ navigation, route }: WriteDiaryScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  // const { fontConfig } = useFont(); // Kaldırıldı
  const { addEntry, updateEntry } = useDiary(user?.uid);

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
  
  const existingEntry = route.params?.entry as DiaryEntry | undefined;
  const isEditing = !!existingEntry;

  const [title, setTitle] = useState(existingEntry?.title || '');
  const [content, setContent] = useState(existingEntry?.content || '');
  const [mood, setMood] = useState(existingEntry?.mood || 3);
  const [tags, setTags] = useState(existingEntry?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>({
    name: 'pen',
    icon: '✏️',
    color: currentTheme.colors.text,
    strokeWidth: 3
  });
  
  // Custom Alert States
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'warning' | 'error' | 'info',
    primaryButton: null as any,
    secondaryButton: null as any,
  });

  const moodOptions = [
    { emoji: '😔', label: 'Üzgün', value: 1 },
    { emoji: '😐', label: 'Normal', value: 2 },
    { emoji: '🫠', label: 'Yorgun', value: 3 },
    { emoji: '😎', label: 'Mutlu', value: 4 },
    { emoji: '🤩', label: 'Harika', value: 5 },
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const drawingTools: DrawingTool[] = [
    { name: 'pen', icon: '✏️', color: '#000000', strokeWidth: 3 },
    { name: 'marker', icon: '🖊️', color: '#ef4444', strokeWidth: 5 },
    { name: 'highlighter', icon: '🖍️', color: '#fbbf24', strokeWidth: 8 },
    { name: 'brush', icon: '🖌️', color: '#3b82f6', strokeWidth: 6 },
  ];

  const addDoodle = (doodleData: string) => {
    const newDoodle: Doodle = {
      id: Date.now().toString(),
      data: doodleData,
      color: selectedTool.color,
      strokeWidth: selectedTool.strokeWidth,
      timestamp: new Date().toISOString()
    };
    setDoodles([...doodles, newDoodle]);
  };

  const clearDoodles = () => {
    setDoodles([]);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showAlert(
        '⚠️ Eksik Bilgi',
        'Lütfen başlık ve içerik girin. Günlük yazmak için her ikisi de gerekli.',
        'warning',
        {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        }
      );
      return;
    }

    if (!user) {
      showAlert(
        '❌ Hata',
        'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.',
        'error',
        {
          text: 'Tamam',
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        }
      );
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        title: title.trim(),
        content: content.trim(),
        mood,
        tags,
        date: existingEntry?.date || new Date().toISOString().split('T')[0],
      };

      if (isEditing && existingEntry) {
        await updateEntry(existingEntry.id, entryData);
      } else {
        await addEntry(entryData);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 2000);
    } catch (error) {
      showAlert(
        '❌ Kaydetme Hatası',
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

  useEffect(() => {
    navigation.setOptions({
      title: isEditing 
        ? (t('welcome') === 'Welcome' ? 'Edit Diary' : 'Günlüğü Düzenle')
        : (t('welcome') === 'Welcome' ? 'New Diary' : 'Yeni Günlük'),
      headerRight: () => (
        <TouchableOpacity 
          style={dynamicStyles.saveButton} 
          onPress={handleSave} 
          disabled={loading}
        >
          <Text style={dynamicStyles.saveButtonText}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [title, content, mood, tags, loading, isEditing]);

  const selectedMood = moodOptions.find(m => m.value === mood);

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
    saveButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      color: currentTheme.colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    titleInput: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    contentInput: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: currentTheme.colors.text,
      textAlignVertical: 'top',
      minHeight: 200,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      fontWeight: '400',
    },
    moodSection: {
      marginBottom: 20,
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
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
    tagsSection: {
      marginBottom: 20,
    },
    tagsInput: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: currentTheme.colors.text,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    tagsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
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
      color: currentTheme.colors.background,
      fontSize: 14,
      fontWeight: '500',
      marginRight: 4,
      textAlign: 'center',
      lineHeight: 18,
    },
    tagRemove: {
      marginLeft: 4,
    },
    drawingSection: {
      marginBottom: 20,
    },
    drawingTools: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    drawingTool: {
      backgroundColor: currentTheme.colors.card,
      padding: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      alignItems: 'center',
      minWidth: 60,
    },
    selectedDrawingTool: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.accent,
    },
    toolIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    toolName: {
      fontSize: 12,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    selectedToolName: {
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    canvas: {
      backgroundColor: currentTheme.colors.card,
      height: 200,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    canvasText: {
      color: currentTheme.colors.secondary,
      fontSize: 16,
      textAlign: 'center',
    },
    doodlePreview: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    doodleItem: {
      backgroundColor: currentTheme.colors.card,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    doodleText: {
      fontSize: 12,
      color: currentTheme.colors.text,
    },
    drawingActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      backgroundColor: currentTheme.colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
    },
    actionButtonText: {
      color: currentTheme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    clearButton: {
      backgroundColor: '#ef4444',
    },
    clearButtonText: {
      color: currentTheme.colors.background,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {showSuccess && (
        <View
          style={styles.successOverlay}
        >
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>💫</Text>
            <Text style={styles.successText}>Harikasın!</Text>
            <Text style={styles.successSubtext}>Günlüğünü kaydettin!</Text>
          </View>
        </View>
      )}

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        <View
        >
          {/* Title Input */}
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Başlık</Text>
            <TextInput
              style={dynamicStyles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Bugün nasıl geçti?"
              multiline={false}
              scrollEnabled={false}
              autoCorrect={false}
              autoCapitalize="sentences"
              placeholderTextColor="#9ca3af"
              returnKeyType="next"
              blurOnSubmit={false}
              textContentType="none"
              autoComplete="off"
            />
          </View>

          {/* Mood Selection */}
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Bugünkü mood'un</Text>
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
                    styles.moodLabel,
                    mood === option.value && dynamicStyles.selectedMoodOption,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedMood && (
              <View
                style={dynamicStyles.selectedMoodOption}
              >
                <Text style={dynamicStyles.moodEmoji}>{selectedMood.emoji}</Text>
                <Text style={dynamicStyles.moodLabel}>{selectedMood.label}</Text>
              </View>
            )}
          </View>

          {/* Content Input */}
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>
              {t('welcome') === 'Welcome' ? 'Diary Content' : 'Günlük İçeriği'}
            </Text>
            <TextInput
              style={dynamicStyles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Bugün neler yaşadın? Nasıl hissettin? Ne öğrendin?"
              multiline={true}
              scrollEnabled={true}
              autoCorrect={true}
              autoCapitalize="sentences"
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
              returnKeyType="default"
              blurOnSubmit={false}
              textContentType="none"
              autoComplete="off"
              enablesReturnKeyAutomatically={false}
            />
          </View>

          {/* Drawing Section */}
          <View style={dynamicStyles.inputContainer}>
            <View style={styles.drawingHeader}>
              <Text style={dynamicStyles.label}>Çizim/Doodle</Text>
              <TouchableOpacity 
                style={styles.drawingToggle}
                onPress={() => setShowDrawing(!showDrawing)}
              >
                <Ionicons 
                  name={showDrawing ? "eye-off-outline" : "create-outline"} 
                  size={20} 
                  color="#a855f7" 
                />
                <Text style={styles.drawingToggleText}>
                  {showDrawing ? 'Gizle' : 'Çiz'}
                </Text>
              </TouchableOpacity>
            </View>

            {showDrawing && (
              <View style={styles.drawingContainer}>
                {/* Drawing Tools */}
                <View style={styles.toolsContainer}>
                  {drawingTools.map((tool) => (
                    <TouchableOpacity
                      key={tool.name}
                      style={[
                        styles.toolButton,
                        selectedTool.name === tool.name && styles.selectedToolButton
                      ]}
                      onPress={() => setSelectedTool(tool)}
                    >
                      <Text style={styles.toolIcon}>{tool.icon}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearDoodles}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                {/* Drawing Canvas Placeholder */}
                <View style={styles.canvasContainer}>
                  <Text style={styles.canvasPlaceholder}>
                    🎨 Çizim alanı
                  </Text>
                  <Text style={styles.canvasHint}>
                    {selectedTool.icon} {selectedTool.name} seçildi
                  </Text>
                  {doodles.length > 0 && (
                    <Text style={styles.doodleCount}>
                      {doodles.length} çizim eklendi
                    </Text>
                  )}
                </View>

                {/* Doodle Preview */}
                {doodles.length > 0 && (
                  <View style={styles.doodlePreview}>
                    <Text style={styles.doodlePreviewTitle}>Çizimler:</Text>
                    <View style={styles.doodleList}>
                      {doodles.map((doodle) => (
                        <View key={doodle.id} style={styles.doodleItem}>
                          <View 
                            style={[
                              styles.doodleDot, 
                              { backgroundColor: doodle.color }
                            ]} 
                          />
                          <Text style={styles.doodleInfo}>
                            {new Date(doodle.timestamp).toLocaleTimeString('tr-TR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Tags */}
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Etiketler</Text>
            
            {/* Tag Input */}
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Etiket ekle (örn: iş, aile, spor)"
                placeholderTextColor="#9ca3af"
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Ionicons name="add" size={20} color={currentTheme.colors.background} />
              </TouchableOpacity>
            </View>

            {/* Tags List */}
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View
                    key={tag}
                    style={styles.tag}
                  >
                    <Text style={styles.tagText}>#{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Ionicons name="close" size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Date Display */}
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Tarih</Text>
            <Text style={styles.dateText}>
              {new Date(existingEntry?.date || new Date()).toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 20,
    marginBottom: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  contentInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodOption: {
    flex: 1,
    minWidth: 60,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  selectedMood: {
    borderColor: '#a855f7',
    backgroundColor: '#faf5ff',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedMoodLabel: {
    color: '#a855f7',
    fontWeight: '600',
  },
  selectedMoodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 8,
  },
  selectedMoodEmoji: {
    fontSize: 24,
  },
  selectedMoodText: {
    fontSize: 16,
    color: '#a855f7',
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  addTagButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    color: '#3730a3',
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 16,
    color: '#6b7280',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
  },
  saveButton: {
    color: '#a855f7',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: '#6b7280',
  },
  drawingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  drawingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#faf5ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  drawingToggleText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '500',
  },
  drawingContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 16,
  },
  toolsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  toolButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  selectedToolButton: {
    borderColor: '#a855f7',
    backgroundColor: '#faf5ff',
  },
  toolIcon: {
    fontSize: 20,
  },
  clearButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  canvasContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginBottom: 16,
    minHeight: 120,
  },
  canvasPlaceholder: {
    fontSize: 24,
    marginBottom: 8,
  },
  canvasHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  doodleCount: {
    fontSize: 12,
    color: '#a855f7',
    marginTop: 8,
  },
  doodlePreview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
  },
  doodlePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  doodleList: {
    gap: 8,
  },
  doodleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doodleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  doodleInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
});
