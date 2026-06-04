import React, { useState, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  { id: "duet", icon: "users", label: "Duet", desc: "Side-by-side with another video" },
  { id: "stitch", icon: "git-merge", label: "Stitch", desc: "React to a part of another video" },
  { id: "story", icon: "circle", label: "Story", desc: "Visible for 24 hours" },
  { id: "audio", icon: "mic", label: "Audio", desc: "Share a voice note or audio clip" },
  { id: "gif", icon: "film", label: "GIF", desc: "Share an animated GIF" },
  { id: "poll", icon: "bar-chart-2", label: "Poll", desc: "Ask your followers a question" },
] as const;

type Tone = "casual" | "funny" | "inspirational" | "desi";

const TONES: { id: Tone; label: string; emoji: string }[] = [
  { id: "casual", label: "Casual", emoji: "😊" },
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "inspirational", label: "Inspire", emoji: "✨" },
  { id: "desi", label: "Desi", emoji: "🇮🇳" },
];

const CAPTIONS_BY_TONE: Record<Tone, string[]> = {
  casual: [
    "Living my best life, one moment at a time ✨",
    "Good vibes only. That's the whole post 😌",
    "Sometimes you just have to go for it 💫",
    "Today was a good day and that's enough 🌙",
  ],
  funny: [
    "My mom thinks I'm at the gym. I'm obviously not 😅",
    "Plot twist: I actually looked like this without a filter 😂",
    "Running on chai and zero sleep ☕💀",
    "Asked God for a sign. He said 'Post it' 🙏😂",
  ],
  inspirational: [
    "Every sunrise is a new chapter. Write yours beautifully 🌅",
    "Dreams don't work unless you do. Start today 🚀",
    "You are the author of your own story — make it a bestseller 📖",
    "Small steps. Consistent effort. Big results. 💪",
  ],
  desi: [
    "Dil toh pagal hai lekin content solid hai 😤🔥",
    "Chai peelo, dream bado, India shines 🇮🇳☕",
    "Apna time aayega — but first, let me post this 😌",
    "Maa ki dua + my hustle = unstoppable 🙌",
  ],
};

const HASHTAGS_BY_TOPIC: Record<string, string[]> = {
  food: ["#IndianFood", "#HomeCooking", "#FoodBloggerIndia", "#DesiKhana", "#FoodReels", "#SpicesOfIndia", "#MomsCooking", "#StreetFoodIndia"],
  travel: ["#IncredibleIndia", "#TravelIndia", "#Wanderlust", "#HiddenGems", "#ExploreIndia", "#TravelReels", "#BackpackerIndia", "#WeekendTrip"],
  fitness: ["#FitIndia", "#WorkoutMotivation", "#YogaLife", "#GymLife", "#HealthyLiving", "#IndianFitness", "#MorningWorkout", "#TransformationTuesday"],
  fashion: ["#IndianFashion", "#OOTDIndia", "#TraditionalWear", "#Kurti", "#DesiStyle", "#FashionBlogger", "#StyleIndia", "#EthnicWear"],
  default: ["#DesiVibes", "#ChaiTime", "#MonsoonMagic", "#Bollywood", "#IndiaFirst", "#CricketIndia", "#RidhiVibes", "#IndianYouth", "#DesiContent", "#BollywoodLove"],
};

const AI_HASHTAGS = [
  "#DesiVibes", "#ChaiTime", "#MonsoonMagic", "#Bollywood", "#IndiaFirst",
  "#CricketIndia", "#RidhiVibes", "#IndianYouth", "#DesiContent", "#BollywoodLove",
  "#FoodBloggerIndia", "#TravelIndia", "#FitIndia", "#IndianFashion", "#YouthOfIndia",
];

function detectTopic(text: string): string {
  const t = text.toLowerCase();
  if (t.match(/food|eat|cook|chai|restaurant|khana|recipe/)) return "food";
  if (t.match(/travel|trip|tour|visit|city|place|holiday|vacation/)) return "travel";
  if (t.match(/gym|workout|fitness|yoga|exercise|run|health/)) return "fitness";
  if (t.match(/fashion|outfit|dress|style|clothes|wear/)) return "fashion";
  return "default";
}

