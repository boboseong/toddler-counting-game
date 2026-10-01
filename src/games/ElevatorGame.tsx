import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  clipMs,
  playDing,
  playPop,
  playSoft,
  playTap,
  playWhoosh,
  prefetchSpeech,
  speak,
  speakDuration,
} from "../lib/audio";
import { P } from "../lib/phrases";
import {
  ELEVATOR_MEMORY,
  ELEVATOR_RUN_FROM,
  NUM_COLORS,
  elevatorLevel,
  randomIntExcept,
  randomPraise,
  residentOf,
  type Resident,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { useRoundGuard } from "../hooks/useRoundGuard";
import { BigNumeral, GameFrame, ListenChip, SpeechBubble, TopBar, WinBanner } from "../components/ui";
import type { GameProps } from "../types";
import { Chick } from "../art/Chick";
import { Glyph } from "../art/Glyph";
import type { Mood } from "../art/types";
import { useMood } from "../fx/useMood";
import { fx } from "../fx/bus";

/* ---------- 라운드 ---------- */

interface Round {
  id: number;
  /** 손님이 사는 층 (가야 할 곳) */
  floor: number;
  rider: Resident;
  /** 외우기: 층을 말하지 않고 "우리 집에 데려다 줘!" */
  memory: boolean;
  /** 라운드 도중에 단계가 바뀌어도 버튼판이 바뀌지 않게 라운드에 묶어 둔다 */
  floors: number;
  glow: boolean;
}

/**
 * board: 1층에서 손님이 타는 중
 * ask:   버튼을 기다린다 (안내 말이 끝나야 누를 수 있다)
 * ride:  움직이며 층을 센다
 * visit: 다른 층에서 문이 열려 그 층 친구가 인사하는 중
 * done:  손님을 집에 데려다 줬다
 */
type Phase = "board" | "ask" | "ride" | "visit" | "done";

/** 문이 열리고 손님이 타기까지 */
const BOARD_MS = 1200;
/** 문이 열리거나 닫히는 시간 */
const DOOR_MS = 650;
/** 손님을 내려 준 뒤 1층으로 내려갈 때 한 층에 걸리는 시간 (세지 않고 빠르게) */
const DESCEND_STEP_MS = 110;
/** 한참 안 누르면 손님이 다시 말한다 */
const IDLE_MS = 9000;

/** 층을 지날 때 한 층에 걸리는 시간: 세는 말(일, 이, 삼 …) 길이에 맞춘다 */
function stepMs(floor: number): number {
  const ms = clipMs(P.elevatorCount(floor));
  if (ms === 0) return 450; // 음성을 껐으면 표시판만 빠르게
  if (ms === null) return 750; // 브라우저 TTS
  return Math.max(420, ms + 60);
}

/** from 층에서 to 층까지 지나는 층 (양 끝 포함) */
function floorsBetween(from: number, to: number): number[] {
  const step = to > from ? 1 : -1;
  const out: number[] = [];
  for (let f = from; f !== to + step; f += step) out.push(f);
  return out;
}

/** 한 번에 말하는 한 토막: 이어 세는 음성이면 여러 층, 아니면 한 층 */
interface CountPart {
  floors: number[];
  text: string;
  ms: number;
}

/**
 * from 층에서 to 층까지 가며 셀 말.
 * 10층 이상으로 올라갈 때는 이어 세는 음성으로 빠르게: 1층에서 출발하면 "일 이 … 십" 을 한 번에,
 * 11층부터는 "십일 십이 … (도착 층)" 을 한 번에. 나머지(내려갈 때 · 낮은 층)는 한 낱말씩 천천히.
 * 이어 세는 음성이 없으면(음성을 껐거나 파일이 없으면) 한 낱말씩
 */
function countParts(from: number, to: number): CountPart[] {
  const path = floorsBetween(from, to);
  const fast = to > from && to >= ELEVATOR_RUN_FROM;
  const parts: CountPart[] = [];
  for (let i = 0; i < path.length; ) {
    const f = path[i];
    const end = fast && f === 1 ? 10 : fast && f === 11 ? to : f;
    const text = P.elevatorCountRun(f, end);
    const ms = end > f ? clipMs(text) : null;
    if (end > f && ms) {
      parts.push({ floors: path.slice(i, i + end - f + 1), text, ms });
      i += end - f + 1;
    } else {
      parts.push({ floors: [f], text: P.elevatorCount(f), ms: stepMs(f) });
      i += 1;
    }
  }
  return parts;
}

function hallColor(floor: number) {
  return NUM_COLORS[(floor - 1) % NUM_COLORS.length];
}

/* ---------- 크기 ---------- */

function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

/** 버튼판은 10층씩 한 묶음 (1~10층, 11~20층) */
const BANK = 10;
/** 10층을 세로 한 줄로 놓았을 때 버튼이 이보다 작아지면 다섯 층씩 두 줄로 나눈다 */
const MIN_TALL_BUTTON = 44;

/**
 * 버튼판 모양: 단계가 올라가도 버튼 자리가 바뀌지 않게 늘 10층씩 묶어서 놓는다.
 * 진짜 엘리베이터처럼 1층이 맨 아래이고, 1~10층이 왼쪽에 세로 한 줄로 선다.
 * 10층이 넘는 단계에서는 그 오른쪽에 11~20층 줄이 붙는다 (11층이 1층 옆, 20층이 10층 옆).
 * 아직 못 가는 층(5층 단계의 6~10층, 15층 단계의 16~20층)도 음영으로 보여 둔다.
 * 세로가 짧은 화면에서는 한 묶음을 다섯 층씩 두 줄로 나눈다 (1~5 | 6~10).
 * 나눌지는 화면 높이로만 정하므로 같은 화면에서는 단계가 바뀌어도 1~10층 자리가 그대로다.
 */
function panelLayout(floors: number, w: number, h: number) {
  const pad = Math.round(Math.max(8, Math.min(16, h * 0.03)));
  const gapK = 0.16;
  const byH = (rows: number) => (h - pad * 2) / (rows + (rows - 1) * gapK);
  const split = byH(BANK) < MIN_TALL_BUTTON ? 2 : 1;
  const rows = BANK / split;
  const banks = Math.ceil(floors / BANK);
  const cols = banks * split;
  // 묶음 사이는 조금 더 띄운다
  const bankK = gapK * 2;
  const byW = (w * 0.45 - pad * 2) / (cols + (banks * (split - 1)) * gapK + (banks - 1) * bankK);
  const b = Math.max(30, Math.floor(Math.min(byH(rows), byW, 96)));
  const gap = Math.round(b * gapK);
  const bankGap = Math.round(b * bankK);
  const width = cols * b + banks * (split - 1) * gap + (banks - 1) * bankGap + pad * 2;
  return { banks, split, rows, b, gap, bankGap, pad, width };
}

/** 한 묶음의 버튼들을 위 줄부터 (맨 아랫줄 왼쪽이 그 묶음의 첫 층) */
function bankCells(bank: number, split: number, rows: number): number[] {
  const out: number[] = [];
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < split; c++) out.push(bank * BANK + c * rows + r + 1);
  }
  return out;
}

