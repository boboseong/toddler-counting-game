import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { NUM_COLORS, STARS_PER_STICKER } from "../lib/data";
import { GameBuddy } from "./buddy";

/* ---------- 배경 ---------- */

/** 놀이마다 다른 장면 */
export type Scene = "sky" | "orchard" | "picnic" | "farm" | "sea" | "dusk" | "town";

interface SceneSpec {
  sky: string;
  ground: string;
  /** 해 자리 */
  light: string;
  /** 오른쪽 아래 풀밭 위 소품 (왼쪽 아래는 같이 노는 친구 자리) */
  right: string;
}

const SCENES: Record<Scene, SceneSpec> = {
  sky: {
    sky: "from-sky-200 via-sky-50 to-amber-50",
    ground: "from-lime-200 to-lime-100/60",
    light: "☀️",
    right: "🌷🌼",
  },
  orchard: {
    sky: "from-sky-200 via-sky-50 to-lime-50",
    ground: "from-green-300 to-lime-100/60",
    light: "☀️",
    right: "🌳🍎",
  },
  picnic: {
    sky: "from-cyan-100 via-sky-50 to-yellow-50",
    ground: "from-lime-200 to-lime-100/60",
    light: "🌤️",
    right: "🧺🌼",
  },
  farm: {
    sky: "from-sky-200 via-orange-50 to-amber-50",
    ground: "from-yellow-200 to-lime-100/60",
    light: "☀️",
    right: "🌻🏡",
  },
  sea: {
    sky: "from-sky-200 via-cyan-50 to-cyan-50",
    ground: "from-amber-200 to-amber-100/60",
    light: "☀️",
    right: "🐚🦀",
  },
  dusk: {
    sky: "from-violet-200 via-pink-50 to-amber-50",
    ground: "from-emerald-200 to-lime-100/60",
    light: "🌙",
    right: "✨🌟",
  },
  town: {
    sky: "from-sky-200 via-sky-50 to-rose-50",
    ground: "from-lime-200 to-lime-100/60",
    light: "☀️",
    right: "",
  },
};

export function Background({ scene = "sky" }: { scene?: Scene }) {
  const sp = SCENES[scene];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-b ${sp.sky}`} />
      <div className="floaty absolute -left-10 top-10 h-40 w-64 rounded-full bg-white/70 blur-md" />
      <div className="floaty-slow absolute right-[-40px] top-24 h-32 w-56 rounded-full bg-white/60 blur-md" />
      <div className="floaty absolute bottom-24 left-1/3 h-28 w-52 rounded-full bg-white/50 blur-md" />
      <div className="floaty-slow absolute right-6 top-6 text-6xl opacity-90 emoji">{sp.light}</div>
      {scene === "dusk" ? (
        <>
          <span className="twinkle emoji absolute left-[12%] top-[18%] text-2xl">✨</span>
          <span className="twinkle emoji absolute left-[48%] top-[9%] text-xl" style={{ animationDelay: "0.8s" }}>
            ⭐
          </span>
          <span className="twinkle emoji absolute right-[22%] top-[30%] text-2xl" style={{ animationDelay: "1.6s" }}>
            ✨
          </span>
        </>
      ) : null}
      <div className={`absolute bottom-0 left-0 right-0 h-24 rounded-t-[50%] bg-gradient-to-t ${sp.ground}`} />
      {sp.right ? (
        <div className="emoji absolute bottom-2 right-2 text-3xl opacity-70 sm:bottom-3 sm:right-3 sm:text-5xl short:text-3xl">
          {sp.right}
        </div>
      ) : null}
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

/**
 * 다음 스티커까지 채워지는 별 3칸 (아이는 숫자보다 칸이 차는 걸 보고 안다).
 * 모은 별 전체 수는 옆에 작게. 한 칸만 남으면 빈 칸이 두근거린다.
 */
export function StarJar({ stars }: { stars: number }) {
  const filled = stars % STARS_PER_STICKER;
  const almost = filled === STARS_PER_STICKER - 1;
  return (
    <motion.div
      key={stars}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
      transition={{ duration: 0.5 }}
      id="star-jar"
      aria-label={`별 ${stars}개`}
      className="flex h-14 items-center gap-0.5 rounded-2xl bg-white px-2 shadow-[0_5px_0_0_rgba(0,0,0,0.12)] sm:h-16 sm:gap-1.5 sm:px-4"
    >
      {Array.from({ length: STARS_PER_STICKER }).map((_, i) => {
        const on = i < filled;
        const next = almost && i === filled;
        return (
          <motion.span
            key={i}
            className="emoji text-xl sm:text-3xl"
            style={on ? undefined : { filter: "grayscale(1)", opacity: next ? 0.55 : 0.25 }}
            animate={next ? { scale: [1, 1.25, 1] } : {}}
            transition={next ? { duration: 0.9, repeat: Infinity } : undefined}
          >
            ⭐
          </motion.span>
        );
      })}
      <span className="ml-0.5 hidden min-w-[1.5ch] text-center text-xl text-amber-500 min-[400px]:inline sm:text-2xl">
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
  // 5개가 넘으면 5개씩 줄을 맞춰서 (열 묶음이 눈에 보이게)
  const layout =
    n > 5 ? "grid grid-cols-5 gap-1" : "flex flex-wrap items-center justify-center gap-1.5";
  return (
    <div className={layout}>
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
      <div className="flex flex-col items-center gap-2 rounded-[2.5rem] border-8 border-yellow-300 bg-white/95 px-8 py-6 text-center shadow-2xl short:gap-0.5 short:rounded-3xl short:border-4 short:px-5 short:py-2">
        <div className="text-2xl text-amber-500 sm:text-3xl short:text-lg">{praise}</div>
        <div className="flex items-center gap-4 short:gap-2">
          <span className="emoji text-6xl sm:text-7xl short:text-4xl">{emoji}</span>
          <BigNumeral n={n} className="text-8xl sm:text-9xl short:text-6xl" />
        </div>
        <div className="text-3xl text-slate-700 sm:text-4xl short:text-xl">{label}!</div>
        <div className="mt-1 flex max-w-[18rem] flex-wrap justify-center gap-1.5 sm:max-w-sm sm:gap-2 short:mt-0 short:max-w-md short:gap-1">
          {Array.from({ length: n }).map((_, i) => (
            <motion.span
              key={i}
              className={`emoji ${n > 10 ? "text-2xl sm:text-3xl short:text-lg" : "text-3xl sm:text-4xl short:text-xl"}`}
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
export function GameFrame({
  children,
  scene,
  buddy = true,
}: {
  children: ReactNode;
  scene?: Scene;
  /** 왼쪽 아래에 같이 노는 친구를 보여 줄지 */
  buddy?: boolean;
}) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <Background scene={scene} />
      {buddy ? <GameBuddy /> : null}
      {children}
    </div>
  );
}
