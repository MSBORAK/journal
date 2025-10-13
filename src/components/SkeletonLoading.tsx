import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SkeletonLoadingProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { currentTheme } = useTheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, []);

  const shimmerStyle = {
    transform: [
      {
        translateX: shimmerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 100],
        }),
      },
    ],
  };

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <View
        style={[
          styles.skeleton,
          {
            backgroundColor: currentTheme.colors.border + '40',
            borderRadius,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: currentTheme.colors.primary + '20',
            borderRadius,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
};

// Önceden tanımlanmış skeleton tipleri
export const SkeletonCard: React.FC = () => {
  const { currentTheme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: currentTheme.colors.card,
          borderColor: currentTheme.colors.border,
        },
      ]}
    >
      <SkeletonLoading height={24} width="60%" borderRadius={6} />
      <SkeletonLoading height={16} width="80%" borderRadius={4} style={{ marginTop: 8 }} />
      <SkeletonLoading height={16} width="40%" borderRadius={4} style={{ marginTop: 4 }} />
      <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
        <SkeletonLoading height={32} width={80} borderRadius={16} />
        <SkeletonLoading height={32} width={80} borderRadius={16} />
      </View>
    </View>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </>
  );
};

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoading
          key={index}
          height={16}
          width={index === lines - 1 ? '60%' : '100%'}
          borderRadius={4}
          style={{ marginBottom: 8 }}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
});
