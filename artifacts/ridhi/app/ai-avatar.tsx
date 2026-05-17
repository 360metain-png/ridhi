import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { GradientButton } from "@/components/GradientButton";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 56) / 3;

type Style = { id: string; label: string; emoji: string; desc: string };
type Vibe = { id: string; label: string; emoji: string };
type BgType = { id: string; label: string; colors: string[] };

const AVATAR_STYLES: Style[] = [
  { id: "anime", label: "Anime", emoji: "⛩️", desc: "Naruto / Shonen inspired" },
  { id: "cartoon", label: "Cartoon", emoji: "🎨", desc: "Bold & colourful" },
  { id: "realistic", label: "Realistic", emoji: "📸", desc: "Hyper-real portrait" },
  { id: "fantasy", label: "Fantasy", emoji: "🧝", desc: "Elf, wizard, dragon" },
  { id: "desi", label: "Desi", emoji: "🇮🇳", desc: "Indian warrior / royalty" },
  { id: "bollywood", label: "Bollywood", emoji: "✨", desc: "Glamour & glitter" },
  { id: "superhero", label: "Superhero", emoji: "🦸", desc: "Cape & powers" },
  { id: "celestial", label: "Celestial", emoji: "🌙", desc: "Stars, cosmos, divine" },
];

const VIBES: Vibe[] = [
  { id: "radiant", label: "Radiant", emoji: "☀️" },
  { id: "mysterious", label: "Mysterious", emoji: "🌑" },
  { id: "bold", label: "Bold", emoji: "🔥" },
  { id: "cute", label: "Cute", emoji: "🌸" },
  { id: "royal", label: "Royal", emoji: "👑" },
];

const BACKGROUNDS: BgType[] = [
  { id: "gradient", label: "Gradient", colors: ["#7B2FBE", "#E91E8C"] },
  { id: "cosmic", label: "Cosmic", colors: ["#0a0a2e", "#1a1a4e", "#7B2FBE"] },
  { id: "aurora", label: "Aurora", colors: ["#00c6ff", "#7B2FBE", "#E91E8C"] },
  { id: "fire", label: "Fire", colors: ["#ff4e00", "#ec9f05"] },
  { id: "forest", label: "Forest", colors: ["#134e5e", "#71b280"] },
  { id: "gold", label: "Royal Gold", colors: ["#373B44", "#FFB800"] },
];

// Predefined avatar visual configs — 6 unique art styles
const AVATAR_CONFIGS = [
  {
    bg: ["#7B2FBE", "#E91E8C"] as [string, string],
    icon: "star" as const,
    iconColor: "#fff",
    ring: "#FFB800",
    shape: "circle",
    glow: "#E91E8C",
    label: "Mystic Warrior",
  },
  {
    bg: ["#0a0a2e", "#4a0080"] as [string, string],
    icon: "moon" as const,
    iconColor: "#C8A2FF",
    ring: "#7B2FBE",
    shape: "diamond",
    glow: "#7B2FBE",
    label: "Celestial",
  },
  {
    bg: ["#ff4e00", "#ec9f05"] as [string, string],
    icon: "zap" as const,
    iconColor: "#fff",
    ring: "#FFB800",
    shape: "hexagon",
    glow: "#FF6B00",
    label: "Fire Devi",
  },
  {
    bg: ["#134e5e", "#71b280"] as [string, string],
    icon: "feather" as const,
    iconColor: "#fff",
    ring: "#71b280",
    shape: "circle",
    glow: "#71b280",
    label: "Elf Queen",
  },
  {
    bg: ["#1a1a2e", "#16213e"] as [string, string],
    icon: "shield" as const,
    iconColor: "#00c6ff",
    ring: "#00c6ff",
    shape: "square",
    glow: "#00c6ff",
    label: "Cyber Hero",
  },
  {
    bg: ["#373B44", "#FFB800"] as [string, string],
    icon: "award" as const,
    iconColor: "#fff",
    ring: "#FFB800",
    shape: "circle",
    glow: "#FFB800",
    label: "Bollywood Star",
  },
];

