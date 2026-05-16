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

const INTERESTS = [
  "Music", "Travel", "Food", "Fitness", "Books",
  "Photography", "Dancing", "Gaming", "Art", "Movies",
  "Cricket", "Yoga", "Cooking", "Tech", "Fashion",
  "Spirituality", "Pets", "Business",
];

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat"];

export default function ProfileSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : prev.length < 5 ? [...prev, interest] : prev
    );
  };

  const canProceed = [
    name.length >= 2,
    !!gender && parseInt(age) >= 18,
    !!city,
    interests.length >= 3,
  ][step];

  const handleNext = async () => {
    if (step < 3) { setStep(step + 1); return; }
    setLoading(true);
    await login({
      name,
      age: parseInt(age),
      gender: gender as "male" | "female" | "other",
      city,
      interests,
      bio,
      coins: 100,
    });
    setLoading(false);
    router.replace("/(tabs)");
  };

  const STEPS = [
    {
      title: "What's your name?",
      subtitle: "How should we introduce you",
      content: (
        <TextInput
          style={[styles.bigInput, { color: colors.foreground, borderColor: colors.border }]}
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
            style={[styles.bigInput, { color: colors.foreground, borderColor: colors.border }]}
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
                    backgroundColor: gender === g ? colors.primary : colors.muted,
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
                    backgroundColor: city === c ? colors.primary : colors.muted,
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
                    backgroundColor: selected ? colors.primary : colors.muted,
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
            style={[styles.progressBar, { width: `${((step + 1) / STEPS.length) * 100}%` }]}
          />
        </View>
        <Text style={[styles.stepCount, { color: colors.mutedForeground }]}>{step + 1}/{STEPS.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.foreground }]}>{current.title}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{current.subtitle}</Text>
        {current.content}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <GradientButton
          label={step === STEPS.length - 1 ? "Complete Profile" : "Continue"}
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
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 120, gap: 24 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular" },
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
