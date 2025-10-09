import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ModernToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  type: 'night' | 'day';
  disabled?: boolean;
}

export default function ModernToggle({ value, onValueChange, type, disabled = false }: ModernToggleProps) {
  const { currentTheme } = useTheme();
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (disabled) return;
    
    // Haptic feedback
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onValueChange(!value);
  };

  const isNight = type === 'night';
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          backgroundColor: value 
            ? currentTheme.colors.primary
            : currentTheme.colors.border,
          borderColor: currentTheme.colors.border,
        }
      ]}
    >
      <Animated.View
          style={[
            styles.track,
            {
              backgroundColor: value 
                ? currentTheme.colors.primary
                : currentTheme.colors.background,
              transform: [{ scale }],
            }
          ]}
      >
        {/* Background Elements */}
        {isNight ? (
          // Night theme elements - no stars, just clean background
          <View style={styles.backgroundElements}>
            {/* Clean night background without stars */}
          </View>
        ) : (
          // Day theme elements - no clouds, just clean background
          <View style={styles.backgroundElements}>
            {/* Clean day background without clouds */}
          </View>
        )}

        {/* Toggle Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: currentTheme.colors.card,
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 34], // 32px thumb width
                  }),
                },
                { scale }
              ],
            }
          ]}
        >
          {/* Icon inside thumb */}
          {isNight ? (
            <Text style={styles.icon}>🌙</Text>
          ) : (
            <Text style={styles.icon}>☀️</Text>
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 68,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 2,
  },
  track: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  thumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  icon: {
    fontSize: 16,
  },
});
