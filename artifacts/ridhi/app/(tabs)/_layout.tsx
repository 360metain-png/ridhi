import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";
import { TooltipTour } from "@/components/TooltipTour";

function AnimatedTabIcon({
  name,
  focused,
  color,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  focused: boolean;
  color: string;
}) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1.18, useNativeDriver: true, speed: 50, bounciness: 12 }),
        Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30 }),
        Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
      {focused && (
        <Animated.View
          style={[
            styles.iconGlow,
            {
              opacity: glowAnim,
              shadowColor: colors.primary,
            },
          ]}
        />
      )}
      <Feather name={name} size={22} color={color} />
      {focused && (
        <Animated.View style={[styles.activeDot, { backgroundColor: colors.primary, opacity: glowAnim }]} />
      )}
    </Animated.View>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  const colors = useColors();
  return (
    <Text style={[
      styles.tabLabel,
      { color: focused ? colors.primary : colors.mutedForeground },
    ]}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            elevation: 0,
            height: isWeb ? 84 : 66,
            paddingBottom: isWeb ? 34 : 12,
            paddingTop: 6,
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={80}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]} />
            ),
          tabBarLabelStyle: { display: "none" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="home" focused={focused} color={color} />
            ),
            tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="reels"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="play" focused={focused} color={color} />
            ),
            tabBarLabel: ({ focused }) => <TabLabel label="Reels" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="voice-reels"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="mic" focused={focused} color={color} />
            ),
            tabBarLabel: ({ focused }) => <TabLabel label="Voice" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="match"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="heart" focused={focused} color={color} />
            ),
            tabBarLabel: ({ focused }) => <TabLabel label="Vibe" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="message-circle" focused={focused} color={color} />
            ),
            tabBarLabel: ({ focused }) => <TabLabel label="Chat" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="user" focused={focused} color={color} />
            ),
            tabBarLabel: ({ focused }) => <TabLabel label="Profile" focused={focused} />,
          }}
        />
      </Tabs>
      <TooltipTour />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 36,
    position: "relative",
  },
  iconGlow: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "transparent",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 0 12px rgba(233,30,140,0.6)" }
      : { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 0 }),
  },
  activeDot: {
    position: "absolute",
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    marginTop: -2,
  },
});
