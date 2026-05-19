import React from "react";
import { View, Text, ViewStyle, TextStyle } from "react-native";
import { RidhiCoin } from "@/components/RidhiCoin";

interface CoinAmountProps {
  amount: string | number;
  size?: number;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function CoinAmount({
  amount,
  size = 16,
  color,
  fontFamily = "Inter_600SemiBold",
  fontSize = 14,
  style,
  textStyle,
}: CoinAmountProps) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]}>
      <RidhiCoin size={size} />
      <Text style={[{ fontFamily, fontSize }, color ? { color } : undefined, textStyle]}>
        {amount}
      </Text>
    </View>
  );
}
