import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ThemeSelectionScreenProps {
  navigation: any;
}

export default function ThemeSelectionScreen({ navigation }: ThemeSelectionScreenProps) {
  const { currentTheme, setTheme, themes } = useTheme();

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
    themeSelector: {
      flexDirection: 'column',
      gap: 12,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      backgroundColor: currentTheme.colors.card,
    },
    selectedThemeOption: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.accent,
    },
    themePreview: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: 12,
    },
    themeLabel: {
      fontSize: 16,
      color: currentTheme.colors.text,
      fontWeight: '500',
      flex: 1,
    },
    selectedThemeLabel: {
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    themeCheck: {
      marginLeft: 8,
    },
    themeDescription: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
      marginTop: 4,
      marginLeft: 42,
    },
  });

  const handleThemeSelect = async (themeName: string) => {
    await setTheme(themeName);
    navigation.goBack();
  };

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
        <Text style={dynamicStyles.headerTitle}>Tema Seçimi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Tema Seç</Text>
        <Text style={dynamicStyles.subtitle}>
          Uygulamanızın görünümünü kişiselleştirin
        </Text>

        <View style={dynamicStyles.themeSelector}>
          {themes.map((theme) => (
            <TouchableOpacity
              key={theme.name}
              style={[
                dynamicStyles.themeOption,
                currentTheme.name === theme.name && dynamicStyles.selectedThemeOption,
              ]}
              onPress={() => handleThemeSelect(theme.name)}
            >
              <View style={[dynamicStyles.themePreview, { backgroundColor: theme.colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[
                  dynamicStyles.themeLabel,
                  currentTheme.name === theme.name && dynamicStyles.selectedThemeLabel,
                ]}>
                  {theme.label}
                </Text>
                <Text style={dynamicStyles.themeDescription}>
                  {theme.name === 'light' && 'Açık renkli, temiz görünüm'}
                  {theme.name === 'dark' && 'Koyu renkli, göz yormaz'}
                  {theme.name === 'ocean' && 'Mavi tonları, sakin hissiyat'}
                  {theme.name === 'sunset' && 'Turuncu tonları, sıcak hissiyat'}
                  {theme.name === 'forest' && 'Yeşil tonları, doğal hissiyat'}
                </Text>
              </View>
              {currentTheme.name === theme.name && (
                <View style={dynamicStyles.themeCheck}>
                  <Ionicons name="checkmark" size={20} color={currentTheme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
