import { BlurView } from "expo-blur";
import { Tabs, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, View, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
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
          height: isWeb ? 84 : 62,
          paddingBottom: isWeb ? 34 : 10,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
          ) : null,
        tabBarLabelStyle: { fontSize: 10, fontFamily: "Inter_500Medium" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, focused }) => (
            <Feather name={focused ? "home" : "home"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: "Reels",
          tabBarIcon: ({ color }) => <Feather name="play" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="match"
        options={{
          title: "",
          tabBarIcon: () => (
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.createBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="heart" size={24} color="#fff" />
            </LinearGradient>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Feather name="message-circle" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#E91E8C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
