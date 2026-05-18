import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";

const LOGO     = require("../../assets/images/ridhi_logo.png");
const LOGO_NEW = require("../../assets/images/ridhi_logo_new.png");

type SlideType = "logo" | "emoji" | "icon";

const SLIDES = [
  {
    id: "1",
    type: "logo" as SlideType,
    emoji: "",
    title: "Connect &\nBelong",
    subtitle: "Join millions of Indians sharing moments, building friendships, and finding love",
    primary: "#E91E8C",
    secondary: "#7B2FBE",
    orb1: "#E91E8C",
    orb2: "#7B2FBE",
  },
  {
    id: "2",
    type: "emoji" as SlideType,
    emoji: "💕",
    title: "Find Your\nMatch",
    subtitle: "Smart matching powered by your interests, location, and personality — across India",
    primary: "#FF6B35",
    secondary: "#E91E8C",
    orb1: "#FF6B35",
    orb2: "#E91E8C",
  },
  {
    id: "3",
    type: "emoji" as SlideType,
    emoji: "🎬",
    title: "Create &\nEarn",
    subtitle: "Share reels, go live, earn coins, and grow your creator empire on Ridhi",
    primary: "#7B2FBE",
    secondary: "#4A90E2",
    orb1: "#7B2FBE",
    orb2: "#00BCD4",
  },
];

function FloatingOrb({ color, size, x, y, delay }: { color: string; size: number; x: number; y: number; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 3000 + delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000 + delay, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.12, 0.22, 0.12] });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y,
          opacity,
          transform: [{ translateY }],
        },
        Platform.OS === "web"
          ? { boxShadow: `0 0 ${size * 0.4}px ${color}` } as object
          : { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: size * 0.4 },
      ]}
    />
  );
}

function Particle({ color, delay, screenWidth, screenHeight }: { color: string; delay: number; screenWidth: number; screenHeight: number }) {
  const x    = useRef(Math.random() * screenWidth).current;
  const anim = useRef(new Animated.Value(0)).current;
  const size = 2 + Math.random() * 3;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.timing(anim, { toValue: 1, duration: 4000 + Math.random() * 3000, useNativeDriver: true })
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [screenHeight, -50] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.7, 0.7, 0] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        left: x,
        opacity,
        transform: [{ translateY }],
      }}
    />
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
  const titleAnim    = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const iconAnim     = useRef(new Animated.Value(0)).current;
  const iconPulse    = useRef(new Animated.Value(1)).current;
  const iconGlow     = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isActive) {
      titleAnim.setValue(0);
      subtitleAnim.setValue(0);
      iconAnim.setValue(0);

      Animated.stagger(100, [
        Animated.spring(iconAnim,    { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 10 }),
        Animated.timing(titleAnim,   { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(subtitleAnim,{ toValue: 1, duration: 480, useNativeDriver: true }),
      ]).start();

      const breathe = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(iconPulse, { toValue: 1.055, duration: 1400, useNativeDriver: true }),
            Animated.timing(iconGlow,  { toValue: 1,    duration: 1400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(iconPulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
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
        {/* Outer glow halo */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: RING_SIZE + 40,
              height: RING_SIZE + 40,
              borderRadius: (RING_SIZE + 40) / 2,
              borderWidth: 1,
              borderColor: item.primary + "30",
              backgroundColor: item.primary + "12",
              opacity: iconGlow,
            },
            Platform.OS === "web"
              ? { boxShadow: `0 0 40px ${item.primary}50` } as object
              : { shadowColor: item.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 40, elevation: 0 },
          ]}
        />

        {/* Gradient ring */}
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
          {/* Inner filled circle */}
          <LinearGradient
            colors={[item.primary, item.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              },
              Platform.OS === "web"
                ? { boxShadow: `0 10px 24px ${item.primary}50` } as object
                : { shadowColor: item.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 14 },
            ]}
          >
            {/* SLIDE ILLUSTRATION */}
            {item.type === "logo" ? (
              /* Ridhi logo — slide 1 */
              <Image
                source={LOGO_NEW}
                style={{ width: CIRCLE_SIZE * 0.72, height: CIRCLE_SIZE * 0.72 }}
                resizeMode="contain"
              />
            ) : (
              /* Big emoji illustration — slides 2 & 3 */
              <Text style={{ fontSize: CIRCLE_SIZE * 0.42, lineHeight: CIRCLE_SIZE * 0.52 }}>
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
  const insets    = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef   = useRef<FlatList>(null);
  const logoAnim  = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
  });

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoAnim,  { toValue: 1, useNativeDriver: true, speed: 10 }),
      Animated.timing(footerAnim,{ toValue: 1, duration: 600, useNativeDriver: true }),
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

  const currentSlide   = SLIDES[activeIndex];
  const particleColors = [currentSlide.primary, currentSlide.secondary, "#ffffff"];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#08080F", "#0A0A18", "#08080F"]}
        style={StyleSheet.absoluteFill}
      />

      <FloatingOrb color={currentSlide.orb1} size={Math.min(width * 0.75, 280)} x={-60}        y={-40}          delay={0}    />
      <FloatingOrb color={currentSlide.orb2} size={Math.min(width * 0.60, 220)} x={width - 140} y={height * 0.3} delay={800}  />
      <FloatingOrb color={currentSlide.orb1} size={Math.min(width * 0.45, 160)} x={width * 0.2} y={height * 0.6} delay={1400} />

      {Array.from({ length: 12 }).map((_, i) => (
        <Particle
          key={i}
          color={particleColors[i % particleColors.length]}
          delay={i * 400}
          screenWidth={width}
          screenHeight={height}
        />
      ))}

      {/* ── LOGO HEADER ─── */}
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
          <Text style={[styles.tagText, { color: currentSlide.primary }]}>India's #1 Social App</Text>
        </View>
      </Animated.View>

      {/* ── SLIDES ─── */}
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

      {/* ── FOOTER ─── */}
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
