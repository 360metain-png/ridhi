import React, { useState } from "react";
import {
  Dimensions,
  Platform,
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
import { Avatar } from "@/components/Avatar";
import { GradientButton } from "@/components/GradientButton";

const { width } = Dimensions.get("window");

const POST_TYPES = [
  { id: "text", icon: "type", label: "Status", desc: "Share what's on your mind" },
  { id: "photo", icon: "image", label: "Photo", desc: "Share a photo from your gallery" },
  { id: "video", icon: "video", label: "Video", desc: "Share a video up to 5 minutes" },
  { id: "reel", icon: "play", label: "Reel", desc: "Create a short vertical video" },
  { id: "story", icon: "circle", label: "Story", desc: "Visible for 24 hours" },
  { id: "poll", icon: "bar-chart-2", label: "Poll", desc: "Ask your followers a question" },
] as const;

const SUGGESTED_HASHTAGS = ["#DesiVibes", "#ChaiTime", "#MonsoonMagic", "#Bollywood", "#IndiaFirst", "#CricketIndia"];

export default function CreatePostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>("text");
  const [text, setText] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [audience, setAudience] = useState<"public" | "followers" | "private">("public");
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const toggleHashtag = (tag: string) => {
    setHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePost = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Post</Text>
        <GradientButton
          label="Post"
          onPress={handlePost}
          loading={loading}
          disabled={!text.trim() && hashtags.length === 0}
          small
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : 32 }}>
        <View style={styles.typeRow}>
          {POST_TYPES.map((type) => (
            <Pressable
              key={type.id}
              onPress={() => setSelectedType(type.id)}
              style={[
                styles.typeBtn,
                {
                  backgroundColor: selectedType === type.id ? colors.primary : colors.muted,
                  borderColor: selectedType === type.id ? colors.primary : colors.border,
                },
              ]}
            >
              <Feather
                name={type.icon as any}
                size={16}
                color={selectedType === type.id ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.typeLabel,
                  { color: selectedType === type.id ? "#fff" : colors.foreground },
                ]}
              >
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.composerRow}>
          <Avatar name={user?.name ?? "Me"} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.composerName, { color: colors.foreground }]}>{user?.name}</Text>
            <Pressable
              style={[styles.audienceBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              onPress={() =>
                setAudience((a) => a === "public" ? "followers" : a === "followers" ? "private" : "public")
              }
            >
              <Feather
                name={audience === "public" ? "globe" : audience === "followers" ? "users" : "lock"}
                size={12}
                color={colors.mutedForeground}
              />
              <Text style={[styles.audienceText, { color: colors.mutedForeground }]}>
                {audience === "public" ? "Public" : audience === "followers" ? "Followers" : "Only me"}
              </Text>
              <Feather name="chevron-down" size={12} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>

        <TextInput
          style={[styles.textInput, { color: colors.foreground }]}
          placeholder={
            selectedType === "text"
              ? "What's on your mind?"
              : selectedType === "poll"
              ? "Ask a question..."
              : "Write a caption..."
          }
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          autoFocus={selectedType === "text"}
        />

        {selectedType !== "text" && (
          <Pressable
            style={[styles.mediaUpload, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <LinearGradient
              colors={[colors.primary + "20", colors.secondary + "10"]}
              style={styles.mediaUploadInner}
            >
              <Feather name="upload-cloud" size={32} color={colors.primary} />
              <Text style={[styles.mediaUploadText, { color: colors.foreground }]}>
                Tap to add {selectedType}
              </Text>
              <Text style={[styles.mediaUploadSub, { color: colors.mutedForeground }]}>
                {selectedType === "reel" || selectedType === "story"
                  ? "Max 60 seconds"
                  : selectedType === "video"
                  ? "Max 5 minutes"
                  : "JPG, PNG up to 20MB"}
              </Text>
            </LinearGradient>
          </Pressable>
        )}

        {selectedType === "poll" && (
          <View style={styles.pollOptions}>
            {["Option 1", "Option 2"].map((opt) => (
              <View
                key={opt}
                style={[styles.pollOption, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <TextInput
                  style={[styles.pollInput, { color: colors.foreground }]}
                  placeholder={opt}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            ))}
          </View>
        )}

        <View style={styles.hashtagSection}>
          <Text style={[styles.hashtagTitle, { color: colors.mutedForeground }]}>Suggested Hashtags</Text>
          <View style={styles.hashtagRow}>
            {SUGGESTED_HASHTAGS.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => toggleHashtag(tag)}
                style={[
                  styles.hashtagPill,
                  hashtags.includes(tag)
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.muted, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.hashtagText,
                    { color: hashtags.includes(tag) ? "#fff" : colors.foreground },
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.toolbarRow, { borderTopColor: colors.border }]}>
          {[
            { icon: "image", label: "Photo" },
            { icon: "video", label: "Video" },
            { icon: "map-pin", label: "Location" },
            { icon: "tag", label: "Tag" },
            { icon: "smile", label: "Feeling" },
          ].map((tool) => (
            <Pressable key={tool.icon} style={styles.toolbarBtn}>
              <Feather name={tool.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.toolbarLabel, { color: colors.mutedForeground }]}>{tool.label}</Text>
            </Pressable>
          ))}
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
    gap: 12,
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", flex: 1 },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
  },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  composerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  audienceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  audienceText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  textInput: {
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
    minHeight: 120,
    textAlignVertical: "top",
  },
  mediaUpload: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    marginVertical: 12,
  },
  mediaUploadInner: {
    paddingVertical: 48,
    alignItems: "center",
    gap: 10,
  },
  mediaUploadText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  mediaUploadSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  pollOptions: { paddingHorizontal: 16, gap: 10, marginVertical: 8 },
  pollOption: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  pollInput: { padding: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  hashtagSection: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  hashtagTitle: { fontSize: 12, fontFamily: "Inter_500Medium" },
  hashtagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hashtagPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  hashtagText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  toolbarRow: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 20,
  },
  toolbarBtn: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 4 },
  toolbarLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
});
