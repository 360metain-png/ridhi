import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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
import * as Location from "expo-location";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { GradientButton } from "@/components/GradientButton";
import { Avatar, AvatarPicker, getAvatarUrl, getAvatarOptions } from "@/components/Avatar";

const { width } = Dimensions.get("window");

// ─── constants ────────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "Hindi",      label: "हिंदी",     sublabel: "Hindi",      emoji: "🇮🇳" },
  { code: "Bengali",    label: "বাংলা",     sublabel: "Bengali",    emoji: "🌿" },
  { code: "Telugu",     label: "తెలుగు",    sublabel: "Telugu",     emoji: "🌺" },
  { code: "Tamil",      label: "தமிழ்",    sublabel: "Tamil",      emoji: "🏛️" },
  { code: "Marathi",    label: "मराठी",     sublabel: "Marathi",    emoji: "🌸" },
  { code: "Gujarati",   label: "ગુજરાતી",  sublabel: "Gujarati",   emoji: "💐" },
  { code: "Kannada",    label: "ಕನ್ನಡ",    sublabel: "Kannada",    emoji: "🏔️" },
  { code: "Malayalam",  label: "മലയാളം",   sublabel: "Malayalam",  emoji: "🌴" },
  { code: "Punjabi",    label: "ਪੰਜਾਬੀ",   sublabel: "Punjabi",    emoji: "🌾" },
  { code: "Odia",       label: "ଓଡ଼ିଆ",    sublabel: "Odia",       emoji: "🌊" },
  { code: "Assamese",   label: "অসমীয়া",  sublabel: "Assamese",   emoji: "🍃" },
  { code: "Urdu",       label: "اردو",      sublabel: "Urdu",       emoji: "☪️" },
  { code: "Rajasthani", label: "राजस्थानी",sublabel: "Rajasthani", emoji: "🏰" },
  { code: "English",    label: "English",   sublabel: "English",    emoji: "🌍" },
];

const INTERESTS = [
  "Music", "Travel", "Food", "Fitness", "Books",
  "Photography", "Dancing", "Gaming", "Art", "Movies",
  "Cricket", "Yoga", "Cooking", "Tech", "Fashion",
  "Spirituality", "Pets", "Business",
];

// All 28 Indian States + 8 Union Territories
const INDIAN_STATES = [
  // ── States ──────────────────────────────────────────
  { name: "Andhra Pradesh",    emoji: "🌺", region: "South"    },
  { name: "Arunachal Pradesh", emoji: "🏔️", region: "Northeast" },
  { name: "Assam",             emoji: "🍵", region: "Northeast" },
  { name: "Bihar",             emoji: "🏛️", region: "East"     },
  { name: "Chhattisgarh",      emoji: "🌿", region: "Central"  },
  { name: "Goa",               emoji: "🏖️", region: "West"     },
  { name: "Gujarat",           emoji: "💐", region: "West"     },
  { name: "Haryana",           emoji: "🌾", region: "North"    },
  { name: "Himachal Pradesh",  emoji: "⛰️", region: "North"    },
  { name: "Jharkhand",         emoji: "🌲", region: "East"     },
  { name: "Karnataka",         emoji: "🏰", region: "South"    },
  { name: "Kerala",            emoji: "🌴", region: "South"    },
  { name: "Madhya Pradesh",    emoji: "🌻", region: "Central"  },
  { name: "Maharashtra",       emoji: "🎭", region: "West"     },
  { name: "Manipur",           emoji: "🌸", region: "Northeast" },
  { name: "Meghalaya",         emoji: "☁️", region: "Northeast" },
  { name: "Mizoram",           emoji: "🌄", region: "Northeast" },
  { name: "Nagaland",          emoji: "🦅", region: "Northeast" },
  { name: "Odisha",            emoji: "🌊", region: "East"     },
  { name: "Punjab",            emoji: "🌾", region: "North"    },
  { name: "Rajasthan",         emoji: "🏜️", region: "North"    },
  { name: "Sikkim",            emoji: "🏔️", region: "Northeast" },
  { name: "Tamil Nadu",        emoji: "🏛️", region: "South"    },
  { name: "Telangana",         emoji: "🌺", region: "South"    },
  { name: "Tripura",           emoji: "🌿", region: "Northeast" },
  { name: "Uttar Pradesh",     emoji: "🕌", region: "North"    },
  { name: "Uttarakhand",       emoji: "🏔️", region: "North"    },
  { name: "West Bengal",       emoji: "🎨", region: "East"     },
  // ── Union Territories ───────────────────────────────
  { name: "Delhi",                                emoji: "🏙️", region: "UT" },
  { name: "Jammu & Kashmir",                      emoji: "❄️", region: "UT" },
  { name: "Ladakh",                               emoji: "🗻", region: "UT" },
  { name: "Chandigarh",                           emoji: "🌳", region: "UT" },
  { name: "Puducherry",                           emoji: "🌊", region: "UT" },
  { name: "Andaman & Nicobar Islands",            emoji: "🏝️", region: "UT" },
  { name: "Lakshadweep",                          emoji: "🏝️", region: "UT" },
  { name: "Dadra, Nagar Haveli & Daman Diu",     emoji: "🏖️", region: "UT" },
];

