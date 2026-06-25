import React, { useState } from "react";
import {
  Alert, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { PrivateHead } from "@/components/PrivateHead";

// ── Mock advertiser & form (in production these come from the campaign data) ──
const ADVERTISER = {
  name:    "Dev Raj",
  tagline: "Software Consultant · Bangalore",
  avatar:  "DR",
  verified: true,
};

const FORM = {
  title:   "Get a Free Tech Consultation",
  desc:    "I help startups & businesses build scalable software. Fill in your details and I'll reach out within 24 hours.",
  ctaText: "Request Consultation",
  thankTitle: "Thank you! 🙏",
  thankMsg:   "Dev will get back to you within 24 hours on WhatsApp or email.",
  standardFields: [
    { key: "name",  label: "Full Name",     icon: "user",    required: true,  type: "text"  },
    { key: "phone", label: "Phone Number",  icon: "phone",   required: true,  type: "phone" },
    { key: "email", label: "Email Address", icon: "mail",    required: false, type: "email" },
    { key: "city",  label: "City",          icon: "map-pin", required: false, type: "text"  },
  ],
  customQuestions: [
    { id: "q1", type: "choice",   question: "What type of project do you need help with?", choices: ["Mobile App","Web App","API / Backend","All of the above"], required: true  },
    { id: "q2", type: "short",    question: "What is your budget range (₹)?",              required: false },
    { id: "q3", type: "yesno",    question: "Do you have an existing app or website?",     required: false },
    { id: "q4", type: "dropdown", question: "When do you want to start?",                  choices: ["Immediately","Within 1 month","In 3+ months","Just exploring"], required: false },
  ],
};

// ── Pre-filled user values (from auth context in production) ─────────────────
const PREFILL: Record<string, string> = {
  name:  "Rahul Kumar",
  phone: "+91 XXXXX XXXXX",
  email: "rahul@example.com",
  city:  "Delhi",
};

export default function LeadFormFillScreen() {
  useTrackScreen("lead_form");
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;

  const [values,     setValues]     = useState<Record<string, string>>(PREFILL);
  const [choiceAns,  setChoiceAns]  = useState<Record<string, string>>({});
  const [submitted,  setSubmitted]  = useState(false);
  const [errors,     setErrors]     = useState<Set<string>>(new Set());

  const setValue = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const n = new Set(prev); n.delete(key); return n; });
  };

  const setChoice = (qId: string, val: string) => {
    setChoiceAns(prev => ({ ...prev, [qId]: val }));
    setErrors(prev => { const n = new Set(prev); n.delete(qId); return n; });
  };

  const validate = () => {
    const errs = new Set<string>();
    FORM.standardFields.forEach(f => {
      if (f.required && !values[f.key]?.trim()) errs.add(f.key);
    });
    FORM.customQuestions.forEach(q => {
      if (q.required && !choiceAns[q.id]?.trim() && !values[q.id]?.trim()) errs.add(q.id);
    });
    setErrors(errs);
    return errs.size === 0;
  };

  const handleSubmit = () => {
    if (validate()) setSubmitted(true);
  };

  // ── Thank you screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={styles.thankWrap}>
          <LinearGradient colors={["#2196F3", "#7B2FBE"]} style={styles.thankIcon}>
            <Feather name="check" size={40} color="#fff" />
          </LinearGradient>
          <Text style={[styles.thankTitle, { color: colors.foreground }]}>{FORM.thankTitle}</Text>
          <Text style={[styles.thankMsg, { color: colors.mutedForeground }]}>{FORM.thankMsg}</Text>

          <View style={[styles.advertiserCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient colors={["#2196F3", "#7B2FBE"]} style={styles.advAvatar}>
              <Text style={styles.advAvatarText}>{ADVERTISER.avatar}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <View style={styles.advNameRow}>
                <Text style={[styles.advName, { color: colors.foreground }]}>{ADVERTISER.name}</Text>
                {ADVERTISER.verified && <Feather name="check-circle" size={14} color="#2196F3" />}
              </View>
              <Text style={[styles.advTagline, { color: colors.mutedForeground }]}>{ADVERTISER.tagline}</Text>
            </View>
          </View>

          <Pressable onPress={() => router.back()}
            style={styles.backHomeBtn}>
            <LinearGradient colors={["#2196F3", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.backHomeBtnGrad}>
              <Text style={styles.backHomeBtnText}>Back to Feed</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <>
      <PrivateHead />
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#2196F3", "#7B2FBE"]} style={[styles.topGrad, { paddingTop: topPad + 8 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={[styles.adTag]}>
            <Feather name="zap" size={11} color="#fff" />
            <Text style={styles.adTagText}>Sponsored</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Advertiser card */}
        <View style={[styles.advertiserCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient colors={["#2196F3", "#7B2FBE"]} style={styles.advAvatar}>
            <Text style={styles.advAvatarText}>{ADVERTISER.avatar}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <View style={styles.advNameRow}>
              <Text style={[styles.advName, { color: colors.foreground }]}>{ADVERTISER.name}</Text>
              {ADVERTISER.verified && <Feather name="check-circle" size={14} color="#2196F3" />}
            </View>
            <Text style={[styles.advTagline, { color: colors.mutedForeground }]}>{ADVERTISER.tagline}</Text>
          </View>
          <Pressable style={[styles.viewProfileBtn, { borderColor: "#2196F350" }]} onPress={() => Alert.alert("Advertiser Profile", `View ${ADVERTISER.name} profile and other ads`)}>
            <Text style={[styles.viewProfileText, { color: "#2196F3" }]}>Profile</Text>
          </Pressable>
        </View>

        {/* Form header */}
        <View style={[styles.formHeader, { backgroundColor: "#2196F308", borderColor: "#2196F320" }]}>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>{FORM.title}</Text>
          <Text style={[styles.formDesc, { color: colors.mutedForeground }]}>{FORM.desc}</Text>
          <View style={[styles.prefillNote, { backgroundColor: "#34C75915", borderColor: "#34C75940" }]}>
            <Feather name="check-circle" size={13} color="#34C759" />
            <Text style={[styles.prefillNoteText, { color: "#34C759" }]}>Your details have been pre-filled from your Ridhi profile</Text>
          </View>
        </View>

        {/* Standard fields */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YOUR DETAILS</Text>
        {FORM.standardFields.map(field => {
          const hasError = errors.has(field.key);
          return (
            <View key={field.key} style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Feather name={field.icon as any} size={14} color={colors.mutedForeground} />
                <Text style={[styles.inputLabel, { color: colors.foreground }]}>
                  {field.label}{field.required ? " *" : ""}
                </Text>
                {values[field.key] && !hasError && (
                  <View style={styles.preFillBadge}>
                    <Feather name="zap" size={10} color="#2196F3" />
                    <Text style={styles.preFillBadgeText}>Pre-filled</Text>
                  </View>
                )}
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: values[field.key] ? "#2196F308" : colors.card,
                    borderColor: hasError ? "#FF3B30" : values[field.key] ? "#2196F350" : colors.border,
                    color: colors.foreground,
                  }
                ]}
                value={values[field.key] ?? ""}
                onChangeText={v => setValue(field.key, v)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={field.type === "phone" ? "phone-pad" : field.type === "email" ? "email-address" : "default"}
              />
              {hasError && <Text style={styles.errMsg}>This field is required</Text>}
            </View>
          );
        })}

        {/* Custom questions */}
        {FORM.customQuestions.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>QUESTIONS FROM {ADVERTISER.name.toUpperCase()}</Text>
            {FORM.customQuestions.map((q, idx) => {
              const hasError = errors.has(q.id);
              return (
                <View key={q.id} style={[styles.qBlock, { backgroundColor: colors.card, borderColor: hasError ? "#FF3B30" : colors.border }]}>
                  <Text style={[styles.qText, { color: colors.foreground }]}>
                    {idx + 1}. {q.question}{q.required ? " *" : ""}
                  </Text>

                  {/* Short / long text */}
                  {(q.type === "short" || q.type === "long") && (
                    <TextInput
                      style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="Your answer…"
                      placeholderTextColor={colors.mutedForeground}
                      multiline={q.type === "long"}
                      numberOfLines={q.type === "long" ? 3 : 1}
                      value={values[q.id] ?? ""}
                      onChangeText={v => setValue(q.id, v)}
                    />
                  )}

                  {/* Multiple choice / dropdown */}
                  {(q.type === "choice" || q.type === "dropdown" || q.type === "yesno") && (
                    <View style={styles.choiceWrap}>
                      {(q.type === "yesno" ? ["Yes", "No"] : q.choices ?? []).map((opt) => {
                        const sel = choiceAns[q.id] === opt;
                        return (
                          <Pressable
                            key={opt}
                            onPress={() => setChoice(q.id, opt)}
                            style={[styles.choiceOpt, {
                              backgroundColor: sel ? "#2196F315" : colors.background,
                              borderColor: sel ? "#2196F3" : colors.border,
                              borderWidth: sel ? 1.5 : 1,
                            }]}
                          >
                            <View style={[styles.choiceRadio, {
                              borderColor: sel ? "#2196F3" : colors.border,
                              backgroundColor: sel ? "#2196F3" : "transparent",
                            }]}>
                              {sel && <Feather name="check" size={10} color="#fff" />}
                            </View>
                            <Text style={[styles.choiceOptText, { color: colors.foreground }]}>{opt}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                  {hasError && <Text style={styles.errMsg}>This field is required</Text>}
                </View>
              );
            })}
          </>
        )}

        {/* Privacy notice */}
        <View style={[styles.privacyBox, { backgroundColor: colors.muted }]}>
          <Feather name="lock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>
            Your info is shared only with {ADVERTISER.name} and protected under Ridhi's Privacy Policy. You can request deletion at any time.
          </Text>
        </View>

        {/* Submit */}
        <Pressable onPress={handleSubmit} style={styles.submitBtn}>
          <LinearGradient colors={["#2196F3", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGrad}>
            <Feather name="send" size={16} color="#fff" />
            <Text style={styles.submitBtnText}>{FORM.ctaText}</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:       { flex: 1 },
  topGrad:    { paddingBottom: 12, paddingHorizontal: 16 },
  topBar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn:    { padding: 6 },
  adTag:      { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  adTagText:  { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  scroll:     { padding: 16, gap: 12, paddingBottom: 48 },

  advertiserCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 12 },
  advAvatar:      { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  advAvatarText:  { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  advNameRow:     { flexDirection: "row", alignItems: "center", gap: 4 },
  advName:        { fontSize: 14, fontFamily: "Inter_700Bold" },
  advTagline:     { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  viewProfileBtn: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  viewProfileText:{ fontSize: 12, fontFamily: "Inter_600SemiBold" },

  formHeader:   { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  formTitle:    { fontSize: 17, fontFamily: "Inter_700Bold" },
  formDesc:     { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  prefillNote:  { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1 },
  prefillNoteText:{ fontSize: 11, fontFamily: "Inter_500Medium" },

  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1, marginBottom: -4 },

  inputGroup:    { gap: 6 },
  inputLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  inputLabel:    { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  preFillBadge:  { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#2196F315", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  preFillBadgeText: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#2196F3" },
  textInput:     { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: "Inter_400Regular" },
  errMsg:        { fontSize: 11, fontFamily: "Inter_400Regular", color: "#FF3B30" },

  qBlock:     { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  qText:      { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  choiceWrap: { gap: 8 },
  choiceOpt:  { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 11 },
  choiceRadio:{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  choiceOptText:{ fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },

  privacyBox:  { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, padding: 12 },
  privacyText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 17 },

  submitBtn:     {},
  submitBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  submitBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  // Thank you
  thankWrap:      { alignItems: "center", padding: 28, gap: 16, paddingTop: 60 },
  thankIcon:      { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  thankTitle:     { fontSize: 24, fontFamily: "Inter_700Bold" },
  thankMsg:       { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  backHomeBtn:    { width: "100%" },
  backHomeBtnGrad:{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  backHomeBtnText:{ color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
