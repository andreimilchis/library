import { Industry, EnglishLevel, BusinessGoal, PainPoint } from '../types';

export interface OnboardingOption<T> {
  value: T;
  label: string;
  description: string;
  emoji: string;
}

export const industries: OnboardingOption<Industry>[] = [
  { value: 'technology', label: 'Technology', description: 'Software, SaaS, AI, Hardware', emoji: '💻' },
  { value: 'finance', label: 'Finance & Banking', description: 'Banking, Investment, Insurance', emoji: '💰' },
  { value: 'manufacturing', label: 'Manufacturing', description: 'Production, Assembly, Industrial', emoji: '🏭' },
  { value: 'retail', label: 'Retail & E-Commerce', description: 'Online & offline retail', emoji: '🛍️' },
  { value: 'consulting', label: 'Consulting', description: 'Management, Strategy, Advisory', emoji: '📊' },
  { value: 'healthcare', label: 'Healthcare', description: 'Medical, Pharma, BioTech', emoji: '🏥' },
  { value: 'real_estate', label: 'Real Estate', description: 'Commercial & residential', emoji: '🏢' },
  { value: 'logistics', label: 'Logistics & Supply Chain', description: 'Transport, Warehousing', emoji: '🚚' },
  { value: 'other', label: 'Other', description: 'A different industry', emoji: '🌐' },
];

export const englishLevels: OnboardingOption<EnglishLevel>[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'I can understand basic English but struggle in business conversations',
    emoji: '🌱',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'I can have general conversations but lack business-specific confidence',
    emoji: '📈',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'I speak well but want to sound more authoritative and persuasive',
    emoji: '🎯',
  },
];

export const businessGoals: OnboardingOption<BusinessGoal>[] = [
  {
    value: 'negotiate_deals',
    label: 'Negotiate Deals',
    description: 'Close better deals with confidence',
    emoji: '🤝',
  },
  {
    value: 'persuade_clients',
    label: 'Persuade Clients',
    description: 'Win clients with compelling arguments',
    emoji: '🎯',
  },
  {
    value: 'manage_suppliers',
    label: 'Manage Suppliers',
    description: 'Get better terms from suppliers',
    emoji: '📦',
  },
  {
    value: 'build_partnerships',
    label: 'Build Partnerships',
    description: 'Create strong business alliances',
    emoji: '🌐',
  },
  {
    value: 'lead_meetings',
    label: 'Lead Meetings',
    description: 'Run meetings with authority',
    emoji: '👔',
  },
  {
    value: 'present_proposals',
    label: 'Present Proposals',
    description: 'Deliver winning presentations',
    emoji: '📋',
  },
];

export const painPoints: OnboardingOption<PainPoint>[] = [
  {
    value: 'lack_confidence',
    label: 'Lack of Confidence',
    description: "I know what to say but I'm afraid to say it",
    emoji: '😰',
  },
  {
    value: 'poor_vocabulary',
    label: 'Limited Vocabulary',
    description: "I don't know the right business words",
    emoji: '📚',
  },
  {
    value: 'cant_negotiate',
    label: "Can't Negotiate Well",
    description: 'I always give in during negotiations',
    emoji: '💸',
  },
  {
    value: 'fear_of_mistakes',
    label: 'Fear of Making Mistakes',
    description: "I'm afraid of sounding unprofessional",
    emoji: '😓',
  },
  {
    value: 'cant_be_assertive',
    label: "Can't Be Assertive",
    description: "I sound weak when I should sound strong",
    emoji: '🔇',
  },
  {
    value: 'misunderstandings',
    label: 'Frequent Misunderstandings',
    description: 'People often misunderstand what I mean',
    emoji: '🔄',
  },
];
