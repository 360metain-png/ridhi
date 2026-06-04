import React from "react";
import { Image, ImageStyle, Text, View } from "react-native";

// Use relative require path for Metro bundler compatibility
const coinImage = require("../assets/images/ridhi_coin.png");

interface RidhiCoinProps {
  size?: number;
  style?: ImageStyle;
}

export function RidhiCoin({ size = 20, style }: RidhiCoinProps) {
  return (
    <Image
      source={coinImage}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

/** Fallback coin emoji for when the image asset fails to load */
export function CoinEmoji({ size = 20 }: { size?: number }) {
  return (
    <Text style={{ fontSize: size * 1.1, lineHeight: size * 1.2 }}>🪙</Text>
  );
}