/* ---------- 그림 ---------- */

/** 문 너머 복도: 층 표시와 그 층에 사는 친구네 문 */
function Hall({ floor, w, h, children }: { floor: number; w: number; h: number; children?: ReactNode }) {
  const c = hallColor(floor);
  const res = residentOf(floor);
  const doorW = w * 0.4;
  return (
    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #ffffff 10%, ${c}55), #ffffff` }}>
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: h * 0.12, background: `${c}99`, borderTop: "3px solid rgba(0,0,0,0.08)" }}
      />
      <div
        className="absolute left-1/2 flex -translate-x-1/2 items-baseline rounded-2xl bg-white/90 px-2 py-0.5 shadow"
        style={{ top: h * 0.05, fontSize: Math.min(w * 0.2, h * 0.09) }}
      >
        <BigNumeral n={floor} />
        <span className="ml-0.5 text-slate-600" style={{ fontSize: "0.6em" }}>
          층
        </span>
      </div>
      {/* 이 층에 사는 친구네 문 (문패에 친구 얼굴) */}
      <div
        className="absolute rounded-t-[45%] border-[3px] border-black/20"
        style={{
          right: w * 0.07,
          bottom: h * 0.12,
          width: doorW,
          height: Math.min(h * 0.5, doorW * 1.9),
          background: `linear-gradient(90deg, ${c}, ${c}cc)`,
        }}
      >
        <div
          className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border-2 border-black/10 bg-white/95"
          style={{ top: doorW * 0.18, width: doorW * 0.56, height: doorW * 0.56 }}
        >
          <Glyph emoji={res.emoji} style={{ fontSize: doorW * 0.36 }} />
        </div>
        <span
          className="absolute rounded-full border-2 border-black/20 bg-amber-300"
          style={{ left: doorW * 0.12, top: "62%", width: doorW * 0.13, height: doorW * 0.13 }}
        />
      </div>
      {children}
    </div>
  );
}

