import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useDiary } from '../hooks/useDiary';
import { Ionicons } from '@expo/vector-icons';
import { DiaryEntry } from '../types';
import { getButtonTextColor } from '../utils/colorUtils';

interface ArchiveScreenProps {
  navigation: any;
}

type ViewMode = 'calendar' | 'list';

const moodOptions = [
  { emoji: '😔', label: 'Üzgün', value: 1 },
  { emoji: '😐', label: 'Normal', value: 2 },
  { emoji: '🫠', label: 'Yorgun', value: 3 },
  { emoji: '😎', label: 'Mutlu', value: 4 },
  { emoji: '🤩', label: 'Harika', value: 5 },
];

export default function ArchiveScreen({ navigation }: ArchiveScreenProps) {
  const { currentTheme } = useTheme();
  const { t, currentLanguage } = useLanguage();
  const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
  const { user } = useAuth();
  const { entries } = useDiary(user?.uid);
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showMoodFilter, setShowMoodFilter] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get all unique tags from entries
  const allTags = Array.from(
    new Set(
      entries.flatMap(entry => entry.tags || [])
    )
  );

  useEffect(() => {
    filterEntries();
  }, [searchQuery, selectedMood, selectedTag, entries]);

  const filterEntries = () => {
    let filtered = [...entries];

    // Search by text
    if (searchQuery.trim()) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.tags || []).some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by mood
    if (selectedMood !== null) {
      filtered = filtered.filter(entry => entry.mood === selectedMood);
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(entry => 
        (entry.tags || []).includes(selectedTag)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEntries(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMood(null);
    setSelectedTag(null);
  };

  const getCurrentMonth = () => {
    return currentDate.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0 = Sunday

    return { firstDay, lastDay, daysInMonth, startDay };
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const hasEntryOnDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return entries.some(entry => entry.date === dateString);
  };

  const renderCalendarView = () => {
    const { firstDay, lastDay, daysInMonth, startDay } = getDaysInMonth();
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`empty-${i}`} style={dynamicStyles.calendarDay} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
      const hasEntry = hasEntryOnDate(date);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            dynamicStyles.calendarDay,
            hasEntry && dynamicStyles.calendarDayWithEntry,
            isToday && dynamicStyles.calendarDayToday,
          ]}
          onPress={() => {
            if (hasEntry) {
              const entry = entries.find(e => e.date === date.toISOString().split('T')[0]);
              if (entry) {
                navigation.navigate('WriteDiaryStep3', {
                  title: entry.title,
                  mood: entry.mood,
                  answers: {},
                  freeWriting: entry.content,
                });
              }
            }
          }}
        >
          <Text style={[
            dynamicStyles.calendarDayText,
            hasEntry && dynamicStyles.calendarDayTextWithEntry,
            isToday && dynamicStyles.calendarDayTextToday,
          ]}>
            {day}
          </Text>
          {hasEntry && <View style={dynamicStyles.calendarDayDot} />}
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={dynamicStyles.calendarContainer}>
        <View style={dynamicStyles.calendarHeader}>
          <TouchableOpacity
            style={dynamicStyles.calendarNavButton}
            onPress={() => changeMonth('prev')}
          >
            <Ionicons name="chevron-back" size={24} color={currentTheme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={dynamicStyles.calendarMonthTitle}
            onPress={goToToday}
          >
            <Text style={dynamicStyles.calendarMonthTitleText}>{getCurrentMonth()}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={dynamicStyles.calendarNavButton}
            onPress={() => changeMonth('next')}
          >
            <Ionicons name="chevron-forward" size={24} color={currentTheme.colors.text} />
          </TouchableOpacity>
        </View>
        <View style={dynamicStyles.calendarWeekdays}>
          {['P', 'P', 'S', 'Ç', 'P', 'C', 'C'].map((day, index) => (
            <Text key={index} style={dynamicStyles.calendarWeekday}>
              {day}
            </Text>
          ))}
        </View>
        <View style={dynamicStyles.calendarGrid}>
          {days}
        </View>
        <View style={dynamicStyles.calendarLegend}>
          <View style={dynamicStyles.legendItem}>
            <View style={[dynamicStyles.legendDot, { backgroundColor: currentTheme.colors.border }]} />
            <Text style={dynamicStyles.legendText}>Boş gün</Text>
          </View>
          <View style={dynamicStyles.legendItem}>
            <View style={[dynamicStyles.legendDot, { backgroundColor: currentTheme.colors.primary }]} />
            <Text style={dynamicStyles.legendText}>Günlük yazılmış</Text>
          </View>
          <View style={dynamicStyles.legendItem}>
            <View style={[dynamicStyles.legendDot, { backgroundColor: currentTheme.colors.accent }]} />
            <Text style={dynamicStyles.legendText}>Bugün</Text>
          </View>
          <View style={dynamicStyles.legendItem}>
            <Text style={[dynamicStyles.legendText, { fontStyle: 'italic', marginLeft: 0 }]}>
              Ay başlığına tıklayarak bugüne dön
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderListView = () => {
    if (filteredEntries.length === 0) {
      return (
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="document-outline" size={64} color={currentTheme.colors.secondary} />
          <Text style={dynamicStyles.emptyStateTitle}>
            {searchQuery || selectedMood !== null || selectedTag ? 'Sonuç bulunamadı' : 'Henüz günlük yok'}
          </Text>
          <Text style={dynamicStyles.emptyStateSubtitle}>
            {searchQuery || selectedMood !== null || selectedTag 
              ? 'Farklı arama terimleri deneyin' 
              : 'İlk günlüğünü yazmaya başla!'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const mood = moodOptions.find(m => m.value === item.mood);
          return (
            <TouchableOpacity
              style={dynamicStyles.entryItem}
              onPress={() => navigation.navigate('WriteDiaryStep3', {
                title: item.title,
                mood: item.mood,
                answers: {},
                freeWriting: item.content,
              })}
            >
              <View style={dynamicStyles.entryHeader}>
                <Text style={dynamicStyles.entryTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={dynamicStyles.entryMood}>
                  <Text style={dynamicStyles.entryMoodEmoji}>{mood?.emoji}</Text>
                  <Text style={dynamicStyles.entryMoodLabel}>{mood?.label}</Text>
                </View>
              </View>
              <Text style={dynamicStyles.entryDate}>
                {new Date(item.date).toLocaleDateString(locale)}
              </Text>
              <Text style={dynamicStyles.entryContent} numberOfLines={2}>
                {item.content}
              </Text>
              {item.tags && item.tags.length > 0 && (
                <View style={dynamicStyles.entryTags}>
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={dynamicStyles.entryTag}>
                      <Text style={dynamicStyles.entryTagText}>#{tag}</Text>
                    </View>
                  ))}
                  {item.tags.length > 3 && (
                    <Text style={dynamicStyles.entryTagMore}>+{item.tags.length - 3}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={dynamicStyles.entriesList}
      />
    );
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
      borderBottomColor: currentTheme.colors.border,
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      color: currentTheme.colors.text,
    },
    searchButton: {
      padding: 8,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: currentTheme.colors.card,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    activeFilterButton: {
      backgroundColor: currentTheme.colors.primary,
      borderColor: currentTheme.colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      color: currentTheme.colors.text,
      marginLeft: 4,
    },
    activeFilterButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
    },
    clearFiltersButton: {
      backgroundColor: currentTheme.colors.accent,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    clearFiltersText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      fontWeight: '500',
    },
    viewModeToggle: {
      flexDirection: 'row',
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    viewModeButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeViewModeButton: {
      backgroundColor: currentTheme.colors.primary,
    },
    viewModeButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: currentTheme.colors.text,
    },
    activeViewModeButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
    },
    // Calendar styles
    calendarContainer: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    calendarNavButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.accent,
    },
    calendarMonthTitle: {
      flex: 1,
      alignItems: 'center',
      padding: 8,
    },
    calendarMonthTitleText: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    calendarWeekdays: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    calendarWeekday: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '500',
      color: currentTheme.colors.secondary,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
    },
    calendarDay: {
      width: '14.28%',
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    calendarDayWithEntry: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 8,
    },
    calendarDayToday: {
      backgroundColor: currentTheme.colors.accent,
      borderRadius: 8,
    },
    calendarDayText: {
      fontSize: 14,
      color: currentTheme.colors.text,
    },
    calendarDayTextWithEntry: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontWeight: '600',
    },
    calendarDayTextToday: {
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    calendarDayDot: {
      position: 'absolute',
      bottom: 2,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: 'white',
    },
    calendarLegend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      gap: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    // List styles
    entriesList: {
      paddingBottom: 20,
    },
    entryItem: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    entryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: currentTheme.colors.text,
      flex: 1,
      marginRight: 12,
    },
    entryMood: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    entryMoodEmoji: {
      fontSize: 16,
      marginRight: 4,
    },
    entryMoodLabel: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    entryDate: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginBottom: 8,
    },
    entryContent: {
      fontSize: 14,
      color: currentTheme.colors.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    entryTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    entryTag: {
      backgroundColor: currentTheme.colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    entryTagText: {
      fontSize: 12,
      color: currentTheme.colors.primary,
      fontWeight: '500',
    },
    entryTagMore: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      alignSelf: 'center',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateSubtitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      margin: 20,
      maxHeight: '70%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 16,
    },
    moodOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    selectedMoodOption: {
      backgroundColor: currentTheme.colors.accent,
    },
    moodEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    moodLabel: {
      fontSize: 16,
      color: currentTheme.colors.text,
    },
    selectedMoodLabel: {
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    tagOption: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: currentTheme.colors.accent,
      borderRadius: 16,
      marginBottom: 8,
      marginRight: 8,
    },
    selectedTagOption: {
      backgroundColor: currentTheme.colors.primary,
    },
    tagText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
      fontWeight: '500',
    },
    selectedTagText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Arşiv & Geçmiş</Text>
      </View>

      {/* Content */}
      <View style={dynamicStyles.content}>
        {/* Search */}
        <View style={dynamicStyles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={currentTheme.colors.secondary} />
          <TextInput
            style={dynamicStyles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Başlık, içerik veya etiket ara..."
            placeholderTextColor={currentTheme.colors.muted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={dynamicStyles.searchButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={currentTheme.colors.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={dynamicStyles.filterRow}>
          <TouchableOpacity
            style={[
              dynamicStyles.filterButton,
              selectedMood !== null && dynamicStyles.activeFilterButton,
            ]}
            onPress={() => setShowMoodFilter(true)}
          >
            <Ionicons 
              name="happy-outline" 
              size={16} 
              color={selectedMood !== null ? currentTheme.colors.background : currentTheme.colors.secondary} 
            />
            <Text style={[
              dynamicStyles.filterButtonText,
              selectedMood !== null && dynamicStyles.activeFilterButtonText,
            ]}>
              {selectedMood !== null ? moodOptions.find(m => m.value === selectedMood)?.label : 'Mood'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              dynamicStyles.filterButton,
              selectedTag && dynamicStyles.activeFilterButton,
            ]}
            onPress={() => setShowTagFilter(true)}
          >
            <Ionicons 
              name="pricetag-outline" 
              size={16} 
              color={selectedTag ? currentTheme.colors.background : currentTheme.colors.secondary} 
            />
            <Text style={[
              dynamicStyles.filterButtonText,
              selectedTag && dynamicStyles.activeFilterButtonText,
            ]}>
              {selectedTag || 'Etiket'}
            </Text>
          </TouchableOpacity>

          {(searchQuery || selectedMood !== null || selectedTag) && (
            <TouchableOpacity
              style={dynamicStyles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={dynamicStyles.clearFiltersText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* View Mode Toggle */}
        <View style={dynamicStyles.viewModeToggle}>
          <TouchableOpacity
            style={[
              dynamicStyles.viewModeButton,
              viewMode === 'list' && dynamicStyles.activeViewModeButton,
            ]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[
              dynamicStyles.viewModeButtonText,
              viewMode === 'list' && dynamicStyles.activeViewModeButtonText,
            ]}>
              Liste
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              dynamicStyles.viewModeButton,
              viewMode === 'calendar' && dynamicStyles.activeViewModeButton,
            ]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={[
              dynamicStyles.viewModeButtonText,
              viewMode === 'calendar' && dynamicStyles.activeViewModeButtonText,
            ]}>
              Takvim
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
      </View>

      {/* Mood Filter Modal */}
      <Modal
        visible={showMoodFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoodFilter(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoodFilter(false)}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Mood Seç</Text>
            {moodOptions.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  dynamicStyles.moodOption,
                  selectedMood === mood.value && dynamicStyles.selectedMoodOption,
                ]}
                onPress={() => {
                  setSelectedMood(selectedMood === mood.value ? null : mood.value);
                  setShowMoodFilter(false);
                }}
              >
                <Text style={dynamicStyles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  dynamicStyles.moodLabel,
                  selectedMood === mood.value && dynamicStyles.selectedMoodLabel,
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tag Filter Modal */}
      <Modal
        visible={showTagFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTagFilter(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTagFilter(false)}
        >
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Etiket Seç</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {allTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    dynamicStyles.tagOption,
                    selectedTag === tag && dynamicStyles.selectedTagOption,
                  ]}
                  onPress={() => {
                    setSelectedTag(selectedTag === tag ? null : tag);
                    setShowTagFilter(false);
                  }}
                >
                  <Text style={[
                    dynamicStyles.tagText,
                    selectedTag === tag && dynamicStyles.selectedTagText,
                  ]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
