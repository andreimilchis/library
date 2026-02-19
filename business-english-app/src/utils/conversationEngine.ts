import {
  HologramType,
  ConversationScenario,
  UserProfile,
  Message,
  MessageFeedback,
} from '../types';
import { hologramPersonas, scenarios } from '../data/holograms';

// Simulated AI conversation engine
// In production, this would connect to an LLM API (OpenAI, Anthropic, etc.)

interface ConversationContext {
  hologramType: HologramType;
  scenario: ConversationScenario;
  profile: UserProfile;
  messages: Message[];
}

function getPersonaSystemContext(ctx: ConversationContext): string {
  const persona = hologramPersonas.find((p) => p.id === ctx.hologramType)!;
  const { profile, scenario } = ctx;

  const base = `You are ${persona.name}, ${persona.title}. ${persona.description}`;

  const userContext = `The person you are speaking with is ${profile.name}, a ${profile.role} in the ${profile.industry?.replace('_', ' ')} industry. Their English level is ${profile.level}.`;

  const scenarioContext = `Current scenario: ${scenario.title}. ${scenario.context}`;

  return `${base}\n\n${userContext}\n\n${scenarioContext}`;
}

// Pre-built response trees for each hologram type and scenario
const responseBank: Record<string, string[][]> = {
  'coach-intro': [
    [
      "Welcome, {name}! I'm Alexandra, your business English coach. Today we're going to master the art of the powerful first impression. In business, you never get a second chance. Ready to begin?",
      "Let's start with the basics. When you meet someone at a networking event, what's the first thing you say? Go ahead — introduce yourself to me as if we just met.",
      "Good effort! Here's what I noticed: {feedback}. In high-level business settings, you want to lead with your value, not just your title. Try this structure: 'I'm [name], I specialize in [value you bring].' Try again!",
      "Much better! You're already sounding more authoritative. Now, let's add the follow-up question — the secret weapon. After your intro, always ask a strategic question. Something like: 'What challenges are you currently facing in [their area]?' This positions you as a problem-solver, not just another contact.",
      "Excellent progress, {name}! Remember these three rules: 1) Lead with value, not title. 2) Speak slowly and deliberately — it signals confidence. 3) Always end with a question that shows you care about THEIR needs. Let's practice the full sequence one more time.",
    ],
    [
      "I see you're in {industry}. That's perfect — let me give you industry-specific phrases that will make you stand out. In your field, instead of saying 'I work in {industry}', try: 'I help {industry} companies solve [specific problem].'",
      "Now I want you to practice the full introduction with conviction. Remember: slow pace, strong eye contact (imagine looking at me), and a firm handshake energy in your voice. Go!",
    ],
  ],
  'coach-negotiate': [
    [
      "Today we tackle negotiation, {name}. This is where most non-native speakers lose the most money — literally. The good news? The right phrases can make you sound like you've been negotiating in English your whole life.",
      "Rule #1 of negotiation in English: Never start with your bottom line. Instead, use anchoring phrases like 'Based on our market analysis...' or 'Industry standards suggest...'. These phrases create authority. What's a negotiation you're currently facing?",
      "Good. Now let me teach you the power of the pause. After stating your position, STOP. Don't fill the silence. In English business culture, the person who speaks first after a pause usually concedes. Let's practice this.",
      "Here's a critical phrase set for your toolkit: 'I appreciate your position, however...' — this acknowledges without agreeing. 'What if we explored...' — this opens new possibilities without weakness. 'Let me suggest an alternative...' — this positions you as creative, not desperate.",
      "You're improving rapidly, {name}. For your {industry} context, remember: always frame concessions as mutual gains. Never say 'I'll reduce the price.' Instead: 'If we adjust the terms here, we both benefit because...' This is power language.",
    ],
  ],
  'coach-persuasion': [
    [
      "{name}, today we work on persuasion — the highest-level business English skill. Persuasion isn't about being pushy. It's about being so clear and compelling that people WANT to agree with you.",
      "The three pillars of business persuasion in English: 1) Data — 'The numbers show...' 2) Emotion — 'Imagine the impact on your team...' 3) Urgency — 'The window for this opportunity is...' Let's practice each one.",
      "I want you to persuade me to invest in your company. Use all three pillars. Remember, in {industry}, the key is to connect data to outcomes. Don't just say 'we grew 30%' — say 'we grew 30%, which means [specific benefit to them].'",
      "Strong delivery! Here's my feedback: {feedback}. The key improvement I'd suggest: slow down on your key points. When native English speakers want to emphasize something, they slow down and lower their pitch. Try it.",
      "You're becoming genuinely persuasive in English, {name}. This is a transformation. Keep practicing these patterns and they'll become second nature. Your next step: try these phrases in your real meetings this week.",
    ],
  ],
  'client-pitch': [
    [
      "Alright, you've got 20 minutes. I'm James Morrison from TechVentures. We're evaluating three vendors for this project. Tell me — why should I pick you?",
      "Interesting. But I've heard similar pitches before. What specifically makes your approach different from the other two companies I'm talking to?",
      "I see the potential, but your pricing seems high for what you're offering. We have a strict budget. Can you justify this investment?",
      "You're making a decent case. But here's my concern: what happens if this doesn't deliver the results you're promising? What guarantees can you give me?",
      "I appreciate your honesty. Look, I'll be straight with you — I'm leaning towards giving you a shot, but I need you to send me a revised proposal by Friday. Can you commit to that?",
    ],
  ],
  'client-objection': [
    [
      "I'll be direct — I've reviewed your proposal and I have some serious concerns. Your pricing is 25% above what your competitor quoted. And your delivery timeline? Six months is too long. We need this in four. Convince me not to go with the other option.",
      "I understand you're selling me on quality, but at the end of the day, my board looks at numbers. How do I justify paying 25% more? Give me something concrete.",
      "That ROI argument is interesting. But the timeline issue remains. What can you realistically do to shorten delivery? And don't just tell me what I want to hear.",
      "Okay, I can see you're flexible on the timeline. What about a phased approach? We pay in milestones based on deliverables. Would that work for you?",
      "You've addressed my main concerns. Let me take this back to my team. But I want to be clear — if we move forward, we'll hold you to these commitments. Send me the revised terms.",
    ],
  ],
  'supplier-negotiate-price': [
    [
      "Good to speak with you! I received your inquiry about the latest quote. I should mention upfront — our costs have increased this quarter due to raw material prices. The quote I sent reflects our current market reality.",
      "I understand budget constraints are real. However, the quality we provide at GlobalSupply is consistently above industry standard. We've been your reliable partner for a reason. What volume are you looking at?",
      "That's an interesting volume. If you can commit to a 12-month contract at that level, I might have some room to work with. But I can't go below our cost floor — we need to maintain quality.",
      "I appreciate you understanding our position. How about this: we keep the per-unit price, but I include free shipping on orders above [threshold], and we extend your payment terms to net-60. That should improve your cash flow significantly.",
      "I think we can make this work. Let me draft the revised terms and send them over by end of day. It's always good working with professionals who understand that partnerships need to benefit both sides.",
    ],
  ],
  'supplier-deadline': [
    [
      "I see your request for expedited delivery. Let me be transparent — our production schedule is fully booked for the next three weeks. Moving your order up would mean rearranging other clients' deliveries.",
      "I understand it's urgent for you. But I need you to understand that expediting comes with real costs on our end — overtime, logistics changes, potential penalties with other clients. What's your flexibility on the surcharge?",
      "A 5% expediting fee is already below what we typically charge for rush orders. I can try to get it to 3% if you can accept a partial delivery — 70% by your deadline and the rest the following week. Would that work?",
      "I think we're getting somewhere. Let me talk to my production team and confirm feasibility. If we do this, I'll need the purchase order confirmed by tomorrow morning. Can you commit to that?",
      "Alright, I'll make it happen. I'm putting my team on this. Just remember us when things slow down and you're planning your next quarterly order. Reliable partners deserve reliable partners.",
    ],
  ],
  'partner-explore': [
    [
      "Thanks for reaching out. I've looked at your company profile and I see some interesting overlaps. But before we get into specifics, tell me — what does a successful partnership look like from your side?",
      "That's a thoughtful answer. From Horizon's perspective, we're selective about partnerships because our reputation is at stake. What specific capabilities do you bring that we don't already have in-house?",
      "I can see the complementary value there. But let me ask a harder question: how do you handle disagreements? Because in every partnership, there will be moments where our interests diverge. What's your philosophy?",
      "I respect that. Here's what I'm thinking as a potential structure: we start with a pilot project — limited scope, shared investment, clear metrics. If it works, we expand. This protects both sides. What do you think?",
      "I'm genuinely interested. Let's set up a formal meeting with our respective teams. I want my COO to hear what you just told me. Can we schedule something for next week?",
    ],
  ],
  'partner-terms': [
    [
      "Let's get into the details. I've outlined a proposed structure: 60-40 revenue split in our favor for the first year, given that we're providing the existing client base and market access. After year one, we renegotiate based on contribution.",
      "I hear you, and I understand you want 50-50. But consider this: we're bringing a verified pipeline of 200+ enterprise clients. That's not just access — that's years of relationship-building. The 60-40 reflects that upfront value. What counter-proposal do you have?",
      "That's a creative approach. If you're willing to cover the initial marketing investment and take on client onboarding, I could see moving to 55-45. But I need exclusivity in the European market. That's non-negotiable for us.",
      "European exclusivity for 18 months, then we review? I can work with that. But I want performance clauses — if either party underperforms against agreed KPIs, the other can bring in additional partners. Fair?",
      "I think we have the foundation for a strong agreement. Let me have our legal team draft the term sheet based on what we discussed. This feels like the beginning of something significant. Looking forward to making this work.",
    ],
  ],
};

