// ==========================================
// BusinessEnglish Pro - Type Definitions
// ==========================================

export type Industry =
  | 'technology'
  | 'finance'
  | 'manufacturing'
  | 'retail'
  | 'consulting'
  | 'healthcare'
  | 'real_estate'
  | 'logistics'
  | 'other';

export type EnglishLevel = 'beginner' | 'intermediate' | 'advanced';

export type BusinessGoal =
  | 'negotiate_deals'
  | 'persuade_clients'
  | 'manage_suppliers'
  | 'build_partnerships'
  | 'lead_meetings'
  | 'present_proposals';

export type PainPoint =
  | 'lack_confidence'
  | 'poor_vocabulary'
  | 'cant_negotiate'
  | 'fear_of_mistakes'
  | 'cant_be_assertive'
  | 'misunderstandings';

export interface UserProfile {
  name: string;
  industry: Industry;
  level: EnglishLevel;
  goals: BusinessGoal[];
  painPoints: PainPoint[];
  role: string; // e.g. "CEO", "Procurement Manager"
  yearsInBusiness: number;
  onboardingCompleted: boolean;
}

export type HologramType = 'coach' | 'client' | 'supplier' | 'partner';

export interface HologramPersona {
  id: HologramType;
  name: string;
  title: string;
  description: string;
  avatar: string; // emoji for now
  color: string;
  glowColor: string;
  difficulty: 'guided' | 'moderate' | 'challenging';
  scenarios: ConversationScenario[];
}

export interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  objectives: string[];
  keyPhrases: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  hologramType: HologramType;
}

export interface Message {
  id: string;
  role: 'user' | 'hologram' | 'system';
  content: string;
  timestamp: number;
  feedback?: MessageFeedback;
}

export interface MessageFeedback {
  type: 'correction' | 'suggestion' | 'praise';
  original?: string;
  improved?: string;
  explanation: string;
}

export interface ConversationSession {
  id: string;
  hologramType: HologramType;
  scenarioId: string;
  messages: Message[];
  startedAt: number;
  score?: SessionScore;
}

export interface SessionScore {
  confidence: number; // 0-100
  vocabulary: number;
  persuasion: number;
  clarity: number;
  overallGrade: 'A' | 'B' | 'C' | 'D';
  feedback: string;
  improvements: string[];
}

export type RootStackParamList = {
  Onboarding: undefined;
  OnboardingName: undefined;
  OnboardingIndustry: undefined;
  OnboardingLevel: undefined;
  OnboardingGoals: undefined;
  OnboardingPainPoints: undefined;
  OnboardingComplete: undefined;
  Main: undefined;
  Dashboard: undefined;
  HologramSelect: undefined;
  Conversation: { hologramType: HologramType; scenarioId: string };
  SessionResults: { sessionId: string };
  Profile: undefined;
  Progress: undefined;
};