// Map reverse-geocoded region/subregion keywords → state names
const REGION_MAP: Record<string, string> = {
  "andhra":         "Andhra Pradesh",
  "arunachal":      "Arunachal Pradesh",
  "assam":          "Assam",
  "bihar":          "Bihar",
  "chhattisgarh":   "Chhattisgarh",
  "goa":            "Goa",
  "gujarat":        "Gujarat",
  "haryana":        "Haryana",
  "himachal":       "Himachal Pradesh",
  "jharkhand":      "Jharkhand",
  "karnataka":      "Karnataka",
  "kerala":         "Kerala",
  "madhya pradesh": "Madhya Pradesh",
  "maharashtra":    "Maharashtra",
  "manipur":        "Manipur",
  "meghalaya":      "Meghalaya",
  "mizoram":        "Mizoram",
  "nagaland":       "Nagaland",
  "odisha":         "Odisha",
  "orissa":         "Odisha",
  "punjab":         "Punjab",
  "rajasthan":      "Rajasthan",
  "sikkim":         "Sikkim",
  "tamil":          "Tamil Nadu",
  "telangana":      "Telangana",
  "tripura":        "Tripura",
  "uttar pradesh":  "Uttar Pradesh",
  "uttarakhand":    "Uttarakhand",
  "west bengal":    "West Bengal",
  "delhi":          "Delhi",
  "jammu":          "Jammu & Kashmir",
  "kashmir":        "Jammu & Kashmir",
  "ladakh":         "Ladakh",
  "chandigarh":     "Chandigarh",
  "puducherry":     "Puducherry",
  "pondicherry":    "Puducherry",
  "andaman":        "Andaman & Nicobar Islands",
  "lakshadweep":    "Lakshadweep",
  "dadra":          "Dadra, Nagar Haveli & Daman Diu",
  "daman":          "Dadra, Nagar Haveli & Daman Diu",
};

function detectStateFromGeocode(addr: Location.LocationGeocodedAddress): string | null {
  const haystack = [addr.region, addr.subregion, addr.city, addr.district]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  for (const [key, state] of Object.entries(REGION_MAP)) {
    if (haystack.includes(key)) return state;
  }
  return null;
}

const TOTAL_STEPS = 6;

// ─── screen ───────────────────────────────────────────────────────────────────

