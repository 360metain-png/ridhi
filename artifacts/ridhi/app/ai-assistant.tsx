import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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

const { width } = Dimensions.get("window");

type MsgRole = "user" | "ai";
interface Msg { id: string; role: MsgRole; text: string; time: string }

const QUICK_CMDS = [

  { icon: "globe", label: "Translate", color: "#3B82F6", prompt: "Translate my last message to Hindi", route: null },
  { icon: "zap", label: "Caption", color: "#E91E8C", prompt: "Generate a creative caption for my photo", route: null },
  { icon: "hash", label: "Hashtags", color: "#7B2FBE", prompt: "Suggest trending hashtags for my post", route: null },
  { icon: "feather", label: "Content Ideas", color: "#F59E0B", prompt: "Give me 5 viral content ideas for India", route: null },
  { icon: "shield", label: "Check Content", color: "#10B981", prompt: "Is my post safe to publish?", route: null },
  { icon: "mic", label: "Voice Note", color: "#EF4444", prompt: "Transcribe this voice message", route: null },
  { icon: "star", label: "Match Tips", color: "#8B5CF6", prompt: "How can I improve my dating profile?", route: null },
  { icon: "trending-up", label: "Grow Profile", color: "#06B6D4", prompt: "Help me grow my followers on Ridhi", route: null },
];

const AI_RESPONSES: Record<string, string> = {
  "Translate my last message to Hindi":
    "आपका संदेश हिंदी में: \"मैं अपना सबसे अच्छा जीवन जी रहा हूं, एक पल में एक बार ✨\" — अनुवाद पूरा हो गया!",
  "Generate a creative caption for my photo":
    "Here are 3 captions for you:\n\n1. \"Living for moments that take your breath away ✨ #RidhiVibes\"\n2. \"Chai in hand, dreams in heart ☕🇮🇳\"\n3. \"Some days you just have to create your own sunshine 🌟\"",
  "Suggest trending hashtags for my post":
    "🔥 Trending hashtags right now:\n#RidhiVibes #IndiaFirst #DesiContent #BollywoodLove #ChaiTime #MonsoonMagic #YouthOfIndia #CreatorIndia\n\nTip: Use 5–8 hashtags for best reach!",
  "Give me 5 viral content ideas for India":
    "1. 🎵 Lip sync to latest Bollywood releases\n2. 🍛 \"Rate my mom's cooking\" challenge\n3. 💃 Traditional dance + modern twist videos\n4. 🏏 Cricket commentary skits\n5. 🌆 City hidden gem tours (Mumbai lanes, Delhi bazaars)",
  "Is my post safe to publish?":
    "✅ Content scan complete!\n\n• No harmful language detected\n• No misinformation flags\n• No copyright conflicts\n• Safe for all audiences\n\nYour post is good to go!",
  "Transcribe this voice message":
    "🎙️ Transcription: \"Hey guys, what's up! Today I'm going to show you my favourite street food spot in Delhi. Stay tuned for the full video coming this weekend!\" — 98.2% confidence",
  "How can I improve my dating profile?":
    "💡 Profile tips for more matches:\n\n1. Add 3–5 clear face photos\n2. Write a bio in your native language\n3. Mention your hobbies (cricket, cooking, travel)\n4. Set your city accurately\n5. Stay active — online users get 3× more matches!",
  "Help me grow my followers on Ridhi":
    "📈 Growth strategy:\n\n• Post Reels daily (6–9 PM IST peak hours)\n• Reply to all comments in first hour\n• Collaborate with local creators\n• Use 'Community' posts for higher reach\n• Join weekly #RidhiChallenge for featured placement",
};

const HISTORY: Msg[] = [
  { id: "h1", role: "user", text: "Translate this to Hindi: Good morning everyone!", time: "9:10 AM" },
  { id: "h2", role: "ai", text: "सुप्रभात सभी को! (Subh Prabhat Sabhi Ko!) 🙏", time: "9:10 AM" },
  { id: "h3", role: "user", text: "Suggest hashtags for a food post", time: "9:12 AM" },
  { id: "h4", role: "ai", text: "#IndianFood #FoodBloggerIndia #HomeCooking #SpicesOfIndia #FoodPhotography #DesiFood #MomsMagic #FoodReels", time: "9:12 AM" },
];

