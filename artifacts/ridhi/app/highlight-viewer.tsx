import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTrackScreen } from "@/hooks/useAnalytics";
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

const ALL_STORIES = [
  {
    id: "s1", userId: "u1", user: "Ananya Singh", city: "Delhi", timeAgo: "2h",
    bgColors: ["#E91E8C", "#7B2FBE"] as [string, string],
    text: "Amazing evening at India Gate! ✨",
    reactions: ["❤️", "🔥", "😍", "🥰", "👏", "💯"],
  },
  {
    id: "s2", userId: "u2", user: "Rahul Mehta", city: "Mumbai", timeAgo: "4h",
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

export default function HighlightViewerScreen() {
  const { highlightId } = useLocalSearchParams<{ highlightId: string }>();
  useTrackScreen("story_viewer");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const highlight = user?.storyHighlights?.find(h => h.id === highlightId);
  const stories = ALL_STORIES.filter(s => highlight?.storyIds.includes(s.id));

  const [currentIndex, setCurrentIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const story = stories[currentIndex];

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

  useEffect(() => {
    if (stories.length > 0) {
      startProgress();
    }
    return () => animRef.current?.stop();
  }, [currentIndex]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
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

  if (!highlight || stories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.foreground }}>Highlight not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <PrivateHead />
      <View style={styles.container}>
        <LinearGradient colors={story.bgColors} style={styles.story}>
          <View style={[styles.topBar, { paddingTop: topPad + 4 }]}>
            <View style={styles.progressBars}>
              {stories.map((_, i) => (
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
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTitle}>{highlight.title}</Text>
                <Text style={styles.storyMeta}>{story.user} · {story.city}</Text>
              </View>
              <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                <Feather name="x" size={24} color="#fff" />
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
          >
            <View style={styles.tapLeft} />
            <View style={styles.tapRight} />
          </Pressable>

          <View style={styles.storyContent}>
            <Text style={styles.storyText}>{story.text}</Text>
          </View>
        </LinearGradient>
      </View>
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
  storyHeader: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  highlightTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  storyMeta: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_400Regular" },
  closeBtn: { padding: 8 },
  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: "row", top: 100 },
  tapLeft: { flex: 1 },
  tapRight: { flex: 2 },
  storyContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  storyText: { 
    color: "#fff", 
    fontSize: 24, 
    fontFamily: "Inter_700Bold", 
    textAlign: "center", 
    lineHeight: 34, 
    textShadowColor: "rgba(0,0,0,0.4)", 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 8 
  },
});
