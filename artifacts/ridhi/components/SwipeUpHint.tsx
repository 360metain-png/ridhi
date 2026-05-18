/**
 * SwipeUpHint — animated "swipe up" hand gesture that appears on first load
 * and auto-dismisses after a few bounces. Use on vertically-scrollable screens.
 */
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

interface SwipeUpHintProps {
  /** ms to wait before showing the hint (default 1200) */
  delay?: number;
  /** label shown below the hand (default "Swipe up") */
  label?: string;
  /** distance (px) the hand rises each bounce cycle (default 28) */
  riseDistance?: number;
  /** number of full bounce cycles before fading out (default 3) */
  bounces?: number;
  /** vertical position from bottom of screen (default 120) */
  bottomOffset?: number;
}

export function SwipeUpHint({
  delay = 1200,
  label = "Swipe up",
  riseDistance = 28,
  bounces = 3,
  bottomOffset = 120,
}: SwipeUpHintProps) {
  const [visible, setVisible] = useState(true);

  const opacity   = useRef(new Animated.Value(0)).current;
  const handY     = useRef(new Animated.Value(0)).current;
  const trailY    = useRef(new Animated.Value(0)).current;
  const trailOpacity = useRef(new Animated.Value(0)).current;
  const scale     = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (!visible) return;

    const cycleMs   = 780;   // one full up-down cycle
    const riseMs    = 300;   // how fast the hand lifts
    const dropMs    = cycleMs - riseMs;

    // Build the repeating bounce loop
    const bounceLoop = Animated.loop(
      Animated.sequence([
        // Hand rises + trail fades in
        Animated.parallel([
          Animated.timing(handY, {
            toValue: -riseDistance,
            duration: riseMs,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(trailY, {
            toValue: -riseDistance * 0.55,
            duration: riseMs,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(trailOpacity, {
            toValue: 0.45,
            duration: riseMs * 0.5,
            useNativeDriver: true,
          }),
        ]),
        // Hand drops + trail fades out
        Animated.parallel([
          Animated.timing(handY, {
            toValue: 0,
            duration: dropMs,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(trailY, {
            toValue: 0,
            duration: dropMs,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(trailOpacity, {
            toValue: 0,
            duration: dropMs * 0.5,
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: bounces }
    );

    const fullSeq = Animated.sequence([
      Animated.delay(delay),
      // Pop in with scale + fade
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      // Pause briefly before bouncing
      Animated.delay(200),
      // Bounce loop
      bounceLoop,
      // Short pause then fade out
      Animated.delay(200),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    fullSeq.start(({ finished }) => {
      if (finished) setVisible(false);
    });

    return () => fullSeq.stop();
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { bottom: bottomOffset, opacity, transform: [{ scale }] }]}
    >
      {/* Glow pill */}
      <View style={styles.pill}>
        {/* Arrow trail (fades in while hand rises) */}
        <Animated.Text
          style={[styles.trail, { opacity: trailOpacity, transform: [{ translateY: trailY }] }]}
        >
          ↑
        </Animated.Text>

        {/* Hand emoji */}
        <Animated.Text style={[styles.hand, { transform: [{ translateY: handY }] }]}>
          👆
        </Animated.Text>

        <Text style={styles.label}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
    zIndex: 99,
  },
  pill: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.52)",
    borderRadius: 32,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    gap: 2,
    // Subtle glow
    shadowColor: "#7B2FBE",
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  trail: {
    fontSize: 16,
    color: "rgba(233,30,140,0.8)",
    fontWeight: "700",
    lineHeight: 18,
  },
  hand: {
    fontSize: 36,
    lineHeight: 42,
  },
  label: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
