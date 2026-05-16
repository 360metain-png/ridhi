import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface CoinBadgeProps {
  amount: number;
  style?: ViewStyle;
  size?: "sm" | "md" | "lg";
}

export function CoinBadge({ amount, style, size = "md" }: CoinBadgeProps) {
  const colors = useColors();
  const iconSize = size === "sm" ? 12 : size === "lg" ? 20 : 15;
  const fontSize = size === "sm" ? 11 : size === "lg" ? 18 : 13;

  return (
    <View style={[styles.badge, { backgroundColor: colors.gold + "22" }, style]}>
      <Feather name="star" size={iconSize} color={colors.gold} />
      <Text style={[styles.text, { color: colors.gold, fontSize }]}>{amount.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: { fontFamily: "Inter_600SemiBold" },
});
