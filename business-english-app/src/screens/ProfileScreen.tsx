import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';
import { useUser } from '../context/UserContext';
import { hologramPersonas } from '../data/holograms';
import HologramAvatar from '../components/HologramAvatar';
import GlowButton from '../components/GlowButton';

export default function ProfileScreen({ navigation }: any) {
  const { profile, sessions, resetProfile } = useUser();

  const sessionsByType = hologramPersonas.map((persona) => ({
    persona,
    count: sessions.filter((s) => s.hologramType === persona.id).length,
  }));

  function handleReset() {
    Alert.alert(
      'Reset Profile',
      'This will delete all your data and start fresh. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetProfile();
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>
            Everything here shapes your experience
          </Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {profile?.name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.name}</Text>
          <Text style={styles.profileRole}>{profile?.role}</Text>
          <View style={styles.profileTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {profile?.industry?.replace('_', ' ')}
              </Text>
            </View>
            <View style={[styles.tag, { borderColor: colors.hologramSecondary + '40' }]}>
              <Text style={[styles.tagText, { color: colors.hologramSecondary }]}>
                {profile?.level}
              </Text>
            </View>
          </View>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          {profile?.goals?.map((goal) => (
            <View key={goal} style={styles.goalItem}>
              <Text style={styles.goalDot}>◆</Text>
              <Text style={styles.goalText}>
                {goal.replace(/_/g, ' ')}
              </Text>
            </View>
          ))}
        </View>

        {/* Pain points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenges We're Addressing</Text>
          {profile?.painPoints?.map((pain) => (
            <View key={pain} style={styles.goalItem}>
              <Text style={[styles.goalDot, { color: colors.error }]}>◇</Text>
              <Text style={styles.goalText}>
                {pain.replace(/_/g, ' ')}
              </Text>
            </View>
          ))}
        </View>

        {/* Session history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session History</Text>
          {sessionsByType.map(({ persona, count }) => (
            <View key={persona.id} style={styles.historyRow}>
              <HologramAvatar
                emoji={persona.avatar}
                color={persona.color}
                glowColor={persona.glowColor}
                size="small"
              />
              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>{persona.name}</Text>
                <Text style={styles.historyCount}>
                  {count} {count === 1 ? 'session' : 'sessions'}
                </Text>
              </View>
            </View>
          ))}
          {sessions.length === 0 && (
            <Text style={styles.emptyText}>No sessions yet. Start your first conversation!</Text>
          )}
        </View>

        {/* Reset */}
        <View style={styles.section}>
          <GlowButton
            title="Reset Profile & Start Over"
            onPress={handleReset}
            variant="outline"
            color={colors.error}
            style={{ alignSelf: 'stretch' }}
          />
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  backBtn: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.xl,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.hologramPrimary + '20',
    borderWidth: 2,
    borderColor: colors.hologramPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.hologramPrimary,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  profileRole: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  profileTags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.hologramPrimary + '40',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.hologramPrimary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalDot: {
    color: colors.hologramPrimary,
    fontSize: 12,
    marginRight: spacing.sm,
  },
  goalText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textTransform: 'capitalize',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  historyInfo: {
    marginLeft: spacing.md,
  },
  historyName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  historyCount: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
  },
});
