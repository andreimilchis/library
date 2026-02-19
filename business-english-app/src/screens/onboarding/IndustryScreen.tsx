import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../../utils/theme';
import { useUser } from '../../context/UserContext';
import { industries } from '../../data/onboarding';
import { Industry } from '../../types';
import OptionCard from '../../components/OptionCard';
import GlowButton from '../../components/GlowButton';

export default function IndustryScreen({ navigation }: any) {
  const { updateProfile } = useUser();
  const [selected, setSelected] = useState<Industry | null>(null);

  async function handleNext() {
    if (selected) {
      await updateProfile({ industry: selected });
      navigation.navigate('OnboardingLevel');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDone]} />
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>
        <Text style={styles.title}>Your industry</Text>
        <Text style={styles.subtitle}>
          We'll customize all conversations, vocabulary, and scenarios to your specific industry.
        </Text>
      </View>

      <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
        {industries.map((industry) => (
          <OptionCard
            key={industry.value}
            emoji={industry.emoji}
            label={industry.label}
            description={industry.description}
            selected={selected === industry.value}
            onPress={() => setSelected(industry.value)}
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
