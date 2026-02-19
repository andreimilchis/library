import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { colors, spacing, fontSize } from '../../utils/theme';
import { useUser } from '../../context/UserContext';
import GlowButton from '../../components/GlowButton';
import HologramAvatar from '../../components/HologramAvatar';

const { width } = Dimensions.get('window');

export default function CompleteScreen({ navigation }: any) {
  const { profile, completeOnboarding } = useUser();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function handleStart() {
    await completeOnboarding();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }

  const goalCount = profile?.goals?.length || 0;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <HologramAvatar
          emoji="👩‍💼"
          color={colors.hologramPrimary}
          glowColor={colors.coachGlow}
          size="large"
          isActive
        />

        <Text style={styles.title}>
          Welcome, {profile?.name || 'there'}.
        </Text>
        <Text style={styles.subtitle}>Your personal training program is ready.</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>YOUR PROFILE</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Role</Text>
            <Text style={styles.summaryValue}>{profile?.role}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Industry</Text>
            <Text style={styles.summaryValue}>
              {profile?.industry?.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Level</Text>
            <Text style={styles.summaryValue}>{profile?.level}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Goals</Text>
            <Text style={styles.summaryValue}>{goalCount} areas of focus</Text>
          </View>
        </View>

        <View style={styles.readySection}>
          <Text style={styles.readyText}>
            Your AI holograms are calibrated and ready.{'\n'}
            Time to become the English speaker{'\n'}
            your business needs you to be.
          </Text>
        </View>

        <GlowButton
          title="Meet Your Holograms"
          onPress={handleStart}
          size="large"
          style={{ width: width - 64 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontSize: fontSize.xs,
    color: colors.hologramPrimary,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  readySection: {
    marginBottom: spacing.xl,
  },
  readyText: {
    fontSize: fontSize.sm,
    color: colors.hologramSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
