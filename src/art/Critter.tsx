import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import type { ReactNode } from "react";
import { Face, Shine } from "./Face";
import { Svg } from "./Svg";
import { INK, LINE, stroke } from "./palette";
import type { ArtProps, Mood } from "./types";

/*
 * 동물 친구 공통 틀: 큰 머리 + 작은 몸 (viewBox 100).
 * 귀·코·무늬만 동물마다 다르게 적어서 모두 같은 그림체가 된다.
 * 머리 가운데 (50, 44), 반지름 28 / 몸 가운데 (50, 80).
 */

export type EarKind =
  | "round"
  | "bigRound"
  | "long"
  | "pointy"
  | "floppy"
  | "side"
  | "tiny"
  | "fluffy"
  | "none";

export type NoseKind = "dot" | "tri" | "big" | "snout" | "trunk" | "beak";

export interface CritterSpec {
  fur: string;
  /** 주둥이·배 색 */
  light: string;
  ears: EarKind;
  earInner?: string;
  earColor?: string;
  nose: NoseKind;
  noseColor?: string;
  /** 주둥이(밝은 타원)를 그릴지 */
  muzzle?: boolean;
  /** 팔·발 색 (판다처럼 다르면) */
  limbs?: string;
  /** 머리 뒤 (갈기·꼬리) */
  back?: ReactNode;
  /** 머리 위에 얹는 무늬 (얼굴보다 아래 층) */
  marks?: ReactNode;
  /** 얼굴보다 위 층 (수염 등) */
  front?: ReactNode;
}

/* ---------- 귀 (왼쪽을 그리고 오른쪽은 뒤집는다) ---------- */

