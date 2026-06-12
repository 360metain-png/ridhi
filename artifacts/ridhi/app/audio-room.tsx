import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ScreenCapture from "expo-screen-capture";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { GradientButton } from "@/components/GradientButton";
import { PrivateHead } from "@/components/PrivateHead";
import { useTrackScreen } from "@/hooks/useAnalytics";
const COIN_IMAGE = require("../assets/images/ridhi_coin.png");

const { width: SW } = Dimensions.get("window");

// ─── data ────────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "Music", "Tech", "Cinema", "Business", "Stories", "Spirituality"];

const AUDIO_ROOMS = [
  {
    id: "ar1", title: "Bollywood Hits Discussion", host: "Priya Sharma", hostAvatar: "PS",
    language: "Hindi", listeners: 1284, speakers: 6,
    topic: "Best songs of 2025 so far", joined: false,
    tags: ["Music", "Bollywood"], gradientA: "#7B2FBE", gradientB: "#E91E8C",
    category: "Music",
  },
  {
    id: "ar2", title: "Tech Talk India", host: "Dev Kumar", hostAvatar: "DK",
    language: "English", listeners: 842, speakers: 4,
    topic: "AI startups disrupting India", joined: false,
    tags: ["Tech", "Startups"], gradientA: "#0F4C81", gradientB: "#1976D2",
    category: "Tech",
  },
  {
    id: "ar3", title: "Telugu Cinema Club", host: "Kavya Reddy", hostAvatar: "KR",
    language: "Telugu", listeners: 632, speakers: 5,
    topic: "Tollywood blockbusters review", joined: true,
    tags: ["Cinema", "Telugu"], gradientA: "#B5451B", gradientB: "#FF6F00",
    category: "Cinema",
  },
  {
    id: "ar4", title: "Startup Founders Network", host: "Rahul Verma", hostAvatar: "RV",
    language: "English", listeners: 421, speakers: 3,
    topic: "Fundraising in 2025 India", joined: false,
    tags: ["Business", "Finance"], gradientA: "#1B5E20", gradientB: "#2E7D32",
    category: "Business",
  },
  {
    id: "ar5", title: "Malayalam Kadha Kootam", host: "Meera Pillai", hostAvatar: "MP",
    language: "Malayalam", listeners: 318, speakers: 4,
    topic: "Short stories by listeners", joined: false,
    tags: ["Stories", "Creative"], gradientA: "#4A148C", gradientB: "#880E4F",
    category: "Stories",
  },
  {
    id: "ar6", title: "Morning Bhajan Satsang", host: "Pandit Ji", hostAvatar: "PJ",
    language: "Hindi", listeners: 912, speakers: 2,
    topic: "Devotional music & chanting", joined: false,
    tags: ["Spirituality", "Music"], gradientA: "#E65100", gradientB: "#F9A825",
    category: "Spirituality",
  },
];

const SPEAKERS = [
  { id: "s1", name: "Priya S",  speaking: true,  muted: false, isHost: true  },
  { id: "s2", name: "Rahul M", speaking: false, muted: false, isHost: false },
  { id: "s3", name: "Kavya R", speaking: true,  muted: false, isHost: false },
  { id: "s4", name: "Arjun K", speaking: false, muted: true,  isHost: false },
  { id: "s5", name: "Meera P", speaking: false, muted: false, isHost: false },
  { id: "s6", name: "Dev T",   speaking: false, muted: true,  isHost: false },
];

// ─── animated helpers ─────────────────────────────────────────────────────────

function useLoop(toValue: number, duration: number, delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return anim;
}

// Floating orb — just a blurred circle drifting up
function FloatingOrb({ color, size, x, delay }: { color: string; size: number; x: number; delay: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, { toValue: -200, duration: 4000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.35, duration: 600, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(y, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 80,
        left: x,
        pointerEvents: "none",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ translateY: y }],
        opacity,
      }}
    />
  );
}

