import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
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
  const shimmerX = useRef(new Animated.Value(-1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!outline && !disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerX, { toValue: 2, duration: 2200, useNativeDriver: true }),
          Animated.delay(1200),
          Animated.timing(shimmerX, { toValue: -1, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [outline, disabled]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
  };

  if (outline) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={[
            styles.button,
            small && styles.small,
            {
              borderWidth: 1.5,
              borderColor: colors.primary,
              backgroundColor: colors.primary + "10",
            },
            (disabled || loading) && { opacity: 0.5 },
          ]}
        >
          <Text style={[styles.label, { color: colors.primary }, small && styles.smallLabel]}>{label}</Text>
        </Pressable>
      </Animated.View>
    );
  }

  const shimmerTranslate = shimmerX.interpolate({
    inputRange: [-1, 2],
    outputRange: [-120, 320],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        small && styles.small,
        { transform: [{ scale: scaleAnim }] },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={["#E91E8C", "#9B2FCC", "#7B2FBE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            small && styles.smallGradient,
            {
              shadowColor: "#E91E8C",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.45,
              shadowRadius: 16,
              elevation: 10,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.label, small && styles.smallLabel]}>{label}</Text>
          )}
          {!loading && !disabled && (
            <Animated.View
              style={[
                styles.shimmer,
                { transform: [{ translateX: shimmerTranslate }, { rotate: "20deg" }] },
              ]}
            />
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 50, overflow: "hidden" },
  small: { borderRadius: 50 },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
    letterSpacing: 0.5,
  },
  smallLabel: { fontSize: 14 },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
});
