import { useCallback, useEffect, useRef, useState } from "react";
import {
  CYCLE_ORDER,
  CYCLE_PACES,
  DEFAULT_TAP_GAP,
  ELEVATOR_TOP,
  GAME_IDS,
  LEVEL_RULES,
  MAX_LEVELS,
  SCENE_MAX,
  SESSION_LIMITS,
  STICKERS,
  UNLOCK_TOTAL,
  clampLevel,
  isFollowGame,
  starsForUnlock,
  type CyclePace,
  type GameId,
} from "../lib/data";
import { setSoundOn, setVoiceOn } from "../lib/audio";
import { setHapticsOn } from "../fx/bus";

export type { GameId };

/** 스티커 꾸미기 장면에 붙인 친구 (x, y 는 0~1) */
export interface SceneSpot {
  i: number;
  x: number;
  y: number;
}

/** 오늘 하루의 기록 (날짜가 바뀌면 새로 시작) */
export interface DayLog {
  day: string;
  stars: number;
  stickers: number[];
}

/** 별이 모여서 새로 열린 것: 새 스티커이거나, 이미 있는 스티커가 반짝이 스티커로 바뀐 것 */
export interface Unlock {
  index: number;
  shiny: boolean;
}

export interface Progress {
  stars: number;
  /** 다음 선물(새 스티커·반짝이 스티커)까지 채운 별 */
  jar: number;
  stickers: number[]; // unlocked sticker indices
  /** 스티커를 모두 모은 뒤: 앞에서부터 이만큼이 반짝이 스티커 */
  shiny: number;
  /** 놀이 화면에 같이 나오는 친구 (스티커 인덱스) */
  buddy: number | null;
  /** 스티커 꾸미기 장면 */
  scene: SceneSpot[];
  /** 마지막으로 논 날 (YYYY-MM-DD) */
  lastDay: string;
  today: DayLog;
  /** 놀이 시간 알림(분). 0 이면 끔 */
  sessionMin: number;
  levels: Record<GameId, number>;
  soundOn: boolean;
  voiceOn: boolean;
  /** 누를 때 짧은 진동 (지원하는 기기만) */
  hapticsOn: boolean;
  totalRounds: number;
  /** 세는 탭 사이 최소 간격(ms) */
  tapGap: number;
  /** 빙글빙글: 다음에 시작할 놀이 (CYCLE_ORDER 인덱스) */
  cycleNext: number;
  /** 빙글빙글: 놀이를 바꾸는 빠르기 */
  cyclePace: CyclePace;
  /** 딩동 엘리베이터: 층마다 손님을 집에 데려다 준 횟수 (인덱스 = 층) */
  elevatorRides: number[];
}

const KEY = "sutja-nori-progress-v1";

export function dayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

const DEFAULT: Progress = {
  stars: 0,
  jar: 0,
  stickers: [],
  shiny: 0,
  buddy: null,
  scene: [],
  lastDay: "",
  today: { day: "", stars: 0, stickers: [] },
  sessionMin: 0,
  levels: { tap: 1, howmany: 1, feed: 1, bubbles: 1, find: 1, elevator: 1, dial: 1, share: 1, bus: 1 },
  soundOn: true,
  voiceOn: true,
  hapticsOn: true,
  totalRounds: 0,
  tapGap: DEFAULT_TAP_GAP,
  cycleNext: 0,
  cyclePace: "normal",
  elevatorRides: [],
};

function freshStreaks(): Record<GameId, { ok: number; miss: number }> {
  return {
    tap: { ok: 0, miss: 0 },
    howmany: { ok: 0, miss: 0 },
    feed: { ok: 0, miss: 0 },
    bubbles: { ok: 0, miss: 0 },
    find: { ok: 0, miss: 0 },
    elevator: { ok: 0, miss: 0 },
    dial: { ok: 0, miss: 0 },
    share: { ok: 0, miss: 0 },
    bus: { ok: 0, miss: 0 },
  };
}

/** 기록을 지워도 남기는 부모 설정 */
const SETTINGS = ["soundOn", "voiceOn", "hapticsOn", "tapGap", "cyclePace", "sessionMin"] as const;

function settingsOf(p: Partial<Progress>): Partial<Progress> {
  const out: Partial<Progress> = {};
  for (const k of SETTINGS) if (p[k] !== undefined) Object.assign(out, { [k]: p[k] });
  return out;
}

