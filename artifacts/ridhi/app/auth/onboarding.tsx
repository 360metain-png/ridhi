import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SeoHead } from "@/components/SeoHead";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";

const LOGO     = require("../../assets/images/ridhi_logo.png");
const LOGO_NEW = require("../../assets/images/ridhi_logo_new.png");

type SlideType = "logo" | "emoji";

const SLIDES = [
  {
    id: "1",
    type: "logo" as SlideType,
    emoji: "",
    title: "Connect &\nBelong",
    subtitle: "Join millions of Indians sharing moments, building friendships, and finding love",
    primary: "#E91E8C",
    secondary: "#7B2FBE",
  },
  {
    id: "2",
    type: "emoji" as SlideType,
    emoji: "💕",
    title: "Find Your\nMatch",
    subtitle: "Smart matching powered by your interests, location, and personality — across India",
    primary: "#FF6B35",
    secondary: "#E91E8C",
  },
  {
    id: "3",
    type: "emoji" as SlideType,
    emoji: "🎬",
    title: "Create &\nEarn",
    subtitle: "Share reels, go live, earn coins, and grow your creator empire on Ridhi",
    primary: "#7B2FBE",
    secondary: "#4A90E2",
  },
];

// Each floating item: emoji, start position (0–1 of width), size, speed, delay, rotation
const FLOAT_ITEMS = [
  { emoji: "❤️",  x: 0.08, size: 28, dur: 7000, delay: 0,    spin: 15  },
  { emoji: "💕",  x: 0.22, size: 20, dur: 9000, delay: 800,  spin: -10 },
  { emoji: "💗",  x: 0.40, size: 32, dur: 6500, delay: 1600, spin: 20  },
  { emoji: "💖",  x: 0.60, size: 18, dur: 8500, delay: 400,  spin: -25 },
  { emoji: "💓",  x: 0.78, size: 26, dur: 7500, delay: 2200, spin: 12  },
  { emoji: "💝",  x: 0.92, size: 22, dur: 9500, delay: 1200, spin: -8  },
  { emoji: "💞",  x: 0.15, size: 16, dur: 8000, delay: 3000, spin: 30  },
  { emoji: "💘",  x: 0.50, size: 24, dur: 6000, delay: 500,  spin: -18 },
  { emoji: "🌸",  x: 0.30, size: 20, dur: 9000, delay: 2800, spin: 22  },
  { emoji: "✨",  x: 0.70, size: 18, dur: 7200, delay: 1800, spin: -5  },
  { emoji: "💫",  x: 0.85, size: 22, dur: 8800, delay: 3500, spin: 14  },
  { emoji: "🌺",  x: 0.05, size: 20, dur: 7800, delay: 4200, spin: -20 },
  { emoji: "❤️",  x: 0.55, size: 14, dur: 9200, delay: 600,  spin: 8   },
  { emoji: "💜",  x: 0.38, size: 26, dur: 7000, delay: 3800, spin: -30 },
  { emoji: "🧡",  x: 0.72, size: 18, dur: 8200, delay: 2400, spin: 16  },
  { emoji: "💛",  x: 0.18, size: 22, dur: 6800, delay: 4600, spin: -12 },
];

function FloatingHeart({
  emoji, x, size, dur, delay, spin, screenWidth, screenHeight,
}: {
  emoji: string; x: number; size: number; dur: number; delay: number; spin: number;
  screenWidth: number; screenHeight: number;
}) {
  const anim   = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      // Rise from bottom to top — loops indefinitely
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: dur,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Gentle horizontal wiggle
      Animated.loop(
        Animated.sequence([
          Animated.timing(wiggle, { toValue: 1,  duration: dur * 0.4, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: -1, duration: dur * 0.4, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: 0,  duration: dur * 0.2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight + size, -size * 2],
  });
  const translateX = wiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-18, 0, 18],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.06, 0.88, 1],
    outputRange: [0, 0.75, 0.75, 0],
  });
  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", `${spin}deg`],
  });
  const scale = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 1.1, 0.7],
  });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x * screenWidth,
        fontSize: size,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }, { scale }],
        pointerEvents: "none",
      }}
      selectable={false}
    >
      {emoji}
    </Animated.Text>
  );
}

