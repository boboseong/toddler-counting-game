import { motion } from "framer-motion";
import { useEffect, useState, type ComponentType } from "react";
import { Face, Shine } from "./Face";
import { Glyph } from "./Glyph";
import { Svg } from "./Svg";
import { INK, LINE, stroke } from "./palette";
import type { ArtProps, Mood } from "./types";
import { pokeCh } from "../fx/bus";
import { playBubble, playChomp, playTwinkle } from "../lib/audio";

/* 놀이 장면의 소품. 눌러도 세기와는 상관없고, 누르면 소품이 반응한다 */

const thin = { ...stroke, strokeWidth: LINE * 0.8 };

export function Tree({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M44 60 L42 96 L58 96 L56 60 Z" fill="#a0703e" {...stroke} />
      <g className="sway-part">
        <path
          d="M50 6 C 66 6 72 18 70 26 C 86 28 90 48 78 56 C 80 68 64 74 56 66 C 50 74 34 72 32 64 C 16 64 12 44 24 38 C 20 22 34 10 50 6 Z"
          fill="#5cc26a"
          {...stroke}
        />
        {[
          [34, 44],
          [62, 30],
          [70, 50],
          [48, 56],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5.5" fill="#ff5a5a" {...thin} />
        ))}
        <Face x={50} y={36} s={0.5} mood={mood} look={look} cheeks={false} />
      </g>
    </Svg>
  );
}

export function Basket({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M22 50 C 22 20 78 20 78 50" fill="none" stroke="#b77b3f" strokeWidth={6} strokeLinecap="round" />
      <circle cx="36" cy="46" r="9" fill="#ff5a5a" {...thin} />
      <circle cx="54" cy="44" r="9" fill="#ffd23f" {...thin} />
      <circle cx="66" cy="48" r="8" fill="#9b59d0" {...thin} />
      <path d="M14 50 H86 L78 90 H22 Z" fill="#e0a45c" {...stroke} />
      <path d="M20 64 H80 M22 78 H78" stroke="#b77b3f" strokeWidth={3} />
      <Face x={50} y={70} s={0.5} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Barn({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M12 44 L50 14 L88 44 Z" fill="#c9423a" {...stroke} />
      <rect x="18" y="42" width="64" height="52" fill="#e8574c" {...stroke} />
      <rect x="38" y="62" width="24" height="32" fill="#fff4e3" {...stroke} />
      <path d="M38 62 L62 94 M62 62 L38 94" stroke="#c9423a" strokeWidth={3} />
      <circle cx="50" cy="34" r="7" fill="#fff4e3" {...thin} />
      <Face x={50} y={52} s={0.45} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Sunflower({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M50 50 L50 96" stroke="#5cb85c" strokeWidth={6} strokeLinecap="round" />
      <path d="M50 78 C 36 66 26 70 26 76 C 34 82 44 82 50 78 Z" fill="#6cc04a" {...thin} />
      <g className="sway-part">
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="18"
            rx="6"
            ry="12"
            fill="#ffc928"
            {...thin}
            transform={`rotate(${i * 30} 50 36)`}
          />
        ))}
        <circle cx="50" cy="36" r="14" fill="#8a5a2b" {...stroke} />
        <Face x={50} y={35} s={0.45} mood={mood} look={look} eyeColor="#fff" cheeks={false} />
      </g>
    </Svg>
  );
}

export function Shell({ mood }: ArtProps) {
  const open = mood === "cheer" || mood === "happy";
  return (
    <Svg>
      <motion.g style={{ originX: "50%", originY: "100%" }} animate={{ rotate: open ? -25 : 0 }}>
        <path d="M14 70 C 14 30 86 30 86 70 Z" fill="#ffc7d6" {...stroke} />
        {[30, 42, 50, 58, 70].map((x) => (
          <path key={x} d={`M50 70 L${x} ${x === 50 ? 36 : 42}`} stroke="#f2a0b6" strokeWidth={2.4} />
        ))}
      </motion.g>
      {open ? <circle cx="50" cy="72" r="7" fill="#fff" {...thin} /> : null}
      <path d="M14 72 C 30 90 70 90 86 72 Z" fill="#ffb3c6" {...stroke} />
    </Svg>
  );
}

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

/* ---------- 눌러도 반응하는 소품 ---------- */

let propSeq = 0;

/**
 * 장면 소품. 누르면(fx.poke) 기뻐하며 폴짝 + 작은 소리.
 * 배경이라 pointer-events 는 없고, 누른 자리와 소품 영역을 비교해서 반응한다.
 */
export function Prop({
  art: Art,
  emoji,
  className = "",
  base = "idle",
  sound = "twinkle",
}: {
  art?: ComponentType<ArtProps>;
  emoji?: string;
  className?: string;
  base?: Mood;
  sound?: "twinkle" | "bubble" | "chomp";
}) {
  const [id] = useState(() => `prop-${++propSeq}`);
  const [poked, setPoked] = useState(0);
  useEffect(
    () =>
      pokeCh.on((pid) => {
        if (pid !== id) return;
        if (sound === "bubble") playBubble(3);
        else if (sound === "chomp") playChomp();
        else playTwinkle();
        setPoked((n) => n + 1);
      }),
    [id, sound],
  );
  const [cheer, setCheer] = useState(false);
  useEffect(() => {
    if (!poked) return;
    setCheer(true);
    const t = window.setTimeout(() => setCheer(false), 1400);
    return () => window.clearTimeout(t);
  }, [poked]);
  const mood: Mood = cheer ? "cheer" : base;
  return (
    <motion.span
      data-prop={id}
      className={`inline-block leading-none ${className}`}
      key={poked}
      animate={poked ? { y: [0, -16, 0, -6, 0], rotate: [0, -8, 8, 0] } : {}}
      transition={{ duration: 0.7 }}
    >
      {Art ? (
        <span className="glyph">
          <Art mood={mood} />
        </span>
      ) : emoji ? (
        <Glyph emoji={emoji} mood={mood} />
      ) : null}
    </motion.span>
  );
}
