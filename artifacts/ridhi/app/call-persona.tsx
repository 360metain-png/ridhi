import React, { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth, CallPersona } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { GradientButton } from "@/components/GradientButton";

const DEFAULT_PERSONA: CallPersona = {
  name: "",
  city: "",
  age: 22,
  bio: "",
  avatar: undefined,
  showAvatar: false,
  showCity: false,
  showAge: false,
  showBio: false,
};

const SUGGESTED_NAMES_FEMALE = ["Sakshi", "Anjali", "Riya", "Kiran", "Maya", "Divya", "Tanya", "Nisha"];
const SUGGESTED_NAMES_MALE = ["Rahul", "Arjun", "Dev", "Karan", "Rohan", "Amit", "Vijay", "Ravi"];
const SUGGESTED_CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow", "Indore"];

export default function CallPersonaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const saved = user?.callPersona;
  const [persona, setPersona] = useState<CallPersona>({ ...DEFAULT_PERSONA, ...saved });
  const [editing, setEditing] = useState(!saved?.name);

  const suggestedNames = user?.gender === "male" ? SUGGESTED_NAMES_MALE : SUGGESTED_NAMES_FEMALE;

  useEffect(() => {
    if (saved) setPersona({ ...DEFAULT_PERSONA, ...saved });
  }, [saved?.name]);

  const toggle = (key: keyof CallPersona) => {
    setPersona((p) => ({ ...p, [key]: !p[key] }));
  };

  const save = async () => {
    await updateProfile({ callPersona: persona });
    setEditing(false);
    Alert.alert("Saved", "Your random call persona is updated.");
  };

  const reset = () => {
    Alert.alert(
      "Reset Persona?",
      "This will clear your custom random call identity and revert to default anonymity.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await updateProfile({ callPersona: undefined });
            setPersona({ ...DEFAULT_PERSONA });
            setEditing(true);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <View style={{ paddingTop: topPad + 8, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>Random Call Persona</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}>
        {/* Header banner */}
        <View style={[styles.banner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
          <Feather name="shield" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.bannerTitle, { color: colors.foreground }]}>
              Control Your Random Call Identity
            </Text>
            <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>
              Choose what others see during random calls. Your real profile stays hidden.
            </Text>
          </View>
        </View>

        {/* Preview card */}
        <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>PREVIEW</Text>
          <View style={styles.previewRow}>
            <Avatar name={persona.name || "Anonymous"} size={56} />
            <View style={{ flex: 1, marginLeft: 14, gap: 2 }}>
              <Text style={[styles.previewName, { color: colors.foreground }]}>
                {persona.name || "Anonymous"}
              </Text>
              {persona.showCity && persona.city && (
                <Text style={[styles.previewMeta, { color: colors.mutedForeground }]}>{persona.city}</Text>
              )}
              {persona.showAge && persona.age && (
                <Text style={[styles.previewMeta, { color: colors.mutedForeground }]}>{persona.age} years</Text>
              )}
              {persona.showBio && persona.bio && (
                <Text style={[styles.previewMeta, { color: colors.mutedForeground }]} numberOfLines={1}>{persona.bio}</Text>
              )}
              {!persona.showCity && !persona.showAge && !persona.showBio && (
                <Text style={[styles.previewMeta, { color: colors.mutedForeground }]}>
                  Only gender & language shown
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Edit / View toggle */}
        <View style={styles.editBar}>
          <Pressable
            onPress={() => setEditing(!editing)}
            style={[styles.editBtn, { backgroundColor: colors.muted }]}>
            <Feather name={editing ? "eye" : "edit-2"} size={16} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>
              {editing ? "Preview" : "Edit"}
            </Text>
          </Pressable>
          <Pressable
            onPress={reset}
            style={[styles.editBtn, { backgroundColor: colors.destructive + "15" }]}>
            <Feather name="trash-2" size={16} color={colors.destructive} />
            <Text style={[styles.editBtnText, { color: colors.destructive }]}>Reset</Text>
          </Pressable>
        </View>

        {/* Name input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Display Name</Text>
          {editing ? (
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              value={persona.name}
              onChangeText={(t) => setPersona((p) => ({ ...p, name: t }))}
              placeholder="Enter fake name..."
              placeholderTextColor={colors.mutedForeground}
              maxLength={20}
            />
          ) : (
            <Text style={[styles.readOnly, { color: colors.foreground }]}>{persona.name || "Not set"}</Text>
          )}
          {editing && (
            <View style={styles.chipsWrap}>
              {suggestedNames.map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setPersona((p) => ({ ...p, name: n }))}
                  style={[styles.chip, { backgroundColor: persona.name === n ? colors.primary + "25" : colors.muted }]}>
                  <Text style={[styles.chipText, { color: persona.name === n ? colors.primary : colors.foreground }]}>{n}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* City toggle + input */}
        <View style={[styles.section, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>City</Text>
            {editing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={persona.city}
                onChangeText={(t) => setPersona((p) => ({ ...p, city: t }))}
                placeholder="Enter city..."
                placeholderTextColor={colors.mutedForeground}
                maxLength={20}
              />
            ) : (
              <Text style={[styles.readOnly, { color: colors.foreground }]}>{persona.city || "Not set"}</Text>
            )}
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.toggleLabel, { color: colors.mutedForeground }]}>Show</Text>
            <Switch
              value={persona.showCity}
              onValueChange={() => toggle("showCity")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={"#fff"}
            />
          </View>
        </View>
        {editing && (
          <View style={[styles.chipsWrap, { marginTop: 4 }]}>
            {SUGGESTED_CITIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setPersona((p) => ({ ...p, city: c }))}
                style={[styles.chip, { backgroundColor: persona.city === c ? colors.primary + "25" : colors.muted }]}>
                <Text style={[styles.chipText, { color: persona.city === c ? colors.primary : colors.foreground }]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Age toggle + input */}
        <View style={[styles.section, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Age</Text>
            {editing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
                value={persona.age?.toString() ?? ""}
                onChangeText={(t) => setPersona((p) => ({ ...p, age: t ? parseInt(t, 10) || 0 : undefined }))}
                placeholder="Enter age..."
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                maxLength={2}
              />
            ) : (
              <Text style={[styles.readOnly, { color: colors.foreground }]}>{persona.age ? `${persona.age} years` : "Not set"}</Text>
            )}
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.toggleLabel, { color: colors.mutedForeground }]}>Show</Text>
            <Switch
              value={persona.showAge}
              onValueChange={() => toggle("showAge")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

        {/* Bio toggle + input */}
        <View style={[styles.section, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Bio</Text>
            {editing ? (
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border, height: 64, textAlignVertical: "top" }]}
                value={persona.bio}
                onChangeText={(t) => setPersona((p) => ({ ...p, bio: t }))}
                placeholder="Short bio for calls..."
                placeholderTextColor={colors.mutedForeground}
                maxLength={80}
                multiline
              />
            ) : (
              <Text style={[styles.readOnly, { color: colors.foreground }]}>{persona.bio || "Not set"}</Text>
            )}
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.toggleLabel, { color: colors.mutedForeground }]}>Show</Text>
            <Switch
              value={persona.showBio}
              onValueChange={() => toggle("showBio")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

        {/* Avatar toggle */}
        <View style={[styles.section, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Avatar</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
              {persona.showAvatar ? "Your real avatar will show" : "Letter avatar will show"}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.toggleLabel, { color: colors.mutedForeground }]}>Show</Text>
            <Switch
              value={persona.showAvatar}
              onValueChange={() => toggle("showAvatar")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={"#fff"}
            />
          </View>
        </View>

        {/* Save button */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <GradientButton label="Save Persona" onPress={save} loading={false} />
        </View>

        {/* Safety note */}
        <View style={[styles.safety, { backgroundColor: colors.destructive + "10", borderColor: colors.destructive + "30" }]}>
          <Feather name="info" size={16} color={colors.destructive} />
          <Text style={[styles.safetyText, { color: colors.destructive }]}>
            Admin can see your real identity even when using a persona.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  banner: { flexDirection: "row", marginHorizontal: 20, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16, gap: 4 },
  bannerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  bannerSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  previewCard: { marginHorizontal: 20, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  previewLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 12 },
  previewRow: { flexDirection: "row", alignItems: "center" },
  previewName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  previewMeta: { fontSize: 13, fontFamily: "Inter_400Regular" },
  editBar: { flexDirection: "row", gap: 10, marginHorizontal: 20, marginBottom: 16 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  editBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  readOnly: { fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 12 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  toggleLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  safety: { flexDirection: "row", gap: 8, marginHorizontal: 20, marginTop: 20, padding: 12, borderRadius: 12, borderWidth: 1 },
  safetyText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
});
