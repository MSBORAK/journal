import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { CustomAlert } from '../components/CustomAlert';

interface WellnessTrackingScreenProps {
  navigation: any;
}

interface WellnessData {
  waterGlasses: number;
  exerciseMinutes: number;
  sleepHours: number;
  stressLevel: number; // 1-10
  energyLevel: number; // 1-10
  mood: number; // 1-5
  date: string;
}

export default function WellnessTrackingScreen({ navigation }: WellnessTrackingScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();

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
  const [wellnessData, setWellnessData] = useState<WellnessData>({
    waterGlasses: 0,
    exerciseMinutes: 0,
    sleepHours: 0,
    stressLevel: 5,
    energyLevel: 5,
    mood: 3,
    date: new Date().toISOString().split('T')[0],
  });

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

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedData = await AsyncStorage.getItem(`wellness_${today}`);
      if (savedData) {
        setWellnessData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading wellness data:', error);
    }
  };

  const saveWellnessData = async (data: WellnessData) => {
    try {
      setLoading(true);
      await AsyncStorage.setItem(`wellness_${data.date}`, JSON.stringify(data));
      setWellnessData(data);
      
      showAlert(
        t('health.wellnessSaved'),
        t('health.wellnessSavedDesc'),
        'success',
        {
          text: t('common.ok'),
          onPress: () => setShowCustomAlert(false),
          style: 'primary'
        }
      );
    } catch (error) {
      console.error('Error saving wellness data:', error);
      showAlert(
        t('health.wellnessError'),
        t('health.wellnessErrorDesc'),
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

  const updateValue = (key: keyof WellnessData, value: number) => {
    const newData = { ...wellnessData, [key]: value };
    setWellnessData(newData);
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
    card: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: currentTheme.colors.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: currentTheme.colors.text,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardIcon: {
      marginRight: 8,
    },
    counterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    counterButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      minWidth: 60,
      textAlign: 'center',
    },
    label: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      textAlign: 'center',
    },
    sliderContainer: {
      marginBottom: 16,
    },
    sliderLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    sliderValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      textAlign: 'center',
    },
    levelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      flexWrap: 'wrap',
      marginTop: 8,
      gap: 4,
    },
    levelButton: {
      minWidth: 32,
      width: 32,
      height: 32,
      marginHorizontal: 1,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedLevelButton: {
      backgroundColor: currentTheme.colors.primary,
    },
    levelText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.text,
      textAlign: 'center',
    },
    selectedLevelText: {
      color: currentTheme.colors.background,
      fontWeight: '600',
    },
    saveButton: {
      backgroundColor: currentTheme.colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      color: currentTheme.colors.background,
      fontSize: 16,
      fontWeight: '600',
    },
    disabledButton: {
      opacity: 0.5,
    },
    counterDescription: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginTop: 8,
      marginBottom: 16,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  });

  const renderCounter = (title: string, value: number, onChange: (value: number) => void, icon: string, max: number = 99) => (
    <View style={dynamicStyles.card}>
      <Text style={dynamicStyles.cardTitle}>
        <Text style={dynamicStyles.cardIcon}>{icon}</Text>
        {title}
      </Text>
      <View style={dynamicStyles.counterContainer}>
        <TouchableOpacity
          style={[dynamicStyles.counterButton, value <= 0 && { opacity: 0.5 }]}
          onPress={() => value > 0 && onChange(value - 1)}
          disabled={value <= 0}
        >
          <Ionicons name="remove" size={20} color={currentTheme.colors.background} />
        </TouchableOpacity>
        <Text style={dynamicStyles.counterValue}>{value}</Text>
        <TouchableOpacity
          style={[dynamicStyles.counterButton, value >= max && { opacity: 0.5 }]}
          onPress={() => value < max && onChange(value + 1)}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={currentTheme.colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLevelSelector = (title: string, value: number, onChange: (value: number) => void, icon: string, levels: string[]) => (
    <View style={dynamicStyles.card}>
      <Text style={dynamicStyles.cardTitle}>
        <Text style={dynamicStyles.cardIcon}>{icon}</Text>
        {title}
      </Text>
      <View style={dynamicStyles.sliderContainer}>
        <Text style={dynamicStyles.sliderLabel}>Seviye: {value}/10</Text>
        <Text style={dynamicStyles.sliderValue}>{levels[value - 1]}</Text>
      </View>
      <View style={dynamicStyles.levelContainer}>
        {levels.map((level, index) => (
          <TouchableOpacity
            key={index}
            style={[
              dynamicStyles.levelButton,
              value === index + 1 && dynamicStyles.selectedLevelButton,
            ]}
            onPress={() => onChange(index + 1)}
          >
            <Text style={[
              dynamicStyles.levelText,
              value === index + 1 && dynamicStyles.selectedLevelText,
            ]}>
              {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
        <Text style={dynamicStyles.headerTitle}>Sağlık Takibi</Text>
      </View>

      {/* Content */}
      <ScrollView style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>
          {t('health.dailyHealthTracking')}
        </Text>
        <Text style={dynamicStyles.subtitle}>
          {t('health.recordHealthStatus')}
        </Text>

        {/* Su İçme */}
        {renderCounter(
          t('health.waterIntake'),
          wellnessData.waterGlasses,
          (value) => updateValue('waterGlasses', value),
          '💧',
          20
        )}
        <Text style={dynamicStyles.counterDescription}>
          Günlük içtiğiniz bardak sayısı (1 bardak = 250ml)
        </Text>

        {/* Egzersiz */}
        {renderCounter(
          t('health.exerciseMinutes'),
          wellnessData.exerciseMinutes,
          (value) => updateValue('exerciseMinutes', value),
          '🏃‍♂️',
          300
        )}

        {/* Uyku */}
        {renderCounter(
          'Uyku (Saat)',
          wellnessData.sleepHours,
          (value) => updateValue('sleepHours', value),
          '😴',
          12
        )}

        {/* Stres Seviyesi */}
        {renderLevelSelector(
          t('health.stressLevel'),
          wellnessData.stressLevel,
          (value) => updateValue('stressLevel', value),
          '🧘‍♀️',
          ['Çok Düşük', 'Düşük', 'Normal', 'Orta', 'Yüksek', 'Çok Yüksek', 'Aşırı', 'Kritik', 'Tehlikeli', 'Çok Tehlikeli']
        )}

        {/* Enerji Seviyesi */}
        {renderLevelSelector(
          t('health.energyLevel'),
          wellnessData.energyLevel,
          (value) => updateValue('energyLevel', value),
          '⚡',
          ['Çok Düşük', 'Düşük', 'Normal', 'Orta', 'Yüksek', 'Çok Yüksek', 'Aşırı', 'Mükemmel', 'Süper', 'Epic']
        )}

        {/* Mood */}
        {renderLevelSelector(
          'Genel Ruh Hali',
          wellnessData.mood,
          (value) => updateValue('mood', value),
          '😊',
          ['Çok Kötü', 'Kötü', 'Normal', 'İyi', 'Mükemmel']
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[dynamicStyles.saveButton, loading && dynamicStyles.disabledButton]}
          onPress={() => saveWellnessData(wellnessData)}
          disabled={loading}
        >
          <Text style={dynamicStyles.saveButtonText}>
            {loading ? 'Kaydediliyor...' : 'Verileri Kaydet'}
          </Text>
        </TouchableOpacity>

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
    </View>
  );
}