function AvatarCard({
  config,
  selected,
  onPress,
  shimmer,
  index,
}: {
  config: typeof AVATAR_CONFIGS[0];
  selected: boolean;
  onPress: () => void;
  shimmer: boolean;
  index: number;
}) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shimmer) {
      shimmerAnim.setValue(0);
      Animated.loop(
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
      ).start();
    } else {
      shimmerAnim.setValue(0);
      Animated.spring(entryAnim, {
        toValue: 1, delay: index * 80,
        tension: 140, friction: 8, useNativeDriver: true,
      }).start();
    }
  }, [shimmer]);

  if (shimmer) {
    return (
      <View style={[styles.avatarCard, { width: CARD_SIZE, height: CARD_SIZE + 32 }]}>
        <Animated.View style={[styles.shimmerBox, {
          width: CARD_SIZE, height: CARD_SIZE,
          opacity: shimmerAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 0.3] }),
        }]} />
        <View style={[styles.shimmerLabel, { width: CARD_SIZE * 0.7 }]} />
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }], opacity: entryAnim }}>
      <Pressable onPress={onPress} style={[styles.avatarCard, { width: CARD_SIZE, height: CARD_SIZE + 32 }]}>
        <View style={[styles.avatarFrame, {
          width: CARD_SIZE, height: CARD_SIZE, borderRadius: 16,
          borderWidth: selected ? 3 : 1.5,
          borderColor: selected ? config.ring : config.ring + "50",
          shadowColor: config.glow, shadowOffset: { width: 0, height: 0 },
          shadowOpacity: selected ? 0.8 : 0.3, shadowRadius: selected ? 12 : 4,
          elevation: selected ? 12 : 4,
        }]}>
          <LinearGradient colors={config.bg} style={StyleSheet.absoluteFill} />

          {/* Decorative inner circles */}
          <View style={[styles.decoCircle1, { backgroundColor: "#ffffff10" }]} />
          <View style={[styles.decoCircle2, { backgroundColor: "#ffffff08" }]} />

          {/* Face silhouette base */}
          <View style={[styles.faceBase, { backgroundColor: config.iconColor + "20", borderColor: config.iconColor + "40" }]}>
            <Feather name={config.icon} size={CARD_SIZE * 0.28} color={config.iconColor} />
          </View>

          {/* Sparkle dots */}
          <View style={[styles.sparkle1, { backgroundColor: config.ring }]} />
          <View style={[styles.sparkle2, { backgroundColor: config.iconColor }]} />
          <View style={[styles.sparkle3, { backgroundColor: config.ring + "80" }]} />

          {/* Bottom accent bar */}
          <LinearGradient
            colors={["transparent", config.glow + "60"]}
            style={styles.bottomAccent}
          />

          {selected && (
            <View style={[styles.selectedBadge, { backgroundColor: config.ring }]}>
              <Feather name="check" size={10} color="#fff" />
            </View>
          )}
        </View>
        <Text style={[styles.avatarLabel, { color: "#fff" }]} numberOfLines={1}>{config.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function AIAvatarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 16;

  const [selectedStyle, setSelectedStyle] = useState("anime");
  const [selectedVibe, setSelectedVibe] = useState("radiant");
  const [selectedBg, setSelectedBg] = useState("gradient");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerated(false);
    setSelectedAvatar(null);
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1, duration: 3200, useNativeDriver: false, easing: Easing.out(Easing.quad),
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    await new Promise((r) => setTimeout(r, 3400));
    setGenerating(false);
    setGenerated(true);
    pulseAnim.setValue(1);
  };

  const handleSetDP = () => {
    Animated.spring(successAnim, { toValue: 1, tension: 140, friction: 8, useNativeDriver: true }).start();
    setApplied(true);
    setTimeout(() => router.back(), 1800);
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  const STEPS = [
    "Analysing your preferences...",
    "Generating face structure...",
    "Applying style & vibe...",
    "Adding finishing touches...",
  ];
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    if (!generating) { setStepIdx(0); return; }
    const intervals = [0, 800, 1800, 2600].map((delay, i) =>
      setTimeout(() => setStepIdx(i), delay)
    );
    return () => intervals.forEach(clearTimeout);
  }, [generating]);

  return (
    <View style={[styles.container, { backgroundColor: "#0A0A12" }]}>
      <LinearGradient
        colors={["#7B2FBE22", "#E91E8C10", "transparent"]}
        style={[styles.headerGlow, { height: topPad + 200 }]}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.headerIcon}>
            <Feather name="aperture" size={16} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>AI Avatar</Text>
            <Text style={styles.headerSub}>Generate your perfect DP</Text>
          </View>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 80 }}>

        {/* --- Style Selector --- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Choose Style</Text>
          <View style={styles.styleGrid}>
            {AVATAR_STYLES.map((s) => {
              const active = selectedStyle === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => { setSelectedStyle(s.id); setGenerated(false); }}
                  style={[styles.styleCard, active && styles.styleCardActive]}
                >
                  {active && (
                    <LinearGradient colors={["#7B2FBE30", "#E91E8C20"]} style={StyleSheet.absoluteFill} />
                  )}
                  <Text style={styles.styleEmoji}>{s.emoji}</Text>
                  <Text style={[styles.styleLabel, { color: active ? "#E91E8C" : "#ccc" }]}>{s.label}</Text>
                  <Text style={[styles.styleDesc, { color: active ? "#E91E8C80" : "#666" }]}>{s.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* --- Vibe Selector --- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Pick a Vibe</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
            {VIBES.map((v) => {
              const active = selectedVibe === v.id;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => { setSelectedVibe(v.id); setGenerated(false); }}
                  style={[styles.vibeChip, {
                    backgroundColor: active ? "#E91E8C" : "#1A1A28",
                    borderColor: active ? "#E91E8C" : "#333",
                  }]}
                >
                  <Text style={styles.vibeEmoji}>{v.emoji}</Text>
                  <Text style={[styles.vibeLabel, { color: active ? "#fff" : "#aaa" }]}>{v.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* --- Background Selector --- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Background</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
            {BACKGROUNDS.map((bg) => {
              const active = selectedBg === bg.id;
              return (
                <Pressable
                  key={bg.id}
                  onPress={() => { setSelectedBg(bg.id); setGenerated(false); }}
                  style={[styles.bgChip, {
                    borderWidth: 2,
                    borderColor: active ? "#fff" : "transparent",
                  }]}
                >
                  <LinearGradient colors={bg.colors as any} style={styles.bgChipGradient} />
                  {active && (
                    <View style={styles.bgChipCheck}>
                      <Feather name="check" size={10} color="#fff" />
                    </View>
                  )}
                  <Text style={styles.bgChipLabel}>{bg.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* --- Generate Button --- */}
        <Animated.View style={[styles.generateSection, { transform: [{ scale: generating ? pulseAnim : 1 }] }]}>
          <Pressable
            onPress={!generating ? handleGenerate : undefined}
            disabled={generating}
            style={styles.generateBtn}
          >
            <LinearGradient colors={["#7B2FBE", "#E91E8C", "#FF6B9D"]} style={styles.generateBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {generating ? (
                <View style={styles.generateBtnContent}>
                  <Feather name="loader" size={18} color="#fff" />
                  <Text style={styles.generateBtnText}>Generating...</Text>
                </View>
              ) : (
                <View style={styles.generateBtnContent}>
                  <Feather name="aperture" size={18} color="#fff" />
                  <Text style={styles.generateBtnText}>{generated ? "Regenerate DP" : "✨ Generate AI Avatar"}</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>

          {generating && (
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
              </View>
              <Text style={styles.progressStep}>{STEPS[stepIdx]}</Text>
            </View>
          )}
        </Animated.View>

        {/* --- Generated Avatars Grid --- */}
        {(generating || generated) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {generating ? "Generating 6 unique avatars..." : "✨ Your AI Avatars — tap to select"}
            </Text>
            <View style={styles.avatarGrid}>
              {AVATAR_CONFIGS.map((cfg, i) => (
                <AvatarCard
                  key={i}
                  config={cfg}
                  selected={selectedAvatar === i}
                  onPress={() => setSelectedAvatar(i)}
                  shimmer={generating}
                  index={i}
                />
              ))}
            </View>
          </View>
        )}

        {/* --- Selected Avatar Preview & Set DP --- */}
        {generated && selectedAvatar !== null && !applied && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>Preview</Text>
            <View style={styles.previewCard}>
              <LinearGradient colors={["#1A1A28", "#0A0A18"]} style={styles.previewCardBg} />

              {/* Large avatar preview */}
              <View style={[styles.previewAvatarLarge, {
                borderColor: AVATAR_CONFIGS[selectedAvatar].ring,
                shadowColor: AVATAR_CONFIGS[selectedAvatar].glow,
              }]}>
                <LinearGradient colors={AVATAR_CONFIGS[selectedAvatar].bg} style={StyleSheet.absoluteFill} />
                <View style={styles.decoCircle1} />
                <View style={styles.decoCircle2} />
                <View style={[styles.faceBaseLarge, {
                  backgroundColor: AVATAR_CONFIGS[selectedAvatar].iconColor + "20",
                  borderColor: AVATAR_CONFIGS[selectedAvatar].iconColor + "40",
                }]}>
                  <Feather name={AVATAR_CONFIGS[selectedAvatar].icon} size={52} color={AVATAR_CONFIGS[selectedAvatar].iconColor} />
                </View>
                <LinearGradient colors={["transparent", AVATAR_CONFIGS[selectedAvatar].glow + "60"]} style={styles.bottomAccentLarge} />
              </View>

              <Text style={styles.previewName}>{AVATAR_CONFIGS[selectedAvatar].label}</Text>
              <Text style={styles.previewSub}>
                {AVATAR_STYLES.find((s) => s.id === selectedStyle)?.emoji} {AVATAR_STYLES.find((s) => s.id === selectedStyle)?.label} · {VIBES.find((v) => v.id === selectedVibe)?.emoji} {VIBES.find((v) => v.id === selectedVibe)?.label}
              </Text>

              <View style={styles.previewActions}>
                <Pressable style={[styles.previewAction, { backgroundColor: "#1A1A28", borderColor: "#333" }]}>
                  <Feather name="download" size={16} color="#aaa" />
                  <Text style={[styles.previewActionText, { color: "#aaa" }]}>Save</Text>
                </Pressable>
                <Pressable style={[styles.previewAction, { backgroundColor: "#1A1A28", borderColor: "#333" }]}>
                  <Feather name="share-2" size={16} color="#aaa" />
                  <Text style={[styles.previewActionText, { color: "#aaa" }]}>Share</Text>
                </Pressable>
                <Pressable onPress={handleSetDP} style={[styles.previewAction, { flex: 2 }]}>
                  <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={[StyleSheet.absoluteFill, { borderRadius: 14 }]} />
                  <Feather name="user-check" size={16} color="#fff" />
                  <Text style={[styles.previewActionText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>Set as DP</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* --- Success State --- */}
        {applied && (
          <Animated.View style={[styles.successCard, {
            transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
            opacity: successAnim,
          }]}>
            <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.successIcon}>
              <Feather name="check" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.successTitle}>Avatar Set as DP! 🎉</Text>
            <Text style={styles.successSub}>Your profile picture has been updated. Looking amazing!</Text>
          </Animated.View>
        )}

        {/* --- Info Tips --- */}
        {!generating && !generated && (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionLabel}>How it works</Text>
            {[
              { icon: "sliders" as const, tip: "Choose your style, vibe, and background" },
              { icon: "aperture" as const, tip: "AI generates 6 unique avatar options for you" },
              { icon: "user-check" as const, tip: "Pick your favourite and set it as your DP instantly" },
              { icon: "refresh-cw" as const, tip: "Regenerate unlimited times — all free!" },
            ].map((t) => (
              <View key={t.tip} style={styles.tipRow}>
                <View style={styles.tipIcon}>
                  <Feather name={t.icon} size={14} color="#E91E8C" />
                </View>
                <Text style={styles.tipText}>{t.tip}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlow: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingBottom: 14, gap: 12, zIndex: 10,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#ffffff15", alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#aaa" },
  section: { paddingTop: 20 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#888", textTransform: "uppercase", letterSpacing: 0.8, paddingHorizontal: 20, marginBottom: 12 },
  styleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20 },
  styleCard: {
    width: (width - 60) / 2, padding: 14, borderRadius: 16,
    backgroundColor: "#111122", borderWidth: 1, borderColor: "#222",
    gap: 4, overflow: "hidden",
  },
  styleCardActive: { borderColor: "#E91E8C60" },
  styleEmoji: { fontSize: 22 },
  styleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  styleDesc: { fontSize: 11, fontFamily: "Inter_400Regular" },
  vibeChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, borderWidth: 1,
  },
  vibeEmoji: { fontSize: 16 },
  vibeLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  bgChip: { alignItems: "center", gap: 6, borderRadius: 14, overflow: "visible" },
  bgChipGradient: { width: 52, height: 52, borderRadius: 12 },
  bgChipCheck: {
    position: "absolute", top: -6, right: -6,
    width: 18, height: 18, borderRadius: 9, backgroundColor: "#E91E8C",
    alignItems: "center", justifyContent: "center",
  },
  bgChipLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#aaa" },
  generateSection: { paddingHorizontal: 20, paddingTop: 24 },
  generateBtn: { borderRadius: 20, overflow: "hidden" },
  generateBtnGrad: { paddingVertical: 16, alignItems: "center" },
  generateBtnContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  generateBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  progressSection: { marginTop: 16, gap: 8 },
  progressTrack: { height: 4, backgroundColor: "#ffffff15", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2, backgroundColor: "#E91E8C" },
  progressStep: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#aaa", textAlign: "center" },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20 },
  avatarCard: { alignItems: "center", gap: 6 },
  avatarFrame: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  shimmerBox: { borderRadius: 16, backgroundColor: "#ffffff15" },
  shimmerLabel: { height: 10, borderRadius: 5, backgroundColor: "#ffffff15" },
  avatarLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  decoCircle1: { position: "absolute", top: -15, right: -15, width: 80, height: 80, borderRadius: 40 },
  decoCircle2: { position: "absolute", bottom: -10, left: -10, width: 60, height: 60, borderRadius: 30 },
  faceBase: {
    width: "52%", aspectRatio: 1, borderRadius: 999,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  sparkle1: { position: "absolute", top: "15%", right: "18%", width: 5, height: 5, borderRadius: 3 },
  sparkle2: { position: "absolute", top: "25%", left: "12%", width: 4, height: 4, borderRadius: 2 },
  sparkle3: { position: "absolute", bottom: "22%", right: "12%", width: 6, height: 6, borderRadius: 3 },
  bottomAccent: { position: "absolute", bottom: 0, left: 0, right: 0, height: "35%" },
  selectedBadge: {
    position: "absolute", top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  previewSection: { paddingTop: 24 },
  previewCard: {
    marginHorizontal: 20, borderRadius: 24, padding: 24,
    alignItems: "center", gap: 12, overflow: "hidden",
    borderWidth: 1, borderColor: "#333",
  },
  previewCardBg: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  previewAvatarLarge: {
    width: 150, height: 150, borderRadius: 75, alignItems: "center", justifyContent: "center",
    overflow: "hidden", borderWidth: 3,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20, elevation: 20,
  },
  faceBaseLarge: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  bottomAccentLarge: { position: "absolute", bottom: 0, left: 0, right: 0, height: "40%" },
  previewName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  previewSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#aaa" },
  previewActions: { flexDirection: "row", gap: 10, width: "100%", marginTop: 4 },
  previewAction: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1, overflow: "hidden",
  },
  previewActionText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  successCard: { marginHorizontal: 20, marginTop: 24, padding: 24, alignItems: "center", gap: 12, borderRadius: 24, backgroundColor: "#111122", borderWidth: 1, borderColor: "#7B2FBE40" },
  successIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#aaa", textAlign: "center", lineHeight: 20 },
  tipsSection: { paddingTop: 24, paddingHorizontal: 20, gap: 4 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ffffff10" },
  tipIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#E91E8C15", alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#ccc", lineHeight: 18 },
});
