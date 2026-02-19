import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { colors, spacing, fontSize } from '../../utils/theme';
import GlowButton from '../../components/GlowButton';
import HologramAvatar from '../../components/HologramAvatar';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Grid lines background effect */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              { top: `${(i + 1) * 12}%`, width: '100%', height: 1 },
            ]}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              { left: `${(i + 1) * 16}%`, height: '100%', width: 1 },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.avatarSection}>
          <HologramAvatar
            emoji="🎯"
            color={colors.hologramPrimary}
            glowColor={colors.coachGlow}
            size="hero"
            isActive
          />
        </View>

        <Text style={styles.title}>BusinessEnglish{'\n'}Pro</Text>
        <Text style={styles.subtitle}>
          Your personal AI hologram coach for mastering business English
        </Text>

        <View style={styles.features}>
          <Text style={styles.featureItem}>◆ Face-to-face conversations with AI holograms</Text>
          <Text style={styles.featureItem}>◆ Negotiate, persuade, and lead with confidence</Text>
          <Text style={styles.featureItem}>◆ Personalized to YOUR business and goals</Text>
        </View>

        <View style={styles.buttonSection}>
          <GlowButton
            title="Start My Journey"
            onPress={() => navigation.navigate('OnboardingName')}
            size="large"
            style={{ width: width - 64 }}
          />
          <Text style={styles.footerText}>
            Tailored exclusively for business professionals
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: colors.hologramPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  avatarSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  featureItem: {
    color: colors.hologramSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  buttonSection: {
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
  },
});
