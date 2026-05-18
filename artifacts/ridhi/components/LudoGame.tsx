import React, { useReducer, useEffect, useRef, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Board geometry ───────────────────────────────────────────────────────────
const W = Dimensions.get("window").width;
const BOARD_PX = Math.min(W - 24, 315);
const CELL = BOARD_PX / 15;
const TR = CELL * 0.33; // token radius

// ─── 52-cell shared main path (row, col) ─────────────────────────────────────
const PATH: [number, number][] = [
  [6,1],[6,2],[6,3],[6,4],[6,5],            // 0-4
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],      // 5-10
  [0,7],[0,8],                               // 11-12
  [1,8],[2,8],[3,8],[4,8],[5,8],            // 13-17
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14], // 18-23
  [7,14],[8,14],                             // 24-25
  [8,13],[8,12],[8,11],[8,10],[8,9],[8,8],  // 26-31
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8], // 32-37
  [14,7],[14,6],                             // 38-39
  [13,6],[12,6],[11,6],[10,6],[9,6],        // 40-44
  [8,6],[8,5],[8,4],[8,3],[8,2],[8,1],      // 45-50
  [7,1],                                    // 51
];

// Safe squares (entry points) — pieces here cannot be captured
const SAFE = new Set([0, 13, 26, 39]);

// Player offset on PATH: Red enters at 0, Yellow at 26
const OFFSETS = [0, 26];

// Home-column cells per player (5 steps, after pos 51 → pos 52-56)
const HC: [number, number][][] = [
  [[7,2],[7,3],[7,4],[7,5],[7,6]],           // Red: row 7 going right
  [[7,13],[7,12],[7,11],[7,10],[7,9]],       // Yellow: row 7 going left
];

// Yard display positions per player/token
const YARDS: [number, number][][] = [
  [[1,1],[1,3],[3,1],[3,3]],
  [[11,11],[11,13],[13,11],[13,13]],
];

const DONE = 57;          // token finished
const P_COLOR  = ["#E91E8C", "#FFB800"] as const;
const P_SHADOW = ["#C2185B", "#F57F17"] as const;
const P_NAME   = ["You", "Opponent"] as const;

// ─── Position helpers ─────────────────────────────────────────────────────────

function getRC(player: number, pos: number, tIdx: number): [number, number] {
  if (pos === DONE) return [7, 7];
  if (pos < 0)      return YARDS[player][tIdx];
  if (pos >= 52) {
    const i = pos - 52;
    return i < HC[player].length ? HC[player][i] : [7, 7];
  }
  return PATH[(pos + OFFSETS[player]) % 52];
}

function canMove(pos: number, dice: number): boolean {
  if (pos === DONE) return false;
  if (pos < 0)      return dice === 6;
  return pos + dice <= DONE;
}

function calcNew(pos: number, dice: number): number {
  if (pos < 0) return 0;
  return Math.min(pos + dice, DONE);
}

function validIdxs(tokens: number[], dice: number): number[] {
  return [0,1,2,3].filter(i => canMove(tokens[i], dice));
}

function isSafe(player: number, pos: number): boolean {
  if (pos < 0 || pos >= 52) return true;
  return SAFE.has((pos + OFFSETS[player]) % 52);
}

function findCapture(mover: number, newPos: number, oppTokens: number[]): number {
  if (newPos < 0 || newPos >= 52) return -1;
  const [mr, mc] = getRC(mover, newPos, 0);
  const opp = 1 - mover;
  for (let t = 0; t < 4; t++) {
    const op = oppTokens[t];
    if (op < 0 || op >= 52) continue;
    const [or, oc] = getRC(opp, op, t);
    if (or === mr && oc === mc && !isSafe(opp, op)) return t;
  }
  return -1;
}

// ─── Board cell colour ────────────────────────────────────────────────────────

function cellBg(r: number, c: number): string {
  if (r <= 5 && c <= 5)  return "#F06292";
  if (r <= 5 && c >= 9)  return "#66BB6A";
  if (r >= 9 && c >= 9)  return "#FFD54F";
  if (r >= 9 && c <= 5)  return "#42A5F5";
  if (r === 7 && c === 7) return "#FFFDE7";
  if (r === 7 && c >= 2 && c <= 6)  return "#F48FB1";
  if (c === 7 && r >= 2 && r <= 6)  return "#A5D6A7";
  if (r === 7 && c >= 8 && c <= 13) return "#FFE082";
  if (c === 7 && r >= 8 && r <= 13) return "#90CAF9";
  return "#FAFAFA";
}

