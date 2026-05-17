import React, { useState } from "react";
import {
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
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { GradientButton } from "@/components/GradientButton";

const { width } = Dimensions.get("window");

const LANGUAGES = [
  { code: "Hindi", label: "हिंदी", sublabel: "Hindi", emoji: "🇮🇳" },
  { code: "Bengali", label: "বাংলা", sublabel: "Bengali", emoji: "🌿" },
  { code: "Telugu", label: "తెలుగు", sublabel: "Telugu", emoji: "🌺" },
  { code: "Tamil", label: "தமிழ்", sublabel: "Tamil", emoji: "🏛️" },
  { code: "Marathi", label: "मराठी", sublabel: "Marathi", emoji: "🌸" },
  { code: "Gujarati", label: "ગુજરાતી", sublabel: "Gujarati", emoji: "💐" },
  { code: "Kannada", label: "ಕನ್ನಡ", sublabel: "Kannada", emoji: "🏔️" },
  { code: "Malayalam", label: "മലയാളം", sublabel: "Malayalam", emoji: "🌴" },
  { code: "Punjabi", label: "ਪੰਜਾਬੀ", sublabel: "Punjabi", emoji: "🌾" },
  { code: "Odia", label: "ଓଡ଼ିଆ", sublabel: "Odia", emoji: "🌊" },
  { code: "Assamese", label: "অসমীয়া", sublabel: "Assamese", emoji: "🍃" },
  { code: "Urdu", label: "اردو", sublabel: "Urdu", emoji: "☪️" },
  { code: "Rajasthani", label: "राजस्थानी", sublabel: "Rajasthani", emoji: "🏰" },
  { code: "English", label: "English", sublabel: "English", emoji: "🌍" },
];

const INTERESTS = [
  "Music", "Travel", "Food", "Fitness", "Books",
  "Photography", "Dancing", "Gaming", "Art", "Movies",
  "Cricket", "Yoga", "Cooking", "Tech", "Fashion",
  "Spirituality", "Pets", "Business",
];

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat"];

const TOTAL_STEPS = 5;

export default function ProfileSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [step, setStep] = useState(0);

  // Step 0: language
  const [language, setLanguage] = useState("");
  // Step 1: name
  const [name, setName] = useState("");
  // Step 2: age + gender
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  // Step 3: city
  const [city, setCity] = useState("");
  // Step 4: interests
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : prev.length < 5 ? [...prev, interest] : prev
    );
  };

  const canProceed = [
    !!language,
    name.length >= 2,
    !!gender && parseInt(age) >= 18,
    !!city,
    interests.length >= 3,
  ][step];

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) { setStep(step + 1); return; }
    setLoading(true);
    await login({
      name,
      age: parseInt(age),
      gender: gender as "male" | "female" | "other",
      city,
      language,
      interests,
      coins: 100,
    });
    setLoading(false);
    router.replace("/(tabs)");
  };

  const selectedLang = LANGUAGES.find((l) => l.code === language);

  const STEPS = [
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
    {
      title: "What's your name?",
      subtitle: "How should we introduce you",
      content: (
        <TextInput
          style={[styles.bigInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
          placeholder="Your full name"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
          autoFocus
        />
      ),
    },
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
    {
      title: "Where are you from?",
      subtitle: "Find people near you",
      content: (
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300, width: "100%" }}>
          <View style={styles.cityGrid}>
            {CITIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCity(c)}
                style={[
                  styles.cityBtn,
                  {
                    backgroundColor: city === c ? colors.primary : colors.card,
                    borderColor: city === c ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.cityText, { color: city === c ? "#fff" : colors.foreground }]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ),
    },
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
                    borderColor: selected ? colors.primary : colors.border,
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
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => step > 0 ? setStep(step - 1) : router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBar, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]}
          />
        </View>
        <Text style={[styles.stepCount, { color: colors.mutedForeground }]}>{step + 1}/{TOTAL_STEPS}</Text>
      </View>

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  progressBg: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 3 },
  stepCount: { fontSize: 13, fontFamily: "Inter_500Medium", minWidth: 32, textAlign: "right" },
  selectedLangBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedLangEmoji: { fontSize: 16 },
  selectedLangText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 20 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular" },
  langHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  langHintText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  langCard: {
    width: (width - 60) / 3,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    gap: 5,
    position: "relative",
  },
  langEmoji: { fontSize: 26 },
  langLabel: { fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "center" },
  langSublabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  langCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  bigInput: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    width: "100%",
  },
  genderRow: { flexDirection: "row", gap: 10 },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  genderText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  cityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cityBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  cityText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5 },
  tagText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  footer: { paddingHorizontal: 24, paddingTop: 12 },
});
