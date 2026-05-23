import React, { useState } from "react";
import {
  Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";

// ── Types ─────────────────────────────────────────────────────────────────────
type FieldType = "short" | "long" | "choice" | "yesno" | "dropdown";

interface CustomQuestion {
  id: string;
  type: FieldType;
  question: string;
  choices?: string[];
  required: boolean;
}

const STANDARD_FIELDS = [
  { key: "name",       label: "Full Name",     icon: "user",      required: true },
  { key: "phone",      label: "Phone Number",  icon: "phone",     required: true },
  { key: "email",      label: "Email Address", icon: "mail",      required: false },
  { key: "city",       label: "City",          icon: "map-pin",   required: false },
  { key: "age",        label: "Age",           icon: "calendar",  required: false },
  { key: "gender",     label: "Gender",        icon: "users",     required: false },
  { key: "occupation", label: "Occupation",    icon: "briefcase", required: false },
];

const Q_TYPE_LABELS: Record<FieldType, string> = {
  short:    "Short Text",
  long:     "Long Text",
  choice:   "Multiple Choice",
  yesno:    "Yes / No",
  dropdown: "Dropdown",
};

const Q_TYPE_ICONS: Record<FieldType, string> = {
  short:    "type",
  long:     "align-left",
  choice:   "list",
  yesno:    "toggle-left",
  dropdown: "chevrons-down",
};

function makeId() {
  return Math.random().toString(36).slice(2, 8);
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step, total, colors }: { step: number; total: number; colors: ReturnType<typeof useColors> }) {
  return (
    <>
      <PrivateHead />
    <View style={sb.row}>
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <View key={s} style={sb.item}>
          <View style={[sb.dot, {
            backgroundColor: s <= step ? colors.primary : colors.muted,
            borderColor: s === step ? colors.primary : "transparent",
          }]}>
            {s < step
              ? <Feather name="check" size={11} color="#fff" />
              : <Text style={[sb.num, { color: s <= step ? "#fff" : colors.mutedForeground }]}>{s}</Text>}
          </View>
          {s < total && <View style={[sb.line, { backgroundColor: s < step ? colors.primary : colors.muted }]} />}
        </View>
      ))}
    </View>
  );
}

