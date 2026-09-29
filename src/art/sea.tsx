import { motion } from "framer-motion";
import { useId } from "react";
import { Face, Shine } from "./Face";
import { Svg, Tube } from "./Svg";
import { INK, LINE, stroke } from "./palette";
import type { ArtProps } from "./types";

/* 바다 친구: 문어 · 돌고래 · 고래 · 열대어 · 게 (거품 팡팡 · 스티커 · 바닷가 장면) */

const thin = { ...stroke, strokeWidth: LINE * 0.8 };

const OCTO = "#ff8fa8";

export function Octopus({ mood, look }: ArtProps) {
  const wave = mood === "cheer" || mood === "happy";
  const legs = [
    "M28 60 C 22 70 14 76 10 84 C 8 90 14 92 17 88",
    "M40 64 C 38 76 32 84 30 92 C 29 97 35 97 36 93",
    "M60 64 C 62 76 68 84 70 92 C 71 97 65 97 64 93",
    "M72 60 C 78 70 86 76 90 84 C 92 90 86 92 83 88",
  ];
  return (
    <Svg>
      {legs.map((d, i) => (
        <motion.g
          key={i}
          style={{ originX: "50%", originY: "0%" }}
          animate={wave ? { rotate: [0, i % 2 ? 10 : -10, 0] } : { rotate: 0 }}
          transition={wave ? { duration: 0.5, repeat: Infinity, delay: i * 0.08 } : { duration: 0.3 }}
        >
          <Tube d={d} color={OCTO} w={9} />
        </motion.g>
      ))}
      <path d="M50 66 L50 90" stroke={INK} strokeWidth={9 + LINE * 2} strokeLinecap="round" />
      <path d="M50 66 L50 90" stroke={OCTO} strokeWidth={9} strokeLinecap="round" />
      <path d="M18 56 C 12 26 30 6 50 6 C 70 6 88 26 82 56 C 78 70 22 70 18 56 Z" fill={OCTO} {...stroke} />
      <g fill="#ffc2d1">
        <circle cx="66" cy="22" r="4" />
        <circle cx="74" cy="32" r="2.6" />
        <circle cx="28" cy="30" r="2.8" />
      </g>
      <Shine x={32} y={20} rx={5} ry={9} />
      <Face x={50} y={42} s={0.85} mood={mood} look={look} />
    </Svg>
  );
}

export function Dolphin({ mood, look }: ArtProps) {
  const body = "#7cb9e8";
  return (
    <Svg>
      <path d="M78 56 C 86 54 90 48 92 40 C 97 46 98 54 93 58 C 98 62 98 70 92 76 C 89 68 86 63 78 62 Z" fill={body} {...stroke} />
      <path d="M48 36 C 52 24 60 18 68 18 C 64 24 63 31 65 39 Z" fill={body} {...stroke} />
      <path
        d="M6 60 C 6 54 12 52 18 52 C 24 38 44 30 60 33 C 74 36 82 46 84 58 C 76 70 56 74 40 72 C 30 71 22 67 18 64 C 12 64 6 64 6 60 Z"
        fill={body}
        {...stroke}
      />
      <path d="M20 64 C 30 70 48 73 62 70 C 70 68 76 64 80 60 C 66 64 40 66 20 64 Z" fill="#e3f3ff" />
      <path d="M46 66 C 44 74 38 80 30 80 C 34 74 36 70 38 66 Z" fill="#5fa3d8" {...thin} />
      <Shine x={46} y={40} rx={4} ry={7} rot={-60} />
      <Face x={34} y={50} s={0.5} mood={mood} look={look} />
    </Svg>
  );
}

