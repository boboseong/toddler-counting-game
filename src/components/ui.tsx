import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { NUM_COLORS } from "../lib/data";

/* ---------- 배경 ---------- */
export function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-50 to-amber-50" />
      <div className="floaty absolute -left-10 top-10 h-40 w-64 rounded-full bg-white/70 blur-md" />
      <div className="floaty-slow absolute right-[-40px] top-24 h-32 w-56 rounded-full bg-white/60 blur-md" />
      <div className="floaty absolute bottom-24 left-1/3 h-28 w-52 rounded-full bg-white/50 blur-md" />
      <div className="floaty-slow absolute right-6 top-6 text-6xl opacity-90 emoji">
        ☀️
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 rounded-t-[50%] bg-gradient-to-t from-lime-200 to-lime-100/60" />
    </div>
  );
}

/* ---------- 상단 바 ---------- */
export function TopBar({
  onHome,
  stars,
  title,
  emoji,
  right,
}: {
  onHome?: () => void;
  stars: number;
  title?: string;
  emoji?: string;
  right?: ReactNode;
}) {
  return (
    <div className="relative z-10 flex items-center justify-between px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="flex items-center gap-3">
        {onHome ? (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onHome}
            aria-label="홈으로"
            className="pressable flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-[0_5px_0_0_rgba(0,0,0,0.12)] sm:h-16 sm:w-16 sm:text-4xl"
          >
            <span className="emoji">🏠</span>
          </motion.button>
        ) : null}
        {title ? (
          <div className="hidden items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-xl text-slate-700 shadow sm:flex sm:text-2xl">
            {emoji ? <span className="emoji text-2xl">{emoji}</span> : null}
            <span>{title}</span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {right}
        <StarJar stars={stars} />
      </div>
    </div>
  );
}

/* ---------- 별 항아리 ---------- */
export function StarJar({ stars }: { stars: number }) {
  return (
    <motion.div
      key={stars}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
      transition={{ duration: 0.5 }}
      id="star-jar"
      className="flex h-14 items-center gap-1 rounded-2xl bg-white px-3 shadow-[0_5px_0_0_rgba(0,0,0,0.12)] sm:h-16 sm:px-4"
    >
      <span className="emoji text-3xl sm:text-4xl">⭐</span>
      <span className="min-w-[1.5ch] text-center text-3xl text-amber-500 sm:text-4xl">
        {stars}
      </span>
    </motion.div>
  );
}

/* ---------- 큰 숫자 ---------- */
export function BigNumeral({
  n,
  className = "",
  outline = true,
}: {
  n: number;
  className?: string;
  outline?: boolean;
}) {
  return (
    <span
      className={`inline-block font-bold leading-none ${outline ? "text-outline" : ""} ${className}`}
      style={{
        color: NUM_COLORS[(n - 1) % NUM_COLORS.length],
        textShadow: "0 4px 0 rgba(0,0,0,0.12)",
      }}
    >
      {n}
    </span>
  );
}

/* ---------- 점 패턴 (수량 시각화) ---------- */
export function Dots({
  n,
  color,
  size = 14,
}: {
  n: number;
  color?: string;
  size?: number;
}) {
  const c = color ?? NUM_COLORS[(n - 1) % NUM_COLORS.length];
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="inline-block rounded-full border-2 border-white shadow"
          style={{ width: size, height: size, background: c }}
        />
      ))}
    </div>
  );
}

/* ---------- 말풍선 ---------- */
export function SpeechBubble({
  children,
  className = "",
  tail = "left",
}: {
  children: ReactNode;
  className?: string;
  tail?: "left" | "bottom";
}) {
  return (
    <div
      className={`relative rounded-3xl border-4 border-white bg-white/95 px-5 py-3 text-slate-700 shadow-lg ${className}`}
    >
      {children}
      {tail === "left" ? (
        <span className="absolute -left-4 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[14px] border-r-[18px] border-y-transparent border-r-white" />
      ) : (
        <span className="absolute -bottom-4 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[18px] border-x-transparent border-t-white" />
      )}
    </div>
  );
}

/* ---------- 라운드 성공 배너 ---------- */
export function WinBanner({
  emoji,
  n,
  label,
  praise,
}: {
  emoji: string;
  n: number;
  label: string; // "세 개"
  praise: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.3, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-2 rounded-[2.5rem] border-8 border-yellow-300 bg-white/95 px-8 py-6 text-center shadow-2xl">
        <div className="text-2xl text-amber-500 sm:text-3xl">{praise}</div>
        <div className="flex items-center gap-4">
          <span className="emoji text-6xl sm:text-7xl">{emoji}</span>
          <BigNumeral n={n} className="text-8xl sm:text-9xl" />
        </div>
        <div className="text-3xl text-slate-700 sm:text-4xl">{label}!</div>
        <div className="mt-1 flex gap-2">
          {Array.from({ length: n }).map((_, i) => (
            <motion.span
              key={i}
              className="emoji text-3xl sm:text-4xl"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 400 }}
            >
              ⭐
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- 안내 듣는 중 ---------- */
export function ListenChip({ text = "잘 들어 봐!" }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: [1, 1.06, 1] }}
      transition={{ scale: { duration: 0.9, repeat: Infinity } }}
      className="flex items-center gap-2 rounded-full border-4 border-white bg-violet-100 px-5 py-2 text-2xl text-violet-600 shadow"
    >
      <span className="emoji text-3xl">👂</span>
      <span>{text}</span>
    </motion.div>
  );
}

/* ---------- 막 눌렀을 때 배너 ---------- */
export function SlowBanner({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.6, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-2 rounded-[2.5rem] border-8 border-sky-300 bg-white/95 px-8 py-6 text-center shadow-2xl">
        <motion.span
          className="emoji text-7xl sm:text-8xl"
          animate={{ x: [0, 12, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          🐢
        </motion.span>
        <div className="text-3xl text-sky-600 sm:text-4xl">천천히, 하나씩!</div>
        <div className="text-xl text-slate-500 sm:text-2xl">{text}</div>
      </div>
    </motion.div>
  );
}

/* ---------- 게임 화면 프레임 ---------- */
export function GameFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <Background />
      {children}
    </div>
  );
}
