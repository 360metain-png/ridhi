import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// ─── Board geometry ────────────────────────────────────────────────────────────
const W = Dimensions.get("window").width;
const BOARD = Math.min(W - 24, 300);
const POCKET_R = 20;
const PIECE_R = 12;
const STRIKER_R = 15;
const RING1_R = 28;
const RING2_R = 54;
const FRICTION = 0.987;
const MAX_SPEED = 15;
const SETTLE_V = 0.18;
const INDICATOR_LEN = 55;

// AI striker starts at top baseline; player at bottom baseline
const P_BASELINE_Y = BOARD - 40;
const AI_BASELINE_Y = 40;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Piece {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  type: "white" | "black" | "queen";
  pocketed: boolean;
}

interface Striker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

type Phase = "aim" | "shooting" | "ai_aim" | "won";

// ─── Initial state helpers ────────────────────────────────────────────────────
function initPieces(): Piece[] {
  const cx = BOARD / 2;
  const cy = BOARD / 2;
  const out: Piece[] = [];

  // Queen in center
  out.push({ id: "q", x: cx, y: cy, vx: 0, vy: 0, r: PIECE_R, type: "queen", pocketed: false });

  // Ring 1 — 6 alternating
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 2 * Math.PI;
    out.push({
      id: `r1_${i}`,
      x: cx + Math.cos(a) * RING1_R,
      y: cy + Math.sin(a) * RING1_R,
      vx: 0, vy: 0, r: PIECE_R,
      type: i % 2 === 0 ? "white" : "black",
      pocketed: false,
    });
  }

  // Ring 2 — 6 alternating, offset 30°
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 2 * Math.PI + Math.PI / 6;
    out.push({
      id: `r2_${i}`,
      x: cx + Math.cos(a) * RING2_R,
      y: cy + Math.sin(a) * RING2_R,
      vx: 0, vy: 0, r: PIECE_R,
      type: i % 2 === 0 ? "black" : "white",
      pocketed: false,
    });
  }

  return out;
}

function initStriker(isAI = false): Striker {
  return {
    x: BOARD / 2,
    y: isAI ? AI_BASELINE_Y : P_BASELINE_Y,
    vx: 0, vy: 0,
    active: false,
  };
}

// ─── Physics helpers ───────────────────────────────────────────────────────────
function collidePieces(a: Piece, b: Piece) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d2 = dx * dx + dy * dy;
  const min = a.r + b.r;
  if (d2 >= min * min) return;
  const dist = Math.sqrt(d2) || 0.001;
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = (min - dist) * 0.5;
  a.x -= nx * overlap; a.y -= ny * overlap;
  b.x += nx * overlap; b.y += ny * overlap;
  const dot = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (dot > 0) return;
  a.vx -= dot * nx; a.vy -= dot * ny;
  b.vx += dot * nx; b.vy += dot * ny;
}

function collideStrikerPiece(s: Striker, p: Piece) {
  const dx = p.x - s.x;
  const dy = p.y - s.y;
  const d2 = dx * dx + dy * dy;
  const min = STRIKER_R + p.r;
  if (d2 >= min * min) return;
  const dist = Math.sqrt(d2) || 0.001;
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = min - dist;
  s.x -= nx * overlap * 0.4; s.y -= ny * overlap * 0.4;
  p.x += nx * overlap * 0.6; p.y += ny * overlap * 0.6;
  const dot = (s.vx - p.vx) * nx + (s.vy - p.vy) * ny;
  if (dot > 0) return;
  const imp = dot * 0.88;
  s.vx -= imp * nx; s.vy -= imp * ny;
  p.vx += imp * nx; p.vy += imp * ny;
}

const CORNERS: [number, number][] = [[0, 0], [BOARD, 0], [0, BOARD], [BOARD, BOARD]];

function stepPiece(p: Piece, scored: { player: number; ai: number }, strikerFellIn: { v: boolean }) {
  if (p.pocketed) return;
  p.x += p.vx; p.y += p.vy;
  p.vx *= FRICTION; p.vy *= FRICTION;
  if (Math.abs(p.vx) < 0.05) p.vx = 0;
  if (Math.abs(p.vy) < 0.05) p.vy = 0;
  // walls
  if (p.x - p.r < 0)     { p.x = p.r;        p.vx =  Math.abs(p.vx); }
  if (p.x + p.r > BOARD) { p.x = BOARD - p.r; p.vx = -Math.abs(p.vx); }
  if (p.y - p.r < 0)     { p.y = p.r;        p.vy =  Math.abs(p.vy); }
  if (p.y + p.r > BOARD) { p.y = BOARD - p.r; p.vy = -Math.abs(p.vy); }
  // pocket check
  for (const [cx, cy] of CORNERS) {
    const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
    if (d < POCKET_R + p.r * 0.3) {
      p.pocketed = true; p.vx = 0; p.vy = 0;
      if (p.type === "white") scored.player++;
      else if (p.type === "black") scored.ai++;
      break;
    }
  }
}