function SlideContent({
  item,
  isActive,
  screenWidth,
}: {
  item: (typeof SLIDES)[0];
  isActive: boolean;
  screenWidth: number;
}) {
  const titleAnim    = useRef(new Animated.Value(1)).current;
  const subtitleAnim = useRef(new Animated.Value(1)).current;
  const iconAnim     = useRef(new Animated.Value(1)).current;
  const iconPulse    = useRef(new Animated.Value(1)).current;
  const iconGlow     = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isActive) {
      titleAnim.setValue(1);
      subtitleAnim.setValue(1);
      iconAnim.setValue(1);

      Animated.stagger(100, [
        Animated.spring(iconAnim,     { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 10 }),
        Animated.timing(titleAnim,    { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(subtitleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      const breathe = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(iconPulse, { toValue: 1.055, duration: 1400, useNativeDriver: true }),
            Animated.timing(iconGlow,  { toValue: 1,     duration: 1400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(iconPulse, { toValue: 1,   duration: 1400, useNativeDriver: true }),
            Animated.timing(iconGlow,  { toValue: 0.4, duration: 1400, useNativeDriver: true }),
          ]),
        ])
      );
      breathe.start();
      return () => breathe.stop();
    }
  }, [isActive]);

  const RING_SIZE   = Math.min(screenWidth * 0.52, 210);
  const CIRCLE_SIZE = RING_SIZE * 0.72;

  return (
    <View style={[styles.slide, { width: screenWidth }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          { transform: [{ scale: Animated.multiply(iconAnim, iconPulse) }] },
        ]}
      >
        {/* Glow halo */}
        <Animated.View
          style={{
            position: "absolute",
            width: RING_SIZE + 40,
            height: RING_SIZE + 40,
            borderRadius: (RING_SIZE + 40) / 2,
            borderWidth: 1,
            borderColor: item.primary + "30",
            backgroundColor: item.primary + "10",
            opacity: iconGlow,
          }}
        />

        {/* Gradient outer ring */}
        <LinearGradient
          colors={[item.primary + "40", item.secondary + "25"]}
          style={{
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Gradient inner circle */}
          <LinearGradient
            colors={[item.primary, item.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              borderRadius: CIRCLE_SIZE / 2,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {item.type === "logo" ? (
              <Image
                source={LOGO_NEW}
                style={{ width: CIRCLE_SIZE * 0.72, height: CIRCLE_SIZE * 0.72 }}
                resizeMode="contain"
              />
            ) : (
              <Text style={{ fontSize: CIRCLE_SIZE * 0.44, lineHeight: CIRCLE_SIZE * 0.54 }}>
                {item.emoji}
              </Text>
            )}
          </LinearGradient>
        </LinearGradient>
      </Animated.View>

      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleAnim,
            transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
          },
        ]}
      >
        {item.title}
      </Animated.Text>

      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: subtitleAnim,
            transform: [{ translateY: subtitleAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          },
        ]}
      >
        {item.subtitle}
      </Animated.Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets  = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef    = useRef<FlatList>(null);
  const logoAnim   = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
  });

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoAnim,   { toValue: 1, useNativeDriver: true, speed: 10 }),
      Animated.timing(footerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const next = () => {
    if (activeIndex < SLIDES.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      flatRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      router.replace("/auth/login");
    }
  };

  const currentSlide = SLIDES[activeIndex];

  return (
    <>
      <SeoHead
        title="Ridhi App — Live Streaming, Voice Chat & Social | India"
        description="Ridhi — an India-based, globally first social universal app by Krilo Digitech Pvt Ltd. Live streaming, voice chat, social networking, dating, podcasts, and creator earnings in 13 Indian languages."
      />
      <View style={styles.container}>
      {/* Dark gradient base */}
      <LinearGradient
        colors={["#08080F", "#0D0618", "#08080F"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── FLOATING HEARTS & EMOJIS ───────────────────────────── */}
      {FLOAT_ITEMS.map((item, i) => (
        <FloatingHeart
          key={i}
          emoji={item.emoji}
          x={item.x}
          size={item.size}
          dur={item.dur}
          delay={item.delay}
          spin={item.spin}
          screenWidth={width}
          screenHeight={height}
        />
      ))}

      {/* ── LOGO HEADER ──────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.logoHeader,
          {
            paddingTop: insets.top + 16,
            opacity: logoAnim,
            transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}
      >
        <View style={styles.logoRow}>
          <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.logoName}>Ridhi</Text>
        </View>
        <View style={[styles.tagBadge, { borderColor: currentSlide.primary + "40", backgroundColor: currentSlide.primary + "12" }]}>
          <Text style={[styles.tagText, { color: currentSlide.primary }]}>India's First Social Universal App</Text>
        </View>
      </Animated.View>

      {/* ── SLIDES ──────────────────────────────────────────────── */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.id}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <SlideContent item={item} isActive={index === activeIndex} screenWidth={width} />
        )}
      />

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 24,
            opacity: footerAnim,
            transform: [{ translateY: footerAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
          },
        ]}
      >
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <Pressable
                key={i}
                onPress={() => flatRef.current?.scrollToIndex({ index: i })}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${i + 1}`}
              >
                {isActive ? (
                  <LinearGradient
                    colors={[currentSlide.primary, currentSlide.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.dotActive}
                  />
                ) : (
                  <View style={[styles.dot, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
                )}
              </Pressable>
            );
          })}
        </View>

        <GradientButton
          label={activeIndex === SLIDES.length - 1 ? "Get Started 🚀" : "Continue"}
          onPress={next}
          style={{ width: Math.min(width - 48, 380) }}
        />

        <Pressable
          onPress={() => router.replace("/auth/login")}
          style={styles.skip}
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Sign in to existing account"
        >
          <Text style={styles.skipText}>
            Already have an account?{" "}
            <Text style={{ color: currentSlide.primary, fontFamily: "Inter_600SemiBold" }}>Sign in</Text>
          </Text>
        </Pressable>
      </Animated.View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#08080F" },

  logoHeader: {
    alignItems: "center",
    paddingBottom: 8,
    gap: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoImg: {
    width: 42,
    height: 42,
    borderRadius: 10,
  },
  logoName: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },

  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 28,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  title: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -1,
    color: "#FFFFFF",
    lineHeight: 46,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 26,
    color: "rgba(255,255,255,0.55)",
    maxWidth: 320,
  },

  footer: { paddingHorizontal: 24, gap: 20, alignItems: "center" },
  dots:   { flexDirection: "row", gap: 6, alignItems: "center" },
  dot:       { height: 6, width: 6,  borderRadius: 3 },
  dotActive: { width: 28, height: 6, borderRadius: 3 },
  skip: { paddingVertical: 4 },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    color: "rgba(255,255,255,0.45)",
  },
});
