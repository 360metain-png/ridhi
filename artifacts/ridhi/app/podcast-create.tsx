import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { GradientButton } from "@/components/GradientButton";
import { PODCAST_CATEGORIES, PODCAST_LANGUAGES, PodcastCategory } from "@/data/podcastData";

const { width } = Dimensions.get("window");

// ── Types ────────────────────────────────────────────────────────────────────
type RecordMode = "audio" | "video" | "live";
type EpisodeType = "full" | "short" | "trailer";
type Monetization = "free" | "subscribers" | "paid";

const RECORD_MODES: { id: RecordMode; icon: string; label: string; desc: string; color: string }[] = [
  { id: "audio", icon: "mic", label: "Audio Podcast", desc: "Record audio-only episode", color: "#7B2FBE" },
  { id: "video", icon: "video", label: "Video Podcast", desc: "Record with front camera", color: "#E91E8C" },
  { id: "live", icon: "radio", label: "Go Live", desc: "Broadcast live to followers", color: "#FF3B30" },
];

const EPISODE_TYPES: { id: EpisodeType; label: string; desc: string }[] = [
  { id: "full", label: "Full Episode", desc: "No time limit" },
  { id: "short", label: "Short Clip", desc: "Under 3 minutes — shareable as Reel" },
  { id: "trailer", label: "Trailer", desc: "Tease your upcoming podcast" },
];

const MONETIZATION_OPTIONS: { id: Monetization; icon: string; label: string; desc: string }[] = [
  { id: "free", icon: "unlock", label: "Free for All", desc: "Everyone can listen" },
  { id: "subscribers", icon: "users", label: "Subscribers Only", desc: "Your paid subscribers get access" },
  { id: "paid", icon: "dollar-sign", label: "Paid Episode", desc: "Set a one-time price in coins" },
];

const AI_FEATURES = [
  { id: "shownotes", icon: "file-text", label: "AI Show Notes", desc: "Auto-generate summary & chapters" },
  { id: "transcript", icon: "align-left", label: "AI Transcript", desc: "Full searchable text transcript" },
  { id: "clips", icon: "scissors", label: "Auto Clips", desc: "Extract top 3 shareable 60-sec clips" },
  { id: "translate", icon: "globe", label: "Hindi Subtitles", desc: "Auto-translate for regional reach" },
];

// ── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ icon, title, colors }: { icon: string; title: string; colors: any }) {
  return (
    <View style={styles.sectionLabel}>
      <Feather name={icon as any} size={14} color={colors.primary} />
      <Text style={[styles.sectionLabelText, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function PodcastCreateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"mode" | "details" | "ai" | "publish">("mode");
  const [recordMode, setRecordMode] = useState<RecordMode>("audio");
  const [episodeType, setEpisodeType] = useState<EpisodeType>("full");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PodcastCategory>("Comedy");
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi");
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [monetization, setMonetization] = useState<Monetization>("free");
  const [paidPrice, setPaidPrice] = useState("50");
  const [scheduleDate, setScheduleDate] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [aiFeatures, setAiFeatures] = useState<Record<string, boolean>>({
    shownotes: true,
    transcript: false,
    clips: true,
    translate: false,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [isVipRoom, setIsVipRoom] = useState(false);
  const [vipEntryFee, setVipEntryFee] = useState("99");
  const [replayAccessEnabled, setReplayAccessEnabled] = useState(false);
  const [maxListeners, setMaxListeners] = useState("1000");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Recording pulse animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } else {
      pulseAnim.setValue(1);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const pickCoverArt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Allow photo access to add cover art."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setCoverArt(result.assets[0].uri);
  };

  const STEPS = ["mode", "details", "ai", "publish"];
  const stepIdx = STEPS.indexOf(step);
  const progress = (stepIdx + 1) / STEPS.length;

  const canAdvance = () => {
    if (step === "mode") return true;
    if (step === "details") return title.trim().length > 0;
    return true;
  };

  const handlePublish = async () => {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPublishing(false);
    Alert.alert(
      recordMode === "live" ? "You're Live! 🎙️" : "Episode Published! 🎉",
      recordMode === "live"
        ? "Your live podcast is broadcasting. Listeners can join now."
        : `"${title}" is now live${!publishNow ? " and scheduled" : ""}. Tune in!`,
      [{ text: "View Episode", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#1A0533", colors.background]} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Create Podcast</Text>
        <View style={{ width: 38 }} />
      </LinearGradient>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
      </View>
      <View style={styles.stepLabels}>
        {["Mode", "Details", "AI Tools", "Publish"].map((l, i) => (
          <Text key={l} style={[styles.stepLabel, { color: i <= stepIdx ? colors.primary : colors.mutedForeground }]}>{l}</Text>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* ── STEP 1: MODE ── */}
        {step === "mode" && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>How do you want to record?</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Choose your podcast format for this episode</Text>

            {RECORD_MODES.map((mode) => {
              const active = recordMode === mode.id;
              return (
                <Pressable
                  key={mode.id}
                  onPress={() => setRecordMode(mode.id)}
                  style={[styles.modeCard, {
                    backgroundColor: active ? mode.color + "18" : colors.card,
                    borderColor: active ? mode.color : colors.border,
                  }]}
                >
                  <LinearGradient
                    colors={active ? [mode.color, mode.color + "BB"] : [colors.muted, colors.muted]}
                    style={[styles.modeIcon, { opacity: active ? 1 : 0.5 }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  >
                    <Feather name={mode.icon as any} size={22} color="#fff" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modeLabel, { color: colors.text }]}>{mode.label}</Text>
                    <Text style={[styles.modeDesc, { color: colors.mutedForeground }]}>{mode.desc}</Text>
                  </View>
                  {active && <Feather name="check-circle" size={20} color={mode.color} />}
                </Pressable>
              );
            })}

            {/* Episode Type */}
            <SectionLabel icon="layers" title="Episode Type" colors={colors} />
            {EPISODE_TYPES.map((et) => {
              const active = episodeType === et.id;
              return (
                <Pressable
                  key={et.id}
                  onPress={() => setEpisodeType(et.id)}
                  style={[styles.typeRow, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary + "10" : colors.card }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.typeLabel, { color: colors.text }]}>{et.label}</Text>
                    <Text style={[styles.typeDesc, { color: colors.mutedForeground }]}>{et.desc}</Text>
                  </View>
                  <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}>
                    {active && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
                  </View>
                </Pressable>
              );
            })}

            {/* Simulated recorder */}
            {recordMode !== "live" && (
              <View style={[styles.recorderBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.recorderTimer, { color: isRecording ? colors.primary : colors.mutedForeground }]}>
                  {formatTime(recordSeconds)}
                </Text>
                <View style={styles.recorderWave}>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <Animated.View
                      key={i}
                      style={[styles.recorderBar, {
                        backgroundColor: isRecording ? colors.primary : colors.border,
                        height: isRecording ? Math.random() * 28 + 6 : 6,
                        transform: [{ scale: isRecording ? pulseAnim : new Animated.Value(1) }],
                      }]}
                    />
                  ))}
                </View>
                <Pressable
                  onPress={() => setIsRecording((r) => !r)}
                  style={[styles.recorderBtn, { backgroundColor: isRecording ? "#FF3B30" : colors.primary }]}
                >
                  <Feather name={isRecording ? "square" : "mic"} size={26} color="#fff" />
                </Pressable>
                <Text style={[styles.recorderHint, { color: colors.mutedForeground }]}>
                  {isRecording ? "Tap to stop recording" : "Tap to start recording"}
                </Text>
              </View>
            )}

            {recordMode === "live" && (
              <LinearGradient colors={["#FF3B3022", "#E91E8C22"]} style={styles.liveBox}>
                <Feather name="radio" size={32} color="#FF3B30" />
                <Text style={[styles.liveBoxTitle, { color: colors.text }]}>Ready to Go Live?</Text>
                <Text style={[styles.liveBoxSub, { color: colors.mutedForeground }]}>Your followers will get a push notification when you start broadcasting.</Text>
              </LinearGradient>
            )}
          </View>
        )}

        {/* ── STEP 2: DETAILS ── */}
        {step === "details" && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Episode Details</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Help listeners discover your episode</Text>

            {/* Cover Art */}
            <SectionLabel icon="image" title="Cover Art" colors={colors} />
            <Pressable onPress={pickCoverArt} style={[styles.coverArtBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              {coverArt ? (
                <Image source={{ uri: coverArt }} style={styles.coverArtImg} />
              ) : (
                <View style={styles.coverArtPlaceholder}>
                  <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.coverArtIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Feather name="image" size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.coverArtHint, { color: colors.mutedForeground }]}>Tap to add cover art{"\n"}(Square, 1:1 ratio)</Text>
                </View>
              )}
            </Pressable>

            {/* Title */}
            <SectionLabel icon="type" title="Episode Title *" colors={colors} />
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. Why Every Indian Family Has a Group Called 'Family'"
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={setTitle}
              maxLength={120}
            />
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{title.length}/120</Text>

            {/* Description */}
            <SectionLabel icon="align-left" title="Description" colors={colors} />
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="What is this episode about? Give listeners a reason to tune in..."
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={600}
              textAlignVertical="top"
            />

            {/* Category */}
            <SectionLabel icon="tag" title="Category" colors={colors} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {PODCAST_CATEGORIES.filter((c) => c !== "All").map((cat) => {
                const active = cat === selectedCategory;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.chip, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}
                  >
                    <Text style={[styles.chipText, { color: active ? "#fff" : colors.mutedForeground }]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Language */}
            <SectionLabel icon="globe" title="Language" colors={colors} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {PODCAST_LANGUAGES.map((lang) => {
                const active = lang === selectedLanguage;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => setSelectedLanguage(lang)}
                    style={[styles.chip, { backgroundColor: active ? colors.secondary : colors.card, borderColor: active ? colors.secondary : colors.border }]}
                  >
                    <Text style={[styles.chipText, { color: active ? "#fff" : colors.mutedForeground }]}>{lang}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Tags */}
            <SectionLabel icon="hash" title="Tags" colors={colors} />
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="cricket, india, funny, bollywood"
              placeholderTextColor={colors.mutedForeground}
              value={tags}
              onChangeText={setTags}
            />
          </View>
        )}

        {/* ── STEP 3: AI TOOLS ── */}
        {step === "ai" && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>AI-Powered Tools</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Let AI do the heavy lifting — grow faster with zero extra effort</Text>

            <LinearGradient colors={["#7B2FBE22", "#E91E8C22"]} style={styles.aiHero}>
              <Feather name="cpu" size={28} color={colors.secondary} />
              <Text style={[styles.aiHeroText, { color: colors.text }]}>Ridhi AI processes your audio and generates all of the below automatically after you publish.</Text>
            </LinearGradient>

            {AI_FEATURES.map((feature) => (
              <View key={feature.id} style={[styles.aiRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <LinearGradient
                  colors={aiFeatures[feature.id] ? ["#7B2FBE", "#E91E8C"] : [colors.muted, colors.muted]}
                  style={styles.aiIcon}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Feather name={feature.icon as any} size={16} color={aiFeatures[feature.id] ? "#fff" : colors.mutedForeground} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.aiLabel, { color: colors.text }]}>{feature.label}</Text>
                  <Text style={[styles.aiDesc, { color: colors.mutedForeground }]}>{feature.desc}</Text>
                </View>
                <Switch
                  value={aiFeatures[feature.id]}
                  onValueChange={(v) => setAiFeatures((prev) => ({ ...prev, [feature.id]: v }))}
                  trackColor={{ false: colors.border, true: colors.primary + "66" }}
                  thumbColor={aiFeatures[feature.id] ? colors.primary : colors.mutedForeground}
                />
              </View>
            ))}

            <View style={[styles.aiNote, { backgroundColor: colors.muted }]}>
              <Feather name="info" size={13} color={colors.mutedForeground} />
              <Text style={[styles.aiNoteText, { color: colors.mutedForeground }]}>AI features use 2–5 processing minutes. Results appear on your episode page within 10 minutes of publishing.</Text>
            </View>
          </View>
        )}

        {/* ── STEP 4: PUBLISH ── */}
        {step === "publish" && (
          <View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Ready to Publish</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Set monetization and release settings</Text>

            {/* Summary card */}
            <LinearGradient colors={["#7B2FBE22", "#E91E8C11"]} style={styles.summaryCard}>
              {coverArt
                ? <Image source={{ uri: coverArt }} style={styles.summaryThumb} />
                : (
                  <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.summaryThumb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Feather name="mic" size={22} color="#fff" />
                  </LinearGradient>
                )
              }
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryTitle, { color: colors.text }]} numberOfLines={2}>{title || "Untitled Episode"}</Text>
                <Text style={[styles.summaryMeta, { color: colors.mutedForeground }]}>{selectedCategory} · {selectedLanguage}</Text>
                <View style={styles.summaryBadges}>
                  {aiFeatures.shownotes && <View style={[styles.sBadge, { backgroundColor: colors.secondary + "22" }]}><Text style={[styles.sBadgeText, { color: colors.secondary }]}>AI Notes</Text></View>}
                  {aiFeatures.clips && <View style={[styles.sBadge, { backgroundColor: colors.primary + "22" }]}><Text style={[styles.sBadgeText, { color: colors.primary }]}>Auto Clips</Text></View>}
                  {episodeType === "short" && <View style={[styles.sBadge, { backgroundColor: "#FF6B3522" }]}><Text style={[styles.sBadgeText, { color: "#FF6B35" }]}>Reel</Text></View>}
                </View>
              </View>
            </LinearGradient>

            {/* Room Setup — Live only */}
            {recordMode === "live" && (
              <View>
                <SectionLabel icon="radio" title="Room Setup" colors={colors} />

                {/* Public / VIP */}
                <View style={[styles.scheduleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scheduleLabel, { color: colors.text }]}>VIP Room</Text>
                    <Text style={[styles.monoDesc, { color: colors.mutedForeground }]}>
                      Charge coins for entry (30–999)
                    </Text>
                  </View>
                  <Switch
                    value={isVipRoom}
                    onValueChange={setIsVipRoom}
                    trackColor={{ false: colors.border, true: colors.primary + "66" }}
                    thumbColor={isVipRoom ? colors.primary : colors.mutedForeground}
                  />
                </View>

                {isVipRoom && (
                  <View style={[styles.priceRow, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]}>
                    <Feather name="star" size={16} color="#FFB800" />
                    <Text style={[styles.scheduleLabel, { color: colors.text, flex: 1 }]}>Entry Fee</Text>
                    <TextInput
                      style={[styles.priceInput, { color: colors.text, width: 70 }]}
                      keyboardType="number-pad"
                      value={vipEntryFee}
                      onChangeText={setVipEntryFee}
                      placeholder="99"
                      placeholderTextColor={colors.mutedForeground}
                    />
                    <Text style={[styles.priceUnit, { color: colors.mutedForeground }]}>coins</Text>
                  </View>
                )}

                {/* Replay Access */}
                <View style={[styles.scheduleRow, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scheduleLabel, { color: colors.text }]}>Replay Access</Text>
                    <Text style={[styles.monoDesc, { color: colors.mutedForeground }]}>
                      Listeners pay 49 🪙 to replay after show
                    </Text>
                  </View>
                  <Switch
                    value={replayAccessEnabled}
                    onValueChange={setReplayAccessEnabled}
                    trackColor={{ false: colors.border, true: colors.primary + "66" }}
                    thumbColor={replayAccessEnabled ? colors.primary : colors.mutedForeground}
                  />
                </View>

                {/* Max Listeners */}
                <View style={[styles.priceRow, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 10 }]}>
                  <Feather name="users" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.scheduleLabel, { color: colors.text, flex: 1 }]}>Max Listeners</Text>
                  <TextInput
                    style={[styles.priceInput, { color: colors.text, width: 80 }]}
                    keyboardType="number-pad"
                    value={maxListeners}
                    onChangeText={setMaxListeners}
                    placeholder="1000"
                    placeholderTextColor={colors.mutedForeground}
                  />
                  <Text style={[styles.priceUnit, { color: colors.mutedForeground }]}>people</Text>
                </View>
              </View>
            )}

            {/* Monetization */}
            <SectionLabel icon="dollar-sign" title="Monetization" colors={colors} />
            {MONETIZATION_OPTIONS.map((opt) => {
              const active = monetization === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setMonetization(opt.id)}
                  style={[styles.monoRow, { backgroundColor: active ? colors.primary + "10" : colors.card, borderColor: active ? colors.primary : colors.border }]}
                >
                  <Feather name={opt.icon as any} size={18} color={active ? colors.primary : colors.mutedForeground} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.monoLabel, { color: colors.text }]}>{opt.label}</Text>
                    <Text style={[styles.monoDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
                  </View>
                  <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}>
                    {active && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
                  </View>
                </Pressable>
              );
            })}

            {monetization === "paid" && (
              <View style={[styles.priceRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="zap" size={16} color={colors.gold} />
                <TextInput
                  style={[styles.priceInput, { color: colors.text }]}
                  keyboardType="number-pad"
                  value={paidPrice}
                  onChangeText={setPaidPrice}
                />
                <Text style={[styles.priceUnit, { color: colors.mutedForeground }]}>coins</Text>
              </View>
            )}

            {/* Schedule */}
            <SectionLabel icon="calendar" title="Release" colors={colors} />
            <View style={[styles.scheduleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.scheduleLabel, { color: colors.text }]}>Publish Immediately</Text>
              <Switch
                value={publishNow}
                onValueChange={setPublishNow}
                trackColor={{ false: colors.border, true: colors.primary + "66" }}
                thumbColor={publishNow ? colors.primary : colors.mutedForeground}
              />
            </View>
            {!publishNow && (
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text, marginTop: 10 }]}
                placeholder="e.g. Tomorrow 8:00 AM"
                placeholderTextColor={colors.mutedForeground}
                value={scheduleDate}
                onChangeText={setScheduleDate}
              />
            )}
          </View>
        )}

        {/* Nav Buttons */}
        <View style={styles.navBtns}>
          {stepIdx > 0 && (
            <Pressable
              onPress={() => setStep(STEPS[stepIdx - 1] as typeof step)}
              style={[styles.backNavBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Feather name="arrow-left" size={18} color={colors.text} />
              <Text style={[styles.backNavText, { color: colors.text }]}>Back</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            {step !== "publish" ? (
              <GradientButton
                label="Continue"
                onPress={() => { if (canAdvance()) setStep(STEPS[stepIdx + 1] as typeof step); }}
                disabled={!canAdvance()}
              />
            ) : (
              <GradientButton
                label={publishing ? "Publishing…" : recordMode === "live" ? "🔴 Go Live Now" : publishNow ? "🎙️ Publish Episode" : "📅 Schedule Episode"}
                onPress={handlePublish}
                disabled={publishing || title.trim().length === 0}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  progressTrack: { height: 3 },
  progressFill: { height: 3, borderRadius: 2 },
  stepLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 6, marginBottom: 4 },
  stepLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  body: { padding: 20, paddingBottom: 40 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 6 },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 24, lineHeight: 20 },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 22, marginBottom: 10 },
  sectionLabelText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  modeCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, borderWidth: 1.5, marginBottom: 12 },
  modeIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  modeLabel: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 3 },
  modeDesc: { fontFamily: "Inter_400Regular", fontSize: 13 },
  typeRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  typeLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 2 },
  typeDesc: { fontFamily: "Inter_400Regular", fontSize: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  recorderBox: { marginTop: 22, borderRadius: 18, borderWidth: 1, padding: 24, alignItems: "center", gap: 14 },
  recorderTimer: { fontFamily: "Inter_700Bold", fontSize: 36, letterSpacing: 2 },
  recorderWave: { flexDirection: "row", alignItems: "center", height: 40, gap: 3 },
  recorderBar: { width: 3, borderRadius: 2 },
  recorderBtn: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  recorderHint: { fontFamily: "Inter_400Regular", fontSize: 13 },
  liveBox: { marginTop: 22, borderRadius: 18, padding: 28, alignItems: "center", gap: 12 },
  liveBoxTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  liveBoxSub: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20 },
  coverArtBox: { width: 160, height: 160, borderRadius: 18, borderWidth: 2, borderStyle: "dashed", alignSelf: "center", overflow: "hidden", marginBottom: 6 },
  coverArtImg: { width: "100%", height: "100%", resizeMode: "cover" },
  coverArtPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  coverArtIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  coverArtHint: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontFamily: "Inter_400Regular", fontSize: 14 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontFamily: "Inter_400Regular", fontSize: 14, minHeight: 110 },
  charCount: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "right", marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  aiHero: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, padding: 18, marginBottom: 18 },
  aiHeroText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  aiRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  aiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  aiLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 3 },
  aiDesc: { fontFamily: "Inter_400Regular", fontSize: 12 },
  aiNote: { flexDirection: "row", gap: 8, padding: 14, borderRadius: 12, marginTop: 6 },
  aiNoteText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  summaryCard: { flexDirection: "row", gap: 14, padding: 16, borderRadius: 16, marginBottom: 4 },
  summaryThumb: { width: 72, height: 72, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  summaryTitle: { fontFamily: "Inter_700Bold", fontSize: 15, lineHeight: 20, marginBottom: 4 },
  summaryMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 8 },
  summaryBadges: { flexDirection: "row", gap: 6 },
  sBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  sBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  monoRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  monoLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 2 },
  monoDesc: { fontFamily: "Inter_400Regular", fontSize: 12 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 4 },
  priceInput: { fontFamily: "Inter_700Bold", fontSize: 22, flex: 1 },
  priceUnit: { fontFamily: "Inter_400Regular", fontSize: 14 },
  scheduleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, borderWidth: 1 },
  scheduleLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  navBtns: { flexDirection: "row", gap: 12, marginTop: 32 },
  backNavBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  backNavText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
