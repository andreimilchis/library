import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../utils/theme';

interface HologramAvatarProps {
  emoji: string;
  color: string;
  glowColor: string;
  size?: 'small' | 'medium' | 'large' | 'hero';
  isActive?: boolean;
  isSpeaking?: boolean;
}

const sizeMap = {
  small: 60,
  medium: 90,
  large: 130,
  hero: 200,
};

export default function HologramAvatar({
  emoji,
  color,
  glowColor,
  size = 'medium',
  isActive = false,
  isSpeaking = false,
}: HologramAvatarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const scanlineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scanline animation
    Animated.loop(
      Animated.timing(scanlineAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const pixelSize = sizeMap[size];
  const emojiSize = pixelSize * 0.45;

  return (
    <View style={[styles.container, { width: pixelSize, height: pixelSize }]}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            width: pixelSize + 30,
            height: pixelSize + 30,
            borderRadius: (pixelSize + 30) / 2,
            borderColor: glowColor,
            opacity: glowAnim,
          },
        ]}
      />

      {/* Middle glow ring */}
      <Animated.View
        style={[
          styles.middleGlow,
          {
            width: pixelSize + 15,
            height: pixelSize + 15,
            borderRadius: (pixelSize + 15) / 2,
            backgroundColor: color + '10',
            borderColor: glowColor,
            opacity: glowAnim,
          },
        ]}
      />

      {/* Main avatar circle */}
      <Animated.View
        style={[
          styles.avatarCircle,
          {
            width: pixelSize,
            height: pixelSize,
            borderRadius: pixelSize / 2,
            backgroundColor: color + '15',
            borderColor: color + '60',
            transform: [{ scale: pulseAnim }],
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
          },
        ]}
      >
        {/* Scanline effect */}
        <Animated.View
          style={[
            styles.scanline,
            {
              backgroundColor: glowColor + '15',
              transform: [
                {
                  translateY: scanlineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-pixelSize / 2, pixelSize / 2],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Emoji */}
        <Text style={[styles.emoji, { fontSize: emojiSize }]}>{emoji}</Text>

        {/* Speaking indicator */}
        {isSpeaking && (
          <View style={[styles.speakingDot, { backgroundColor: glowColor }]} />
        )}
      </Animated.View>

      {/* Bottom reflection line */}
      <View
        style={[
          styles.reflection,
          {
            width: pixelSize * 0.6,
            backgroundColor: glowColor + '30',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    borderWidth: 1,
  },
  middleGlow: {
    position: 'absolute',
    borderWidth: 1,
  },
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 15,
  },
  scanline: {
    position: 'absolute',
    width: '100%',
    height: 2,
  },
  emoji: {
    textAlign: 'center',
  },
  speakingDot: {
    position: 'absolute',
    bottom: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reflection: {
    height: 2,
    borderRadius: 1,
    marginTop: 8,
  },
});