function Ear({ kind, fur, inner, color }: { kind: EarKind; fur: string; inner: string; color?: string }) {
  const c = color ?? fur;
  switch (kind) {
    case "round":
      return (
        <g>
          <circle cx="28" cy="20" r="10" fill={c} {...stroke} />
          <circle cx="28" cy="21" r="5" fill={inner} />
        </g>
      );
    case "bigRound":
      return (
        <g>
          <circle cx="22" cy="22" r="15" fill={c} {...stroke} />
          <circle cx="23" cy="23" r="9" fill={inner} />
        </g>
      );
    case "long":
      return (
        <g transform="rotate(-10 38 22)">
          <ellipse cx="38" cy="6" rx="8" ry="20" fill={c} {...stroke} />
          <ellipse cx="38" cy="8" rx="4" ry="14" fill={inner} />
        </g>
      );
    case "pointy":
      return (
        <g>
          <path d="M25 32 L27 6 L46 20 Z" fill={c} {...stroke} />
          <path d="M29 25 L30 13 L40 20 Z" fill={inner} />
        </g>
      );
    case "floppy":
      return <path d="M28 22 C 12 22 8 48 16 58 C 26 60 30 42 32 26 Z" fill={c} {...stroke} />;
    case "side":
      return (
        <g>
          <ellipse cx="18" cy="46" rx="17" ry="21" fill={c} {...stroke} />
          <ellipse cx="20" cy="47" rx="10" ry="14" fill={inner} />
        </g>
      );
    case "tiny":
      return (
        <g>
          <path d="M28 26 L28 10 L42 19 Z" fill={c} {...stroke} />
          <path d="M31 21 L31 15 L37 19 Z" fill={inner} />
        </g>
      );
    case "fluffy":
      return (
        <g>
          <circle cx="22" cy="26" r="14" fill={c} {...stroke} />
          <circle cx="24" cy="28" r="8" fill={inner} />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- 코 ---------- */

function Nose({ kind, color }: { kind: NoseKind; color: string }) {
  switch (kind) {
    case "dot":
      return <ellipse cx="50" cy="51" rx="4.2" ry="3.2" fill={color} />;
    case "tri":
      return <path d="M46.5 50 L53.5 50 L50 54 Z" fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />;
    case "big":
      return <ellipse cx="50" cy="52" rx="6.5" ry="8" fill={color} />;
    case "snout":
      return (
        <g>
          <ellipse cx="50" cy="55" rx="10" ry="7" fill={color} {...stroke} strokeWidth={LINE * 0.8} />
          <ellipse cx="46.5" cy="55" rx="1.8" ry="2.6" fill={INK} opacity="0.7" />
          <ellipse cx="53.5" cy="55" rx="1.8" ry="2.6" fill={INK} opacity="0.7" />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- 움직임 ---------- */

type Anim = { animate: TargetAndTransition; transition: Transition };

const WHOLE: Partial<Record<Mood, Anim>> = {
  cheer: {
    animate: { y: [0, -14, 0, -7, 0], scaleY: [1, 1.06, 0.93, 1.03, 1] },
    transition: { duration: 0.9, repeat: Infinity, ease: "easeOut" },
  },
  happy: {
    animate: { y: [0, -6, 0] },
    transition: { duration: 0.7, repeat: Infinity, ease: "easeOut" },
  },
  surprised: { animate: { y: [0, -8, 0], scaleY: [1, 1.08, 1] }, transition: { duration: 0.35 } },
  hungry: {
    animate: { scaleY: [1, 1.03, 1], y: [0, -2, 0] },
    transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
  },
  idle: {
    animate: { scaleY: [1, 1.025, 1], scaleX: [1, 0.99, 1] },
    transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
  },
};

const HEAD: Partial<Record<Mood, Anim>> = {
  talk: { animate: { rotate: [0, -3, 3, 0] }, transition: { duration: 1.1, repeat: Infinity } },
  eating: { animate: { y: [0, 2, 0] }, transition: { duration: 0.24, repeat: Infinity } },
  hmm: { animate: { rotate: [0, -12, -10] }, transition: { duration: 0.5, ease: "easeOut" } },
  full: { animate: { rotate: [0, -8, 8, -8, 8, 0] }, transition: { duration: 0.7 } },
  sleepy: { animate: { rotate: [0, 8, 0], y: [0, 3, 0] }, transition: { duration: 3, repeat: Infinity } },
};

const STILL: Anim = { animate: {}, transition: {} };

/** 공통 틀로 그린 동물 */
export function Critter({ spec, mood = "idle", look, fullness = 0 }: ArtProps & { spec: CritterSpec }) {
  const s = spec;
  const inner = s.earInner ?? "#ffb3c1";
  const limbs = s.limbs ?? s.fur;
  const whole = WHOLE[mood] ?? STILL;
  const head = HEAD[mood] ?? STILL;
  const belly = 1 + Math.max(0, Math.min(1, fullness)) * 0.2;
  // 왼팔은 +각도로, 오른팔은 -각도로 돌려야 바깥쪽으로 올라간다
  const armAngle = (side: number) =>
    mood === "cheer" ? { rotate: [0, 150 * -side, 120 * -side, 150 * -side] } : { rotate: mood === "full" ? 20 * side : 0 };

  return (
    <Svg>
      <motion.g style={{ originX: "50%", originY: "100%" }} animate={whole.animate} transition={whole.transition}>
        {s.back}
        {/* 몸 (배가 부르면 조금씩 커진다) */}
        <motion.g
          style={{ originX: "50%", originY: "100%" }}
          animate={{ scale: belly }}
          transition={{ type: "spring", stiffness: 260, damping: 12 }}
        >
          <ellipse cx="40" cy="94" rx="7" ry="4.5" fill={limbs} {...stroke} />
          <ellipse cx="60" cy="94" rx="7" ry="4.5" fill={limbs} {...stroke} />
          <ellipse cx="50" cy="79" rx="23" ry="16" fill={s.fur} {...stroke} />
          <ellipse cx="50" cy="82" rx="14" ry="10" fill={s.light} />
        </motion.g>
        {/* 팔: 기쁘면 번쩍 */}
        {[-1, 1].map((side) => (
          <motion.ellipse
            key={side}
            cx={50 + side * 21}
            cy={80}
            rx={5.5}
            ry={8}
            fill={limbs}
            {...stroke}
            style={{ originX: "50%", originY: "10%" }}
            animate={armAngle(side)}
            transition={mood === "cheer" ? { duration: 0.9, repeat: Infinity } : { type: "spring", stiffness: 200, damping: 14 }}
          />
        ))}
        {/* 머리 */}
        <motion.g style={{ originX: "50%", originY: "90%" }} animate={head.animate} transition={head.transition}>
          {s.ears !== "none" ? (
            <>
              <Ear kind={s.ears} fur={s.fur} inner={inner} color={s.earColor} />
              <g transform="translate(100 0) scale(-1 1)">
                <Ear kind={s.ears} fur={s.fur} inner={inner} color={s.earColor} />
              </g>
            </>
          ) : null}
          <circle cx="50" cy="44" r="28" fill={s.fur} {...stroke} />
          <Shine x={34} y={27} rx={5} ry={8} />
          {s.marks}
          {s.muzzle ? <ellipse cx="50" cy="55" rx="12.5" ry="9" fill={s.light} /> : null}
          <Nose kind={s.nose} color={s.noseColor ?? INK} />
          <Face
            x={50}
            y={44}
            s={0.95}
            mood={mood}
            look={look}
            mouth={s.nose === "beak" ? "beak" : s.nose === "trunk" ? "none" : "mouth"}
            mouthDy={s.nose === "snout" ? 7 : s.nose === "big" ? 3 : 0}
          />
          {s.nose === "trunk" ? <Trunk color={s.fur} mood={mood} /> : null}
          {s.front}
        </motion.g>
      </motion.g>
    </Svg>
  );
}

/** 코끼리 코: 먹을 때 흔들, 기쁘면 번쩍 */
function Trunk({ color, mood }: { color: string; mood: Mood }) {
  const up = mood === "cheer" || mood === "happy";
  const eat = mood === "eating";
  return (
    <motion.g
      style={{ originX: "50%", originY: "0%" }}
      animate={up ? { rotate: -35 } : eat ? { rotate: [0, 10, -6, 0] } : { rotate: 0 }}
      transition={eat ? { duration: 0.35, repeat: Infinity } : { type: "spring", stiffness: 180, damping: 12 }}
    >
      <path
        d="M44 50 C 43 62 44 70 50 76 C 54 79 60 77 59 72 C 58 70 55 71 54 70 C 51 66 56 58 56 50 Z"
        fill={color}
        {...stroke}
      />
      <path d="M46 60 q5 1 9 0 M47 66 q4 1 7 0" stroke={INK} strokeWidth={1.4} fill="none" opacity="0.5" />
    </motion.g>
  );
}

/* ---------- 무늬 조각 ---------- */

export function Whiskers({ y = 55 }: { y?: number }) {
  const w = { stroke: INK, strokeWidth: 1.4, strokeLinecap: "round" as const, opacity: 0.6 };
  return (
    <g>
      <path d={`M24 ${y - 2} L36 ${y}`} {...w} />
      <path d={`M24 ${y + 3} L36 ${y + 2}`} {...w} />
      <path d={`M76 ${y - 2} L64 ${y}`} {...w} />
      <path d={`M76 ${y + 3} L64 ${y + 2}`} {...w} />
    </g>
  );
}