export default function AIAssistantScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [messages, setMessages] = useState<Msg[]>(HISTORY);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const wave1 = useRef(new Animated.Value(0.3)).current;
  const wave2 = useRef(new Animated.Value(0.5)).current;
  const wave3 = useRef(new Animated.Value(0.7)).current;
  const wave4 = useRef(new Animated.Value(0.4)).current;
  const wave5 = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (listening) {
      const loop = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 300 + delay, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
            Animated.timing(anim, { toValue: 0.2, duration: 300 + delay, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          ])
        ).start();
      loop(wave1, 0); loop(wave2, 80); loop(wave3, 40); loop(wave4, 120); loop(wave5, 60);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      [wave1, wave2, wave3, wave4, wave5].forEach((w) => w.setValue(0.3));
    }
  }, [listening]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { id: Date.now().toString(), role: "user", text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 600));

    const aiText =
      AI_RESPONSES[text.trim()] ??
      "I'm your Ridhi AI assistant! I can help you with translations, captions, hashtags, content ideas, and more. Try one of the quick commands below ✨";
    const aiMsg: Msg = { id: (Date.now() + 1).toString(), role: "ai", text: aiText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setTyping(false);
    setMessages((p) => [...p, aiMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const toggleListen = () => {
    if (listening) {
      setListening(false);
      sendMessage("Transcribe this voice message");
    } else {
      setListening(true);
      setTimeout(() => setListening(false), 3000);
    }
  };

  const BAR_COLOR = colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.secondary + "22", colors.primary + "10", "transparent"]}
        style={[styles.headerGlow, { height: topPad + 160 }]}
        pointerEvents="none"
      />

      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.surface + "F0", borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.aiAvatarGradient}>
            <Feather name="cpu" size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ridhi AI</Text>
            <Text style={[styles.headerSub, { color: colors.success }]}>● Online · 7 features active</Text>
          </View>
        </View>
        <Pressable style={[styles.clearBtn, { backgroundColor: colors.muted }]}>
          <Feather name="refresh-ccw" size={15} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.featureBanner, { backgroundColor: colors.secondary + "15", borderColor: colors.secondary + "30" }]}>
          <Text style={[styles.featureBannerTitle, { color: colors.secondary }]}>✨ 7 AI Features Active</Text>
          <View style={styles.featureGrid}>
            {["Feed Recommendations", "Caption Generator", "Hashtag Suggestions", "Translation", "Content Moderation", "Spam Detection", "Voice Assistant"].map((f) => (
              <View key={f} style={[styles.featureTag, { backgroundColor: colors.secondary + "20" }]}>
                <Text style={[styles.featureTagText, { color: colors.secondary }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {messages.map((msg) => (
          <View key={msg.id} style={[styles.msgRow, msg.role === "user" ? styles.msgRowUser : styles.msgRowAi]}>
            {msg.role === "ai" && (
              <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.aiMsgAvatar}>
                <Feather name="cpu" size={12} color="#fff" />
              </LinearGradient>
            )}
            <View style={[
              styles.msgBubble,
              msg.role === "user"
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
            ]}>
              <Text style={[styles.msgText, { color: msg.role === "user" ? "#fff" : colors.foreground }]}>{msg.text}</Text>
              <Text style={[styles.msgTime, { color: msg.role === "user" ? "#ffffff80" : colors.mutedForeground }]}>{msg.time}</Text>
            </View>
          </View>
        ))}

        {typing && (
          <View style={[styles.msgRow, styles.msgRowAi]}>
            <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.aiMsgAvatar}>
              <Feather name="cpu" size={12} color="#fff" />
            </LinearGradient>
            <View style={[styles.msgBubble, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={[styles.typingText, { color: colors.mutedForeground }]}>Ridhi AI is typing...</Text>
            </View>
          </View>
        )}

        <Text style={[styles.quickTitle, { color: colors.mutedForeground }]}>Quick Commands</Text>
        <View style={styles.quickGrid}>
          {QUICK_CMDS.map((cmd) => (
            <Pressable
              key={cmd.label}
              onPress={() => cmd.route ? router.push(cmd.route) : sendMessage(cmd.prompt)}
              style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: cmd.color + "20" }]}>
                <Feather name={cmd.icon as any} size={16} color={cmd.color} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>{cmd.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {listening && (
        <View style={[styles.listeningBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.waveContainer}>
            {[wave1, wave2, wave3, wave4, wave5].map((w, i) => (
              <Animated.View
                key={i}
                style={[styles.wavebar, { backgroundColor: BAR_COLOR, transform: [{ scaleY: w }] }]}
              />
            ))}
          </View>
          <Text style={[styles.listeningText, { color: colors.primary }]}>Listening...</Text>
          <Pressable onPress={toggleListen} style={[styles.stopBtn, { backgroundColor: colors.destructive + "20" }]}>
            <Feather name="square" size={14} color={colors.destructive} />
          </Pressable>
        </View>
      )}

      <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 12 : insets.bottom + 4 }]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable onPress={toggleListen} style={[styles.micBtn, { backgroundColor: listening ? colors.primary : colors.muted }]}>
            <Feather name="mic" size={20} color={listening ? "#fff" : colors.foreground} />
          </Pressable>
        </Animated.View>

        <TextInput
          style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground }]}
          placeholder="Ask Ridhi AI anything..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage(input)}
          returnKeyType="send"
        />

        <Pressable
          onPress={() => sendMessage(input)}
          disabled={!input.trim()}
          style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]}
        >
          <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.sendBtnGrad}>
            <Feather name="send" size={16} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlow: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 0 },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12, zIndex: 10,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  aiAvatarGradient: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  clearBtn: { padding: 8, borderRadius: 20 },
  chatContent: { padding: 16, gap: 12, paddingBottom: 32 },
  featureBanner: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 8 },
  featureBannerTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 10 },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  featureTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  featureTagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "85%" },
  msgRowUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  msgRowAi: { alignSelf: "flex-start" },
  aiMsgAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  msgBubble: { padding: 12, borderRadius: 18, gap: 4, flex: 1 },
  msgText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  msgTime: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "flex-end" },
  typingText: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  quickTitle: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 8, marginBottom: 4 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickCard: {
    width: (width - 52) / 2, borderRadius: 14, borderWidth: 1,
    padding: 14, gap: 8,
  },
  quickIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  listeningBar: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  waveContainer: { flexDirection: "row", alignItems: "center", gap: 3, height: 28 },
  wavebar: { width: 4, height: 24, borderRadius: 2 },
  listeningText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  stopBtn: { padding: 8, borderRadius: 20 },
  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12,
    paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth,
  },
  micBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  textInput: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  sendBtn: {},
  sendBtnGrad: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