/** 층 표시판: ▲▼ + 숫자 */
function Indicator({ floor, dir, size }: { floor: number; dir: "up" | "down" | null; size: number }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-xl border-[3px] border-slate-500 bg-slate-800 px-3 shadow-inner"
      style={{ height: size, fontSize: size * 0.72 }}
    >
      <motion.svg
        viewBox="0 0 10 10"
        style={{ width: size * 0.42, height: size * 0.42 }}
        animate={dir ? { opacity: [1, 0.25, 1] } : { opacity: 0.25 }}
        transition={dir ? { duration: 0.7, repeat: Infinity } : undefined}
        aria-hidden
      >
        <path d={dir === "down" ? "M1 2 H9 L5 9 Z" : "M1 8 H9 L5 1 Z"} fill="#fbbf24" />
      </motion.svg>
      <span
        className="min-w-[1.2em] text-center font-bold leading-none tabular-nums"
        style={{ color: "#fbbf24", textShadow: "0 0 8px #f59e0b" }}
      >
        {floor}
      </span>
    </div>
  );
}

/**
 * 층 버튼 하나. 누르면 파랗게 불이 들어오고, 도움이 필요하면 노란 빛이 비친다.
 * off: 이 단계에서는 아직 못 가는 층. 판에 움푹 들어간 음영 버튼으로 보이고 눌리지 않는다
 */
