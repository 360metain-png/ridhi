import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { STATE_NAMES, getDistricts } from "@/data/indiaLocations";
import { FloatingEmojiBg } from "@/components/FloatingEmojiBg";

type JobType = "Full-time" | "Part-time" | "Freelance" | "Internship" | "Gig";
type SalaryUnit = "Month" | "Day" | "Hour" | "Project";
type Experience = "Fresher" | "0–1 yr" | "1–3 yrs" | "3–5 yrs" | "5–10 yrs" | "10+ yrs";

const JOB_POST_COST = 50; // coins deducted per job posting

const CATEGORIES = [
  "IT & Tech", "Healthcare", "Education", "Finance", "Retail",
  "Construction", "Hospitality", "Transport", "Marketing", "Design",
  "Sales", "Manufacturing", "Security", "Domestic", "Other",
];
const JOB_TYPES: JobType[] = ["Full-time", "Part-time", "Freelance", "Internship", "Gig"];
const SALARY_UNITS: SalaryUnit[] = ["Month", "Day", "Hour", "Project"];
const EXPERIENCE_LEVELS: Experience[] = ["Fresher", "0–1 yr", "1–3 yrs", "3–5 yrs", "5–10 yrs", "10+ yrs"];

interface OptionPickerProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  colors: ReturnType<typeof useColors>;
}

