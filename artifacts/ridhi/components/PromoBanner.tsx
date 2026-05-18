import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 32;
const CARD_H = 108;
const AUTO_INTERVAL = 3800;

const PROMOS = [
  {
    id: "vip",
    title: "Unlock VIP Premium 👑",
    subtitle: "No ads · Exclusive badges · Priority matching",
    cta: "Try Free 7 Days",
    icon: "star" as const,
    colors: ["#7B2FBE", "#5A1A99", "#3D0F6B"] as [string, string, string],
    accent: "#FFD700",
    sparkle: "#E2C4FF",
    route: "/subscription",
  },
  {
    id: "coins",
    title: "Coin Bonanza 🪙",
    subtitle: "Buy coins & get 50% EXTRA free today only!",
    cta: "Recharge Now",
    icon: "zap" as const,
    colors: ["#FF6D00", "#E91E8C", "#C2185B"] as [string, string, string],
    accent: "#FFD700",
    sparkle: "#FFD580",
    route: "/wallet",
  },
  {
    id: "match",
    title: "Find Your Soulmate 💘",
    subtitle: "1 Lakh+ singles near you are waiting",
    cta: "Start Matching",
    icon: "heart" as const,
    colors: ["#E91E8C", "#AD1457", "#880E4F"] as [string, string, string],
    accent: "#FFB3D1",
    sparkle: "#FFCCE0",
    route: "/(tabs)/match",
  },
  {
    id: "creator",
    title: "Earn With Ridhi 🚀",
    subtitle: "Top creators earn ₹50,000+ monthly",
    cta: "Become Creator",
    icon: "trending-up" as const,
    colors: ["#00897B", "#0277BD", "#01579B"] as [string, string, string],
    accent: "#A8EDEA",
    sparkle: "#B2EBF2",
    route: "/creator-dashboard",
  },
  {
    id: "live",
    title: "Go Live Right Now 🔴",
    subtitle: "500+ viewers are streaming this moment",
    cta: "Start Stream",
    icon: "radio" as const,
    colors: ["#D32F2F", "#E64A19", "#BF360C"] as [string, string, string],
    accent: "#FFCC02",
    sparkle: "#FFE0A0",
    route: "/live-stream",
  },
];

const N = PROMOS.length;

function Sparkle({ x, y, anim, size = 4, color }: { x: number; y: number; anim: Animated.Value; size?: number; color: string }) {
  const opacity = anim.interpolate({ inputRange: [0, 0.4, 0.8, 1], outputRange: [0, 1, 0.6, 0] });
  const scale  = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1.2, 0.6] });
  return (
    <Animated.View style={[styles.sparkle, { left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity, transform: [{ scale }] }]} />
  );
}