function stepStriker(s: Striker, scored: { player: number; ai: number }, strikerFellIn: { v: boolean }) {
  if (!s.active) return;
  s.x += s.vx; s.y += s.vy;
  s.vx *= FRICTION; s.vy *= FRICTION;
  if (Math.abs(s.vx) < 0.05) s.vx = 0;
  if (Math.abs(s.vy) < 0.05) s.vy = 0;
  // walls
  if (s.x - STRIKER_R < 0)     { s.x = STRIKER_R;        s.vx =  Math.abs(s.vx); }
  if (s.x + STRIKER_R > BOARD) { s.x = BOARD - STRIKER_R; s.vx = -Math.abs(s.vx); }
  if (s.y - STRIKER_R < 0)     { s.y = STRIKER_R;        s.vy =  Math.abs(s.vy); }
  if (s.y + STRIKER_R > BOARD) { s.y = BOARD - STRIKER_R; s.vy = -Math.abs(s.vy); }
  // pocket check
  for (const [cx, cy] of CORNERS) {
    const d = Math.sqrt((s.x - cx) ** 2 + (s.y - cy) ** 2);
    if (d < POCKET_R + STRIKER_R * 0.4) {
      s.active = false; s.vx = 0; s.vy = 0;
      strikerFellIn.v = true;
      break;
    }
  }
}