export default function ProfileSetupScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { login } = useAuth();

  const [step, setStep] = useState(0);

  // step 0 — language
  const [language, setLanguage] = useState("");
  // step 1 — name + nickname
  const [name, setName]         = useState("");
  const [nickname, setNickname] = useState("");
  // step 2 — age + gender
  const [age, setAge]       = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  // step 3 — avatar picker
  const [avatarUri, setAvatarUri] = useState("");
  // step 4 — state + GPS
  const [state, setState]   = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  // step 5 — interests
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading]     = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : prev.length < 5 ? [...prev, interest] : prev
    );
  };

  const canProceed = [
    !!language,
    name.length >= 2,
    !!gender && parseInt(age) >= 18,
    true, // avatar step — always valid (has auto-generated default)
    !!state,
    interests.length >= 3,
  ][step];

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) { setStep(step + 1); return; }
    setLoading(true);
    const resolvedAvatar = avatarUri || getAvatarUrl(name, gender);
    await login({
      name,
      nickname: nickname.trim() || name,
      age: parseInt(age),
      gender: gender as "male" | "female" | "other",
      city: state,
      state,
      language,
      interests,
      avatar: resolvedAvatar,
      coins: 100,
      locationCoords: coords ?? undefined,
      registeredAt: new Date().toISOString(),
    });
    setLoading(false);
    router.replace("/(tabs)");
  };

  // GPS detection
  const detectLocation = async () => {
    setLocating(true);
    setLocError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocError("Location permission denied. Please select your state manually.");
        setLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      const [addr] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const detected = detectStateFromGeocode(addr);
      if (detected) {
        setState(detected);
        setLocError("");
      } else {
        setLocError("Couldn't auto-detect your state. Please select manually.");
      }
    } catch {
      setLocError("Could not access location. Please select manually.");
    }
    setLocating(false);
  };

  const selectedLang = LANGUAGES.find((l) => l.code === language);

  // Group states by region for display
  const regions = ["North", "South", "East", "West", "Central", "Northeast", "UT"];
  const regionLabels: Record<string, string> = {
    North: "North India", South: "South India", East: "East India",
    West: "West India", Central: "Central India", Northeast: "Northeast India",
    UT: "Union Territories",
  };

  const STEPS = [
    // ── 0: language ───────────────────────────────────────────────────────────
    {
      title: "Choose your language",
      subtitle: "You'll connect with people who speak the same language",
      content: (
        <View style={styles.langGrid}>
          {LANGUAGES.map((lang) => {
            const selected = language === lang.code;
            return (
              <Pressable
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={[
                  styles.langCard,
                  {
                    backgroundColor: selected ? colors.primary + "18" : colors.card,
                    borderColor: selected ? colors.primary : colors.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <Text style={styles.langEmoji}>{lang.emoji}</Text>
                <Text style={[styles.langLabel, { color: selected ? colors.primary : colors.foreground }]}>
                  {lang.label}
                </Text>
                <Text style={[styles.langSublabel, { color: colors.mutedForeground }]}>
                  {lang.sublabel}
                </Text>
                {selected && (
                  <View style={[styles.langCheck, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={10} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      ),
    },

    // ── 1: name + nickname ────────────────────────────────────────────────────
    {
      title: "Your name & display name",
      subtitle: "Real name stays private — nickname is what everyone sees",
      content: (
        <View style={{ gap: 16, width: "100%" }}>
          {/* Real name */}
          <View style={{ gap: 6 }}>
            <View style={styles.inputLabelRow}>
              <Feather name="lock" size={13} color={colors.mutedForeground} />
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Full Name (private)</Text>
            </View>
            <TextInput
              style={[styles.bigInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
          {/* Nickname */}
          <View style={{ gap: 6 }}>
            <View style={styles.inputLabelRow}>
              <Feather name="at-sign" size={13} color={colors.primary} />
              <Text style={[styles.inputLabel, { color: colors.primary }]}>Display Name / Nickname (public)</Text>
            </View>
            <TextInput
              style={[styles.bigInput, { color: colors.foreground, borderColor: nickname.trim() ? colors.primary : colors.border, backgroundColor: colors.card }]}
              placeholder={name.trim() || "e.g. Priya ✨ or @queen_priya"}
              placeholderTextColor={colors.mutedForeground}
              value={nickname}
              onChangeText={setNickname}
              maxLength={30}
            />
            <Text style={[styles.nicknameHint, { color: colors.mutedForeground }]}>
              {nickname.trim()
                ? `Others will see you as "${nickname.trim()}"`
                : `Leave blank to use your first name publicly`}
            </Text>
          </View>
        </View>
      ),
    },

    // ── 2: age + gender ───────────────────────────────────────────────────────
    {
      title: "A little about you",
      subtitle: "Age & gender for better matches",
      content: (
        <View style={{ gap: 16, width: "100%" }}>
          <TextInput
            style={[styles.bigInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder="Your age"
            placeholderTextColor={colors.mutedForeground}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            maxLength={2}
          />
          <View style={styles.genderRow}>
            {(["male", "female", "other"] as const).map((g) => (
              <Pressable
                key={g}
                onPress={() => setGender(g)}
                style={[
                  styles.genderBtn,
                  {
                    backgroundColor: gender === g ? colors.primary : colors.card,
                    borderColor: gender === g ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name={g === "male" ? "user" : g === "female" ? "user" : "users"}
                  size={18}
                  color={gender === g ? "#fff" : colors.mutedForeground}
                />
                <Text style={[styles.genderText, { color: gender === g ? "#fff" : colors.foreground }]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ),
    },

    // ── 3: avatar picker ──────────────────────────────────────────────────────
    {
      title: "Choose your avatar",
      subtitle: "Pick a 3D avatar that represents you",
      content: (
        <View style={{ width: "100%", gap: 16, alignItems: "center" }}>
          {/* Large preview of selected (or auto) avatar */}
          <View style={styles.avatarPreviewWrap}>
            <Avatar
              name={name || "You"}
              uri={avatarUri || undefined}
              gender={gender || undefined}
              size={110}
              hasStory
            />
            <View style={[styles.avatarPreviewBadge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.avatarPreviewBadgeText, { color: colors.primary }]}>
                {avatarUri ? "✨ Custom avatar" : "✨ Auto-generated for you"}
              </Text>
            </View>
          </View>

          <View style={{ width: "100%", gap: 10 }}>
            <AvatarPicker
              gender={gender || undefined}
              selected={avatarUri}
              onSelect={setAvatarUri}
            />
          </View>

          <Pressable
            onPress={() => setAvatarUri("")}
            style={[styles.resetAvatarBtn, { borderColor: colors.border }]}
          >
            <Feather name="refresh-cw" size={13} color={colors.mutedForeground} />
            <Text style={[styles.resetAvatarText, { color: colors.mutedForeground }]}>
              Reset to auto-generated
            </Text>
          </Pressable>

          <Text style={[styles.avatarNote, { color: colors.mutedForeground }]}>
            You can always change this later in your profile settings
          </Text>
        </View>
      ),
    },

    // ── 4: state ──────────────────────────────────────────────────────────────
    {
      title: "Where are you from?",
      subtitle: "Select your state in India",
      content: (
        <View style={{ width: "100%", gap: 12 }}>
          {/* GPS detect button */}
          <Pressable
            onPress={detectLocation}
            disabled={locating}
            style={[
              styles.detectBtn,
              {
                backgroundColor: coords ? colors.success + "15" : colors.secondary + "12",
                borderColor:     coords ? colors.success + "50" : colors.secondary + "40",
              },
            ]}
          >
            {locating ? (
              <ActivityIndicator size="small" color={colors.secondary} />
            ) : (
              <Feather
                name={coords ? "check-circle" : "map-pin"}
                size={18}
                color={coords ? colors.success : colors.secondary}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.detectLabel, { color: coords ? colors.success : colors.secondary }]}>
                {locating
                  ? "Detecting your location…"
                  : coords
                  ? `Location captured · ${state || "detecting state…"}`
                  : "Auto-detect my state"}
              </Text>
              {coords && (
                <Text style={[styles.detectSub, { color: colors.mutedForeground }]}>
                  {coords.latitude.toFixed(4)}°N  {coords.longitude.toFixed(4)}°E
                </Text>
              )}
              {!coords && !locating && (
                <Text style={[styles.detectSub, { color: colors.mutedForeground }]}>
                  Uses GPS to find your state automatically
                </Text>
              )}
            </View>
          </Pressable>

          {/* error */}
          {!!locError && (
            <View style={[styles.locErrorBox, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "30" }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.locErrorText, { color: colors.destructive }]}>{locError}</Text>
            </View>
          )}

          {/* selected state banner */}
          {!!state && (
            <View style={[styles.selectedStateBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "35" }]}>
              <Text style={{ fontSize: 20 }}>
                {INDIAN_STATES.find((s) => s.name === state)?.emoji ?? "📍"}
              </Text>
              <Text style={[styles.selectedStateText, { color: colors.primary }]}>
                {state} selected
              </Text>
              <Feather name="check-circle" size={16} color={colors.primary} />
            </View>
          )}

          <Text style={[styles.orDivider, { color: colors.mutedForeground }]}>— or select manually —</Text>

          {/* states grouped by region */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
            {regions.map((region) => {
              const group = INDIAN_STATES.filter((s) => s.region === region);
              if (group.length === 0) return null;
              return (
                <View key={region} style={{ marginBottom: 14 }}>
                  <Text style={[styles.regionLabel, { color: colors.mutedForeground }]}>
                    {regionLabels[region]}
                  </Text>
                  <View style={styles.stateGrid}>
                    {group.map((s) => {
                      const selected = state === s.name;
                      return (
                        <Pressable
                          key={s.name}
                          onPress={() => setState(s.name)}
                          style={[
                            styles.stateBtn,
                            {
                              backgroundColor: selected ? colors.primary : colors.card,
                              borderColor:     selected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={styles.stateEmoji}>{s.emoji}</Text>
                          <Text
                            style={[styles.stateName, { color: selected ? "#fff" : colors.foreground }]}
                            numberOfLines={2}
                          >
                            {s.name}
                          </Text>
                          {selected && (
                            <View style={[styles.stateCheck, { backgroundColor: "#fff" }]}>
                              <Feather name="check" size={8} color={colors.primary} />
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ),
    },

    // ── 4: interests ──────────────────────────────────────────────────────────
    {
      title: "Your interests",
      subtitle: "Pick at least 3 (max 5)",
      content: (
        <View style={styles.tagsWrap}>
          {INTERESTS.map((interest) => {
            const selected = interests.includes(interest);
            return (
              <Pressable
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[
                  styles.tag,
                  {
                    backgroundColor: selected ? colors.primary : colors.card,
                    borderColor:     selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: selected ? "#fff" : colors.foreground }]}>
                  {interest}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ),
    },
  ];

  const current = STEPS[step];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* progress bar */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => step > 0 ? setStep(step - 1) : router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` as any }]}
          />
        </View>
        <Text style={[styles.stepCount, { color: colors.mutedForeground }]}>{step + 1}/{TOTAL_STEPS}</Text>
      </View>

      {/* language selection banner */}
      {step === 0 && selectedLang ? (
        <View style={[styles.selectedLangBanner, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}>
          <Text style={styles.selectedLangEmoji}>{selectedLang.emoji}</Text>
          <Text style={[styles.selectedLangText, { color: colors.primary }]}>
            {selectedLang.label} selected — you'll match with {selectedLang.sublabel} speakers
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.foreground }]}>{current.title}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{current.subtitle}</Text>
        {step === 0 && language === "" && (
          <View style={[styles.langHint, { backgroundColor: colors.secondary + "12", borderColor: colors.secondary + "30" }]}>
            <Feather name="info" size={14} color={colors.secondary} />
            <Text style={[styles.langHintText, { color: colors.secondary }]}>
              All calls, matches & live streams will be filtered to your language
            </Text>
          </View>
        )}
        {current.content}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <GradientButton
          label={step === TOTAL_STEPS - 1 ? "Complete Profile 🎉" : "Continue"}
          onPress={handleNext}
          loading={loading}
          disabled={!canProceed}
          style={{ width: "100%" }}
        />
      </View>
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:  { flex: 1 },
  header:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  backBtn:    { padding: 4 },
  progressBg: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressBar:{ height: "100%", borderRadius: 3 },
  stepCount:  { fontSize: 13, fontFamily: "Inter_500Medium", minWidth: 32, textAlign: "right" },

  selectedLangBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 20, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  selectedLangEmoji:  { fontSize: 16 },
  selectedLangText:   { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },

  content:  { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 20 },
  title:    { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular" },

  langHint:     { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  langHintText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },

  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  langCard: { width: (width - 60) / 3, alignItems: "center", paddingVertical: 14, paddingHorizontal: 6, borderRadius: 16, gap: 5, position: "relative" },
  langEmoji:    { fontSize: 26 },
  langLabel:    { fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "center" },
  langSublabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  langCheck:    { position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },

  inputLabelRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  inputLabel:    { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  nicknameHint:  { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  bigInput:   { fontSize: 18, fontFamily: "Inter_500Medium", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1.5, width: "100%" },
  genderRow:  { flexDirection: "row", gap: 10 },
  genderBtn:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  genderText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // state picker
  detectBtn:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  detectLabel:  { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  detectSub:    { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  locErrorBox:  { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  locErrorText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  selectedStateBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  selectedStateText:   { flex: 1, fontSize: 15, fontFamily: "Inter_700Bold" },
  orDivider:    { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 0.5 },
  regionLabel:  { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  stateGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stateBtn:     { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, position: "relative" },
  stateEmoji:   { fontSize: 14 },
  stateName:    { fontSize: 12, fontFamily: "Inter_500Medium", maxWidth: 110 },
  stateCheck:   { position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },

  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag:      { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5 },
  tagText:  { fontSize: 14, fontFamily: "Inter_500Medium" },

  // avatar picker step
  avatarPreviewWrap:      { alignItems: "center", gap: 12 },
  avatarPreviewBadge:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  avatarPreviewBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  resetAvatarBtn:         { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  resetAvatarText:        { fontSize: 12, fontFamily: "Inter_400Regular" },
  avatarNote:             { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 20 },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
});