// Inner yard square (pieces wait here)
function isInnerYard(r: number, c: number): boolean {
  if (r >= 1 && r <= 4 && c >= 1 && c <= 4)  return true;
  if (r >= 1 && r <= 4 && c >= 10 && c <= 13) return true;
  if (r >= 10 && r <= 13 && c >= 10 && c <= 13) return true;
  if (r >= 10 && r <= 13 && c >= 1 && c <= 4)  return true;
  return false;
}

function innerYardColor(r: number, c: number): string {
  if (r >= 1 && r <= 4 && c >= 1 && c <= 4)   return "#FFFFFF";
  if (r >= 1 && r <= 4 && c >= 10 && c <= 13)  return "#FFFFFF";
  if (r >= 10 && r <= 13 && c >= 10 && c <= 13) return "#FFFFFF";
  if (r >= 10 && r <= 13 && c >= 1 && c <= 4)   return "#FFFFFF";
  return "#FAFAFA";
}

// ─── State machine ────────────────────────────────────────────────────────────

type Phase = "roll" | "select" | "ai_roll" | "ai_move" | "won";

interface GS {
  tokens: [number[], number[]]; // [red×4, yellow×4]
  turn:   0 | 1;
  dice:   number | null;
  valid:  number[];
  phase:  Phase;
  winner: 0 | 1 | null;
  msg:    string;
}

type Action =
  | { type: "USER_ROLL";    dice: number }
  | { type: "USER_MOVE";    tIdx: number }
  | { type: "AI_ROLL";      dice: number }
  | { type: "AI_MOVE";      tIdx: number }
  | { type: "RESET" };

function initState(): GS {
  return {
    tokens: [[-1,-1,-1,-1], [-1,-1,-1,-1]],
    turn: 0, dice: null, valid: [],
    phase: "roll", winner: null,
    msg: "Your turn — tap the dice!",
  };
}

function applyMove(gs: GS, player: 0|1, tIdx: number): GS {
  const dice = gs.dice!;
  const opp  = (1 - player) as 0|1;
  const newTokens: [number[], number[]] = [[...gs.tokens[0]], [...gs.tokens[1]]];

  const oldPos = newTokens[player][tIdx];
  const newPos = calcNew(oldPos, dice);
  newTokens[player][tIdx] = newPos;

  // Capture
  let captured = false;
  if (newPos < 52 && newPos >= 0) {
    const captIdx = findCapture(player, newPos, newTokens[opp]);
    if (captIdx >= 0) {
      newTokens[opp][captIdx] = -1;
      captured = true;
    }
  }

  // Win?
  if (newTokens[player].every(p => p === DONE)) {
    return {
      ...gs, tokens: newTokens,
      phase: "won", winner: player,
      msg: player === 0 ? "🎉 You Won!" : "😢 Opponent Wins!",
    };
  }

  const extra = dice === 6 || captured;
  const next = extra ? player : opp;

  if (next === 0) {
    return {
      ...gs, tokens: newTokens,
      turn: 0, dice: null, valid: [],
      phase: "roll",
      msg: extra
        ? (dice === 6 ? "Rolled 6 — roll again!" : "Captured! Roll again!")
        : "Your turn — tap the dice!",
    };
  } else {
    return {
      ...gs, tokens: newTokens,
      turn: 1, dice: null, valid: [],
      phase: "ai_roll",
      msg: extra ? "Opponent rolls again…" : "Opponent's turn…",
    };
  }
}

