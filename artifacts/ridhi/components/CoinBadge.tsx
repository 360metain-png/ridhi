import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";
import { RidhiCoin } from "@/components/RidhiCoin";

interface CoinBadgeProps {
  amount: number;
  style?: ViewStyle;
  size?: "sm" | "md" | "lg";
}

export function CoinBadge({ amount, style, size = "md" }: CoinBadgeProps) {
  const colors = useColors();
  const coinSize = size === "sm" ? 14 : size === "lg" ? 24 : 18;
  const fontSize = size === "sm" ? 11 : size === "lg" ? 18 : 13;

  return (
    <View style={[styles.badge, { backgroundColor: colors.gold + "22" }, style]}>
      <RidhiCoin size={coinSize} />
      <Text style={[styles.text, { color: colors.gold, fontSize }]}>{amount.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: { fontFamily: "Inter_600SemiBold" },
});
