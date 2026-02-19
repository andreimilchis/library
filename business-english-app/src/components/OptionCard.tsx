import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';

interface OptionCardProps {
  emoji: string;
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export default function OptionCard({
  emoji,
  label,
  description,
  selected,
  onPress,
  color = colors.hologramPrimary,
}: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && {
          borderColor: color,
          backgroundColor: color + '15',
          shadowColor: color,
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 5,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.content}>
        <Text style={[styles.label, selected && { color }]}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {selected && (
        <View style={[styles.checkmark, { backgroundColor: color }]}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  checkmarkText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
