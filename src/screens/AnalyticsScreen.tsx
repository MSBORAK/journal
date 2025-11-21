import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import StatisticsScreen from './StatisticsScreen';
import InsightsScreen from './InsightsScreen';
import AchievementsScreen from './AchievementsScreen';
import SettingsScreen from './SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getButtonTextColor } from '../utils/colorUtils';

interface AnalyticsScreenProps {
  navigation: any;
}

export default function AnalyticsScreen({ navigation }: AnalyticsScreenProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'statistics' | 'insights' | 'achievements' | 'settings'>('statistics');

  const handleTabChange = (tab: 'statistics' | 'insights' | 'achievements' | 'settings') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: currentTheme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: currentTheme.colors.border + '40',
      paddingHorizontal: 10,
      paddingTop: 10,
      shadowColor: currentTheme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTabButton: {
      borderBottomColor: currentTheme.colors.primary,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
      marginTop: 4,
    },
    activeTabText: {
      color: currentTheme.colors.primary,
    },
    content: {
      flex: 1,
    },
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <StatisticsScreen navigation={navigation} />;
      case 'insights':
        return <InsightsScreen navigation={navigation} />;
      case 'achievements':
        return <AchievementsScreen navigation={navigation} />;
      case 'settings':
        return <SettingsScreen navigation={navigation} />;
      default:
        return <StatisticsScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.tabBar}>
        <TouchableOpacity
          style={[dynamicStyles.tabButton, activeTab === 'statistics' && dynamicStyles.activeTabButton]}
          onPress={() => handleTabChange('statistics')}
        >
          <Ionicons
            name={activeTab === 'statistics' ? 'stats-chart' : 'stats-chart-outline'}
            size={24}
            color={activeTab === 'statistics' ? currentTheme.colors.primary : currentTheme.colors.secondary}
          />
          <Text style={[dynamicStyles.tabText, activeTab === 'statistics' && dynamicStyles.activeTabText]}>
            {t('navigation.statistics')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dynamicStyles.tabButton, activeTab === 'insights' && dynamicStyles.activeTabButton]}
          onPress={() => handleTabChange('insights')}
        >
          <Ionicons
            name={activeTab === 'insights' ? 'bulb' : 'bulb-outline'}
            size={24}
            color={activeTab === 'insights' ? currentTheme.colors.primary : currentTheme.colors.secondary}
          />
          <Text style={[dynamicStyles.tabText, activeTab === 'insights' && dynamicStyles.activeTabText]}>
            {t('navigation.insights')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dynamicStyles.tabButton, activeTab === 'achievements' && dynamicStyles.activeTabButton]}
          onPress={() => handleTabChange('achievements')}
        >
          <Ionicons
            name={activeTab === 'achievements' ? 'trophy' : 'trophy-outline'}
            size={24}
            color={activeTab === 'achievements' ? currentTheme.colors.primary : currentTheme.colors.secondary}
          />
          <Text style={[dynamicStyles.tabText, activeTab === 'achievements' && dynamicStyles.activeTabText]}>
            {t('achievements.title')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dynamicStyles.tabButton, activeTab === 'settings' && dynamicStyles.activeTabButton]}
          onPress={() => handleTabChange('settings')}
        >
          <Ionicons
            name={activeTab === 'settings' ? 'settings' : 'settings-outline'}
            size={24}
            color={activeTab === 'settings' ? currentTheme.colors.primary : currentTheme.colors.secondary}
          />
          <Text style={[dynamicStyles.tabText, activeTab === 'settings' && dynamicStyles.activeTabText]}>
            {t('navigation.settings')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={dynamicStyles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

