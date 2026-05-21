import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";

type ExpLevel = "fresher" | "1-2" | "3-5" | "5-10" | "10+";
type JobType   = "full-time" | "part-time" | "freelance" | "internship";
type Avail     = "immediate" | "2weeks" | "1month" | "2months";

const EXP_LEVELS: { key: ExpLevel; label: string }[] = [
  { key: "fresher", label: "Fresher"   },
  { key: "1-2",     label: "1–2 yrs"  },
  { key: "3-5",     label: "3–5 yrs"  },
  { key: "5-10",    label: "5–10 yrs" },
  { key: "10+",     label: "10+ yrs"  },
];

const JOB_TYPES: { key: JobType; label: string; icon: string }[] = [
  { key: "full-time",  label: "Full-time",  icon: "briefcase" },
  { key: "part-time",  label: "Part-time",  icon: "clock"     },
  { key: "freelance",  label: "Freelance",  icon: "zap"       },
  { key: "internship", label: "Internship", icon: "book-open" },
];

const AVAILABILITIES: { key: Avail; label: string }[] = [
  { key: "immediate", label: "Immediate"     },
  { key: "2weeks",    label: "Within 2 wks"  },
  { key: "1month",    label: "Within 1 month"},
  { key: "2months",   label: "Within 2 months"},
];

const SKILL_SUGGESTIONS = [
  "React Native","JavaScript","TypeScript","Python","Java","Flutter","Android","iOS",
  "Node.js","SQL","Excel","Photoshop","Video Editing","Content Writing","Digital Marketing",
  "UI/UX","Figma","Sales","Customer Support","Accounting",
];

