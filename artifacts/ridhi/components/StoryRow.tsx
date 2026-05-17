import React, { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isSelf?: boolean;
  hasUnseen?: boolean;
}

interface StoryRowProps {
  stories: Story[];
  onAddStory: () => void;
  onStory: (storyId: string) => void;
  selfName: string;
  selfAvatar?: string;
}

function StoryItem({ story, onPress }: { story: Story; onPress: () => void }) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay: Math.random() * 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: Math.random() * 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <Pressable style={styles.storyItem} onPress={onPress}>
        <Avatar name={story.userName} uri={story.userAvatar} size={54} hasStory={story.hasUnseen} />
        <Text
          style={[
            styles.storyName,
            { color: story.hasUnseen ? colors.foreground : colors.mutedForeground },
          ]}
          numberOfLines={1}
        >
          {story.userName.split(" ")[0]}
        </Text>
        {story.hasUnseen && (
          <View style={[styles.unseenDot, { backgroundColor: colors.primary }]} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export function StoryRow({ stories, onAddStory, onStory, selfName, selfAvatar }: StoryRowProps) {
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={[styles.container, { borderBottomColor: colors.border }]}
      >
        <Pressable style={styles.storyItem} onPress={onAddStory}>
          <View style={styles.addStoryWrap}>
            <LinearGradient
              colors={["#0F0F1C", "#141424"]}
              style={[styles.addAvatarBg, { width: 54, height: 54, borderRadius: 27 }]}
            >
              {selfAvatar ? (
                <Avatar name={selfName} uri={selfAvatar} size={48} />
              ) : (
                <LinearGradient
                  colors={[colors.primary + "30", colors.secondary + "30"]}
                  style={[{ width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" }]}
                >
                  <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.primary }}>
                    {selfName[0]?.toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
            </LinearGradient>
            <LinearGradient
              colors={["#E91E8C", "#7B2FBE"]}
              style={styles.addBtn}
            >
              <Feather name="plus" size={11} color="#fff" />
            </LinearGradient>
            <View style={[styles.addRingBorder, { borderColor: colors.border }]} />
          </View>
          <Text style={[styles.storyName, { color: colors.mutedForeground }]} numberOfLines={1}>
            Add Story
          </Text>
        </Pressable>

        {stories.map((s) => (
          <StoryItem key={s.id} story={s} onPress={() => onStory(s.id)} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { paddingHorizontal: 14, paddingVertical: 14, gap: 18 },
  storyItem: { alignItems: "center", gap: 7, width: 62, position: "relative" },
  addStoryWrap: { position: "relative", width: 58, height: 58, alignItems: "center", justifyContent: "center" },
  addAvatarBg: { alignItems: "center", justifyContent: "center" },
  addRingBorder: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 30,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  addBtn: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#08080F",
  },
  storyName: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  unseenDot: {
    position: "absolute",
    top: 2,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#08080F",
  },
});