export function PromoBanner() {
  const [current, setCurrent] = useState(0);
  const slideAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(1)).current;
  const shimmerX   = useRef(new Animated.Value(-CARD_W)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const dotAnims   = useRef(PROMOS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef   = useRef(0);

  const goTo = useCallback((next: number, dir: 1 | -1 = 1) => {
    slideAnim.setValue(dir * CARD_W);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 120, friction: 14 }),
    ]).start(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
    dotAnims.forEach((d, i) =>
      Animated.timing(d, { toValue: i === next ? 1 : 0, duration: 260, useNativeDriver: false }).start()
    );
    indexRef.current = next;
    setCurrent(next);
  }, [slideAnim, fadeAnim, dotAnims]);

  useEffect(() => {
    const loop = () => {
      timerRef.current = setTimeout(() => {
        const next = (indexRef.current + 1) % N;
        goTo(next, 1);
        loop();
      }, AUTO_INTERVAL);
    };
    loop();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [goTo]);

  useEffect(() => {
    const shimmerLoop = () => {
      shimmerX.setValue(-CARD_W);
      Animated.timing(shimmerX, { toValue: CARD_W * 1.2, duration: 2200, easing: Easing.linear, useNativeDriver: true, delay: 600 }).start(shimmerLoop);
    };
    shimmerLoop();
  }, [shimmerX]);

  useEffect(() => {
    const sparkleLoop = () => {
      sparkleAnim.setValue(0);
      Animated.timing(sparkleAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }).start(sparkleLoop);
    };
    sparkleLoop();
  }, [sparkleAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const promo = PROMOS[current];

  const handlePress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    router.push(promo.route as any);
  };

  const handlePrev = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const prev = (current - 1 + N) % N;
    goTo(prev, -1);
  };

  const handleNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const next = (current + 1) % N;
    goTo(next, 1);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={handlePress} style={styles.cardWrap}>
        <Animated.View style={[styles.card, { transform: [{ translateX: slideAnim }], opacity: fadeAnim }]}>
          <LinearGradient
            colors={promo.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Shimmer sweep */}
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerX }, { rotate: "12deg" }] },
            ]}
          >
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.18)", "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Sparkle particles */}
          <Sparkle x={14} y={10}  anim={sparkleAnim} size={5} color={promo.sparkle} />
          <Sparkle x={CARD_W * 0.55} y={8}  anim={sparkleAnim} size={4} color={promo.accent} />
          <Sparkle x={CARD_W * 0.78} y={22} anim={sparkleAnim} size={6} color={promo.sparkle} />
          <Sparkle x={CARD_W * 0.88} y={60} anim={sparkleAnim} size={4} color={promo.accent} />
          <Sparkle x={22} y={72} anim={sparkleAnim} size={3} color={promo.sparkle} />

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.textArea}>
              <Text style={styles.title} numberOfLines={1}>{promo.title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>{promo.subtitle}</Text>

              {/* CTA pill */}
              <Animated.View style={[styles.ctaWrap, { transform: [{ scale: pulseAnim }] }]}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0.14)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaGrad}
                >
                  <Feather name={promo.icon} size={12} color="#fff" />
                  <Text style={styles.ctaText}>{promo.cta}</Text>
                  <Feather name="arrow-right" size={12} color={promo.accent} />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Right decoration */}
            <View style={styles.rightDeco}>
              <LinearGradient
                colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.06)"]}
                style={styles.iconCircle}
              >
                <Feather name={promo.icon} size={26} color="#fff" />
              </LinearGradient>
              <Animated.View style={[styles.iconRing, { opacity: pulseAnim.interpolate({ inputRange: [1, 1.04], outputRange: [0.5, 0.18] }) }]} />
            </View>
          </View>

          {/* Tap left/right zones */}
          <Pressable style={styles.tapLeft}  onPress={handlePrev} hitSlop={6} />
          <Pressable style={styles.tapRight} onPress={handleNext} hitSlop={6} />
        </Animated.View>
      </Pressable>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {PROMOS.map((_, i) => {
          const w = dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [6, 20] });
          const op = dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
          return (
            <Pressable key={i} onPress={() => { if (timerRef.current) clearTimeout(timerRef.current); goTo(i, i > current ? 1 : -1); }}>
              <Animated.View style={[styles.dot, { width: w, opacity: op, backgroundColor: PROMOS[i].accent }]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:   { marginHorizontal: 16, marginTop: 10, marginBottom: 4 },
  cardWrap:  { borderRadius: 18, overflow: "hidden", height: CARD_H },
  card:      { flex: 1, borderRadius: 18, overflow: "hidden" },
  shimmer:   { position: "absolute", top: -20, bottom: -20, width: 90 },
  sparkle:   { position: "absolute" },
  content:   { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14, gap: 12 },
  textArea:  { flex: 1, gap: 3 },
  title:     { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.3 },
  subtitle:  { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.82)", lineHeight: 16 },
  ctaWrap:   { alignSelf: "flex-start", marginTop: 6 },
  ctaGrad:   { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
  ctaText:   { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  rightDeco: { alignItems: "center", justifyContent: "center", width: 68 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  iconRing:  { position: "absolute", width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: "#fff" },
  tapLeft:   { position: "absolute", left: 0, top: 0, bottom: 0, width: "30%" },
  tapRight:  { position: "absolute", right: 0, top: 0, bottom: 0, width: "30%" },
  dots:      { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8, gap: 5 },
  dot:       { height: 6, borderRadius: 3 },
});
