import { Face, Shine } from "./Face";
import { Svg } from "./Svg";
import { INK, LINE, stroke } from "./palette";
import type { ArtProps } from "./types";

/* 셀 물건 (먹을 것 말고): 장난감 · 탈것 · 작은 동물 · 꽃 · 하늘 */

const thin = { ...stroke, strokeWidth: LINE * 0.8 };

export function starPath(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

const STAR = starPath(50, 54, 44, 21);

export function Star({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d={STAR} fill="#ffd23f" {...stroke} />
      <Shine x={38} y={40} rx={4} ry={7} />
      <Face x={50} y={56} s={0.6} mood={mood} look={look} />
    </Svg>
  );
}

export function GoldStar({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d={starPath(50, 54, 48, 23)} fill="#fff3a6" opacity="0.8" />
      <path d={STAR} fill="#ffb81f" {...stroke} />
      <Shine x={38} y={40} rx={4} ry={7} />
      <Face x={50} y={56} s={0.6} mood={mood ?? "happy"} look={look} />
    </Svg>
  );
}

export function Balloon({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M50 76 C 44 84 56 88 50 98" fill="none" stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" />
      <ellipse cx="50" cy="40" rx="30" ry="34" fill="#ff5a7a" {...stroke} />
      <path d="M45 78 L50 72 L55 78 Z" fill="#ff5a7a" {...thin} />
      <Shine x={36} y={26} rx={6} ry={11} />
      <Face x={50} y={44} s={0.7} mood={mood} look={look} />
    </Svg>
  );
}

export function Ball(_: ArtProps) {
  return (
    <Svg>
      <circle cx="50" cy="52" r="38" fill="#fff" {...stroke} />
      <path d="M50 38 L63 47 L58 62 L42 62 L37 47 Z" fill={INK} />
      <path d="M50 38 L50 16 M63 47 L84 40 M58 62 L70 82 M42 62 L30 82 M37 47 L16 40" stroke={INK} strokeWidth={2.4} />
      <path d="M40 16 L50 16 L60 16 L50 22 Z M84 40 L86 54 L80 46 Z M14 40 L14 54 L20 46 Z" fill={INK} />
    </Svg>
  );
}

export function Gift({ mood, look }: ArtProps) {
  return (
    <Svg>
      <rect x="18" y="40" width="64" height="50" rx="6" fill="#6bc5ff" {...stroke} />
      <rect x="12" y="30" width="76" height="16" rx="5" fill="#8ad3ff" {...stroke} />
      <rect x="44" y="30" width="12" height="60" fill="#ff5a7a" {...thin} />
      <path d="M50 30 C 36 14 24 22 32 30 Z M50 30 C 64 14 76 22 68 30 Z" fill="#ff5a7a" {...stroke} />
      <Face x={30} y={62} s={0.45} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Teddy({ mood, look }: ArtProps) {
  return (
    <Svg>
      <circle cx="28" cy="22" r="10" fill="#d49a63" {...stroke} />
      <circle cx="72" cy="22" r="10" fill="#d49a63" {...stroke} />
      <ellipse cx="50" cy="78" rx="24" ry="18" fill="#d49a63" {...stroke} />
      <ellipse cx="50" cy="80" rx="13" ry="10" fill="#f2cf9c" />
      <circle cx="50" cy="42" r="26" fill="#d49a63" {...stroke} />
      <ellipse cx="50" cy="52" rx="11" ry="8" fill="#f2cf9c" />
      <ellipse cx="50" cy="49" rx="3.6" ry="2.8" fill={INK} />
      <path d="M44 64 L56 64 L50 70 Z" fill="#ff5a7a" {...thin} />
      <Face x={50} y={42} s={0.85} mood={mood} look={look} />
    </Svg>
  );
}

export function Mushroom({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M36 56 C 34 72 36 86 40 90 L60 90 C 64 86 66 72 64 56 Z" fill="#fff4e3" {...stroke} />
      <path d="M10 56 C 10 26 30 12 50 12 C 70 12 90 26 90 56 Z" fill="#ff4d4d" {...stroke} />
      <circle cx="32" cy="36" r="6" fill="#fff" />
      <circle cx="58" cy="26" r="5" fill="#fff" />
      <circle cx="74" cy="44" r="5" fill="#fff" />
      <Face x={50} y={70} s={0.5} mood={mood} look={look} />
    </Svg>
  );
}

function Wheel({ x, y, r = 9 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#3d3a4a" {...stroke} />
      <circle cx={x} cy={y} r={r * 0.4} fill="#cfd4e0" />
    </g>
  );
}

export function Car({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M26 44 C 30 30 36 26 50 26 C 62 26 68 30 74 44 Z" fill="#ff6a5c" {...stroke} />
      <path d="M34 42 C 36 34 40 32 48 32 L48 42 Z M54 32 C 62 32 64 34 68 42 L54 42 Z" fill="#bfe8ff" {...thin} />
      <rect x="10" y="42" width="80" height="26" rx="10" fill="#ff6a5c" {...stroke} />
      <circle cx="84" cy="52" r="4" fill="#ffe27a" {...thin} />
      <Wheel x={28} y={70} />
      <Wheel x={72} y={70} />
      <Face x={50} y={52} s={0.45} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Bus({ mood, look }: ArtProps) {
  return (
    <Svg>
      <rect x="8" y="22" width="84" height="52" rx="10" fill="#ffc93c" {...stroke} />
      {[16, 36, 56].map((x) => (
        <rect key={x} x={x} y="30" width="14" height="14" rx="3" fill="#bfe8ff" {...thin} />
      ))}
      <rect x="76" y="30" width="10" height="24" rx="3" fill="#bfe8ff" {...thin} />
      <path d="M8 56 H92" stroke="#e8a51c" strokeWidth={4} />
      <Wheel x={26} y={76} />
      <Wheel x={74} y={76} />
      <Face x={44} y={58} s={0.4} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Rocket({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M40 78 C 42 88 46 94 50 98 C 54 94 58 88 60 78 Z" fill="#ffb13b" />
      <path d="M44 78 C 46 86 48 90 50 92 C 52 90 54 86 56 78 Z" fill="#ffe27a" />
      <path d="M34 60 L20 78 L36 76 Z M66 60 L80 78 L64 76 Z" fill="#ff5a5a" {...stroke} />
      <path d="M50 6 C 68 20 70 50 64 78 L36 78 C 30 50 32 20 50 6 Z" fill="#f2f5fb" {...stroke} />
      <circle cx="50" cy="40" r="11" fill="#7fd1f5" {...stroke} />
      <path d="M40 18 C 44 12 56 12 60 18" fill="#ff5a5a" {...thin} />
      <Face x={50} y={62} s={0.4} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Plane({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M40 46 L20 20 L32 20 L60 46 Z M40 56 L20 82 L32 82 L60 56 Z" fill="#7fb8ff" {...stroke} />
      <path d="M10 44 C 30 40 70 40 84 44 C 94 46 94 56 84 58 C 70 62 30 62 10 58 L6 40 L16 42 Z" fill="#f2f5fb" {...stroke} />
      {[34, 46, 58].map((x) => (
        <circle key={x} cx={x} cy={48} r="3.4" fill="#7fd1f5" />
      ))}
      <Face x={78} y={50} s={0.35} mood={mood} look={look} cheeks={false} mouth="none" />
    </Svg>
  );
}

export function Ladybug({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M40 22 C 36 12 32 10 28 12 M60 22 C 64 12 68 10 72 12" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx="50" cy="30" r="14" fill="#3d3535" {...stroke} />
      <ellipse cx="50" cy="60" rx="34" ry="30" fill="#ff4545" {...stroke} />
      <path d="M50 32 L50 90" stroke={INK} strokeWidth={LINE} />
      {[
        [34, 52],
        [66, 52],
        [30, 72],
        [70, 72],
        [44, 80],
        [56, 80],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="#3d3535" />
      ))}
      <Face x={50} y={28} s={0.4} mood={mood} look={look} eyeColor="#fff" cheeks={false} mouth="none" />
    </Svg>
  );
}

export function Butterfly({ mood, look }: ArtProps) {
  return (
    <Svg>
      <g className="flap" style={{ transformOrigin: "100% 50%" }}>
        <path d="M48 46 C 30 16 6 20 10 40 C 12 52 30 54 48 50 Z M48 54 C 30 56 16 66 22 80 C 30 90 44 76 48 58 Z" fill="#ff9ecf" {...stroke} />
      </g>
      <g className="flap-r" style={{ transformOrigin: "0% 50%" }}>
        <path d="M52 46 C 70 16 94 20 90 40 C 88 52 70 54 52 50 Z M52 54 C 70 56 84 66 78 80 C 70 90 56 76 52 58 Z" fill="#a78bfa" {...stroke} />
      </g>
      <ellipse cx="50" cy="54" rx="6" ry="24" fill="#5a4636" {...stroke} />
      <path d="M48 32 C 44 22 40 18 36 18 M52 32 C 56 22 60 18 64 18" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <Face x={50} y={40} s={0.25} mood={mood} look={look} eyeColor="#fff" cheeks={false} mouth="none" />
    </Svg>
  );
}

export function Bee({ mood, look }: ArtProps) {
  return (
    <Svg>
      <g className="flap" style={{ transformOrigin: "80% 100%" }}>
        <ellipse cx="38" cy="28" rx="12" ry="16" fill="#e6f6ff" {...thin} transform="rotate(-20 38 28)" />
      </g>
      <g className="flap-r" style={{ transformOrigin: "20% 100%" }}>
        <ellipse cx="62" cy="28" rx="12" ry="16" fill="#e6f6ff" {...thin} transform="rotate(20 62 28)" />
      </g>
      <path d="M86 58 L96 60 L86 64 Z" fill={INK} />
      <ellipse cx="54" cy="58" rx="34" ry="26" fill="#ffd23f" {...stroke} />
      <path d="M50 33 C 46 46 46 70 50 83 M66 36 C 62 48 62 68 66 80" fill="none" stroke={INK} strokeWidth={7} />
      <Face x={34} y={56} s={0.55} mood={mood} look={look} />
    </Svg>
  );
}

export function Snail({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M8 84 C 20 76 30 76 34 70 L 36 56 C 36 46 42 44 44 52 L 46 74 C 60 80 80 82 94 84 Z" fill="#b8e27a" {...stroke} />
      <path d="M36 50 L32 36 M42 50 L46 36" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx="32" cy="34" r="3" fill={INK} />
      <circle cx="46" cy="34" r="3" fill={INK} />
      <circle cx="68" cy="60" r="24" fill="#f2a65a" {...stroke} />
      <path d="M68 60 m0 -14 a14 14 0 1 1 -14 14 a9 9 0 1 1 9 -9 a4 4 0 1 1 -4 4" fill="none" stroke="#c8753a" strokeWidth={3} strokeLinecap="round" />
      <Face x={40} y={64} s={0.35} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Duck({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M20 62 C 20 84 44 90 64 88 C 86 86 94 70 88 56 C 80 62 70 62 64 58 L 56 56 C 40 58 20 50 20 62 Z" fill="#ffd84d" {...stroke} />
      <path d="M58 70 C 66 62 76 64 80 70 C 74 76 64 76 58 70 Z" fill="#f5b92e" {...thin} />
      <circle cx="38" cy="38" r="20" fill="#ffd84d" {...stroke} />
      <path d="M14 42 C 8 42 6 48 12 50 C 18 52 22 48 22 44 Z" fill="#ff9f1c" {...thin} />
      <Face x={40} y={34} s={0.55} mood={mood} look={look} mouth="none" />
    </Svg>
  );
}

function Petals({ n, r, color, cx = 50, cy = 40 }: { n: number; r: number; color: string; cx?: number; cy?: number }) {
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={r * 0.75} fill={color} {...thin} />;
      })}
    </g>
  );
}

export function Daisy({ mood }: ArtProps) {
  return (
    <Svg>
      <path d="M50 56 C 48 70 50 84 50 96" stroke="#5cb85c" strokeWidth={5} strokeLinecap="round" />
      <path d="M50 80 C 40 70 30 72 28 78 C 36 84 44 84 50 80 Z" fill="#6cc04a" {...thin} />
      <Petals n={8} r={17} color="#fff6b0" />
      <circle cx="50" cy="40" r="13" fill="#ffb81f" {...thin} />
      <Face x={50} y={39} s={0.42} mood={mood} cheeks={false} />
    </Svg>
  );
}

export function Tulip({ mood }: ArtProps) {
  return (
    <Svg>
      <path d="M50 58 C 50 72 50 84 50 96" stroke="#5cb85c" strokeWidth={5} strokeLinecap="round" />
      <path d="M50 84 C 36 74 26 62 30 54 C 40 60 46 72 50 84 Z M50 88 C 62 76 72 66 70 58 C 60 64 54 74 50 88 Z" fill="#6cc04a" {...thin} />
      <path d="M28 30 L36 16 L44 28 L50 12 L56 28 L64 16 L72 30 C 72 52 62 62 50 62 C 38 62 28 52 28 30 Z" fill="#ff6fa3" {...stroke} />
      <Face x={50} y={42} s={0.5} mood={mood} cheeks={false} />
    </Svg>
  );
}

export function Egg({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M50 8 C 26 8 16 44 16 62 C 16 84 32 94 50 94 C 68 94 84 84 84 62 C 84 44 74 8 50 8 Z" fill="#fff8ec" {...stroke} />
      <Shine x={36} y={32} rx={6} ry={10} />
      <Face x={50} y={62} s={0.7} mood={mood} look={look} />
    </Svg>
  );
}

export function Cloud({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M22 76 C 8 76 6 56 20 52 C 18 36 36 28 46 38 C 50 22 76 22 78 42 C 94 42 96 66 82 76 Z" fill="#ffffff" {...stroke} />
      <Face x={50} y={58} s={0.7} mood={mood} look={look} />
    </Svg>
  );
}

export function Sun({ mood, look }: ArtProps) {
  return (
    <Svg>
      <g stroke="#ffb81f" strokeWidth={6} strokeLinecap="round">
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <path
              key={i}
              d={`M${50 + Math.cos(a) * 36} ${50 + Math.sin(a) * 36} L${50 + Math.cos(a) * 46} ${50 + Math.sin(a) * 46}`}
            />
          );
        })}
      </g>
      <circle cx="50" cy="50" r="28" fill="#ffd23f" {...stroke} />
      <Face x={50} y={50} s={0.75} mood={mood} look={look} />
    </Svg>
  );
}

export function Moon({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M62 10 C 36 12 20 32 20 54 C 20 76 38 92 62 92 C 72 92 80 88 86 82 C 62 84 44 70 44 50 C 44 32 54 18 62 10 Z" fill="#fff0a6" {...stroke} />
      <Face x={36} y={52} s={0.5} mood={mood ?? "sleepy"} look={look} />
    </Svg>
  );
}

export function Heart({ mood }: ArtProps) {
  return (
    <Svg>
      <path d="M50 88 C 50 88 10 64 10 36 C 10 20 22 12 34 12 C 42 12 48 16 50 22 C 52 16 58 12 66 12 C 78 12 90 20 90 36 C 90 64 50 88 50 88 Z" fill="#ff6f9f" {...stroke} />
      <Shine x={28} y={32} rx={5} ry={8} />
      <Face x={50} y={46} s={0.6} mood={mood ?? "happy"} />
    </Svg>
  );
}

export function Turtle({ mood, look }: ArtProps) {
  return (
    <Svg>
      <ellipse cx="30" cy="80" rx="8" ry="6" fill="#8fd16a" {...stroke} />
      <ellipse cx="70" cy="80" rx="8" ry="6" fill="#8fd16a" {...stroke} />
      <circle cx="86" cy="58" r="13" fill="#8fd16a" {...stroke} />
      <path d="M12 74 C 12 44 30 30 50 30 C 70 30 80 44 80 74 Z" fill="#4caf50" {...stroke} />
      <path d="M34 42 L46 50 L44 64 M60 40 L56 52 L66 62 M46 50 L56 52" fill="none" stroke="#2f7d32" strokeWidth={2.6} />
      <Face x={87} y={56} s={0.38} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}
