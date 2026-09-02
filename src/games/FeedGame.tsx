import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { playChomp, playDing, playPop, playSoft, speak } from "../lib/audio";
import {
  ANIMALS,
  COUNT_WORDS,
  MAX_LEVEL,
  NUM_COLORS,
  counterPhrase,
  maxCountForLevel,
  pick,
  randomIntExcept,
  randomPraise,
  subj,
  type Animal,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { BigNumeral, GameFrame, SpeechBubble, TopBar, WinBanner } from "../components/ui";
import type { GameProps } from "../types";

interface Round {
  id: number;
  animal: Animal;
  count: number;
  trayCount: number;
  /** 최고 레벨: 딱 맞게 준 다음 "다 줬어요" 를 눌러야 끝난다 */
  needConfirm: boolean;
}

type Phase = "play" | "done";

export default function FeedGame({ level, stars, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
  const prev = useRef<{ animal?: Animal; count?: number }>({});
  const levelRef = useRef(level);
  levelRef.current = level;

  const newRound = (id: number): Round => {
    const lv = levelRef.current;
    const animal = pick(ANIMALS, prev.current.animal);
    const count = randomIntExcept(1, maxCountForLevel(lv), prev.current.count);
    prev.current = { animal, count };
    return {
      id,
      animal,
      count,
      trayCount: Math.min(count + 2, 7),
      needConfirm: lv >= MAX_LEVEL,
    };
  };

  const [round, setRound] = useState<Round>(() => newRound(0));
  const [eaten, setEaten] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("play");
  const [yum, setYum] = useState(0);
  const [praise, setPraise] = useState("");
  const [tooFull, setTooFull] = useState(false);

  // 동시 터치에 안전하도록 ref 기준으로 판단
  const eatenRef = useRef<number[]>([]);
  const phaseRef = useRef<Phase>("play");
  const overfed = useRef(0);

  const { animal, count, trayCount, needConfirm } = round;
  const food = animal.food;
  const fed = eaten.length;
  const isFull = fed >= count;

  useEffect(() => {
    after(400, () =>
      speak(
        `${subj(animal.name)} 말해요. ${food.name} ${counterPhrase(count, food.counter)} 주세요!`,
        { interrupt: false, pitch: 1.3 },
      ),
    );
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => {
    phaseRef.current = "done";
    setPhase("done");
    const p = randomPraise();
    setPraise(p);
    const ok = overfed.current === 0;
    after(900, () => {
      speak(
        `냠냠! ${food.name} ${counterPhrase(count, food.counter)}! 배불러요, 고마워! ${p}`,
        { interrupt: false, pitch: 1.3 },
      );
      onWin();
      onResult(ok);
    });
    after(4000, () => {
      clearAll();
      eatenRef.current = [];
      phaseRef.current = "play";
      overfed.current = 0;
      setEaten([]);
      setYum(0);
      setTooFull(false);
      setPhase("play");
      setRound((r) => newRound(r.id + 1));
    });
  };

  const handleFeed = (i: number) => {
    if (phaseRef.current !== "play") return;
    if (eatenRef.current.includes(i)) return;

    if (eatenRef.current.length >= count) {
      // 최고 레벨에서만 올 수 있는 경우: 너무 많이 줬어요
      overfed.current += 1;
      playSoft();
      setTooFull(true);
      speak("배불러요! 그만 주세요~", { pitch: 1.3 });
      after(1200, () => setTooFull(false));
      if (overfed.current === 1) onResult(false);
      return;
    }

    const next = [...eatenRef.current, i];
    eatenRef.current = next;
    setEaten(next);
    setYum((y) => y + 1);
    const n = next.length;
    playPop(n);
    after(180, playChomp);
    speak(COUNT_WORDS[n - 1], { rate: 0.85, pitch: 1.2 });

    if (n === count) {
      if (needConfirm) {
        after(900, () => speak("이제 다 줬으면 '다 줬어요' 를 눌러 줘!", { interrupt: false }));
      } else {
        finish();
      }
    }
  };

  const handleConfirm = () => {
    if (phaseRef.current !== "play") return;
    if (eatenRef.current.length < count) {
      playSoft();
      speak("아직 배고파요! 더 주세요~", { pitch: 1.3 });
      return;
    }
    playDing();
    finish();
  };

  return (
    <GameFrame>
      <TopBar onHome={onHome} stars={stars} title="냠냠 먹이 주기" emoji="🍽️" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-between overflow-y-auto px-4 pb-4 pt-2 no-scrollbar short:pb-2 short:pt-0">
        {/* 동물 + 요청 */}
        <div className="flex w-full max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6 short:gap-3">
          <motion.div
            key={`${round.id}-animal`}
            animate={
              phase === "done"
                ? { rotate: [0, -12, 12, -12, 12, 0], scale: [1, 1.15, 1] }
                : tooFull
                  ? { x: [0, -10, 10, -10, 10, 0] }
                  : yum > 0
                    ? { scale: [1, 1.2, 0.95, 1] }
                    : {}
            }
            transition={
              phase === "done"
                ? { duration: 1.2, repeat: Infinity }
                : { duration: 0.45 }
            }
            className={`relative ${phase === "play" && yum === 0 ? "bob" : ""}`}
          >
            <span className="emoji text-[clamp(4rem,min(22vw,18vh),10rem)] drop-shadow-lg">
              {animal.emoji}
            </span>
            <AnimatePresence>
              {yum > 0 && phase === "play" && !tooFull ? (
                <motion.span
                  key={yum}
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -40, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute -right-6 top-0 text-3xl text-pink-500 sm:text-4xl"
                >
                  냠!
                </motion.span>
              ) : null}
              {tooFull ? (
                <motion.span
                  key="full"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -right-10 top-0 whitespace-nowrap rounded-full bg-white px-3 py-1 text-2xl text-rose-500 shadow"
                >
                  배불러요!
                </motion.span>
              ) : null}
            </AnimatePresence>
            {phase === "done" ? (
              <>
                <motion.span
                  className="emoji absolute -left-4 top-0 text-4xl"
                  animate={{ y: [-5, -30], opacity: [1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  💕
                </motion.span>
                <motion.span
                  className="emoji absolute -right-4 top-4 text-4xl"
                  animate={{ y: [-5, -30], opacity: [1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
                >
                  💖
                </motion.span>
              </>
            ) : null}
          </motion.div>

          <SpeechBubble tail="left" className="flex flex-col items-center gap-2 px-6 py-4 short:gap-1 short:px-4 short:py-2">
            <div className="flex items-center gap-3">
              <span className="emoji text-5xl sm:text-6xl short:text-4xl">{food.emoji}</span>
              <BigNumeral n={count} className="text-[clamp(3.5rem,10vh,6rem)] short:text-[2.6rem]" />
              <span className="text-2xl text-slate-600 sm:text-3xl short:text-xl">
                {food.counter} 주세요!
              </span>
            </div>
            {/* 채워지는 칸 */}
            <div className="flex items-center gap-2">
              {Array.from({ length: count }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={i < fed ? { scale: [0.6, 1.3, 1] } : {}}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-dashed sm:h-14 sm:w-14 short:h-9 short:w-9 short:border-2"
                  style={{
                    borderColor: NUM_COLORS[i % NUM_COLORS.length],
                    background: i < fed ? `${NUM_COLORS[i % NUM_COLORS.length]}33` : "transparent",
                  }}
                >
                  {i < fed ? (
                    <span className="emoji text-2xl sm:text-3xl">{food.emoji}</span>
                  ) : (
                    <span className="text-xl text-slate-300">{i + 1}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </SpeechBubble>
        </div>

        {/* 먹이 쟁반 */}
        <div className="flex w-full max-w-3xl flex-col items-center gap-2 short:gap-1">
          <div className="text-xl text-slate-500 sm:text-2xl short:text-base">
            {phase === "done"
              ? "배불러요! 🎉"
              : needConfirm && isFull
                ? "다 줬으면 아래 버튼을 눌러요"
                : `${food.name} 하나씩 눌러 주세요`}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={round.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="flex min-h-[clamp(90px,min(24vw,18vh),170px)] w-full flex-wrap items-center justify-center gap-3 rounded-[2.5rem] border-4 border-white bg-amber-100/90 px-5 py-4 shadow-xl sm:gap-5 short:min-h-0 short:rounded-3xl short:py-2"
            >
              <AnimatePresence>
                {Array.from({ length: trayCount })
                  .map((_, i) => i)
                  .filter((i) => !eaten.includes(i))
                  .map((i) => (
                    <motion.button
                      key={i}
                      layout
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, opacity: phase === "done" ? 0.4 : 1 }}
                      exit={{ y: -220, scale: 0.2, opacity: 0, rotate: 30 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      whileTap={{ scale: 0.85 }}
                      onPointerDown={() => handleFeed(i)}
                      aria-label={food.name}
                      className={`flex h-[clamp(64px,min(18vw,14vh),130px)] w-[clamp(64px,min(18vw,14vh),130px)] items-center justify-center rounded-3xl border-4 border-white bg-white shadow-[0_6px_0_0_rgba(0,0,0,0.1)] ${
                        phase === "play" ? "bob" : ""
                      }`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <span className="emoji text-[clamp(2.2rem,min(10vw,8vh),5rem)]">{food.emoji}</span>
                    </motion.button>
                  ))}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {needConfirm && phase === "play" ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, scale: isFull ? [1, 1.06, 1] : 1 }}
              transition={isFull ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
              whileTap={{ scale: 0.93 }}
              onPointerDown={handleConfirm}
              className={`pressable mt-1 rounded-full border-4 border-white px-8 py-3 text-2xl text-white shadow-[0_6px_0_0_rgba(0,0,0,0.15)] sm:text-3xl short:mt-0 short:px-5 short:py-1.5 short:text-lg ${
                isFull ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              🍽️ 다 줬어요!
            </motion.button>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {phase === "done" ? (
          <WinBanner
            emoji={food.emoji}
            n={count}
            label={`${food.name} ${counterPhrase(count, food.counter)}`}
            praise={praise}
          />
        ) : null}
      </AnimatePresence>
    </GameFrame>
  );
}
