import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../utils/theme';
import { useUser } from '../context/UserContext';
import { hologramPersonas, scenarios } from '../data/holograms';
import { HologramType, Message, ConversationSession } from '../types';
import { getHologramResponse, generateOpeningMessage } from '../utils/conversationEngine';
import HologramAvatar from '../components/HologramAvatar';

const { width, height } = Dimensions.get('window');

export default function ConversationScreen({ navigation, route }: any) {
  const { profile, addSession } = useUser();
  const hologramType: HologramType = route?.params?.hologramType || 'coach';
  const scenarioId: string = route?.params?.scenarioId || 'coach-intro';

  const persona = hologramPersonas.find((p) => p.id === hologramType)!;
  const scenario = scenarios.find((s) => s.id === scenarioId)!;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isHologramSpeaking, setIsHologramSpeaking] = useState(false);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Generate opening message
    if (profile) {
      const opening = generateOpeningMessage(hologramType, scenarioId, profile);
      setTimeout(() => {
        addHologramMessage(opening);
      }, 1000);
    }
  }, []);

  function addHologramMessage(content: string) {
    setIsHologramSpeaking(true);
    const msg: Message = {
      id: Date.now().toString(),
      role: 'hologram',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setIsHologramSpeaking(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function handleSend() {
    if (!inputText.trim() || !profile) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // Generate hologram response
    setIsHologramSpeaking(true);
    setTimeout(() => {
      const response = getHologramResponse({
        hologramType,
        scenario,
        profile,
        messages: updatedMessages,
      });

      const hologramMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'hologram',
        content: response.message,
        timestamp: Date.now(),
        feedback: response.feedback,
      };

      setMessages((prev) => [...prev, hologramMsg]);
      setIsHologramSpeaking(false);

      if (response.feedback) {
        setShowFeedback(response.feedback.explanation);
        setTimeout(() => setShowFeedback(null), 5000);
      }

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500 + Math.random() * 1000);
  }

  function handleEndSession() {
    const session: ConversationSession = {
      id: Date.now().toString(),
      hologramType,
      scenarioId,
      messages,
      startedAt: messages[0]?.timestamp || Date.now(),
      score: {
        confidence: 70 + Math.floor(Math.random() * 20),
        vocabulary: 65 + Math.floor(Math.random() * 25),
        persuasion: 60 + Math.floor(Math.random() * 30),
        clarity: 70 + Math.floor(Math.random() * 20),
        overallGrade: 'B',
        feedback: `Good session, ${profile?.name}! You're making progress.`,
        improvements: [
          'Use more power phrases at the start of sentences',
          'Slow down when making key points',
          'Replace hedging language with confident assertions',
        ],
      },
    };
    addSession(session);
    navigation.navigate('SessionResults', { sessionId: session.id });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
        {/* Hologram header */}
        <View style={[styles.hologramHeader, { borderBottomColor: persona.color + '20' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.hologramHeaderCenter}>
            <HologramAvatar
              emoji={persona.avatar}
              color={persona.color}
              glowColor={persona.glowColor}
              size="small"
              isActive
              isSpeaking={isHologramSpeaking}
            />
            <View style={styles.hologramHeaderInfo}>
              <Text style={styles.hologramHeaderName}>{persona.name}</Text>
              <Text style={[styles.hologramHeaderStatus, { color: persona.color }]}>
                {isHologramSpeaking ? 'Speaking...' : 'Listening'}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleEndSession} style={styles.endBtn}>
            <Text style={[styles.endText, { color: colors.error }]}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Scenario context bar */}
        <View style={[styles.contextBar, { backgroundColor: persona.color + '08' }]}>
          <Text style={[styles.contextText, { color: persona.color }]}>
            ◆ {scenario?.title}
          </Text>
        </View>

        {/* Coach feedback popup */}
        {showFeedback && (
          <Animated.View style={[styles.feedbackPopup, { borderColor: persona.color + '40' }]}>
            <Text style={[styles.feedbackLabel, { color: persona.color }]}>
              COACH TIP
            </Text>
            <Text style={styles.feedbackText}>{showFeedback}</Text>
          </Animated.View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.hologramBubble,
                msg.role === 'hologram' && { borderColor: persona.color + '20' },
              ]}
            >
              {msg.role === 'hologram' && (
                <Text style={[styles.messageSender, { color: persona.color }]}>
                  {persona.name}
                </Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  msg.role === 'user' && styles.userMessageText,
                ]}
              >
                {msg.content}
              </Text>

              {/* Inline feedback */}
              {msg.feedback && (
                <View
                  style={[
                    styles.inlineFeedback,
                    {
                      backgroundColor:
                        msg.feedback.type === 'correction'
                          ? colors.error + '10'
                          : msg.feedback.type === 'praise'
                          ? colors.success + '10'
                          : colors.warning + '10',
                      borderColor:
                        msg.feedback.type === 'correction'
                          ? colors.error + '30'
                          : msg.feedback.type === 'praise'
                          ? colors.success + '30'
                          : colors.warning + '30',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.feedbackType,
                      {
                        color:
                          msg.feedback.type === 'correction'
                            ? colors.error
                            : msg.feedback.type === 'praise'
                            ? colors.success
                            : colors.warning,
                      },
                    ]}
                  >
                    {msg.feedback.type === 'correction'
                      ? '⚡ CORRECTION'
                      : msg.feedback.type === 'praise'
                      ? '★ GREAT!'
                      : '💡 TIP'}
                  </Text>
                  {msg.feedback.original && (
                    <Text style={styles.feedbackCorrection}>
                      <Text style={styles.feedbackStrike}>
                        "{msg.feedback.original}"
                      </Text>
                      {' → '}
                      <Text style={styles.feedbackImproved}>
                        "{msg.feedback.improved}"
                      </Text>
                    </Text>
                  )}
                  <Text style={styles.feedbackExplanation}>
                    {msg.feedback.explanation}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Typing indicator */}
          {isHologramSpeaking && (
            <View style={[styles.messageBubble, styles.hologramBubble, styles.typingBubble]}>
              <Text style={styles.typingText}>
                {persona.name} is typing
                <Text style={[styles.typingDots, { color: persona.color }]}> ...</Text>
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Key phrases hint */}
        {scenario?.keyPhrases && messages.length > 1 && messages.length < 4 && (
          <View style={styles.phrasesHint}>
            <Text style={styles.phrasesTitle}>Try using:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {scenario.keyPhrases.map((phrase, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.phraseChip, { borderColor: persona.color + '30' }]}
                  onPress={() => setInputText(phrase)}
                >
                  <Text style={[styles.phraseText, { color: persona.color }]}>
                    {phrase}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input area */}
        <View style={styles.inputArea}>
          <View style={[styles.inputContainer, { borderColor: persona.color + '30' }]}>
            <TextInput
              style={styles.input}
              placeholder="Speak your mind..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim()
                    ? persona.color
                    : colors.surfaceLight,
                },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendText}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
  },
  hologramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 55,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    backgroundColor: colors.surface,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
  },
  hologramHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  hologramHeaderInfo: {
    marginLeft: spacing.sm,
  },
  hologramHeaderName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  hologramHeaderStatus: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  endBtn: {
    padding: spacing.sm,
  },
  endText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  contextBar: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  contextText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  feedbackPopup: {
    position: 'absolute',
    top: 130,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  feedbackLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.hologramPrimary + '20',
    borderWidth: 1,
    borderColor: colors.hologramPrimary + '30',
    borderBottomRightRadius: 4,
  },
  hologramBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  messageText: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  userMessageText: {
    color: colors.text,
  },
  inlineFeedback: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  feedbackType: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  feedbackCorrection: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: 4,
  },
  feedbackStrike: {
    textDecorationLine: 'line-through',
    color: colors.error,
  },
  feedbackImproved: {
    color: colors.success,
    fontWeight: '600',
  },
  feedbackExplanation: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  typingBubble: {
    paddingVertical: spacing.sm,
  },
  typingText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  typingDots: {
    fontWeight: '700',
  },
  phrasesHint: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  phrasesTitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phraseChip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    marginRight: spacing.sm,
  },
  phraseText: {
    fontSize: fontSize.sm,
  },
  inputArea: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  sendText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
