import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../utils/theme';
import { useUser } from '../../context/UserContext';
import GlowButton from '../../components/GlowButton';

export default function NameScreen({ navigation }: any) {
  const { updateProfile } = useUser();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const canProceed = name.trim().length >= 2 && role.trim().length >= 2;

  async function handleNext() {
    await updateProfile({ name: name.trim(), role: role.trim() });
    navigation.navigate('OnboardingIndustry');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>

        <Text style={styles.title}>Let's make this{'\n'}yours.</Text>
        <Text style={styles.subtitle}>
          This app will be built around YOU — your name, your role, your challenges.
          Nothing generic. Everything personal.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>What's your name?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Andrei"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>What's your role?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. CEO, Procurement Manager, Sales Director"
            placeholderTextColor={colors.textMuted}
            value={role}
            onChangeText={setRole}
          />
        </View>

        <View style={styles.footer}>
          <GlowButton
            title="Continue"
            onPress={handleNext}
            disabled={!canProceed}
            size="large"
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.hologramSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.lg,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xxl,
  },
});
