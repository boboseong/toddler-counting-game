import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { playDing, playPop, playSoft, speak } from "../lib/audio";
import {
  COUNT_WORDS,
  ITEMS,
  NUM_COLORS,
  choicesForLevel,
  counterPhrase,
  maxCountForLevel,
  pick,
  randomIntExcept,
  randomPraise,
  shuffle,
  type CountItem,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { Dots, GameFrame, SpeechBubble, TopBar, WinBanner } from "../components/ui";
import type { GameProps } from "../types";

interface Round {
  id: number;
  item: CountItem;
  count: number;
  choices: number[];
}

type Phase = "play" | "busy" | "done";

export default function HowManyGame({ level, stars, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
  const prev = useRef<{ item?: CountItem; count?: number }>({});
  const idleTimer = useRef<number | null>(null);
  const levelRef = useRef(level);
  levelRef.current = level;

  const newRound = (id: number): Round => {
    const lv = levelRef.current;
    const item = pick(ITEMS, prev.current.item);
    const max = maxCountForLevel(lv);
    const count = randomIntExcept(1, max, prev.current.count);
    prev.current = { item, count };

    const numChoices = Math.min(choicesForLevel(lv), max);
    const pool = shuffle(
      Array.from({ length: max }, (_, i) => i + 1).filter((n) => n !== count),
    );
    const choices = shuffle([count, ...pool.slice(0, numChoices - 1)]);
    return { id, item, count, choices };
  };

  const [round, setRound] = useState<Round>(() => newRound(0));
  const [removed, setRemoved] = useState<number[]>([]);
  const [phase, setPhaseState] = useState<Phase>("play");
  const [hintIndex, setHintIndex] = useState(-1);
  const [wobble, setWobble] = useState<number | null>(null);
  const [praise, setPraise] = useState("");
  const [countedUpTo, setCountedUpTo] = useState(0);

  // 동시 터치에서 두 핸들러가 모두 "play" 를 보지 않도록 ref 를 즉시 갱신한다
  const phaseRef = useRef<Phase>("play");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  const clearIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = null;
  };

  const scheduleIdleHint = () => {
    clearIdle();
    idleTimer.current = window.setTimeout(() => {
      if (phaseRef.current !== "play") return;
      speak("같이 세어 볼까?");
      setPhase("busy");
      after(1100, () =>
        animateCount(() => {
          setPhase("play");
          speak(`몇 ${round.item.counter}일까? 숫자를 눌러 봐!`, { interrupt: false });
          scheduleIdleHint();
        }),
      );
    }, 12000);
  };

  useEffect(() => {
    after(400, () =>
      speak(`${round.item.name}! 몇 ${round.item.counter}일까? 숫자를 눌러 봐!`, {
        interrupt: false,
      }),
    );
    scheduleIdleHint();
    return clearIdle;
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 아이템을 하나씩 짚으며 세는 애니메이션 */
  const animateCount = (done: () => void) => {
    const { count } = round;
    setCountedUpTo(0);
    for (let i = 0; i < count; i++) {
      after(i * 720, () => {
        setHintIndex(i);
        setCountedUpTo(i + 1);
        playPop(i + 1);
        speak(COUNT_WORDS[i], { rate: 0.85, pitch: 1.2 });
      });
    }
    after(count * 720 + 350, () => {
      setHintIndex(-1);
      done();
    });
  };

  const nextRound = () => {
    clearAll();
    clearIdle();
    setRemoved([]);
    setHintIndex(-1);
    setCountedUpTo(0);
    setWobble(null);
    setPhase("play");
    setRound((r) => newRound(r.id + 1));
  };

  const handleChoice = (n: number) => {
    if (phaseRef.current !== "play" || removed.includes(n)) return;
    clearIdle();

    if (n === round.count) {
      setPhase("done");
      const p = randomPraise();
      setPraise(p);
      playDing();
      onResult(true);
      speak("맞았어요!", { rate: 0.95, pitch: 1.25 });
      after(1100, () =>
        animateCount(() => {
          speak(
            `${round.item.name} ${counterPhrase(round.count, round.item.counter)}! ${p}`,
            { interrupt: false },
          );
          onWin();
          after(3300, nextRound);
        }),
      );
    } else {
      setPhase("busy");
      playSoft();
      setWobble(n);
      onResult(false);
      speak("음~ 다시 같이 세어 볼까?");
      after(600, () => setWobble(null));
      after(1400, () =>
        animateCount(() => {
          setRemoved((r) => [...r, n]);
          setPhase("play");
          speak(
            `${round.item.name} ${counterPhrase(round.count, round.item.counter)}! 이제 같은 색 숫자를 눌러 봐!`,
            { interrupt: false },
          );
          scheduleIdleHint();
        }),
      );
    }
  };

  const { item, count, choices } = round;
  const showCountBadges = phase === "done" || countedUpTo > 0;

  return (
    <GameFrame>
      <TopBar onHome={onHome} stars={stars} title="몇 개일까?" emoji="🔢" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-between overflow-y-auto px-4 pb-4 pt-2 no-scrollbar">
        {/* 질문 */}
        <div className="flex items-center gap-3">
          <span className="emoji text-5xl sm:text-6xl">🐥</span>
          <SpeechBubble tail="left" className="text-2xl sm:text-3xl">
            {item.name} 몇 {item.counter}일까?
          </SpeechBubble>
        </div>

        {/* 아이템 패널 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-[clamp(100px,min(26vw,20vh),200px)] max-w-3xl flex-wrap items-center justify-center gap-3 rounded-[2.5rem] border-4 border-white bg-white/80 px-6 py-4 shadow-xl sm:gap-5"
          >
            {Array.from({ length: count }).map((_, i) => {
              const active = hintIndex === i;
              const counted = showCountBadges && i < countedUpTo;
              return (
                <motion.div
                  key={i}
                  animate={
                    active
                      ? { scale: [1, 1.45, 1.15], y: [0, -18, -8] }
                      : counted
                        ? { scale: 1.05, y: -4 }
                        : { scale: 1, y: 0 }
                  }
                  transition={{ duration: 0.4 }}
                  className="relative flex items-center justify-center"
                >
                  <span className="emoji text-[clamp(2.4rem,min(11vw,9vh),5.5rem)] drop-shadow">
                    {item.emoji}
                  </span>
                  {counted ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2 -top-3 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white text-xl text-white shadow sm:h-11 sm:w-11 sm:text-2xl"
                      style={{ background: NUM_COLORS[i % NUM_COLORS.length] }}
                    >
                      {i + 1}
                    </motion.span>
                  ) : null}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* 선택지 */}
        <div className="flex items-end justify-center gap-4 sm:gap-8">
          <AnimatePresence>
            {choices
              .filter((n) => !removed.includes(n))
              .map((n) => {
                const color = NUM_COLORS[(n - 1) % NUM_COLORS.length];
                const isCorrectDone = phase === "done" && n === count;
                return (
                  <motion.button
                    key={n}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={
                      wobble === n
                        ? { x: [0, -14, 14, -10, 10, 0], scale: 1, opacity: 1 }
                        : isCorrectDone
                          ? { scale: [1, 1.25, 1.15], opacity: 1, y: -10 }
                          : { scale: 1, opacity: 1, x: 0, y: 0 }
                    }
                    exit={{ scale: 0, opacity: 0, rotate: 20 }}
                    transition={{ type: "spring", stiffness: 350, damping: 18 }}
                    whileTap={{ scale: 0.9 }}
                    onPointerDown={() => handleChoice(n)}
                    aria-label={`${n}`}
                    className="pressable flex h-[clamp(96px,min(28vw,24vh),190px)] w-[clamp(84px,min(24vw,20vh),160px)] flex-col items-center justify-center gap-2 rounded-[2rem] border-4 border-white text-white shadow-[0_10px_0_0_rgba(0,0,0,0.15)]"
                    style={{ background: color }}
                  >
                    <span
                      className="text-[clamp(3rem,min(14vw,12vh),7rem)] leading-none"
                      style={{ textShadow: "0 4px 0 rgba(0,0,0,0.15)" }}
                    >
                      {n}
                    </span>
                    <Dots n={n} color="#fff" size={12} />
                  </motion.button>
                );
              })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {phase === "done" && countedUpTo === count ? (
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
