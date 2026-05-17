import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  showRing?: boolean;
  hasStory?: boolean;
  animate?: boolean;
}

export function Avatar({ name, uri, size = 44, showRing, hasStory, animate = true }: AvatarProps) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (hasStory && animate) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 0.5, duration: 900, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [hasStory, animate]);

  const inner = uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </LinearGradient>
  );

  if (hasStory) {
    return (
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: size + 14,
              height: size + 14,
              borderRadius: (size + 14) / 2,
              opacity: glowOpacity,
            },
          ]}
        />
        <LinearGradient
          colors={["#E91E8C", "#7B2FBE", "#FF6B35"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.storyRing,
            { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 },
          ]}
        >
          <View
            style={[
              styles.storyBorder,
              {
                width: size + 2,
                height: size + 2,
                borderRadius: (size + 2) / 2,
                backgroundColor: colors.background,
              },
            ]}
          >
            {inner}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  if (showRing) {
    return (
      <View
        style={[
          styles.ring,
          {
            width: size + 4,
            height: size + 4,
            borderRadius: (size + 4) / 2,
            borderColor: colors.primary + "60",
          },
        ]}
      >
        {inner}
      </View>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  placeholder: { alignItems: "center", justifyContent: "center" },
  initials: { color: "#fff", fontFamily: "Inter_700Bold" },
  glowRing: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#E91E8C",
    shadowColor: "#E91E8C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 0,
  },
  storyRing: { alignItems: "center", justifyContent: "center", padding: 2 },
  storyBorder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  ring: { borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});
