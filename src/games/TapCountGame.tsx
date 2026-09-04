import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { playPop, playSoft, playTap, speak, speakDuration } from "../lib/audio";
import {
  COUNT_WORDS,
  ITEMS,
  NUM_COLORS,
  counterPhrase,
  maxCountForLevel,
  pick,
  randomIntExcept,
  randomPraise,
  randomSlowPhrase,
  type CountItem,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { useRoundGuard } from "../hooks/useRoundGuard";
import { BigNumeral, GameFrame, ListenChip, SlowBanner, TopBar, WinBanner } from "../components/ui";
import type { GameProps } from "../types";

interface Round {
  id: number;
  item: CountItem;
  count: number;
}

type Phase = "play" | "done" | "slow";

/** 이미 센 것을 이만큼 반복해서 누르면 "아직 어려워한다"고 본다 (난이도 신호) */
const REPEATS_FOR_MISS = 3;

export default function TapCountGame({ level, stars, tapGap, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
  const guard = useRoundGuard(tapGap);
  const prev = useRef<{ item?: CountItem; count?: number }>({});
  const levelRef = useRef(level);
  levelRef.current = level;

  const newRound = (id: number): Round => {
    const item = pick(ITEMS, prev.current.item);
    const count = randomIntExcept(1, maxCountForLevel(levelRef.current), prev.current.count);
    prev.current = { item, count };
    return { id, item, count };
  };

  const [round, setRound] = useState<Round>(() => newRound(0));
  const [tapped, setTapped] = useState<number[]>([]);
  const [phase, setPhaseState] = useState<Phase>("play");
  const [praise, setPraise] = useState("");
  const [slowText, setSlowText] = useState("");

  // 동시 터치·퇴장 중인 버튼에도 안전하도록 핸들러는 ref 로 판단한다
  const roundIdRef = useRef(round.id);
  roundIdRef.current = round.id;
  const tappedRef = useRef<number[]>([]);
  const phaseRef = useRef<Phase>("play");
  const repeats = useRef(0);
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  // 라운드 시작: 안내가 끝날 때까지 잠금
  useEffect(() => {
    const intro = `${round.item.name} 몇 ${round.item.counter}? 하나씩 눌러 봐!`;
    guard.lock(400 + speakDuration(intro));
    after(400, () => speak(intro, { interrupt: false }));
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetRound = () => {
    tappedRef.current = [];
    repeats.current = 0;
    guard.resetRound();
    setTapped([]);
    setPhase("play");
  };

  /** 막 눌러서 끝낸 라운드: 별 없이 같은 라운드를 다시 */
  const slowRound = () => {
    setPhase("slow");
    const s = randomSlowPhrase();
    setSlowText(s);
    playSoft();
    speak(s, { interrupt: false }); // 마지막 숫자를 끊지 않고 이어서
    after(3000, () => {
      resetRound();
      const again = "천천히, 하나씩 눌러 봐!";
      guard.lock(speakDuration(again));
      speak(again);
    });
  };

  const win = () => {
    setPhase("done");
    const p = randomPraise();
    setPraise(p);
    const ok = repeats.current < REPEATS_FOR_MISS;
    after(700, () => {
      speak(`${round.item.name} ${counterPhrase(round.count, round.item.counter)}! ${p}`, {
        interrupt: false,
      });
      onWin();
      onResult(ok);
    });
    after(3800, () => {
      clearAll();
      resetRound();
      setRound((r) => newRound(r.id + 1));
    });
  };

  const handleTap = (rid: number, i: number) => {
    if (rid !== roundIdRef.current) return; // 사라지는 중인 이전 라운드 버튼
    if (phaseRef.current !== "play") {
      guard.noteIgnored();
      return;
    }
    if (tappedRef.current.includes(i)) {
      repeats.current += 1;
      guard.noteIgnored();
      playTap();
      return;
    }
    if (!guard.accept()) return; // 잠금 중이거나 너무 빠름

    const next = [...tappedRef.current, i];
    tappedRef.current = next;
    setTapped(next);
    const n = next.length;
    playPop(n);
    speak(COUNT_WORDS[n - 1], { rate: 0.85, pitch: 1.2 });

    if (n === round.count) {
      if (guard.isMashing()) slowRound();
      else win();
    }
  };

  const { item, count } = round;
  const current = tapped.length;
  const locked = guard.locked;

  return (
    <GameFrame>
      <TopBar onHome={onHome} stars={stars} title="톡톡 세기" emoji="👆" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-between overflow-y-auto px-4 pb-4 pt-2 no-scrollbar short:pb-2 short:pt-0">
        {/* 상단: 현재 숫자 */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 text-xl text-slate-600 shadow sm:text-2xl short:py-1 short:text-base">
            <span className="emoji text-2xl">{item.emoji}</span>
            <span>{item.name} 톡톡 세어 봐요</span>
          </div>
          <div className="mt-2 flex h-[clamp(4.5rem,16vh,9rem)] items-center justify-center">
            <AnimatePresence mode="popLayout">
              {locked && phase === "play" ? (
                <motion.div key="listen" exit={{ opacity: 0, scale: 0.7 }}>
                  <ListenChip />
                </motion.div>
              ) : current > 0 ? (
                <motion.div
                  key={current}
                  initial={{ scale: 0.3, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.6, opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 400, damping: 16 }}
                >
                  <BigNumeral n={current} className="text-[clamp(4rem,14vh,8rem)]" />
                </motion.div>
              ) : (
                <motion.div
                  key="q"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[clamp(3.5rem,12vh,6rem)] text-slate-300"
                >
                  ?
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 가운데: 아이템 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7, pointerEvents: "none" }}
            transition={{ duration: 0.3 }}
            className="flex max-w-3xl flex-wrap items-center justify-center gap-4 sm:gap-6"
          >
            {Array.from({ length: count }).map((_, i) => {
              const idx = tapped.indexOf(i);
              const counted = idx >= 0;
              const color = counted ? NUM_COLORS[idx % NUM_COLORS.length] : undefined;
              return (
                <motion.button
                  key={i}
                  onPointerDown={() => handleTap(round.id, i)}
                  whileTap={{ scale: 0.85 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    counted
                      ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0], opacity: 1 }
                      : { scale: 1, opacity: locked ? 0.6 : 1 }
                  }
                  transition={
                    counted
                      ? { duration: 0.5 }
                      : { type: "spring", stiffness: 300, damping: 18, delay: i * 0.25 }
                  }
                  className={`relative flex h-[clamp(72px,min(22vw,18vh),160px)] w-[clamp(72px,min(22vw,18vh),160px)] items-center justify-center rounded-[2rem] border-4 border-white bg-white shadow-[0_8px_0_0_rgba(0,0,0,0.1)] ${
                    counted || locked ? "" : "bob"
                  }`}
                  style={{
                    ...(counted ? { background: `${color}33`, borderColor: color } : {}),
                    animationDelay: `${i * 0.2}s`,
                  }}
                  aria-label={`${item.name} ${i + 1}`}
                >
                  <span className="emoji text-[clamp(2.4rem,min(12vw,9vh),6rem)]">{item.emoji}</span>
                  {counted ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-3xl text-white shadow-lg sm:h-14 sm:w-14 sm:text-4xl"
                      style={{ background: color }}
                    >
                      {idx + 1}
                    </motion.span>
                  ) : null}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* 하단: 진행 칸 */}
        <div className="flex items-center gap-3">
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              animate={i < current ? { scale: [1, 1.4, 1] } : {}}
              className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow sm:h-12 sm:w-12"
              style={{
                background: i < current ? NUM_COLORS[i % NUM_COLORS.length] : "rgba(255,255,255,0.6)",
              }}
            >
              {i < current ? (
                <span className="text-xl text-white sm:text-2xl">{i + 1}</span>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {phase === "done" ? (
          <WinBanner
            emoji={item.emoji}
            n={count}
            label={`${item.name} ${counterPhrase(count, item.counter)}`}
            praise={praise}
          />
        ) : phase === "slow" ? (
          <SlowBanner text={slowText} />
        ) : null}
      </AnimatePresence>
    </GameFrame>
  );
}
