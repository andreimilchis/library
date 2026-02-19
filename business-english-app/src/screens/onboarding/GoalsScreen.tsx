import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../utils/theme';
import { useUser } from '../../context/UserContext';
import { businessGoals } from '../../data/onboarding';
import { BusinessGoal } from '../../types';
import OptionCard from '../../components/OptionCard';
import GlowButton from '../../components/GlowButton';

export default function GoalsScreen({ navigation }: any) {
  const { updateProfile } = useUser();
  const [selected, setSelected] = useState<BusinessGoal[]>([]);

  function toggleGoal(goal: BusinessGoal) {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  async function handleNext() {
    if (selected.length > 0) {
      await updateProfile({ goals: selected });
      navigation.navigate('OnboardingPainPoints');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
        </View>
        <Text style={styles.title}>Your goals</Text>
        <Text style={styles.subtitle}>
          What do you want to achieve? Select all that apply — we'll prioritize your training around these.
        </Text>
        <Text style={styles.hint}>Select at least one</Text>
      </View>

      <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
        {businessGoals.map((goal) => (
          <OptionCard
            key={goal.value}
            emoji={goal.emoji}
            label={goal.label}
            description={goal.description}
            selected={selected.includes(goal.value)}
            onPress={() => toggleGoal(goal.value)}
            color={colors.hologramAccent}
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
          color={colors.hologramAccent}
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
    color: colors.hologramAccent,
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
