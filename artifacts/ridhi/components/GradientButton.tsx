import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
  outline?: boolean;
}

export function GradientButton({ label, onPress, loading, disabled, style, small, outline }: GradientButtonProps) {
  const colors = useColors();

  if (outline) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.button,
          small && styles.small,
          { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: "transparent" },
          pressed && { opacity: 0.7 },
          (disabled || loading) && { opacity: 0.5 },
          style,
        ]}
      >
        <Text style={[styles.label, { color: colors.primary }, small && styles.smallLabel]}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.wrapper,
        small && styles.small,
        pressed && { opacity: 0.85 },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, small && styles.smallGradient]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={[styles.label, small && styles.smallLabel]}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 50 },
  small: { borderRadius: 50 },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  smallGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  smallLabel: { fontSize: 14 },
});
