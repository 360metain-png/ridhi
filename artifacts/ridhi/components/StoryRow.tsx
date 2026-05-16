import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

export function StoryRow({ stories, onAddStory, onStory, selfName, selfAvatar }: StoryRowProps) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={[styles.container, { borderBottomColor: colors.border }]}
    >
      <Pressable style={styles.storyItem} onPress={onAddStory}>
        <View style={[styles.addStoryWrap, { borderColor: colors.border }]}>
          <Avatar name={selfName} uri={selfAvatar} size={52} />
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.addBtn}
          >
            <Feather name="plus" size={12} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>
          Your Story
        </Text>
      </Pressable>

      {stories.map((s) => (
        <Pressable key={s.id} style={styles.storyItem} onPress={() => onStory(s.id)}>
          <Avatar
            name={s.userName}
            uri={s.userAvatar}
            size={52}
            hasStory={s.hasUnseen}
            showRing={!s.hasUnseen}
          />
          <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>
            {s.userName.split(" ")[0]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { paddingHorizontal: 12, paddingVertical: 12, gap: 16 },
  storyItem: { alignItems: "center", gap: 6, width: 64 },
  addStoryWrap: { position: "relative", borderWidth: 1.5, borderRadius: 32, padding: 2 },
  addBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  storyName: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
});
