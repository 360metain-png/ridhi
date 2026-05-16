import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { GradientButton } from "@/components/GradientButton";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "users",
    title: "Connect & Belong",
    subtitle: "Join millions of Indians sharing moments, building friendships, and finding love",
    gradient: ["#E91E8C", "#7B2FBE"] as [string, string],
  },
  {
    id: "2",
    icon: "heart",
    title: "Find Your Match",
    subtitle: "Smart matching powered by your interests, location, and personality",
    gradient: ["#FF6B35", "#E91E8C"] as [string, string],
  },
  {
    id: "3",
    icon: "video",
    title: "Create & Earn",
    subtitle: "Share reels, go live, earn coins, and grow your community on Ridhi",
    gradient: ["#7B2FBE", "#4A90E2"] as [string, string],
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
  });

  const next = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      router.replace("/auth/login");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.id}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient
              colors={[item.gradient[0] + "18", item.gradient[1] + "10"]}
              style={styles.iconBg}
            >
              <LinearGradient colors={item.gradient} style={styles.iconCircle}>
                <Feather name={item.icon as any} size={44} color="#fff" />
              </LinearGradient>
            </LinearGradient>
            <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <LinearGradient
              key={i}
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : { opacity: 0.25, width: 8 },
              ]}
            />
          ))}
        </View>

        <GradientButton
          label={activeIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
          onPress={next}
          style={{ width: width - 48 }}
        />

        <Pressable onPress={() => router.replace("/auth/login")} style={styles.skip}>
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
            Already have an account? <Text style={{ color: colors.primary }}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 24,
  },
  iconBg: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E91E8C",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: { paddingHorizontal: 24, gap: 20, alignItems: "center" },
  dots: { flexDirection: "row", gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  skip: { paddingVertical: 4 },
  skipText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
