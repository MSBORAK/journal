import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  autoFocus?: boolean;
}

export default function OtpInput({ length = 6, onComplete, autoFocus = true }: OtpInputProps) {
  const { currentTheme } = useTheme();
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    // Sadece rakam kabul et
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length > 1) {
      // Birden fazla karakter girildiyse (paste durumu)
      const digits = numericText.slice(0, length).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Son input'a focus yap
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      // Eğer tüm alanlar doldurulduysa onComplete çağır
      if (newOtp.every(digit => digit !== '')) {
        onComplete(newOtp.join(''));
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = numericText;
    setOtp(newOtp);

    // Otomatik olarak bir sonraki input'a geç
    if (numericText && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Tüm alanlar doldurulduysa onComplete çağır
    if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Backspace tuşuna basıldığında
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Focus olduğunda tüm metni seç
    inputRefs.current[index]?.setNativeProps({ selection: { start: 0, end: 1 } });
  };

  const clearOtp = () => {
    setOtp(Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      marginVertical: 20,
    },
    input: {
      width: 50,
      height: 60,
      borderWidth: 2,
      borderColor: currentTheme.colors.border,
      borderRadius: 12,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: currentTheme.colors.card,
      color: currentTheme.colors.text,
    },
    inputFocused: {
      borderColor: currentTheme.colors.primary,
      backgroundColor: currentTheme.colors.primary + '10',
    },
    clearButton: {
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: currentTheme.colors.primary + '20',
    },
    clearButtonText: {
      color: currentTheme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View>
      <View style={dynamicStyles.container}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              dynamicStyles.input,
              digit && dynamicStyles.inputFocused,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            autoFocus={index === 0 && autoFocus}
          />
        ))}
      </View>
      <TouchableOpacity
        style={dynamicStyles.clearButton}
        onPress={clearOtp}
        activeOpacity={0.7}
      >
        <Text style={dynamicStyles.clearButtonText}>Temizle</Text>
      </TouchableOpacity>
    </View>
  );
}