/**
 * 별 3개마다 친구가 오던 때의 기록(jar 없음): 모은 별은 그대로 두고,
 * 친구는 그 별로 지금 규칙(STICKER_PACE)에서 올 만큼만 남긴다. 남은 별은 다음 칸에 채운다.
 */
function fromOldPace(p: Partial<Progress>): Partial<Progress> {
  const stars = typeof p.stars === "number" && p.stars > 0 ? Math.floor(p.stars) : 0;
  let n = 0;
  let jar = stars;
  while (n < UNLOCK_TOTAL && jar >= starsForUnlock(n)) {
    jar -= starsForUnlock(n);
    n += 1;
  }
  return {
    ...p,
    stars,
    jar: n < UNLOCK_TOTAL ? jar : 0,
    stickers: Array.from({ length: Math.min(n, STICKERS.length) }, (_, i) => i),
    shiny: Math.max(0, n - STICKERS.length),
  };
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const saved = JSON.parse(raw) as Partial<Progress>;
    const parsed = typeof saved.jar === "number" ? saved : fromOldPace(saved);
    const levels = { ...DEFAULT.levels };
    for (const g of GAME_IDS) {
      const v = parsed.levels?.[g];
      if (typeof v === "number") levels[g] = clampLevel(g, v);
    }
    const cyclePace: CyclePace =
      parsed.cyclePace && parsed.cyclePace in CYCLE_PACES ? parsed.cyclePace : DEFAULT.cyclePace;
    const cycleNext =
      typeof parsed.cycleNext === "number"
        ? ((Math.round(parsed.cycleNext) % CYCLE_ORDER.length) + CYCLE_ORDER.length) %
          CYCLE_ORDER.length
        : 0;
    const isIdx = (v: unknown): v is number =>
      typeof v === "number" && Number.isInteger(v) && v >= 0 && v < STICKERS.length;
    const stickers = Array.isArray(parsed.stickers) ? parsed.stickers.filter(isIdx) : [];
    const shiny =
      typeof parsed.shiny === "number" ? Math.max(0, Math.min(stickers.length, parsed.shiny)) : 0;
    const jar = Math.min(
      typeof parsed.jar === "number" && parsed.jar >= 0 ? Math.floor(parsed.jar) : 0,
      starsForUnlock(stickers.length + shiny) - 1,
    );
    const buddy =
      isIdx(parsed.buddy) && stickers.includes(parsed.buddy)
        ? parsed.buddy
        : stickers.length > 0
          ? stickers[stickers.length - 1]
          : null;
    const scene = Array.isArray(parsed.scene)
      ? parsed.scene
          .filter(
            (s): s is SceneSpot =>
              !!s &&
              isIdx(s.i) &&
              stickers.includes(s.i) &&
              typeof s.x === "number" &&
              typeof s.y === "number",
          )
          .slice(-SCENE_MAX)
      : [];
    const t = parsed.today;
    const today: DayLog =
      t && typeof t.day === "string" && typeof t.stars === "number" && Array.isArray(t.stickers)
        ? { day: t.day, stars: t.stars, stickers: t.stickers.filter((i) => isIdx(i) && stickers.includes(i)) }
        : DEFAULT.today;
    const sessionMin = SESSION_LIMITS.includes(parsed.sessionMin as number)
      ? (parsed.sessionMin as number)
      : 0;
    const elevatorRides = Array.isArray(parsed.elevatorRides)
      ? parsed.elevatorRides
          .slice(0, ELEVATOR_TOP + 1)
          .map((v) => (typeof v === "number" && v > 0 ? Math.floor(v) : 0))
      : [];
    return {
      ...DEFAULT,
      ...parsed,
      jar,
      stickers,
      shiny,
      buddy,
      scene,
      lastDay: typeof parsed.lastDay === "string" ? parsed.lastDay : "",
      today,
      sessionMin,
      levels,
      cyclePace,
      cycleNext,
      elevatorRides,
    };
  } catch {
    return DEFAULT;
  }
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

/** 앱을 연 순간의 방문 정보 (홈 인사말에 쓴다) */
export interface Visit {
  /** 전에 논 적이 있고, 그게 오늘이 아님 */
  returning: boolean;
  /** 마지막으로 논 날이 어제 */
  yesterday: boolean;
}

/** 오늘 기록: 날짜가 바뀌었으면 새로 */
function todayOf(p: Progress): DayLog {
  const day = dayKey();
  return p.today.day === day ? p.today : { day, stars: 0, stickers: [] };
}

