import React, { useState, useCallback } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { ReportSheet } from "./ReportSheet";
import { useAuth } from "@/contexts/AuthContext";

export interface ReelOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  reel: {
    id: string;
    caption: string;
    userName: string;
    userCity: string;
    videoUrl?: string;
  };
  onHide?: () => void;
  onNotInterested?: () => void;
}

interface MenuOption {
  id: string;
  icon: string;
  label: string;
  subtitle?: string;
  type: "action" | "toggle" | "section" | "destructive";
  value?: boolean;
  onToggle?: (v: boolean) => void;
}

export function ReelOptionsMenu({
  visible,
  onClose,
  reel,
  onHide,
  onNotInterested,
}: ReelOptionsMenuProps) {
  const colors = useColors();
  const { user } = useAuth();
  const [showReport, setShowReport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [clearMode, setClearMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);

  const url = `https://ridhi.app/reel/${reel.id}`;

  const handleCopyLink = useCallback(async () => {
    await Clipboard.setStringAsync(url);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const handleSave = useCallback(() => {
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 2000);
    // TODO: Real download when videoUrl is available
    if (Platform.OS !== "web") {
      Alert.alert("Saved", "Reel saved to your collection.");
    }
  }, []);

  const handleHide = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    onHide?.();
    Alert.alert("Reel Hidden", "This reel will be hidden from your feed.");
  }, [onClose, onHide]);

  const handleNotInterested = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    onNotInterested?.();
    Alert.alert(
      "Not Interested",
      "You'll see less content like this in the future."
    );
  }, [onClose, onNotInterested]);

  const handleWhySee = useCallback(() => {
    Alert.alert(
      "Why you're seeing this",
      "This reel is shown because:\n\n\u2022 It's trending in your city\n\u2022 You follow similar creators\n\u2022 It matches your interests (food, travel, culture)"
    );
  }, []);

  const handleSomethingWrong = useCallback(() => {
    Alert.alert(
      "Report a Problem",
      "Please describe what went wrong:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send Feedback", onPress: () => {
          Alert.alert("Thanks", "Your feedback helps us improve.");
        }},
      ]
    );
  }, []);

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const mainOptions: MenuOption[] = [
    { id: "interested", icon: "plus-circle", label: "Interested", subtitle: "More of these reels", type: "action" },
    { id: "notInterested", icon: "minus-circle", label: "Not interested", subtitle: "Less of these reels", type: "action" },
  ];

  const playbackOptions: MenuOption[] = [
    { id: "speed", icon: "fast-forward", label: "Playback speed", subtitle: `${playbackSpeed}x`, type: "action" },
    { id: "quality", icon: "hard-drive", label: "Quality settings", subtitle: "Auto", type: "action" },
    { id: "captions", icon: "type", label: "Captions", subtitle: "Off", type: "action" },
    { id: "clearMode", icon: "maximize", label: "Clear mode", type: "toggle", value: clearMode },
    { id: "autoScroll", icon: "skip-forward", label: "Scroll to next reel automatically", type: "toggle", value: autoScroll },
  ];

  const actionOptions: MenuOption[] = [
    { id: "save", icon: "bookmark", label: "Save reel", subtitle: saved ? "Saved to collection" : "Add to your saved reels", type: "action" },
    { id: "copyLink", icon: "link", label: copied ? "Link copied" : "Copy link", subtitle: "Share this reel", type: "action" },
    { id: "report", icon: "flag", label: "Find support or report reel", subtitle: "I'm concerned about this reel", type: "destructive" },
    { id: "whySee", icon: "help-circle", label: "Why am I seeing this?", type: "action" },
    { id: "hide", icon: "eye-off", label: "Hide reel", subtitle: "I don't want to see this", type: "destructive" },
    { id: "somethingWrong", icon: "alert-triangle", label: "Something went wrong", type: "action" },
  ];

  const handleOption = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (id) {
      case "interested":
        Alert.alert("Got it", "You'll see more reels like this one!");
        break;
      case "notInterested":
        handleNotInterested();
        return;
      case "speed":
        setShowSpeedPicker(true);
        return;
      case "quality":
        Alert.alert("Quality Settings", "Available options:\n\n\u2022 Auto (recommended)\n\u2022 High (720p)\n\u2022 Medium (480p)\n\u2022 Data Saver (240p)");
        break;
      case "captions":
        Alert.alert("Captions", "Auto-generated captions are available in 13 Indian languages.");
        break;
      case "clearMode":
        setClearMode((s) => !s);
        return;
      case "autoScroll":
        setAutoScroll((s) => !s);
        return;
      case "save":
        handleSave();
        return;
      case "copyLink":
        handleCopyLink();
        return;
      case "report":
        setShowReport(true);
        return;
      case "whySee":
        handleWhySee();
        break;
      case "hide":
        handleHide();
        return;
      case "somethingWrong":
        handleSomethingWrong();
        break;
    }
  };

  const renderOption = (opt: MenuOption) => {
    const isDestructive = opt.type === "destructive";
    const isActive = opt.id === "save" && saved || opt.id === "copyLink" && copied;
    const labelColor = isDestructive ? "#F43F5E" : isActive ? "#34C759" : colors.foreground;
    const iconColor = isDestructive ? "#F43F5E" : isActive ? "#34C759" : colors.foreground;

    return (
      <Pressable
        key={opt.id}
        style={styles.menuRow}
        onPress={() => opt.type === "toggle" ? undefined : handleOption(opt.id)}
      >
        <Feather name={opt.icon as any} size={20} color={iconColor} style={styles.menuIcon} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.menuLabel, { color: labelColor }]}>
            {opt.label}
          </Text>
          {opt.subtitle && (
            <Text style={[styles.menuSubtitle, { color: colors.mutedForeground }]}>
              {opt.subtitle}
            </Text>
          )}
        </View>
        {opt.type === "toggle" && (
          <Switch
            value={opt.value}
            onValueChange={(v) => {
              if (opt.id === "clearMode") setClearMode(v);
              if (opt.id === "autoScroll") setAutoScroll(v);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            trackColor={{ false: "#3A3A3C", true: "#E91E8C" }}
            thumbColor={opt.value ? "#fff" : "#888"}
          />
        )}
        {opt.type === "action" && (opt.id === "speed" || opt.id === "quality") && (
          <Text style={[styles.menuSubtitle, { color: colors.mutedForeground }]}>
            {opt.id === "speed" ? `${playbackSpeed}x` : "Auto"}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: "#1C1C1E" }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>More Options</Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Preference section */}
            <View style={[styles.section, { borderColor: "#2C2C2E" }]}>
              {mainOptions.map(renderOption)}
            </View>

            {/* Playback section */}
            <View style={[styles.section, { borderColor: "#2C2C2E" }]}>
              {playbackOptions.map(renderOption)}
            </View>

            {/* Actions section */}
            <View style={[styles.section, { borderColor: "#2C2C2E" }]}>
              {actionOptions.map(renderOption)}
            </View>
          </ScrollView>

          {/* Speed picker overlay */}
          {showSpeedPicker && (
            <View style={[styles.speedPicker, { backgroundColor: "#1C1C1E" }]}>
              <Text style={[styles.sheetTitle, { marginBottom: 12 }]}>Playback Speed</Text>
              {speedOptions.map((speed) => (
                <Pressable
                  key={speed}
                  style={styles.speedRow}
                  onPress={() => {
                    setPlaybackSpeed(speed);
                    setShowSpeedPicker(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.speedLabel,
                      { color: playbackSpeed === speed ? "#E91E8C" : "#fff" },
                    ]}
                  >
                    {speed === 1.0 ? "Normal" : `${speed}x`}
                  </Text>
                  {playbackSpeed === speed && (
                    <Feather name="check" size={18} color="#E91E8C" />
                  )}
                </Pressable>
              ))}
              <Pressable
                style={[styles.speedClose, { marginTop: 8 }]}
                onPress={() => setShowSpeedPicker(false)}
              >
                <Text style={{ color: "#8E8E93", fontSize: 14 }}>Close</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>

      <ReportSheet
        visible={showReport}
        onClose={() => setShowReport(false)}
        targetId={reel.id}
        targetType="reel"
        targetTitle={reel.caption}
        targetUser={reel.userName}
        reporterId={user?.id ?? "anonymous"}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3A3A3C",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  section: {
    borderTopWidth: 1,
    marginTop: 8,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuIcon: {
    width: 24,
    textAlign: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 20,
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  speedPicker: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  speedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  speedLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  speedClose: {
    alignItems: "center",
    paddingVertical: 12,
  },
});