function FloorButton({
  floor,
  size,
  lit,
  glow,
  dim,
  off,
  onPress,
}: {
  floor: number;
  size: number;
  lit: boolean;
  glow: boolean;
  dim: boolean;
  off: boolean;
  onPress: () => void;
}) {
  const fontSize = size * (floor >= 10 ? 0.42 : 0.52);
  if (off) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${floor}층 (아직 못 가요)`}
        className="flex items-center justify-center rounded-full border-[3px] font-bold leading-none"
        style={{
          width: size,
          height: size,
          fontSize,
          background: "rgba(71, 85, 105, 0.22)",
          borderColor: "rgba(100, 116, 139, 0.3)",
          color: "rgba(51, 65, 85, 0.32)",
          boxShadow: "inset 0 2px 5px rgba(0,0,0,0.18)",
        }}
      >
        {floor}
      </button>
    );
  }
  const face: CSSProperties = lit
    ? {
        background: "radial-gradient(circle at 35% 30%, #f0f9ff, #7dd3fc)",
        borderColor: "#0ea5e9",
        color: "#075985",
        boxShadow: "0 0 14px #38bdf8, 0 3px 0 rgba(0,0,0,0.15)",
      }
    : glow
      ? {
          background: "radial-gradient(circle at 35% 30%, #fffbeb, #fde047)",
          borderColor: "#eab308",
          color: "#854d0e",
          boxShadow: "0 3px 0 rgba(0,0,0,0.15)",
        }
      : {
          background: "radial-gradient(circle at 35% 30%, #ffffff, #e2e8f0 60%, #cbd5e1)",
          borderColor: "#94a3b8",
          color: "#334155",
          boxShadow: "0 3px 0 rgba(0,0,0,0.18)",
        };
  return (
    <motion.button
      whileTap={{ scale: 0.86 }}
      onPointerDown={onPress}
      aria-label={`${floor}층`}
      className="relative flex items-center justify-center rounded-full transition-opacity"
      style={{ width: size, height: size, opacity: dim && !lit ? 0.7 : 1 }}
    >
      {glow && !lit ? (
        <motion.span
          className="pointer-events-none absolute rounded-full bg-yellow-300"
          style={{ inset: -size * 0.16 }}
          animate={{ scale: [1, 1.16, 1], opacity: [0.9, 0.45, 0.9] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      ) : null}
      <span
        className="relative flex h-full w-full items-center justify-center rounded-full border-[3px] font-bold leading-none"
        style={{ ...face, fontSize }}
      >
        {floor}
      </span>
    </motion.button>
  );
}

/* ---------- 놀이 ---------- */

export default function ElevatorGame({ level, stars, tapGap, rides, onRide, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
  const guard = useRoundGuard(tapGap);
  const prev = useRef<{ floor?: number; memory?: boolean }>({});
  const levelRef = useRef(level);
  levelRef.current = level;
  const ridesRef = useRef(rides);
  ridesRef.current = rides;
  const idleTimer = useRef<number | null>(null);

  const newRound = (id: number): Round => {
    const lv = elevatorLevel(levelRef.current);
    const floor = randomIntExcept(2, lv.floors, prev.current.floor);
    // 여러 번 데려다 준 친구는 가끔 층을 말하지 않는다 (두 번 연달아는 안 함)
    const known = (ridesRef.current[floor] ?? 0) >= ELEVATOR_MEMORY.known;
    const memory = !lv.glow && known && !prev.current.memory && Math.random() < ELEVATOR_MEMORY.chance;
    prev.current = { floor, memory };
    return { id, floor, rider: residentOf(floor), memory, floors: lv.floors, glow: lv.glow };
  };

  const [round, setRound] = useState<Round>(() => newRound(0));
  const [phase, setPhaseState] = useState<Phase>("board");
  /** 엘리베이터가 있는 층 (표시판 숫자) */
  const [at, setAtState] = useState(1);
  const [dir, setDir] = useState<"up" | "down" | null>(null);
  const [open, setOpenState] = useState(true);
  /** 손님이 엘리베이터 안에 있다 (false 면 문 밖 복도에 있다) */
  const [riderIn, setRiderIn] = useState(false);
  const [lit, setLit] = useState<number | null>(null);
  /** 잘못 온 층에서 인사한 친구 (그 층에 있는 동안 문이 닫힐 때까지 보인다) */
  const [greeter, setGreeter] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [revealed, setRevealedState] = useState(false);
  const [banner, setBanner] = useState(false);
  const [praise, setPraise] = useState("");

  const roundRef = useRef(round);
  roundRef.current = round;
  const phaseRef = useRef<Phase>("board");
  const atRef = useRef(1);
  const openRef = useRef(true);
  const revealedRef = useRef(false);
  const wrongs = useRef(0);
  const idleStage = useRef(0);
  /** 이번 라운드를 실패로 알렸는지 (처음 한 번만 알린다) */
  const missed = useRef(false);
  const doorRef = useRef<HTMLDivElement>(null);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  /** 어려워했다: 라운드마다 처음 한 번만 실패로 알린다 */
  const miss = () => {
    if (missed.current) return;
    missed.current = true;
    onResult(false);
  };
  const setAt = (f: number) => {
    atRef.current = f;
    setAtState(f);
  };
  const setOpen = (v: boolean) => {
    openRef.current = v;
    setOpenState(v);
  };
  const setRevealed = (v: boolean) => {
    revealedRef.current = v;
    setRevealedState(v);
  };

  const [chickMood, flashChick] = useMood(guard.locked || phase === "ride" ? "talk" : "idle");
  const riderBase: Mood = phase === "done" ? "cheer" : phase === "ride" ? "happy" : "idle";
  const [riderMood, flashRider] = useMood(riderBase);

  /** 손님이 다시 부탁하는 말: 외우기 문제는 층을 알려 주기 전까지 "우리 집에 데려다 줘!" */
  const askLine = (r: Round) => (r.memory && !revealedRef.current ? P.elevatorAskHome : P.elevatorAsk(r.floor));

  /** 손님(동물 목소리)이 말한다 */
  const riderSays = (lines: string | string[], interrupt = false) => {
    speak(lines, { interrupt, pitch: 1.3 });
  };

  const clearIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = null;
  };

  /** 한참 안 누르면: 처음엔 손님이 다시 말하고(외우기면 층을 알려 주고), 또 가만히 있으면 노란 빛으로 */
  const onIdle = () => {
    if (phaseRef.current !== "ask") return;
    const r = roundRef.current;
    idleStage.current += 1;
    if (r.memory) setRevealed(true);
    if (idleStage.current >= 2) setHint(true);
    // 다시 부탁하거나 노란 빛으로 알려 주면 어려워한 것.
    // 외우기 문제에서 층만 알려 주는 건 틀렸을 때처럼 실패로 치지 않는다 (노란 빛은 실패)
    if (!r.memory || idleStage.current >= 2) miss();
    const line = r.memory ? P.elevatorHomeIs(r.floor) : P.elevatorAsk(r.floor);
    const ms = speakDuration(line);
    guard.lock(ms);
    flashRider("talk", ms);
    riderSays(line, true);
    if (idleStage.current < 2) scheduleIdle(ms);
  };

  const scheduleIdle = (lead = 0) => {
    clearIdle();
    idleTimer.current = window.setTimeout(onIdle, lead + IDLE_MS);
  };

  /* 1층에서 문이 열리고 손님이 타서 부탁한다 */
  useEffect(() => {
    const r = round;
    const board = P.elevatorBoard(r.rider.name);
    const ask = askLine(r);
    const counts = Array.from({ length: r.floors }, (_, i) => P.elevatorCount(i + 1));
    const runs = countParts(1, r.floor).flatMap((p) => (p.floors.length > 1 ? [p.text] : []));
    prefetchSpeech([board, ask, ...runs, ...counts, P.elevatorArrive(r.floor), P.elevatorThanks, P.elevatorHomeIs(r.floor)]);
    const talkMs = speakDuration([board, ask]);
    guard.lock(BOARD_MS + talkMs);
    setOpen(true);
    after(450, () => {
      setRiderIn(true);
      playPop(2);
    });
    after(BOARD_MS, () => {
      setPhase("ask");
      speak(board, { interrupt: false });
      riderSays(ask);
    });
    after(BOARD_MS + speakDuration(board), () => flashRider("talk", speakDuration(ask)));
    after(BOARD_MS + 900, () => setOpen(false));
    scheduleIdle(BOARD_MS + talkMs);
    return clearIdle;
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetRoundState = () => {
    wrongs.current = 0;
    idleStage.current = 0;
    missed.current = false;
    guard.resetRound();
    setHint(false);
    setRevealed(false);
    setBanner(false);
    setLit(null);
    setGreeter(null);
    setRiderIn(false);
    setPhase("board");
  };

  /** 손님을 내려 준 뒤: 문을 닫고 1층으로 슝 내려가서 다음 손님을 태운다 */
  const nextRound = () => {
    clearAll();
    clearIdle();
    setBanner(false);
    setOpen(false);
    let t = DOOR_MS;
    after(t, () => {
      setDir("down");
      playWhoosh();
    });
    for (let f = atRef.current - 1; f >= 1; f--) {
      t += DESCEND_STEP_MS;
      after(t, () => setAt(f));
    }
    after(t + 250, () => {
      setDir(null);
      resetRoundState();
      setRound((r) => newRound(r.id + 1));
    });
  };

  /** 손님네 층에 도착 */
  const arriveHome = () => {
    const r = round;
    setPhase("done");
    const p = randomPraise();
    setPraise(p);
    const arrive = P.elevatorArrive(r.floor);
    speak(arrive, { interrupt: false });
    after(DOOR_MS * 0.7, () => {
      setRiderIn(false);
      fx.burstAt(doorRef.current, "stars", { count: 14 });
      fx.haptic([10, 40, 10]);
    });
    const thanksAt = Math.max(1000, speakDuration(arrive));
    after(thanksAt, () => {
      flashRider("cheer", 3000);
      riderSays(P.elevatorThanks);
      speak(p, { interrupt: false, pitch: 1.25 });
      flashChick("cheer", 3600);
      setBanner(true);
      // 틀리거나 힌트를 받은 뒤 데려다 줬으면 화면은 똑같이 축하하지만 단계에는 성공으로 치지 않는다
      if (wrongs.current === 0 && idleStage.current === 0) onResult(true);
      onRide(r.floor);
      onWin();
    });
    after(thanksAt + 3800, nextRound);
  };

  /** 다른 층에 도착: 그 층 친구가 인사하고, 손님이 "여기가 아니에요!" */
  const visit = (floor: number) => {
    const r = round;
    setPhase("visit");
    setGreeter(floor);
    wrongs.current += 1;
    // 외우기 문제는 기억이 안 나서 틀린 것이니 어려워한 것으로 치지 않는다 (노란 빛으로 알려 주면 실패)
    if (!r.memory) miss();
    if (wrongs.current >= 2) {
      setHint(true);
      miss();
    }
    if (r.memory) setRevealed(true);
    playSoft();
    const hello = P.elevatorVisit(floor, residentOf(floor).name);
    const again = [P.elevatorNotHere, r.memory ? P.elevatorHomeIs(r.floor) : P.elevatorAsk(r.floor)];
    const helloMs = speakDuration(hello);
    const allMs = helloMs + speakDuration(again);
    guard.lock(allMs);
    speak(hello, { interrupt: false });
    riderSays(again);
    after(helloMs, () => flashRider("hmm", speakDuration(again)));
    // 다 말하면 문이 닫히고 다시 누를 수 있다
    after(allMs, () => {
      if (phaseRef.current !== "visit") return;
      setOpen(false);
      setPhase("ask");
    });
    scheduleIdle(allMs);
  };

  const arrive = (floor: number) => {
    setDir(null);
    setLit(null);
    playDing();
    setOpen(true);
    if (floor === round.floor) arriveHome();
    else visit(floor);
  };

  /** 누른 층으로 간다. 지나는 층마다 "일, 이, 삼 …" 하고 센다 */
  const ride = (to: number) => {
    const from = atRef.current;
    setPhase("ride");
    let t = 0;
    if (openRef.current) {
      setOpen(false);
      t += DOOR_MS;
    }
    if (from === to) {
      // 지금 층을 눌렀으면 문만 다시 열린다
      after(t + 300, () => arrive(to));
      return;
    }
    after(t, () => setDir(to > from ? "up" : "down"));
    for (const part of countParts(from, to)) {
      const start = t;
      after(start, () => speak(part.text, { interrupt: false, rate: 0.95 }));
      // 이어 세는 음성은 낱말 길이가 고르므로(한 글자씩 · 두 글자씩) 같은 간격으로 표시판을 바꾼다.
      // 마지막 낱말은 뒤에 쉼이 없어 짧으므로 반 칸으로 친다 (실제 음성과 0.15초 안쪽으로 맞았다)
      const n = part.floors.length;
      const lead = n > 1 ? 90 : 0;
      const gap = n > 1 ? (part.ms - 90 - 120) / (n - 0.5) : 0;
      part.floors.forEach((f, k) =>
        after(start + lead + gap * k, () => {
          setAt(f);
          if (f !== from) fx.haptic(6);
        }),
      );
      t += part.ms + (n > 1 ? 60 : 0);
    }
    after(t, () => arrive(to));
  };

  const press = (rid: number, floor: number) => {
    if (rid !== roundRef.current.id) return;
    if (phaseRef.current !== "ask") {
      guard.noteIgnored();
      return;
    }
    if (!guard.accept()) return;
    clearIdle();
    playTap();
    fx.haptic(12);
    setLit(floor);
    ride(floor);
  };

  /** 손님을 누르면 다시 말해 준다 */
  const tapRider = () => {
    if (phaseRef.current !== "ask" || guard.lockedRef.current) return;
    const line = askLine(roundRef.current);
    const ms = speakDuration(line);
    guard.lock(ms);
    flashRider("talk", ms);
    riderSays(line, true);
    scheduleIdle(ms);
  };

  /* ---------- 화면 ---------- */

  const [stageRef, stage] = useBox<HTMLDivElement>();
  const { floor: target, rider, floors } = round;
  const locked = guard.locked;
  const showNumber = round.glow || hint;
  const glowOn = showNumber && (phase === "ask" || phase === "visit");
  const listening = locked && (phase === "board" || phase === "ask" || phase === "visit");

  let bubble: ReactNode;
  if (showNumber || phase === "done") {
    bubble = (
      <span className="flex items-center">
        <Glyph emoji={rider.emoji} className="mr-2 text-[1.3em]" />
        <BigNumeral n={target} className="text-[1.6em]" />
        <span className="ml-1">층 {phase === "done" ? "도착!" : "눌러 주세요!"}</span>
      </span>
    );
  } else if (round.memory && !revealed) {
    bubble = (
      <span className="flex items-center gap-2">
        <Glyph emoji={rider.emoji} className="text-[1.3em]" />
        <span>{rider.name}네 집은 몇 층?</span>
      </span>
    );
  } else {
    bubble = (
      <span className="flex items-center gap-2">
        <Glyph emoji="👂" />
        <span>잘 듣고 눌러 봐!</span>
      </span>
    );
  }

  const gap = stage.h > 0 && stage.h < 320 ? 8 : 12;
  const panel = panelLayout(floors, stage.w, stage.h);
  const carW = Math.max(120, Math.min(stage.w - panel.width - gap, stage.h * 1.2));
  const carH = stage.h;
  const baseH = carH * 0.08;
  const doorW = carW * 0.66;
  const doorH = Math.min(carH * 0.74, doorW * 2.6);
  const doorTop = carH - baseH - doorH;
  const indH = Math.max(26, Math.min(carW * 0.16, carH * 0.1));
  const indTop = Math.max(6, doorTop - indH - carH * 0.03);
  const riderPx = Math.min(carW * 0.3, carH * 0.2);
  const hallFigPx = Math.min(doorW * 0.34, doorH * 0.24);

  // 복도에 서 있는 친구: 탈 손님(1층) · 집에 온 손님 · 잘못 온 층의 친구
  const riderInHall = !riderIn && (at === target || (at === 1 && phase === "board"));
  const visitor = greeter === at && at !== target ? residentOf(at) : null;

  const riderFigure = (inCar: boolean) => (
    <motion.button
      layoutId={`rider-${round.id}`}
      onPointerDown={tapRider}
      aria-label={`${rider.name} 손님`}
      className="absolute z-[3] leading-none"
      style={
        inCar
          ? { left: carW * 0.04, bottom: baseH * 0.35, fontSize: riderPx }
          : { left: doorW * 0.3, bottom: doorH * 0.06, fontSize: hallFigPx }
      }
      transition={{ type: "spring", stiffness: 170, damping: 22 }}
    >
      <Glyph emoji={rider.emoji} mood={riderMood} className="drop-shadow-lg" />
    </motion.button>
  );

  return (
    <GameFrame scene="town">
      <TopBar onHome={onHome} stars={stars} title="딩동 엘리베이터" emoji="🛗" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2 sm:px-4 short:pb-2 short:pt-0">
        {/* 손님의 부탁 */}
        <div className="flex items-center justify-center gap-3">
          <Chick mood={chickMood} className="text-5xl sm:text-6xl short:text-3xl" />
          <SpeechBubble
            tail="left"
            className="break-keep text-center text-xl sm:text-2xl short:px-4 short:py-1.5 short:text-base"
          >
            {bubble}
          </SpeechBubble>
        </div>

        {/* 엘리베이터 + 버튼판 */}
        <div ref={stageRef} className="relative mt-2 flex min-h-0 flex-1 justify-center short:mt-1" style={{ gap }}>
          {stage.w > 0 ? (
            <>
              <motion.div
                className="relative h-full shrink-0 overflow-hidden rounded-[1.6rem] border-4 border-white shadow-xl"
                style={{
                  width: carW,
                  background: "linear-gradient(180deg, #fff7e6, #fde9c4 60%, #f6d59b)",
                }}
                animate={dir ? { y: [0, -2, 0, 2, 0] } : { y: 0 }}
                transition={dir ? { duration: 0.32, repeat: Infinity } : { duration: 0.2 }}
              >
                {/* 벽 무늬 */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, transparent 0 22px, rgba(180,120,60,0.18) 22px 24px)",
                  }}
                />
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: indTop }}>
                  <Indicator floor={at} dir={dir} size={indH} />
                </div>

                {/* 문틀 · 복도 · 문 */}
                <div
                  ref={doorRef}
                  className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-t-2xl border-[5px] border-slate-400 bg-slate-500"
                  style={{ top: doorTop, width: doorW, height: doorH }}
                >
                  <Hall floor={at} w={doorW - 10} h={doorH - 5}>
                    {riderInHall ? riderFigure(false) : null}
                    {visitor ? (
                      <motion.span
                        key={`visitor-${at}`}
                        className="absolute leading-none"
                        style={{ left: doorW * 0.3, bottom: doorH * 0.06, fontSize: hallFigPx }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0, rotate: [0, -8, 8, 0] }}
                        transition={{ rotate: { duration: 0.9, repeat: Infinity }, default: { duration: 0.4 } }}
                      >
                        <Glyph emoji={visitor.emoji} mood="happy" className="drop-shadow" />
                      </motion.span>
                    ) : null}
                  </Hall>
                  {[-1, 1].map((side) => (
                    <motion.div
                      key={side}
                      className="absolute inset-y-0 z-[4] w-1/2"
                      style={{
                        [side < 0 ? "left" : "right"]: 0,
                        background: "linear-gradient(90deg, #cbd5e1, #eef2f7 45%, #cbd5e1)",
                        borderLeft: side > 0 ? "2px solid #64748b" : undefined,
                        borderRight: side < 0 ? "2px solid #64748b" : undefined,
                      }}
                      initial={false}
                      animate={{ x: open ? `${side * 100}%` : "0%" }}
                      transition={{ duration: DOOR_MS / 1000, ease: "easeInOut" }}
                    />
                  ))}
                </div>

                {/* 엘리베이터 바닥 */}
                <div
                  className="absolute inset-x-0 bottom-0"
                  style={{ height: baseH, background: "linear-gradient(180deg, #d6a86a, #b9864a)" }}
                />

                {riderIn ? riderFigure(true) : null}

                <AnimatePresence>
                  {listening ? (
                    <motion.div
                      key="listen"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="pointer-events-none absolute inset-x-0 z-[5] flex justify-center"
                      style={{ top: doorTop + doorH * 0.4 }}
                    >
                      <div className="origin-top scale-75 short:scale-[0.6]">
                        <ListenChip />
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>

              {/* 층 버튼판 */}
              <div
                className="relative flex h-full shrink-0 items-center justify-center rounded-[1.6rem] border-4 border-white shadow-xl"
                style={{
                  width: panel.width,
                  padding: panel.pad,
                  background: "linear-gradient(160deg, #eef2f7, #cbd5e1 55%, #a3b1c6)",
                }}
              >
                <div className="flex" style={{ gap: panel.bankGap }}>
                  {Array.from({ length: panel.banks }, (_, bank) => (
                    <div
                      key={bank}
                      className="grid"
                      style={{ gridTemplateColumns: `repeat(${panel.split}, ${panel.b}px)`, gap: panel.gap }}
                    >
                      {bankCells(bank, panel.split, panel.rows).map((f) => (
                        <FloorButton
                          key={f}
                          floor={f}
                          size={panel.b}
                          lit={lit === f}
                          glow={glowOn && f === target}
                          dim={locked || phase !== "ask"}
                          off={f > floors}
                          onPress={() => press(round.id, f)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {banner ? (
          <WinBanner emoji={rider.emoji} n={target} label={`${target}층 도착`} praise={praise} />
        ) : null}
      </AnimatePresence>
    </GameFrame>
  );
}
