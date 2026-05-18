import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const LOGO     = require("../assets/images/ridhi_logo_new.png");
const PRIMARY  = "#E91E8C";
const SECONDARY = "#7B2FBE";
const BG       = "#08080F";

interface Props {
  onAnimationComplete: () => void;
  isReady: boolean;
}

// Cross-platform shadow helper
function shadow(color: string, radius: number, opacity: number) {
  if (Platform.OS === "web") {
    return { boxShadow: `0 0 ${radius}px ${color}` } as object;
  }
  return {
    shadowColor:   color,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius:  radius,
    elevation:     radius / 2,
  };
}

function textShadow(color: string, radius: number) {
  if (Platform.OS === "web") {
    return { textShadow: `0 0 ${radius}px ${color}` } as object;
  }
  return {
    textShadowColor:  color,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: radius,
  };
}

export function SplashAnimation({ onAnimationComplete, isReady }: Props) {
  const bgOpacity      = useRef(new Animated.Value(0)).current;
  const logoScale      = useRef(new Animated.Value(0.2)).current;
  const logoOpacity    = useRef(new Animated.Value(0)).current;
  const glowOpacity    = useRef(new Animated.Value(0)).current;
  const glowScale      = useRef(new Animated.Value(0.5)).current;
  const titleOpacity   = useRef(new Animated.Value(0)).current;
  const titleY         = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dot1           = useRef(new Animated.Value(0.25)).current;
  const dot2           = useRef(new Animated.Value(0.25)).current;
  const dot3           = useRef(new Animated.Value(0.25)).current;
  const breathe        = useRef(new Animated.Value(1)).current;
  const exitOpacity    = useRef(new Animated.Value(1)).current;
  const exitScale      = useRef(new Animated.Value(1)).current;

  const loopsRef = useRef<Animated.CompositeAnimation[]>([]);

  const stopLoops = useCallback(() => {
    loopsRef.current.forEach((l) => l.stop());
    loopsRef.current = [];
  }, []);

  const startLoops = useCallback(() => {
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.055, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1,     duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );

    const dotPulse = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1,    duration: 280, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.25, duration: 280, useNativeDriver: true }),
          Animated.delay(560),
        ]),
      );

    const dotsLoop = Animated.parallel([
      dotPulse(dot1, 0),
      dotPulse(dot2, 180),
      dotPulse(dot3, 360),
    ]);

    loopsRef.current = [breatheLoop, dotsLoop];
    breatheLoop.start();
    dotsLoop.start();
  }, [breathe, dot1, dot2, dot3]);

  // Entrance sequence
  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(glowScale,   { toValue: 1, duration: 350, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(titleY,       { toValue: 0, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => startLoops());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exit when app is ready
  useEffect(() => {
    if (!isReady) return;
    stopLoops();
    Animated.parallel([
      Animated.timing(exitOpacity, { toValue: 0, duration: 480, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(exitScale,   { toValue: 1.06, duration: 480, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) onAnimationComplete(); });
  }, [isReady, stopLoops, onAnimationComplete]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>

      {/* Dark gradient background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <LinearGradient colors={[BG, "#0C0C1A", "#100820"]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      </Animated.View>

      {/* Top-left pink ambient blob */}
      <Animated.View style={[styles.blob, styles.blobTL, { opacity: Animated.multiply(glowOpacity, 0.3 as unknown as Animated.Value), transform: [{ scale: glowScale }] }]} />
      {/* Bottom-right purple ambient blob */}
      <Animated.View style={[styles.blob, styles.blobBR, { opacity: Animated.multiply(glowOpacity, 0.22 as unknown as Animated.Value), transform: [{ scale: glowScale }] }]} />

      {/* Center content */}
      <View style={styles.center}>

        {/* Glow halo behind logo */}
        <Animated.View style={[
          styles.halo,
          { opacity: glowOpacity, transform: [{ scale: Animated.multiply(glowScale, breathe) }] },
        ]} />

        {/* Logo */}
        <Animated.View style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: Animated.multiply(logoScale, breathe) }] },
          shadow(PRIMARY, 40, 0.7),
        ]}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        {/* App name */}
        <Animated.Text style={[
          styles.title,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] },
          textShadow(PRIMARY + "99", 24),
        ]}>
          Ridhi
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Connect · Share · Love
        </Animated.Text>
      </View>

      {/* Animated loading dots */}
      <Animated.View style={[styles.dotsRow, { opacity: taglineOpacity }]}>
        <Animated.View style={[styles.dot, { opacity: dot1, backgroundColor: PRIMARY }]} />
        <Animated.View style={[styles.dot, { opacity: dot2, backgroundColor: SECONDARY }]} />
        <Animated.View style={[styles.dot, { opacity: dot3, backgroundColor: PRIMARY }]} />
      </Animated.View>

      {/* Made in India */}
      <Animated.Text style={[styles.badge, { opacity: taglineOpacity }]}>
        🇮🇳  Made in India
      </Animated.Text>
    </Animated.View>
  );
}

const LOGO_SIZE = Math.min(width * 0.38, 160);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  blob: {
    position: "absolute",
    borderRadius: 9999,
  },
  blobTL: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: PRIMARY,
    top: -width * 0.25,
    left: -width * 0.2,
    ...(Platform.OS === "web"
      ? { boxShadow: `0 0 120px ${PRIMARY}` }
      : { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 120 }),
  },
  blobBR: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: SECONDARY,
    bottom: -width * 0.2,
    right: -width * 0.15,
    ...(Platform.OS === "web"
      ? { boxShadow: `0 0 100px ${SECONDARY}` }
      : { shadowColor: SECONDARY, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 100 }),
  },
  center: {
    alignItems: "center",
    gap: 18,
  },
  halo: {
    position: "absolute",
    width: LOGO_SIZE + 60,
    height: LOGO_SIZE + 60,
    borderRadius: (LOGO_SIZE + 60) / 2,
    borderWidth: 1,
    borderColor: SECONDARY + "50",
    backgroundColor: "transparent",
    ...(Platform.OS === "web"
      ? { boxShadow: `0 0 50px ${SECONDARY}88` }
      : { shadowColor: SECONDARY, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 50 }),
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  title: {
    fontSize: 44,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.42)",
    letterSpacing: 2.8,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  dotsRow: {
    position: "absolute",
    bottom: height * 0.11,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badge: {
    position: "absolute",
    bottom: height * 0.055,
    fontSize: 12,
    color: "rgba(255,255,255,0.22)",
    letterSpacing: 0.5,
  },
});
