import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { useAuth } from "@/contexts/AuthContext";
import { GradientButton } from "@/components/GradientButton";
import { RidhiCoin } from "@/components/RidhiCoin";
import { PrivateHead } from "@/components/PrivateHead";

const DEAL_POST_COST = 1000;

const { width } = Dimensions.get("window");

const CONTENT_TYPES = [
  { id: "reel",        label: "Reel",              emoji: "🎬", sub: "15–60s vertical video" },
  { id: "story",       label: "Story",             emoji: "⏱️",  sub: "24hr story post" },
  { id: "story+reel",  label: "Story + Reel",      emoji: "🔥", sub: "Both formats" },
  { id: "ugc-video",   label: "UGC Video",         emoji: "📹", sub: "Authentic raw video" },
  { id: "ugc-photo",   label: "UGC Photo",         emoji: "📸", sub: "Product photography" },
  { id: "live",        label: "Live Shoutout",      emoji: "📡", sub: "During a live session" },
  { id: "review",      label: "Review Post",       emoji: "⭐", sub: "Honest review + rating" },
  { id: "collab",      label: "Collab Post",       emoji: "🤝", sub: "Co-created content" },
];

const CATEGORIES = [
  "Beauty", "Fashion", "Tech", "Food", "Travel", "Gaming",
  "Lifestyle", "Health", "Finance", "Education", "Sports", "Home",
];

const FOLLOWER_TIERS = [
  { id: "nano",   label: "Nano",   range: "1K – 10K",  sub: "High engagement, niche" },
  { id: "micro",  label: "Micro",  range: "10K – 100K", sub: "Best ROI for brands" },
  { id: "macro",  label: "Macro",  range: "100K – 1M", sub: "Mass reach" },
  { id: "mega",   label: "Mega",   range: "1M+",        sub: "Celebrity-tier" },
];

const PLATFORMS = [
  "Ridhi",
  "Instagram",
  "YouTube",
  "YouTube Shorts",
  "Facebook",
  "Twitter/X",
  "LinkedIn",
  "TikTok",
  "Moj",
  "Snapchat",
  "Pinterest",
  "WhatsApp Status",
  "Threads",
  "Reddit",
];

const DEADLINES = ["3 days", "5 days", "7 days", "10 days", "14 days", "30 days"];

const SLOT_COUNTS = ["5", "10", "15", "20", "25", "30", "50"];

const TOTAL_STEPS = 4;

