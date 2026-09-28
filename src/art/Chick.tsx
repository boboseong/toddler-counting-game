import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import { forwardRef, useRef, type ReactNode } from "react";
import { Face, Shine } from "./Face";
import { Svg } from "./Svg";
import { INK, LINE, stroke } from "./palette";
import type { ArtProps, Mood } from "./types";
import { useLook } from "../fx/useLook";

const BODY = "#ffd84d";
const BODY_DARK = "#f5b92e";
const FEET = "#ff9f1c";

/** 몸 움직임: 표정마다 다르게 */
const BODY_ANIM: Partial<Record<Mood, { animate: TargetAndTransition; transition: Transition }>> = {
  idle: {
    animate: { scaleY: [1, 1.03, 1], scaleX: [1, 0.985, 1] },
    transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
  },
  talk: {
    animate: { scaleY: [1, 1.03, 1], rotate: [0, -2, 2, 0] },
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  happy: {
    animate: { y: [0, -10, 0], scaleY: [1, 1.06, 0.94, 1] },
    transition: { duration: 0.6, repeat: Infinity, ease: "easeOut" },
  },
  cheer: {
    animate: { y: [0, -16, 0, -8, 0], rotate: [0, -6, 6, 0], scaleY: [1, 1.08, 0.92, 1.04, 1] },
    transition: { duration: 0.9, repeat: Infinity, ease: "easeOut" },
  },
  surprised: {
    animate: { y: [0, -8, 0], scaleY: [1, 1.1, 1] },
    transition: { duration: 0.35 },
  },
  hmm: {
    animate: { rotate: [0, -10, -10, -8] },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  sleepy: {
    animate: { rotate: [0, 6, 0], y: [0, 3, 0] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

/** 병아리 그림 (몸·날개·발·볏·부리 분리). 날개는 기쁠 때 파닥인다 */
export function ChickArt({ mood = "idle", look }: ArtProps) {
  const flap = mood === "cheer" || mood === "happy";
  const anim = BODY_ANIM[mood] ?? BODY_ANIM.idle!;
  return (
    <Svg>
      {/* 발 */}
      <g fill={FEET} {...stroke} strokeWidth={LINE * 0.8}>
        <path d="M38 90 l-6 6 h12 z" />
        <path d="M62 90 l-6 6 h12 z" />
      </g>
      <motion.g
        style={{ originX: "50%", originY: "92%" }}
        animate={anim.animate}
        transition={anim.transition}
      >
        {/* 날개 (몸 뒤) */}
        <g className={flap ? "flap" : ""} style={{ transformOrigin: "90% 15%" }}>
          <path d="M24 52 C 8 54 6 70 16 74 C 22 72 26 64 26 56 Z" fill={BODY_DARK} {...stroke} />
        </g>
        <g className={flap ? "flap-r" : ""} style={{ transformOrigin: "10% 15%" }}>
          <path d="M76 52 C 92 54 94 70 84 74 C 78 72 74 64 74 56 Z" fill={BODY_DARK} {...stroke} />
        </g>
        {/* 몸 (알 모양 하나로 머리+몸) */}
        <path
          d="M50 14 C 76 14 86 40 86 60 C 86 80 70 92 50 92 C 30 92 14 80 14 60 C 14 40 24 14 50 14 Z"
          fill={BODY}
          {...stroke}
        />
        <ellipse cx="50" cy="76" rx="20" ry="12" fill="#fff3b0" opacity="0.7" />
        <Shine x={33} y={30} rx={6} ry={10} />
        {/* 머리 깃털 */}
        <path d="M50 15 C 46 6 40 6 38 9 C 43 9 46 12 47 16" fill={BODY} {...stroke} strokeWidth={LINE * 0.8} />
        <path d="M51 15 C 54 5 61 5 63 8 C 58 9 55 12 54 16" fill={BODY} {...stroke} strokeWidth={LINE * 0.8} />
        <Face x={50} y={46} s={1.05} mood={mood} look={look} mouth="beak" />
      </motion.g>
    </Svg>
  );
}

/**
 * 마스코트 병아리. 누른 곳을 쳐다보고, 표정에 따라 움직인다.
 * 잠잘 때는 Zzz, 기쁠 때는 하트가 뿅.
 */
export const Chick = forwardRef<HTMLSpanElement, { mood?: Mood; className?: string; children?: ReactNode }>(
  function Chick({ mood = "idle", className = "", children }, outer) {
    const inner = useRef<HTMLSpanElement>(null);
    const look = useLook(inner);
    return (
      <span
        ref={(el) => {
          inner.current = el;
          if (typeof outer === "function") outer(el);
          else if (outer) outer.current = el;
        }}
        className={`glyph relative ${className}`}
      >
        <ChickArt mood={mood} look={mood === "sleepy" ? undefined : look} />
        {mood === "sleepy" ? (
          <motion.span
            className="absolute -right-3 -top-2 text-[0.3em] font-bold"
            style={{ color: INK }}
            animate={{ y: [0, -12], opacity: [1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            Zzz
          </motion.span>
        ) : null}
        {children}
      </span>
    );
  },
);