export default function CreatePostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const params = useLocalSearchParams<{ soundId?: string; soundTitle?: string; soundArtist?: string; duetWith?: string; duetTitle?: string; duetUser?: string; stitchWith?: string; stitchTitle?: string; stitchUser?: string; stitchTrim?: string; type?: string }>();

  const [selectedType, setSelectedType] = useState<string>(params?.type ?? "text");
  const [text, setText] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [audience, setAudience] = useState<"public" | "followers" | "private">("public");
  const [loading, setLoading] = useState(false);

  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);

  const [showCaptionPanel, setShowCaptionPanel] = useState(false);
  const [captionTone, setCaptionTone] = useState<Tone>("casual");
  const [aiCaptionLoading, setAiCaptionLoading] = useState(false);
  const [captionOptions, setCaptionOptions] = useState<string[]>([]);

  const [showHashtagPanel, setShowHashtagPanel] = useState(false);
  const [aiHashtagLoading, setAiHashtagLoading] = useState(false);
  const [aiHashtags, setAiHashtags] = useState<string[]>([]);
  const [hashtagTopic, setHashtagTopic] = useState<string>("");

  // ── Scheduling state ──
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  const captionPanelAnim = useRef(new Animated.Value(0)).current;
  const hashtagPanelAnim = useRef(new Animated.Value(0)).current;
  const schedulePanelAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const toggleHashtag = (tag: string) => {
    setHashtags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const openCaptionPanel = () => {
    setShowCaptionPanel(true);
    Animated.spring(captionPanelAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }).start();
  };

  const closeCaptionPanel = () => {
    Animated.timing(captionPanelAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowCaptionPanel(false));
  };

  const generateCaptions = async () => {
    setAiCaptionLoading(true);
    await new Promise((r) => setTimeout(r, 1300));
    const pool = CAPTIONS_BY_TONE[captionTone];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setCaptionOptions(shuffled.slice(0, 3));
    setAiCaptionLoading(false);
  };

  const pickCaption = (cap: string) => {
    setText(cap);
    closeCaptionPanel();
  };

  const openHashtagPanel = async () => {
    setShowHashtagPanel(true);
    Animated.spring(hashtagPanelAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }).start();
    setAiHashtagLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    const topic = detectTopic(text);
    setHashtagTopic(topic);
    const pool = HASHTAGS_BY_TOPIC[topic];
    setAiHashtags(pool);
    setAiHashtagLoading(false);
  };

  const closeHashtagPanel = () => {
    Animated.timing(hashtagPanelAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowHashtagPanel(false));
  };

  const pickMedia = async (type: "photo" | "video") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to your gallery to upload photos and videos.", [{ text: "OK" }]);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === "photo" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      if (type === "photo" && selectedType === "text") setSelectedType("photo");
      if (type === "video" && selectedType === "text") setSelectedType("video");
    }
  };

  const handleLocationTag = () => {
    const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Kolkata", "Chennai", "Pune", "Jaipur"];
    Alert.alert("Tag Location", "Choose your location:", [
      ...cities.slice(0, 4).map((c) => ({ text: c, onPress: () => setLocation(c) })),
      { text: "More cities…", onPress: () => {
        Alert.alert("Pick City", "", [
          ...cities.slice(4).map((c) => ({ text: c, onPress: () => setLocation(c) })),
          { text: "Cancel", style: "cancel" },
        ]);
      }},
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleFeelingTag = () => {
    const feelings = ["😊 Happy", "😂 Laughing", "❤️ In Love", "😢 Sad", "😎 Cool", "🙏 Grateful", "🔥 Excited", "😴 Tired"];
    Alert.alert("How are you feeling?", "", [
      ...feelings.slice(0, 4).map((f) => ({ text: f, onPress: () => setFeeling(f) })),
      { text: "More feelings…", onPress: () => {
        Alert.alert("Feeling", "", [
          ...feelings.slice(4).map((f) => ({ text: f, onPress: () => setFeeling(f) })),
          { text: "Cancel", style: "cancel" },
        ]);
      }},
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleTagPeople = () => {
    Alert.alert("Tag People", "Enter a name or username to tag:", [
      { text: "Priya Sharma", onPress: () => setTaggedPeople((p) => [...p, "Priya Sharma"]) },
      { text: "Raj Nair", onPress: () => setTaggedPeople((p) => [...p, "Raj Nair"]) },
      { text: "Anjali Singh", onPress: () => setTaggedPeople((p) => [...p, "Anjali Singh"]) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handlePost = async () => {
    setLoading(true);
    try {
      const body: any = {
        content: text.trim(),
        images: mediaUri ? [mediaUri] : [],
        city: user?.city ?? null,
        language: user?.language ?? null,
        type: selectedType,
      };
      if (selectedType === "duet" || selectedType === "stitch") {
        body.duetWith = params?.duetWith ? { reelId: params.duetWith, reelTitle: params.duetTitle, reelUser: params.duetUser } : undefined;
        body.stitchWith = params?.stitchWith ? { reelId: params.stitchWith, reelTitle: params.stitchTitle, reelUser: params.stitchUser, trim: params.stitchTrim } : undefined;
      }
      if (params?.soundId) {
        body.soundId = params.soundId;
        body.soundTitle = params.soundTitle;
        body.soundArtist = params.soundArtist;
      }
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id ?? "",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        Alert.alert("Posted! 🎉", "Your post is now live on Ridhi.", [{ text: "OK", onPress: () => router.back() }]);
      } else {
        Alert.alert("Error", "Failed to post. Please try again.");
      }
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = () => {
    setShowSchedulePicker(true);
    Animated.spring(schedulePanelAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }).start();
  };

  const closeSchedulePicker = () => {
    Animated.timing(schedulePanelAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowSchedulePicker(false));
  };

  const pickScheduleTime = (hoursFromNow: number) => {
    const d = new Date(Date.now() + hoursFromNow * 3600 * 1000);
    setScheduledAt(d.toISOString());
    setIsScheduled(true);
    closeSchedulePicker();
  };

  const executeSchedule = async () => {
    if (!scheduledAt) return;
    setLoading(true);
    try {
      const scheduledItem = {
        id: `sch_${Date.now()}`,
        type: selectedType as any,
        title: text.trim().slice(0, 50),
        content: text.trim(),
        mediaUri: mediaUri ?? undefined,
        hashtags,
        scheduledAt,
        status: "pending",
        createdAt: new Date().toISOString(),
        audience,
        location: location ?? undefined,
        feeling: feeling ?? undefined,
        taggedPeople,
        pollOptions: selectedType === "poll" ? ["Option 1", "Option 2"] : undefined,
        duetWith: params?.duetWith ? { reelId: params.duetWith, reelTitle: params.duetTitle, reelUser: params.duetUser } : undefined,
        stitchWith: params?.stitchWith ? { reelId: params.stitchWith, reelTitle: params.stitchTitle, reelUser: params.stitchUser, trim: params.stitchTrim } : undefined,
        soundId: params?.soundId ?? undefined,
        soundTitle: params?.soundTitle ?? undefined,
        soundArtist: params?.soundArtist ?? undefined,
      };
      // Persist to AsyncStorage
      const raw = await AsyncStorage.getItem("ridhi_scheduled");
      const existing = raw ? JSON.parse(raw) : [];
      const updated = [scheduledItem, ...existing];
      await AsyncStorage.setItem("ridhi_scheduled", JSON.stringify(updated));
      Alert.alert("Scheduled! ⏰", `Your ${selectedType} is set to go live at ${new Date(scheduledAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, month: "short", day: "numeric" })}.`, [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      Alert.alert("Error", "Could not schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{isScheduled ? "Schedule" : "Create"} Post</Text>
        <GradientButton
          label={isScheduled ? "Schedule" : "Post"}
          onPress={isScheduled ? executeSchedule : handlePost}
          loading={loading}
          disabled={!text.trim() && hashtags.length === 0}
          small
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 32 }}>
        <View style={styles.typeRow}>
          {POST_TYPES.map((type) => (
            <Pressable
              key={type.id}
              onPress={() => setSelectedType(type.id)}
              style={[styles.typeBtn, {
                backgroundColor: selectedType === type.id ? colors.primary : colors.muted,
                borderColor: selectedType === type.id ? colors.primary : colors.border,
              }]}
            >
              <Feather name={type.icon as any} size={16} color={selectedType === type.id ? "#fff" : colors.mutedForeground} />
              <Text style={[styles.typeLabel, { color: selectedType === type.id ? "#fff" : colors.foreground }]}>{type.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.composerRow}>
          <Avatar name={user?.name ?? "Me"} size={40} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.composerName, { color: colors.foreground }]}>{user?.name}</Text>
            <Pressable
              style={[styles.audienceBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
              onPress={() => setAudience((a) => a === "public" ? "followers" : a === "followers" ? "private" : "public")}
            >
              <Feather name={audience === "public" ? "globe" : audience === "followers" ? "users" : "lock"} size={12} color={colors.mutedForeground} />
              <Text style={[styles.audienceText, { color: colors.mutedForeground }]}>
                {audience === "public" ? "Public" : audience === "followers" ? "Followers" : "Only me"}
              </Text>
              <Feather name="chevron-down" size={12} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>

        {/* Selected sound indicator */}
        {params?.soundTitle && (
          <View style={[styles.soundBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <Feather name="music" size={14} color={colors.primary} />
            <Text style={[styles.soundText, { color: colors.primary }]} numberOfLines={1}>
              🎵 {params.soundTitle} • {params.soundArtist}
            </Text>
            <Pressable onPress={() => router.setParams({ soundId: undefined, soundTitle: undefined, soundArtist: undefined })}>
              <Feather name="x" size={14} color={colors.primary} />
            </Pressable>
          </View>
        )}

        <TextInput
          style={[styles.textInput, { color: colors.foreground }]}
          placeholder={selectedType === "text" ? "What's on your mind?" : selectedType === "poll" ? "Ask a question..." : "Write a caption..."}
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          autoFocus={selectedType === "text"}
        />

        <View style={styles.aiRow}>
          <Pressable
            onPress={openCaptionPanel}
            style={[styles.aiChip, { backgroundColor: colors.secondary + "18", borderColor: colors.secondary + "35" }]}
          >
            <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.aiChipIcon}>
              <Feather name="zap" size={11} color="#fff" />
            </LinearGradient>
            <Text style={[styles.aiChipText, { color: colors.secondary }]}>AI Caption</Text>
          </Pressable>

          <Pressable
            onPress={openHashtagPanel}
            style={[styles.aiChip, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "35" }]}
          >
            <LinearGradient colors={[colors.primary, "#FF6B9D"]} style={styles.aiChipIcon}>
              <Feather name="hash" size={11} color="#fff" />
            </LinearGradient>
            <Text style={[styles.aiChipText, { color: colors.primary }]}>AI Hashtags</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/ai-assistant")}
            style={[styles.aiChip, { backgroundColor: "#3B82F6" + "18", borderColor: "#3B82F6" + "35" }]}
          >
            <View style={[styles.aiChipIcon, { backgroundColor: "#3B82F6" }]}>
              <Feather name="cpu" size={11} color="#fff" />
            </View>
            <Text style={[styles.aiChipText, { color: "#3B82F6" }]}>AI Assistant</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/music-library")}
            style={[styles.aiChip, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "35" }]}
          >
            <View style={[styles.aiChipIcon, { backgroundColor: colors.primary }]}>
              <Feather name="music" size={11} color="#fff" />
            </View>
            <Text style={[styles.aiChipText, { color: colors.primary }]}>Music Library</Text>
          </Pressable>
        </View>

        {selectedType !== "text" && selectedType !== "poll" && (
          <Pressable
            onPress={() => {
              if (selectedType === "photo" || selectedType === "story") pickMedia("photo");
              else if (selectedType === "video" || selectedType === "reel") pickMedia("video");
              else if (selectedType === "audio") Alert.alert("Audio Recording", "Tap the microphone to start recording your voice note.", [{ text: "OK" }]);
              else if (selectedType === "gif") Alert.alert("GIF Search", "Search for GIFs powered by GIPHY — coming soon!", [{ text: "OK" }]);
            }}
            style={[styles.mediaUpload, { backgroundColor: colors.muted, borderColor: mediaUri ? colors.primary : colors.border }]}
          >
            <LinearGradient colors={[colors.primary + "20", colors.secondary + "10"]} style={styles.mediaUploadInner}>
              {mediaUri ? (
                <>
                  <Feather name="check-circle" size={32} color={colors.success ?? "#34C759"} />
                  <Text style={[styles.mediaUploadText, { color: colors.foreground }]}>Media selected ✓</Text>
                  <Text style={[styles.mediaUploadSub, { color: colors.mutedForeground }]}>Tap to change</Text>
                </>
              ) : (
                <>
                  <Feather name={selectedType === "audio" ? "mic" : selectedType === "gif" ? "film" : "upload-cloud"} size={32} color={colors.primary} />
                  <Text style={[styles.mediaUploadText, { color: colors.foreground }]}>
                    {selectedType === "audio" ? "Tap to record audio" : selectedType === "gif" ? "Search GIFs" : `Tap to add ${selectedType}`}
                  </Text>
                  <Text style={[styles.mediaUploadSub, { color: colors.mutedForeground }]}>
                    {selectedType === "reel" || selectedType === "story" ? "Max 60 seconds" : selectedType === "video" ? "Max 5 minutes" : selectedType === "audio" ? "MP3, WAV up to 10MB" : selectedType === "gif" ? "Powered by GIPHY" : "JPG, PNG up to 20MB"}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}

        {(location || feeling || taggedPeople.length > 0) && (
          <View style={[styles.metaTagsRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            {location && (
              <Pressable onPress={() => setLocation(null)} style={[styles.metaTag, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="map-pin" size={12} color={colors.primary} />
                <Text style={[styles.metaTagText, { color: colors.primary }]}>{location}</Text>
                <Feather name="x" size={10} color={colors.primary} />
              </Pressable>
            )}
            {feeling && (
              <Pressable onPress={() => setFeeling(null)} style={[styles.metaTag, { backgroundColor: colors.secondary + "18" }]}>
                <Text style={styles.metaTagText}>{feeling}</Text>
                <Feather name="x" size={10} color={colors.secondary} />
              </Pressable>
            )}
            {taggedPeople.map((person) => (
              <Pressable key={person} onPress={() => setTaggedPeople((p) => p.filter((x) => x !== person))} style={[styles.metaTag, { backgroundColor: "#4A90E218" }]}>
                <Feather name="at-sign" size={12} color="#4A90E2" />
                <Text style={[styles.metaTagText, { color: "#4A90E2" }]}>{person}</Text>
                <Feather name="x" size={10} color="#4A90E2" />
              </Pressable>
            ))}
          </View>
        )}

        {selectedType === "poll" && (
          <View style={styles.pollOptions}>
            {["Option 1", "Option 2"].map((opt) => (
              <View key={opt} style={[styles.pollOption, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <TextInput style={[styles.pollInput, { color: colors.foreground }]} placeholder={opt} placeholderTextColor={colors.mutedForeground} />
              </View>
            ))}
          </View>
        )}

        {hashtags.length > 0 && (
          <View style={[styles.selectedHashtags, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <Text style={[styles.selectedHashtagsTitle, { color: colors.primary }]}>Added hashtags</Text>
            <View style={styles.hashtagRow}>
              {hashtags.map((tag) => (
                <Pressable key={tag} onPress={() => toggleHashtag(tag)} style={[styles.hashtagPill, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Text style={[styles.hashtagText, { color: "#fff" }]}>{tag}</Text>
                  <Feather name="x" size={10} color="#fff" />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Schedule indicator */}
        {isScheduled && scheduledAt && (
          <View style={[styles.scheduleIndicator, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
            <Feather name="clock" size={14} color={colors.primary} />
            <Text style={[styles.scheduleText, { color: colors.primary }]}>
              Scheduled for {new Date(scheduledAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, month: "short", day: "numeric" })}
            </Text>
            <Pressable onPress={() => { setIsScheduled(false); setScheduledAt(""); }}>
              <Feather name="x" size={14} color={colors.primary} />
            </Pressable>
          </View>
        )}

        <View style={[styles.toolbarRow, { borderTopColor: colors.border }]}>
          {[
            { icon: "image", label: "Photo", active: !!mediaUri && (selectedType === "photo" || selectedType === "story"), onPress: () => pickMedia("photo") },
            { icon: "video", label: "Video", active: !!mediaUri && (selectedType === "video" || selectedType === "reel"), onPress: () => pickMedia("video") },
            { icon: "map-pin", label: location || "Location", active: !!location, onPress: handleLocationTag },
            { icon: "tag", label: taggedPeople.length > 0 ? `${taggedPeople.length} tagged` : "Tag", active: taggedPeople.length > 0, onPress: handleTagPeople },
            { icon: "smile", label: feeling ? feeling.split(" ")[0] : "Feeling", active: !!feeling, onPress: handleFeelingTag },
            { icon: "calendar", label: isScheduled ? "Scheduled" : "Schedule", active: isScheduled, onPress: handleSchedule },
          ].map((tool) => (
            <Pressable
              key={tool.icon}
              onPress={tool.onPress}
              style={[styles.toolbarBtn, tool.active && { backgroundColor: colors.primary + "12", borderRadius: 8 }]}
              accessibilityLabel={tool.label}
            >
              <Feather name={tool.icon as any} size={20} color={tool.active ? colors.primary : colors.primary} />
              <Text
                style={[styles.toolbarLabel, { color: tool.active ? colors.primary : colors.mutedForeground, fontFamily: tool.active ? "Inter_600SemiBold" : "Inter_400Regular" }]}
                numberOfLines={1}
              >
                {tool.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {showCaptionPanel && (
        <Animated.View
          style={[styles.bottomPanel, {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            transform: [{ translateY: captionPanelAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
          }]}
        >
          <View style={styles.panelHandle} />
          <View style={styles.panelHeader}>
            <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.panelIcon}>
              <Feather name="zap" size={14} color="#fff" />
            </LinearGradient>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>AI Caption Generator</Text>
            <Pressable onPress={closeCaptionPanel}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.toneRow}>
            {TONES.map((tone) => (
              <Pressable
                key={tone.id}
                onPress={() => { setCaptionTone(tone.id); setCaptionOptions([]); }}
                style={[styles.toneBtn, {
                  backgroundColor: captionTone === tone.id ? colors.secondary + "20" : colors.muted,
                  borderColor: captionTone === tone.id ? colors.secondary : colors.border,
                }]}
              >
                <Text style={styles.toneEmoji}>{tone.emoji}</Text>
                <Text style={[styles.toneLabel, { color: captionTone === tone.id ? colors.secondary : colors.foreground }]}>{tone.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={generateCaptions} style={[styles.generateBtn, { backgroundColor: colors.secondary + "20", borderColor: colors.secondary + "40" }]}>
            <Feather name="refresh-cw" size={14} color={colors.secondary} />
            <Text style={[styles.generateBtnText, { color: colors.secondary }]}>
              {aiCaptionLoading ? "Generating..." : captionOptions.length ? "Regenerate" : "Generate Captions"}
            </Text>
          </Pressable>

          {captionOptions.length > 0 && (
            <View style={styles.captionOptions}>
              {captionOptions.map((cap, i) => (
                <Pressable
                  key={i}
                  onPress={() => pickCaption(cap)}
                  style={[styles.captionOption, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={[styles.captionOptionText, { color: colors.foreground }]}>{cap}</Text>
                  <View style={[styles.captionOptionUse, { backgroundColor: colors.primary }]}>
                    <Text style={styles.captionOptionUseText}>Use</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>
      )}

      {showHashtagPanel && (
        <Animated.View
          style={[styles.bottomPanel, {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            transform: [{ translateY: hashtagPanelAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
          }]}
        >
          <View style={styles.panelHandle} />
          <View style={styles.panelHeader}>
            <LinearGradient colors={[colors.primary, "#FF6B9D"]} style={styles.panelIcon}>
              <Feather name="hash" size={14} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>AI Hashtag Suggestions</Text>
              {hashtagTopic && !aiHashtagLoading && (
                <Text style={[styles.panelSub, { color: colors.mutedForeground }]}>
                  Detected topic: <Text style={{ color: colors.primary, textTransform: "capitalize" }}>{hashtagTopic}</Text>
                </Text>
              )}
            </View>
            <Pressable onPress={closeHashtagPanel}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {aiHashtagLoading ? (
            <View style={styles.loadingRow}>
              <Feather name="loader" size={18} color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Analysing your content...</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.hashtagPanelNote, { color: colors.mutedForeground }]}>Tap to add. Tap again to remove.</Text>
              <View style={[styles.hashtagRow, { paddingHorizontal: 16 }]}>
                {aiHashtags.map((tag, i) => (
                  <Pressable
                    key={tag}
                    onPress={() => toggleHashtag(tag)}
                    style={[styles.hashtagPill, hashtags.includes(tag)
                      ? { backgroundColor: colors.primary, borderColor: colors.primary }
                      : { backgroundColor: colors.muted, borderColor: colors.border }]}
                  >
                    {i < 3 && <Feather name="trending-up" size={10} color={hashtags.includes(tag) ? "#fff" : colors.destructive} />}
                    <Text style={[styles.hashtagText, { color: hashtags.includes(tag) ? "#fff" : colors.foreground }]}>{tag}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={[styles.hashtagPanelFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.hashtagPanelFooterText, { color: colors.mutedForeground }]}>
                  {hashtags.length}/10 selected
                </Text>
                <Pressable onPress={closeHashtagPanel} style={[styles.doneBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </Pressable>
              </View>
            </>
          )}
        </Animated.View>
      )}

      {/* Schedule picker panel */}
      {showSchedulePicker && (
        <Animated.View
          style={[styles.bottomPanel, {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            transform: [{ translateY: schedulePanelAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
          }]}
        >
          <View style={styles.panelHandle} />
          <View style={styles.panelHeader}>
            <LinearGradient colors={[colors.primary, "#FF6B9D"]} style={styles.panelIcon}>
              <Feather name="calendar" size={14} color="#fff" />
            </LinearGradient>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>Schedule Publication</Text>
            <Pressable onPress={closeSchedulePicker}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={[styles.scheduleNote, { color: colors.mutedForeground }]}>
            Pick a time for your {selectedType} to go live automatically.
          </Text>

          <View style={styles.scheduleGrid}>
            {[
              { label: "30 min", hours: 0.5 },
              { label: "1 hour", hours: 1 },
              { label: "3 hours", hours: 3 },
              { label: "6 hours", hours: 6 },
              { label: "12 hours", hours: 12 },
              { label: "Tomorrow", hours: 24 },
              { label: "2 days", hours: 48 },
              { label: "1 week", hours: 168 },
            ].map((slot) => (
              <Pressable
                key={slot.label}
                onPress={() => pickScheduleTime(slot.hours)}
                style={[styles.scheduleSlot, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Feather name="clock" size={16} color={colors.primary} />
                <Text style={[styles.scheduleSlotLabel, { color: colors.foreground }]}>{slot.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", flex: 1 },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 16 },
  typeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  typeLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  composerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  composerName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  audienceBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, alignSelf: "flex-start", marginTop: 4 },
  audienceText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  textInput: { paddingHorizontal: 20, fontSize: 18, fontFamily: "Inter_400Regular", lineHeight: 26, minHeight: 120, textAlignVertical: "top" },
  aiRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12, flexWrap: "wrap" },
  aiChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  aiChipIcon: { width: 20, height: 20, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  aiChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  mediaUpload: { marginHorizontal: 16, borderRadius: 18, borderWidth: 2, borderStyle: "dashed", overflow: "hidden", marginVertical: 12 },
  mediaUploadInner: { paddingVertical: 48, alignItems: "center", gap: 10 },
  mediaUploadText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  mediaUploadSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  pollOptions: { paddingHorizontal: 16, gap: 10, marginVertical: 8 },
  pollOption: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  pollInput: { padding: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  selectedHashtags: { marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 14, borderWidth: 1, gap: 8 },
  selectedHashtagsTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  hashtagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 8 },
  hashtagPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  hashtagText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  toolbarRow: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, marginTop: 20 },
  toolbarBtn: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 4 },
  toolbarLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  bottomPanel: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: Platform.OS === "web" ? 20 : 34,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
  },
  panelHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#ccc", alignSelf: "center", marginTop: 10, marginBottom: 4 },
  panelHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  panelIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  panelTitle: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1 },
  panelSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  toneRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  toneBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 14, borderWidth: 1, gap: 4 },
  toneEmoji: { fontSize: 20 },
  toneLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  generateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginBottom: 12 },
  generateBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  captionOptions: { paddingHorizontal: 16, gap: 8 },
  captionOption: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },
  captionOptionText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  captionOptionUse: { alignSelf: "flex-end", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10 },
  captionOptionUseText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  hashtagPanelNote: { fontSize: 12, fontFamily: "Inter_400Regular", paddingHorizontal: 16, marginBottom: 4 },
  hashtagPanelFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 8 },
  hashtagPanelFooterText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  doneBtn: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 },
  doneBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  metaTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  metaTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  metaTagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  soundBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginHorizontal: 16, marginBottom: 8, alignSelf: "flex-start" },
  soundText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },

  // Schedule indicator
  scheduleIndicator: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginHorizontal: 16, marginBottom: 8, alignSelf: "flex-start" },
  scheduleText: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },

  // Schedule picker
  scheduleNote: { fontSize: 13, fontFamily: "Inter_400Regular", paddingHorizontal: 16, marginBottom: 12, textAlign: "center" },
  scheduleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, paddingBottom: 20, justifyContent: "center" },
  scheduleSlot: { alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, minWidth: 80 },
  scheduleSlotLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
