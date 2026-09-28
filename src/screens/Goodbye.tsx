import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { speak } from "../lib/audio";
import { STICKERS } from "../lib/data";
import { P } from "../lib/phrases";
import { Background, SpeechBubble } from "../components/ui";

interface Props {
  todayStars: number;
  todayStickers: number[];
  onDone: () => void;
}

/** 이 시간 동안은 눌러도 넘어가지 않는다 (막 눌러서 지나치지 않게) */
const MIN_MS = 3000;
/** 별을 이만큼까지만 그리고, 넘으면 "+n" */
const MAX_DRAWN = 12;

/** 놀이 시간 알림: "오늘은 여기까지! 내일 또 만나" */
export default function Goodbye({ todayStars, todayStickers, onDone }: Props) {
  const openedAt = useRef(performance.now());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const say = P.bye(
      todayStars,
      todayStickers.map((i) => STICKERS[i].name),
    );
    const t1 = window.setTimeout(() => speak(say, { pitch: 1.2 }), 300);
    const t2 = window.setTimeout(() => setReady(true), MIN_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [todayStars, todayStickers]);

  const tryDone = () => {
    if (performance.now() - openedAt.current < MIN_MS) return;
    onDone();
  };

  const drawn = Math.min(todayStars, MAX_DRAWN);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden px-4 short:gap-2"
      onPointerDown={tryDone}
    >
      <Background scene="dusk" />

      <div className="relative z-10 flex items-center gap-3">
        <motion.span
          className="emoji relative text-[clamp(4rem,min(18vw,16vh),7rem)] drop-shadow-lg"
          animate={{ rotate: [0, -6, 0, 6, 0], y: [0, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🐥
          <motion.span
            className="absolute -right-6 -top-4 text-[0.4em]"
            animate={{ y: [0, -14], opacity: [1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            💤
          </motion.span>
        </motion.span>
        <SpeechBubble tail="left" className="text-2xl sm:text-3xl short:py-1.5 short:text-xl">
          오늘은 여기까지!
        </SpeechBubble>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 rounded-[2.5rem] border-8 border-yellow-200 bg-white/95 px-8 py-5 shadow-2xl short:gap-1 short:py-2">
        <div className="text-2xl text-slate-600 sm:text-3xl short:text-lg">오늘 모은 별</div>
        <div className="flex max-w-[20rem] flex-wrap justify-center gap-1 sm:max-w-md">
          {Array.from({ length: drawn }).map((_, i) => (
            <motion.span
              key={i}
              className="emoji text-3xl sm:text-4xl short:text-2xl"
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 400 }}
            >
              ⭐
            </motion.span>
          ))}
          {todayStars > MAX_DRAWN ? (
            <span className="self-center text-2xl text-amber-500">+{todayStars - MAX_DRAWN}</span>
          ) : null}
        </div>
        <div className="text-4xl text-amber-500 sm:text-5xl short:text-3xl">{todayStars}개</div>
        {todayStickers.length > 0 ? (
          <div className="mt-1 flex items-center gap-2 text-xl text-slate-500 short:mt-0 short:text-base">
            <span>새 친구</span>
            {todayStickers.slice(-6).map((i) => (
              <span key={i} className="emoji text-4xl short:text-3xl">
                {STICKERS[i].emoji}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative z-10 text-3xl text-violet-600 sm:text-4xl short:text-2xl">
        내일 또 만나! 👋
      </div>
      <motion.div
        className="relative z-10 text-lg text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
      >
        화면을 누르면 처음으로 가요
      </motion.div>
    </div>
  );
}
