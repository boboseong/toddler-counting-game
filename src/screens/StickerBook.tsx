import { motion } from "framer-motion";
import { useState } from "react";
import { playDing, speak } from "../lib/audio";
import { STARS_PER_STICKER, STICKERS } from "../lib/data";
import { GameFrame, TopBar } from "../components/ui";

interface Props {
  stars: number;
  unlocked: number[];
  onHome: () => void;
}

export default function StickerBook({ stars, unlocked, onHome }: Props) {
  const [bounce, setBounce] = useState<number | null>(null);
  const allDone = unlocked.length >= STICKERS.length;
  const filled = allDone ? STARS_PER_STICKER : stars % STARS_PER_STICKER;

  const tapSticker = (i: number) => {
    if (!unlocked.includes(i)) {
      speak("별을 더 모으면 만날 수 있어요!");
      return;
    }
    playDing();
    setBounce(i);
    speak(`${STICKERS[i].name}!`, { pitch: 1.3 });
    window.setTimeout(() => setBounce((b) => (b === i ? null : b)), 700);
  };

  return (
    <GameFrame>
      <TopBar onHome={onHome} stars={stars} title="내 스티커" emoji="📒" />

      <div className="relative z-10 flex flex-1 flex-col items-center gap-4 overflow-y-auto px-4 pb-6 pt-3 no-scrollbar">
        {/* 다음 스티커까지 진행 */}
        <div className="flex items-center gap-3 rounded-full border-4 border-white bg-white/90 px-5 py-2 shadow">
          <span className="text-xl text-slate-600 sm:text-2xl">
            {allDone ? "모두 모았어요!" : "다음 친구까지"}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: STARS_PER_STICKER }).map((_, i) => (
              <motion.span
                key={i}
                className="emoji text-3xl sm:text-4xl"
                animate={i < filled ? { scale: [1, 1.2, 1] } : {}}
                transition={{ delay: i * 0.15 }}
                style={{ opacity: i < filled ? 1 : 0.25 }}
              >
                ⭐
              </motion.span>
            ))}
          </div>
        </div>

        {/* 스티커 그리드 */}
        <div className="grid w-full max-w-3xl grid-cols-4 gap-3 sm:gap-4">
          {STICKERS.map((s, i) => {
            const has = unlocked.includes(i);
            return (
              <motion.button
                key={s.emoji}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={
                  bounce === i
                    ? { opacity: 1, scale: [1, 1.3, 0.95, 1.1, 1], rotate: [0, -12, 12, 0] }
                    : { opacity: 1, scale: 1 }
                }
                transition={{ delay: bounce === i ? 0 : i * 0.04, duration: 0.6 }}
                whileTap={{ scale: 0.9 }}
                onPointerDown={() => tapSticker(i)}
                aria-label={has ? s.name : "잠긴 스티커"}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-3xl border-4 shadow-[0_6px_0_0_rgba(0,0,0,0.1)] ${
                  has
                    ? "border-white bg-gradient-to-br from-white to-yellow-100"
                    : "border-dashed border-slate-300 bg-white/50"
                }`}
              >
                <span
                  className={`emoji text-[clamp(2.4rem,9vw,4.5rem)] ${has ? "" : "grayscale opacity-30"}`}
                >
                  {has ? s.emoji : "❔"}
                </span>
                <span className={`text-base sm:text-lg ${has ? "text-slate-600" : "text-slate-400"}`}>
                  {has ? s.name : "?"}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameFrame>
  );
}
