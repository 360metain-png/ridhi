import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { type PopupAdConfig } from "@/data/mockData";

const { width: SW, height: SH } = Dimensions.get("window");

interface PopupAdProps {
  ad: PopupAdConfig;
  onDismiss: () => void;
}

const TIER_COLOR: Record<string, string> = {
  Diamond: "#B56FFF",
  Gold:    "#FFB800",
  Premium: "#E91E8C",
};

export function PopupAd({ ad, onDismiss }: PopupAdProps) {
  const [countdown,   setCountdown]   = useState(ad.dismissAfterSecs > 0 ? ad.dismissAfterSecs : 0);
  const [canDismiss,  setCanDismiss]  = useState(ad.dismissAfterSecs === 0);
  const scaleAnim  = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 1,   useNativeDriver: true, tension: 120, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (ad.dismissAfterSecs <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanDismiss(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ad.dismissAfterSecs]);

  const handleCta = () => {
    onDismiss();
    router.push(ad.ctaRoute as any);
  };

  const textCol  = ad.textColor === "white" ? "#fff" : "#1A1A2E";
  const mutedCol = ad.textColor === "white" ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.55)";
  const tierColor = TIER_COLOR[ad.clientTier] ?? "#7B2FBE";

  const isCenter = ad.type === "center" || ad.type === "bottomsheet";

  return (
    <Modal transparent animationType="none" visible statusBarTranslucent onRequestClose={canDismiss ? onDismiss : undefined}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={canDismiss ? onDismiss : undefined} />

        <Animated.View
          style={[
            styles.cardWrap,
            ad.type === "bottomsheet" && styles.bottomSheet,
            ad.type === "fullscreen" && styles.fullscreen,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={ad.gradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, ad.type === "fullscreen" && styles.cardFullscreen]}
          >
            <View style={styles.header}>
              <View style={[styles.tierBadge, { backgroundColor: "rgba(0,0,0,0.2)" }]}>
                <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
                <Text style={[styles.tierText, { color: mutedCol }]}>
                  {ad.clientTier} · Sponsored by {ad.clientName}
                </Text>
              </View>
              {canDismiss ? (
                <Pressable onPress={onDismiss} style={styles.closeBtn} accessibilityLabel="Close ad">
                  <Feather name="x" size={18} color={mutedCol} />
                </Pressable>
              ) : (
                <View style={[styles.timerBadge, { backgroundColor: "rgba(0,0,0,0.22)" }]}>
                  <Text style={[styles.timerText, { color: mutedCol }]}>{countdown}s</Text>
                </View>
              )}
            </View>

            <View style={styles.body}>
              <Text style={[styles.headline, { color: textCol }]}>{ad.headline}</Text>
              <Text style={[styles.bodyText, { color: mutedCol }]}>{ad.body}</Text>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={handleCta} activeOpacity={0.85} style={styles.ctaWrapper}>
                <View style={[styles.ctaBtn, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                  <Text style={[styles.ctaText, { color: textCol }]}>{ad.ctaText}</Text>
                  <Feather name="arrow-right" size={16} color={textCol} />
                </View>
              </TouchableOpacity>

              {canDismiss && (
                <Pressable onPress={onDismiss} style={styles.skipBtn}>
                  <Text style={[styles.skipText, { color: mutedCol }]}>Not now</Text>
                </Pressable>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrap: {
    width: SW - 40,
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    width: undefined,
    maxWidth: undefined,
    borderRadius: 24,
  },
  fullscreen: {
    width: SW,
    maxWidth: SW,
    borderRadius: 0,
  },
  card: {
    padding: 24,
    gap: 20,
  },
  cardFullscreen: {
    minHeight: SH,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  tierText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    flexShrink: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  timerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  body: {
    gap: 10,
  },
  headline: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 33,
  },
  bodyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  footer: {
    gap: 12,
  },
  ctaWrapper: {
    borderRadius: 14,
    overflow: "hidden",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
