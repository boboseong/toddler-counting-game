import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  playDing,
  playHorn,
  playPop,
  playSoft,
  playTap,
  playWhistle,
  prefetchSpeech,
  speak,
  speakDuration,
} from "../lib/audio";
import { P } from "../lib/phrases";
import {
  ANIMALS,
  busLevel,
  counterPhrase,
  countStepMs,
  guestsFrom,
  randomInt,
  randomIntExcept,
  randomPraise,
  shuffle,
  STICKERS,
  type BusKind,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { useRoundGuard } from "../hooks/useRoundGuard";
import { useBox } from "../hooks/useBox";
import { GameFrame, ListenChip, SpeechBubble, TopBar, WinBanner } from "../components/ui";
import type { GameProps } from "../types";
import { Chick } from "../art/Chick";
import { Face } from "../art/Face";
import { Glyph } from "../art/Glyph";
import { LINE, stroke } from "../art/palette";
import type { Mood } from "../art/types";
import { centerOf, fx } from "../fx/bus";
import { useMood } from "../fx/useMood";

/*
 * 딱 맞게 태워요.
 * 버스나 기차가 정류장에 오면, 빈자리만큼 정류장의 친구를 눌러서 고른다.
 * 누를 때마다 "하나, 둘, 셋" 하고 세고 고른 친구는 위로 뜨며 색이 칠해지지만, 자리에는 아직 앉지 않는다
 * (자리가 차는 걸 보고 맞추지 않도록). 출발 버튼을 눌렀을 때 고른 친구 수가 빈자리 수와 같아야
 * 친구들이 한 명씩 자리에 앉고 출발한다. 빈자리가 몇 개인지는 보여 주지도 말하지도 않는다
 * (첫 도움 단계에서만 빈자리와 빈자리만큼의 친구를 노랗게 비춰서 무엇을 누를지 알려 준다).
 * 끝의 단계들은 다른 친구가 먼저 몇 자리에 타 있어서 남은 자리만큼만 태운다.
 */

interface Rider {
  emoji: string;
  name: string;
}

interface Round {
  id: number;
  kind: BusKind;
  /** 차에 있는 자리 전체 (먼저 탄 친구 자리까지) */
  seats: number;
  /** 다른 친구가 먼저 타 있는 자리 (자리 번호) 와 그 친구 */
  taken: number[];
  passengers: Rider[];
  /** 비어 있는 자리 (자리 번호, 앞에서부터). 이만큼 태워야 한다 */
  open: number[];
  /** 정류장에서 기다리는 친구들 (단계마다 정해진 수. 빈자리와 같을 수도 있다) */
  riders: Rider[];
  /** 도움 단계: 빈자리와, 빈자리만큼의 친구(guide)를 노랗게 비춰 준다 */
  help: boolean;
  /** 도움 단계에서 노랗게 비추는 친구 (riders 의 번호, 빈자리 수만큼 아무 자리에서나) */
  guide: number[];
}

/**
 * arrive: 버스가 들어오는 중
 * pick:   친구를 고른다 (안내 말이 끝나야 누를 수 있다)
 * hint:   빈자리를 같이 세는 중
 * board:  딱 맞게 골라서 친구들이 한 명씩 타는 중
 * go:     떠나는 중
 */
type Phase = "arrive" | "pick" | "hint" | "board" | "go";

/** 출발 버튼을 눌렀는데 안 맞았을 때: 친구가 많은지 적은지 (몇 명인지는 말하지 않는다) */
type Feedback = "many" | "few";

/** 정류장에 들어오는 시간 · 떠나는 시간 */
const ARRIVE_MS = 1300;
const DEPART_MS = 1400;
/** 다 탄 뒤 축하 배너가 버스를 가리기 전에 다 탄 모습을 보여 주는 시간 */
const SEATED_LOOK_MS = 1100;
/** 친구 하나가 자리로 날아가는 시간(초) */
const BOARD_FLY_S = 0.45;
/** 아무것도 안 하고 이만큼 지나면 다시 알려 준다 (한 라운드에 MAX_IDLE_HINTS 번까지) */
const IDLE_HINT_MS = 9000;
const MAX_IDLE_HINTS = 2;
/** 출발 버튼을 연달아 눌러도 한 번만 */
const GO_GAP_MS = 600;
/** 안 맞게 출발을 이만큼 누르면 빈자리를 같이 세어 준다 */
const WRONGS_TO_COUNT = 2;

/**
 * 먼저 타 있는 친구: 정류장 친구와 헷갈리지 않게 정류장에 없는 동물 중에서
 * (모으지 않은 스티커 동물도. 엘리베이터 층마다 사는 친구처럼)
 */
function passengerPool(riders: Rider[]): Rider[] {
  const seen = new Set(riders.map((r) => r.name));
  const out: Rider[] = [];
  for (const a of [...ANIMALS, ...STICKERS.filter((st) => st.food)]) {
    if (seen.has(a.name)) continue;
    seen.add(a.name);
    out.push({ emoji: a.emoji, name: a.name });
  }
  return out;
}

/** 정류장에서 기다리는 친구: 동물 친구들 + 모은 스티커 동물 (같은 친구는 한 번만) */
function riderPool(friends: number[]): Rider[] {
  const seen = new Set<string>();
  const out: Rider[] = [];
  for (const a of [...ANIMALS, ...guestsFrom(friends)]) {
    if (seen.has(a.name)) continue;
    seen.add(a.name);
    out.push({ emoji: a.emoji, name: a.name });
  }
  return out;
}

/* ---------- 탈것 그림 ----------
 * 빈자리 수에 맞춰 길이와 줄 수가 바뀐다 (한 줄에 다섯 자리씩, 다섯을 넘으면 두 줄).
 * 그림 단위는 다른 그림(viewBox 100)과 선 굵기·얼굴 크기가 어울리게 잡았다.
 */

/** 자리(창문) 한 칸 · 칸 사이 · 테두리 안쪽 여백 */
const SEAT = 80;
const SEAT_GAP = 14;
const PAD = 20;
const SEAT_COLS = 5;
/** 화면이 넓어도 자리 한 칸은 이만큼(px)까지만 */
const MAX_SEAT_PX = 96;
/** 그림 바깥 여백 (선이 잘리지 않게) */
const M = 4;
const GLASS = "#bfe8ff";
const thin = { ...stroke, strokeWidth: LINE * 0.8 };

interface Spot {
  x: number;
  y: number;
}

interface Shape {
  w: number;
  h: number;
  seats: Spot[];
  body: ReactNode;
}

function seatGrid(n: number, x0: number, y0: number): Spot[] {
  return Array.from({ length: n }, (_, i) => ({
    x: x0 + (i % SEAT_COLS) * (SEAT + SEAT_GAP),
    y: y0 + Math.floor(i / SEAT_COLS) * (SEAT + SEAT_GAP),
  }));
}

function windowsSize(n: number) {
  const cols = Math.min(n, SEAT_COLS);
  const rows = Math.ceil(n / SEAT_COLS);
  return { w: cols * SEAT + (cols - 1) * SEAT_GAP, h: rows * SEAT + (rows - 1) * SEAT_GAP };
}

function Wheel({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#3d3a4a" {...stroke} />
      <circle cx={x} cy={y} r={r * 0.42} fill="#cfd4e0" />
    </g>
  );
}

/** 빈 자리: 창문 너머로 의자가 보인다 */
function SeatArt({ x, y }: Spot) {
  return (
    <g>
      <rect x={x} y={y} width={SEAT} height={SEAT} rx={12} fill={GLASS} {...thin} />
      <rect x={x + 17} y={y + 13} width={SEAT - 34} height={SEAT - 32} rx={10} fill="#ff7a6b" {...thin} />
      <rect x={x + 10} y={y + SEAT - 26} width={SEAT - 20} height={14} rx={7} fill="#e2554a" {...thin} />
    </g>
  );
}

function busShape(n: number, mood: Mood): Shape {
  const FRONT = 84;
  const LOWER = 52;
  const R = 26;
  const win = windowsSize(n);
  const bw = PAD + win.w + PAD + FRONT;
  const bh = PAD + win.h + PAD + LOWER;
  const seats = seatGrid(n, M + PAD, M + PAD);
  const fx0 = M + bw - FRONT;
  const wheelTop = M + bh - R;
  const body = (
    <>
      <rect x={M} y={M} width={bw} height={bh} rx={28} fill="#ffc93c" {...stroke} />
      <path d={`M${M + 2} ${M + bh - 40} H${M + bw - 2}`} stroke="#e8a51c" strokeWidth={12} />
      <circle cx={M + bw - 13} cy={M + bh - 24} r={9} fill="#ffe27a" {...thin} />
      {seats.map((s, i) => (
        <SeatArt key={i} {...s} />
      ))}
      {/* 운전석 창문은 그리지 않는다 (빈 창문이 빈자리처럼 보여 세는 데 헷갈리지 않게) */}
      <Face x={fx0 + FRONT / 2 - 4} y={(M + wheelTop) / 2 - 4} s={1} mood={mood} cheeks={false} />
      <Wheel x={M + 56} y={M + bh} r={R} />
      <Wheel x={M + bw - 50} y={M + bh} r={R} />
    </>
  );
  return { w: bw + M * 2, h: M + bh + R + M, seats, body };
}

function trainShape(n: number, mood: Mood): Shape {
  const TOP = 48; // 굴뚝·연기 자리
  const E = 140; // 기관차 길이
  const CAB = 60;
  const win = windowsSize(n);
  const cw = PAD + win.w + PAD;
  const ch = PAD + win.h + PAD + 30;
  const ground = TOP + ch;
  const x0 = M + cw + 16;
  const cabH = ch + 14;
  const boilerH = Math.round(ch * 0.62);
  const boilerTop = ground - boilerH;
  const seats = seatGrid(n, M + PAD, TOP + PAD);
  const carWheels = cw >= 150 ? [M + 40, M + cw - 40] : [M + cw / 2];
  const body = (
    <>
      {/* 객차 */}
      <rect x={M + cw - 4} y={ground - 34} width={24} height={12} rx={4} fill="#6b6f7a" {...thin} />
      <rect x={M} y={TOP} width={cw} height={ch} rx={22} fill="#5cc98a" {...stroke} />
      <path d={`M${M + 2} ${ground - 18} H${M + cw - 2}`} stroke="#3fa56f" strokeWidth={8} />
      {seats.map((s, i) => (
        <SeatArt key={i} {...s} />
      ))}
      {/* 기관차: 연기 · 굴뚝 · 보일러 · 운전실 */}
      <g fill="#eef1f6" {...thin}>
        <circle cx={x0 + E - 30} cy={boilerTop - 58} r={12} />
        <circle cx={x0 + E - 14} cy={boilerTop - 76} r={9} />
      </g>
      <rect x={x0 + E - 44} y={boilerTop - 36} width={22} height={40} fill="#3d3a4a" {...stroke} />
      <rect x={x0 + E - 50} y={boilerTop - 44} width={34} height={12} rx={4} fill="#ff5a5a" {...thin} />
      <rect x={x0 + CAB - 8} y={boilerTop} width={E - CAB + 8} height={boilerH} rx={Math.min(30, boilerH / 2)} fill="#3f7fe0" {...stroke} />
      <path
        d={`M${x0 + CAB + 22} ${boilerTop + 2} V${ground - 2} M${x0 + CAB + 46} ${boilerTop + 2} V${ground - 2}`}
        stroke="#ffd23f"
        strokeWidth={6}
      />
      <rect x={x0 - 8} y={ground - cabH - 12} width={CAB + 16} height={16} rx={6} fill="#e04848" {...stroke} />
      {/* 운전실 창문은 그리지 않는다 (빈 창문이 빈자리처럼 보여 세는 데 헷갈리지 않게) */}
      <rect x={x0} y={ground - cabH} width={CAB} height={cabH} rx={8} fill="#ff5a5a" {...stroke} />
      <path d={`M${x0 + E - 4} ${ground - 26} L${x0 + E + 22} ${ground + 10} L${x0 + E - 4} ${ground + 10} Z`} fill="#ffd23f" {...stroke} />
      <Face x={x0 + CAB + (E - CAB) / 2 + 6} y={boilerTop + boilerH / 2 - 8} s={0.95} mood={mood} cheeks={false} />
      {carWheels.map((x) => (
        <Wheel key={x} x={x} y={ground} r={22} />
      ))}
      <Wheel x={x0 + 30} y={ground} r={24} />
      <Wheel x={x0 + E - 30} y={ground} r={24} />
      <path d={`M${x0 + 30} ${ground} H${x0 + E - 30}`} stroke="#ff5a5a" strokeWidth={6} strokeLinecap="round" />
    </>
  );
  return { w: x0 + E + 26 + M, h: ground + 24 + M, seats, body };
}

/* ---------- 놀이 ---------- */

export default function BusGame({ level, friends, stars, tapGap, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
  const guard = useRoundGuard(tapGap);
  const prev = useRef<{ seats?: number }>({});
  const levelRef = useRef(level);
  levelRef.current = level;
  const friendsRef = useRef(friends);
  friendsRef.current = friends;

  const newRound = (id: number): Round => {
    const lv = busLevel(levelRef.current);
    // 빈자리가 1~2개뿐일 때 바로 앞과 다른 수만 내면 하나, 둘, 하나, 둘 … 번갈아 나와서 맞힐 수 있으니 그냥 고른다
    const seats =
      lv.max - lv.min >= 2 ? randomIntExcept(lv.min, lv.max, prev.current.seats) : randomInt(lv.min, lv.max);
    prev.current = { seats };
    // 정류장 친구 수는 쏙쏙 나눠 주기의 가진 개수처럼 단계마다 정해져 있다 (동물 친구가 12마리라 늘 모자라지 않다)
    const riders = shuffle(riderPool(friendsRef.current)).slice(0, lv.riders);
    // 먼저 탄 친구는 아무 자리에나 (늘 한 자리는 비어 있게)
    const takenN = randomInt(lv.taken[0], Math.min(lv.taken[1], seats - 1));
    const all = Array.from({ length: seats }, (_, i) => i);
    const taken = shuffle(all).slice(0, takenN).sort((a, b) => a - b);
    const open = all.filter((i) => !taken.includes(i));
    const passengers = shuffle(passengerPool(riders)).slice(0, takenN);
    const guide = lv.help ? shuffle(riders.map((_, i) => i)).slice(0, open.length) : [];
    return {
      id,
      kind: Math.random() < 0.5 ? "bus" : "train",
      seats,
      taken,
      passengers,
      open,
      riders,
      help: lv.help,
      guide,
    };
  };

  const [round, setRound] = useState<Round>(() => newRound(0));
  const [phase, setPhaseState] = useState<Phase>("arrive");
  /** 고른 친구 (고른 순서대로, riders 의 번호) */
  const [picked, setPicked] = useState<number[]>([]);
  /** 자리에 앉은 친구 수 (출발할 때만 앉는다) */
  const [seated, setSeated] = useState(0);
  /** 자리로 날아가는 중이라 정류장에서 비워 둔 친구 */
  const [leaving, setLeaving] = useState<number[]>([]);
  const [drive, setDrive] = useState<"in" | "out">("in");
  const [moving, setMoving] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  /** 빈자리를 같이 셀 때 이만큼 빛난다 */
  const [glow, setGlow] = useState(0);
  /** 한참 가만히 있어서 "다 골랐으면 출발 버튼" 을 알려 준 뒤 버튼이 두근거린다 */
  const [nudge, setNudge] = useState(false);
  const [banner, setBanner] = useState(false);
  const [praise, setPraise] = useState("");

  const roundRef = useRef(round);
  roundRef.current = round;
  const phaseRef = useRef<Phase>("arrive");
  const pickedRef = useRef<number[]>([]);
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  /**
   * 이번 라운드에서 한 번이라도 안 맞게 출발을 눌렀거나 힌트를 받았는지 (처음 한 번만 실패로 알린다).
   * 그 뒤에 맞게 고르면 화면은 똑같이 축하하지만 단계에는 성공으로 치지 않는다.
   */
  const missed = useRef(false);
  const miss = () => {
    if (missed.current) return;
    missed.current = true;
    onResult(false);
  };
  const wrongs = useRef(0);
  const idleHints = useRef(0);
  /** 빈자리를 같이 세어 줬다 (한 라운드에 한 번) */
  const counted = useRef(false);
  const lastGo = useRef(0);
  const idleTimer = useRef<number | null>(null);
  /** 이번에 놀이에 들어와서 이미 한 부탁 (같은 부탁은 판마다 되풀이하지 않는다) */
  const asked = useRef(new Set<string>());

  const { kind, seats, riders } = round;
  /** 태워야 하는 친구 수 (= 빈자리) */
  const need = round.open.length;
  /** 이번 판의 부탁: 먼저 탄 친구가 있으면 "남은 자리만큼 태워 줘!" */
  const askOf = (r: Round) => (r.taken.length > 0 ? P.busAskTaken : P.busAsk);
  const locked = guard.locked;

  const [chickMood, flashChick] = useMood(
    phase === "board" || phase === "go" ? "cheer" : locked ? "talk" : "idle",
  );
  const [busMood, flashBus] = useMood(phase === "go" ? "cheer" : phase === "board" || phase === "arrive" ? "happy" : "idle");

  /* ---------- 가만히 있을 때 다시 알려 주기 ---------- */

  const clearIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = null;
  };

  const scheduleIdle = (lead = 0) => {
    clearIdle();
    if (idleHints.current >= MAX_IDLE_HINTS) return;
    idleTimer.current = window.setTimeout(onIdle, lead + IDLE_HINT_MS);
  };

  /** 처음엔 할 일을 다시 알려 주고, 또 가만히 있으면 빈자리를 같이 센다 */
  function onIdle() {
    idleTimer.current = null;
    if (phaseRef.current !== "pick") return;
    if (guard.lockedRef.current) {
      scheduleIdle();
      return;
    }
    idleHints.current += 1;
    miss();
    // 또 가만히 있으면 빈자리를 같이 센다 (도움 단계는 노란 빛이 있으니 할 일만 다시 알려 준다)
    if (idleHints.current >= MAX_IDLE_HINTS && !counted.current && !roundRef.current.help) {
      countSeats([]);
      return;
    }
    // 아직 아무도 안 골랐으면 부탁을 다시, 골랐으면 "다 골랐으면 출발 버튼을 눌러 줘"
    const line = pickedRef.current.length === 0 ? askOf(roundRef.current) : P.busPressGo;
    if (pickedRef.current.length > 0) setNudge(true);
    const ms = speakDuration(line);
    guard.lock(ms);
    speak(line);
    scheduleIdle(ms);
  }

  /* ---------- 라운드 ---------- */

  // 버스(기차)가 들어와서 선다 → "빵빵! 버스가 왔어요! 빈자리에 딱 맞게 친구를 골라 줘!"
  // 부탁은 놀이에 들어와 처음 한 번만 하고, 다음 판부터는 "빵빵! 버스가 왔어요!" 만 (말풍선 글은 그대로).
  // 먼저 탄 친구가 있는 부탁("남은 자리만큼 태워 줘!")도 그런 판이 처음 나올 때 한 번.
  // (도움 단계도 말은 같고, 대신 빈자리와 태울 친구를 노랗게 비춘다)
  useEffect(() => {
    const arrive = P.busArrive(kind);
    const ask = askOf(round);
    const counts = Array.from({ length: riders.length }, (_, i) => P.count(i + 1));
    prefetchSpeech([
      arrive,
      ask,
      ...counts,
      P.busFit(need),
      P.busGo(kind),
      P.busTooMany,
      P.busTooFew,
      P.busPressGo,
      P.busCountSeats,
      P.busSameFriends,
    ]);
    setDrive("in");
    setMoving(true);
    after(ARRIVE_MS - 400, () => (kind === "bus" ? playHorn() : playWhistle()));
    // 부탁을 할지는 버스가 설 때 정한다 (말하기 전에 놀이를 나가면 다음에 다시 한다)
    guard.lock(ARRIVE_MS + speakDuration(asked.current.has(ask) ? [arrive] : [arrive, ask]));
    after(ARRIVE_MS, () => {
      const intro = asked.current.has(ask) ? [arrive] : [arrive, ask];
      asked.current.add(ask);
      const ms = speakDuration(intro);
      guard.lock(ms);
      setMoving(false);
      setPhase("pick");
      speak(intro, { interrupt: false });
      scheduleIdle(ms);
    });
    return clearIdle;
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextRound = () => {
    clearAll();
    clearIdle();
    pickedRef.current = [];
    missed.current = false;
    wrongs.current = 0;
    idleHints.current = 0;
    counted.current = false;
    guard.resetRound();
    setPicked([]);
    setSeated(0);
    setLeaving([]);
    setFeedback(null);
    setGlow(0);
    setNudge(false);
    setBanner(false);
    setPhase("arrive");
    setRound((r) => newRound(r.id + 1));
  };

  /* ---------- 친구 고르기 ---------- */

  const tapRider = (rid: number, i: number, el: HTMLElement) => {
    if (rid !== roundRef.current.id) return;
    if (phaseRef.current !== "pick") {
      guard.noteIgnored();
      return;
    }
    if (!guard.accept()) return;
    const cur = pickedRef.current;
    const on = !cur.includes(i);
    const next = on ? [...cur, i] : cur.filter((x) => x !== i);
    pickedRef.current = next;
    setPicked(next);
    setFeedback(null);
    setNudge(false);
    fx.haptic(12);
    if (on) {
      playPop(next.length);
      fx.burstAt(el, "sparkle", { count: 5 });
    } else {
      playTap();
    }
    // 고를 때마다 고른 친구 수를 센다 (내려놓으면 남은 수를 다시)
    if (next.length > 0) speak(P.count(next.length), { rate: 0.85, pitch: 1.2 });
    scheduleIdle();
  };

  /** 버스를 누르면 부탁을 다시 들려준다 */
  const tapBus = () => {
    if (phaseRef.current !== "pick" || guard.lockedRef.current) return;
    const ask = askOf(roundRef.current);
    const ms = speakDuration(ask);
    guard.lock(ms);
    flashBus("talk", ms);
    speak(ask);
    scheduleIdle(ms);
  };

  /** 빈자리를 하나씩 빛내며 같이 센다 → "친구도 똑같이 골라 줘!" */
  function countSeats(lead: string[]) {
    counted.current = true;
    miss();
    clearIdle();
    setPhase("hint");
    setGlow(0);
    const r = roundRef.current;
    const intro = [...lead, P.busCountSeats];
    const introMs = speakDuration(intro);
    // "자리가 모자라요!" 를 다 말하면 말풍선도 "빈자리를 같이 세어 봐요" 로
    after(lead.length > 0 ? speakDuration(lead) : 0, () => setFeedback(null));
    // 먼저 탄 친구 자리는 빼고 빈자리만 센다
    const n = r.open.length;
    const step = countStepMs(n);
    const endMs = introMs + n * step + 200;
    const total = endMs + speakDuration(P.busSameFriends);
    guard.lock(total);
    speak(intro);
    for (let k = 0; k < n; k++) {
      after(introMs + k * step, () => {
        setGlow(k + 1);
        playPop(k + 1);
        speak(P.count(k + 1), { rate: 0.85, pitch: 1.2 });
      });
    }
    after(endMs, () => speak(P.busSameFriends, { interrupt: false }));
    after(total, () => {
      if (phaseRef.current !== "hint") return;
      setPhase("pick");
      scheduleIdle();
    });
    after(total + 2500, () => setGlow(0));
  }

  /* ---------- 출발 ---------- */

  /** 딱 맞게 골랐다: 고른 친구가 한 명씩 자리에 앉고 → "딱 맞아요!" → 출발 */
  const board = () => {
    setPhase("board");
    clearIdle();
    setNudge(false);
    playDing();
    const r = roundRef.current;
    const order = pickedRef.current;
    const step = countStepMs(r.open.length);
    order.forEach((ri, k) => {
      after(250 + k * step, () => {
        const from = centerOf(document.querySelector(`[data-bus-rider="${r.id}-${ri}"]`));
        // k 번째로 타는 친구는 k 번째 빈자리로 (먼저 탄 친구 자리는 건너뛴다)
        const seatEl = document.querySelector<HTMLElement>(`[data-bus-seat="${r.id}-${r.open[k]}"]`);
        const seatBox = seatEl?.getBoundingClientRect();
        // 창문 줄 아래(차 몸통 아랫부분)의 그 자리 밑으로 건너간 뒤 창문 안으로 쏙 올라온다.
        // 창문 줄 위로 날아가면 이미 앉은 친구 위를 지나가서 한 자리에 여럿이 탄 것처럼 보인다
        const rowBottom = Math.max(
          0,
          ...Array.from(document.querySelectorAll(`[data-bus-seat^="${r.id}-"]`), (el) => el.getBoundingClientRect().bottom),
        );
        setLeaving((l) => [...l, ri]);
        let done = false;
        const land = () => {
          if (done) return;
          done = true;
          setSeated(k + 1);
          playPop(k + 1);
          fx.haptic(10);
          if (seatEl) fx.burstAt(seatEl, "sparkle", { count: 5 });
          speak(P.count(k + 1), { rate: 0.85, pitch: 1.2 });
        };
        if (!from || !seatBox) {
          land();
          return;
        }
        fx.fly({
          from,
          to: { x: seatBox.left + seatBox.width / 2, y: rowBottom + seatBox.height * 0.5 },
          emoji: r.riders[ri].emoji,
          size: seatBox.width * 0.75,
          arc: 24,
          duration: BOARD_FLY_S,
          // 친구가 버스로 옮겨 타는 것이 곧 "태운다"는 뜻이라 동작 줄이기 설정에서도 곧게 옮겨 간다
          essential: true,
          onArrive: land,
        });
        after(BOARD_FLY_S * 1000 + 500, land);
      });
    });
    const fitAt = 250 + (order.length - 1) * step + BOARD_FLY_S * 1000 + 450;
    after(fitAt, () => {
      const fit = P.busFit(r.open.length);
      speak(fit, { interrupt: false });
      flashBus("cheer", 2400);
      flashChick("cheer", 2400);
      fx.burstAt(document.querySelector("[data-bus-vehicle]"), "stars", { count: 14 });
      fx.haptic([10, 40, 10]);
      setPraise(randomPraise());
      onWin();
      if (!missed.current) onResult(true);
      // 다 탄 버스를 잠깐 보여 준 뒤에 축하 배너 (배너가 버스를 가린다)
      after(SEATED_LOOK_MS, () => setBanner(true));
      const goAt = SEATED_LOOK_MS + Math.max(2200, speakDuration(fit) + 200 - SEATED_LOOK_MS);
      after(goAt, () => {
        setBanner(false);
        setPhase("go");
        setDrive("out");
        setMoving(true);
        if (r.kind === "bus") playHorn();
        else playWhistle();
        speak(P.busGo(r.kind), { interrupt: false });
      });
      after(goAt + DEPART_MS + 300, nextRound);
    });
  };

  const handleGo = () => {
    if (phaseRef.current !== "pick") return;
    if (guard.lockedRef.current) {
      guard.noteIgnored();
      return;
    }
    const now = performance.now();
    if (now - lastGo.current < GO_GAP_MS) return;
    lastGo.current = now;
    clearIdle();
    setNudge(false);
    const n = pickedRef.current.length;
    const r = roundRef.current;
    if (n === 0) {
      const ms = speakDuration(P.busPickFirst);
      guard.lock(ms);
      speak(P.busPickFirst);
      scheduleIdle(ms);
      return;
    }
    if (n === r.open.length) {
      board();
      return;
    }
    // 많으면 "친구가 너무 많아요! 자리가 모자라요!", 적으면 "빈자리가 남았어요!"
    const many = n > r.open.length;
    const line = many ? P.busTooMany : P.busTooFew;
    wrongs.current += 1;
    miss();
    setFeedback(many ? "many" : "few");
    setShakeKey((k) => k + 1);
    playSoft();
    fx.haptic(30);
    flashBus(many ? "surprised" : "hmm", 1800);
    flashChick("hmm", 1800);
    // 두 번 틀리면 빈자리를 같이 센다 (도움 단계는 노란 빛이 있으니 많은지 적은지만 짧게)
    if (!r.help && wrongs.current >= WRONGS_TO_COUNT && !counted.current) {
      countSeats([line]);
      return;
    }
    const ms = speakDuration(line);
    guard.lock(ms);
    speak(line);
    scheduleIdle(ms);
  };

  /* ---------- 화면 ---------- */

  const [colRef, col] = useBox<HTMLDivElement>();
  const [roadRef, road] = useBox<HTMLDivElement>();
  const [standRef, stand] = useBox<HTMLDivElement>();

  const shape = kind === "bus" ? busShape(seats, busMood) : trainShape(seats, busMood);
  // 자리 한 칸이 MAX_SEAT_PX 를 넘지 않게 (빈자리가 적은 버스가 화면을 다 덮지 않도록)
  const k = road.w > 0 ? Math.min((road.w * 0.94) / shape.w, (road.h * 0.82) / shape.h, MAX_SEAT_PX / SEAT) : 0;
  const vw = shape.w * k;
  const vh = shape.h * k;
  const seatPx = SEAT * k;
  const off = road.w / 2 + vw / 2 + 40;

  // 정류장 친구 크기: 한 줄과 두 줄 중 친구가 더 크게 보이는 쪽 (두 줄은 꽤 커질 때만)
  const n = riders.length;
  const gap = 10;
  const sizeFor = (rows: number) => {
    const perRow = Math.ceil(n / rows);
    const byW = (stand.w - (perRow - 1) * gap) / perRow;
    const byH = col.h * (rows === 1 ? 0.15 : 0.095);
    return Math.floor(Math.max(40, Math.min(byW, byH, 96)));
  };
  const riderPx = Math.max(sizeFor(1), sizeFor(2) > sizeFor(1) * 1.15 ? sizeFor(2) : 0);

  const bubble: ReactNode =
    feedback === "many" ? (
      <span className="text-rose-500">친구가 너무 많아요!</span>
    ) : feedback === "few" ? (
      <span className="text-rose-500">빈자리가 남았어요!</span>
    ) : phase === "hint" ? (
      "빈자리를 같이 세어 봐요"
    ) : phase === "board" || phase === "go" ? (
      <span>
        딱 맞아요! <Glyph emoji="🎉" />
      </span>
    ) : (
      "빈자리에 딱 맞게 태워 줘!"
    );

  const hintText =
    phase === "board" ? (
      "친구들이 타요"
    ) : phase === "go" ? (
      <span>
        출발! <Glyph emoji="🎉" />
      </span>
    ) : locked || phase === "arrive" || phase === "hint" ? (
      <ListenChip />
    ) : picked.length === 0 ? (
      round.help ? "노란 친구를 눌러요" : "탈 친구를 눌러요"
    ) : (
      "다 골랐으면 출발!"
    );

  const canGo = phase === "pick" || phase === "hint";
  // 도움 단계: 빈자리와 빈자리만큼의 친구를 노랗게 비추고, 다 고르면 출발 버튼도 노랗게
  const helpOn = round.help && (phase === "arrive" || phase === "pick");
  const goGlow = helpOn && phase === "pick" && picked.length === need;

  return (
    <GameFrame scene="station">
      <TopBar onHome={onHome} stars={stars} title="딱 맞게 태워요" emoji="🚌" />

      <div
        ref={colRef}
        className="relative z-10 flex min-h-0 flex-1 flex-col items-center px-3 pb-3 pt-1 sm:px-4 short:pb-1.5 short:pt-0"
      >
        {/* 병아리 안내 (빈자리가 몇 개인지는 말하지 않는다) */}
        <div className="flex shrink-0 items-center justify-center gap-3 short:gap-2">
          <Chick mood={chickMood} className="text-5xl sm:text-6xl short:text-3xl" />
          <SpeechBubble
            tail="left"
            className="break-keep text-center text-xl sm:text-2xl short:px-4 short:py-1 short:text-base"
          >
            {bubble}
          </SpeechBubble>
        </div>

        {/* 길: 버스·기차가 들어와서 선다 */}
        <div ref={roadRef} className="relative mt-1 min-h-[90px] w-full flex-1 short:min-h-[70px]">
          <div className="absolute inset-x-[-1rem] bottom-0 h-[16%] max-h-10 min-h-4 bg-slate-400/90 shadow-inner">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-4 border-dashed border-white/80" />
          </div>
          {k > 0 ? (
            <motion.div
              key={round.id}
              className="absolute left-1/2 bottom-[7%]"
              style={{ width: vw, height: vh, marginLeft: -vw / 2 }}
              initial={{ x: -off }}
              animate={{ x: drive === "out" ? off : 0 }}
              transition={
                drive === "out"
                  ? { duration: DEPART_MS / 1000, ease: "easeIn" }
                  : { duration: ARRIVE_MS / 1000, ease: "easeOut" }
              }
            >
              <motion.div
                key={shakeKey}
                className="h-full w-full"
                animate={shakeKey > 0 ? { x: [0, -10, 10, -7, 7, 0] } : {}}
                transition={{ duration: 0.45 }}
              >
                <motion.button
                  type="button"
                  data-bus-vehicle
                  onPointerDown={tapBus}
                  aria-label={kind === "bus" ? "버스" : "기차"}
                  className="relative block h-full w-full"
                  animate={moving ? { y: [0, -3, 0] } : { y: 0 }}
                  transition={moving ? { duration: 0.3, repeat: Infinity } : { duration: 0.2 }}
                >
                  <svg viewBox={`0 0 ${shape.w} ${shape.h}`} className="block h-full w-full overflow-visible" aria-hidden>
                    {shape.body}
                  </svg>
                  {/* 자리: 먼저 탄 친구 · 빛나는 빈자리(같이 세기 · 도움 단계) · 태운 친구 */}
                  {shape.seats.map((s, i) => {
                    const takenAt = round.taken.indexOf(i);
                    // 몇 번째 빈자리인지 (먼저 탄 친구 자리면 -1)
                    const openAt = round.open.indexOf(i);
                    const rider =
                      takenAt >= 0
                        ? round.passengers[takenAt]
                        : openAt >= 0 && openAt < seated
                          ? riders[picked[openAt]]
                          : null;
                    const lit = openAt >= 0 && (openAt < glow || helpOn);
                    return (
                      <div
                        key={i}
                        data-bus-seat={`${round.id}-${i}`}
                        className="pointer-events-none absolute overflow-hidden"
                        style={{
                          left: s.x * k,
                          top: s.y * k,
                          width: seatPx,
                          height: seatPx,
                          borderRadius: 12 * k,
                        }}
                      >
                        {lit ? (
                          <motion.div
                            className="absolute inset-0 bg-yellow-300/60"
                            style={{ borderRadius: 12 * k, boxShadow: "inset 0 0 0 4px #facc15" }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: openAt === glow - 1 ? [0.5, 1, 0.5] : 0.8 }}
                            transition={openAt === glow - 1 ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
                          />
                        ) : null}
                        {rider ? (
                          <motion.span
                            className="absolute left-1/2 leading-none"
                            style={{ bottom: -seatPx * 0.16, fontSize: seatPx * 0.88, x: "-50%" }}
                            // 먼저 탄 친구는 처음부터 앉아 있고, 태운 친구는 창문 아래에서 쏙 올라온다
                            initial={takenAt >= 0 ? false : { y: seatPx * 0.4 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          >
                            <Glyph emoji={rider.emoji} mood={phase === "go" ? "cheer" : "happy"} />
                          </motion.span>
                        ) : null}
                      </div>
                    );
                  })}
                </motion.button>
              </motion.div>
            </motion.div>
          ) : null}
        </div>

        {/* 안내 */}
        <div className="flex h-11 shrink-0 items-center text-xl text-slate-500 sm:text-2xl short:h-8 short:text-base">
          {hintText}
        </div>

        {/* 정류장 + 출발 버튼 (세로가 짧은 화면에서는 나란히 놓아 버스 자리를 넓힌다) */}
        <div className="flex w-full max-w-3xl shrink-0 flex-col items-center short:max-w-none short:flex-row short:items-end short:gap-3">
          {/* 정류장: 기다리는 친구들 */}
          <div className="relative mt-3 w-full rounded-[2rem] border-4 border-white bg-amber-50/90 px-3 pb-2 pt-5 shadow-xl short:mt-2 short:min-w-0 short:flex-1 short:rounded-2xl short:pt-3">
            <div className="absolute -top-5 left-3 flex items-center gap-1 rounded-2xl border-4 border-white bg-white px-3 text-lg text-slate-600 shadow short:-top-4 short:px-2 short:text-sm">
              <Glyph emoji="🚌" className="text-xl short:text-base" /> 정류장
            </div>
            {/* 고른 친구가 위로 떠도 이름표에 닿지 않게 */}
            <div style={{ height: Math.round(riderPx * 0.2) }} />
            <div
              ref={standRef}
              className="flex flex-wrap items-end justify-center"
              style={{ gap, rowGap: gap + riderPx * 0.2 }}
            >
              <AnimatePresence>
                {riders.map((r, i) => {
                  const on = picked.includes(i);
                  const gone = leaving.includes(i);
                  const guided = helpOn && !on && round.guide.includes(i);
                  return (
                    <motion.button
                      key={`${round.id}-${i}`}
                      type="button"
                      data-bus-rider={`${round.id}-${i}`}
                      onPointerDown={(e) => tapRider(round.id, i, e.currentTarget)}
                      aria-label={on ? `${r.name} (골랐어요)` : r.name}
                      aria-pressed={on}
                      className="relative flex shrink-0 items-center justify-center"
                      style={{ width: riderPx, height: riderPx }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: on ? 1.08 : 1,
                        opacity: gone ? 0 : 1,
                        y: on && !gone ? -riderPx * 0.2 : 0,
                      }}
                      exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                      transition={{ type: "spring", stiffness: 420, damping: 20, delay: phase === "arrive" ? 0.06 * i : 0 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {/* 도움 단계: 태울 친구 둘레에 노란 빛이 두근두근 (누르라는 뜻) */}
                      {guided ? (
                        <motion.span
                          className="pointer-events-none absolute rounded-full bg-yellow-300"
                          style={{ inset: -riderPx * 0.07 }}
                          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 0.45, 0.9] }}
                          transition={{ duration: 1.1, repeat: Infinity }}
                        />
                      ) : null}
                      {/* 고른 친구는 발판이 노랗게 칠해진다 */}
                      <span
                        className="absolute inset-0 rounded-full border-4 transition-colors duration-200"
                        style={
                          on
                            ? { background: "#fde68a", borderColor: "#f59e0b", boxShadow: "0 0 0 4px rgba(253,230,138,0.7)" }
                            : guided
                              ? { background: "#fef9c3", borderColor: "#facc15" }
                              : { background: "rgba(255,255,255,0.8)", borderColor: "#ffffff" }
                        }
                      />
                      <Glyph
                        emoji={r.emoji}
                        mood={on ? "happy" : phase === "go" ? "happy" : "idle"}
                        className="relative drop-shadow"
                        style={{ fontSize: riderPx * 0.7 }}
                      />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative mt-2 shrink-0 short:mb-1 short:mt-0">
            {/* 도움 단계: 빈자리만큼 다 골랐으면 출발 버튼 둘레에 노란 빛 */}
            {goGlow ? (
              <motion.span
                className="pointer-events-none absolute -inset-2 rounded-full bg-yellow-300"
                animate={{ scale: [1, 1.08, 1], opacity: [0.9, 0.45, 0.9] }}
                transition={{ duration: 1.1, repeat: Infinity }}
              />
            ) : null}
            <motion.button
              type="button"
              animate={(nudge || goGlow) && phase === "pick" ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={nudge || goGlow ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
              whileTap={{ scale: 0.93 }}
              onPointerDown={handleGo}
              disabled={!canGo}
              className={`pressable relative flex items-center gap-2 rounded-full border-4 border-white bg-green-500 px-8 py-2 text-2xl text-white shadow-[0_6px_0_0_rgba(0,0,0,0.15)] transition-opacity sm:text-3xl short:px-5 short:py-1.5 short:text-xl ${
                canGo ? (locked || picked.length === 0 ? "opacity-60" : "") : "invisible"
              }`}
            >
              <Glyph emoji={kind === "bus" ? "🚌" : "🚂"} className="text-[1.1em]" /> 출발!
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {banner ? (
          <WinBanner
            emoji={kind === "bus" ? "🚌" : "🚂"}
            n={need}
            label={`친구 ${counterPhrase(need, "명")}`}
            praise={praise}
          />
        ) : null}
      </AnimatePresence>
    </GameFrame>
  );
}
