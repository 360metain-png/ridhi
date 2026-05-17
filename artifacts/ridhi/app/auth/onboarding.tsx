import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";

const LOGO = require("../../assets/images/ridhi_logo.png");
const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "users" as const,
    title: "Connect &\nBelong",
    subtitle: "Join millions of Indians sharing moments, building friendships, and finding love",
    primary: "#E91E8C",
    secondary: "#7B2FBE",
    orb1: "#E91E8C",
    orb2: "#7B2FBE",
  },
  {
    id: "2",
    icon: "heart" as const,
    title: "Find Your\nMatch",
    subtitle: "Smart matching powered by your interests, location, and personality — across India",
    primary: "#FF6B35",
    secondary: "#E91E8C",
    orb1: "#FF6B35",
    orb2: "#E91E8C",
  },
  {
    id: "3",
    icon: "video" as const,
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
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.12, 0.22, 0.12] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        left: x,
        top: y,
        opacity,
        transform: [{ translateY }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: size * 0.4,
      }}
    />
  );
}

function Particle({ color, delay }: { color: string; delay: number }) {
  const x = useRef(Math.random() * width).current;
  const anim = useRef(new Animated.Value(0)).current;
  const size = 2 + Math.random() * 3;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.timing(anim, { toValue: 1, duration: 4000 + Math.random() * 3000, useNativeDriver: true })
      ).start();
    }, delay);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [height, -50] });
  const opacity = anim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.7, 0.7, 0] });

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

function SlideContent({ item, isActive }: { item: typeof SLIDES[0]; isActive: boolean }) {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  const iconGlow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isActive) {
      Animated.stagger(120, [
        Animated.spring(iconAnim, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 10 }),
        Animated.timing(titleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(subtitleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(iconPulse, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
            Animated.timing(iconGlow, { toValue: 1, duration: 1200, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(iconPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
            Animated.timing(iconGlow, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else {
      titleAnim.setValue(0);
      subtitleAnim.setValue(0);
      iconAnim.setValue(0);
    }
  }, [isActive]);

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [
              { scale: Animated.multiply(iconAnim, iconPulse) },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconOuterGlow,
            {
              opacity: iconGlow,
              backgroundColor: item.primary + "20",
              shadowColor: item.primary,
              borderColor: item.primary + "30",
            },
          ]}
        />
        <LinearGradient
          colors={[item.primary + "30", item.secondary + "20"]}
          style={styles.iconOuterRing}
        >
          <LinearGradient
            colors={[item.primary, item.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Feather name={item.icon} size={46} color="#fff" />
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
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const logoAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
  });

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, speed: 10 }),
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

  const particleColors = [currentSlide.primary, currentSlide.secondary, "#ffffff"];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#08080F", "#0A0A18", "#08080F"]}
        style={StyleSheet.absoluteFill}
      />

      <FloatingOrb color={currentSlide.orb1} size={280} x={-60} y={-40} delay={0} />
      <FloatingOrb color={currentSlide.orb2} size={220} x={width - 140} y={height * 0.3} delay={800} />
      <FloatingOrb color={currentSlide.orb1} size={160} x={width * 0.2} y={height * 0.6} delay={1400} />

      {Array.from({ length: 12 }).map((_, i) => (
        <Particle
          key={i}
          color={particleColors[i % particleColors.length]}
          delay={i * 400}
        />
      ))}

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
          <SlideContent item={item} isActive={index === activeIndex} />
        )}
      />

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
              <Pressable key={i} onPress={() => flatRef.current?.scrollToIndex({ index: i })}>
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
          style={{ width: width - 48 }}
        />

        <Pressable onPress={() => router.replace("/auth/login")} style={styles.skip}>
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
    gap: 8,
  },
  logoImg: { width: 36, height: 36 },
  logoName: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.5 },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 28,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconOuterGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 0,
  },
  iconOuterRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E91E8C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 14,
  },
  title: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -1,
    color: "#FFFFFF",
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 25,
    color: "rgba(255,255,255,0.55)",
  },
  footer: { paddingHorizontal: 24, gap: 22, alignItems: "center" },
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { height: 6, width: 6, borderRadius: 3 },
  dotActive: { width: 28, height: 6, borderRadius: 3 },
  skip: { paddingVertical: 4 },
  skipText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", color: "rgba(255,255,255,0.45)" },
});