/** 겹치지 않게 장면 안의 빈 자리를 고른다 */
function freeSpot(taken: SceneSpot[]): { x: number; y: number } {
  let best = { x: 0.5, y: 0.6 };
  let bestD = -1;
  for (let k = 0; k < 24; k++) {
    const c = { x: 0.08 + Math.random() * 0.84, y: 0.34 + Math.random() * 0.46 };
    // 오른쪽 아래는 "같이 세기" 버튼 자리
    if (c.x > 0.6 && c.y > 0.62) continue;
    const d = taken.reduce(
      (m, s) => Math.min(m, Math.hypot((s.x - c.x) * 1.6, s.y - c.y)),
      Infinity,
    );
    if (d > bestD) {
      best = c;
      bestD = d;
    }
  }
  return best;
}

/** 별 칸에 보여 줄 것: 다음 선물까지 몇 칸 중 몇 칸 찼는지 */
export interface StarMeter {
  /** 모은 별 전체 */
  total: number;
  fill: number;
  goal: number;
  /** 지금 채우는 칸이 반짝이 스티커 칸 */
  shiny: boolean;
  /** 반짝이 스티커까지 모두 모았다 */
  done: boolean;
}

/**
 * 별 칸 계산. 날아가는 별(flying)은 아직 항아리에 안 들어온 걸로 친다.
 * 방금 선물이 열렸는데 그 별이 아직 날아가는 중이면 지난 칸을 보여 준다.
 */
