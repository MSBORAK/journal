import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { TooltipData } from '../services/tooltipService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TooltipProps {
  tooltip: TooltipData;
  visible: boolean;
  onClose: () => void;
  onNext?: () => void;
  targetPosition?: { x: number; y: number; width: number; height: number };
}

export default function Tooltip({ tooltip, visible, onClose, onNext, targetPosition }: TooltipProps) {
  const { currentTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getTooltipPosition = () => {
    if (!targetPosition) {
      // Default center position
      return {
        top: screenHeight * 0.4,
        left: 20,
        right: 20,
      };
    }

    const tooltipWidth = screenWidth * 0.8;
    const tooltipHeight = 120;
    const margin = 20;

    let top = targetPosition.y + targetPosition.height + 10;
    let left = targetPosition.x + (targetPosition.width / 2) - (tooltipWidth / 2);

    // Adjust if tooltip goes off screen
    if (left < margin) {
      left = margin;
    } else if (left + tooltipWidth > screenWidth - margin) {
      left = screenWidth - tooltipWidth - margin;
    }

    // If tooltip goes below screen, show above target
    if (top + tooltipHeight > screenHeight - 100) {
      top = targetPosition.y - tooltipHeight - 10;
    }

    return { top, left, right: undefined };
  };

  const position = getTooltipPosition();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    tooltipContainer: {
      position: 'absolute',
      ...position,
      width: screenWidth * 0.8,
    },
    tooltip: {
      backgroundColor: currentTheme.colors.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    },
    arrow: {
      position: 'absolute',
      width: 0,
      height: 0,
    },
    arrowUp: {
      bottom: -8,
      left: '50%',
      marginLeft: -8,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: currentTheme.colors.card,
    },
    arrowDown: {
      top: -8,
      left: '50%',
      marginLeft: -8,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderTopWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: currentTheme.colors.card,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.text,
      marginBottom: 8,
      fontFamily: 'Poppins_700Bold',
    },
    description: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      lineHeight: 20,
      marginBottom: 16,
      fontFamily: 'Poppins_400Regular',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    skipButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    skipButtonText: {
      fontSize: 14,
      color: currentTheme.colors.secondary,
      fontWeight: '500',
    },
    nextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25,
      backgroundColor: currentTheme.colors.primary,
    },
    nextButtonText: {
      color: currentTheme.colors.background,
      fontSize: 14,
      fontWeight: '600',
      marginRight: 8,
      fontFamily: 'Poppins_600SemiBold',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.5)" />
      
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.tooltipContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.tooltip}>
            <Text style={styles.title}>{tooltip.title}</Text>
            <Text style={styles.description}>{tooltip.description}</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.skipButton} onPress={onClose}>
                <Text style={styles.skipButtonText}>Atla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextButton} onPress={onNext || onClose}>
                <Text style={styles.nextButtonText}>Anladım</Text>
                <Ionicons name="checkmark" size={16} color={currentTheme.colors.background} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Arrow */}
          <View
            style={[
              styles.arrow,
              tooltip.position === 'bottom' ? styles.arrowUp : styles.arrowDown,
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}
