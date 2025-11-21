import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getButtonTextColor } from '../utils/colorUtils';

interface MindfulnessScreenProps {
  navigation: any;
}

export default function MindfulnessScreen({ navigation }: MindfulnessScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'morning' | 'evening' | 'weekly'>('morning');
  const [showAffirmationModal, setShowAffirmationModal] = useState(false);
  const [animationValues] = useState({
    fadeAnim: new Animated.Value(0),
    scaleAnim: new Animated.Value(0.9),
  });

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(animationValues.fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(animationValues.scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTabChange = (tab: 'morning' | 'evening' | 'weekly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const morningRoutines = [
    { id: 1, title: 'Gratitude Practice', emoji: '🙏', completed: false },
    { id: 2, title: 'Deep Breathing', emoji: '🌬️', completed: false },
    { id: 3, title: 'Intention Setting', emoji: '🎯', completed: false },
    { id: 4, title: 'Morning Stretch', emoji: '🤸‍♀️', completed: false },
  ];

  const eveningRoutines = [
    { id: 1, title: 'Daily Reflection', emoji: '📝', completed: false },
    { id: 2, title: 'Gratitude Journal', emoji: '📖', completed: false },
    { id: 3, title: 'Mindful Breathing', emoji: '🕯️', completed: false },
    { id: 4, title: 'Digital Detox', emoji: '📱', completed: false },
  ];

  const positiveAffirmations = [
    "Bugün harika bir gün olacak! 🌟",
    "Ben değerli ve sevilmeye layığım 💖",
    "Her gün yeni fırsatlar sunuyor 🚀",
    "İçimde güçlü ve güvenli hissediyorum 💪",
    "Hayallerim gerçek olacak ✨",
    "Bugün kendime karşı nazik olacağım 🤗",
    "Zorluklar beni güçlendiriyor 🌱",
    "Minettarım ve mutluyum 🙏",
  ];

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    headerTitle: {
      fontSize: 36,
      fontWeight: '800',
      color: currentTheme.colors.text,
      marginBottom: 8,
      textShadowColor: currentTheme.colors.primary + '20',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: currentTheme.colors.secondary,
      lineHeight: 24,
    },
    tabBar: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 24,
      padding: 6,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 20,
    },
    activeTab: {
      backgroundColor: currentTheme.colors.primary + '20',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: currentTheme.colors.secondary,
    },
    activeTabText: {
      color: currentTheme.colors.primary,
      fontWeight: '700',
    },
    contentContainer: {
      paddingHorizontal: 20,
    },
    routineCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    routineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    routineIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    routineTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: currentTheme.colors.text,
    },
    routineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: currentTheme.colors.background + '40',
      borderRadius: 16,
      marginBottom: 8,
    },
    routineItemEmoji: {
      fontSize: 20,
      marginRight: 12,
    },
    routineItemText: {
      flex: 1,
      fontSize: 16,
      color: currentTheme.colors.text,
      fontWeight: '500',
    },
    routineItemCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    affirmationButton: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      marginTop: 20,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    affirmationButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 16,
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 28,
      padding: 28,
      width: '100%',
      maxWidth: 350,
      shadowColor: currentTheme.colors.primary,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 30,
      elevation: 20,
      borderWidth: 2,
      borderColor: currentTheme.colors.primary + '20',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    affirmationText: {
      fontSize: 18,
      color: currentTheme.colors.text,
      textAlign: 'center',
      lineHeight: 28,
      marginBottom: 24,
    },
    modalButton: {
      backgroundColor: currentTheme.colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    modalButtonText: {
      color: getButtonTextColor(currentTheme.colors.primary, currentTheme.colors.background),
      fontSize: 16,
      fontWeight: '700',
    },
  });

  const renderRoutineItem = (item: any, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={dynamicStyles.routineItem}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Toggle completion
      }}
      activeOpacity={0.7}
    >
      <Text style={dynamicStyles.routineItemEmoji}>{item.emoji}</Text>
      <Text style={dynamicStyles.routineItemText}>{item.title}</Text>
      <View style={dynamicStyles.routineItemCheck}>
        {item.completed && (
          <Ionicons name="checkmark" size={16} color={currentTheme.colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (activeTab === 'morning') {
      return (
        <View style={dynamicStyles.routineCard}>
          <View style={dynamicStyles.routineHeader}>
            <Text style={dynamicStyles.routineIcon}>🌅</Text>
            <Text style={dynamicStyles.routineTitle}>Sabah Rutinim</Text>
          </View>
          {morningRoutines.map(renderRoutineItem)}
        </View>
      );
    } else if (activeTab === 'evening') {
      return (
        <View style={dynamicStyles.routineCard}>
          <View style={dynamicStyles.routineHeader}>
            <Text style={dynamicStyles.routineIcon}>🌙</Text>
            <Text style={dynamicStyles.routineTitle}>Akşam Yansıması</Text>
          </View>
          {eveningRoutines.map(renderRoutineItem)}
        </View>
      );
    } else {
      return (
        <View style={dynamicStyles.routineCard}>
          <View style={dynamicStyles.routineHeader}>
            <Text style={dynamicStyles.routineIcon}>📊</Text>
            <Text style={dynamicStyles.routineTitle}>Haftalık Özet</Text>
          </View>
          <Text style={{ color: currentTheme.colors.secondary, textAlign: 'center', marginTop: 20 }}>
            Haftalık farkındalık istatistikleri burada görünecek
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <Animated.View 
        style={[
          dynamicStyles.container,
          {
            opacity: animationValues.fadeAnim,
            transform: [{ scale: animationValues.scaleAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.headerTitle}>🧘‍♀️ Farkındalık</Text>
          <Text style={dynamicStyles.headerSubtitle}>
            Günlük rutinlerin ve pozitif düşüncelerin
          </Text>
        </View>

        {/* Tab Bar */}
        <View style={dynamicStyles.tabBar}>
          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'morning' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('morning')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'morning' && dynamicStyles.activeTabText]}>
              🌅 Sabah
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'evening' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('evening')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'evening' && dynamicStyles.activeTabText]}>
              🌙 Akşam
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[dynamicStyles.tab, activeTab === 'weekly' && dynamicStyles.activeTab]}
            onPress={() => handleTabChange('weekly')}
            activeOpacity={0.7}
          >
            <Text style={[dynamicStyles.tabText, activeTab === 'weekly' && dynamicStyles.activeTabText]}>
              📊 Haftalık
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={dynamicStyles.contentContainer} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
          
          <TouchableOpacity
            style={dynamicStyles.affirmationButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowAffirmationModal(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={dynamicStyles.affirmationButtonText}>
              💫 Pozitif Onaylama Al
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Affirmation Modal */}
        <Modal
          visible={showAffirmationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAffirmationModal(false)}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalTitle}>💫 Pozitif Onaylama</Text>
              <Text style={dynamicStyles.affirmationText}>
                {positiveAffirmations[Math.floor(Math.random() * positiveAffirmations.length)]}
              </Text>
              <TouchableOpacity
                style={dynamicStyles.modalButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowAffirmationModal(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={dynamicStyles.modalButtonText}>Harika! 🌟</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </SafeAreaView>
  );
}
