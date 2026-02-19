import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';
import { useUser } from '../context/UserContext';
import { hologramPersonas } from '../data/holograms';
import GlowButton from '../components/GlowButton';
import HologramAvatar from '../components/HologramAvatar';

const { width } = Dimensions.get('window');

export default function SessionResultsScreen({ navigation, route }: any) {
  const { sessions, profile } = useUser();
  const sessionId = route?.params?.sessionId;
  const session = sessions.find((s) => s.id === sessionId) || sessions[sessions.length - 1];
  const persona = hologramPersonas.find((p) => p.id === session?.hologramType);
  const score = session?.score;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!session || !score || !persona) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  function getGradeColor(grade: string) {
    switch (grade) {
      case 'A': return colors.success;
      case 'B': return colors.hologramSecondary;
      case 'C': return colors.warning;
      default: return colors.error;
    }
  }

  function renderScoreBar(label: string, value: number, color: string) {
    return (
      <View style={styles.scoreRow} key={label}>
        <View style={styles.scoreLabel}>
          <Text style={styles.scoreLabelText}>{label}</Text>
          <Text style={[styles.scoreValue, { color }]}>{value}%</Text>
        </View>
        <View style={styles.scoreBarBg}>
          <Animated.View
            style={[
              styles.scoreBarFill,
              {
                width: `${value}%`,
                backgroundColor: color,
                opacity: fadeAnim,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  const messageCount = session.messages.filter((m) => m.role === 'user').length;
  const gradeColor = getGradeColor(score.overallGrade);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View style={styles.header}>
            <Text style={styles.headerLabel}>SESSION COMPLETE</Text>

            <View style={styles.gradeCircle}>
              <Text style={[styles.gradeText, { color: gradeColor }]}>
                {score.overallGrade}
              </Text>
            </View>

            <Text style={styles.feedbackMain}>{score.feedback}</Text>

            <View style={styles.sessionMeta}>
              <HologramAvatar
                emoji={persona.avatar}
                color={persona.color}
                glowColor={persona.glowColor}
                size="small"
              />
              <View style={styles.sessionMetaInfo}>
                <Text style={styles.sessionMetaName}>
                  Session with {persona.name}
                </Text>
                <Text style={styles.sessionMetaDetail}>
                  {messageCount} exchanges
                </Text>
              </View>
            </View>
          </View>

          {/* Score breakdown */}
          <View style={styles.scoresSection}>
            <Text style={styles.sectionTitle}>Performance Breakdown</Text>
            {renderScoreBar('Confidence', score.confidence, colors.hologramPrimary)}
            {renderScoreBar('Vocabulary', score.vocabulary, colors.hologramSecondary)}
            {renderScoreBar('Persuasion', score.persuasion, colors.hologramAccent)}
            {renderScoreBar('Clarity', score.clarity, persona.color)}
          </View>

          {/* Improvements */}
          <View style={styles.improvementsSection}>
            <Text style={styles.sectionTitle}>Areas to Improve</Text>
            {score.improvements.map((improvement, i) => (
              <View key={i} style={styles.improvementItem}>
                <Text style={styles.improvementNumber}>{i + 1}</Text>
                <Text style={styles.improvementText}>{improvement}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <GlowButton
              title="Practice Again"
              onPress={() => {
                navigation.replace('Conversation', {
                  hologramType: session.hologramType,
                  scenarioId: session.scenarioId,
                });
              }}
              size="large"
              color={persona.color}
              style={{ width: width - 64, marginBottom: spacing.md }}
            />
            <GlowButton
              title="Back to Dashboard"
              onPress={() => navigation.navigate('Dashboard')}
              size="large"
              variant="outline"
              color={colors.textSecondary}
              style={{ width: width - 64 }}
            />
          </View>

          <View style={{ height: 80 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: spacing.lg,
  },
  gradeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  gradeText: {
    fontSize: 48,
    fontWeight: '800',
  },
  feedbackMain: {
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.xl,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sessionMetaInfo: {
    marginLeft: spacing.md,
  },
  sessionMetaName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  sessionMetaDetail: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  scoresSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  scoreRow: {
    marginBottom: spacing.md,
  },
  scoreLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  scoreLabelText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  scoreValue: {
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  scoreBarBg: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  improvementsSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  improvementNumber: {
    color: colors.hologramPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginRight: spacing.md,
    width: 24,
  },
  improvementText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
    flex: 1,
  },
  actions: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
});
