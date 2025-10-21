import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDiary } from '../hooks/useDiary';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
// import { View } from 'moti'; // Removed for now
import { Ionicons } from '@expo/vector-icons';
import { DiaryEntry } from '../types';

interface HistoryScreenProps {
  navigation: any;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const { entries, loading, getEntriesByTag, getEntriesByMood } = useDiary(user?.uid);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const moodOptions = [
    { emoji: '😔', label: 'Üzgün', value: 1 },
    { emoji: '😐', label: 'Normal', value: 2 },
    { emoji: '🫠', label: 'Yorgun', value: 3 },
    { emoji: '😎', label: 'Mutlu', value: 4 },
    { emoji: '🤩', label: 'Harika', value: 5 },
  ];

  const getAllTags = () => {
    const allTags = entries.flatMap(entry => entry.tags);
    return Array.from(new Set(allTags));
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = selectedMood === null || entry.mood === selectedMood;
    const matchesTag = selectedTag === null || entry.tags.includes(selectedTag);
    
    return matchesSearch && matchesMood && matchesTag;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMood(null);
    setSelectedTag(null);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 80,
      paddingBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 20,
    },
    searchContainer: {
      marginBottom: 20,
    },
    searchInput: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: currentTheme.colors.text,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    filtersContainer: {
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    filterSection: {
      marginBottom: 16,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    moodFilterContainer: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    moodFilterButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.card,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedMoodFilterButton: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.accent,
    },
    moodFilterEmoji: {
      fontSize: 16,
    },
    moodFilterText: {
      fontSize: 12,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    selectedMoodFilterText: {
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    tagFilterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagFilterButton: {
      backgroundColor: currentTheme.colors.card,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedTagFilterButton: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    tagFilterText: {
      fontSize: 12,
      color: currentTheme.colors.text,
      fontWeight: '500',
      textAlign: 'center',
    },
    selectedTagFilterText: {
      color: currentTheme.colors.background,
    },
    resultsInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    resultsText: {
      fontSize: 14,
      color: currentTheme.colors.text,
      opacity: 0.85,
    },
    viewModeButton: {
      backgroundColor: currentTheme.colors.card,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    viewModeText: {
      fontSize: 14,
      color: currentTheme.colors.text,
    },
    entryCard: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 20,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
      transform: [{ translateY: -2 }],
    },
    entryCardGradient: {
      borderRadius: 20,
      padding: 20,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    entryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      flex: 1,
    },
    moodContainer: {
      marginLeft: 12,
    },
    moodEmoji: {
      fontSize: 24,
    },
    entryContent: {
      fontSize: 14,
      color: currentTheme.colors.text,
      opacity: 0.9,
      lineHeight: 20,
      marginBottom: 12,
    },
    entryMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    entryDate: {
      fontSize: 12,
      color: currentTheme.colors.text,
      opacity: 0.7,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    tag: {
      backgroundColor: currentTheme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tagText: {
      fontSize: 12,
      color: currentTheme.colors.background,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 16,
    },
    moreTags: {
      fontSize: 12,
      color: currentTheme.colors.text,
      opacity: 0.8,
      alignSelf: 'center',
    },
    entryMetaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    questionsCount: {
      backgroundColor: currentTheme.colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    questionsCountText: {
      fontSize: 11,
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: 16,
      color: currentTheme.colors.text,
      opacity: 0.8,
      textAlign: 'center',
      lineHeight: 24,
    },
    clearFiltersButton: {
      backgroundColor: currentTheme.colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'flex-start',
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    clearFiltersText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      fontWeight: '500',
      marginLeft: 4,
    },
    listContainer: {
      paddingBottom: 20,
    },
  });

  const renderEntry = ({ item }: { item: DiaryEntry }) => {
    const mood = moodOptions.find(m => m.value === item.mood);
    
    return (
      <View>
        <TouchableOpacity
          style={dynamicStyles.entryCard}
          onPress={() => navigation.navigate('DiaryDetail', { 
            entry: item
          })}
        >
          <LinearGradient
            colors={[
              currentTheme.colors.card,
              currentTheme.colors.card,
              currentTheme.name === 'dark' ? currentTheme.colors.accent + '15' : currentTheme.colors.accent + '08'
            ]}
            style={dynamicStyles.entryCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
          <View style={dynamicStyles.entryHeader}>
            <Text style={dynamicStyles.entryTitle}>{item.title}</Text>
            <View style={dynamicStyles.moodContainer}>
              <Text style={dynamicStyles.moodEmoji}>{mood?.emoji}</Text>
            </View>
          </View>
          
          <Text style={dynamicStyles.entryContent} numberOfLines={3}>
            {item.content}
          </Text>
          
          <View style={dynamicStyles.entryMeta}>
            <View style={dynamicStyles.entryMetaLeft}>
              <Text style={dynamicStyles.entryDate}>
                {new Date(item.date).toLocaleDateString('tr-TR')}
              </Text>
              {item.answers && (
                <View style={dynamicStyles.questionsCount}>
                  <Text style={dynamicStyles.questionsCountText}>
                    {Object.values(item.answers).filter(answer => answer && answer.trim() !== '').length} soru
                  </Text>
                </View>
              )}
            </View>
            
            {item.tags.length > 0 && (
              <View style={dynamicStyles.tagsContainer}>
                {item.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={dynamicStyles.tag}>
                    <Text style={dynamicStyles.tagText}>#{tag}</Text>
                  </View>
                ))}
                {item.tags.length > 3 && (
                  <Text style={dynamicStyles.moreTags}>+{item.tags.length - 3}</Text>
                )}
              </View>
            )}
          </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>
          {t('welcome') === 'Welcome' ? 'Past Diaries' : 'Geçmiş Günlükler'}
        </Text>
        
        {/* Search Bar */}
        <View style={dynamicStyles.searchContainer}>
          <TextInput
            style={dynamicStyles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Günlük ara..."
            placeholderTextColor={currentTheme.colors.muted}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={dynamicStyles.filtersContainer}>
        {/* Mood Filters */}
        <View style={dynamicStyles.filterSection}>
          <Text style={dynamicStyles.filterLabel}>Ruh Hali:</Text>
          <View style={dynamicStyles.moodFilterContainer}>
            <TouchableOpacity
              style={[
                dynamicStyles.tagFilterButton,
                selectedMood === null && dynamicStyles.selectedTagFilterButton,
              ]}
              onPress={() => setSelectedMood(null)}
            >
              <Text style={[
                dynamicStyles.tagFilterText,
                selectedMood === null && dynamicStyles.selectedTagFilterText,
              ]}>
                Tümü
              </Text>
            </TouchableOpacity>
            
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  dynamicStyles.moodFilterButton,
                  selectedMood === mood.value && dynamicStyles.selectedMoodFilterButton,
                ]}
                onPress={() => setSelectedMood(mood.value)}
              >
                <Text style={dynamicStyles.moodFilterEmoji}>
                  {mood.emoji}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tag Filters */}
        {getAllTags().length > 0 && (
          <View style={dynamicStyles.filterSection}>
            <Text style={dynamicStyles.filterLabel}>Etiketler:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={dynamicStyles.tagFilterContainer}>
                <TouchableOpacity
                  style={[
                    dynamicStyles.tagFilterButton,
                    selectedTag === null && dynamicStyles.selectedTagFilterButton,
                  ]}
                  onPress={() => setSelectedTag(null)}
                >
                  <Text style={[
                    dynamicStyles.tagFilterText,
                    selectedTag === null && dynamicStyles.selectedTagFilterText,
                  ]}>
                    Tümü
                  </Text>
                </TouchableOpacity>
                
                {getAllTags().map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      dynamicStyles.tagFilterButton,
                      selectedTag === tag && dynamicStyles.selectedTagFilterButton,
                    ]}
                    onPress={() => setSelectedTag(tag)}
                  >
                    <Text style={[
                      dynamicStyles.tagFilterText,
                      selectedTag === tag && dynamicStyles.selectedTagFilterText,
                    ]}>
                      #{tag.length > 12 ? `${tag.substring(0, 12)}...` : tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Clear Filters */}
        {(selectedMood !== null || selectedTag !== null || searchQuery.length > 0) && (
          <TouchableOpacity style={dynamicStyles.clearFiltersButton} onPress={clearFilters}>
            <Ionicons name="close" size={16} color={currentTheme.colors.primary} />
            <Text style={dynamicStyles.clearFiltersText}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      <View style={dynamicStyles.resultsInfo}>
        <Text style={dynamicStyles.resultsText}>
          {filteredEntries.length} günlük bulundu
        </Text>
      </View>

      {/* Entries List */}
      {loading ? (
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="hourglass-outline" size={64} color={currentTheme.colors.secondary} />
          <Text style={dynamicStyles.emptyTitle}>Yükleniyor...</Text>
          <Text style={dynamicStyles.emptyMessage}>
            Günlükleriniz getiriliyor
          </Text>
        </View>
      ) : filteredEntries.length === 0 ? (
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="book-outline" size={64} color={currentTheme.colors.secondary} />
          <Text style={dynamicStyles.emptyTitle}>Günlük bulunamadı</Text>
          <Text style={dynamicStyles.emptyMessage}>
            Arama kriterlerinizi değiştirmeyi deneyin
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={dynamicStyles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