export function starMeter(p: Progress, flying = 0): StarMeter {
  const total = p.stars - flying;
  const owned = p.stickers.length + p.shiny;
  if (owned >= UNLOCK_TOTAL) {
    const goal = starsForUnlock(UNLOCK_TOTAL - 1);
    return { total, fill: goal, goal, shiny: true, done: true };
  }
  let n = owned;
  let fill = p.jar - flying;
  if (fill < 0 && n > 0) {
    n -= 1;
    fill += starsForUnlock(n);
  }
  return { total, fill: Math.max(0, fill), goal: starsForUnlock(n), shiny: n >= STICKERS.length, done: false };
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    const p = load();
    return { ...p, lastDay: dayKey(), today: todayOf(p) };
  });
  const ref = useRef(progress);
  ref.current = progress;

  // 불러온 순간의 마지막 방문일로 "다시 왔구나" 를 판단한다 (한 번만)
  const [visit] = useState<Visit>(() => {
    const last = load().lastDay;
    return {
      returning: last !== "" && last !== dayKey(),
      yesterday: last === yesterdayKey(),
    };
  });

  // 연속 성공/실패 (세션 내 메모리)
  const streaks = useRef(freshStreaks());

  useEffect(() => {
    save(progress);
    setSoundOn(progress.soundOn);
    setVoiceOn(progress.voiceOn);
    setHapticsOn(progress.hapticsOn);
  }, [progress]);

  /**
   * 라운드 성공: 별 count 개 추가 (보너스면 2개).
   * 별이 STICKER_PACE 만큼 차면 새 스티커가 열리고, 다 모았으면 앞에서부터 반짝이 스티커로 바뀐다.
   * 한 번에 선물은 하나만 열고, 넘친 별은 다음 칸에 채운다.
   */
  const addStar = useCallback((count = 1): Unlock | null => {
    const cur = ref.current;
    let { stars, jar, stickers, shiny, buddy } = cur;
    const today = todayOf(cur);
    let todayStickers = today.stickers;
    let unlocked: Unlock | null = null;
    for (let k = 0; k < count; k++) {
      stars += 1;
      const owned = stickers.length + shiny;
      if (owned >= UNLOCK_TOTAL) continue;
      jar += 1;
      if (unlocked || jar < starsForUnlock(owned)) continue;
      jar = 0;
      if (stickers.length < STICKERS.length) {
        const index = stickers.length;
        stickers = [...stickers, index];
        buddy = index; // 새로 온 친구가 같이 놀아 준다
        todayStickers = [...todayStickers, index];
        unlocked = { index, shiny: false };
      } else {
        unlocked = { index: shiny, shiny: true };
        shiny += 1;
      }
    }
    const next: Progress = {
      ...cur,
      stars,
      jar,
      stickers,
      shiny,
      buddy,
      totalRounds: cur.totalRounds + 1,
      lastDay: today.day,
      today: { day: today.day, stars: today.stars + count, stickers: todayStickers },
    };
    ref.current = next;
    setProgress(next);
    return unlocked;
  }, []);

  /**
   * 적응형 난이도: 5연속 성공 → 레벨업, 2연속 실패 → 레벨다운 (LEVEL_RULES).
   * 톡톡 세기·거품 팡팡은 다른 놀이의 최고 수를 따라가므로 여기서 바꾸지 않는다.
   * 레벨이 올라갔으면 true.
   */
  const reportResult = useCallback((game: GameId, ok: boolean): boolean => {
    if (isFollowGame(game)) return false;
    const s = streaks.current[game];
    const cur = ref.current;
    let level = cur.levels[game];
    if (ok) {
      s.ok += 1;
      s.miss = 0;
      if (s.ok >= LEVEL_RULES.upStreak && level < MAX_LEVELS[game]) {
        level += 1;
        s.ok = 0;
      }
    } else {
      s.miss += 1;
      s.ok = 0;
      if (s.miss >= LEVEL_RULES.downStreak && level > 1) {
        level -= 1;
        s.miss = 0;
      }
    }
    if (level !== cur.levels[game]) {
      const next = { ...cur, levels: { ...cur.levels, [game]: level } };
      ref.current = next;
      setProgress(next);
    }
    return level > cur.levels[game];
  }, []);

  /** 딩동 엘리베이터: 손님을 floor 층 집에 데려다 줬다 */
  const noteRide = useCallback((floor: number) => {
    const cur = ref.current;
    const rides = [...cur.elevatorRides];
    while (rides.length <= floor) rides.push(0);
    rides[floor] += 1;
    const next = { ...cur, elevatorRides: rides };
    ref.current = next;
    setProgress(next);
  }, []);

  /** 같이 놀 친구 고르기 */
  const setBuddy = useCallback((i: number) => {
    const cur = ref.current;
    if (!cur.stickers.includes(i) || cur.buddy === i) return;
    const next = { ...cur, buddy: i };
    ref.current = next;
    setProgress(next);
  }, []);

  /** 스티커를 장면에 붙인다. 이미 붙어 있으면 false (그 자리에서 폴짝 뛰게) */
  const placeInScene = useCallback((i: number): boolean => {
    const cur = ref.current;
    if (!cur.stickers.includes(i) || cur.scene.some((s) => s.i === i)) return false;
    // 가득 차면 가장 먼저 붙인 친구가 자리를 비켜 준다
    const kept = cur.scene.length >= SCENE_MAX ? cur.scene.slice(1) : cur.scene;
    const next = { ...cur, scene: [...kept, { i, ...freeSpot(kept) }] };
    ref.current = next;
    setProgress(next);
    return true;
  }, []);

  const setSessionMin = useCallback((m: number) => {
    setProgress((p) => ({ ...p, sessionMin: m }));
  }, []);

  const toggleSound = useCallback(() => {
    setProgress((p) => ({ ...p, soundOn: !p.soundOn }));
  }, []);

  const toggleVoice = useCallback(() => {
    setProgress((p) => ({ ...p, voiceOn: !p.voiceOn }));
  }, []);

  const toggleHaptics = useCallback(() => {
    setProgress((p) => ({ ...p, hapticsOn: !p.hapticsOn }));
  }, []);

  const setTapGap = useCallback((ms: number) => {
    setProgress((p) => ({ ...p, tapGap: ms }));
  }, []);

  const setCycleNext = useCallback((i: number) => {
    setProgress((p) => ({ ...p, cycleNext: i % CYCLE_ORDER.length }));
  }, []);

  const setCyclePace = useCallback((pace: CyclePace) => {
    setProgress((p) => ({ ...p, cyclePace: pace }));
  }, []);

  /** 부모 설정에서 놀이별 단계를 직접 맞춘다 */
  const setLevel = useCallback((game: GameId, level: number) => {
    streaks.current[game] = { ok: 0, miss: 0 };
    setProgress((p) => ({
      ...p,
      levels: { ...p.levels, [game]: clampLevel(game, level) },
    }));
  }, []);

  const reset = useCallback(() => {
    const next: Progress = {
      ...DEFAULT,
      ...settingsOf(ref.current),
      lastDay: dayKey(),
      today: { day: dayKey(), stars: 0, stickers: [] },
    };
    ref.current = next;
    setProgress(next);
    streaks.current = freshStreaks();
  }, []);

  return {
    progress,
    visit,
    addStar,
    reportResult,
    noteRide,
    setBuddy,
    placeInScene,
    setSessionMin,
    toggleSound,
    toggleVoice,
    toggleHaptics,
    setTapGap,
    setCycleNext,
    setCyclePace,
    setLevel,
    reset,
  };
}
