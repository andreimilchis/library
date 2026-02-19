import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';
import { useUser } from '../context/UserContext';
import { hologramPersonas } from '../data/holograms';
import HologramAvatar from '../components/HologramAvatar';
import GlowButton from '../components/GlowButton';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 64;

export default function DashboardScreen({ navigation }: any) {
  const { profile, sessions } = useUser();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const totalSessions = sessions.length;
  const greeting = getGreeting();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  function getPersonalMessage() {
    if (totalSessions === 0) {
      return "Ready for your first conversation? Start with your Coach — she'll prepare you for anything.";
    }
    if (totalSessions < 5) {
      return "You're building momentum. Keep practicing — consistency is what separates good from great.";
    }
    return "You're making real progress. Time to challenge yourself with harder scenarios.";
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.name}>{profile?.name || 'there'}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileEmoji}>
                {profile?.role === 'CEO' ? '👔' : '💼'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Personal message */}
          <View style={styles.messageCard}>
            <View style={styles.messageIcon}>
              <Text style={styles.messageIconText}>◆</Text>
            </View>
            <Text style={styles.messageText}>{getPersonalMessage()}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={[styles.statCard, { borderColor: colors.hologramSecondary + '30' }]}>
              <Text style={[styles.statNumber, { color: colors.hologramSecondary }]}>
                {profile?.level === 'beginner' ? 'B1' : profile?.level === 'intermediate' ? 'B2' : 'C1'}
              </Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={[styles.statCard, { borderColor: colors.hologramAccent + '30' }]}>
              <Text style={[styles.statNumber, { color: colors.hologramAccent }]}>
                {profile?.goals?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
          </View>

          {/* Hologram Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Holograms</Text>
            <Text style={styles.sectionSubtitle}>
              Choose who you want to practice with
            </Text>
          </View>

          {/* Hologram Cards */}
          {hologramPersonas.map((persona) => (
            <TouchableOpacity
              key={persona.id}
              style={[styles.hologramCard, { borderColor: persona.color + '30' }]}
              onPress={() =>
                navigation.navigate('HologramSelect', { hologramType: persona.id })
              }
              activeOpacity={0.8}
            >
              <View style={styles.hologramCardContent}>
                <HologramAvatar
                  emoji={persona.avatar}
                  color={persona.color}
                  glowColor={persona.glowColor}
                  size="medium"
                  isActive
                />
                <View style={styles.hologramInfo}>
                  <Text style={styles.hologramName}>{persona.name}</Text>
                  <Text style={[styles.hologramTitle, { color: persona.color }]}>
                    {persona.title}
                  </Text>
                  <Text style={styles.hologramDesc} numberOfLines={2}>
                    {persona.description}
                  </Text>
                  <View style={styles.hologramMeta}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        { backgroundColor: persona.color + '20' },
                      ]}
                    >
                      <Text style={[styles.difficultyText, { color: persona.color }]}>
                        {persona.difficulty}
                      </Text>
                    </View>
                    <Text style={styles.scenarioCount}>
                      {persona.scenarios.length} scenarios
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Quick action */}
          <View style={styles.quickAction}>
            <GlowButton
              title="Start Quick Session with Coach"
              onPress={() =>
                navigation.navigate('Conversation', {
                  hologramType: 'coach',
                  scenarioId: 'coach-intro',
                })
              }
              size="large"
              style={{ width: CARD_WIDTH }}
            />
          </View>

          <View style={{ height: 100 }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 70,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 24,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.hologramPrimary + '10',
    borderWidth: 1,
    borderColor: colors.hologramPrimary + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  messageIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  messageIconText: {
    color: colors.hologramPrimary,
    fontSize: 12,
  },
  messageText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hologramPrimary + '30',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.hologramPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
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
  },
  hologramCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  hologramCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hologramInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  hologramName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  hologramTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  hologramDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hologramMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  difficultyText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  scenarioCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  quickAction: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
});