function isSettled(pieces: Piece[], striker: Striker) {
  const ps = pieces.every(p => p.pocketed || (Math.abs(p.vx) < SETTLE_V && Math.abs(p.vy) < SETTLE_V));
  const ss = !striker.active || (Math.abs(striker.vx) < SETTLE_V && Math.abs(striker.vy) < SETTLE_V);
  return ps && ss;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props { onWin?: (winner: "player" | "ai") => void }

export function CarromGame({ onWin }: Props) {
  const [phase, setPhase] = useState<Phase>("aim");
  const [angle, setAngle] = useState(270); // degrees: 270 = straight up toward AI
  const [power, setPower] = useState(60);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [msg, setMsg] = useState("Aim and strike! ⚪ = You (white)");
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [tick, setTick] = useState(0);

  const piecesRef  = useRef<Piece[]>(initPieces());
  const strikerRef = useRef<Striker>(initStriker(false));
  const scoreRef   = useRef({ player: 0, ai: 0 });
  const phaseRef   = useRef<Phase>("aim");
  const physRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const onWinRef   = useRef(onWin);
  useEffect(() => { onWinRef.current = onWin; }, [onWin]);

  const stopPhysics = useCallback(() => {
    if (physRef.current) { clearInterval(physRef.current); physRef.current = null; }
  }, []);

  const afterSettle = useCallback((strikerFellIn: boolean) => {
    stopPhysics();

    const pieces = piecesRef.current;
    const whiteLeft  = pieces.filter(p => p.type === "white"  && !p.pocketed).length;
    const blackLeft  = pieces.filter(p => p.type === "black"  && !p.pocketed).length;

    if (whiteLeft === 0) {
      setPhase("won"); phaseRef.current = "won";
      setWinner("player");
      onWinRef.current?.("player");
      setMsg("🏆 You Win! All your pieces pocketed!");
      return;
    }
    if (blackLeft === 0) {
      setPhase("won"); phaseRef.current = "won";
      setWinner("ai");
      onWinRef.current?.("ai");
      setMsg("😢 Opponent wins!");
      return;
    }

    if (phaseRef.current === "shooting") {
      // hand to AI
      strikerRef.current = initStriker(true);
      phaseRef.current = "ai_aim";
      setPhase("ai_aim");
      setMsg(strikerFellIn ? "Striker fell in — opponent's turn!" : "Opponent's turn…");
    } else {
      // hand back to player
      strikerRef.current = initStriker(false);
      phaseRef.current = "aim";
      setPhase("aim");
      setMsg(strikerFellIn ? "Striker fell in — your turn!" : "Your turn — aim and strike!");
    }
  }, [stopPhysics]);

  const runPhysics = useCallback(() => {
    const scored = scoreRef.current;
    const strikerFellIn = { v: false };

    const pieces = piecesRef.current;
    const striker = strikerRef.current;

    stepStriker(striker, scored, strikerFellIn);
    for (const p of pieces) stepPiece(p, scored, strikerFellIn);

    // Collisions: striker vs pieces
    for (const p of pieces) if (!p.pocketed) collideStrikerPiece(striker, p);
    // Piece vs piece
    for (let i = 0; i < pieces.length; i++) {
      if (pieces[i].pocketed) continue;
      for (let j = i + 1; j < pieces.length; j++) {
        if (pieces[j].pocketed) continue;
        collidePieces(pieces[i], pieces[j]);
      }
    }

    if (strikerFellIn.v && !striker.active) {
      striker.active = false;
    }

    // Update score display
    setScore({ player: scoreRef.current.player, ai: scoreRef.current.ai });

    // Check settled
    if (isSettled(pieces, striker)) {
      const fell = strikerFellIn.v;
      afterSettle(fell);
    }

    setTick(t => t + 1);
  }, [afterSettle]);

  const startPhysics = useCallback(() => {
    stopPhysics();
    physRef.current = setInterval(runPhysics, 16);
  }, [runPhysics, stopPhysics]);

  // Player strikes
  const strike = useCallback(() => {
    if (phaseRef.current !== "aim") return;
    const rad = (angle * Math.PI) / 180;
    const speed = (power / 100) * MAX_SPEED;
    const s = strikerRef.current;
    s.vx = Math.cos(rad) * speed;
    s.vy = Math.sin(rad) * speed;
    s.active = true;
    phaseRef.current = "shooting";
    setPhase("shooting");
    setMsg("Strike! ⚡");
    startPhysics();
  }, [angle, power, startPhysics]);

  // AI logic
  useEffect(() => {
    if (phase !== "ai_aim") return;
    const timer = setTimeout(() => {
      const pieces = piecesRef.current;
      const targets = pieces.filter(p => !p.pocketed && p.type === "black");
      if (targets.length === 0) return;

      // Pick target: piece nearest to any pocket
      let best = targets[0];
      let bestDist = Infinity;
      for (const p of targets) {
        const d = Math.min(...CORNERS.map(([cx, cy]) => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)));
        if (d < bestDist) { bestDist = d; best = p; }
      }

      const s = strikerRef.current;
      const dx = best.x - s.x;
      const dy = best.y - s.y;
      const aiAngle = (Math.atan2(dy, dx) * 180 / Math.PI) + (Math.random() * 18 - 9);
      const aiPower = 52 + Math.random() * 36;
      const rad = (aiAngle * Math.PI) / 180;
      const speed = (aiPower / 100) * MAX_SPEED;
      s.vx = Math.cos(rad) * speed;
      s.vy = Math.sin(rad) * speed;
      s.active = true;
      phaseRef.current = "shooting";
      setPhase("shooting");
      setMsg("Opponent strikes! 🎯");
      startPhysics();
    }, 1600);
    return () => clearTimeout(timer);
  }, [phase, startPhysics]);

  // Cleanup
  useEffect(() => () => stopPhysics(), [stopPhysics]);

  const reset = useCallback(() => {
    stopPhysics();
    piecesRef.current = initPieces();
    strikerRef.current = initStriker(false);
    scoreRef.current = { player: 0, ai: 0 };
    phaseRef.current = "aim";
    setPhase("aim"); setScore({ player: 0, ai: 0 });
    setWinner(null); setAngle(270); setPower(60);
    setMsg("Aim and strike! ⚪ = You (white)");
    setTick(t => t + 1);
  }, [stopPhysics]);

  // Derived
  const pieces  = piecesRef.current;
  const striker = strikerRef.current;
  const rad     = (angle * Math.PI) / 180;
  const isAiming = phase === "aim";

  // Aim dots (5 dots along direction)
  const aimDots = isAiming
    ? [0.25, 0.42, 0.58, 0.75, 0.92].map(t => ({
        x: striker.x + Math.cos(rad) * INDICATOR_LEN * t,
        y: striker.y + Math.sin(rad) * INDICATOR_LEN * t,
      }))
    : [];

  return (
    <View style={cs.root}>
      {/* Score bar */}
      <View style={cs.scoreBar}>
        <View style={cs.sideScore}>
          <View style={[cs.colorDot, { backgroundColor: "#F5F5F5", borderColor: "#bbb", borderWidth: 1 }]} />
          <Text style={cs.sideLabel}>You  {score.player}</Text>
        </View>
        <Text style={cs.vsLabel}>CARROM</Text>
        <View style={cs.sideScore}>
          <Text style={cs.sideLabel}>{score.ai}  Opp</Text>
          <View style={[cs.colorDot, { backgroundColor: "#212121" }]} />
        </View>
      </View>

      {/* Message bar */}
      <View style={cs.msgBar}>
        <Text style={cs.msgText} numberOfLines={1}>{msg}</Text>
      </View>

      {/* Board */}
      <View style={[cs.board, { width: BOARD, height: BOARD }]}>
        {/* Background */}
        <LinearGradient colors={["#A0522D", "#8B4513"]} style={StyleSheet.absoluteFill} />

        {/* Inner board */}
        <View style={[cs.innerBoard, {
          top: 14, left: 14, right: 14, bottom: 14,
          borderRadius: 4,
        }]} />

        {/* Pockets */}
        {CORNERS.map(([px, py], i) => (
          <View key={`pkt_${i}`} style={[cs.pocket, {
            left: px - POCKET_R, top: py - POCKET_R,
            width: POCKET_R * 2, height: POCKET_R * 2,
            borderRadius: POCKET_R,
          }]} />
        ))}

        {/* Center circles */}
        <View style={[cs.circle, {
          left: BOARD / 2 - 62, top: BOARD / 2 - 62, width: 124, height: 124, borderRadius: 62,
        }]} />
        <View style={[cs.circle, {
          left: BOARD / 2 - 28, top: BOARD / 2 - 28, width: 56, height: 56, borderRadius: 28,
        }]} />

        {/* Baselines */}
        <View style={[cs.baseline, { top: P_BASELINE_Y - 12, left: 28, right: 28 }]} />
        <View style={[cs.baseline, { top: AI_BASELINE_Y + 10, left: 28, right: 28 }]} />

        {/* Aim indicator dots */}
        {aimDots.map((d, i) => (
          <View key={`aim_${i}`} style={[cs.aimDot, {
            left: d.x - 3, top: d.y - 3,
            opacity: 0.35 + i * 0.13,
          }]} />
        ))}

        {/* Pieces */}
        {pieces.filter(p => !p.pocketed).map(p => (
          <View
            key={p.id}
            style={[cs.piece, {
              left: p.x - p.r, top: p.y - p.r,
              width: p.r * 2, height: p.r * 2, borderRadius: p.r,
              backgroundColor:
                p.type === "queen" ? "#E91E8C" :
                p.type === "white" ? "#F5F5F5" : "#212121",
              borderColor:
                p.type === "white" ? "#9E9E9E" :
                p.type === "queen" ? "#C2185B" : "#424242",
            }]}
          />
        ))}

        {/* Striker */}
        <View style={[cs.striker, {
          left: striker.x - STRIKER_R, top: striker.y - STRIKER_R,
          width: STRIKER_R * 2, height: STRIKER_R * 2, borderRadius: STRIKER_R,
          opacity: striker.active || isAiming ? 1 : 0.55,
        }]} />

        {/* Won overlay */}
        {phase === "won" && (
          <View style={cs.wonOverlay}>
            <Text style={cs.wonEmoji}>{winner === "player" ? "🏆" : "😢"}</Text>
            <Text style={cs.wonTitle}>{winner === "player" ? "You Win!" : "Opponent Wins!"}</Text>
            <Pressable onPress={reset} style={cs.playAgainBtn}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={cs.playAgainInner}>
                <Text style={cs.playAgainText}>Play Again</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </View>

      {/* Controls */}
      {isAiming && (
        <View style={cs.controls}>
          <View style={cs.angleRow}>
            <Pressable onPress={() => setAngle(a => (a - 5 + 360) % 360)} style={cs.angleBtn}>
              <Text style={cs.angleBtnTxt}>◀</Text>
            </Pressable>
            <Text style={cs.angleVal}>{angle}°</Text>
            <Pressable onPress={() => setAngle(a => (a + 5) % 360)} style={cs.angleBtn}>
              <Text style={cs.angleBtnTxt}>▶</Text>
            </Pressable>
          </View>

          <View style={cs.powerRow}>
            <Text style={cs.powerLabel}>Power {power}%</Text>
            <View style={cs.powerTrack}>
              <View style={[cs.powerFill, {
                width: (power / 100) * 130,
                backgroundColor: power > 75 ? "#E91E8C" : "#7B2FBE",
              }]} />
            </View>
            <View style={cs.powerBtns}>
              <Pressable onPress={() => setPower(p => Math.max(15, p - 10))} style={cs.pwBtn}>
                <Text style={cs.pwBtnTxt}>−</Text>
              </Pressable>
              <Pressable onPress={() => setPower(p => Math.min(100, p + 10))} style={cs.pwBtn}>
                <Text style={cs.pwBtnTxt}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable onPress={strike}>
            <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={cs.strikeBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={cs.strikeTxt}>⚡  Strike!</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {(phase === "shooting" || phase === "ai_aim") && (
        <View style={cs.waitBox}>
          <Text style={cs.waitTxt}>
            {phase === "shooting" ? "🎱  In play…" : "🤔  Opponent thinking…"}
          </Text>
        </View>
      )}

      {/* Legend */}
      <Text style={cs.legend}>⚪ You = white  ·  ⚫ Opponent = black  ·  🟣 Striker  ·  💗 Queen</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const cs = StyleSheet.create({
  root:       { alignItems: "center", gap: 10 },
  scoreBar:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: BOARD, paddingHorizontal: 6 },
  sideScore:  { flexDirection: "row", alignItems: "center", gap: 6 },
  colorDot:   { width: 14, height: 14, borderRadius: 7 },
  sideLabel:  { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  vsLabel:    { fontSize: 13, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.55)", letterSpacing: 1 },
  msgBar:     { width: BOARD, backgroundColor: "rgba(123,47,190,0.25)", borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(123,47,190,0.4)" },
  msgText:    { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff", textAlign: "center" },
  board:      { borderRadius: 10, overflow: "hidden", position: "relative" },
  innerBoard: { position: "absolute", backgroundColor: "#D2691E", opacity: 0.55 },
  pocket:     { position: "absolute", backgroundColor: "#1a0a00" },
  circle:     { position: "absolute", borderWidth: 1.5, borderColor: "rgba(255,220,150,0.4)", backgroundColor: "transparent" },
  baseline:   { position: "absolute", height: 1, backgroundColor: "rgba(255,220,150,0.3)" },
  aimDot:     { position: "absolute", width: 6, height: 6, borderRadius: 3, backgroundColor: "#E91E8C" },
  piece:      { position: "absolute", borderWidth: 1.5, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  striker:    { position: "absolute", backgroundColor: "#7B2FBE", borderWidth: 2, borderColor: "#E91E8C", shadowColor: "#7B2FBE", shadowOpacity: 0.6, shadowRadius: 5, shadowOffset: { width: 0, height: 0 }, elevation: 6 },
  wonOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 99 },
  wonEmoji:   { fontSize: 52 },
  wonTitle:   { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  playAgainBtn: { marginTop: 4 },
  playAgainInner: { paddingHorizontal: 28, paddingVertical: 11, borderRadius: 14 },
  playAgainText:  { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  controls:   { alignItems: "center", gap: 10, width: BOARD },
  angleRow:   { flexDirection: "row", alignItems: "center", gap: 14 },
  angleBtn:   { backgroundColor: "rgba(123,47,190,0.25)", borderWidth: 1, borderColor: "rgba(123,47,190,0.5)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  angleBtnTxt:{ fontSize: 16, color: "#fff" },
  angleVal:   { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", width: 62, textAlign: "center" },
  powerRow:   { flexDirection: "row", alignItems: "center", gap: 10 },
  powerLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)", width: 72 },
  powerTrack: { width: 130, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
  powerFill:  { height: "100%", borderRadius: 4 },
  powerBtns:  { flexDirection: "row", gap: 6 },
  pwBtn:      { width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(123,47,190,0.3)", borderWidth: 1, borderColor: "rgba(123,47,190,0.5)", alignItems: "center", justifyContent: "center" },
  pwBtnTxt:   { fontSize: 18, color: "#fff", lineHeight: 22 },
  strikeBtn:  { paddingHorizontal: 36, paddingVertical: 12, borderRadius: 16 },
  strikeTxt:  { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  waitBox:    { paddingVertical: 14 },
  waitTxt:    { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.75)" },
  legend:     { fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 8 },
});
