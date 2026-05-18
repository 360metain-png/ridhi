import React, { useState } from "react";
import {
  Alert, Image, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PaymentSheet } from "@/components/PaymentSheet";

// ── Types & Consts ─────────────────────────────────────────────────────────────
type AdFormat    = "feed" | "story" | "reel" | "banner" | "explore";
type AdObjective = "awareness" | "traffic" | "leads" | "sales" | "engagement";
type BudgetType  = "cpm" | "cpc";

const FORMATS: { key: AdFormat; label: string; icon: string; desc: string; reach: string }[] = [
  { key: "feed",    label: "Feed Ad",    icon: "layout",  desc: "Appears between posts in the Home Feed",          reach: "Highest reach" },
  { key: "story",   label: "Story Ad",   icon: "circle",  desc: "Full-screen between user stories",                reach: "High engagement" },
  { key: "reel",    label: "Reel Ad",    icon: "video",   desc: "6–15 sec ad between vertical reels",             reach: "Best for video" },
  { key: "banner",  label: "Banner Ad",  icon: "minus",   desc: "Persistent banner across screens",               reach: "Always visible" },
  { key: "explore", label: "Explore Ad", icon: "search",  desc: "Promoted in Explore & trending sections",        reach: "High intent" },
];

const OBJECTIVES: { key: AdObjective; label: string; icon: string; desc: string }[] = [
  { key: "awareness",  label: "Brand Awareness", icon: "eye",          desc: "Reach the most people" },
  { key: "traffic",    label: "Website Traffic",  icon: "external-link", desc: "Drive clicks to your site" },
  { key: "leads",      label: "Lead Generation",  icon: "users",        desc: "Collect customer info" },
  { key: "sales",      label: "Sales",            icon: "shopping-bag", desc: "Drive purchases" },
  { key: "engagement", label: "Engagement",       icon: "heart",        desc: "Likes, comments, shares" },
];

