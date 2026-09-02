import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { playBubble, speak } from "../lib/audio";
import {
  COUNT_WORDS,
  NUM_COLORS,
  bubbleTargetForLevel,
  randomInt,
  randomPraise,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { BigNumeral, GameFrame, TopBar } from "../components/ui";
import type { GameProps } from "../types";

interface Bubble {
  id: number;
  x: number; // percent
  size: number;
  hue: number;
  duration: number;
  emoji: string;
}

interface PopFx {
  id: number;
  x: number;
  y: number;
  n: number;
}

const INNER = ["🐟", "⭐", "🐥", "🦋", "🌸", "🐙", "🍓", "🐢", ""];

export default function BubbleGame({ level, stars, onHome, onWin, onResult }: GameProps) {
  const { after } = useTimers();
  const target = bubbleTargetForLevel(level);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [pops, setPops] = useState<PopFx[]>([]);
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [praise, setPraise] = useState("");
  const idRef = useRef(0);
  const nRef = useRef(0);
  const phaseRef = useRef<"play" | "done">("play");

  const makeBubble = (): Bubble => ({
    id: ++idRef.current,
    x: randomInt(2, 96),
    size: randomInt(96, 150),
    hue: randomInt(0, 360),
    duration: randomInt(7, 11),
    emoji: INNER[randomInt(0, INNER.length - 1)],
  });

  useEffect(() => {
    after(400, () => speak("거품을 톡톡 터뜨리면서 같이 세어 보자!", { interrupt: false }));
    // 처음에 몇 개 미리 띄우기
    setBubbles([makeBubble(), makeBubble(), makeBubble()]);
    const iv = window.setInterval(() => {
      setBubbles((b) => (b.length >= 7 ? b : [...b, makeBubble()]));
    }, 1000);
    return () => window.clearInterval(iv);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const removeBubble = (id: number) =>
    setBubbles((b) => b.filter((x) => x.id !== id));

  const handlePop = (b: Bubble, e: PointerEvent<HTMLButtonElement>) => {
    removeBubble(b.id);
    if (phaseRef.current !== "play") {
      playBubble(1);
      return;
    }
    const next = nRef.current + 1;
    nRef.current = next;
    setN(next);
    playBubble(next);
    speak(COUNT_WORDS[next - 1], { rate: 0.85, pitch: 1.2 });

    const fx: PopFx = { id: b.id, x: e.clientX, y: e.clientY, n: next };
    setPops((p) => [...p, fx]);
    after(900, () => setPops((p) => p.filter((x) => x.id !== fx.id)));

    if (next >= target) {
      phaseRef.current = "done";
      setPhase("done");
      const p = randomPraise();
      setPraise(p);
      after(700, () => {
        speak(`와! ${COUNT_WORDS[target - 1]}까지 다 셌어요! ${p}`, { interrupt: false });
        onWin();
        onResult(true);
      });
      after(3800, () => {
        nRef.current = 0;
        phaseRef.current = "play";
        setN(0);
        setPhase("play");
      });
    }
  };

  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  return (
    <GameFrame>
      {/* 물 속 느낌 배경 오버레이 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-100/40 to-sky-300/50" />

      <div className="relative z-30">
        <TopBar onHome={onHome} stars={stars} title="거품 팡팡" emoji="🫧" />
      </div>

      {/* 상단 숫자 표시 */}
      <div className="pointer-events-none relative z-20 flex flex-col items-center gap-2 pt-2">
        <div className="flex h-[clamp(4rem,14vh,8rem)] items-center justify-center">
          <AnimatePresence mode="popLayout">
            {n > 0 ? (
              <motion.div
                key={n}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 16 }}
              >
                <BigNumeral n={n} className="text-[clamp(4rem,13vh,8rem)]" />
              </motion.div>
            ) : (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-full bg-white/80 px-5 py-2 text-2xl text-slate-600 shadow"
              >
                거품을 톡톡! 🫧
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 px-4">
          {Array.from({ length: target }).map((_, i) => (
            <motion.div
              key={i}
              animate={i < n ? { scale: [1, 1.4, 1] } : {}}
              className="h-6 w-6 rounded-full border-2 border-white shadow sm:h-8 sm:w-8"
              style={{
                background: i < n ? NUM_COLORS[i % NUM_COLORS.length] : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </div>
      </div>

      {/* 거품들 */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              className="absolute"
              style={{
                // 작은 화면에서도 오른쪽으로 잘리지 않게 위치를 화면 안으로 고정
                left: `min(${b.x}%, calc(100% - ${b.size + 8}px))`,
                bottom: -b.size - 20,
              }}
              initial={{ y: 0 }}
              animate={{ y: -(vh + b.size + 60) }}
              exit={{ scale: 1.7, opacity: 0, transition: { duration: 0.18 } }}
              transition={{ duration: b.duration, ease: "linear" }}
              onAnimationComplete={() => removeBubble(b.id)}
            >
              <button
                onPointerDown={(e) => handlePop(b, e)}
                aria-label="거품"
                className="sway relative flex items-center justify-center rounded-full"
                style={{
                  width: b.size,
                  height: b.size,
                  background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.95) 0%, hsla(${b.hue},90%,85%,0.85) 25%, hsla(${b.hue},85%,70%,0.55) 70%, hsla(${b.hue},80%,60%,0.75) 100%)`,
                  boxShadow: `inset -8px -10px 20px hsla(${b.hue},80%,50%,0.35), 0 8px 20px rgba(0,0,0,0.12)`,
                  border: "3px solid rgba(255,255,255,0.85)",
                }}
              >
                <span className="absolute left-[18%] top-[14%] h-[18%] w-[26%] rotate-[-30deg] rounded-full bg-white/90" />
                {b.emoji ? (
                  <span className="emoji" style={{ fontSize: b.size * 0.42 }}>
                    {b.emoji}
                  </span>
                ) : null}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 팡 효과 숫자 */}
      <div className="pointer-events-none fixed inset-0 z-40">
        <AnimatePresence>
          {pops.map((p) => (
            <motion.div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: p.x, top: p.y }}
              initial={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0, y: -80 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
            >
              <BigNumeral n={p.n} className="text-7xl" />
              <span className="emoji absolute -right-8 -top-6 text-4xl">✨</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 완료 배너 */}
      <AnimatePresence>
        {phase === "done" ? (
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-2 rounded-[2.5rem] border-8 border-cyan-300 bg-white/95 px-10 py-6 text-center shadow-2xl">
              <div className="text-2xl text-cyan-500 sm:text-3xl">{praise}</div>
              <BigNumeral n={target} className="text-[clamp(5rem,16vh,8rem)]" />
              <div className="text-3xl text-slate-700 sm:text-4xl">
                {COUNT_WORDS[target - 1]}까지 다 셌어요!
              </div>
              <div className="emoji mt-1 text-4xl">🫧🎉🫧</div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </GameFrame>
  );
}
