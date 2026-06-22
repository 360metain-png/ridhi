import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { type BannerAdConfig } from "@/data/mockData";

interface BannerAdProps {
  ad: BannerAdConfig;
  onImpression?: () => void;
  onClick?: () => void;
}

const TIER_COLOR: Record<string, string> = {
  Diamond: "#B56FFF",
  Gold:    "#FFB800",
  Premium: "#E91E8C",
};

export function BannerAd({ ad, onImpression, onClick }: BannerAdProps) {
  const [dismissed, setDismissed] = useState(false);
  const [impressed, setImpressed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!impressed && onImpression) {
        setImpressed(true);
        onImpression();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed) return null;

  const textCol = ad.textColor === "white" ? "#fff" : "#1A1A2E";
  const mutedCol = ad.textColor === "white" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)";
  const tierColor = TIER_COLOR[ad.clientTier] ?? "#7B2FBE";

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={ad.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={[styles.sponsoredBadge, { backgroundColor: "rgba(0,0,0,0.22)" }]}>
            <Feather name="zap" size={9} color={tierColor} />
            <Text style={[styles.sponsoredText, { color: mutedCol }]}>
              Sponsored · {ad.clientTier}
            </Text>
          </View>
          <Pressable
            onPress={() => setDismissed(true)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            style={styles.dismissBtn}
            accessibilityLabel="Dismiss ad"
          >
            <Feather name="x" size={14} color={mutedCol} />
          </Pressable>
        </View>

        <Text style={[styles.headline, { color: textCol }]} numberOfLines={2}>
          {ad.headline}
        </Text>

        <Text style={[styles.body, { color: mutedCol }]} numberOfLines={2}>
          {ad.body}
        </Text>

        <View style={styles.bottomRow}>
          <View style={[styles.clientTag, { backgroundColor: "rgba(0,0,0,0.18)" }]}>
            <View style={[styles.clientDot, { backgroundColor: tierColor }]} />
            <Text style={[styles.clientName, { color: mutedCol }]}>{ad.clientName}</Text>
          </View>
          <Pressable
            onPress={() => router.push(ad.ctaRoute as any)}
            style={[styles.ctaBtn, { backgroundColor: "rgba(255,255,255,0.22)" }]}
            accessibilityLabel={ad.ctaText}
          >
            <Text style={[styles.ctaText, { color: textCol }]}>{ad.ctaText}</Text>
            <Feather name="arrow-right" size={12} color={textCol} />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  card: {
    padding: 16,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sponsoredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sponsoredText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  dismissBtn: {
    padding: 2,
  },
  headline: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    lineHeight: 23,
  },
  body: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  clientTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  clientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  clientName: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  ctaText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
});
