import React, { useState, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
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
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { GradientButton } from "@/components/GradientButton";
import { PRODUCTS } from "@/data/mockData";
import { apiFetch, ApiError } from "@/utils/api";
import { moderateContent, type ModerationResult } from "@/utils/contentModeration";

const { width } = Dimensions.get("window");

const POST_TYPES = [
  { id: "text", icon: "type", label: "Status", desc: "Share what's on your mind" },
  { id: "audio", icon: "mic", label: "Audio", desc: "Share a voice note or podcast clip" },
  { id: "photo", icon: "image", label: "Photo", desc: "Share a photo from your gallery" },
  { id: "carousel", icon: "layers", label: "Carousel", desc: "Multiple photos with swipe" },
  { id: "reel", icon: "play", label: "Reel", desc: "Create a short audio/video reel" },
  { id: "story", icon: "circle", label: "Story", desc: "Visible for 24 hours" },
  { id: "video", icon: "video", label: "Video", desc: "Share a video up to 5 minutes" },
  { id: "duet", icon: "users", label: "Duet", desc: "Side-by-side with another video" },
  { id: "stitch", icon: "git-merge", label: "Stitch", desc: "React to a part of another video" },
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

const TTS_LANGUAGES = [
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", flag: "🇮🇳" },
  { code: "te", name: "Telugu", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", flag: "🇮🇳" },
  { code: "or", name: "Odia", flag: "🇮🇳" },
  { code: "as", name: "Assamese", flag: "🇮🇳" },
  { code: "en", name: "English", flag: "🇬🇧" },
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
  useTrackScreen("create_post");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();

  const params = useLocalSearchParams<{ soundId?: string; soundTitle?: string; soundArtist?: string; duetWith?: string; duetTitle?: string; duetUser?: string; stitchWith?: string; stitchTitle?: string; stitchUser?: string; stitchTrim?: string; type?: string }>();

  const [selectedType, setSelectedType] = useState<string>(params?.type ?? "text");
  const [text, setText] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [audience, setAudience] = useState<"public" | "followers" | "private">("public");
  const [loading, setLoading] = useState(false);

  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [taggedProduct, setTaggedProduct] = useState<any | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [showCaptionPanel, setShowCaptionPanel] = useState(false);
  const [captionTone, setCaptionTone] = useState<Tone>("casual");
  const [aiCaptionLoading, setAiCaptionLoading] = useState(false);
  const [captionOptions, setCaptionOptions] = useState<string[]>([]);

  const [showHashtagPanel, setShowHashtagPanel] = useState(false);
  const [aiHashtagLoading, setAiHashtagLoading] = useState(false);
  const [aiHashtags, setAiHashtags] = useState<string[]>([]);
  const [hashtagTopic, setHashtagTopic] = useState<string>("");

  // ── TTS (Text-to-Speech) state ──
  const [showTtsPanel, setShowTtsPanel] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ttsLanguage, setTtsLanguage] = useState<string>("hi");
  const [ttsVoice, setTtsVoice] = useState<"male" | "female">("female");
  const [ttsPreviewing, setTtsPreviewing] = useState(false);
  const ttsPanelAnim = useRef(new Animated.Value(0)).current;

  // ── Auto-Captions state ──
  const [autoCaptionsEnabled, setAutoCaptionsEnabled] = useState(false);
  const [captionLanguage, setCaptionLanguage] = useState<string>("hi");

  // ── Scheduling state ──
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  const captionPanelAnim = useRef(new Animated.Value(0)).current;
  const hashtagPanelAnim = useRef(new Animated.Value(0)).current;
  const schedulePanelAnim = useRef(new Animated.Value(0)).current;
  const ttsPanelAnimRef = useRef(new Animated.Value(0)).current;

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

  const openTtsPanel = () => {
    setShowTtsPanel(true);
    Animated.spring(ttsPanelAnimRef, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }).start();
  };

  const closeTtsPanel = () => {
    Animated.timing(ttsPanelAnimRef, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowTtsPanel(false));
  };

  const previewTts = async () => {
    setTtsPreviewing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTtsPreviewing(false);
    Alert.alert("Text-to-Speech", `Preview: "${text.slice(0, 50)}..." in ${ttsVoice} ${ttsLanguage} voice`, [{ text: "OK" }]);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingMediaType = useRef<"photo" | "video" | "carousel" | null>(null);

  const pickMedia = async (type: "photo" | "video" | "carousel") => {
    if (Platform.OS === "web") {
      pendingMediaType.current = type;
      fileInputRef.current?.click();
      return;
    }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow access to your gallery to upload photos and videos.", [{ text: "OK" }]);
        return;
      }
      if (type === "carousel") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsMultipleSelection: true,
          quality: 0.85,
        });
        if (result.canceled || !result.assets || result.assets.length === 0) return;
        setCarouselImages(result.assets.map((a) => a.uri));
        setMediaUri(null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === "photo" ? "images" : "videos",
        allowsEditing: true,
        quality: 0.85,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setMediaUri(result.assets[0].uri);
      if (type === "photo" && selectedType === "text") setSelectedType("photo");
      if (type === "video" && selectedType === "text") setSelectedType("video");
    } catch {
      Alert.alert("Gallery Error", "Could not open gallery. Please try again.");
    }
  };

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const type = pendingMediaType.current;
    pendingMediaType.current = null;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (type === "carousel") {
      const uris = Array.from(files).map((f) => URL.createObjectURL(f));
      setCarouselImages(uris);
      setMediaUri(null);
      return;
    }
    const uri = URL.createObjectURL(files[0]);
    setMediaUri(uri);
    if (type === "photo" && selectedType === "text") setSelectedType("photo");
    if (type === "video" && selectedType === "text") setSelectedType("video");
  };

  const openCamera = async (type: "photo" | "video") => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Camera not available",
        "Camera access is only available in the mobile app. Please upload from your gallery instead.",
        [{ text: "Pick from Gallery", onPress: () => pickMedia(type) }, { text: "Cancel", style: "cancel" }]
      );
      return;
    }
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Camera needed", "Allow camera access to take photos and videos.", [{ text: "OK" }]);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: type === "photo" ? "images" : "videos",
        allowsEditing: true,
        quality: 0.9,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      setMediaUri(result.assets[0].uri);
      if (type === "photo" && selectedType === "text") setSelectedType("photo");
      if (type === "video" && selectedType === "text") setSelectedType("video");
    } catch {
      Alert.alert("Camera Error", "Could not open camera. Please try again.");
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

  const openProductPicker = () => {
    setShowProductPicker(true);
  };

  const pickProduct = (prod: any) => {
    setTaggedProduct(prod);
    setShowProductPicker(false);
  };

  const { trackCreate } = useAnalytics();

  const handlePost = async () => {
    setLoading(true);
    try {
      // ── AI Content Moderation Check ──
      const moderation = await moderateContent(text.trim());
      if (moderation.flagged && moderation.severity === "critical") {
        setLoading(false);
        Alert.alert(
          "Content Blocked",
          moderation.suggestion || "Your content violates our community guidelines.",
          [{ text: "OK", style: "cancel" }]
        );
        return;
      }
      if (moderation.flagged && moderation.severity === "high") {
        setLoading(false);
        Alert.alert(
          "Content Warning",
          `${moderation.suggestion}\n\nContinue anyway?`,
          [
            { text: "Edit", style: "cancel" },
            { text: "Continue", onPress: () => proceedWithPost(moderation) },
          ]
        );
        return;
      }
      await proceedWithPost(moderation);
    } catch {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const proceedWithPost = async (moderation: ModerationResult) => {
    setLoading(true);
    try {
      const body: any = {
        content: text.trim(),
        images: selectedType === "carousel" ? carouselImages : (mediaUri ? [mediaUri] : []),
        city: user?.city ?? null,
        language: user?.language ?? null,
        type: selectedType,
        moderation: {
          category: moderation.category,
          severity: moderation.severity,
          flagged: moderation.flagged,
          confidence: moderation.confidence,
        },
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
      if (ttsEnabled) {
        body.tts = {
          enabled: true,
          language: ttsLanguage,
          voice: ttsVoice,
        };
      }
      if (autoCaptionsEnabled) {
        body.autoCaptions = {
          enabled: true,
          language: captionLanguage,
        };
      }
      if (taggedProduct) {
        body.taggedProduct = {
          id: taggedProduct.id,
          name: taggedProduct.name,
          price: taggedProduct.price,
          image: taggedProduct.image,
        };
      }
      const res = await apiFetch<{ success: boolean; post?: any }>("/api/posts", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (res.success) {
        Alert.alert("Posted! 🎉", "Your post is now live on Ridhi.", [{ text: "OK", onPress: () => router.back() }]);
        trackCreate(selectedType as "post" | "reel" | "story" | "live");
      } else {
        Alert.alert("Error", "Failed to post. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Network error. Please try again.";
      Alert.alert("Error", msg);
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
      {Platform.OS === "web" && React.createElement("input", {
        type: "file",
        accept: "image/*,video/*",
        multiple: true,
        ref: fileInputRef as any,
        style: { display: "none" },
        onChange: handleWebFileChange as any,
      })}
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

          {/* TTS Chip — only for text/audio posts */}
          {(selectedType === "text" || selectedType === "audio") && (
            <Pressable
              onPress={openTtsPanel}
              style={[styles.aiChip, {
                backgroundColor: ttsEnabled ? "#FF6B35" + "18" : colors.muted,
                borderColor: ttsEnabled ? "#FF6B35" + "40" : colors.border,
              }]}
            >
              <View style={[styles.aiChipIcon, { backgroundColor: ttsEnabled ? "#FF6B35" : colors.mutedForeground }]}>
                <Feather name="volume-2" size={11} color="#fff" />
              </View>
              <Text style={[styles.aiChipText, { color: ttsEnabled ? "#FF6B35" : colors.foreground }]}>
                {ttsEnabled ? "TTS On" : "Text-to-Speech"}
              </Text>
            </Pressable>
          )}

          {/* Auto-Captions Chip — only for video/reel/story */}
          {(selectedType === "video" || selectedType === "reel" || selectedType === "story") && (
            <Pressable
              onPress={() => setAutoCaptionsEnabled(!autoCaptionsEnabled)}
              style={[styles.aiChip, {
                backgroundColor: autoCaptionsEnabled ? "#34C759" + "18" : colors.muted,
                borderColor: autoCaptionsEnabled ? "#34C759" + "40" : colors.border,
              }]}
            >
              <View style={[styles.aiChipIcon, { backgroundColor: autoCaptionsEnabled ? "#34C759" : colors.mutedForeground }]}>
                <Feather name="type" size={11} color="#fff" />
              </View>
              <Text style={[styles.aiChipText, { color: autoCaptionsEnabled ? "#34C759" : colors.foreground }]}>
                {autoCaptionsEnabled ? "Captions On" : "Auto-Captions"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Carousel image preview grid */}
        {selectedType === "carousel" && carouselImages.length > 0 && (
          <View style={styles.carouselGrid}>
            {carouselImages.map((uri, idx) => (
              <View key={uri} style={[styles.carouselThumb, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Image source={{ uri }} style={styles.carouselThumbImg} />
                <Pressable onPress={() => setCarouselImages((prev) => prev.filter((_, i) => i !== idx))} style={[styles.carouselRemoveBtn, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
                  <Feather name="x" size={12} color="#fff" />
                </Pressable>
                {idx === 0 && (
                  <View style={[styles.carouselCoverBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.carouselCoverText}>Cover</Text>
                  </View>
                )}
              </View>
            ))}
            {carouselImages.length < 10 && (
              <Pressable onPress={() => pickMedia("carousel")} style={[styles.carouselAddBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Feather name="plus" size={24} color={colors.primary} />
                <Text style={[styles.carouselAddText, { color: colors.mutedForeground }]}>Add</Text>
              </Pressable>
            )}
          </View>
        )}

        {selectedType !== "text" && selectedType !== "poll" && selectedType !== "carousel" && (
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

        {/* Carousel initial upload button */}
        {selectedType === "carousel" && carouselImages.length === 0 && (
          <Pressable
            onPress={() => pickMedia("carousel")}
            style={[styles.mediaUpload, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <LinearGradient colors={[colors.primary + "20", colors.secondary + "10"]} style={styles.mediaUploadInner}>
              <Feather name="layers" size={32} color={colors.primary} />
              <Text style={[styles.mediaUploadText, { color: colors.foreground }]}>Tap to add photos</Text>
              <Text style={[styles.mediaUploadSub, { color: colors.mutedForeground }]}>Select 2-10 photos · JPG, PNG up to 20MB each</Text>
            </LinearGradient>
          </Pressable>
        )}

        {(location || feeling || taggedPeople.length > 0 || taggedProduct) && (
          <View style={[styles.metaTagsRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            {taggedProduct && (
              <Pressable onPress={() => setTaggedProduct(null)} style={[styles.metaTag, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="shopping-bag" size={12} color={colors.primary} />
                <Text style={[styles.metaTagText, { color: colors.primary }]}>{taggedProduct.name}</Text>
                <Feather name="x" size={10} color={colors.primary} />
              </Pressable>
            )}
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
            { icon: "camera", label: "Camera", active: false, onPress: () => openCamera(selectedType === "video" || selectedType === "reel" || selectedType === "story" ? "video" : "photo") },
            { icon: "image", label: "Photo", active: !!mediaUri && (selectedType === "photo" || selectedType === "story"), onPress: () => pickMedia("photo") },
            { icon: "video", label: "Video", active: !!mediaUri && (selectedType === "video" || selectedType === "reel"), onPress: () => pickMedia("video") },
            { icon: "map-pin", label: location || "Location", active: !!location, onPress: handleLocationTag },
            { icon: "tag", label: taggedPeople.length > 0 ? `${taggedPeople.length} tagged` : "Tag", active: taggedPeople.length > 0, onPress: handleTagPeople },
            { icon: "smile", label: feeling ? feeling.split(" ")[0] : "Feeling", active: !!feeling, onPress: handleFeelingTag },
            { icon: "calendar", label: isScheduled ? "Scheduled" : "Schedule", active: isScheduled, onPress: handleSchedule },
            { icon: "shopping-bag", label: taggedProduct ? "1 product" : "Product", active: !!taggedProduct, onPress: openProductPicker },
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

      {/* TTS indicator */}
      {ttsEnabled && (
        <View style={[styles.ttsIndicator, { backgroundColor: "#FF6B35" + "12", borderColor: "#FF6B35" + "30" }]}>
          <Feather name="volume-2" size={14} color="#FF6B35" />
          <Text style={[styles.ttsIndicatorText, { color: "#FF6B35" }]}>
            Text-to-Speech: {ttsVoice} · {TTS_LANGUAGES.find((l) => l.code === ttsLanguage)?.name ?? "Hindi"}
          </Text>
          <Pressable onPress={() => setTtsEnabled(false)}>
            <Feather name="x" size={14} color="#FF6B35" />
          </Pressable>
        </View>
      )}

      {/* Auto-Captions indicator */}
      {autoCaptionsEnabled && (
        <View style={[styles.ttsIndicator, { backgroundColor: "#34C759" + "12", borderColor: "#34C759" + "30" }]}>
          <Feather name="type" size={14} color="#34C759" />
          <Text style={[styles.ttsIndicatorText, { color: "#34C759" }]}>
            Auto-Captions: {TTS_LANGUAGES.find((l) => l.code === captionLanguage)?.name ?? "Hindi"}
          </Text>
          <Pressable onPress={() => setAutoCaptionsEnabled(false)}>
            <Feather name="x" size={14} color="#34C759" />
          </Pressable>
        </View>
      )}

      {/* TTS panel */}
      {showTtsPanel && (
        <Animated.View
          style={[styles.bottomPanel, {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            transform: [{ translateY: ttsPanelAnimRef.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
          }]}
        >
          <View style={styles.panelHandle} />
          <View style={styles.panelHeader}>
            <View style={[styles.panelIcon, { backgroundColor: "#FF6B35" }]}>
              <Feather name="volume-2" size={14} color="#fff" />
            </View>
            <Text style={[styles.panelTitle, { color: colors.foreground }]}>Text-to-Speech</Text>
            <Pressable onPress={closeTtsPanel}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={[styles.scheduleNote, { color: colors.mutedForeground }]}>
            Convert your text into spoken audio in Indian languages. Perfect for podcasts and voice reels.
          </Text>

          <View style={{ paddingHorizontal: 16, gap: 12, marginBottom: 16 }}>
            {/* Enable toggle */}
            <View style={[styles.ttsToggleRow, { borderColor: colors.border }]}>
              <Text style={[styles.ttsToggleLabel, { color: colors.foreground }]}>Enable TTS for this post</Text>
              <Pressable
                onPress={() => { setTtsEnabled(!ttsEnabled); }}
                style={[styles.ttsToggle, { backgroundColor: ttsEnabled ? "#FF6B35" : colors.border }]}
              >
                <View style={[styles.ttsToggleKnob, { backgroundColor: "#fff", transform: [{ translateX: ttsEnabled ? 18 : 0 }] }]} />
              </Pressable>
            </View>

            {/* Language selector */}
            <Text style={[styles.ttsSectionLabel, { color: colors.mutedForeground }]}>Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {TTS_LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => setTtsLanguage(lang.code)}
                  style={[styles.ttsLangBtn, {
                    backgroundColor: ttsLanguage === lang.code ? "#FF6B35" + "20" : colors.muted,
                    borderColor: ttsLanguage === lang.code ? "#FF6B35" : colors.border,
                  }]}
                >
                  <Text style={{ fontSize: 14 }}>{lang.flag}</Text>
                  <Text style={[styles.ttsLangText, { color: ttsLanguage === lang.code ? "#FF6B35" : colors.foreground }]}>
                    {lang.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Voice selector */}
            <Text style={[styles.ttsSectionLabel, { color: colors.mutedForeground }]}>Voice</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["female", "male"] as const).map((v) => (
                <Pressable
                  key={v}
                  onPress={() => setTtsVoice(v)}
                  style={[styles.ttsVoiceBtn, {
                    backgroundColor: ttsVoice === v ? "#FF6B35" + "20" : colors.muted,
                    borderColor: ttsVoice === v ? "#FF6B35" : colors.border,
                  }]}
                >
                  <Feather name={v === "female" ? "user" : "user"} size={14} color={ttsVoice === v ? "#FF6B35" : colors.mutedForeground} />
                  <Text style={[styles.ttsVoiceText, { color: ttsVoice === v ? "#FF6B35" : colors.foreground }]}>
                    {v === "female" ? "Female" : "Male"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Preview button */}
            <Pressable
              onPress={previewTts}
              disabled={!text.trim() || ttsPreviewing}
              style={[styles.ttsPreviewBtn, {
                backgroundColor: !text.trim() ? colors.muted : "#FF6B35" + "18",
                borderColor: !text.trim() ? colors.border : "#FF6B35" + "40",
                opacity: !text.trim() ? 0.5 : 1,
              }]}
            >
              <Feather name={ttsPreviewing ? "loader" : "play-circle"} size={16} color={!text.trim() ? colors.mutedForeground : "#FF6B35"} />
              <Text style={[styles.ttsPreviewText, { color: !text.trim() ? colors.mutedForeground : "#FF6B35" }]}>
                {ttsPreviewing ? "Generating preview..." : "Preview Voice"}
              </Text>
            </Pressable>
          </View>

          <View style={[styles.hashtagPanelFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.hashtagPanelFooterText, { color: colors.mutedForeground }]}>
              {ttsEnabled ? "TTS will be added to your post" : "TTS is off"}
            </Text>
            <Pressable
              onPress={() => { setTtsEnabled(true); closeTtsPanel(); }}
              style={[styles.doneBtn, { backgroundColor: ttsEnabled ? "#FF6B35" : colors.primary }]}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
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

      {showProductPicker && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={() => setShowProductPicker(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
            <View style={[styles.productPickerSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <View style={styles.panelHeader}>
                <Feather name="shopping-bag" size={20} color={colors.primary} />
                <Text style={[styles.panelTitle, { color: colors.foreground, marginLeft: 8 }]}>Tag a Product</Text>
                <Pressable onPress={() => setShowProductPicker(false)}>
                  <Feather name="x" size={20} color={colors.mutedForeground} />
                </Pressable>
              </View>
              <ScrollView style={{ maxHeight: 500 }}>
                {PRODUCTS.map((prod) => (
                  <Pressable
                    key={prod.id}
                    onPress={() => pickProduct(prod)}
                    style={[styles.productPickerItem, { borderBottomColor: colors.border }]}
                  >
                    <Image source={{ uri: prod.image }} style={styles.productPickerThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.productPickerName, { color: colors.foreground }]}>{prod.name}</Text>
                      <Text style={[styles.productPickerPrice, { color: colors.primary }]}>{prod.price} Coins</Text>
                    </View>
                    <Feather name="plus" size={20} color={colors.primary} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  // Carousel
  carouselGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, marginVertical: 12 },
  carouselThumb: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, overflow: "hidden", position: "relative" },
  carouselThumbImg: { width: 80, height: 80 },
  carouselRemoveBtn: { position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  carouselCoverBadge: { position: "absolute", bottom: 4, left: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  carouselCoverText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" },
  carouselAddBtn: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 4 },
  carouselAddText: { fontSize: 11, fontFamily: "Inter_500Medium" },
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

  // TTS styles
  ttsIndicator: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginHorizontal: 16, marginBottom: 8, alignSelf: "flex-start" },
  ttsIndicatorText: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  ttsToggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  ttsToggleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  ttsToggle: { width: 44, height: 24, borderRadius: 12, justifyContent: "center", paddingHorizontal: 2 },
  ttsToggleKnob: { width: 20, height: 20, borderRadius: 10 },
  ttsSectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  ttsLangBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1 },
  ttsLangText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  ttsVoiceBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1, flex: 1, justifyContent: "center" },
  ttsVoiceText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  ttsPreviewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginTop: 4 },
  ttsPreviewText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  // Product Picker
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  productPickerSheet: { padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1 },
  productPickerItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  productPickerThumb: { width: 50, height: 50, borderRadius: 8 },
  productPickerName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  productPickerPrice: { fontSize: 12, fontFamily: "Inter_700Bold", marginTop: 2 },
});
