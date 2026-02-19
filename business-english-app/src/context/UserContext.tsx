import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  Industry,
  EnglishLevel,
  BusinessGoal,
  PainPoint,
  ConversationSession,
} from '../types';

const STORAGE_KEY = '@businessenglish_profile';
const SESSIONS_KEY = '@businessenglish_sessions';

interface UserContextType {
  profile: UserProfile | null;
  sessions: ConversationSession[];
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addSession: (session: ConversationSession) => Promise<void>;
  resetProfile: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: '',
  industry: 'technology',
  level: 'intermediate',
  goals: [],
  painPoints: [],
  role: '',
  yearsInBusiness: 0,
  onboardingCompleted: false,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
      const storedSessions = await AsyncStorage.getItem(SESSIONS_KEY);
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }
    } catch {
      // First launch
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    const updated = { ...(profile || defaultProfile), ...updates };
    setProfile(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async function completeOnboarding() {
    await updateProfile({ onboardingCompleted: true });
  }

  async function addSession(session: ConversationSession) {
    const updated = [...sessions, session];
    setSessions(updated);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  }

  async function resetProfile() {
    setProfile(null);
    setSessions([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(SESSIONS_KEY);
  }

  return (
    <UserContext.Provider
      value={{ profile, sessions, isLoading, updateProfile, completeOnboarding, addSession, resetProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
