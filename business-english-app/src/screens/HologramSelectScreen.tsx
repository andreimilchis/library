import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';
import { useUser } from '../context/UserContext';
import { hologramPersonas, scenarios } from '../data/holograms';
import { HologramType, ConversationScenario } from '../types';
import HologramAvatar from '../components/HologramAvatar';

export default function HologramSelectScreen({ navigation, route }: any) {
  const { profile } = useUser();
  const hologramType: HologramType = route?.params?.hologramType || 'coach';
  const persona = hologramPersonas.find((p) => p.id === hologramType)!;
  const hologramScenarios = scenarios.filter((s) => s.hologramType === hologramType);

  function getDifficultyStars(level: number) {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  }

  function getPersonalizedContext(scenario: ConversationScenario) {
    if (profile?.industry) {
      return `Adapted for ${profile.industry.replace('_', ' ')} industry`;
    }
    return scenario.context.slice(0, 60) + '...';
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero section */}
        <View style={[styles.hero, { borderBottomColor: persona.color + '20' }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.avatarSection}>
            <HologramAvatar
              emoji={persona.avatar}
              color={persona.color}
              glowColor={persona.glowColor}
              size="large"
              isActive
            />
          </View>

          <Text style={styles.personaName}>{persona.name}</Text>
          <Text style={[styles.personaTitle, { color: persona.color }]}>
            {persona.title}
          </Text>
          <Text style={styles.personaDesc}>{persona.description}</Text>
        </View>

        {/* Scenarios */}
        <View style={styles.scenariosSection}>
          <Text style={styles.sectionTitle}>Choose a Scenario</Text>
          <Text style={styles.sectionSubtitle}>
            Each scenario is tailored to your profile as a {profile?.role || 'professional'} in{' '}
            {profile?.industry?.replace('_', ' ') || 'your industry'}
          </Text>

          {hologramScenarios.map((scenario) => (
            <TouchableOpacity
              key={scenario.id}
              style={[styles.scenarioCard, { borderColor: persona.color + '20' }]}
              onPress={() =>
                navigation.navigate('Conversation', {
                  hologramType: persona.id,
                  scenarioId: scenario.id,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                <Text style={[styles.difficulty, { color: persona.color }]}>
                  {getDifficultyStars(scenario.difficulty)}
                </Text>
              </View>
              <Text style={styles.scenarioDesc}>{scenario.description}</Text>
              <Text style={[styles.scenarioContext, { color: persona.color }]}>
                {getPersonalizedContext(scenario)}
              </Text>

              {/* Objectives preview */}
              <View style={styles.objectivesPreview}>
                {scenario.objectives.slice(0, 2).map((obj, i) => (
                  <Text key={i} style={styles.objectiveItem}>
                    ◇ {obj}
                  </Text>
                ))}
              </View>

              <View
                style={[styles.startIndicator, { backgroundColor: persona.color + '15' }]}
              >
                <Text style={[styles.startText, { color: persona.color }]}>
                  Start Conversation →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  avatarSection: {
    marginBottom: spacing.lg,
  },
  personaName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  personaTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  personaDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scenariosSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  scenarioCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scenarioTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  difficulty: {
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
  scenarioDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  scenarioContext: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  objectivesPreview: {
    marginBottom: spacing.md,
  },
  objectiveItem: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },
  startIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  startText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