function OptionPicker({ label, options, value, onChange, required, colors }: OptionPickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <View style={fpStyles.fieldWrap}>
        <Text style={[fpStyles.fieldLabel, { color: colors.mutedForeground }]}>
          {label}{required && <Text style={{ color: "#E91E8C" }}> *</Text>}
        </Text>
        <Pressable
          onPress={() => setOpen(true)}
          style={[fpStyles.picker, { backgroundColor: colors.card, borderColor: value ? "#E91E8C50" : colors.border }]}
        >
          <Text style={[fpStyles.pickerText, { color: value ? colors.foreground : colors.mutedForeground }]}>
            {value || `Select ${label}`}
          </Text>
          <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={fpStyles.modalOverlay} onPress={() => setOpen(false)} />
        <View style={[fpStyles.optionSheet, { backgroundColor: colors.card }]}>
          <View style={[fpStyles.sheetHandle, { backgroundColor: colors.border }]} />
          <Text style={[fpStyles.sheetTitle, { color: colors.foreground }]}>Select {label}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((o) => (
              <Pressable
                key={o}
                onPress={() => { onChange(o); setOpen(false); }}
                style={[fpStyles.optionRow, { borderBottomColor: colors.border }]}
              >
                <Text style={[fpStyles.optionText, { color: o === value ? "#E91E8C" : colors.foreground }]}>{o}</Text>
                {o === value && <Feather name="check" size={16} color="#E91E8C" />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

function ChipGroup({ options, value, onChange, colors }: {
  options: string[]; value: string; onChange: (v: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={fpStyles.chipRow}>
      {options.map((o) => (
        <Pressable
          key={o}
          onPress={() => onChange(o)}
          style={[
            fpStyles.chip,
            value === o
              ? { backgroundColor: "#E91E8C" }
              : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
          ]}
        >
          <Text style={[fpStyles.chipText, { color: value === o ? "#fff" : colors.mutedForeground }]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Field({ label, required, colors, children }: {
  label: string; required?: boolean;
  colors: ReturnType<typeof useColors>; children: React.ReactNode;
}) {
  return (
    <View style={fpStyles.fieldWrap}>
      <Text style={[fpStyles.fieldLabel, { color: colors.mutedForeground }]}>
        {label}{required && <Text style={{ color: "#E91E8C" }}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

export default function JobsPostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, deductCoins } = useAuth();

  const [title,      setTitle]      = useState("");
  const [company,    setCompany]    = useState("");
  const [category,   setCategory]   = useState("");
  const [jobType,    setJobType]    = useState<JobType | "">("");
  const [jobState,    setJobState]    = useState("");
  const [jobDistrict, setJobDistrict] = useState("");
  const [area,        setArea]        = useState("");
  const [salaryMin,  setSalaryMin]  = useState("");
  const [salaryMax,  setSalaryMax]  = useState("");
  const [salaryUnit, setSalaryUnit] = useState<SalaryUnit>("Month");
  const [desc,       setDesc]       = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills,     setSkills]     = useState<string[]>([]);
  const [experience, setExperience] = useState<Experience | "">("");
  const [openings,   setOpenings]   = useState("1");
  const [submitted,  setSubmitted]  = useState(false);
  const [posting,    setPosting]    = useState(false);
  const [coinError,  setCoinError]  = useState(false);

  const verifiedPhone = user?.phone ?? "";
  const verifiedEmail = user?.email ?? "";
  const userCoins = user?.coins ?? 0;

  const canSubmit = !!(title.trim() && company.trim() && category && jobType && jobState && jobDistrict && salaryMin && desc.trim() && (verifiedPhone || verifiedEmail));

  const handlePost = async () => {
    if (!canSubmit || posting) return;
    setPosting(true);
    const ok = await deductCoins(JOB_POST_COST);
    setPosting(false);
    if (ok) {
      setSubmitted(true);
    } else {
      setCoinError(true);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 8) {
      setSkills((p) => [...p, s]);
      setSkillInput("");
    }
  };

  const inputStyle = [fpStyles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }];

  if (coinError) {
    return (
      <View style={[fpStyles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[fpStyles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 10 : 0) }]}>
          <Pressable onPress={() => router.back()} style={fpStyles.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={fpStyles.headerTitle}>Post a Job</Text>
            <Text style={fpStyles.headerSub}>Costs {JOB_POST_COST} coins</Text>
          </View>
        </LinearGradient>
        <View style={[fpStyles.successWrap, { paddingTop: insets.top + 40 }]}>
          <View style={[fpStyles.successIcon, { backgroundColor: "#FF3B3022" }]}>
            <Feather name="alert-circle" size={52} color="#FF3B30" />
          </View>
          <Text style={[fpStyles.successTitle, { color: colors.foreground }]}>Not Enough Coins</Text>
          <Text style={[fpStyles.successSub, { color: colors.mutedForeground }]}>
            Posting a job costs{" "}
            <Text style={{ color: "#E91E8C", fontFamily: "Inter_700Bold" }}>🪙 {JOB_POST_COST} coins</Text>.
            {"\n"}Your balance: <Text style={{ fontFamily: "Inter_700Bold" }}>🪙 {userCoins}</Text>
            {"\n\n"}Recharge your Ridhi Wallet to continue.
          </Text>
          <Pressable onPress={() => router.push("/wallet" as any)} style={fpStyles.successBtn}>
            <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={fpStyles.successBtnGrad}>
              <Feather name="zap" size={16} color="#fff" />
              <Text style={fpStyles.successBtnText}>Recharge Wallet</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => setCoinError(false)} style={{ marginTop: 12 }}>
            <Text style={[fpStyles.postAnotherLink, { color: colors.mutedForeground }]}>← Back to form</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (submitted) {
    return (
      <View style={[fpStyles.container, { backgroundColor: colors.background }]}>
        <View style={[fpStyles.successWrap, { paddingTop: insets.top + 60 }]}>
          <LinearGradient
            colors={["#E91E8C22", "#7B2FBE22"]}
            style={fpStyles.successIcon}
          >
            <Feather name="check-circle" size={56} color="#E91E8C" />
          </LinearGradient>
          <Text style={[fpStyles.successTitle, { color: colors.foreground }]}>Job Posted!</Text>
          <View style={[fpStyles.coinDeductedBadge, { backgroundColor: "#7B2FBE18", borderColor: "#7B2FBE30" }]}>
            <Text style={{ fontSize: 14 }}>🪙</Text>
            <Text style={[fpStyles.coinDeductedText, { color: "#7B2FBE" }]}>
              {JOB_POST_COST} coins deducted · Balance: {(user?.coins ?? 0)} coins
            </Text>
          </View>
          <Text style={[fpStyles.successSub, { color: colors.mutedForeground }]}>
            Your job listing for{"\n"}
            <Text style={{ color: "#E91E8C", fontFamily: "Inter_700Bold" }}>"{title}"</Text>
            {"\n"}is now live and visible to candidates in {jobDistrict || jobState}.
          </Text>
          <View style={fpStyles.successStats}>
            {[
              { icon: "map-pin",  label: [jobDistrict, jobState, area].filter(Boolean).join(" · ") },
              { icon: "briefcase", label: jobType },
              { icon: "users",    label: `${openings} opening${Number(openings) > 1 ? "s" : ""}` },
            ].map((s) => (
              <View key={s.label} style={[fpStyles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name={s.icon as any} size={13} color="#E91E8C" />
                <Text style={[fpStyles.statText, { color: colors.foreground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={() => router.push("/jobs" as any)} style={fpStyles.successBtn}>
            <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={fpStyles.successBtnGrad}>
              <Text style={fpStyles.successBtnText}>View Jobs Board</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => { setSubmitted(false); setTitle(""); setCompany(""); setCategory(""); setJobType(""); setJobState(""); setJobDistrict(""); setArea(""); setSalaryMin(""); setSalaryMax(""); setDesc(""); setSkills([]); }}>
            <Text style={[fpStyles.postAnotherLink, { color: "#E91E8C" }]}>+ Post Another Job</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[fpStyles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FloatingEmojiBg preset="communities" />
      {/* Header */}
      <LinearGradient
        colors={["#E91E8C", "#7B2FBE"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[fpStyles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 10 : 0) }]}
      >
        <Pressable onPress={() => router.back()} style={fpStyles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={fpStyles.headerTitle}>Post a Job</Text>
          <Text style={fpStyles.headerSub}>Reach candidates near you</Text>
        </View>
        <View style={fpStyles.freeBadge}>
          <Text style={fpStyles.freeBadgeText}>🪙 {JOB_POST_COST} coins</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[fpStyles.scroll, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Section: Job Details ── */}
        <Text style={[fpStyles.sectionTitle, { color: colors.foreground }]}>Job Details</Text>
        <View style={[fpStyles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Field label="Job Title" required colors={colors}>
            <TextInput
              style={inputStyle}
              placeholder="e.g. Senior React Native Developer"
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={setTitle}
            />
          </Field>
          <Field label="Company / Organisation Name" required colors={colors}>
            <TextInput
              style={inputStyle}
              placeholder="e.g. TechSpark Solutions"
              placeholderTextColor={colors.mutedForeground}
              value={company}
              onChangeText={setCompany}
            />
          </Field>
          <OptionPicker label="Category" options={CATEGORIES} value={category} onChange={setCategory} required colors={colors} />
          <Field label="Job Type" required colors={colors}>
            <ChipGroup options={JOB_TYPES} value={jobType} onChange={(v) => setJobType(v as JobType)} colors={colors} />
          </Field>
          <Field label="Number of Openings" colors={colors}>
            <TextInput
              style={inputStyle}
              placeholder="1"
              placeholderTextColor={colors.mutedForeground}
              value={openings}
              onChangeText={setOpenings}
              keyboardType="number-pad"
            />
          </Field>
          <OptionPicker label="Experience Required" options={EXPERIENCE_LEVELS} value={experience} onChange={(v) => setExperience(v as Experience)} colors={colors} />
        </View>

        {/* ── Section: Location ── */}
        <Text style={[fpStyles.sectionTitle, { color: colors.foreground }]}>Location</Text>
        <View style={[fpStyles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <OptionPicker
            label="State / Union Territory"
            options={STATE_NAMES}
            value={jobState}
            onChange={(v) => { setJobState(v); setJobDistrict(""); }}
            required
            colors={colors}
          />
          {jobState ? (
            <OptionPicker
              label="District"
              options={getDistricts(jobState)}
              value={jobDistrict}
              onChange={setJobDistrict}
              required
              colors={colors}
            />
          ) : (
            <View style={[fpStyles.districtHint, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="info" size={13} color={colors.mutedForeground} />
              <Text style={[fpStyles.districtHintText, { color: colors.mutedForeground }]}>
                Select a state first to choose the district
              </Text>
            </View>
          )}
          <Field label="Area / Locality (optional)" colors={colors}>
            <TextInput
              style={inputStyle}
              placeholder="e.g. Koramangala, Andheri West…"
              placeholderTextColor={colors.mutedForeground}
              value={area}
              onChangeText={setArea}
            />
          </Field>
        </View>

        {/* ── Section: Salary ── */}
        <Text style={[fpStyles.sectionTitle, { color: colors.foreground }]}>Salary / Compensation</Text>
        <View style={[fpStyles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Field label="Pay Period" required colors={colors}>
            <ChipGroup options={SALARY_UNITS} value={salaryUnit} onChange={(v) => setSalaryUnit(v as SalaryUnit)} colors={colors} />
          </Field>
          <View style={fpStyles.salaryRow}>
            <View style={{ flex: 1 }}>
              <Field label="Min (₹)" required colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="20000"
                  placeholderTextColor={colors.mutedForeground}
                  value={salaryMin}
                  onChangeText={setSalaryMin}
                  keyboardType="number-pad"
                />
              </Field>
            </View>
            <Text style={[fpStyles.salaryDash, { color: colors.mutedForeground }]}>—</Text>
            <View style={{ flex: 1 }}>
              <Field label="Max (₹)" colors={colors}>
                <TextInput
                  style={inputStyle}
                  placeholder="40000"
                  placeholderTextColor={colors.mutedForeground}
                  value={salaryMax}
                  onChangeText={setSalaryMax}
                  keyboardType="number-pad"
                />
              </Field>
            </View>
          </View>
        </View>

        {/* ── Section: Job Description ── */}
        <Text style={[fpStyles.sectionTitle, { color: colors.foreground }]}>Job Description</Text>
        <View style={[fpStyles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Field label="Description" required colors={colors}>
            <TextInput
              style={[inputStyle, fpStyles.textArea]}
              placeholder={"Describe the role, responsibilities, perks, working hours, and any other relevant info…"}
              placeholderTextColor={colors.mutedForeground}
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </Field>
          <Field label="Required Skills" colors={colors}>
            <View style={fpStyles.skillInputRow}>
              <TextInput
                style={[inputStyle, { flex: 1 }]}
                placeholder="Type a skill and press Add"
                placeholderTextColor={colors.mutedForeground}
                value={skillInput}
                onChangeText={setSkillInput}
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
              <Pressable onPress={addSkill} style={fpStyles.addSkillBtn}>
                <Feather name="plus" size={16} color="#fff" />
              </Pressable>
            </View>
            {skills.length > 0 && (
              <View style={fpStyles.skillsList}>
                {skills.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSkills((p) => p.filter((x) => x !== s))}
                    style={[fpStyles.skillTag, { backgroundColor: "#E91E8C22", borderColor: "#E91E8C50" }]}
                  >
                    <Text style={fpStyles.skillTagText}>{s}</Text>
                    <Feather name="x" size={10} color="#E91E8C" />
                  </Pressable>
                ))}
              </View>
            )}
          </Field>
        </View>

        {/* ── Section: Verified Contact ── */}
        <Text style={[fpStyles.sectionTitle, { color: colors.foreground }]}>Contact Info (Verified)</Text>
        <View style={[fpStyles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[fpStyles.verifiedNote, { backgroundColor: "#34C75912", borderColor: "#34C75940" }]}>
            <Feather name="shield" size={14} color="#34C759" />
            <Text style={[fpStyles.verifiedNoteText, { color: colors.mutedForeground }]}>
              Your verified Ridhi contact details will be shown to job seekers. You cannot change these here — update them in your profile settings.
            </Text>
          </View>

          {verifiedPhone ? (
            <View style={[fpStyles.verifiedRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={[fpStyles.verifiedIconWrap, { backgroundColor: "#25D36620" }]}>
                <Feather name="phone" size={16} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[fpStyles.verifiedLabel, { color: colors.mutedForeground }]}>Phone Number</Text>
                <Text style={[fpStyles.verifiedValue, { color: colors.foreground }]}>{verifiedPhone}</Text>
              </View>
              <View style={fpStyles.verifiedBadge}>
                <Feather name="check-circle" size={12} color="#34C759" />
                <Text style={fpStyles.verifiedBadgeText}>Verified</Text>
              </View>
            </View>
          ) : (
            <View style={[fpStyles.missingContact, { backgroundColor: "#FF9500" + "15", borderColor: "#FF9500" + "40" }]}>
              <Feather name="alert-circle" size={14} color="#FF9500" />
              <Text style={[fpStyles.missingContactText, { color: colors.mutedForeground }]}>
                No verified phone found. Add your phone number in Profile → Settings.
              </Text>
            </View>
          )}

          {verifiedEmail ? (
            <View style={[fpStyles.verifiedRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={[fpStyles.verifiedIconWrap, { backgroundColor: "#2196F320" }]}>
                <Feather name="mail" size={16} color="#2196F3" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[fpStyles.verifiedLabel, { color: colors.mutedForeground }]}>Email Address</Text>
                <Text style={[fpStyles.verifiedValue, { color: colors.foreground }]}>{verifiedEmail}</Text>
              </View>
              <View style={fpStyles.verifiedBadge}>
                <Feather name="check-circle" size={12} color="#34C759" />
                <Text style={fpStyles.verifiedBadgeText}>Verified</Text>
              </View>
            </View>
          ) : (
            <View style={[fpStyles.missingContact, { backgroundColor: "#FF9500" + "15", borderColor: "#FF9500" + "40" }]}>
              <Feather name="alert-circle" size={14} color="#FF9500" />
              <Text style={[fpStyles.missingContactText, { color: colors.mutedForeground }]}>
                No email found. Add your email in Profile → Settings.
              </Text>
            </View>
          )}
        </View>

        {/* Coin cost summary */}
        <View style={[fpStyles.coinSummary, { backgroundColor: "#7B2FBE14", borderColor: "#7B2FBE30" }]}>
          <View style={fpStyles.coinSummaryRow}>
            <Feather name="zap" size={14} color="#7B2FBE" />
            <Text style={[fpStyles.coinSummaryText, { color: "#7B2FBE" }]}>
              Posting costs <Text style={{ fontFamily: "Inter_700Bold" }}>🪙 {JOB_POST_COST} coins</Text>
            </Text>
          </View>
          <View style={fpStyles.coinSummaryRow}>
            <Feather name="pocket" size={14} color={userCoins >= JOB_POST_COST ? "#34C759" : "#FF3B30"} />
            <Text style={[fpStyles.coinSummaryText, { color: userCoins >= JOB_POST_COST ? "#34C759" : "#FF3B30" }]}>
              Your balance: <Text style={{ fontFamily: "Inter_700Bold" }}>🪙 {userCoins}</Text>
              {userCoins < JOB_POST_COST ? "  · Insufficient — recharge wallet" : "  · Ready to post!"}
            </Text>
          </View>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handlePost}
          disabled={!canSubmit || posting || userCoins < JOB_POST_COST}
          style={{ opacity: (canSubmit && !posting && userCoins >= JOB_POST_COST) ? 1 : 0.5, marginTop: 4 }}
        >
          <LinearGradient
            colors={["#E91E8C", "#7B2FBE"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={fpStyles.submitBtn}
          >
            <Feather name={posting ? "loader" : "send"} size={18} color="#fff" />
            <Text style={fpStyles.submitText}>
              {posting ? "Posting…" : userCoins < JOB_POST_COST ? "Insufficient Coins" : `Post Job — 🪙${JOB_POST_COST}`}
            </Text>
          </LinearGradient>
        </Pressable>
        {userCoins < JOB_POST_COST && (
          <Pressable onPress={() => router.push("/wallet" as any)} style={{ alignItems: "center", marginTop: 8 }}>
            <Text style={{ color: "#E91E8C", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>
              + Recharge Wallet
            </Text>
          </Pressable>
        )}
        <Text style={[fpStyles.disclaimer, { color: colors.mutedForeground }]}>
          By posting, you agree that the listing is genuine and complies with applicable labour laws.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const fpStyles = StyleSheet.create({
  container:       { flex: 1 },
  header:          { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  backBtn:         { padding: 4 },
  headerTitle:     { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub:       { fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },
  freeBadge:       { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  freeBadgeText:   { fontSize: 11, fontFamily: "Inter_700Bold", color: "#E91E8C" },
  scroll:          { padding: 16 },
  sectionTitle:    { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 8, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5 },
  section:         { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16, marginBottom: 4 },
  fieldWrap:       { gap: 6 },
  fieldLabel:      { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  input:           { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, fontFamily: "Inter_400Regular" },
  textArea:        { minHeight: 110, paddingTop: 11 },
  picker:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  pickerText:      { fontSize: 14, fontFamily: "Inter_400Regular" },
  chipRow:         { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  chipText:        { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  salaryRow:       { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  salaryDash:      { fontSize: 18, marginBottom: 10, fontFamily: "Inter_700Bold" },
  skillInputRow:   { flexDirection: "row", gap: 8 },
  addSkillBtn:     { backgroundColor: "#E91E8C", paddingHorizontal: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  skillsList:      { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  skillTag:        { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  skillTagText:    { fontSize: 12, fontFamily: "Inter_500Medium", color: "#E91E8C" },
  submitBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 },
  submitText:      { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  disclaimer:      { fontSize: 11, textAlign: "center", marginTop: 12, lineHeight: 16 },

  paywallHero:         { alignItems: "center", borderRadius: 20, borderWidth: 1, padding: 28, marginBottom: 4, gap: 14 },
  paywallIconWrap:     { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  paywallTitle:        { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  paywallSub:          { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  benefitRow:          { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitIcon:         { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  benefitText:         { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 20 },
  planRow:             { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  planName:            { fontSize: 15, fontFamily: "Inter_700Bold" },
  planPrice:           { fontSize: 14, fontFamily: "Inter_700Bold" },

  verifiedNote:        { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  verifiedNoteText:    { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  verifiedRow:         { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  verifiedIconWrap:    { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  verifiedLabel:       { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 2 },
  verifiedValue:       { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  verifiedBadge:       { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#34C75918", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  verifiedBadgeText:   { fontSize: 11, fontFamily: "Inter_700Bold", color: "#34C759" },
  missingContact:      { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  missingContactText:  { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  districtHint:      { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  districtHintText:  { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },

  modalOverlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  optionSheet:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: 480 },
  sheetHandle:     { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  sheetTitle:      { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  optionRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1 },
  optionText:      { fontSize: 15, fontFamily: "Inter_500Medium" },

  coinSummary:        { borderRadius: 12, borderWidth: 1, padding: 12, gap: 8, marginTop: 8 },
  coinSummaryRow:     { flexDirection: "row", alignItems: "center", gap: 8 },
  coinSummaryText:    { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },

  coinDeductedBadge:  { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  coinDeductedText:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  successWrap:     { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  successIcon:     { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successTitle:    { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 10 },
  successSub:      { fontSize: 15, textAlign: "center", lineHeight: 24, marginBottom: 24 },
  successStats:    { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 },
  statChip:        { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  statText:        { fontSize: 13, fontFamily: "Inter_500Medium" },
  successBtn:      { width: "100%", marginBottom: 16 },
  successBtnGrad:  { paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  successBtnText:  { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  postAnotherLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", padding: 8 },
});
