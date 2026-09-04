import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_TAP_GAP, MAX_LEVEL, STARS_PER_STICKER, STICKERS } from "../lib/data";
import { setSoundOn, setVoiceOn } from "../lib/audio";

export type GameId = "tap" | "howmany" | "feed" | "bubbles";

export interface Progress {
  stars: number;
  stickers: number[]; // unlocked sticker indices
  levels: Record<GameId, number>;
  soundOn: boolean;
  voiceOn: boolean;
  totalRounds: number;
  /** 세는 탭 사이 최소 간격(ms) */
  tapGap: number;
}

const KEY = "sutja-nori-progress-v1";

const DEFAULT: Progress = {
  stars: 0,
  stickers: [],
  levels: { tap: 1, howmany: 1, feed: 1, bubbles: 1 },
  soundOn: true,
  voiceOn: true,
  totalRounds: 0,
  tapGap: DEFAULT_TAP_GAP,
};

function freshStreaks(): Record<GameId, { ok: number; miss: number }> {
  return {
    tap: { ok: 0, miss: 0 },
    howmany: { ok: 0, miss: 0 },
    feed: { ok: 0, miss: 0 },
    bubbles: { ok: 0, miss: 0 },
  };
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      ...DEFAULT,
      ...parsed,
      levels: { ...DEFAULT.levels, ...(parsed.levels ?? {}) },
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

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);
  const ref = useRef(progress);
  ref.current = progress;

  // 연속 성공/실패 (세션 내 메모리)
  const streaks = useRef(freshStreaks());

  useEffect(() => {
    save(progress);
    setSoundOn(progress.soundOn);
    setVoiceOn(progress.voiceOn);
  }, [progress]);

  /** 별 1개 추가. 새 스티커가 열리면 그 인덱스를 반환 */
  const addStar = useCallback((): number | null => {
    const cur = ref.current;
    const nextStars = cur.stars + 1;
    let unlocked: number | null = null;
    if (
      nextStars % STARS_PER_STICKER === 0 &&
      cur.stickers.length < STICKERS.length
    ) {
      unlocked = cur.stickers.length;
    }
    const next: Progress = {
      ...cur,
      stars: nextStars,
      totalRounds: cur.totalRounds + 1,
      stickers: unlocked !== null ? [...cur.stickers, unlocked] : cur.stickers,
    };
    ref.current = next;
    setProgress(next);
    return unlocked;
  }, []);

  /** 적응형 난이도: 3연속 성공 → 레벨업, 2연속 실패 → 레벨다운 */
  const reportResult = useCallback((game: GameId, ok: boolean) => {
    const s = streaks.current[game];
    const cur = ref.current;
    let level = cur.levels[game];
    if (ok) {
      s.ok += 1;
      s.miss = 0;
      if (s.ok >= 3 && level < MAX_LEVEL) {
        level += 1;
        s.ok = 0;
      }
    } else {
      s.miss += 1;
      s.ok = 0;
      if (s.miss >= 2 && level > 1) {
        level -= 1;
        s.miss = 0;
      }
    }
    if (level !== cur.levels[game]) {
      const next = { ...cur, levels: { ...cur.levels, [game]: level } };
      ref.current = next;
      setProgress(next);
    }
  }, []);

  const toggleSound = useCallback(() => {
    setProgress((p) => ({ ...p, soundOn: !p.soundOn }));
  }, []);

  const toggleVoice = useCallback(() => {
    setProgress((p) => ({ ...p, voiceOn: !p.voiceOn }));
  }, []);

  const setTapGap = useCallback((ms: number) => {
    setProgress((p) => ({ ...p, tapGap: ms }));
  }, []);

  const setAllLevels = useCallback((level: number) => {
    streaks.current = freshStreaks();
    setProgress((p) => ({
      ...p,
      levels: { tap: level, howmany: level, feed: level, bubbles: level },
    }));
  }, []);

  const reset = useCallback(() => {
    const next = {
      ...DEFAULT,
      soundOn: ref.current.soundOn,
      voiceOn: ref.current.voiceOn,
      tapGap: ref.current.tapGap,
    };
    ref.current = next;
    setProgress(next);
    streaks.current = freshStreaks();
  }, []);

  return {
    progress,
    addStar,
    reportResult,
    toggleSound,
    toggleVoice,
    setTapGap,
    setAllLevels,
    reset,
  };
}