export default function BrandPostDealScreen() {
  useTrackScreen("brand_post_deal");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step,      setStep]      = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Step 0 — Campaign basics
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("");
  const [contentType, setContentType] = useState("");

  // Step 1 — Creator requirements
  const [followerTier,   setFollowerTier]   = useState("");
  const [selectedPlats,  setSelectedPlats]  = useState<string[]>(["Ridhi"]);
  const [genderPref,     setGenderPref]     = useState("any");
  const [ageRange,       setAgeRange]       = useState("18–35");

  // Step 2 — Budget & slots
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [slots,     setSlots]     = useState("10");
  const [deadline,  setDeadline]  = useState("7 days");

  // Step 3 — Tags & brief
  const [tagInput, setTagInput] = useState("");
  const [tags,     setTags]     = useState<string[]>([]);
  const [brief,    setBrief]    = useState("");

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags((p) => [...p, t]);
      setTagInput("");
    }
  };

  const { user, deductCoins } = useAuth();

  // Coin confirmation modal
  const [coinModal, setCoinModal] = useState(false);
  const closeCoinModal = () => setCoinModal(false);

  const togglePlatform = (p: string) => {
    setSelectedPlats((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const canProceed = [
    title.trim().length >= 5 && !!category && !!contentType,
    !!followerTier && selectedPlats.length > 0,
    !!budgetMin && !!budgetMax && parseInt(budgetMax) > parseInt(budgetMin),
    tags.length >= 1 && brief.trim().length >= 20,
  ][step];

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) { setStep(step + 1); return; }
    // Final step — show coin confirmation before posting
    setCoinModal(true);
  };

  const handleConfirmPost = async () => {
    closeCoinModal();
    const ok = await deductCoins(DEAL_POST_COST);
    if (ok) {
      setSubmitted(true);
    } else {
      Alert.alert(
        "Not enough coins 🪙",
        `Posting a deal costs ${DEAL_POST_COST} Ridhi Coins. You currently have ${user?.coins ?? 0} coins.\n\nTop up your wallet to continue.`,
        [
          { text: "Top Up Wallet", onPress: () => router.push("/wallet") },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const progress = (step + 1) / TOTAL_STEPS;

  // ── Success ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#0A0020", "#1C0040", colors.background]} style={[styles.successBg, { paddingTop: topPad + 20 }]}>
          <Text style={{ fontSize: 52 }}>🚀</Text>
          <Text style={styles.successTitle}>Deal Posted!</Text>
          <Text style={[styles.successSub, { color: "rgba(255,255,255,0.6)" }]}>
            "{title}" is now live.{"\n"}Creators can start pitching immediately.
          </Text>
        </LinearGradient>

        <View style={{ padding: 24, gap: 12 }}>
          {/* Deal summary card */}
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryKey, { color: colors.mutedForeground }]}>Campaign</Text>
              <Text style={[styles.summaryVal, { color: colors.foreground }]}>{title}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryKey, { color: colors.mutedForeground }]}>Content type</Text>
              <Text style={[styles.summaryVal, { color: colors.foreground }]}>{contentType}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryKey, { color: colors.mutedForeground }]}>Budget range</Text>
              <Text style={[styles.summaryVal, { color: "#22C55E" }]}>₹{budgetMin} – ₹{budgetMax}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryKey, { color: colors.mutedForeground }]}>Creator slots</Text>
              <Text style={[styles.summaryVal, { color: colors.foreground }]}>{slots} creators</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryKey, { color: colors.mutedForeground }]}>Deadline</Text>
              <Text style={[styles.summaryVal, { color: "#FFB800" }]}>{deadline} to apply</Text>
            </View>
          </View>

          <GradientButton
            label="Post Another Deal"
            onPress={() => {
              setSubmitted(false);
              setStep(0);
              setTitle(""); setDescription(""); setCategory(""); setContentType("");
              setFollowerTier(""); setSelectedPlats(["Ridhi"]);
              setBudgetMin(""); setBudgetMax(""); setSlots("10"); setDeadline("7 days");
              setTags([]); setTagInput(""); setBrief("");
            }}
          />
          <Pressable onPress={() => router.back()} style={styles.skipBtn}>
            <Text style={[styles.skipBtnText, { color: colors.mutedForeground }]}>Back to Marketplace</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <>
      <PrivateHead />
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* Header */}
      <LinearGradient colors={["#0A0020", "#1C0040", colors.background]} style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => (step > 0 ? setStep(step - 1) : router.back())} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.headerTitle}>Post a Deal</Text>
            <Text style={styles.headerSub}>Step {step + 1} of {TOTAL_STEPS}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: "#E91E8C" }]} />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 84 : insets.bottom) + 40 }]}
      >

        {/* ── STEP 0: Campaign basics ──────────────────────────────────────── */}
        {step === 0 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Campaign basics</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Define what you need — creators will see this on the marketplace</Text>

            <Field label="Campaign Title *" icon="edit-2" color={colors.primary}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: title.length >= 5 ? colors.primary : colors.border, backgroundColor: colors.card }]}
                placeholder="e.g. boAt Bassheads 242 Launch Reel"
                placeholderTextColor={colors.mutedForeground}
                value={title}
                onChangeText={setTitle}
                maxLength={80}
              />
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{title.length}/80</Text>
            </Field>

            <Field label="Category *" icon="tag" color={colors.primary}>
              <View style={styles.chipGrid}>
                {CATEGORIES.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[styles.chip, { borderColor: category === c ? "#E91E8C" : colors.border }, category === c && { backgroundColor: "#E91E8C18" }]}
                  >
                    <Text style={[styles.chipText, { color: category === c ? "#E91E8C" : colors.mutedForeground }]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </Field>

            <Field label="Content Type *" icon="film" color={colors.primary}>
              <View style={{ gap: 10 }}>
                {CONTENT_TYPES.map((ct) => (
                  <Pressable
                    key={ct.id}
                    onPress={() => setContentType(ct.label)}
                    style={[
                      styles.contentTypeCard,
                      { backgroundColor: colors.card, borderColor: contentType === ct.label ? "#7B2FBE" : colors.border },
                      contentType === ct.label && { backgroundColor: "#7B2FBE10" },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{ct.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.ctLabel, { color: colors.foreground }]}>{ct.label}</Text>
                      <Text style={[styles.ctSub, { color: colors.mutedForeground }]}>{ct.sub}</Text>
                    </View>
                    {contentType === ct.label && <Feather name="check-circle" size={18} color="#7B2FBE" />}
                  </Pressable>
                ))}
              </View>
            </Field>

            <Field label="Short Description (shown to creators)" icon="align-left" color={colors.primary}>
              <TextInput
                style={[styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Describe the vibe, tone, dos and don'ts… be specific. Authentic > scripted."
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={300}
              />
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{description.length}/300</Text>
            </Field>
          </View>
        )}

        {/* ── STEP 1: Creator requirements ─────────────────────────────────── */}
        {step === 1 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Creator requirements</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Filter the type of creators you want to pitch for this deal</Text>

            <Field label="Creator Tier *" icon="users" color={colors.primary}>
              <View style={{ gap: 10 }}>
                {FOLLOWER_TIERS.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => setFollowerTier(t.id)}
                    style={[
                      styles.tierCard,
                      { backgroundColor: colors.card, borderColor: followerTier === t.id ? "#E91E8C" : colors.border },
                      followerTier === t.id && { backgroundColor: "#E91E8C08" },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[styles.tierLabel, { color: colors.foreground }]}>{t.label}</Text>
                        <View style={[styles.tierRange, { backgroundColor: colors.muted }]}>
                          <Text style={[styles.tierRangeText, { color: colors.mutedForeground }]}>{t.range}</Text>
                        </View>
                      </View>
                      <Text style={[styles.tierSub, { color: colors.mutedForeground }]}>{t.sub}</Text>
                    </View>
                    {followerTier === t.id && <Feather name="check-circle" size={18} color="#E91E8C" />}
                  </Pressable>
                ))}
              </View>
            </Field>

            <Field label="Platforms *" icon="share-2" color={colors.primary}>
              <View style={styles.chipGrid}>
                {PLATFORMS.map((p) => {
                  const on = selectedPlats.includes(p);
                  return (
                    <Pressable
                      key={p}
                      onPress={() => togglePlatform(p)}
                      style={[styles.chip, { borderColor: on ? "#7B2FBE" : colors.border }, on && { backgroundColor: "#7B2FBE18" }]}
                    >
                      <Text style={[styles.chipText, { color: on ? "#7B2FBE" : colors.mutedForeground }]}>{p}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label="Gender Preference" icon="user" color={colors.mutedForeground}>
              <View style={styles.chipGrid}>
                {["Any", "Female", "Male"].map((g) => {
                  const on = genderPref === g.toLowerCase();
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setGenderPref(g.toLowerCase())}
                      style={[styles.chip, { borderColor: on ? "#E91E8C" : colors.border }, on && { backgroundColor: "#E91E8C18" }]}
                    >
                      <Text style={[styles.chipText, { color: on ? "#E91E8C" : colors.mutedForeground }]}>{g}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label="Creator Age Range" icon="calendar" color={colors.mutedForeground}>
              <View style={styles.chipGrid}>
                {["18–24", "18–35", "25–35", "25–45", "Any"].map((a) => {
                  const on = ageRange === a;
                  return (
                    <Pressable
                      key={a}
                      onPress={() => setAgeRange(a)}
                      style={[styles.chip, { borderColor: on ? "#7B2FBE" : colors.border }, on && { backgroundColor: "#7B2FBE18" }]}
                    >
                      <Text style={[styles.chipText, { color: on ? "#7B2FBE" : colors.mutedForeground }]}>{a}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>
          </View>
        )}

        {/* ── STEP 2: Budget & logistics ───────────────────────────────────── */}
        {step === 2 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Budget & logistics</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Set payout range and how many creators you want to work with</Text>

            <Field label="Creator Payout Range (₹) *" icon="dollar-sign" color={colors.primary}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>Minimum</Text>
                  <TextInput
                    style={[styles.input, { color: colors.foreground, borderColor: budgetMin ? colors.primary : colors.border, backgroundColor: colors.card }]}
                    placeholder="e.g. 3000"
                    placeholderTextColor={colors.mutedForeground}
                    value={budgetMin}
                    onChangeText={(t) => setBudgetMin(t.replace(/[^0-9]/g, ""))}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>Maximum</Text>
                  <TextInput
                    style={[styles.input, { color: colors.foreground, borderColor: budgetMax && parseInt(budgetMax) > parseInt(budgetMin) ? colors.primary : colors.border, backgroundColor: colors.card }]}
                    placeholder="e.g. 12000"
                    placeholderTextColor={colors.mutedForeground}
                    value={budgetMax}
                    onChangeText={(t) => setBudgetMax(t.replace(/[^0-9]/g, ""))}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              {budgetMin && budgetMax && parseInt(budgetMax) <= parseInt(budgetMin) && (
                <View style={[styles.warnBox, { backgroundColor: "#FF3B3010", borderColor: "#FF3B3040" }]}>
                  <Feather name="alert-circle" size={13} color="#FF3B30" />
                  <Text style={[styles.warnText, { color: "#FF3B30" }]}>Maximum must be higher than minimum</Text>
                </View>
              )}
              {budgetMin && budgetMax && parseInt(budgetMax) > parseInt(budgetMin) && (
                <View style={[styles.budgetPreview, { backgroundColor: "#22C55E10", borderColor: "#22C55E30" }]}>
                  <Feather name="check-circle" size={13} color="#22C55E" />
                  <Text style={[styles.budgetPreviewText, { color: "#22C55E" }]}>
                    Payout range: ₹{parseInt(budgetMin).toLocaleString("en-IN")} – ₹{parseInt(budgetMax).toLocaleString("en-IN")} per creator
                  </Text>
                </View>
              )}
            </Field>

            <Field label="Number of Creator Slots *" icon="users" color={colors.primary}>
              <View style={styles.chipGrid}>
                {SLOT_COUNTS.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSlots(s)}
                    style={[styles.chip, { borderColor: slots === s ? "#E91E8C" : colors.border }, slots === s && { backgroundColor: "#E91E8C18" }]}
                  >
                    <Text style={[styles.chipText, { color: slots === s ? "#E91E8C" : colors.mutedForeground }]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
                How many creators can apply and be selected for this campaign
              </Text>
            </Field>

            <Field label="Application Deadline *" icon="clock" color={colors.primary}>
              <View style={styles.chipGrid}>
                {DEADLINES.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDeadline(d)}
                    style={[styles.chip, { borderColor: deadline === d ? "#7B2FBE" : colors.border }, deadline === d && { backgroundColor: "#7B2FBE18" }]}
                  >
                    <Text style={[styles.chipText, { color: deadline === d ? "#7B2FBE" : colors.mutedForeground }]}>{d}</Text>
                  </Pressable>
                ))}
              </View>
            </Field>

            {/* Cost estimate */}
            {budgetMin && budgetMax && parseInt(budgetMax) > parseInt(budgetMin) && (
              <View style={[styles.costBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.costTitle, { color: colors.foreground }]}>Estimated total budget</Text>
                <View style={styles.costRow}>
                  <Text style={[styles.costKey, { color: colors.mutedForeground }]}>Creator payouts ({slots} × ₹{parseInt(budgetMin).toLocaleString("en-IN")})</Text>
                  <Text style={[styles.costVal, { color: colors.foreground }]}>₹{(parseInt(slots) * parseInt(budgetMin)).toLocaleString("en-IN")}</Text>
                </View>
                <View style={styles.costRow}>
                  <Text style={[styles.costKey, { color: colors.mutedForeground }]}>Ridhi platform fee (12%)</Text>
                  <Text style={[styles.costVal, { color: colors.foreground }]}>₹{Math.round(parseInt(slots) * parseInt(budgetMin) * 0.12).toLocaleString("en-IN")}</Text>
                </View>
                <View style={[styles.costDivider, { backgroundColor: colors.border }]} />
                <View style={styles.costRow}>
                  <Text style={[styles.costTotal, { color: colors.foreground }]}>Total (approx.)</Text>
                  <Text style={[styles.costTotalVal, { color: "#E91E8C" }]}>
                    ₹{Math.round(parseInt(slots) * parseInt(budgetMin) * 1.12).toLocaleString("en-IN")} – ₹{Math.round(parseInt(slots) * parseInt(budgetMax) * 1.12).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── STEP 3: Tags & brief ──────────────────────────────────────────── */}
        {step === 3 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Final details</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Hashtags and a creator brief make your deal far more likely to get quality pitches</Text>

            {/* Coin cost banner */}
            <View style={styles.coinBanner}>
              <View style={styles.coinBannerLeft}>
                <RidhiCoin size={22} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.coinBannerTitle}>Posting costs 1,000 Ridhi Coins</Text>
                  <Text style={styles.coinBannerSub}>Your balance: 🪙 {(user?.coins ?? 0).toLocaleString("en-IN")} coins</Text>
                </View>
              </View>
              {(user?.coins ?? 0) < DEAL_POST_COST && (
                <Pressable onPress={() => router.push("/wallet")} style={styles.coinBannerTopUp}>
                  <Text style={styles.coinBannerTopUpText}>Top Up</Text>
                </Pressable>
              )}
            </View>

            <Field label="Hashtags * (add at least 1)" icon="hash" color={colors.primary}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  style={[styles.input, { flex: 1, color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                  placeholder="#unboxing, #skincare…"
                  placeholderTextColor={colors.mutedForeground}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                  autoCapitalize="none"
                />
                <Pressable onPress={addTag} style={[styles.addTagBtn, { backgroundColor: colors.primary }]}>
                  <Feather name="plus" size={18} color="#fff" />
                </Pressable>
              </View>
              {tags.length > 0 && (
                <View style={styles.tagRow}>
                  {tags.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setTags((p) => p.filter((x) => x !== t))}
                      style={[styles.tagChip, { backgroundColor: "#7B2FBE18", borderColor: "#7B2FBE40" }]}
                    >
                      <Text style={[styles.tagChipText, { color: "#7B2FBE" }]}>#{t}</Text>
                      <Feather name="x" size={11} color="#7B2FBE" />
                    </Pressable>
                  ))}
                </View>
              )}
              <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>Tap a tag to remove it · max 8 tags</Text>
            </Field>

            <Field label="Creator Brief * (min 20 chars)" icon="file-text" color={colors.primary}>
              <TextInput
                style={[styles.textArea, { color: colors.foreground, borderColor: brief.length >= 20 ? colors.primary : colors.border, backgroundColor: colors.card, minHeight: 140 }]}
                placeholder={`Write a detailed brief for creators:\n\n• What to show / say\n• Tone (fun, serious, luxury…)\n• Mandatory mentions (product name, handle)\n• What NOT to do\n• Deliverable format & specs`}
                placeholderTextColor={colors.mutedForeground}
                value={brief}
                onChangeText={setBrief}
                multiline
                maxLength={1000}
              />
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{brief.length}/1000</Text>
            </Field>

            {/* Preview card */}
            {title && category && contentType && (
              <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: "#7B2FBE40" }]}>
                <LinearGradient colors={["#7B2FBE15", "transparent"]} style={StyleSheet.absoluteFill} />
                <Text style={[styles.previewHeader, { color: colors.mutedForeground }]}>Deal preview</Text>
                <Text style={[styles.previewTitle, { color: colors.foreground }]}>{title}</Text>
                <Text style={[styles.previewMeta, { color: colors.mutedForeground }]}>{contentType} · {category}</Text>
                {budgetMin && budgetMax && (
                  <Text style={[styles.previewBudget, { color: "#E91E8C" }]}>₹{parseInt(budgetMin).toLocaleString("en-IN")} – ₹{parseInt(budgetMax).toLocaleString("en-IN")}</Text>
                )}
                <View style={styles.previewTags}>
                  {tags.map((t) => (
                    <View key={t} style={[styles.previewTag, { backgroundColor: "#7B2FBE15" }]}>
                      <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: "#7B2FBE" }}>#{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Platform.OS === "web" ? 24 : insets.bottom + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {step === TOTAL_STEPS - 1 && (
          <View style={styles.coinCostRow}>
            <RidhiCoin size={16} />
            <Text style={styles.coinCostText}>1,000 coins will be deducted on posting</Text>
          </View>
        )}
        <GradientButton
          label={step === TOTAL_STEPS - 1 ? "Review & Pay 🪙 1,000" : "Continue  →"}
          onPress={handleNext}
          disabled={!canProceed}
        />
      </View>

      {/* ── Coin confirmation modal ──────────────────────────────────────── */}
      <Modal visible={coinModal} transparent animationType="slide" onRequestClose={closeCoinModal}>
        <Pressable style={styles.modalOverlay} onPress={closeCoinModal}>
          <Pressable
            style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <View style={[styles.modalIconBg, { backgroundColor: "#FFB80018" }]}>
              <RidhiCoin size={36} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Post Deal for 1,000 Coins</Text>
            <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>
              "{title || "Your campaign"}" will go live instantly. This fee is paid to Ridhi and covers unlimited creator applications until your deadline.
            </Text>

            {/* Cost row */}
            <View style={[styles.modalCostRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.modalCostLabel, { color: colors.mutedForeground }]}>Ridhi platform fee</Text>
              <View style={styles.modalCostRight}>
                <RidhiCoin size={18} />
                <Text style={[styles.modalCostVal, { color: "#FFB800" }]}>1,000</Text>
              </View>
            </View>

            {/* Balance row */}
            <View style={[styles.modalBalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.modalBalLabel, { color: colors.mutedForeground }]}>Your balance</Text>
              <Text style={[styles.modalBalVal, { color: (user?.coins ?? 0) >= DEAL_POST_COST ? "#22C55E" : "#EF4444" }]}>
                🪙 {(user?.coins ?? 0).toLocaleString("en-IN")} coins
              </Text>
            </View>

            {/* Low balance notice */}
            {(user?.coins ?? 0) < DEAL_POST_COST && (
              <Pressable onPress={() => { closeCoinModal(); router.push("/wallet"); }} style={styles.topUpLink}>
                <Feather name="zap" size={14} color="#E91E8C" />
                <Text style={[styles.topUpLinkText, { color: "#E91E8C" }]}>Top up Ridhi Coins to continue</Text>
              </Pressable>
            )}

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable onPress={closeCoinModal} style={[styles.modalCancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmPost}
                style={[styles.modalConfirmBtn, (user?.coins ?? 0) < DEAL_POST_COST && { opacity: 0.45 }]}
                disabled={(user?.coins ?? 0) < DEAL_POST_COST}
              >
                <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalConfirmGrad}>
                  <Text style={styles.modalConfirmText}>Confirm & Pay 🪙</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
    </>
  );
}

function Field({ label, icon, color, children }: { label: string; icon: string; color: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8, width: "100%" }}>
      <View style={styles.fieldLabelRow}>
        <Feather name={icon as any} size={13} color={color} />
        <Text style={[styles.fieldLabel, { color }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub:   { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  progressTrack: { height: 4, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" },
  progressFill:  { height: 4, borderRadius: 2 },

  scroll:   { padding: 20 },
  stepWrap: { gap: 20 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  stepSub:   { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: -10 },

  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  fieldLabel:    { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  fieldHint:     { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  miniLabel:     { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 5 },
  charCount:     { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" },

  input:    { fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5 },
  textArea: { fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, minHeight: 100, textAlignVertical: "top" },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  contentTypeCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  ctLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  ctSub:   { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  tierCard:  { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  tierLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  tierRange: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tierRangeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  tierSub:   { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  warnBox:  { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, padding: 10 },
  warnText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  budgetPreview:     { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, padding: 10 },
  budgetPreviewText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  costBox:   { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  costTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  costRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  costKey:   { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  costVal:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  costDivider: { height: StyleSheet.hairlineWidth },
  costTotal:    { fontSize: 14, fontFamily: "Inter_700Bold" },
  costTotalVal: { fontSize: 15, fontFamily: "Inter_700Bold" },

  addTagBtn: { width: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tagRow:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tagChip:   { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  tagChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  previewCard:   { borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 6, overflow: "hidden" },
  previewHeader: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  previewTitle:  { fontSize: 17, fontFamily: "Inter_700Bold" },
  previewMeta:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  previewBudget: { fontSize: 16, fontFamily: "Inter_700Bold" },
  previewTags:   { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  previewTag:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },

  bottomBar: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  coinCostRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  coinCostText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#FFB800" },

  // coin banner (step 3)
  coinBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 14, borderWidth: 1.5, borderColor: "#FFB80050", backgroundColor: "#FFB80010", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  coinBannerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  coinBannerTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#FFB800" },
  coinBannerSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#FFB800", opacity: 0.75, marginTop: 2 },
  coinBannerTopUp: { backgroundColor: "#FFB800", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  coinBannerTopUpText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#000" },

  // coin modal
  modalOverlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  modalBox:        { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, padding: 24, gap: 14, alignItems: "center" },
  modalIconBg:     { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  modalTitle:      { fontSize: 19, fontFamily: "Inter_700Bold", textAlign: "center" },
  modalDesc:       { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, textAlign: "center" },
  modalCostRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12 },
  modalCostLabel:  { fontSize: 13, fontFamily: "Inter_500Medium" },
  modalCostRight:  { flexDirection: "row", alignItems: "center", gap: 6 },
  modalCostVal:    { fontSize: 17, fontFamily: "Inter_700Bold" },
  modalBalRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  modalBalLabel:   { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalBalVal:     { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modalActions:    { flexDirection: "row", gap: 12, width: "100%", marginTop: 4 },
  modalCancelBtn:  { flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 14, alignItems: "center" },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalConfirmBtn: { flex: 2, borderRadius: 14, overflow: "hidden" },
  modalConfirmGrad:  { paddingVertical: 14, alignItems: "center" },
  modalConfirmText:  { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  topUpLink:       { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  topUpLinkText:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // success
  successBg:    { alignItems: "center", gap: 12, padding: 32, paddingBottom: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  successSub:   { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  summaryCard:  { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  summaryRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  summaryKey:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryVal:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryDivider: { height: StyleSheet.hairlineWidth },
  skipBtn:      { alignItems: "center", paddingVertical: 12 },
  skipBtnText:  { fontSize: 14, fontFamily: "Inter_400Regular" },
});
