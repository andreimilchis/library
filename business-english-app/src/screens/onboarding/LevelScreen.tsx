import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../utils/theme';
import { useUser } from '../../context/UserContext';
import { englishLevels } from '../../data/onboarding';
import { EnglishLevel } from '../../types';
import OptionCard from '../../components/OptionCard';
import GlowButton from '../../components/GlowButton';

export default function LevelScreen({ navigation }: any) {
  const { updateProfile } = useUser();
  const [selected, setSelected] = useState<EnglishLevel | null>(null);

  async function handleNext() {
    if (selected) {
      await updateProfile({ level: selected });
      navigation.navigate('OnboardingGoals');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>
        <Text style={styles.title}>Your English level</Text>
        <Text style={styles.subtitle}>
          Be honest — we'll meet you exactly where you are and push you forward from there.
        </Text>
      </View>

      <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
        {englishLevels.map((level) => (
          <OptionCard
            key={level.value}
            emoji={level.emoji}
            label={level.label}
            description={level.description}
            selected={selected === level.value}
            onPress={() => setSelected(level.value)}
            color={colors.hologramSecondary}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <GlowButton
          title="Continue"
          onPress={handleNext}
          disabled={!selected}
          size="large"
          color={colors.hologramSecondary}
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
