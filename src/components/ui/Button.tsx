import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, style, textStyle, icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? '#1a365d' : '#ffffff'} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`${variant}Text`], styles[`size_${size}Text`], textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, gap: 8,
  },
  primary: { backgroundColor: '#1a365d' },
  secondary: { backgroundColor: '#c4a35a' },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#1a365d' },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: '#ef4444' },
  disabled: { opacity: 0.5 },
  size_sm: { paddingVertical: 8, paddingHorizontal: 16 },
  size_md: { paddingVertical: 14, paddingHorizontal: 20 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 24 },
  text: { fontWeight: '600' },
  primaryText: { color: '#ffffff' },
  secondaryText: { color: '#ffffff' },
  outlineText: { color: '#1a365d' },
  ghostText: { color: '#1a365d' },
  dangerText: { color: '#ffffff' },
  size_smText: { fontSize: 14 },
  size_mdText: { fontSize: 16 },
  size_lgText: { fontSize: 18 },
} as any);