function reducer(gs: GS, action: Action): GS {
  switch (action.type) {
    case "USER_ROLL": {
      const v = validIdxs(gs.tokens[0], action.dice);
      if (v.length === 0) {
        return {
          ...gs, dice: action.dice, valid: [],
          turn: 1, phase: "ai_roll",
          msg: `Rolled ${action.dice} — no move. Opponent's turn…`,
        };
      }
      if (v.length === 1) {
        // auto-move sole valid token
        const moved = applyMove({ ...gs, dice: action.dice }, 0, v[0]);
        return moved;
      }
      return {
        ...gs, dice: action.dice, valid: v,
        phase: "select", msg: `Rolled ${action.dice} — pick a token`,
      };
    }
    case "USER_MOVE": {
      if (!gs.valid.includes(action.tIdx)) return gs;
      return applyMove(gs, 0, action.tIdx);
    }
    case "AI_ROLL": {
      const v = validIdxs(gs.tokens[1], action.dice);
      if (v.length === 0) {
        return {
          ...gs, dice: action.dice, valid: [],
          turn: 0, phase: "roll",
          msg: `Opponent rolled ${action.dice} — no move. Your turn!`,
        };
      }
      return { ...gs, dice: action.dice, valid: v, phase: "ai_move",
               msg: `Opponent rolled ${action.dice}…` };
    }
    case "AI_MOVE": {
      return applyMove(gs, 1, action.tIdx);
    }
    case "RESET":
      return initState();
    default:
      return gs;
  }
}

// ─── AI strategy ─────────────────────────────────────────────────────────────

