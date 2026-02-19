import { HologramPersona, ConversationScenario } from '../types';

export const hologramPersonas: HologramPersona[] = [
  {
    id: 'coach',
    name: 'Alexandra',
    title: 'Your Business English Coach',
    description:
      'Alexandra is your personal coach. She teaches you the right phrases, corrects your mistakes in real-time, and builds your confidence step by step. She knows your weak points and pushes you to improve.',
    avatar: '👩‍💼',
    color: '#6C5CE7',
    glowColor: '#a29bfe',
    difficulty: 'guided',
    scenarios: [],
  },
  {
    id: 'client',
    name: 'James Morrison',
    title: 'Demanding Client — TechVentures Inc.',
    description:
      'James is a tough, results-driven client. He expects clear proposals, strong arguments, and wants to know exactly why he should work with you. Convince him you are the right choice.',
    avatar: '👨‍💻',
    color: '#00B894',
    glowColor: '#55efc4',
    difficulty: 'challenging',
    scenarios: [],
  },
  {
    id: 'supplier',
    name: 'Maria Chen',
    title: 'Senior Account Manager — GlobalSupply Co.',
    description:
      'Maria is experienced and firm on pricing. She will push back on discounts and delivery timelines. You need to negotiate the best terms for your company without damaging the relationship.',
    avatar: '👩‍🏭',
    color: '#E17055',
    glowColor: '#fab1a0',
    difficulty: 'moderate',
    scenarios: [],
  },
  {
    id: 'partner',
    name: 'David Blackwell',
    title: 'Potential Partner — Horizon Ventures',
    description:
      'David is evaluating whether a partnership with you makes sense. He is analytical and cautious. You need to present a compelling vision, align interests, and build trust.',
    avatar: '🤝',
    color: '#0984E3',
    glowColor: '#74b9ff',
    difficulty: 'challenging',
    scenarios: [],
  },
];