const sb = StyleSheet.create({
  row:  { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  item: { flexDirection: "row", alignItems: "center" },
  dot:  { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  num:  { fontSize: 12, fontFamily: "Inter_700Bold" },
  line: { width: 36, height: 2, marginHorizontal: 4 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function LeadFormBuilderScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep]       = useState<1 | 2 | 3 | "done">(1);

  // Step 1: basics
  const [formTitle,    setFormTitle]    = useState("");
  const [formDesc,     setFormDesc]     = useState("");
  const [thankMsg,     setThankMsg]     = useState("Thank you! We will get back to you soon.");
  const [ctaText,      setCtaText]      = useState("Submit");

  // Step 2: standard fields
  const [enabledFields, setEnabledFields] = useState<Set<string>>(
    new Set(["name", "phone", "email", "city"])
  );

  // Step 3: custom questions
  const [questions,    setQuestions]    = useState<CustomQuestion[]>([]);
  const [newQType,     setNewQType]     = useState<FieldType>("short");
  const [newQText,     setNewQText]     = useState("");
  const [newChoices,   setNewChoices]   = useState("Option A, Option B, Option C");

  const toggleField = (key: string) => {
    const field = STANDARD_FIELDS.find(f => f.key === key)!;
    if (field.required) return; // required fields always stay
    setEnabledFields(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const addQuestion = () => {
    if (!newQText.trim()) return;
    const q: CustomQuestion = {
      id: makeId(),
      type: newQType,
      question: newQText.trim(),
      choices: (newQType === "choice" || newQType === "dropdown")
        ? newChoices.split(",").map(s => s.trim()).filter(Boolean)
        : undefined,
      required: false,
    };
    setQuestions(prev => [...prev, q]);
    setNewQText("");
    setNewChoices("Option A, Option B, Option C");
  };

  const removeQuestion = (id: string) =>
    setQuestions(prev => prev.filter(q => q.id !== id));

  const toggleQRequired = (id: string) =>
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, required: !q.required } : q));

  const enabledCount = enabledFields.size;
  const totalFields  = enabledCount + questions.length;

  // ── Done screen ──────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { paddingTop: topPad + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.topTitle, { color: colors.foreground }]}>Lead Form Builder</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={[styles.doneWrap, { paddingTop: 40 }]}>
          <LinearGradient colors={["#2196F3", "#7B2FBE"]} style={styles.doneIcon}>
            <Feather name="check" size={36} color="#fff" />
          </LinearGradient>
          <Text style={[styles.doneTitle, { color: colors.foreground }]}>Lead Form Created!</Text>
          <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
            "{formTitle || "My Lead Form"}" is ready. It will appear when users click your Leads promotion.
          </Text>
          <View style={[styles.doneSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: "Form Title",     val: formTitle || "Untitled" },
              { label: "Fields",         val: `${totalFields} question${totalFields !== 1 ? "s" : ""}` },
              { label: "CTA Button",     val: ctaText },
              { label: "Thank You",      val: thankMsg.slice(0, 30) + (thankMsg.length > 30 ? "…" : "") },
            ].map(({ label, val }) => (
              <View key={label} style={[styles.doneRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.doneLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.doneVal, { color: colors.foreground }]}>{val}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={() => router.push("/lead-form-fill" as any)}
            style={styles.previewBtn}>
            <LinearGradient colors={["#2196F3", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.previewBtnGrad}>
              <Feather name="eye" size={16} color="#fff" />
              <Text style={styles.previewBtnText}>Preview as Prospect</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => router.back()} style={[styles.doneSecBtn, { borderColor: colors.border }]}>
            <Text style={[styles.doneSecText, { color: colors.foreground }]}>Back to Dashboard</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <LinearGradient colors={["#2196F3", "#7B2FBE"]} style={[styles.topGrad, { paddingTop: topPad + 10 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={[styles.topTitle, { color: "#fff" }]}>Lead Form Builder</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={styles.topSub}>Build a form to collect leads from your promotion</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <StepBar step={step} total={3} colors={colors} />

        {/* ── Step 1: Basics ── */}
        {step === 1 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Form Basics</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Give your form a title and intro message</Text>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Form Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. Get a Free Consultation"
              placeholderTextColor={colors.mutedForeground}
              value={formTitle}
              onChangeText={setFormTitle}
              maxLength={60}
            />
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{formTitle.length}/60</Text>

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Tell users what this is about and why they should fill it in"
              placeholderTextColor={colors.mutedForeground}
              value={formDesc}
              onChangeText={setFormDesc}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>CTA Button Text</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Submit"
              placeholderTextColor={colors.mutedForeground}
              value={ctaText}
              onChangeText={setCtaText}
              maxLength={30}
            />

            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Thank You Message</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Thank you! We will be in touch soon."
              placeholderTextColor={colors.mutedForeground}
              value={thankMsg}
              onChangeText={setThankMsg}
              multiline
              numberOfLines={2}
              maxLength={150}
            />

            <Pressable
              onPress={() => { if (formTitle.trim()) setStep(2); }}
              style={[styles.nextBtn, { opacity: formTitle.trim() ? 1 : 0.45 }]}
            >
              <LinearGradient colors={["#2196F3", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                <Text style={styles.nextBtnText}>Next: Contact Fields</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* ── Step 2: Standard Fields ── */}
        {step === 2 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Contact Fields</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Choose which info to collect — pre-filled from user profiles</Text>

            {STANDARD_FIELDS.map((field) => {
              const enabled = enabledFields.has(field.key);
              return (
                <Pressable
                  key={field.key}
                  onPress={() => toggleField(field.key)}
                  style={[styles.fieldRow, {
                    backgroundColor: enabled ? "#2196F315" : colors.card,
                    borderColor: enabled ? "#2196F3" : colors.border,
                    borderWidth: enabled ? 1.5 : 1,
                  }]}
                >
                  <View style={[styles.fieldRowIcon, { backgroundColor: enabled ? "#2196F320" : colors.muted }]}>
                    <Feather name={field.icon as any} size={16} color={enabled ? "#2196F3" : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldRowLabel, { color: colors.foreground }]}>{field.label}</Text>
                    {field.required && (
                      <Text style={styles.requiredTag}>Required · Always included</Text>
                    )}
                  </View>
                  <View style={[styles.toggleKnob, {
                    backgroundColor: enabled ? "#2196F3" : colors.muted,
                    borderColor: enabled ? "#2196F3" : colors.border,
                  }]}>
                    {enabled && <Feather name="check" size={12} color="#fff" />}
                  </View>
                </Pressable>
              );
            })}

            <View style={[styles.fieldCountBadge, { backgroundColor: colors.muted }]}>
              <Feather name="info" size={14} color={colors.mutedForeground} />
              <Text style={[styles.fieldCountText, { color: colors.mutedForeground }]}>
                {enabledCount} fields selected · These will be auto-filled where possible
              </Text>
            </View>

            <View style={styles.navRow}>
              <Pressable onPress={() => setStep(1)} style={[styles.backStepBtn, { borderColor: colors.border }]}>
                <Feather name="arrow-left" size={16} color={colors.foreground} />
                <Text style={[styles.backStepText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable onPress={() => setStep(3)} style={{ flex: 1 }}>
                <LinearGradient colors={["#2196F3", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                  <Text style={styles.nextBtnText}>Next: Custom Questions</Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Step 3: Custom Questions ── */}
        {step === 3 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Custom Questions</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Add up to 5 questions tailored to your requirements</Text>

            {/* Existing questions */}
            {questions.map((q, idx) => (
              <View key={q.id} style={[styles.qCard, { backgroundColor: colors.card, borderColor: "#2196F340" }]}>
                <View style={styles.qCardHeader}>
                  <View style={[styles.qBadge, { backgroundColor: "#2196F315" }]}>
                    <Feather name={Q_TYPE_ICONS[q.type] as any} size={13} color="#2196F3" />
                    <Text style={styles.qBadgeText}>{Q_TYPE_LABELS[q.type]}</Text>
                  </View>
                  <View style={styles.qCardActions}>
                    <Pressable
                      onPress={() => toggleQRequired(q.id)}
                      style={[styles.reqTag, { backgroundColor: q.required ? "#E91E8C20" : colors.muted, borderColor: q.required ? "#E91E8C50" : colors.border }]}
                    >
                      <Text style={[styles.reqTagText, { color: q.required ? "#E91E8C" : colors.mutedForeground }]}>
                        {q.required ? "Required" : "Optional"}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => removeQuestion(q.id)} style={styles.removeBtn}>
                      <Feather name="x" size={16} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                </View>
                <Text style={[styles.qText, { color: colors.foreground }]}>
                  {idx + 1}. {q.question}
                </Text>
                {q.choices && (
                  <View style={styles.choiceList}>
                    {q.choices.map((c, ci) => (
                      <View key={ci} style={[styles.choicePill, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.choicePillText, { color: colors.foreground }]}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {q.type === "yesno" && (
                  <View style={styles.choiceList}>
                    {["Yes", "No"].map((c) => (
                      <View key={c} style={[styles.choicePill, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.choicePillText, { color: colors.foreground }]}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}

            {/* Add new question */}
            {questions.length < 5 && (
              <View style={[styles.addQCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.addQTitle, { color: colors.foreground }]}>Add a Question</Text>

                {/* Question type */}
                <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.typeRow}>
                    {(Object.keys(Q_TYPE_LABELS) as FieldType[]).map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => setNewQType(t)}
                        style={[styles.typeChip, {
                          backgroundColor: newQType === t ? "#2196F320" : colors.muted,
                          borderColor: newQType === t ? "#2196F3" : colors.border,
                        }]}
                      >
                        <Feather name={Q_TYPE_ICONS[t] as any} size={13} color={newQType === t ? "#2196F3" : colors.mutedForeground} />
                        <Text style={[styles.typeChipText, { color: newQType === t ? "#2196F3" : colors.foreground }]}>
                          {Q_TYPE_LABELS[t]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                {/* Question text */}
                <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>Question</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="e.g. What service are you interested in?"
                  placeholderTextColor={colors.mutedForeground}
                  value={newQText}
                  onChangeText={setNewQText}
                  maxLength={120}
                />

                {/* Choices (for choice/dropdown) */}
                {(newQType === "choice" || newQType === "dropdown") && (
                  <>
                    <Text style={[styles.miniLabel, { color: colors.mutedForeground }]}>Options (comma-separated)</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="Option A, Option B, Option C"
                      placeholderTextColor={colors.mutedForeground}
                      value={newChoices}
                      onChangeText={setNewChoices}
                    />
                  </>
                )}

                <Pressable
                  onPress={addQuestion}
                  style={[styles.addQBtn, {
                    backgroundColor: newQText.trim() ? "#2196F3" : colors.muted,
                    opacity: newQText.trim() ? 1 : 0.5,
                  }]}
                >
                  <Feather name="plus" size={16} color="#fff" />
                  <Text style={styles.addQBtnText}>Add Question</Text>
                </Pressable>
              </View>
            )}

            {questions.length >= 5 && (
              <View style={[styles.maxQNote, { backgroundColor: colors.muted }]}>
                <Feather name="info" size={14} color={colors.mutedForeground} />
                <Text style={[styles.maxQText, { color: colors.mutedForeground }]}>Maximum 5 custom questions reached</Text>
              </View>
            )}

            <View style={styles.navRow}>
              <Pressable onPress={() => setStep(2)} style={[styles.backStepBtn, { borderColor: colors.border }]}>
                <Feather name="arrow-left" size={16} color={colors.foreground} />
                <Text style={[styles.backStepText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
              <Pressable onPress={() => setStep("done")} style={{ flex: 1 }}>
                <LinearGradient colors={["#2196F3", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                  <Feather name="save" size={16} color="#fff" />
                  <Text style={styles.nextBtnText}>Save Lead Form</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:       { flex: 1 },
  topGrad:    { paddingBottom: 16, paddingHorizontal: 16, gap: 4 },
  topBar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn:    { padding: 6 },
  topTitle:   { fontSize: 17, fontFamily: "Inter_700Bold" },
  topSub:     { fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 20 },
  scroll:     { padding: 18, paddingBottom: 48 },
  stepWrap:   { gap: 14 },
  stepTitle:  { fontSize: 20, fontFamily: "Inter_700Bold" },
  stepSub:    { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8, lineHeight: 19 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: -6 },
  miniLabel:  { fontSize: 12, fontFamily: "Inter_500Medium" },
  charCount:  { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right", marginTop: -10 },
  input:      { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, fontFamily: "Inter_400Regular" },
  textarea:   { minHeight: 72, textAlignVertical: "top" },
  nextBtn:    {},
  nextBtnGrad:{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13 },
  nextBtnText:{ color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  navRow:     { flexDirection: "row", gap: 10, alignItems: "stretch" },
  backStepBtn:{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
  backStepText:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },

  fieldRow:      { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 12 },
  fieldRowIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  fieldRowLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  requiredTag:   { fontSize: 11, fontFamily: "Inter_400Regular", color: "#E91E8C", marginTop: 2 },
  toggleKnob:    { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  fieldCountBadge: { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 10 },
  fieldCountText:  { fontSize: 12, fontFamily: "Inter_400Regular" },

  qCard:        { borderRadius: 14, borderWidth: 1.5, padding: 12, gap: 8 },
  qCardHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  qBadge:       { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  qBadgeText:   { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#2196F3" },
  qCardActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  reqTag:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  reqTagText:   { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  removeBtn:    { padding: 4 },
  qText:        { fontSize: 14, fontFamily: "Inter_500Medium" },
  choiceList:   { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  choicePill:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  choicePillText:{ fontSize: 12, fontFamily: "Inter_400Regular" },

  addQCard:    { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  addQTitle:   { fontSize: 14, fontFamily: "Inter_700Bold" },
  typeRow:     { flexDirection: "row", gap: 8, paddingBottom: 4 },
  typeChip:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  typeChipText:{ fontSize: 12, fontFamily: "Inter_500Medium" },
  addQBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 11 },
  addQBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  maxQNote:    { flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 10 },
  maxQText:    { fontSize: 12, fontFamily: "Inter_400Regular" },

  // Done
  doneWrap:    { alignItems: "center", padding: 24, gap: 16 },
  doneIcon:    { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  doneTitle:   { fontSize: 22, fontFamily: "Inter_700Bold" },
  doneSub:     { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  doneSummary: { width: "100%", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  doneRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  doneLabel:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  doneVal:     { fontSize: 12, fontFamily: "Inter_600SemiBold", flexShrink: 1, textAlign: "right", paddingLeft: 12 },
  previewBtn:  { width: "100%" },
  previewBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13 },
  previewBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  doneSecBtn:  { borderRadius: 12, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10 },
  doneSecText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
