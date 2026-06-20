import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const TOUR_KEY = "ridhi_tab_tour_seen";

const TABS = [
  { name: "Home", label: "Home", icon: "home", desc: "Scroll your feed, discover stories, live streams, and trending posts" },
  { name: "Reels", label: "Reels", icon: "play", desc: "Swipe through short videos, duet, stitch, and apply filters" },
  { name: "Match", label: "Match", icon: "heart", desc: "Find your match — swipe right to like, left to pass" },
  { name: "Chat", label: "Chat", icon: "message-circle", desc: "Chat with matches, hosts, and communities" },
  { name: "Profile", label: "Profile", icon: "user", desc: "Your stats, posts, wallet, settings, and creator tools" },
];

interface TooltipTourProps {
  onDismiss?: () => void;
}

export function TooltipTour({ onDismiss }: TooltipTourProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    AsyncStorage.getItem(TOUR_KEY).then((seen) => {
      if (seen !== "true") {
        setVisible(true);
        Animated.parallel([
          Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    });
  }, []);

  const dismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 20, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setVisible(false);
      AsyncStorage.setItem(TOUR_KEY, "true");
      onDismiss?.();
    });
  };

  const nextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TABS.length - 1) {
      Animated.sequence([
        Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  };

  const prevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  if (!visible) return null;

  const tab = TABS[step];
  const { width } = Dimensions.get("window");
  const tabWidth = width / 5;
  const tabCenter = tabWidth * step + tabWidth / 2;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Dimmed background */}
      <View style={styles.dim} />

      {/* Tooltip card */}
      <View style={[styles.card, { top: Platform.OS === "ios" ? 80 : 60 }]}>
        {/* Arrow pointing to tab */}
        <View style={[styles.arrow, { left: Math.max(20, Math.min(tabCenter - 8, width - 40)) }]} />

        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: "#E91E8C" }]}>
            <Feather name={tab.icon as any} size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{tab.label}</Text>
            <Text style={styles.cardDesc}>{tab.desc}</Text>
          </View>
        </View>

        {/* Step dots */}
        <View style={styles.dotsRow}>
          {TABS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === step && { backgroundColor: "#E91E8C", width: 18 },
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <Pressable style={styles.btnSecondary} onPress={dismiss}>
            <Text style={styles.btnSecondaryText}>Skip</Text>
          </Pressable>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {step > 0 && (
              <Pressable style={styles.btnSecondary} onPress={prevStep}>
                <Text style={styles.btnSecondaryText}>Back</Text>
              </Pressable>
            )}
            <Pressable style={styles.btnPrimary} onPress={nextStep}>
              <Text style={styles.btnPrimaryText}>
                {step === TABS.length - 1 ? "Got it!" : "Next"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  card: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  arrow: {
    position: "absolute",
    top: -8,
    width: 16,
    height: 16,
    backgroundColor: "#1C1C1E",
    transform: [{ rotate: "45deg" }],
    borderRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  cardDesc: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
    lineHeight: 18,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3A3A3C",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  btnPrimary: {
    backgroundColor: "#E91E8C",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  btnSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btnSecondaryText: {
    color: "#8E8E93",
    fontWeight: "500",
    fontSize: 14,
  },
});
