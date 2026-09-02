import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { playPop, playTap, speak } from "../lib/audio";
import {
  COUNT_WORDS,
  ITEMS,
  NUM_COLORS,
  counterPhrase,
  maxCountForLevel,
  pick,
  randomIntExcept,
  randomPraise,
  subj,
  type CountItem,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { BigNumeral, GameFrame, TopBar, WinBanner } from "../components/ui";
import type { GameProps } from "../types";

interface Round {
  id: number;
  item: CountItem;
  count: number;
}

/** 이미 센 것을 이만큼 반복해서 누르면 "아직 어려워한다"고 본다 */
const WRONG_TAPS_FOR_MISS = 3;

export default function TapCountGame({ level, stars, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
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
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [praise, setPraise] = useState("");

  // 동시 터치(두 손가락)에도 안전하도록 핸들러 안에서는 ref 를 기준으로 판단한다
  const tappedRef = useRef<number[]>([]);
  const phaseRef = useRef<"play" | "done">("play");
  const wrongTaps = useRef(0);

  // 라운드 시작 안내
  useEffect(() => {
    after(400, () =>
      speak(
        `${subj(round.item.name)} 몇 ${round.item.counter} 있을까? 하나씩 톡톡 눌러 봐!`,
        { interrupt: false },
      ),
    );
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = (i: number) => {
    if (phaseRef.current !== "play") return;
    if (tappedRef.current.includes(i)) {
      wrongTaps.current += 1;
      playTap();
      return;
    }
    const next = [...tappedRef.current, i];
    tappedRef.current = next;
    setTapped(next);
    const n = next.length;
    playPop(n);
    speak(COUNT_WORDS[n - 1], { rate: 0.85, pitch: 1.2 });

    if (n === round.count) {
      phaseRef.current = "done";
      setPhase("done");
      const p = randomPraise();
      setPraise(p);
      const ok = wrongTaps.current < WRONG_TAPS_FOR_MISS;
      after(700, () => {
        speak(
          `${round.item.name} ${counterPhrase(round.count, round.item.counter)}! ${p}`,
          { interrupt: false },
        );
        onWin();
        onResult(ok);
      });
      after(3600, () => {
        clearAll();
        tappedRef.current = [];
        wrongTaps.current = 0;
        phaseRef.current = "play";
        setTapped([]);
        setPhase("play");
        setRound((r) => newRound(r.id + 1));
      });
    }
  };

  const { item, count } = round;
  const current = tapped.length;

  return (
    <GameFrame>
      <TopBar onHome={onHome} stars={stars} title="톡톡 세기" emoji="👆" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-between overflow-y-auto px-4 pb-4 pt-2 no-scrollbar">
        {/* 상단: 현재 숫자 */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 text-xl text-slate-600 shadow sm:text-2xl">
            <span className="emoji text-2xl">{item.emoji}</span>
            <span>{item.name} 톡톡 세어 봐요</span>
          </div>
          <div className="mt-2 flex h-[clamp(4.5rem,16vh,9rem)] items-center justify-center">
            <AnimatePresence mode="popLayout">
              {current > 0 ? (
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
            exit={{ opacity: 0, scale: 0.7 }}
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
                  onPointerDown={() => handleTap(i)}
                  whileTap={{ scale: 0.85 }}
                  animate={counted ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className={`relative flex h-[clamp(72px,min(22vw,18vh),160px)] w-[clamp(72px,min(22vw,18vh),160px)] items-center justify-center rounded-[2rem] border-4 border-white bg-white shadow-[0_8px_0_0_rgba(0,0,0,0.1)] ${
                    counted ? "" : "bob"
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
        ) : null}
      </AnimatePresence>
    </GameFrame>
  );
}
