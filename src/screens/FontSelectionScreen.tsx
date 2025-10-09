import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useFont } from '../contexts/FontContext';
import { Ionicons } from '@expo/vector-icons';

interface FontSelectionScreenProps {
  navigation: any;
}

interface FontOption {
  name: string;
  label: string;
  size: number;
  weight: 'normal' | 'bold';
  family?: string;
  description: string;
}

const fontOptions: FontOption[] = [
  {
    name: 'system',
    label: '✨ Sistem Varsayılanı',
    size: 16,
    weight: 'normal',
    description: 'Telefonunuzun varsayılan yazı tipi',
  },
  {
    name: 'large',
    label: '📖 Kolay Okuma',
    size: 18,
    weight: 'normal',
    description: 'Göz yormayan büyük boyut',
  },
  {
    name: 'small',
    label: '📝 Kompakt',
    size: 14,
    weight: 'normal',
    description: 'Daha fazla içerik için küçük boyut',
  },
  {
    name: 'bold',
    label: '💪 Vurgulu',
    size: 16,
    weight: 'bold',
    description: 'Kalın ve belirgin yazı',
  },
  {
    name: 'comfortable',
    label: 'Rahat',
    size: 17,
    weight: 'normal',
    description: 'Göz yormayan rahat okuma',
  },
  {
    name: 'compact',
    label: 'Kompakt',
    size: 15,
    weight: 'normal',
    description: 'Alan tasarrufu için kompakt',
  },
  {
    name: 'elegant',
    label: 'Zarif',
    size: 16,
    weight: 'bold',
    description: 'Şık görünüm için zarif tip',
  },
  {
    name: 'readable',
    label: 'Okunabilir',
    size: 16,
    weight: 'normal',
    description: 'En iyi okuma deneyimi',
  },
];

export default function FontSelectionScreen({ navigation }: FontSelectionScreenProps) {
  const { currentTheme } = useTheme();
  const { fontConfig, setFontConfig } = useFont();
  const [selectedFont, setSelectedFont] = React.useState(fontConfig.name);

  React.useEffect(() => {
    loadFont();
  }, []);

  const loadFont = async () => {
    try {
      const storedFont = await AsyncStorage.getItem('selectedFont');
      if (storedFont) {
        setSelectedFont(storedFont);
      }
    } catch (error) {
      console.error('Error loading font:', error);
    }
  };

  const saveFont = async (fontName: string) => {
    try {
      const fontOption = fontOptions.find(f => f.name === fontName);
      if (fontOption) {
        await setFontConfig({
          name: fontOption.name,
          size: fontOption.size,
          weight: fontOption.weight,
          family: fontOption.family,
        });
        setSelectedFont(fontName);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving font:', error);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
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
    fontSelector: {
      flexDirection: 'column',
      gap: 12,
    },
    fontOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      backgroundColor: currentTheme.colors.card,
    },
    selectedFontOption: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.accent,
    },
    fontIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: currentTheme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    fontIconText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    fontContent: {
      flex: 1,
    },
    fontLabel: {
      fontSize: 16,
      color: currentTheme.colors.text,
      fontWeight: '500',
      marginBottom: 4,
    },
    selectedFontLabel: {
      color: currentTheme.colors.primary,
      fontWeight: '600',
    },
    fontDescription: {
      fontSize: 12,
      color: currentTheme.colors.secondary,
    },
    fontPreview: {
      fontSize: 14,
      color: currentTheme.colors.text,
      fontStyle: 'italic',
      marginTop: 4,
    },
    fontCheck: {
      marginLeft: 8,
    },
  });

  const getCurrentFont = () => {
    return fontOptions.find(font => font.name === selectedFont) || fontOptions[0];
  };

  const getFontStyle = (font: FontOption) => {
    return {
      fontSize: font.size,
      fontWeight: font.weight,
    };
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
        <Text style={dynamicStyles.headerTitle}>Yazı Tipi Seçimi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Yazı Tipi Seç</Text>
        <Text style={dynamicStyles.subtitle}>
          Okuma deneyiminizi kişiselleştirin
        </Text>

        {/* Current Font Preview */}
        <View style={[dynamicStyles.fontOption, { marginBottom: 24, backgroundColor: currentTheme.colors.accent }]}>
          <View style={dynamicStyles.fontIcon}>
            <Text style={dynamicStyles.fontIconText}>Aa</Text>
          </View>
          <View style={dynamicStyles.fontContent}>
            <Text style={[dynamicStyles.fontLabel, { color: currentTheme.colors.primary }]}>
              Mevcut Seçim: {getCurrentFont().label}
            </Text>
            <Text style={[dynamicStyles.fontPreview, { color: currentTheme.colors.primary }]}>
              Bu yazı tipi nasıl görünüyor? Günlük yazmanın keyfini çıkarın!
            </Text>
          </View>
        </View>

        <View style={dynamicStyles.fontSelector}>
          {fontOptions.map((font) => (
            <TouchableOpacity
              key={font.name}
              style={[
                dynamicStyles.fontOption,
                selectedFont === font.name && dynamicStyles.selectedFontOption,
              ]}
              onPress={() => saveFont(font.name)}
            >
              <View style={dynamicStyles.fontIcon}>
                <Text style={[dynamicStyles.fontIconText, getFontStyle(font)]}>Aa</Text>
              </View>
              <View style={dynamicStyles.fontContent}>
                <Text style={[
                  dynamicStyles.fontLabel,
                  getFontStyle(font),
                  selectedFont === font.name && dynamicStyles.selectedFontLabel,
                ]}>
                  {font.label}
                </Text>
                <Text style={dynamicStyles.fontDescription}>
                  {font.description}
                </Text>
                <Text style={[dynamicStyles.fontPreview, getFontStyle(font)]}>
                  Örnek metin: Günlük yazmak harika bir alışkanlık!
                </Text>
              </View>
              {selectedFont === font.name && (
                <View style={dynamicStyles.fontCheck}>
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
