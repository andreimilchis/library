import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { useUser } from '../context/UserContext';
import { colors } from '../utils/theme';

// Onboarding screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NameScreen from '../screens/onboarding/NameScreen';
import IndustryScreen from '../screens/onboarding/IndustryScreen';
import LevelScreen from '../screens/onboarding/LevelScreen';
import GoalsScreen from '../screens/onboarding/GoalsScreen';
import PainPointsScreen from '../screens/onboarding/PainPointsScreen';
import CompleteScreen from '../screens/onboarding/CompleteScreen';

// Main screens
import DashboardScreen from '../screens/DashboardScreen';
import HologramSelectScreen from '../screens/HologramSelectScreen';
import ConversationScreen from '../screens/ConversationScreen';
import SessionResultsScreen from '../screens/SessionResultsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { profile, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.hologramPrimary} />
      </View>
    );
  }

  const isOnboarded = profile?.onboardingCompleted;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
          ...TransitionPresets.SlideFromRightIOS,
        }}
      >
        {!isOnboarded ? (
          // Onboarding flow
          <>
            <Stack.Screen name="Onboarding" component={WelcomeScreen} />
            <Stack.Screen name="OnboardingName" component={NameScreen} />
            <Stack.Screen name="OnboardingIndustry" component={IndustryScreen} />
            <Stack.Screen name="OnboardingLevel" component={LevelScreen} />
            <Stack.Screen name="OnboardingGoals" component={GoalsScreen} />
            <Stack.Screen name="OnboardingPainPoints" component={PainPointsScreen} />
            <Stack.Screen
              name="OnboardingComplete"
              component={CompleteScreen}
              options={{ gestureEnabled: false }}
            />
          </>
        ) : (
          // Main app
          <>
            <Stack.Screen name="Main" component={DashboardScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="HologramSelect" component={HologramSelectScreen} />
            <Stack.Screen
              name="Conversation"
              component={ConversationScreen}
              options={{
                gestureEnabled: false,
                ...TransitionPresets.ModalSlideFromBottomIOS,
              }}
            />
            <Stack.Screen
              name="SessionResults"
              component={SessionResultsScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
