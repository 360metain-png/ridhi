import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { GradientButton } from "@/components/GradientButton";

const { width } = Dimensions.get("window");

const PROMPT_LIBRARY = [
  "My ideal weekend looks like...",
  "The best chai I've ever had was...",
  "One thing on my bucket list...",
  "My superpower would be...",
  "The most desi thing about me...",
  "Dating me is like...",
  "My guilty pleasure...",
  "A cause I care about...",
  "My perfect date would be...",
  "The song that describes my life...",
];

const GRADIENTS: [string, string][] = [
  ["#FF3B30", "#FF9500"],
  ["#7B2FBE", "#E91E8C"],
  ["#007AFF", "#5AC8FA"],
  ["#34C759", "#00C7BE"],
  ["#FF9500", "#FFCC00"],
];

export default function ProfilePromptsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addProfilePrompt, removeProfilePrompt } = useAuth();
  
  const [search, setSearch] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const existingPrompts = user?.profilePrompts || [];

  const filteredLibrary = useMemo(() => {
    return PROMPT_LIBRARY.filter(p => 
      p.toLowerCase().includes(search.toLowerCase()) &&
      !existingPrompts.some(ep => ep.question === p)
    );
  }, [search, existingPrompts]);

  const handleAddPrompt = async () => {
    if (!selectedPrompt || !answer.trim()) return;
    
    try {
      await addProfilePrompt(selectedPrompt, answer.trim());
      setSelectedPrompt(null);
      setAnswer("");
      setIsAdding(false);
    } catch (error) {
      Alert.alert("Error", "Failed to add prompt. Please try again.");
    }
  };

  const handleRemovePrompt = (index: number) => {
    Alert.alert(
      "Remove Prompt",
      "Are you sure you want to remove this prompt?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeProfilePrompt(index) }
      ]
    );
  };

  const openPromptInput = (prompt: string) => {
    if (existingPrompts.length >= 5) {
      Alert.alert("Limit Reached", "You can only add up to 5 prompts.");
      return;
    }
    setSelectedPrompt(prompt);
    setIsAdding(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile Prompts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Existing Prompts */}
        {existingPrompts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>YOUR PROMPTS ({existingPrompts.length}/5)</Text>
            {existingPrompts.map((p, i) => (
              <LinearGradient
                key={i}
                colors={GRADIENTS[i % GRADIENTS.length]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promptCard}
              >
                <View style={styles.promptCardContent}>
                  <Text style={styles.promptQuestion}>{p.question}</Text>
                  <Text style={styles.promptAnswer}>{p.answer}</Text>
                </View>
                <Pressable onPress={() => handleRemovePrompt(i)} style={styles.removeBtn}>
                  <Feather name="trash-2" size={18} color="#fff" />
                </Pressable>
              </LinearGradient>
            ))}
          </View>
        )}

        {/* Prompt Library */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>CHOOSE A PROMPT</Text>
          <View style={[styles.searchContainer, { backgroundColor: colors.muted }]}>
            <Feather name="search" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search prompts..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {filteredLibrary.map((prompt, i) => (
            <Pressable
              key={i}
              onPress={() => openPromptInput(prompt)}
              style={[styles.libraryItem, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.libraryText, { color: colors.foreground }]}>{prompt}</Text>
              <Feather name="plus-circle" size={20} color={colors.primary} />
            </Pressable>
          ))}
          
          {filteredLibrary.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {search ? "No matching prompts found." : "All prompts added!"}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Answer Modal */}
      <Modal visible={isAdding} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setIsAdding(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Answer Prompt</Text>
              <Pressable onPress={() => setIsAdding(false)}>
                <Feather name="x" size={24} color={colors.mutedForeground} />
              </Pressable>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalQuestion, { color: colors.mutedForeground }]}>{selectedPrompt}</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="Type your answer here..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                maxLength={200}
                value={answer}
                onChangeText={setAnswer}
                autoFocus
              />
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{answer.length}/200</Text>
              
              <GradientButton
                label="Add to Profile"
                onPress={handleAddPrompt}
                disabled={!answer.trim()}
                style={{ marginTop: 20 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", flex: 1, textAlign: "center" },
  section: { padding: 16 },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 12 },
  promptCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  promptCardContent: { flex: 1 },
  promptQuestion: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 4 },
  promptAnswer: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  removeBtn: { padding: 8 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, fontFamily: "Inter_400Regular" },
  libraryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  libraryText: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium" },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalDismiss: { flex: 1 },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === "ios" ? 40 : 24 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalBody: { padding: 20 },
  modalQuestion: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    height: 120,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
  },
  charCount: { textAlign: "right", marginTop: 4, fontSize: 12 },
});