function personalizeResponse(
  template: string,
  profile: UserProfile,
  messageIndex: number
): string {
  let response = template
    .replace(/{name}/g, profile.name || 'there')
    .replace(/{industry}/g, profile.industry?.replace('_', ' ') || 'your industry')
    .replace(/{role}/g, profile.role || 'professional');

  // Replace feedback placeholder with contextual feedback
  if (response.includes('{feedback}')) {
    const feedbacks = [
      'Your opening was a bit soft. Business English requires you to own the room from the first sentence.',
      'Good content, but your phrasing could be more direct. Replace "I think maybe" with "I\'m confident that".',
      'Strong vocabulary choices! Watch your sentence length though — shorter sentences sound more authoritative.',
    ];
    response = response.replace(
      /{feedback}/g,
      feedbacks[messageIndex % feedbacks.length]
    );
  }

  return response;
}

export function getHologramResponse(ctx: ConversationContext): {
  message: string;
  feedback?: MessageFeedback;
} {
  const { hologramType, scenario, profile, messages } = ctx;
  const bank = responseBank[scenario.id];

  if (!bank) {
    return {
      message: `I'm ${hologramPersonas.find((p) => p.id === hologramType)?.name}. Let's begin our conversation about ${scenario.title}. How would you like to start?`,
    };
  }

  // Determine which response to give based on message count
  const userMessages = messages.filter((m) => m.role === 'user');
  const responseIndex = userMessages.length;

  // Get from the primary response track, loop if needed
  const track = bank[0];
  const responseText =
    track[Math.min(responseIndex, track.length - 1)] ||
    track[track.length - 1];

  const personalizedText = personalizeResponse(responseText, profile, responseIndex);

  // Generate feedback for coach
  let feedback: MessageFeedback | undefined;
  if (hologramType === 'coach' && userMessages.length > 0) {
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    feedback = generateCoachFeedback(lastUserMessage, profile);
  }

  return { message: personalizedText, feedback };
}

