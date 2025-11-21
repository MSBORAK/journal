import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import HistoryScreen from './HistoryScreen';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getButtonTextColor } from '../utils/colorUtils';

interface JournalScreenProps {
  navigation: any;
}

export default function JournalScreen({ navigation }: JournalScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();

  const handleWriteDiary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('WriteDiaryStep1');
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      marginBottom: 16,
    },
    writeButton: {
      backgroundColor: currentTheme.colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    writeButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>
          {t('navigation.journal') || 'Günlük'}
        </Text>
        <Text style={dynamicStyles.headerSubtitle}>
          {t('journal.subtitle') || 'Günlüklerini yaz, geçmişini keşfet'}
        </Text>
        <TouchableOpacity
          style={dynamicStyles.writeButton}
          onPress={handleWriteDiary}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background)}
          />
          <Text style={dynamicStyles.writeButtonText}>
            {t('diary.writeNew') || 'Yeni Günlük Yaz'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.content}>
        <HistoryScreen navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