// Animated waveform bars
function WaveBar({ delay, color }: { delay: number; color: string }) {
  const h = useRef(new Animated.Value(4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(h, { toValue: 18 + Math.random() * 14, duration: 300 + Math.random() * 200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(h, { toValue: 4, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{ width: 3, height: h, borderRadius: 2, backgroundColor: color, marginHorizontal: 1.5 }} />
  );
}

// Speaker avatar with animated rings when speaking
function SpeakerBubble({ speaker, colors }: { speaker: typeof SPEAKERS[0]; colors: ReturnType<typeof useColors> }) {
  const ring1 = useRef(new Animated.Value(1)).current;
  const ring2 = useRef(new Animated.Value(1)).current;
  const ring1Op = useRef(new Animated.Value(0.6)).current;
  const ring2Op = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!speaker.speaking) return;
    const r1 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ring1, { toValue: 1.55, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ring1Op, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ring1, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(ring1Op, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    const r2 = Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(ring2, { toValue: 1.85, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ring2Op, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(ring2, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(ring2Op, { toValue: 0.4, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    r1.start(); r2.start();
    return () => { r1.stop(); r2.stop(); };
  }, [speaker.speaking]);

  const ringColor = speaker.isHost ? colors.gold : colors.primary;

  return (
    <View style={styles.speakerItem}>
      <View style={{ alignItems: "center", justifyContent: "center", width: 68, height: 68 }}>
        {speaker.speaking && (
          <>
            <Animated.View style={[styles.speakRing, { borderColor: ringColor, transform: [{ scale: ring2 }], opacity: ring2Op }]} />
            <Animated.View style={[styles.speakRing, { borderColor: ringColor, transform: [{ scale: ring1 }], opacity: ring1Op }]} />
          </>
        )}
        <View style={[
          styles.speakerAvatarWrap,
          { backgroundColor: colors.card, borderColor: speaker.speaking ? ringColor : "transparent", borderWidth: speaker.speaking ? 2.5 : 0 },
        ]}>
          <Avatar name={speaker.name} size={52} />
        </View>
        {speaker.muted && (
          <View style={[styles.mutedBadge, { backgroundColor: colors.destructive }]}>
            <Feather name="mic-off" size={9} color="#fff" />
          </View>
        )}
        {speaker.isHost && (
          <View style={[styles.hostBadge, { backgroundColor: colors.gold }]}>
            <Image source={COIN_IMAGE} style={{ width: 9, height: 9 }} resizeMode="contain" />
          </View>
        )}
      </View>
      <Text style={[styles.speakerName, { color: colors.foreground }]} numberOfLines={1}>{speaker.name}</Text>
      {speaker.speaking && (
        <View style={styles.waveBars}>
          {[0, 80, 160, 240, 320].map((d) => (
            <WaveBar key={d} delay={d} color={ringColor} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Room card ────────────────────────────────────────────────────────────────

function RoomCard({ room, onPress, colors }: {
  room: typeof AUDIO_ROOMS[0];
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const livePulse = useLoop(1, 700, Math.random() * 400);

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start(onPress);
  };

  return (
    <Animated.View style={{ transform: [{ scale }], marginHorizontal: 16, marginBottom: 14 }}>
      <Pressable onPress={press}>
        <LinearGradient
          colors={[room.gradientA + "22", room.gradientB + "12", colors.card]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.roomCard, { borderColor: room.gradientA + "40" }]}
        >
          {/* accent bar */}
          <LinearGradient
            colors={[room.gradientA, room.gradientB]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />
          <View style={styles.roomCardInner}>
            {/* top row */}
            <View style={styles.roomCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roomCardTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {room.title}
                </Text>
                <Text style={[styles.roomCardTopic, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {room.topic}
                </Text>
              </View>
              <View style={[styles.langPill, { backgroundColor: room.gradientA + "22", borderColor: room.gradientA + "55" }]}>
                <Text style={[styles.langPillText, { color: room.gradientA }]}>{room.language}</Text>
              </View>
            </View>

            {/* tags */}
            <View style={styles.tagRow}>
              {room.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: room.gradientB + "18" }]}>
                  <Text style={[styles.tagText, { color: room.gradientB }]}>#{tag}</Text>
                </View>
              ))}
              {room.joined && (
                <View style={[styles.tag, { backgroundColor: "#4CAF5022" }]}>
                  <Text style={[styles.tagText, { color: "#4CAF50" }]}>✓ Joined</Text>
                </View>
              )}
            </View>

            {/* footer */}
            <View style={styles.roomCardFooter}>
              <Avatar name={room.hostAvatar} size={22} />
              <Text style={[styles.hostLabel, { color: colors.mutedForeground }]}>{room.host}</Text>
              <View style={{ flex: 1 }} />
              {/* animated live dot */}
              <Animated.View style={[styles.liveDot, { backgroundColor: "#FF4444", transform: [{ scale: livePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }] }]} />
              <View style={styles.metaGroup}>
                <Feather name="mic"        size={11} color={colors.mutedForeground} />
                <Text style={[styles.metaNum, { color: colors.mutedForeground }]}>{room.speakers}</Text>
                <Feather name="headphones" size={11} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
                <Text style={[styles.metaNum, { color: colors.mutedForeground }]}>{room.listeners.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── Live mic button ──────────────────────────────────────────────────────────

function MicButton({ muted, onToggle, colors }: { muted: boolean; onToggle: () => void; colors: ReturnType<typeof useColors> }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!muted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      glow.setValue(0);
    }
  }, [muted]);

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1, useNativeDriver: true, friction: 3 }),
    ]).start(onToggle);
  };

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] });
  const glowScale   = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });

  return (
    <Pressable onPress={press}>
      <Animated.View style={{ alignItems: "center", justifyContent: "center", transform: [{ scale }] }}>
        {!muted && (
          <Animated.View style={[styles.micGlow, { backgroundColor: colors.primary, transform: [{ scale: glowScale }], opacity: glowOpacity }]} />
        )}
        <LinearGradient
          colors={muted ? [colors.card, colors.card] : [colors.secondary, colors.primary]}
          style={styles.micBtn}
        >
          <Feather name={muted ? "mic-off" : "mic"} size={28} color={muted ? colors.mutedForeground : "#fff"} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AudioRoomScreen() {
  useTrackScreen("audio_room");
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { user } = useAuth();
  useEffect(() => {
    if (Platform.OS === "web") return;
    ScreenCapture.preventScreenCaptureAsync("ridhi-audio-room");
    return () => { ScreenCapture.allowScreenCaptureAsync("ridhi-audio-room"); };
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [activeRoom, setActiveRoom]     = useState<typeof AUDIO_ROOMS[0] | null>(null);
  const [muted, setMuted]               = useState(true);
  const [raised, setRaised]             = useState(false);
  const [category, setCategory]         = useState("All");
  const [reaction, setReaction]         = useState<string | null>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportDone, setReportDone]       = useState(false);
  const reactionAnim                    = useRef(new Animated.Value(0)).current;

  // header wave
  const headerWave = useLoop(1, 1200);

  const sendReaction = (emoji: string) => {
    setReaction(emoji);
    reactionAnim.setValue(0);
    Animated.sequence([
      Animated.timing(reactionAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(reactionAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setReaction(null));
  };

  const filtered = category === "All" ? AUDIO_ROOMS : AUDIO_ROOMS.filter((r) => r.category === category);

  // ── inside a room ──────────────────────────────────────────────────────────
  if (activeRoom) {
    const gr = activeRoom;
    return (
      <>
        <PrivateHead />
        <View style={[styles.root, { backgroundColor: "#0A0010" }]}>
        {/* deep gradient backdrop */}
        <LinearGradient
          colors={[gr.gradientA + "55", gr.gradientB + "30", "#0A0010"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* floating orbs */}
        <FloatingOrb color={gr.gradientA} size={80}  x={40}    delay={0}    />
        <FloatingOrb color={gr.gradientB} size={50}  x={SW - 90} delay={1200} />
        <FloatingOrb color={gr.gradientA} size={35}  x={SW / 2 - 17} delay={600} />

        {/* header */}
        <View style={[styles.roomHdr, { paddingTop: topPad + 8 }]}>
          <Pressable onPress={() => setActiveRoom(null)} style={styles.backCircle}>
            <Feather name="chevron-left" size={22} color="#fff" />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <View style={styles.liveChip}>
              <View style={styles.livePulse} />
              <Text style={styles.liveChipText}>LIVE</Text>
            </View>
          </View>
          <View style={styles.backCircle} />
        </View>

        {/* room info */}
        <View style={styles.roomInfo}>
          <Text style={styles.roomBigTitle} numberOfLines={2}>{gr.title}</Text>
          <Text style={styles.roomBigTopic}>{gr.topic}</Text>
          <View style={styles.roomInfoStats}>
            <Feather name="mic"        size={13} color="rgba(255,255,255,0.5)" />
            <Text style={styles.roomInfoStat}>{gr.speakers} speakers</Text>
            <Feather name="headphones" size={13} color="rgba(255,255,255,0.5)" style={{ marginLeft: 10 }} />
            <Text style={styles.roomInfoStat}>{gr.listeners.toLocaleString()} listening</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
          {/* on stage */}
          <Text style={styles.stageLabel}>ON STAGE</Text>
          <View style={styles.speakersGrid}>
            {SPEAKERS.map((sp) => (
              <SpeakerBubble key={sp.id} speaker={sp} colors={colors} />
            ))}
          </View>

          {/* global waveform */}
          <View style={styles.globalWave}>
            {Array.from({ length: 28 }).map((_, i) => (
              <WaveBar key={i} delay={i * 60} color={gr.gradientA + "CC"} />
            ))}
          </View>

          {/* audience */}
          <Text style={styles.stageLabel}>AUDIENCE</Text>
          <View style={styles.audienceGrid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Avatar key={i} name={`User ${i + 1}`} size={38} />
            ))}
            <View style={[styles.audMore, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
              <Text style={styles.audMoreText}>+{gr.listeners - 12}</Text>
            </View>
          </View>
        </ScrollView>

        {/* floating reaction */}
        {reaction && (
          <Animated.Text style={[styles.floatReaction, {
            opacity: reactionAnim,
            transform: [{
              translateY: reactionAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }),
            }],
          }]}>{reaction}</Animated.Text>
        )}

        {/* controls */}
        <LinearGradient
          colors={["transparent", "#0A0010CC", "#0A0010"]}
          style={[styles.controlsWrap, { paddingBottom: insets.bottom + 16 }]}
        >
          {/* quick reactions */}
          <View style={styles.reactRow}>
            {["❤️", "🔥", "👏", "😂", "🤩", "💯", "😍", "🎵"].map((e) => (
              <Pressable key={e} onPress={() => sendReaction(e)} style={styles.reactBtn}>
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.ctrlRow}>
            {/* raise hand */}
            <Pressable
              onPress={() => setRaised((v) => !v)}
              style={[styles.sideCtrlBtn, { borderColor: raised ? "#FFD700" : "rgba(255,255,255,0.15)" }]}
            >
              <Text style={{ fontSize: 22 }}>{raised ? "✋" : "🖐️"}</Text>
              <Text style={[styles.sideCtrlLabel, { color: raised ? "#FFD700" : "rgba(255,255,255,0.6)" }]}>
                {raised ? "Lower" : "Raise"}
              </Text>
            </Pressable>

            {/* mic */}
            <MicButton muted={muted} onToggle={() => setMuted((v) => !v)} colors={colors} />

            {/* report host */}
            <Pressable
              onPress={() => setReportVisible(true)}
              style={[styles.sideCtrlBtn, { borderColor: "rgba(255,59,48,0.25)" }]}
            >
              <Feather name="flag" size={20} color="#FF9500" />
              <Text style={[styles.sideCtrlLabel, { color: "#FF9500" }]}>Report</Text>
            </Pressable>

            {/* leave */}
            <Pressable
              onPress={() => setActiveRoom(null)}
              style={[styles.sideCtrlBtn, { borderColor: "rgba(244,67,54,0.35)" }]}
            >
              <Feather name="phone-off" size={22} color="#F44336" />
              <Text style={[styles.sideCtrlLabel, { color: "#F44336" }]}>Leave</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* ── Complaint against Host Modal ── */}
        <Modal visible={reportVisible} transparent animationType="slide" onRequestClose={() => setReportVisible(false)}>
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}
            onPress={() => setReportVisible(false)}
          >
            <View style={styles.reportSheet}>
              <View style={styles.reportHandle} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(255,149,0,0.18)", alignItems: "center", justifyContent: "center" }}>
                  <Feather name="flag" size={16} color="#FF9500" />
                </View>
                <View>
                  <Text style={styles.reportTitle}>Complaint against Host</Text>
                  <Text style={styles.reportSub}>Audio Room · Confidential</Text>
                </View>
              </View>
              {[
                "Inappropriate or offensive language",
                "Harassment or personal attacks",
                "Abusive moderation",
                "Scam or fraud attempt",
                "Nudity or explicit content",
                "Underage host",
                "Other",
              ].map((reason) => (
                <Pressable
                  key={reason}
                  style={styles.reportItem}
                  onPress={() => {
                    setReportVisible(false);
                    setReportDone(true);
                    setTimeout(() => setReportDone(false), 2500);
                  }}
                >
                  <Text style={styles.reportItemText}>{reason}</Text>
                  <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.4)" />
                </Pressable>
              ))}
              <Pressable
                onPress={() => { setActiveRoom(null); setReportVisible(false); }}
                style={styles.blockBtn}
              >
                <Feather name="slash" size={16} color="#FF3B30" />
                <Text style={styles.blockBtnText}>Leave & Block Host</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* ── Complaint toast ── */}
        {reportDone && (
          <View style={[styles.toast, { pointerEvents: "none" }]}>
            <Feather name="check-circle" size={15} color="#34C759" />
            <Text style={styles.toastText}>Complaint submitted to Ridhi team 🙏</Text>
          </View>
        )}
      </View>
      </>
    );
  }

  // ── rooms list ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* header */}
      <LinearGradient
        colors={[colors.secondary + "30", colors.primary + "18", "transparent"]}
        style={[styles.listHeader, { paddingTop: topPad + 4 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.hdrBack}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.hdrTitle, { color: colors.foreground }]}>Audio Rooms</Text>
          <Text style={[styles.hdrSub, { color: colors.mutedForeground }]}>
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>6</Text> rooms live now
          </Text>
        </View>
        <GradientButton
          label="+ Create"
          small
          onPress={() => {
            const { Alert } = require("react-native");
            Alert.alert("Create Audio Room", "Start a live room for your community.", [
              { text: "Cancel", style: "cancel" },
              { text: "Create 🎤", onPress: () => Alert.alert("Room Live! 🎤", "Your room is now live.", [{ text: "OK" }]) },
            ]);
          }}
        />
      </LinearGradient>

      {/* hero banner */}
      <LinearGradient
        colors={[colors.secondary + "28", colors.primary + "18"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.heroLeft}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>Live Audio Rooms</Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Join conversations in your language
          </Text>
          <View style={styles.heroWave}>
            {Array.from({ length: 18 }).map((_, i) => (
              <WaveBar key={i} delay={i * 70} color={colors.primary} />
            ))}
          </View>
        </View>
        <View style={[styles.heroIcon, { backgroundColor: colors.secondary + "20" }]}>
          <Feather name="headphones" size={36} color={colors.secondary} />
        </View>
      </LinearGradient>

      {/* category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}
      >
        {CATEGORIES.map((cat) => {
          const active = cat === category;
          return (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.catChip,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.catChipText, { color: active ? "#fff" : colors.foreground }]}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}>
        {filtered.map((room) => (
          <RoomCard key={room.id} room={room} onPress={() => setActiveRoom(room)} colors={colors} />
        ))}
        {filtered.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Feather name="headphones" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No rooms in this category</Text>
          </View>
        )}
      </ScrollView>
    </View>

  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // list
  listHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  hdrBack:    { padding: 4 },
  hdrTitle:   { fontSize: 19, fontFamily: "Inter_700Bold" },
  hdrSub:     { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  heroBanner: { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, flexDirection: "row", alignItems: "center", padding: 18 },
  heroLeft:   { flex: 1, gap: 4 },
  heroTitle:  { fontSize: 17, fontFamily: "Inter_700Bold" },
  heroSub:    { fontSize: 12, fontFamily: "Inter_400Regular" },
  heroWave:   { flexDirection: "row", alignItems: "center", marginTop: 8, height: 24 },
  heroIcon:   { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginLeft: 12 },

  catScroll: { paddingHorizontal: 16, paddingBottom: 8, gap: 8, flexDirection: "row" },
  catChip:   { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // room card
  roomCard:     { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  accentBar:    { height: 4 },
  roomCardInner: { padding: 14, gap: 10 },
  roomCardTop:  { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  roomCardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 20 },
  roomCardTopic: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  langPill:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  langPillText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  tagRow:       { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag:          { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  tagText:      { fontSize: 11, fontFamily: "Inter_500Medium" },
  roomCardFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  hostLabel:    { fontSize: 12, fontFamily: "Inter_400Regular" },
  liveDot:      { width: 7, height: 7, borderRadius: 4 },
  metaGroup:    { flexDirection: "row", alignItems: "center", gap: 4 },
  metaNum:      { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 12 },

  // inside room
  roomHdr:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  backCircle:   { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  liveChip:     { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,68,68,0.2)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,68,68,0.35)" },
  livePulse:    { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF4444" },
  liveChipText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#FF4444", letterSpacing: 1.2 },

  roomInfo:     { paddingHorizontal: 20, paddingBottom: 16, gap: 4 },
  roomBigTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 26 },
  roomBigTopic: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)" },
  roomInfoStats: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  roomInfoStat: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)" },

  stageLabel:   { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.2, color: "rgba(255,255,255,0.4)", paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  speakersGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  speakerItem:  { alignItems: "center", gap: 5, width: 72 },
  speakRing:    { position: "absolute", width: 64, height: 64, borderRadius: 32, borderWidth: 2 },
  speakerAvatarWrap: { width: 60, height: 60, borderRadius: 30, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  mutedBadge:   { position: "absolute", bottom: 2, right: 2, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  hostBadge:    { position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  speakerName:  { fontSize: 11, fontFamily: "Inter_500Medium", color: "#fff", textAlign: "center" },
  waveBars:     { flexDirection: "row", alignItems: "center", height: 16 },

  globalWave:   { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20, height: 56 },

  audienceGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 8 },
  audMore:      { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  audMoreText:  { fontSize: 10, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.6)" },

  floatReaction: { position: "absolute", bottom: 180, alignSelf: "center", fontSize: 48 },

  controlsWrap: { position: "absolute", bottom: 0, left: 0, right: 0, paddingTop: 32, paddingHorizontal: 20 },
  reactRow:     { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 16 },
  reactBtn:     { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  ctrlRow:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 8 },
  sideCtrlBtn:  { alignItems: "center", gap: 5, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  sideCtrlLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  micBtn:  { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  micGlow: { position: "absolute", width: 68, height: 68, borderRadius: 34 },

  // ── Complaint sheet ─────────────────────────────────────────────────────
  reportSheet:    { backgroundColor: "#1A1025", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  reportHandle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "center", marginBottom: 16 },
  reportTitle:    { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  reportSub:      { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)", marginTop: 1 },
  reportItem:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.08)" },
  reportItemText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)" },
  blockBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, paddingVertical: 14, borderRadius: 14, backgroundColor: "rgba(255,59,48,0.12)", borderWidth: 1, borderColor: "rgba(255,59,48,0.25)" },
  blockBtnText:   { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FF3B30" },
  toast:          { position: "absolute", bottom: 140, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 24, backgroundColor: "#1C1C2E", elevation: 8 },
  toastText:      { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