function generateCoachFeedback(
  userMessage: string,
  profile: UserProfile
): MessageFeedback | undefined {
  const lowerMsg = userMessage.toLowerCase();

  // Check for common weak phrases
  const weakPhrases: [string, string, string][] = [
    ['i think maybe', "I'm confident that", 'Avoid hedging — be direct and assertive.'],
    ['i want to', 'My objective is to', 'Use professional goal-oriented language.'],
    [
      'sorry',
      "I appreciate your patience",
      "Don't apologize unless truly necessary — it can undermine authority.",
    ],
    [
      'i try to',
      'I consistently deliver',
      "Replace 'try' with definitive language. It shows confidence.",
    ],
    ['very good', 'exceptional', "Use stronger, more specific adjectives in business English."],
    ['cheap', 'cost-effective', "'Cheap' has negative connotations. Use 'cost-effective' instead."],
    ['problem', 'challenge', "Reframe 'problems' as 'challenges' — it sounds more solutions-oriented."],
  ];

  for (const [weak, strong, explanation] of weakPhrases) {
    if (lowerMsg.includes(weak)) {
      return {
        type: 'correction',
        original: weak,
        improved: strong,
        explanation,
      };
    }
  }

  // Positive feedback
  const powerPhrases = [
    'i propose',
    'my recommendation',
    'based on',
    'the data shows',
    'i specialize',
    'our track record',
    'the value',
    'mutually beneficial',
  ];

  for (const phrase of powerPhrases) {
    if (lowerMsg.includes(phrase)) {
      return {
        type: 'praise',
        explanation: `Excellent use of "${phrase}"! This is exactly the kind of authoritative language that commands respect in business English.`,
      };
    }
  }

  // General suggestion
  if (userMessage.length < 20) {
    return {
      type: 'suggestion',
      explanation:
        "Try to elaborate more. In business conversations, giving context and detail shows expertise and builds trust.",
    };
  }

  return undefined;
}

export function generateOpeningMessage(
  hologramType: HologramType,
  scenarioId: string,
  profile: UserProfile
): string {
  const bank = responseBank[scenarioId];
  if (bank && bank[0] && bank[0][0]) {
    return personalizeResponse(bank[0][0], profile, 0);
  }

  const persona = hologramPersonas.find((p) => p.id === hologramType);
  return `Hello ${profile.name}. I'm ${persona?.name}. Let's begin.`;
}
