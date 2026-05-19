import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type VipTier =
  | "free"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "creator_basic"
  | "creator_pro"
  | "creator_elite";

interface SubscriptionBadgeProps {
  tier: VipTier;
  size?: "sm" | "md" | "lg";
  style?: object;
}

// ─── Tier visual config ─────────────────────────────────────────────────────
type TierConfig = {
  label: string;
  icon: string;
  gradient: readonly [string, string, ...string[]];
  shimmerColor: string;
  textColor: string;
  glowColor: string;
  pulse: boolean;
  spin: boolean;
};

const TIER_CONFIG: Record<Exclude<VipTier, "free">, TierConfig> = {
  silver: {
    label: "Silver",
    icon: "✦",
    gradient: ["#9E9E9E", "#E8E8E8", "#BDBDBD"],
    shimmerColor: "rgba(255,255,255,0.7)",
    textColor: "#2C2C2C",
    glowColor: "#E0E0E0",
    pulse: false,
    spin: false,
  },
  gold: {
    label: "Gold",
    icon: "★",
    gradient: ["#B8860B", "#FFD700", "#FFA500"],
    shimmerColor: "rgba(255,255,200,0.75)",
    textColor: "#3D2000",
    glowColor: "#FFD700",
    pulse: true,
    spin: false,
  },
  platinum: {
    label: "Platinum VIP",
    icon: "💠",
    gradient: ["#4A148C", "#9C6FDB", "#7B2FBE"],
    shimmerColor: "rgba(210,190,255,0.65)",
    textColor: "#fff",
    glowColor: "#9C6FDB",
    pulse: true,
    spin: false,
  },
  diamond: {
    label: "Diamond Elite",
    icon: "💎",
    gradient: ["#00BFFF", "#7B2FBE", "#E91E8C", "#FFD700"],
    shimmerColor: "rgba(255,255,255,0.75)",
    textColor: "#fff",
    glowColor: "#00BFFF",
    pulse: true,
    spin: true,
  },
  creator_basic: {
    label: "Creator",
    icon: "✦",
    gradient: ["#7B2FBE", "#9C4FDE"],
    shimmerColor: "rgba(200,160,255,0.5)",
    textColor: "#fff",
    glowColor: "#7B2FBE",
    pulse: false,
    spin: false,
  },
  creator_pro: {
    label: "Creator Pro",
    icon: "⭐",
    gradient: ["#E91E8C", "#7B2FBE"],
    shimmerColor: "rgba(255,200,240,0.55)",
    textColor: "#fff",
    glowColor: "#E91E8C",
    pulse: true,
    spin: false,
  },
  creator_elite: {
    label: "Creator Elite",
    icon: "👑",
    gradient: ["#FFB800", "#E91E8C", "#7B2FBE"],
    shimmerColor: "rgba(255,255,180,0.65)",
    textColor: "#fff",
    glowColor: "#FFB800",
    pulse: true,
    spin: false,
  },
};

// ─── Size config ────────────────────────────────────────────────────────────
const SIZE = {
  sm: { h: 18, px: 6, fontSize: 9,  iconSize: 9,  radius: 9,  shimmerW: 30, borderW: 1.5 },
  md: { h: 23, px: 9, fontSize: 11, iconSize: 11, radius: 12, shimmerW: 50, borderW: 2   },
  lg: { h: 30, px: 13,fontSize: 14, iconSize: 14, radius: 15, shimmerW: 70, borderW: 2.5 },
};

// ─── Component ───────────────────────────────────────────────────────────────
export function SubscriptionBadge({
  tier,
  size = "md",
  style,
}: SubscriptionBadgeProps) {
  if (tier === "free") return null;

  const cfg = TIER_CONFIG[tier];
  const sz  = SIZE[size];

  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(0)).current;
  const spinAnim    = useRef(new Animated.Value(0)).current;
  const glowAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // ── Shimmer ──────────────────────────────────────────────────────────────
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: tier === "diamond" ? 1200 : tier === "silver" ? 3000 : 2000,
        useNativeDriver: true,
      })
    );
    shimmerLoop.start();

    // ── Pulse scale ──────────────────────────────────────────────────────────
    if (cfg.pulse) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
    }

    // ── Glow opacity (for border ring) ───────────────────────────────────────
    if (tier === "diamond" || tier === "platinum") {
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])
      );
      glowLoop.start();
    }

    // ── Spin (diamond icon) ───────────────────────────────────────────────────
    if (cfg.spin) {
      const spinLoop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      );
      spinLoop.start();
    }

    return () => {
      shimmerLoop.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-sz.shimmerW - 20, 220],
  });

  const pulseScale = cfg.pulse
    ? pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.055] })
    : 1;

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  const spinDeg = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const showGlow = tier === "diamond" || tier === "platinum";

  return (
    <Animated.View style={[{ transform: [{ scale: pulseScale }] }, style]}>
      {/* Glow ring behind badge */}
      {showGlow && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: sz.radius + 3,
              borderWidth: sz.borderW,
              borderColor: cfg.glowColor,
              opacity: glowOpacity,
              margin: -sz.borderW - 1,
            },
          ]}
        />
      )}

      <LinearGradient
        colors={cfg.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.pill,
          {
            height: sz.h,
            paddingHorizontal: sz.px,
            borderRadius: sz.radius,
          },
        ]}
      >
        {/* Shimmer sweep */}
        <View style={[StyleSheet.absoluteFill, { overflow: "hidden", borderRadius: sz.radius }]}>
          <Animated.View
            style={[
              styles.shimmer,
              {
                width: sz.shimmerW,
                height: sz.h,
                backgroundColor: cfg.shimmerColor,
                transform: [
                  { translateX: shimmerTranslate },
                  { skewX: "-18deg" },
                ],
              },
            ]}
          />
        </View>

        {/* Icon — spins if diamond */}
        {cfg.spin ? (
          <Animated.Text
            style={[styles.icon, { fontSize: sz.iconSize, transform: [{ rotate: spinDeg }] }]}
          >
            {cfg.icon}
          </Animated.Text>
        ) : (
          <Text style={[styles.icon, { fontSize: sz.iconSize, color: cfg.textColor }]}>
            {cfg.icon}
          </Text>
        )}

        {/* Label */}
        <Text style={[styles.label, { fontSize: sz.fontSize, color: cfg.textColor }]}>
          {cfg.label}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
  },
  icon: {
    lineHeight: undefined,
  },
  label: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
