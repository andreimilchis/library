import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export default function GlowButton({
  title,
  onPress,
  color = colors.hologramPrimary,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}: GlowButtonProps) {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    sizeStyles[size],
    variant === 'primary' && { backgroundColor: color, shadowColor: color },
    variant === 'outline' && { borderWidth: 1.5, borderColor: color, backgroundColor: 'transparent' },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    disabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    textSizeStyles[size],
    variant === 'outline' && { color },
    variant === 'ghost' && { color: colors.textSecondary },
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  text: {
    color: colors.text,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.4,
  },
});

const sizeStyles = StyleSheet.create({
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  large: {
    paddingVertical: spacing.lg - 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
});

const textSizeStyles = StyleSheet.create({
  small: { fontSize: fontSize.sm },
  medium: { fontSize: fontSize.md },
  large: { fontSize: fontSize.lg },
});