// All 28 States + 8 UTs of India
const INDIA_STATES = [
  "All India",
  // States
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // Union Territories
  "Andaman & Nicobar", "Chandigarh", "Dadra & Nagar Haveli", "Daman & Diu",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// Approx Ridhi user base per state (mock — scales reach estimate)
const STATE_WEIGHT: Record<string, number> = {
  "All India": 100,
  "Uttar Pradesh": 16, "Maharashtra": 12, "Bihar": 9, "West Bengal": 8,
  "Madhya Pradesh": 7, "Rajasthan": 7, "Tamil Nadu": 7, "Karnataka": 6,
  "Gujarat": 6, "Andhra Pradesh": 5, "Telangana": 4, "Odisha": 4,
  "Kerala": 3, "Jharkhand": 3, "Assam": 3, "Punjab": 2, "Haryana": 2,
  "Delhi": 2, "Chhattisgarh": 2, "Uttarakhand": 1,
};

const AGE_GROUPS = ["18–24", "25–34", "35–44", "45+"];
const GENDERS    = ["All", "Male", "Female"];
const INTERESTS  = [
  "Fashion", "Music", "Food", "Sports", "Tech", "Travel",
  "Beauty", "Gaming", "Finance", "Health", "Education", "Entertainment",
];
const LANGUAGES  = ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Kannada"];
const DURATIONS  = [
  { label: "1 Day",   days: 1 },
  { label: "3 Days",  days: 3 },
  { label: "7 Days",  days: 7 },
  { label: "15 Days", days: 15 },
  { label: "30 Days", days: 30 },
];
const CPM_RATE = 50;
const CPC_RATE = 2;

function stateReachMultiplier(states: string[]): number {
  if (states.includes("All India")) return 1.0;
  const total = states.reduce((sum, s) => sum + (STATE_WEIGHT[s] ?? 0.5), 0);
  return Math.min(total / 100, 1.0);
}

function estimateReach(
  dailyBudget: number,
  budgetType: BudgetType,
  states: string[],
): { impressions: number; clicks: number } {
  const mult = stateReachMultiplier(states);
  if (budgetType === "cpm") {
    const raw = Math.round((dailyBudget / CPM_RATE) * 1000 * (1 + mult * 0.4));
    return { impressions: raw, clicks: Math.round(raw * 0.015) };
  } else {
    const clicks = Math.round((dailyBudget / CPC_RATE) * (1 + mult * 0.3));
    return { impressions: Math.round(clicks / 0.015), clicks };
  }
}

export default function AdsCreateScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const [step, setStep] = useState<1 | 2 | 3 | 4 | "done">(1);

  // Step 1 — Business & Objective
  const [bizName,    setBizName]    = useState("");
  const [bizWebsite, setBizWebsite] = useState("");
  const [objective,  setObjective]  = useState<AdObjective | null>(null);
  const [format,     setFormat]     = useState<AdFormat | null>(null);

  // Step 2 — Ad Content + Images
  const [headline,   setHeadline]   = useState("");
  const [body,       setBody]       = useState("");
  const [cta,        setCta]        = useState("Shop Now");
  const [ctaUrl,     setCtaUrl]     = useState("");
  const [adImages,   setAdImages]   = useState<string[]>([]);   // 1–2 images

  const CTA_OPTIONS = ["Shop Now", "Learn More", "Contact Us", "Get Offer", "Book Now", "Download", "Sign Up", "Call Now"];

  // Step 3 — Targeting
  const [states,       setStates]       = useState<string[]>(["All India"]);
  const [ages,         setAges]         = useState<string[]>([]);
  const [gender,       setGender]       = useState("All");
  const [selInterests, setSelInterests] = useState<string[]>([]);
  const [selLangs,     setSelLangs]     = useState<string[]>([]);

  // Step 4 — Budget
  const [budgetType,  setBudgetType]  = useState<BudgetType>("cpm");
  const [dailyBudget, setDailyBudget] = useState("");
  const [duration,    setDuration]    = useState(7);

  const [showPayment, setShowPayment] = useState(false);

  const toggleArr = <T,>(arr: T[], setArr: (v: T[]) => void, val: T) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const totalBudget  = dailyBudget ? Number(dailyBudget) * duration : 0;
  const reach        = dailyBudget ? estimateReach(Number(dailyBudget), budgetType, states) : null;
  const totalWithGst = Math.round((totalBudget || 0) * 1.18);

  const canStep1 = bizName.trim().length >= 2 && objective !== null && format !== null;
  const canStep2 = headline.trim().length >= 3 && cta.length > 0 && adImages.length >= 1;
  const canStep3 = states.length > 0;
  const canStep4 = dailyBudget !== "" && Number(dailyBudget) >= 100;

  // ── Image Picker ──────────────────────────────────────────────────────────────
  const pickImage = async () => {
    if (adImages.length >= 2) {
      Alert.alert("Max 2 images", "You can upload a maximum of 2 ad images. Remove one to add another.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access to upload ad images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAdImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (idx: number) => {
    setAdImages(prev => prev.filter((_, i) => i !== idx));
  };

  // ── State toggle helpers ───────────────────────────────────────────────────────
  const toggleState = (s: string) => {
    if (s === "All India") { setStates(["All India"]); return; }
    setStates(prev => {
      const without = prev.filter(x => x !== "All India" && x !== s);
      if (prev.includes(s)) return without.length ? without : ["All India"];
      return [...without, s];
    });
  };

  // ── Done state ────────────────────────────────────────────────────────────────
  if (step === "done") {
    const stateLabel = states.includes("All India")
      ? "All India"
      : states.length <= 3
        ? states.join(", ")
        : `${states.slice(0, 3).join(", ")} +${states.length - 3} more`;

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.doneWrap}>
          <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.doneIcon}>
            <Feather name="zap" size={36} color="#fff" />
          </LinearGradient>
          <Text style={[styles.doneTitle, { color: colors.foreground }]}>Campaign Submitted!</Text>
          <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
            Your ad for <Text style={{ fontFamily: "Inter_700Bold", color: colors.foreground }}>{bizName}</Text> is under review. Once approved, it will reach Ridhi users in the selected states.
          </Text>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: "Business",     val: bizName },
              { label: "Format",       val: FORMATS.find(f => f.key === format)?.label ?? "" },
              { label: "Objective",    val: OBJECTIVES.find(o => o.key === objective)?.label ?? "" },
              { label: "Target States",val: stateLabel },
              { label: "Ad Images",    val: `${adImages.length} image${adImages.length > 1 ? "s" : ""} uploaded` },
              { label: "Daily Budget", val: `₹${Number(dailyBudget).toLocaleString()}` },
              { label: "Duration",     val: `${duration} days` },
              { label: "Total Spend",  val: `₹${totalBudget.toLocaleString()}` },
              { label: "Est. Reach",   val: reach ? `~${reach.impressions.toLocaleString()} impressions/day` : "—" },
              { label: "Status",       val: "⏳ Under Review" },
            ].map(({ label, val }) => (
              <View key={label} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.summaryVal, { color: colors.foreground }]}>{val}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={() => router.push("/ads-manager" as any)} style={styles.doneBtn}>
            <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.doneBtnGrad}>
              <Text style={styles.doneBtnText}>View My Campaigns</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => router.back()} style={[styles.doneSecondary, { borderColor: colors.border }]}>
            <Text style={[styles.doneSecondaryText, { color: colors.foreground }]}>Back to Home</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={[styles.headerTitle, { color: "#fff" }]}>Create Ad Campaign</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.headerSub}>Reach millions of Ridhi users across India</Text>
        {/* Step bar */}
        <View style={styles.stepRow}>
          {[
            { n: 1, label: "Business" },
            { n: 2, label: "Content"  },
            { n: 3, label: "Audience" },
            { n: 4, label: "Budget"   },
          ].map(({ n, label }, i) => (
            <View key={n} style={styles.stepItem}>
              <View style={[styles.stepDot, {
                backgroundColor: n <= (step as number) ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
              }]}>
                {n < (step as number)
                  ? <Feather name="check" size={11} color="#E91E8C" />
                  : <Text style={[styles.stepNum, { color: n <= (step as number) ? "#E91E8C" : "rgba(255,255,255,0.6)" }]}>{n}</Text>}
              </View>
              <Text style={[styles.stepLabel, { color: n <= (step as number) ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)" }]}>{label}</Text>
              {i < 3 && <View style={[styles.stepLine, { backgroundColor: n < (step as number) ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)" }]} />}
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 50 }]}>

        {/* ── STEP 1: Business & Objective ── */}
        {step === 1 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Business Details</Text>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Business / Brand Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. Priya's Fashion Store"
              placeholderTextColor={colors.mutedForeground}
              value={bizName}
              onChangeText={setBizName}
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Website / App URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="https://yourwebsite.com"
              placeholderTextColor={colors.mutedForeground}
              value={bizWebsite}
              onChangeText={setBizWebsite}
              keyboardType="url"
              autoCapitalize="none"
            />

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Campaign Objective *</Text>
            {OBJECTIVES.map((o) => {
              const sel = objective === o.key;
              return (
                <Pressable
                  key={o.key}
                  onPress={() => setObjective(o.key)}
                  style={[styles.objCard, {
                    backgroundColor: sel ? colors.primary + "15" : colors.card,
                    borderColor: sel ? colors.primary : colors.border,
                    borderWidth: sel ? 1.5 : 1,
                  }]}
                >
                  <View style={[styles.objIcon, { backgroundColor: sel ? colors.primary + "25" : colors.muted }]}>
                    <Feather name={o.icon as any} size={18} color={sel ? colors.primary : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.objLabel, { color: colors.foreground }]}>{o.label}</Text>
                    <Text style={[styles.objDesc, { color: colors.mutedForeground }]}>{o.desc}</Text>
                  </View>
                  {sel && <Feather name="check-circle" size={18} color={colors.primary} />}
                </Pressable>
              );
            })}

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ad Format *</Text>
            {FORMATS.map((f) => {
              const sel = format === f.key;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFormat(f.key)}
                  style={[styles.fmtCard, {
                    backgroundColor: sel ? "#7B2FBE15" : colors.card,
                    borderColor: sel ? "#7B2FBE" : colors.border,
                    borderWidth: sel ? 1.5 : 1,
                  }]}
                >
                  <View style={[styles.fmtIcon, { backgroundColor: sel ? "#7B2FBE25" : colors.muted }]}>
                    <Feather name={f.icon as any} size={16} color={sel ? "#7B2FBE" : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fmtLabel, { color: colors.foreground }]}>{f.label}</Text>
                    <Text style={[styles.fmtDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
                  </View>
                  <View style={[styles.fmtReach, { backgroundColor: sel ? "#7B2FBE20" : colors.muted }]}>
                    <Text style={[styles.fmtReachText, { color: sel ? "#7B2FBE" : colors.mutedForeground }]}>{f.reach}</Text>
                  </View>
                </Pressable>
              );
            })}

            <Pressable onPress={() => { if (canStep1) setStep(2); }} style={[styles.nextBtn, { opacity: canStep1 ? 1 : 0.4 }]}>
              <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGrad}>
                <Text style={styles.nextText}>Next: Ad Content</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* ── STEP 2: Ad Content + Images ── */}
        {step === 2 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Create Your Ad</Text>

            {/* Live preview */}
            <View style={[styles.previewBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.previewSponsored, { backgroundColor: colors.muted }]}>
                <View style={[styles.previewAvatar, { backgroundColor: colors.primary + "25" }]}>
                  <Text style={[styles.previewAvatarText, { color: colors.primary }]}>
                    {bizName ? bizName.slice(0, 2).toUpperCase() : "AD"}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.previewBiz, { color: colors.foreground }]}>{bizName || "Your Business Name"}</Text>
                  <View style={styles.previewSponsoredRow}>
                    <Text style={[styles.previewSponsoredTag, { color: colors.mutedForeground }]}>Sponsored</Text>
                    <Feather name="globe" size={9} color={colors.mutedForeground} />
                  </View>
                </View>
              </View>
              {/* Show first uploaded image in preview, else placeholder */}
              {adImages.length > 0 ? (
                <Image source={{ uri: adImages[0] }} style={styles.previewImgFull} resizeMode="cover" />
              ) : (
                <View style={[styles.previewImg, { backgroundColor: colors.muted }]}>
                  <Feather name="image" size={32} color={colors.mutedForeground} />
                  <Text style={[styles.previewImgText, { color: colors.mutedForeground }]}>Ad Creative (upload below)</Text>
                </View>
              )}
              <View style={styles.previewContent}>
                <Text style={[styles.previewHeadline, { color: colors.foreground }]} numberOfLines={2}>
                  {headline || "Your compelling headline here…"}
                </Text>
                <Text style={[styles.previewBody, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {body || "Your ad body text will appear here. Make it short and compelling."}
                </Text>
                <View style={[styles.previewCTA, { backgroundColor: colors.primary }]}>
                  <Text style={styles.previewCTAText}>{cta}</Text>
                </View>
              </View>
            </View>

            {/* ── Image Upload ── */}
            <View style={{ gap: 8 }}>
              <View style={styles.imageLabelRow}>
                <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Ad Images *</Text>
                <View style={[styles.imageCountBadge, {
                  backgroundColor: adImages.length >= 1 ? "#34C75920" : colors.muted,
                  borderColor: adImages.length >= 1 ? "#34C759" : colors.border,
                }]}>
                  <Text style={[styles.imageCountText, { color: adImages.length >= 1 ? "#34C759" : colors.mutedForeground }]}>
                    {adImages.length}/2
                  </Text>
                </View>
              </View>
              <Text style={[styles.imageHint, { color: colors.mutedForeground }]}>
                Upload 1–2 images (min 1 required). Use 4:3 ratio for best results.
              </Text>

              {/* Uploaded image thumbnails */}
              <View style={styles.imageGrid}>
                {adImages.map((uri, idx) => (
                  <View key={idx} style={styles.imageThumbWrap}>
                    <Image source={{ uri }} style={styles.imageThumb} resizeMode="cover" />
                    <Pressable onPress={() => removeImage(idx)} style={styles.imageRemoveBtn}>
                      <Feather name="x" size={12} color="#fff" />
                    </Pressable>
                    {idx === 0 && (
                      <View style={styles.imagePrimaryBadge}>
                        <Text style={styles.imagePrimaryText}>Main</Text>
                      </View>
                    )}
                  </View>
                ))}

                {/* Upload button (shown if < 2 images) */}
                {adImages.length < 2 && (
                  <Pressable
                    onPress={pickImage}
                    style={[styles.imageUploadBtn, {
                      backgroundColor: colors.card,
                      borderColor: adImages.length === 0 ? colors.primary : colors.border,
                      borderStyle: "dashed",
                    }]}
                  >
                    <LinearGradient
                      colors={adImages.length === 0 ? ["#E91E8C20", "#7B2FBE20"] : ["transparent", "transparent"]}
                      style={styles.imageUploadInner}
                    >
                      <Feather name="upload-cloud" size={24} color={adImages.length === 0 ? colors.primary : colors.mutedForeground} />
                      <Text style={[styles.imageUploadText, { color: adImages.length === 0 ? colors.primary : colors.mutedForeground }]}>
                        {adImages.length === 0 ? "Upload Image" : "Add 2nd Image"}
                      </Text>
                      <Text style={[styles.imageUploadSub, { color: colors.mutedForeground }]}>JPG, PNG · 4:3 ratio</Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </View>

              {adImages.length === 0 && (
                <View style={[styles.imageRequiredNote, { backgroundColor: "#FF6B3510", borderColor: "#FF6B3540" }]}>
                  <Feather name="alert-circle" size={13} color="#FF6B35" />
                  <Text style={[styles.imageRequiredText, { color: "#FF6B35" }]}>At least 1 image is required to proceed.</Text>
                </View>
              )}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Headline *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. Up to 50% off on all fashions this week!"
              placeholderTextColor={colors.mutedForeground}
              value={headline}
              onChangeText={setHeadline}
              maxLength={60}
            />
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{headline.length}/60</Text>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Body Text</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Describe your offer, product, or service in 1–2 lines…"
              placeholderTextColor={colors.mutedForeground}
              value={body}
              onChangeText={setBody}
              multiline
              numberOfLines={3}
              maxLength={150}
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Call to Action Button *</Text>
            <View style={styles.ctaGrid}>
              {CTA_OPTIONS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCta(c)}
                  style={[styles.ctaChip, {
                    backgroundColor: cta === c ? colors.primary : colors.card,
                    borderColor: cta === c ? colors.primary : colors.border,
                  }]}
                >
                  <Text style={[styles.ctaChipText, { color: cta === c ? "#fff" : colors.foreground }]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Destination URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="https://your-landing-page.com"
              placeholderTextColor={colors.mutedForeground}
              value={ctaUrl}
              onChangeText={setCtaUrl}
              keyboardType="url"
              autoCapitalize="none"
            />

            <View style={styles.navRow}>
              <Pressable onPress={() => setStep(1)} style={[styles.backStepBtn, { borderColor: colors.border }]}>
                <Feather name="arrow-left" size={16} color={colors.foreground} />
                <Text style={[styles.backStepText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable onPress={() => { if (canStep2) setStep(3); }} style={[styles.nextFlex, { opacity: canStep2 ? 1 : 0.4 }]}>
                <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGrad}>
                  <Text style={styles.nextText}>Next: Audience</Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── STEP 3: Audience Targeting ── */}
        {step === 3 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Audience Targeting</Text>

            {/* Location — all Indian states */}
            <View style={styles.locationHeader}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Location — States & UTs</Text>
              {!states.includes("All India") && (
                <Pressable onPress={() => setStates(["All India"])}>
                  <Text style={[styles.clearLink, { color: colors.primary }]}>Clear</Text>
                </Pressable>
              )}
            </View>

            {/* Geolocation routing info banner */}
            <View style={[styles.geoBanner, { backgroundColor: "#7B2FBE12", borderColor: "#7B2FBE40" }]}>
              <Feather name="map-pin" size={14} color="#7B2FBE" />
              <Text style={[styles.geoText, { color: colors.foreground }]}>
                <Text style={{ fontFamily: "Inter_600SemiBold" }}>State-based routing:</Text> Your ad will automatically appear only to Ridhi users in the selected state(s), based on their registered location. Select multiple states to expand reach.
              </Text>
            </View>

            {/* State chips — All India first, then alphabetical */}
            <View style={styles.chipGrid}>
              {INDIA_STATES.map((s) => {
                const sel = states.includes(s);
                const isAllIndia = s === "All India";
                return (
                  <Pressable
                    key={s}
                    onPress={() => toggleState(s)}
                    style={[styles.chip, {
                      backgroundColor: sel
                        ? (isAllIndia ? colors.primary : "#7B2FBE")
                        : colors.card,
                      borderColor: sel
                        ? (isAllIndia ? colors.primary : "#7B2FBE")
                        : colors.border,
                    }]}
                  >
                    {sel && <Feather name="check" size={10} color="#fff" />}
                    <Text style={[styles.chipText, { color: sel ? "#fff" : colors.foreground }]}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Selected state count info */}
            {!states.includes("All India") && (
              <View style={[styles.stateInfoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="info" size={13} color={colors.primary} />
                <Text style={[styles.stateInfoText, { color: colors.mutedForeground }]}>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{states.length} state{states.length > 1 ? "s" : ""}</Text> selected · ~{Math.round(stateReachMultiplier(states) * 100)}% of Ridhi's India user base
                </Text>
              </View>
            )}

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Age Group</Text>
            <View style={styles.chipGrid}>
              {AGE_GROUPS.map((a) => {
                const sel = ages.includes(a);
                return (
                  <Pressable key={a}
                    onPress={() => toggleArr(ages, setAges, a)}
                    style={[styles.chip, { backgroundColor: sel ? colors.primary : colors.card, borderColor: sel ? colors.primary : colors.border }]}
                  >
                    <Text style={[styles.chipText, { color: sel ? "#fff" : colors.foreground }]}>{a}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Gender</Text>
            <View style={styles.chipGrid}>
              {GENDERS.map((g) => (
                <Pressable key={g}
                  onPress={() => setGender(g)}
                  style={[styles.chip, { backgroundColor: gender === g ? colors.primary : colors.card, borderColor: gender === g ? colors.primary : colors.border }]}
                >
                  <Text style={[styles.chipText, { color: gender === g ? "#fff" : colors.foreground }]}>{g}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Interests <Text style={[styles.optionalLabel, { color: colors.mutedForeground }]}>(optional)</Text>
            </Text>
            <View style={styles.chipGrid}>
              {INTERESTS.map((interest) => {
                const sel = selInterests.includes(interest);
                return (
                  <Pressable key={interest}
                    onPress={() => toggleArr(selInterests, setSelInterests, interest)}
                    style={[styles.chip, { backgroundColor: sel ? "#7B2FBE" : colors.card, borderColor: sel ? "#7B2FBE" : colors.border }]}
                  >
                    <Text style={[styles.chipText, { color: sel ? "#fff" : colors.foreground }]}>{interest}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Language <Text style={[styles.optionalLabel, { color: colors.mutedForeground }]}>(optional)</Text>
            </Text>
            <View style={styles.chipGrid}>
              {LANGUAGES.map((l) => {
                const sel = selLangs.includes(l);
                return (
                  <Pressable key={l}
                    onPress={() => toggleArr(selLangs, setSelLangs, l)}
                    style={[styles.chip, { backgroundColor: sel ? "#7B2FBE" : colors.card, borderColor: sel ? "#7B2FBE" : colors.border }]}
                  >
                    <Text style={[styles.chipText, { color: sel ? "#fff" : colors.foreground }]}>{l}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.navRow}>
              <Pressable onPress={() => setStep(2)} style={[styles.backStepBtn, { borderColor: colors.border }]}>
                <Feather name="arrow-left" size={16} color={colors.foreground} />
                <Text style={[styles.backStepText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable onPress={() => { if (canStep3) setStep(4); }} style={[styles.nextFlex, { opacity: canStep3 ? 1 : 0.4 }]}>
                <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGrad}>
                  <Text style={styles.nextText}>Next: Budget</Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── STEP 4: Budget & Schedule ── */}
        {step === 4 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Budget & Schedule</Text>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Bidding Type *</Text>
            <View style={styles.navRow}>
              {([
                { key: "cpm" as BudgetType, label: "CPM", desc: `₹${CPM_RATE}/1K impressions`, icon: "eye" },
                { key: "cpc" as BudgetType, label: "CPC", desc: `₹${CPC_RATE}/click`,           icon: "mouse-pointer" },
              ]).map((b) => {
                const sel = budgetType === b.key;
                return (
                  <Pressable key={b.key} onPress={() => setBudgetType(b.key)}
                    style={[styles.bidCard, {
                      flex: 1,
                      backgroundColor: sel ? colors.primary + "12" : colors.card,
                      borderColor: sel ? colors.primary : colors.border,
                      borderWidth: sel ? 1.5 : 1,
                    }]}
                  >
                    <Feather name={b.icon as any} size={18} color={sel ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.bidLabel, { color: colors.foreground }]}>{b.label}</Text>
                    <Text style={[styles.bidDesc, { color: colors.mutedForeground }]}>{b.desc}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Daily Budget (₹) * <Text style={[styles.optionalLabel, { color: colors.mutedForeground }]}>Min. ₹100/day</Text>
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. 500"
              placeholderTextColor={colors.mutedForeground}
              value={dailyBudget}
              onChangeText={v => setDailyBudget(v.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
            />
            {dailyBudget !== "" && Number(dailyBudget) < 100 && (
              <Text style={{ color: "#FF6B35", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 }}>Minimum daily budget is ₹100</Text>
            )}

            {/* Reach estimate — adjusts by selected states */}
            {reach && (
              <View style={[styles.reachBox, { backgroundColor: "#E91E8C10", borderColor: "#E91E8C30" }]}>
                <Text style={[styles.reachTitle, { color: colors.foreground }]}>Estimated Daily Reach</Text>
                {!states.includes("All India") && (
                  <Text style={[styles.reachStates, { color: colors.mutedForeground }]}>
                    Targeting {states.length} state{states.length > 1 ? "s" : ""} (~{Math.round(stateReachMultiplier(states) * 100)}% of user base)
                  </Text>
                )}
                <View style={styles.reachRow}>
                  <View style={styles.reachItem}>
                    <Text style={[styles.reachVal, { color: colors.primary }]}>{reach.impressions.toLocaleString()}</Text>
                    <Text style={[styles.reachKey, { color: colors.mutedForeground }]}>Impressions</Text>
                  </View>
                  <View style={[styles.reachDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.reachItem}>
                    <Text style={[styles.reachVal, { color: "#7B2FBE" }]}>{reach.clicks.toLocaleString()}</Text>
                    <Text style={[styles.reachKey, { color: colors.mutedForeground }]}>Est. Clicks</Text>
                  </View>
                  <View style={[styles.reachDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.reachItem}>
                    <Text style={[styles.reachVal, { color: "#34C759" }]}>1.5%</Text>
                    <Text style={[styles.reachKey, { color: colors.mutedForeground }]}>Avg. CTR</Text>
                  </View>
                </View>
              </View>
            )}

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Campaign Duration *</Text>
            <View style={styles.chipGrid}>
              {DURATIONS.map((d) => (
                <Pressable key={d.days}
                  onPress={() => setDuration(d.days)}
                  style={[styles.chip, {
                    backgroundColor: duration === d.days ? colors.primary : colors.card,
                    borderColor: duration === d.days ? colors.primary : colors.border,
                  }]}
                >
                  <Text style={[styles.chipText, { color: duration === d.days ? "#fff" : colors.foreground }]}>{d.label}</Text>
                </Pressable>
              ))}
            </View>

            {dailyBudget && Number(dailyBudget) >= 100 && (
              <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Daily budget</Text>
                  <Text style={[styles.totalVal, { color: colors.foreground }]}>₹{Number(dailyBudget).toLocaleString()}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Duration</Text>
                  <Text style={[styles.totalVal, { color: colors.foreground }]}>{duration} days</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Target</Text>
                  <Text style={[styles.totalVal, { color: colors.foreground }]}>
                    {states.includes("All India") ? "All India" : `${states.length} state${states.length > 1 ? "s" : ""}`}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Ad spend subtotal</Text>
                  <Text style={[styles.totalVal, { color: colors.foreground }]}>₹{totalBudget.toLocaleString()}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: "#FF8C42" }]}>GST (18%)</Text>
                  <Text style={[styles.totalVal, { color: "#FF8C42" }]}>+₹{Math.round(totalBudget * 0.18).toLocaleString()}</Text>
                </View>
                <View style={[styles.totalRow, styles.totalFinal, { borderTopColor: colors.border }]}>
                  <Text style={[styles.totalLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total Payable (incl. GST)</Text>
                  <Text style={[styles.totalVal, { color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 18 }]}>₹{Math.round(totalBudget * 1.18).toLocaleString()}</Text>
                </View>
              </View>
            )}

            <View style={styles.navRow}>
              <Pressable onPress={() => setStep(3)} style={[styles.backStepBtn, { borderColor: colors.border }]}>
                <Feather name="arrow-left" size={16} color={colors.foreground} />
                <Text style={[styles.backStepText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable onPress={() => { if (canStep4) setShowPayment(true); }} style={[styles.nextFlex, { opacity: canStep4 ? 1 : 0.4 }]}>
                <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGrad}>
                  <Feather name="send" size={15} color="#fff" />
                  <Text style={styles.nextText}>Submit Campaign</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      <PaymentSheet
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={() => { setShowPayment(false); setStep("done"); }}
        amount={totalBudget}
        label="Ad Campaign"
        sublabel={`₹${Number(dailyBudget).toLocaleString()}/day × ${duration} days`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { paddingHorizontal: 16, paddingBottom: 18, gap: 10 },
  topBar:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn:      { padding: 6 },
  headerTitle:  { fontSize: 17, fontFamily: "Inter_700Bold" },
  headerSub:    { fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", textAlign: "center" },
  stepRow:      { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  stepItem:     { flexDirection: "row", alignItems: "center", gap: 6 },
  stepDot:      { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepNum:      { fontSize: 12, fontFamily: "Inter_700Bold" },
  stepLabel:    { fontSize: 11, fontFamily: "Inter_500Medium" },
  stepLine:     { width: 20, height: 2, marginHorizontal: 2 },
  scroll:       { padding: 16, paddingBottom: 50 },
  stepWrap:     { gap: 14 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginTop: 4 },
  fieldLabel:   { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: -6 },
  optionalLabel:{ fontFamily: "Inter_400Regular", fontSize: 12 },
  charCount:    { fontSize: 11, textAlign: "right", marginTop: -10 },
  input:        { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: "Inter_400Regular" },
  textarea:     { minHeight: 80, textAlignVertical: "top" },
  objCard:      { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 13 },
  objIcon:      { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  objLabel:     { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  objDesc:      { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  fmtCard:      { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, padding: 12 },
  fmtIcon:      { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  fmtLabel:     { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  fmtDesc:      { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1, flex: 1 },
  fmtReach:     { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  fmtReachText: { fontSize: 9, fontFamily: "Inter_700Bold" },
  // Preview
  previewBox:        { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  previewSponsored:  { flexDirection: "row", alignItems: "center", gap: 10, padding: 10 },
  previewAvatar:     { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  previewAvatarText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  previewBiz:        { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  previewSponsoredRow:{ flexDirection: "row", alignItems: "center", gap: 3 },
  previewSponsoredTag:{ fontSize: 10, fontFamily: "Inter_400Regular" },
  previewImg:        { height: 140, alignItems: "center", justifyContent: "center", gap: 6 },
  previewImgFull:    { width: "100%", height: 140 },
  previewImgText:    { fontSize: 12, fontFamily: "Inter_400Regular" },
  previewContent:    { padding: 12, gap: 6 },
  previewHeadline:   { fontSize: 14, fontFamily: "Inter_700Bold" },
  previewBody:       { fontSize: 12, fontFamily: "Inter_400Regular" },
  previewCTA:        { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  previewCTAText:    { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  // Image upload
  imageLabelRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: -4 },
  imageCountBadge:   { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, borderWidth: 1 },
  imageCountText:    { fontSize: 12, fontFamily: "Inter_700Bold" },
  imageHint:         { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: -2 },
  imageGrid:         { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  imageThumbWrap:    { width: 110, height: 90, borderRadius: 10, overflow: "hidden", position: "relative" },
  imageThumb:        { width: "100%", height: "100%" },
  imageRemoveBtn:    {
    position: "absolute", top: 5, right: 5,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center", justifyContent: "center",
  },
  imagePrimaryBadge: {
    position: "absolute", bottom: 5, left: 5,
    backgroundColor: "#E91E8C", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  imagePrimaryText:  { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" },
  imageUploadBtn:    { width: 110, height: 90, borderRadius: 10, borderWidth: 1.5, overflow: "hidden" },
  imageUploadInner:  { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  imageUploadText:   { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  imageUploadSub:    { fontSize: 9, fontFamily: "Inter_400Regular" },
  imageRequiredNote: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, padding: 10 },
  imageRequiredText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  // CTA
  ctaGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ctaChip:      { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  ctaChipText:  { fontSize: 13, fontFamily: "Inter_500Medium" },
  // Chips (location, age, interests)
  chipGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:         { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText:     { fontSize: 12, fontFamily: "Inter_500Medium" },
  // Location section
  locationHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  clearLink:      { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  geoBanner:      { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12 },
  geoText:        { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  stateInfoBox:   { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12 },
  stateInfoText:  { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  // Budget
  bidCard:      { alignItems: "center", gap: 4, borderRadius: 14, padding: 14 },
  bidLabel:     { fontSize: 15, fontFamily: "Inter_700Bold" },
  bidDesc:      { fontSize: 11, fontFamily: "Inter_400Regular" },
  reachBox:     { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  reachTitle:   { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  reachStates:  { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  reachRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  reachItem:    { alignItems: "center", gap: 3 },
  reachVal:     { fontSize: 20, fontFamily: "Inter_700Bold" },
  reachKey:     { fontSize: 10, fontFamily: "Inter_400Regular" },
  reachDivider: { width: 1, height: 36 },
  totalCard:    { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  totalRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11 },
  totalLabel:   { fontSize: 13, fontFamily: "Inter_400Regular" },
  totalVal:     { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  totalFinal:   { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 13 },
  navRow:       { flexDirection: "row", gap: 10, alignItems: "stretch" },
  backStepBtn:  { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  backStepText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nextBtn:      {},
  nextFlex:     { flex: 1 },
  nextGrad:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13 },
  nextText:     { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  // Done
  doneWrap:          { alignItems: "center", padding: 24, gap: 16, paddingTop: 32 },
  doneIcon:          { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  doneTitle:         { fontSize: 24, fontFamily: "Inter_700Bold" },
  doneSub:           { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  summaryCard:       { width: "100%", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  summaryRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  summaryLabel:      { fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryVal:        { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "right", paddingLeft: 8, flexShrink: 1 },
  doneBtn:           { width: "100%" },
  doneBtnGrad:       { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 14 },
  doneBtnText:       { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  doneSecondary:     { borderRadius: 12, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10 },
  doneSecondaryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
