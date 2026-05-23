import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";
import { useApp, LANGUAGES } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";

function SettingRow({
  icon,
  label,
  subtitle,
  value,
  onToggle,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.destructive + "18" : colors.muted }]}>
        <Feather name={icon as any} size={18} color={danger ? colors.destructive : colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: danger ? colors.destructive : colors.foreground }]}>{label}</Text>
        {subtitle && <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      {onToggle !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ) : (
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>{title.toUpperCase()}</Text>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const {
    theme, setTheme, language,
    notificationsEnabled, setNotificationsEnabled,
    pushEnabled, setPushEnabled,
    matchNotifEnabled, setMatchNotifEnabled,
    coinNotifEnabled, setCoinNotifEnabled,
    profilePublic, setProfilePublic,
    showOnline, setShowOnline,
    locationShared, setLocationShared,
    twoFAEnabled, setTwoFAEnabled,
  } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [showLangPicker, setShowLangPicker] = useState(false);
  const { setLanguage } = useApp();

  const THEME_OPTIONS = [
    { id: "light", label: "Light", icon: "sun" },
    { id: "dark", label: "Dark", icon: "moon" },
    { id: "system", label: "System", icon: "smartphone" },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 10,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 32 }}>
        {user && (
          <Pressable
            onPress={() => Alert.alert("Edit Profile", "Update your name, photo, bio, and interests.", [{ text: "Cancel", style: "cancel" }, { text: "Edit Profile", onPress: () => router.push("/(tabs)/profile" as any) }])}
            style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Avatar name={user.name} uri={user.avatar} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>{user.nickname || user.name}</Text>
              <Text style={[styles.profileSub, { color: colors.mutedForeground }]}>
                {user.phone || user.email || user.city}
              </Text>
            </View>
            <Feather name="edit-2" size={18} color={colors.primary} />
          </Pressable>
        )}

        <SectionHeader title="Appearance" />
        <View style={[styles.themeRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => setTheme(opt.id)}
              style={[
                styles.themeBtn,
                theme === opt.id && { backgroundColor: colors.primary },
              ]}
            >
              <Feather
                name={opt.icon as any}
                size={16}
                color={theme === opt.id ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.themeText,
                  { color: theme === opt.id ? "#fff" : colors.mutedForeground },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <SectionHeader title="Language" />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingRow
            icon="globe"
            label="App Language"
            subtitle={language.nativeName + " (" + language.name + ")"}
            onPress={() => setShowLangPicker(!showLangPicker)}
          />
        </View>

        {showLangPicker && (
          <View style={[styles.langPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                style={[
                  styles.langOption,
                  { borderBottomColor: colors.border },
                  lang.code === language.code && { backgroundColor: colors.primary + "15" },
                ]}
                onPress={() => { setLanguage(lang); setShowLangPicker(false); }}
              >
                <Text style={[styles.langNative, { color: colors.foreground }]}>{lang.nativeName}</Text>
                <Text style={[styles.langName, { color: colors.mutedForeground }]}>{lang.name}</Text>
                {lang.code === language.code && (
                  <Feather name="check" size={16} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        )}

        <SectionHeader title="Notifications" />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingRow icon="bell" label="Notifications" value={notificationsEnabled} onToggle={setNotificationsEnabled} />
          <SettingRow icon="send" label="Push Notifications" value={pushEnabled} onToggle={setPushEnabled} />
          <SettingRow icon="heart" label="Match Alerts" value={matchNotifEnabled} onToggle={setMatchNotifEnabled} />
          <SettingRow icon="star" label="Coin Alerts" value={coinNotifEnabled} onToggle={setCoinNotifEnabled} />
        </View>

        <SectionHeader title="Privacy" />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingRow icon="eye" label="Public Profile" subtitle="Anyone can view your profile" value={profilePublic} onToggle={setProfilePublic} />
          <SettingRow icon="activity" label="Show Online Status" value={showOnline} onToggle={setShowOnline} />
          <SettingRow icon="map-pin" label="Share Location (City)" value={locationShared} onToggle={setLocationShared} />
          <SettingRow icon="slash" label="Blocked Users" subtitle="Manage blocked accounts" onPress={() => Alert.alert("Blocked Users", "You have no blocked users.\n\nTo block someone, visit their profile and tap ⋮ → Block.", [{ text: "OK" }])} />
          <SettingRow icon="flag" label="Reported Accounts" onPress={() => Alert.alert("Reported Accounts", "You haven't reported any accounts yet.\n\nUse the report button on any post or profile to flag inappropriate content.", [{ text: "OK" }])} />
        </View>

        <SectionHeader title="Security" />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingRow icon="shield" label="Two-Factor Authentication" value={twoFAEnabled} onToggle={setTwoFAEnabled} />
          <SettingRow icon="smartphone" label="Active Sessions" subtitle="Manage logged-in devices" onPress={() => Alert.alert("Active Sessions", "📱 This device — Active now\n   Android · Mumbai · Just now\n\nNo other sessions detected.\nSign out here if you don't recognize a device.", [{ text: "OK" }])} />
          <SettingRow icon="lock" label="Change Password" onPress={() => Alert.alert("Change Password", "A reset link will be sent to your registered phone or email.", [{ text: "Cancel", style: "cancel" }, { text: "Send Reset Link", onPress: () => Alert.alert("Link Sent ✓", "Check your registered phone or email for the reset link.", [{ text: "OK" }]) }])} />
          <SettingRow icon="key" label="Biometric Login" onPress={() => Alert.alert("Biometric Login", "Use Face ID or Fingerprint for faster, secure login.", [{ text: "Cancel", style: "cancel" }, { text: "Enable", onPress: () => Alert.alert("Enabled ✓", "Biometric login is now active on this device.", [{ text: "OK" }]) }])} />
        </View>

        <SectionHeader title="Business" />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingRow icon="volume-2" label="Ads Manager" subtitle="Create & manage ad campaigns" onPress={() => router.push("/ads-manager" as any)} />
          <SettingRow icon="briefcase" label="Brand Register" subtitle="Register your business on Ridhi" onPress={() => router.push("/brand-register" as any)} />
        </View>

        <SectionHeader title="Account" />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingRow icon="credit-card" label="Subscription" subtitle="Free plan" onPress={() => router.push("/subscription")} />
          <SettingRow icon="link" label="Linked Accounts" subtitle="Google, Facebook" onPress={() => Alert.alert("Linked Accounts", "Link your Google or Facebook account for one-tap login.\n\n• Google — Tap to connect\n• Facebook — Tap to connect", [{ text: "Connect Google", onPress: () => Alert.alert("Google Login", "Google sign-in will be available in the next update.", [{ text: "OK" }]) }, { text: "Close", style: "cancel" }])} />
          <SettingRow icon="download" label="Download My Data" onPress={() => Alert.alert("Download My Data", "Your full data export includes posts, chats, matches, and settings.", [{ text: "Cancel", style: "cancel" }, { text: "Request Export", onPress: () => Alert.alert("Export Requested ✓", "You'll receive a download link within 24 hours.", [{ text: "OK" }]) }])} />
        </View>

        <SectionHeader title="Support" />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingRow icon="help-circle" label="Help & Support" onPress={() => router.push("/help-support" as any)} />
          <SettingRow icon="info" label="About Ridhi" subtitle="Version 1.0.0" onPress={() => router.push("/about" as any)} />
          <SettingRow icon="file-text" label="Terms & Conditions" onPress={() => router.push("/terms" as any)} />
          <SettingRow icon="shield" label="Privacy Policy" onPress={() => router.push("/privacy-policy" as any)} />
        </View>

        <View style={styles.logoutWrap}>
          <Pressable
            onPress={logout}
            style={[styles.logoutBtn, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "40" }]}
          >
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "This will permanently delete your account, posts, matches, and all data. This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete Account",
                    style: "destructive",
                    onPress: () =>
                      Alert.alert(
                        "Are you absolutely sure?",
                        "Type your phone number or email to confirm deletion.",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Yes, Delete Everything", style: "destructive", onPress: logout },
                        ]
                      ),
                  },
                ]
              )
            }
            style={styles.deleteBtn}
          >
            <Text style={[styles.deleteText, { color: colors.mutedForeground }]}>Delete Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", flex: 1, textAlign: "center" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
  },
  profileName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  profileSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionHeader: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  section: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  themeRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  themeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  themeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "transparent",
  },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  langPicker: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 4,
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  langNative: { fontSize: 16, fontFamily: "Inter_600SemiBold", flex: 1 },
  langName: { fontSize: 13, fontFamily: "Inter_400Regular" },
  logoutWrap: { paddingHorizontal: 20, paddingTop: 24, gap: 12, alignItems: "center" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  deleteBtn: { paddingVertical: 8 },
  deleteText: { fontSize: 13, fontFamily: "Inter_400Regular", textDecorationLine: "underline" },
});