export function Whale({ mood, look }: ArtProps) {
  const body = "#4f8fe0";
  const up = mood === "cheer" || mood === "happy";
  return (
    <Svg>
      <motion.g
        style={{ originX: "50%", originY: "100%" }}
        animate={up ? { scaleY: [1, 1.25, 0.9, 1.15, 1] } : { scaleY: 1 }}
        transition={up ? { duration: 0.9, repeat: Infinity } : { duration: 0.3 }}
      >
        <Tube d="M38 28 C 36 20 32 16 26 14" color="#8fdcff" w={4} />
        <Tube d="M40 28 C 40 18 42 12 44 8" color="#8fdcff" w={4} />
        <Tube d="M42 28 C 46 20 50 16 56 15" color="#8fdcff" w={4} />
      </motion.g>
      <path d="M72 62 C 82 58 86 50 85 40 L 90 40 C 92 52 88 64 78 70 Z" fill={body} {...stroke} />
      <path d="M87 44 C 80 40 76 32 78 25 C 84 29 86 33 87 37 C 88 33 92 27 99 25 C 99 33 95 40 87 44 Z" fill={body} {...stroke} />
      <path d="M6 62 C 6 40 24 29 46 29 C 66 29 80 42 82 58 C 84 72 70 82 48 82 C 24 82 6 76 6 62 Z" fill={body} {...stroke} />
      <path d="M10 67 C 18 78 38 82 54 80 C 66 79 74 74 78 68 C 60 72 32 72 10 67 Z" fill="#dff1ff" />
      <path d="M26 74 L28 79 M36 75 L37 80 M46 75 L46 80 M56 75 L55 80" stroke="#9cc8f0" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M44 70 C 42 78 36 83 28 84 C 32 78 34 74 36 69 Z" fill="#3f7cc9" {...thin} />
      <Shine x={28} y={40} rx={5} ry={9} rot={-50} />
      <Face x={30} y={52} s={0.62} mood={mood} look={look} />
    </Svg>
  );
}

const FISH_BODY = "M10 50 C 20 26 46 20 62 30 C 70 36 76 44 76 50 C 76 56 70 64 62 70 C 46 80 20 74 10 50 Z";

/** 열대어 (흰 줄무늬 흰동가리) */
export function TropicalFish({ mood, look }: ArtProps) {
  const id = useId().replace(/:/g, "");
  const orange = "#ff8a2a";
  return (
    <Svg>
      <defs>
        <clipPath id={`tf-${id}`}>
          <path d={FISH_BODY} />
        </clipPath>
      </defs>
      <path d="M72 50 L92 30 L90 70 Z" fill={orange} {...stroke} />
      <path d="M92 30 L90 70" stroke={INK} strokeWidth={4} opacity="0.35" />
      <path d="M36 28 C 42 14 58 14 62 30" fill={orange} {...thin} />
      <path d="M44 70 C 46 80 56 82 60 70" fill={orange} {...thin} />
      <path d={FISH_BODY} fill={orange} />
      <g clipPath={`url(#tf-${id})`}>
        <path d="M34 20 C 42 38 42 62 34 80 L 46 80 C 54 62 54 38 46 20 Z" fill="#fff" {...thin} />
        <path d="M60 20 C 65 38 65 62 60 80 L 70 80 C 74 62 74 38 70 20 Z" fill="#fff" {...thin} />
      </g>
      <path d={FISH_BODY} fill="none" {...stroke} />
      <Shine x={22} y={40} rx={3.4} ry={5.4} />
      <Face x={24} y={48} s={0.52} mood={mood} look={look} />
    </Svg>
  );
}

/** 게: 기쁘면 집게를 흔든다 */
export function Crab({ mood, look }: ArtProps) {
  const up = mood === "cheer" || mood === "happy";
  return (
    <Svg>
      {[-1, 1].map((side) => (
        <motion.g
          key={side}
          style={{ originX: side < 0 ? "100%" : "0%", originY: "100%" }}
          animate={up ? { rotate: [0, -20 * side, 0, -20 * side, 0] } : { rotate: 0 }}
          transition={{ duration: 0.6 }}
        >
          <path d={side < 0 ? "M24 54 L12 34" : "M76 54 L88 34"} stroke={INK} strokeWidth={LINE} />
          <path
            d={side < 0 ? "M12 34 C 2 30 2 18 12 16 L 14 26 L 20 20 C 22 28 18 34 12 34 Z" : "M88 34 C 98 30 98 18 88 16 L 86 26 L 80 20 C 78 28 82 34 88 34 Z"}
            fill="#ff6a4d"
            {...thin}
          />
        </motion.g>
      ))}
      <path d="M24 74 L14 84 M30 78 L24 90 M76 74 L86 84 M70 78 L76 90" stroke={INK} strokeWidth={LINE} strokeLinecap="round" />
      <ellipse cx="50" cy="64" rx="30" ry="20" fill="#ff6a4d" {...stroke} />
      <Shine x={38} y={56} rx={4} ry={6} />
      <Face x={50} y={62} s={0.55} mood={mood} look={look} />
    </Svg>
  );
}
