import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  showRing?: boolean;
  hasStory?: boolean;
}

export function Avatar({ name, uri, size = 44, showRing, hasStory }: AvatarProps) {
  const colors = useColors();
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.accent]}
        style={[
          styles.storyRing,
          { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 },
        ]}
      >
        <View style={[styles.storyBorder, { width: size + 2, height: size + 2, borderRadius: (size + 2) / 2 }]}>
          {inner}
        </View>
      </LinearGradient>
    );
  }

  if (showRing) {
    return (
      <View
        style={[
          styles.ring,
          { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, borderColor: colors.primary },
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
  storyRing: { alignItems: "center", justifyContent: "center", padding: 2 },
  storyBorder: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  ring: { borderWidth: 2, alignItems: "center", justifyContent: "center" },
});