function aiChoose(gs: GS): number {
  const { tokens, dice } = gs;
  const v = gs.valid;
  if (v.length === 0) return -1;

  // 1. Finish a token
  for (const i of v) if (calcNew(tokens[1][i], dice!) === DONE) return i;

  // 2. Capture opponent
  for (const i of v) {
    const np = calcNew(tokens[1][i], dice!);
    if (findCapture(1, np, tokens[0]) >= 0) return i;
  }

  // 3. Exit yard on 6
  if (dice === 6) {
    const yardIdx = v.find(i => tokens[1][i] < 0);
    if (yardIdx !== undefined) return yardIdx;
  }

  // 4. Most advanced token
  return v.reduce((best, i) => tokens[1][i] > tokens[1][best] ? i : best, v[0]);
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props { onWin?: (winner: 0|1) => void }

export function LudoGame({ onWin }: Props) {
  const [gs, dispatch] = useReducer(reducer, undefined, initState);
  const rollAnim  = useRef(new Animated.Value(1)).current;
  const aiTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseDone = useRef(false);

  // User rolls dice
  const rollDice = useCallback(() => {
    if (gs.phase !== "roll") return;
    Animated.sequence([
      Animated.timing(rollAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(rollAnim, { toValue: 0.9, duration: 80,  useNativeDriver: true }),
      Animated.timing(rollAnim, { toValue: 1,   duration: 80,  useNativeDriver: true }),
    ]).start();
    dispatch({ type: "USER_ROLL", dice: Math.ceil(Math.random() * 6) });
  }, [gs.phase, rollAnim]);

  // AI automation
  useEffect(() => {
    if (aiTimer.current) clearTimeout(aiTimer.current);

    if (gs.phase === "ai_roll") {
      aiTimer.current = setTimeout(() => {
        dispatch({ type: "AI_ROLL", dice: Math.ceil(Math.random() * 6) });
      }, 700);
    } else if (gs.phase === "ai_move") {
      const chosen = aiChoose(gs);
      aiTimer.current = setTimeout(() => {
        if (chosen >= 0) dispatch({ type: "AI_MOVE", tIdx: chosen });
      }, 600);
    } else if (gs.phase === "won" && gs.winner !== null && !phaseDone.current) {
      phaseDone.current = true;
      onWin?.(gs.winner);
    }

    return () => { if (aiTimer.current) clearTimeout(aiTimer.current); };
  }, [gs.phase, gs.winner]);

  // Reset phaseDone on new game
  useEffect(() => { phaseDone.current = false; }, [gs.phase === "roll" && gs.dice === null]);

  // ── Board rendering ────────────────────────────────────────────
  const boardCells = () => {
    const out: React.ReactNode[] = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        const base = cellBg(r, c);
        const inner = isInnerYard(r, c);
        out.push(
          <View
            key={`${r},${c}`}
            style={{
              position: "absolute",
              left: c * CELL, top: r * CELL,
              width: CELL, height: CELL,
              backgroundColor: inner ? innerYardColor(r, c) : base,
              borderWidth: 0.4,
              borderColor: "rgba(0,0,0,0.10)",
            }}
          >
            {/* Star on safe squares */}
            {SAFE.has(PATH.findIndex(([pr,pc]) => pr===r && pc===c)) &&
              PATH.findIndex(([pr,pc]) => pr===r && pc===c) !== -1 && (
              <Text style={{ fontSize: CELL * 0.45, lineHeight: CELL, textAlign: "center" }}>⭐</Text>
            )}
          </View>
        );
      }
    }
    return out;
  };

  // ── Token rendering ────────────────────────────────────────────
  const tokenViews = () => {
    // Count tokens per board cell for offset
    const counts: Record<string, number> = {};
    for (let p = 0; p < 2; p++) {
      for (let t = 0; t < 4; t++) {
        const [r, c] = getRC(p, gs.tokens[p][t], t);
        const k = `${r},${c}`;
        counts[k] = (counts[k] || 0) + 1;
      }
    }
    const idx: Record<string, number> = {};
    const OFFSETS4: [number, number][] = [[-TR*0.5,-TR*0.5],[-TR*0.5,TR*0.5],[TR*0.5,-TR*0.5],[TR*0.5,TR*0.5]];

    const out: React.ReactNode[] = [];
    for (let p = 0; p < 2; p++) {
      for (let t = 0; t < 4; t++) {
        const pos = gs.tokens[p][t];
        const [r, c] = getRC(p, pos, t);
        const k = `${r},${c}`;
        const n = counts[k] || 1;
        const i = idx[k] || 0;
        idx[k] = i + 1;
        const [dr, dc] = n > 1 ? OFFSETS4[i % 4] : [0, 0];

        const cx = c * CELL + CELL / 2 + dc;
        const cy = r * CELL + CELL / 2 + dr;

        const isSelectable = p === 0 && gs.phase === "select" && gs.valid.includes(t);
        const isDone = pos === DONE;

        out.push(
          <Pressable
            key={`p${p}t${t}`}
            onPress={() => p === 0 && dispatch({ type: "USER_MOVE", tIdx: t })}
            style={[
              s.token,
              {
                left: cx - TR, top: cy - TR,
                width: TR * 2, height: TR * 2,
                borderRadius: TR,
                backgroundColor: P_COLOR[p],
                borderWidth: isSelectable ? 2 : 1,
                borderColor: isSelectable ? "#fff" : P_SHADOW[p],
                opacity: isDone ? 0.45 : 1,
                transform: [{ scale: isSelectable ? 1.35 : 1 }],
                zIndex: isSelectable ? 20 : 5,
              },
            ]}
          >
            <Text style={[s.tokenLabel, { fontSize: TR * 0.85 }]}>{t + 1}</Text>
          </Pressable>
        );
      }
    }
    return out;
  };

  // Dice face emoji
  const FACES = ["", "⚀","⚁","⚂","⚃","⚄","⚅"];
  const diceEmoji = gs.dice ? FACES[gs.dice] : "🎲";

  const isAiThinking = gs.phase === "ai_roll" || gs.phase === "ai_move";

  return (
    <View style={s.root}>
      {/* Message bar */}
      <View style={[s.msgBar, { backgroundColor: P_COLOR[gs.turn] + "18", borderColor: P_COLOR[gs.turn] + "40" }]}>
        <View style={[s.turnDot, { backgroundColor: P_COLOR[gs.turn] }]} />
        <Text style={[s.msgText, { color: P_COLOR[gs.turn] }]} numberOfLines={1}>
          {gs.msg}
        </Text>
      </View>

      {/* Board */}
      <View style={{ width: BOARD_PX, height: BOARD_PX }}>
        {boardCells()}
        {/* Center star */}
        <View style={[s.centerCell, { left: 7 * CELL, top: 7 * CELL, width: CELL, height: CELL }]}>
          <Text style={{ fontSize: CELL * 0.65 }}>⭐</Text>
        </View>
        {/* Home column arrows hint */}
        <View style={[s.arrowHint, { left: 1 * CELL, top: 7 * CELL, width: 6 * CELL, height: CELL }]}>
          <Text style={{ fontSize: CELL * 0.45, color: "#E91E8C", opacity: 0.5 }}>→→→→→</Text>
        </View>
        <View style={[s.arrowHint, { left: 8 * CELL, top: 7 * CELL, width: 6 * CELL, height: CELL }]}>
          <Text style={{ fontSize: CELL * 0.45, color: "#FFB800", opacity: 0.5 }}>←←←←←</Text>
        </View>
        {/* Tokens */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {tokenViews()}
        </View>
      </View>

      {/* Controls */}
      <View style={s.controls}>
        {/* Scores */}
        <View style={s.scores}>
          {[0,1].map(p => (
            <View key={p} style={[s.scoreRow, { borderColor: P_COLOR[p] + "40" }]}>
              <View style={[s.scoreDot, { backgroundColor: P_COLOR[p] }]} />
              <Text style={[s.scoreVal, { color: P_COLOR[p] }]}>
                {gs.tokens[p].filter(t => t === DONE).length}/4
              </Text>
              <Text style={s.scoreName}>{P_NAME[p]}</Text>
            </View>
          ))}
        </View>

        {/* Dice */}
        <Pressable
          onPress={rollDice}
          disabled={gs.phase !== "roll"}
          style={({ pressed }) => [s.diceBtn, {
            backgroundColor: gs.phase === "roll" ? P_COLOR[0] + "18" : "transparent",
            borderColor: gs.phase === "roll" ? P_COLOR[0] + "60" : "rgba(0,0,0,0.12)",
            opacity: pressed ? 0.7 : 1,
          }]}
        >
          <Animated.Text style={[s.diceFace, { transform: [{ scale: rollAnim }] }]}>
            {isAiThinking ? "⏳" : diceEmoji}
          </Animated.Text>
          <Text style={[s.diceHint, {
            color: gs.phase === "roll" ? P_COLOR[0] : "rgba(0,0,0,0.35)"
          }]}>
            {gs.phase === "roll" ? "Tap to roll" : gs.phase === "select" ? "Pick token" : "Wait…"}
          </Text>
        </Pressable>

        {/* Play again */}
        {gs.phase === "won" && (
          <Pressable
            onPress={() => dispatch({ type: "RESET" })}
            style={[s.playAgainBtn, { backgroundColor: P_COLOR[gs.winner ?? 0] }]}
          >
            <Text style={s.playAgainText}>Play Again</Text>
          </Pressable>
        )}
      </View>

      {/* Legend */}
      <View style={s.legend}>
        <Text style={s.legendText}>⭐ = Safe square · Roll 6 to exit yard · First to bring all 4 home wins</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:        { alignItems: "center", gap: 10 },
  msgBar:      { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, width: BOARD_PX },
  turnDot:     { width: 8, height: 8, borderRadius: 4 },
  msgText:     { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  centerCell:  { position: "absolute", alignItems: "center", justifyContent: "center" },
  arrowHint:   { position: "absolute", alignItems: "center", justifyContent: "center", pointerEvents: "none" },
  token:       { position: "absolute", alignItems: "center", justifyContent: "center",
                 shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  tokenLabel:  { color: "#fff", fontFamily: "Inter_700Bold", lineHeight: undefined },
  controls:    { flexDirection: "row", alignItems: "center", gap: 12, width: BOARD_PX, flexWrap: "wrap" },
  scores:      { flex: 1, gap: 6 },
  scoreRow:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  scoreDot:    { width: 10, height: 10, borderRadius: 5 },
  scoreVal:    { fontSize: 15, fontFamily: "Inter_700Bold" },
  scoreName:   { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(0,0,0,0.55)" },
  diceBtn:     { width: 90, height: 90, borderRadius: 18, borderWidth: 1.5, alignItems: "center", justifyContent: "center", gap: 4 },
  diceFace:    { fontSize: 40 },
  diceHint:    { fontSize: 11, fontFamily: "Inter_500Medium" },
  playAgainBtn:{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  playAgainText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  legend:      { paddingHorizontal: 4 },
  legendText:  { fontSize: 11, color: "rgba(0,0,0,0.4)", textAlign: "center", fontFamily: "Inter_400Regular" },
});
