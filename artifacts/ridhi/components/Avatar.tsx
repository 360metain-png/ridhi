import React, { useEffect, useRef } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

// ─── DiceBear avatar helpers ──────────────────────────────────────────────────
// Male  → avataaars  (Memoji-like cartoon faces — masculine)
// Female → avataaars  (Memoji-like cartoon faces — feminine seeds)
// Other  → micah     (illustrated neutral face portraits)

const BG = "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,c1e1c5";

export function getAvatarUrl(name: string, gender?: string): string {
  const seed = encodeURIComponent((name ?? "user").trim() || "user");
  if (gender === "female") {
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=200&backgroundColor=${BG}`;
  }
  if (gender === "male") {
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${seed}&size=200&backgroundColor=${BG}`;
  }
  return `https://api.dicebear.com/7.x/micah/png?seed=${seed}&size=200&backgroundColor=${BG}`;
}

// Seeds chosen so the avataaars generator produces clearly masculine / feminine looks
const FEMALE_SEEDS = ["priya", "kavya", "ananya", "riya", "meera", "sneha", "pooja", "divya"];
const MALE_SEEDS   = ["warrior", "hero", "titan", "blade", "king", "ace", "storm", "bolt"];
const OTHER_SEEDS  = ["alex", "nova", "sky", "cloud", "river", "phoenix", "ember", "comet"];

function styleFor(gender?: string) {
  if (gender === "female") return "avataaars";
  if (gender === "male")   return "avataaars";
  return "micah";
}

export function getAvatarOptions(gender?: string): string[] {
  const seeds =
    gender === "female" ? FEMALE_SEEDS :
    gender === "male"   ? MALE_SEEDS   :
    OTHER_SEEDS;
  const style = styleFor(gender);
  return seeds.map(
    (s) => `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(s)}&size=200&backgroundColor=${BG}`
  );
}

// ─── Avatar picker (inline horizontal scroll grid) ────────────────────────────

interface AvatarPickerProps {
  gender?: string;
  selected?: string;
  onSelect: (uri: string) => void;
}

export function AvatarPicker({ gender, selected, onSelect }: AvatarPickerProps) {
  const colors = useColors();
  const options = getAvatarOptions(gender);
  const label =
    gender === "female" ? "✨ Feminine avatars" :
    gender === "male"   ? "⚡ Masculine avatars" :
    "🌈 Neutral avatars";
  return (
    <View>
      <Text style={[pickerStyles.hint, { color: colors.mutedForeground }]}>
        {label} — tap one to pick
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pickerStyles.row}>
        {options.map((uri) => {
          const isSelected = selected === uri;
          return (
            <TouchableOpacity key={uri} onPress={() => onSelect(uri)} style={pickerStyles.optionWrap} activeOpacity={0.8}>
              <View
                style={[
                  pickerStyles.optionRing,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + "15" : colors.card,
                  },
                ]}
              >
                <Image source={{ uri }} style={pickerStyles.optionImg} />
                {isSelected && (
                  <View style={[pickerStyles.checkBadge, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={9} color="#fff" />
                  </View>
                )}
              </View>
              {isSelected && (
                <Text style={[pickerStyles.selectedLabel, { color: colors.primary }]}>Selected ✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  hint:          { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 10, textAlign: "center" },
  row:           { gap: 10, paddingHorizontal: 4, paddingVertical: 6 },
  optionWrap:    { alignItems: "center", gap: 5 },
  optionRing:    { width: 72, height: 72, borderRadius: 36, borderWidth: 2.5, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  optionImg:     { width: 66, height: 66, borderRadius: 33 },
  checkBadge:    { position: "absolute", bottom: 2, right: 2, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#fff" },
  selectedLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});

// ─── Avatar component ─────────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  uri?: string;
  gender?: "male" | "female" | "other" | string;
  size?: number;
  showRing?: boolean;
  hasStory?: boolean;
  animate?: boolean;
}

export function Avatar({ name, uri, gender, size = 44, showRing, hasStory, animate = true }: AvatarProps) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (hasStory && animate) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 0.5, duration: 900, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [hasStory, animate]);

  // Always resolve to an image — uploaded photo OR auto gender-based Memoji-style avatar
  const avatarUri = uri ?? getAvatarUrl(name, gender);

  const inner = (
    <Image
      source={{ uri: avatarUri }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.muted }}
    />
  );

  if (hasStory) {
    return (
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: size + 14,
              height: size + 14,
              borderRadius: (size + 14) / 2,
              opacity: glowOpacity,
            },
          ]}
        />
        <LinearGradient
          colors={["#E91E8C", "#7B2FBE", "#FF6B35"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.storyRing, { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 }]}
        >
          <View
            style={[
              styles.storyBorder,
              { width: size + 2, height: size + 2, borderRadius: (size + 2) / 2, backgroundColor: colors.background },
            ]}
          >
            {inner}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  if (showRing) {
    return (
      <View
        style={[
          styles.ring,
          { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, borderColor: colors.primary + "60" },
        ]}
      >
        {inner}
      </View>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  glowRing: {
    position: "absolute",
    top: -4,
    left: -4,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#E91E8C",
    shadowColor: "#E91E8C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 0,
  },
  storyRing:   { alignItems: "center", justifyContent: "center", padding: 2 },
  storyBorder: { alignItems: "center", justifyContent: "center", padding: 2 },
  ring:        { borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});
