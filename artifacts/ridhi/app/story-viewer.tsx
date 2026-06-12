import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { Avatar } from "@/components/Avatar";
import { PrivateHead } from "@/components/PrivateHead";
import { ShareWithWatermark } from "@/components/ShareWithWatermark";

const { width, height } = Dimensions.get("window");

const STORIES = [
  {
    id: "s1", user: "Ananya Singh", city: "Delhi", timeAgo: "2h",
    bgColors: ["#E91E8C", "#7B2FBE"] as [string, string],
    text: "Amazing evening at India Gate! ✨",
    reactions: ["❤️", "🔥", "😍", "🥰", "👏", "💯"],
  },
  {
    id: "s2", user: "Rahul Mehta", city: "Mumbai", timeAgo: "4h",
    bgColors: ["#FF6B35", "#E91E8C"] as [string, string],
    text: "Marine Drive vibes forever 🌊",
    reactions: ["😮", "❤️", "👏", "😍", "🤩", "🙏"],
  },
  {
    id: "s3", user: "Kavya Reddy", city: "Hyderabad", timeAgo: "6h",
    bgColors: ["#7B2FBE", "#4A90E2"] as [string, string],
    text: "Biryani day! 🍛 Nothing beats Hyderabadi Biryani",
    reactions: ["😍", "🔥", "❤️", "😋", "💯", "🤤"],
  },
  {
    id: "s4", user: "Arjun Kumar", city: "Bangalore", timeAgo: "1h",
    bgColors: ["#34C759", "#4A90E2"] as [string, string],
    text: "Cubbon Park morning run 🏃‍♂️",
    reactions: ["💪", "❤️", "🔥", "🏃", "✨", "👑"],
  },
];

const STORY_DURATION = 5000;

export default function StoryViewerScreen() {
  useTrackScreen("story_viewer");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [showShare, setShowShare] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const story = STORIES[currentIndex];

  const startProgress = () => {
    progress.setValue(0);
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) nextStory();
    });
  };

  const pauseProgress = () => animRef.current?.stop();

  useEffect(() => {
    if (!paused) startProgress();
    else pauseProgress();
    return () => animRef.current?.stop();
  }, [currentIndex, paused]);

  const nextStory = () => {
    if (currentIndex < STORIES.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      router.back();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  return (
    <>
      <PrivateHead />
    <View style={styles.container}>
      <LinearGradient colors={story.bgColors} style={styles.story}>
        <View style={[styles.topBar, { paddingTop: topPad + 4 }]}>
          <View style={styles.progressBars}>
            {STORIES.map((_, i) => (
              <View key={i} style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                {i < currentIndex && (
                  <View style={[styles.progressFill, { width: "100%" }]} />
                )}
                {i === currentIndex && (
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          <View style={styles.storyHeader}>
            <Avatar name={story.user} size={38} hasStory />
            <View style={{ flex: 1 }}>
              <Text style={styles.storyUser}>{story.user}</Text>
              <Text style={styles.storyMeta}>{story.city} · {story.timeAgo}</Text>
            </View>
            <Pressable onPress={() => router.back()} style={styles.closeBtn}>
              <Feather name="x" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.tapZones}
          onPress={(e) => {
            const x = e.nativeEvent.locationX;
            if (x < width / 3) prevStory();
            else nextStory();
          }}
          onLongPress={() => setPaused(true)}
          onPressOut={() => setPaused(false)}
        >
          <View style={styles.tapLeft} />
          <View style={styles.tapRight} />
        </Pressable>

        <View style={styles.storyContent}>
          <Text style={styles.storyText}>{story.text}</Text>
        </View>

        <View style={styles.reactionsRow}>
          {story.reactions.map((r, i) => (
            <Pressable key={i} style={styles.reactionBtn}>
              <Text style={styles.reactionEmoji}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.replyBar}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Reply to ${story.user.split(" ")[0]}...`}
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={reply}
            onChangeText={setReply}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          />
          {reply.length > 0 ? (
            <Pressable style={styles.sendReplyBtn}>
              <Feather name="send" size={18} color="#fff" />
            </Pressable>
          ) : (
            <View style={styles.replyActions}>
              <Pressable style={styles.replyActionBtn}>
                <Feather name="heart" size={22} color="rgba(255,255,255,0.9)" />
              </Pressable>
              <Pressable style={styles.replyActionBtn} onPress={() => setShowShare(true)}>
                <Feather name="share" size={22} color="rgba(255,255,255,0.9)" />
              </Pressable>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>

    <ShareWithWatermark
      visible={showShare}
      onClose={() => setShowShare(false)}
      data={{
        title: story.text,
        message: `${story.text} by ${story.user} from ${story.city} 🎨`,
        url: `https://ridhi.app/story/${story.id}`,
      }}
      type="story"
    />
  </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  story: { flex: 1 },
  topBar: { paddingHorizontal: 12, gap: 8 },
  progressBars: { flexDirection: "row", gap: 4 },
  progressTrack: { flex: 1, height: 2.5, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 2 },
  storyHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  storyUser: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  storyMeta: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_400Regular" },
  closeBtn: { padding: 4 },
  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: "row", top: 80 },
  tapLeft: { flex: 1 },
  tapRight: { flex: 2 },
  storyContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  storyText: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center", lineHeight: 32, textShadowColor: "rgba(0,0,0,0.4)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 },
  reactionsRow: { flexDirection: "row", justifyContent: "center", gap: 16, paddingBottom: 8 },
  reactionBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  reactionEmoji: { fontSize: 24 },
  replyBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: Platform.OS === "ios" ? 32 : 16, paddingTop: 8 },
  replyInput: { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, color: "#fff", fontSize: 14, fontFamily: "Inter_400Regular", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  sendReplyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  replyActions: { flexDirection: "row", gap: 4 },
  replyActionBtn: { padding: 8 },
});
