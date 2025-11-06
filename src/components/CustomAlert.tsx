import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  primaryButton?: {
    text: string;
    onPress: () => void;
    style?: 'primary' | 'danger' | 'secondary';
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
    style?: 'primary' | 'danger' | 'secondary';
  };
  onClose?: () => void;
}

const { width } = Dimensions.get('window');

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  primaryButton,
  secondaryButton,
  onClose,
}) => {
  const { currentTheme } = useTheme();

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          iconColor: currentTheme.colors.success,
          bgColor: currentTheme.colors.card,
          borderColor: currentTheme.colors.success,
          titleColor: currentTheme.colors.text,
        };
      case 'warning':
        return {
          icon: 'warning' as any,
          iconColor: '#f59e0b',
          bgColor: currentTheme.colors.card,
          borderColor: '#f59e0b',
          titleColor: currentTheme.colors.text,
        };
      case 'error':
        return {
          icon: 'close-circle',
          iconColor: currentTheme.colors.danger,
          bgColor: currentTheme.colors.card,
          borderColor: currentTheme.colors.danger,
          titleColor: currentTheme.colors.text,
        };
      default: // info
        return {
          icon: 'information-circle',
          iconColor: currentTheme.colors.primary,
          bgColor: currentTheme.colors.card,
          borderColor: currentTheme.colors.primary,
          titleColor: currentTheme.colors.text,
        };
    }
  };

  const getButtonStyle = (buttonStyle: 'primary' | 'danger' | 'secondary' = 'primary') => {
    switch (buttonStyle) {
      case 'danger':
        return {
          backgroundColor: currentTheme.colors.danger,
          borderColor: currentTheme.colors.danger,
        };
      case 'secondary':
        return {
          backgroundColor: currentTheme.colors.background,
          borderColor: currentTheme.colors.border,
        };
      default: // primary
        return {
          backgroundColor: currentTheme.colors.primary,
          borderColor: currentTheme.colors.primary,
        };
    }
  };

  const typeConfig = getTypeConfig();

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    container: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 24,
      padding: 0,
      width: width * 0.9,
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 2,
      borderColor: typeConfig.borderColor,
    },
    header: {
      backgroundColor: typeConfig.bgColor,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      padding: 24,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: typeConfig.borderColor,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: typeConfig.iconColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: typeConfig.titleColor,
      textAlign: 'center',
      marginBottom: 8,
    },
    content: {
      padding: 24,
    },
    message: {
      fontSize: 16,
      color: currentTheme.colors.text,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    buttonContainer: {
      gap: 12,
    },
    button: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
      marginLeft: 8,
    },
    secondaryButtonText: {
      color: currentTheme.colors.text,
      fontWeight: '600',
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={dynamicStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={dynamicStyles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {onClose && (
            <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={currentTheme.colors.text} />
            </TouchableOpacity>
          )}

          {/* Header */}
          <View style={dynamicStyles.header}>
            <View style={dynamicStyles.iconContainer}>
              <Ionicons name={typeConfig.icon} size={32} color={typeConfig.iconColor} />
            </View>
            <Text style={dynamicStyles.title}>{title}</Text>
          </View>

          {/* Content */}
          <View style={dynamicStyles.content}>
            <Text style={dynamicStyles.message}>{message}</Text>

            {/* Buttons */}
            <View style={dynamicStyles.buttonContainer}>
              {primaryButton && (
                <TouchableOpacity
                  style={[
                    dynamicStyles.button,
                    getButtonStyle(primaryButton.style),
                  ]}
                  onPress={primaryButton.onPress}
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={dynamicStyles.buttonText}>{primaryButton.text}</Text>
                </TouchableOpacity>
              )}

              {secondaryButton && (
                <TouchableOpacity
                  style={[
                    dynamicStyles.button,
                    getButtonStyle(secondaryButton.style),
                  ]}
                  onPress={secondaryButton.onPress}
                >
                  <Ionicons 
                    name="refresh" 
                    size={20} 
                    color={secondaryButton.style === 'secondary' ? currentTheme.colors.text : 'white'} 
                  />
                  <Text style={[
                    secondaryButton.style === 'secondary' 
                      ? dynamicStyles.secondaryButtonText 
                      : dynamicStyles.buttonText
                  ]}>
                    {secondaryButton.text}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
