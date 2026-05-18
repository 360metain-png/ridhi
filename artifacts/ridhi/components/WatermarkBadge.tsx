import React from "react";
import { Image, StyleSheet, View } from "react-native";

const LOGO = require("@/assets/images/ridhi_logo.png");

interface Props {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "sm" | "md";
  opacity?: number;
}

export function WatermarkBadge({ position = "bottom-right", size = "sm", opacity = 0.55 }: Props) {
  const dim = size === "sm" ? 28 : 38;
  const posStyle = {
    "bottom-right": { bottom: 54, right: 12 },
    "bottom-left":  { bottom: 54, left: 12 },
    "top-right":    { top: 12, right: 12 },
    "top-left":     { top: 12, left: 12 },
  }[position];

  return (
    <View style={[styles.wrap, posStyle, { opacity, pointerEvents: "none" }]}>
      <Image source={LOGO} style={{ width: dim, height: dim }} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    zIndex: 5,
  },
});