export default function ResumeScreen() {
  const colors = useColors();
  const router  = useRouter();

  const [currentRole,  setCurrentRole]  = useState("");
  const [company,      setCompany]      = useState("");
  const [expLevel,     setExpLevel]     = useState<ExpLevel>("fresher");
  const [skills,       setSkills]       = useState<string[]>([]);
  const [skillInput,   setSkillInput]   = useState("");
  const [minSalary,    setMinSalary]    = useState("");
  const [maxSalary,    setMaxSalary]    = useState("");
  const [location,     setLocation]     = useState("");
  const [remote,       setRemote]       = useState(false);
  const [jobTypes,     setJobTypes]     = useState<JobType[]>(["full-time"]);
  const [availability, setAvailability] = useState<Avail>("immediate");
  const [headline,     setHeadline]     = useState("");
  const [about,        setAbout]        = useState("");
  const [linkedin,     setLinkedin]     = useState("");
  const [portfolio,    setPortfolio]    = useState("");
  const [uploaded,     setUploaded]     = useState(false);
  const [saved,        setSaved]        = useState(false);

  const addSkill = (s: string) => {
    const clean = s.trim();
    if (clean && !skills.includes(clean) && skills.length < 20) {
      setSkills(prev => [...prev, clean]);
    }
    setSkillInput("");
  };

  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s));

  const toggleJobType = (t: JobType) =>
    setJobTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = () => {
    if (!currentRole.trim()) {
      Alert.alert("Required", "Please enter your current / desired role.");
      return;
    }
    setSaved(true);
    setTimeout(() => {
      Alert.alert("Resume Saved!", "Your resume is now visible to recruiters on Ridhi Jobs.", [
        { text: "View Jobs", onPress: () => router.push("/jobs" as any) },
        { text: "OK", onPress: () => router.back() },
      ]);
    }, 300);
  };

  const handleUploadPDF = () => {
    // In a real app: use expo-document-picker
    Alert.alert(
      "Upload Resume PDF",
      "Tap OK to simulate uploading your PDF resume. (expo-document-picker required for real upload)",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => setUploaded(true) },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <PrivateHead />
      {/* Header */}
      <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>My Resume</Text>
          <Text style={styles.headerSub}>Visible to recruiters on Ridhi Jobs</Text>
        </View>
        {saved && (
          <View style={styles.savedBadge}>
            <Feather name="check" size={12} color="#34C759" />
            <Text style={styles.savedTxt}>Saved</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* PDF Upload card */}
        <Pressable onPress={handleUploadPDF}
          style={[styles.uploadCard, { backgroundColor: colors.card, borderColor: uploaded ? "#34C759" : "#7B2FBE40", borderStyle: "dashed" }]}>
          {uploaded ? (
            <>
              <View style={[styles.uploadIcon, { backgroundColor: "#34C75920" }]}>
                <Feather name="file-text" size={26} color="#34C759" />
              </View>
              <Text style={[styles.uploadTitle, { color: "#34C759" }]}>resume.pdf uploaded ✓</Text>
              <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Tap to replace</Text>
            </>
          ) : (
            <>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.uploadIcon}>
                <Feather name="upload" size={26} color="#fff" />
              </LinearGradient>
              <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Upload Resume PDF</Text>
              <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>
                PDF, DOC or DOCX · Max 5 MB
              </Text>
              <View style={[styles.uploadBtn, { backgroundColor: "#7B2FBE20", borderColor: "#7B2FBE40" }]}>
                <Text style={{ color: "#7B2FBE", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>Choose File</Text>
              </View>
            </>
          )}
        </Pressable>

        {/* OR divider */}
        <View style={styles.divider}>
          <View style={[styles.divLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.divTxt, { color: colors.mutedForeground }]}>OR fill your profile</Text>
          <View style={[styles.divLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Professional Headline */}
        <Section label="Professional Headline" colors={colors}>
          <Input
            value={headline}
            onChangeText={setHeadline}
            placeholder="e.g. Full Stack Developer | 3 yrs exp | Open to remote"
            colors={colors}
          />
        </Section>

        {/* Current / Desired Role */}
        <Section label="Current / Desired Role *" colors={colors}>
          <Input
            value={currentRole}
            onChangeText={setCurrentRole}
            placeholder="e.g. Software Engineer, Graphic Designer, Sales Executive"
            colors={colors}
          />
        </Section>

        {/* Current Company */}
        <Section label="Current Company / College" colors={colors}>
          <Input
            value={company}
            onChangeText={setCompany}
            placeholder="e.g. Infosys, IIT Delhi, Fresher"
            colors={colors}
          />
        </Section>

        {/* Experience Level */}
        <Section label="Experience Level" colors={colors}>
          <View style={styles.chipRow}>
            {EXP_LEVELS.map(({ key, label }) => (
              <Pressable key={key} onPress={() => setExpLevel(key)}
                style={[styles.chip, {
                  backgroundColor: expLevel === key ? "#7B2FBE" : colors.muted,
                  borderColor:     expLevel === key ? "#7B2FBE" : colors.border,
                }]}>
                <Text style={[styles.chipTxt, { color: expLevel === key ? "#fff" : colors.foreground }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {/* Skills */}
        <Section label="Skills (up to 20)" colors={colors}>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <TextInput
              value={skillInput}
              onChangeText={setSkillInput}
              placeholder="Type a skill and press Add"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="done"
              onSubmitEditing={() => addSkill(skillInput)}
              style={[styles.inputField, { color: colors.foreground }]}
            />
            <Pressable onPress={() => addSkill(skillInput)}
              style={{ backgroundColor: "#7B2FBE", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" }}>Add</Text>
            </Pressable>
          </View>

          {/* Suggestions */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 12).map(s => (
                <Pressable key={s} onPress={() => addSkill(s)}
                  style={[styles.suggChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <Feather name="plus" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.suggTxt, { color: colors.mutedForeground }]}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {skills.length > 0 && (
            <View style={[styles.chipRow, { marginTop: 10, flexWrap: "wrap" }]}>
              {skills.map(s => (
                <Pressable key={s} onPress={() => removeSkill(s)}
                  style={[styles.chip, { backgroundColor: "#7B2FBE20", borderColor: "#7B2FBE50" }]}>
                  <Text style={[styles.chipTxt, { color: "#7B2FBE" }]}>{s}</Text>
                  <Feather name="x" size={11} color="#7B2FBE" />
                </Pressable>
              ))}
            </View>
          )}
        </Section>

        {/* Expected Salary */}
        <Section label="Expected Salary (₹/month)" colors={colors}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={[styles.inputWrap, { flex: 1, backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                value={minSalary}
                onChangeText={setMinSalary}
                placeholder="Min e.g. 25000"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                style={[styles.inputField, { color: colors.foreground, flex: 1 }]}
              />
            </View>
            <View style={[styles.inputWrap, { flex: 1, backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                value={maxSalary}
                onChangeText={setMaxSalary}
                placeholder="Max e.g. 50000"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                style={[styles.inputField, { color: colors.foreground, flex: 1 }]}
              />
            </View>
          </View>
        </Section>

        {/* Location + Remote */}
        <Section label="Preferred Location" colors={colors}>
          <Input
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Mumbai, Delhi, Bangalore"
            colors={colors}
          />
          <Pressable onPress={() => setRemote(r => !r)}
            style={[styles.toggleRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="wifi" size={16} color={remote ? "#7B2FBE" : colors.mutedForeground} />
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Open to Remote / Work-from-home</Text>
            <View style={[styles.toggleThumb, { backgroundColor: remote ? "#7B2FBE" : colors.border }]}>
              <View style={[styles.toggleDot, { alignSelf: remote ? "flex-end" : "flex-start" }]} />
            </View>
          </Pressable>
        </Section>

        {/* Job Type */}
        <Section label="Job Type" colors={colors}>
          <View style={styles.chipRow}>
            {JOB_TYPES.map(({ key, label, icon }) => (
              <Pressable key={key} onPress={() => toggleJobType(key)}
                style={[styles.chip, {
                  backgroundColor: jobTypes.includes(key) ? "#E91E8C" : colors.muted,
                  borderColor:     jobTypes.includes(key) ? "#E91E8C" : colors.border,
                }]}>
                <Feather name={icon as any} size={12} color={jobTypes.includes(key) ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.chipTxt, { color: jobTypes.includes(key) ? "#fff" : colors.foreground }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {/* Availability */}
        <Section label="Notice Period / Availability" colors={colors}>
          <View style={styles.chipRow}>
            {AVAILABILITIES.map(({ key, label }) => (
              <Pressable key={key} onPress={() => setAvailability(key)}
                style={[styles.chip, {
                  backgroundColor: availability === key ? "#FFB800" : colors.muted,
                  borderColor:     availability === key ? "#FFB800" : colors.border,
                }]}>
                <Text style={[styles.chipTxt, { color: availability === key ? "#000" : colors.foreground }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {/* About */}
        <Section label="About Me" colors={colors}>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border, alignItems: "flex-start", minHeight: 90 }]}>
            <TextInput
              value={about}
              onChangeText={setAbout}
              placeholder="A short summary about yourself, your goals, and what makes you stand out…"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              style={[styles.inputField, { color: colors.foreground, flex: 1, paddingTop: 4, textAlignVertical: "top" }]}
            />
          </View>
        </Section>

        {/* Links */}
        <Section label="Links (optional)" colors={colors}>
          <View style={{ gap: 10 }}>
            {[
              { icon: "linkedin", placeholder: "LinkedIn profile URL", value: linkedin, onChange: setLinkedin },
              { icon: "globe",    placeholder: "Portfolio / GitHub URL", value: portfolio, onChange: setPortfolio },
            ].map(({ icon, placeholder, value, onChange }) => (
              <View key={icon} style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name={icon as any} size={16} color={colors.mutedForeground} />
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder={placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                  keyboardType="url"
                  style={[styles.inputField, { color: colors.foreground, flex: 1 }]}
                />
              </View>
            ))}
          </View>
        </Section>

        {/* Privacy note */}
        <View style={[styles.privacyNote, { backgroundColor: "#7B2FBE12", borderColor: "#7B2FBE30" }]}>
          <Feather name="shield" size={16} color="#7B2FBE" />
          <Text style={[styles.privacyTxt, { color: colors.mutedForeground }]}>
            Your resume is only shown to verified employers on Ridhi Jobs. Your phone number is never shared directly.
          </Text>
        </View>

      </ScrollView>

      {/* Save button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable onPress={handleSave} style={{ flex: 1 }}>
          <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
            <Feather name="save" size={18} color="#fff" />
            <Text style={styles.saveTxt}>Save Resume</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function Section({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>{label}</Text>
      {children}
    </View>
  );
}

function Input({ value, onChangeText, placeholder, colors }: {
  value: string; onChangeText: (t: string) => void; placeholder: string; colors: any;
}) {
  return (
    <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.inputField, { color: colors.foreground, flex: 1 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1 },
  header:      { flexDirection: "row", alignItems: "center", paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, gap: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 19, fontFamily: "Inter_700Bold" },
  headerSub:   { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  savedBadge:  { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#34C75920", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  savedTxt:    { color: "#34C759", fontSize: 12, fontFamily: "Inter_600SemiBold" },

  uploadCard:  { borderRadius: 18, borderWidth: 2, padding: 24, alignItems: "center", gap: 8 },
  uploadIcon:  { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  uploadTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  uploadSub:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  uploadBtn:   { borderRadius: 10, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 8, marginTop: 4 },

  divider:     { flexDirection: "row", alignItems: "center", gap: 10 },
  divLine:     { flex: 1, height: StyleSheet.hairlineWidth },
  divTxt:      { fontSize: 12, fontFamily: "Inter_500Medium" },

  inputWrap:   { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  inputField:  { fontSize: 14, fontFamily: "Inter_400Regular" },

  chipRow:     { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:        { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  chipTxt:     { fontSize: 12, fontFamily: "Inter_500Medium" },
  suggChip:    { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  suggTxt:     { fontSize: 11, fontFamily: "Inter_400Regular" },

  toggleRow:   { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 },
  toggleLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  toggleThumb: { width: 36, height: 20, borderRadius: 10, padding: 2, justifyContent: "center" },
  toggleDot:   { width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff" },

  privacyNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  privacyTxt:  { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  footer:      { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  saveBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, paddingVertical: 16 },
  saveTxt:     { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
