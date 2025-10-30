import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
  selectedDate?: string; // YYYY-MM-DD format
  onDateSelect: (date: string) => void;
  placeholder?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
}

const { width } = Dimensions.get('window');

export default function DatePicker({
  selectedDate,
  onDateSelect,
  placeholder = "Tarih seç",
  label,
  minDate,
  maxDate,
}: DatePickerProps) {
  const { currentTheme } = useTheme();
  const { currentLanguage } = useLanguage();
  const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Takvim için ay verilerini oluştur
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Ayın ilk günü
    const firstDay = new Date(year, month, 1);
    // Ayın son günü
    const lastDay = new Date(year, month + 1, 0);
    // Ayın ilk haftasının Pazartesi günü
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // 42 gün (6 hafta) oluştur
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      days,
      firstDay,
      lastDay,
      monthName: firstDay.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
    };
  }, [currentMonth]);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // UTC bazlı tarih karşılaştırması (saat dilimi sorunlarını önler)
    const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowUTC = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const dateUTC = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (dateUTC.getTime() === todayUTC.getTime()) {
      return locale.startsWith('tr') ? 'Bugün' : 'Today';
    } else if (dateUTC.getTime() === tomorrowUTC.getTime()) {
      return locale.startsWith('tr') ? 'Yarın' : 'Tomorrow';
    } else {
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'short'
      });
    }
  };

  const getDateDisplayText = () => {
    if (!selectedDate) return placeholder;
    
    // YYYY-MM-DD formatını parse et (saat dilimi sorunlarını önler)
    const [year, month, day] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month 0-indexed
    return formatDate(date);
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    // UTC bazlı tarih karşılaştırması
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return dateString === selectedDate;
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateUTC = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateUTC.getTime() === todayUTC.getTime();
  };

  const isTomorrow = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowUTC = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const dateUTC = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateUTC.getTime() === tomorrowUTC.getTime();
  };

  const handleDateSelect = (date: Date) => {
    // UTC bazlı tarih string'i oluştur
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    onDateSelect(dateString);
    setShowModal(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const dynamicStyles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    dateButton: {
      backgroundColor: currentTheme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dateButtonText: {
      fontSize: 16,
      color: currentTheme.colors.text,
      flex: 1,
    },
    placeholderText: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: currentTheme.colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.background,
    },
    // Takvim Stilleri
    calendarContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    monthTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    navButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    weekDaysContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekDay: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    weekDayText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calendarDay: {
      width: (width - 80) / 7, // 7 gün için eşit genişlik
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    dayButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    selectedDayButton: {
      backgroundColor: currentTheme.colors.primary,
    },
    todayButton: {
      backgroundColor: currentTheme.colors.primary + '20',
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
    },
    dayText: {
      fontSize: 16,
      fontWeight: '500',
      color: currentTheme.colors.text,
    },
    selectedDayText: {
      color: 'white',
      fontWeight: '700',
    },
    otherMonthDayText: {
      color: currentTheme.colors.secondary,
      opacity: 0.4,
    },
    disabledDayText: {
      color: currentTheme.colors.secondary,
      opacity: 0.3,
    },
    todayBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 6,
      width: 12,
      height: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayBadgeText: {
      fontSize: 8,
      color: 'white',
      fontWeight: '700',
    },
    tomorrowBadge: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: currentTheme.colors.accent,
      borderRadius: 6,
      width: 12,
      height: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tomorrowBadgeText: {
      fontSize: 8,
      color: 'white',
      fontWeight: '700',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {label && <Text style={dynamicStyles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={dynamicStyles.dateButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={selectedDate ? dynamicStyles.dateButtonText : dynamicStyles.placeholderText}>
          {getDateDisplayText()}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={currentTheme.colors.secondary} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>📅 Tarih Seç</Text>
              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={20} color={currentTheme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={dynamicStyles.calendarContainer}>
              <View style={dynamicStyles.calendarHeader}>
                <TouchableOpacity onPress={() => navigateMonth('prev')} style={dynamicStyles.navButton}>
                  <Ionicons name="chevron-back" size={24} color={currentTheme.colors.text} />
                </TouchableOpacity>
                <Text style={dynamicStyles.monthTitle}>{calendarData.monthName}</Text>
                <TouchableOpacity onPress={() => navigateMonth('next')} style={dynamicStyles.navButton}>
                  <Ionicons name="chevron-forward" size={24} color={currentTheme.colors.text} />
                </TouchableOpacity>
              </View>

              <View style={dynamicStyles.weekDaysContainer}>
                {weekDays.map((day, index) => (
                  <View key={index} style={dynamicStyles.weekDay}>
                    <Text style={dynamicStyles.weekDayText}>{day}</Text>
                  </View>
                ))}
              </View>

              <View style={dynamicStyles.calendarGrid}>
                {calendarData.days.map((date, index) => {
                  const isDisabled = isDateDisabled(date);
                  const isSelected = isDateSelected(date);
                  const isCurrent = isCurrentMonth(date);
                  const isTodayDate = isToday(date);
                  const isTomorrowDate = isTomorrow(date);

                  return (
                    <View key={index} style={dynamicStyles.calendarDay}>
                      <TouchableOpacity
                        style={[
                          dynamicStyles.dayButton,
                          isSelected && dynamicStyles.selectedDayButton,
                          isTodayDate && !isSelected && dynamicStyles.todayButton,
                        ]}
                        onPress={() => handleDateSelect(date)}
                        disabled={isDisabled}
                      >
                        <Text
                          style={[
                            dynamicStyles.dayText,
                            isSelected && dynamicStyles.selectedDayText,
                            !isCurrent && dynamicStyles.otherMonthDayText,
                            isDisabled && dynamicStyles.disabledDayText,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                        {isTodayDate && !isSelected && (
                          <View style={dynamicStyles.todayBadge}>
                            <Text style={dynamicStyles.todayBadgeText}>•</Text>
                          </View>
                        )}
                        {isTomorrowDate && !isSelected && (
                          <View style={dynamicStyles.tomorrowBadge}>
                            <Text style={dynamicStyles.tomorrowBadgeText}>•</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
