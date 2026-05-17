import React from "react";
import { Image, ImageStyle, StyleSheet } from "react-native";

const coinImage = require("@/assets/images/ridhi_coin.png");

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
