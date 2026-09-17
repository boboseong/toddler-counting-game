import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { CYCLE_ORDER, GAME_META, type CycleReason, type GameId } from "../lib/data";
import { SpeechBubble } from "./ui";

/* ---------- 전환 화면: "이번엔 거품 팡팡!" ---------- */
export function CycleTransition({ game, reason }: { game: GameId; reason: CycleReason }) {
  const meta = GAME_META[game];
  const idx = CYCLE_ORDER.indexOf(game);
  const lead = reason === "start" ? "먼저" : reason === "idle" ? "다른 놀이 해 볼까? 이번엔" : "이번엔";

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden text-white"
      style={{ background: meta.bg }}
    >
      {/* 빛줄기 */}
      <motion.div
        className="pointer-events-none absolute h-[150vmax] w-[150vmax] opacity-20"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, #fff 0deg 10deg, transparent 10deg 20deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative flex items-center gap-3 px-4"
      >
        <span className="emoji text-5xl sm:text-6xl short:text-4xl">🐥</span>
        <SpeechBubble
          tail="left"
          className="break-keep text-center text-2xl sm:text-3xl short:px-4 short:py-1.5 short:text-lg"
        >
          {lead} {meta.title}
          {meta.title.endsWith("?") ? "" : "!"}
        </SpeechBubble>
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -25, y: 80 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.15 }}
        className="relative mt-6 flex h-[clamp(7rem,26vh,11rem)] w-[clamp(7rem,26vh,11rem)] items-center justify-center rounded-[2.5rem] border-8 border-white bg-white/30 shadow-2xl short:mt-2"
      >
        <motion.span
          className="emoji text-[clamp(4rem,15vh,6.5rem)]"
          animate={{ y: [0, -14, 0], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        >
          {meta.emoji}
        </motion.span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="relative mt-3 text-4xl sm:text-5xl short:mt-1 short:text-3xl"
        style={{ textShadow: "0 3px 0 rgba(0,0,0,0.2)" }}
      >
        {meta.title}
      </motion.div>

      {/* 순서 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative mt-8 flex items-center gap-2 rounded-full border-4 border-white bg-white/85 px-4 py-2 short:mt-3 short:py-1"
      >
        {CYCLE_ORDER.map((g, i) => (
          <span key={g} className="flex items-center gap-2">
            {i > 0 ? <span className="text-slate-300">›</span> : null}
            <span
              className={`emoji transition-all ${
                i === idx ? "text-4xl short:text-3xl" : "text-2xl opacity-40 short:text-xl"
              }`}
            >
              {GAME_META[g].emoji}
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- 놀이 중 위쪽 순서 띠 (길게 누르면 다음 놀이) ---------- */
const SKIP_HOLD_MS = 900;

export function CycleBar({
  current,
  wins,
  needed,
  onSkip,
}: {
  current: GameId;
  wins: number;
  needed: number;
  onSkip: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | null>(null);

  const start = () => {
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      timer.current = null;
      onSkip();
    }, SKIP_HOLD_MS);
  };
  const end = () => {
    setHolding(false);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-20 flex justify-center sm:top-4">
      <motion.button
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onPointerDown={start}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="빙글빙글 순서 (길게 누르면 다음 놀이)"
        className="pointer-events-auto relative flex items-end gap-1.5 overflow-hidden rounded-full border-2 border-white bg-white/85 px-3 py-1 shadow"
      >
        {holding ? (
          <motion.span
            className="absolute inset-0 bg-pink-300/50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: SKIP_HOLD_MS / 1000, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        ) : null}
        {CYCLE_ORDER.map((g) => {
          const active = g === current;
          return (
            <span key={g} className="relative flex flex-col items-center">
              <span
                className={`emoji transition-all ${active ? "text-2xl sm:text-3xl" : "text-base opacity-40 sm:text-lg"}`}
              >
                {GAME_META[g].emoji}
              </span>
              {active ? (
                <span className="mt-0.5 flex gap-0.5">
                  {Array.from({ length: needed }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${i < wins ? "bg-amber-400" : "bg-slate-200"}`}
                    />
                  ))}
                </span>
              ) : null}
            </span>
          );
        })}
      </motion.button>
    </div>
  );
}
