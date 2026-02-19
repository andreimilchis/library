import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../utils/theme';
import { useUser } from '../../context/UserContext';
import { painPoints } from '../../data/onboarding';
import { PainPoint } from '../../types';
import OptionCard from '../../components/OptionCard';
import GlowButton from '../../components/GlowButton';

export default function PainPointsScreen({ navigation }: any) {
  const { updateProfile } = useUser();
  const [selected, setSelected] = useState<PainPoint[]>([]);

  function togglePain(pain: PainPoint) {
    setSelected((prev) =>
      prev.includes(pain) ? prev.filter((p) => p !== pain) : [...prev, pain]
    );
  }

  async function handleNext() {
    if (selected.length > 0) {
      await updateProfile({ painPoints: selected });
      navigation.navigate('OnboardingComplete');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepActive]} />
        </View>
        <Text style={styles.title}>Your challenges</Text>
        <Text style={styles.subtitle}>
          What holds you back the most when speaking English in business situations?
          Be honest — this is where the real transformation starts.
        </Text>
        <Text style={styles.hint}>Select all that apply</Text>
      </View>

      <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
        {painPoints.map((pain) => (
          <OptionCard
            key={pain.value}
            emoji={pain.emoji}
            label={pain.label}
            description={pain.description}
            selected={selected.includes(pain.value)}
            onPress={() => togglePain(pain.value)}
            color={colors.error}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <GlowButton
          title={`Continue${selected.length > 0 ? ` (${selected.length} selected)` : ''}`}
          onPress={handleNext}
          disabled={selected.length === 0}
          size="large"
          color={colors.supplier}
          style={{ alignSelf: 'stretch' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: spacing.md,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xl,
  },
  stepDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
  },
  stepActive: {
    backgroundColor: colors.hologramPrimary,
  },
  stepDone: {
    backgroundColor: colors.success,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  options: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
});