export const scenarios: ConversationScenario[] = [
  // Coach scenarios
  {
    id: 'coach-intro',
    title: 'First Meeting Mastery',
    description: 'Learn how to introduce yourself powerfully in a business setting.',
    context:
      'You are meeting a potential business contact for the first time at a networking event. Your coach will guide you through the perfect introduction.',
    objectives: [
      'Deliver a confident self-introduction',
      'Use power phrases to establish authority',
      'Ask strategic questions to show interest',
    ],
    keyPhrases: [
      "I specialize in...",
      "What I bring to the table is...",
      "I'd love to explore how we might...",
      "My track record shows...",
    ],
    difficulty: 1,
    hologramType: 'coach',
  },
  {
    id: 'coach-negotiate',
    title: 'Negotiation Fundamentals',
    description: 'Master the core phrases and tactics of business negotiation.',
    context:
      'Your coach will teach you the essential negotiation vocabulary and walk you through common scenarios.',
    objectives: [
      'Learn anchoring phrases',
      'Practice counter-offer language',
      'Master the art of silence and pausing',
    ],
    keyPhrases: [
      "Based on our analysis...",
      "I appreciate your position, however...",
      "What if we explored...",
      "Let me suggest an alternative...",
    ],
    difficulty: 2,
    hologramType: 'coach',
  },
  {
    id: 'coach-persuasion',
    title: 'The Art of Persuasion',
    description: 'Learn to be persuasive and assertive without being aggressive.',
    context:
      'Your coach teaches you advanced persuasion techniques used by top executives.',
    objectives: [
      'Use data-driven arguments',
      'Build emotional connection',
      'Handle objections with confidence',
    ],
    keyPhrases: [
      "The data clearly shows...",
      "Consider the impact on...",
      "I understand your concern, and here's why...",
      "What would it mean for your business if...",
    ],
    difficulty: 3,
    hologramType: 'coach',
  },
  // Client scenarios
  {
    id: 'client-pitch',
    title: 'The High-Stakes Pitch',
    description: 'Pitch your services to a demanding client who needs convincing.',
    context:
      'James Morrison from TechVentures has 20 minutes for you. He is considering 3 other vendors. You need to stand out.',
    objectives: [
      'Open with a compelling hook',
      'Address his specific pain points',
      'Close with a clear call to action',
    ],
    keyPhrases: [
      "What sets us apart is...",
      "For a company like TechVentures...",
      "Here's exactly what I propose...",
      "Shall we move forward with...",
    ],
    difficulty: 4,
    hologramType: 'client',
  },
  {
    id: 'client-objection',
    title: 'Handling Client Objections',
    description: 'Your client has concerns. Address them and save the deal.',
    context:
      'James is hesitating. He thinks your pricing is too high and your timeline too long. Turn this around.',
    objectives: [
      'Acknowledge concerns without apologizing',
      'Reframe pricing as investment',
      'Offer creative solutions',
    ],
    keyPhrases: [
      "I hear your concern about...",
      "When you factor in the ROI...",
      "Let me walk you through the value...",
      "Here's what I can offer to address that...",
    ],
    difficulty: 4,
    hologramType: 'client',
  },
  // Supplier scenarios
  {
    id: 'supplier-negotiate-price',
    title: 'Negotiate Better Terms',
    description: 'Push for better pricing without damaging the relationship.',
    context:
      'Maria has sent you a quote that is 20% over your budget. You need to negotiate without losing the supplier.',
    objectives: [
      'Open with appreciation before negotiating',
      'Use market data to support your position',
      'Find a win-win compromise',
    ],
    keyPhrases: [
      "We value our relationship with GlobalSupply...",
      "Based on current market rates...",
      "If we increase volume, could you...",
      "What flexibility do you have on...",
    ],
    difficulty: 3,
    hologramType: 'supplier',
  },
  {
    id: 'supplier-deadline',
    title: 'Urgent Delivery Negotiation',
    description: 'You need faster delivery. Negotiate a tighter timeline.',
    context:
      'Your biggest client needs the product 2 weeks earlier than planned. Convince Maria to expedite without excessive fees.',
    objectives: [
      'Explain urgency without showing desperation',
      'Offer incentives for faster delivery',
      'Secure commitment with clear terms',
    ],
    keyPhrases: [
      "We have a time-sensitive opportunity...",
      "In exchange for expedited delivery...",
      "Can you commit to...",
      "Let's find a solution that works for both of us...",
    ],
    difficulty: 3,
    hologramType: 'supplier',
  },
  // Partner scenarios
  {
    id: 'partner-explore',
    title: 'Exploring a Partnership',
    description: 'Build rapport and present a partnership vision that excites.',
    context:
      'David Blackwell sees potential but is cautious. He wants to understand the mutual benefits before committing.',
    objectives: [
      'Establish common ground',
      'Present a clear value proposition for both sides',
      'Propose concrete next steps',
    ],
    keyPhrases: [
      "I see a natural alignment between...",
      "Together, we could...",
      "The synergy here is...",
      "As a next step, I'd suggest...",
    ],
    difficulty: 4,
    hologramType: 'partner',
  },
  {
    id: 'partner-terms',
    title: 'Defining Partnership Terms',
    description: 'Negotiate the terms of a new strategic partnership.',
    context:
      'David is interested but wants to negotiate terms. Revenue split, responsibilities, and exclusivity are on the table.',
    objectives: [
      'Propose fair terms with confidence',
      'Handle pushback on revenue split',
      'Secure mutual commitments',
    ],
    keyPhrases: [
      "I propose a structure where...",
      "To ensure mutual benefit...",
      "In terms of responsibilities...",
      "Let's formalize this with...",
    ],
    difficulty: 5,
    hologramType: 'partner',
  },
];

// Link scenarios to personas
hologramPersonas.forEach((persona) => {
  persona.scenarios = scenarios.filter((s) => s.hologramType === persona.id);
});
