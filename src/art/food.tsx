import { Face, Shine } from "./Face";
import { Svg } from "./Svg";
import { INK, LINE, stroke } from "./palette";
import type { ArtProps } from "./types";

/*
 * 먹이·셀 물건 중 먹을 것. 대부분 작은 얼굴이 있어서 세면 웃는다.
 * (셀 때 "happy", 기본은 "idle")
 */

const thin = { ...stroke, strokeWidth: LINE * 0.8 };

function Leaf({ x, y, rot = -30, c = "#6cc04a" }: { x: number; y: number; rot?: number; c?: string }) {
  return <path d={`M${x} ${y} c 4 -10 16 -12 20 -8 c -4 8 -12 12 -20 8 z`} fill={c} {...thin} transform={`rotate(${rot} ${x} ${y})`} />;
}

export function Apple({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M50 26 C 50 18 52 12 56 8" fill="none" {...stroke} />
      <Leaf x={52} y={18} rot={-20} />
      <path d="M50 28 C 36 18 14 24 14 50 C 14 76 34 92 50 86 C 66 92 86 76 86 50 C 86 24 64 18 50 28 Z" fill="#ff5a5a" {...stroke} />
      <Shine x={30} y={40} rx={6} ry={10} />
      <Face x={50} y={56} s={0.8} mood={mood} look={look} />
    </Svg>
  );
}

export function Orange({ mood, look }: ArtProps) {
  return (
    <Svg>
      <circle cx="50" cy="54" r="36" fill="#ffa53a" {...stroke} />
      <Leaf x={50} y={20} rot={-10} />
      <circle cx="50" cy="19" r="3" fill="#8a5a2b" />
      <Shine x={32} y={40} rx={6} ry={10} />
      <Face x={50} y={56} s={0.8} mood={mood} look={look} />
    </Svg>
  );
}

export function Peach({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M50 24 C 22 16 12 48 20 66 C 28 84 44 90 50 88 C 56 90 72 84 80 66 C 88 48 78 16 50 24 Z" fill="#ffb0a0" {...stroke} />
      <path d="M50 26 C 44 44 46 70 50 86" fill="none" stroke="#f07f73" strokeWidth={2.5} strokeLinecap="round" />
      <Leaf x={50} y={22} rot={-35} />
      <Shine x={30} y={44} rx={6} ry={10} />
      <Face x={50} y={58} s={0.75} mood={mood} look={look} />
    </Svg>
  );
}

export function Strawberry({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M50 24 C 76 18 90 34 82 54 C 74 74 58 90 50 92 C 42 90 26 74 18 54 C 10 34 24 18 50 24 Z" fill="#ff4f6d" {...stroke} />
      {[
        [30, 44],
        [70, 44],
        [40, 70],
        [60, 70],
        [50, 82],
        [26, 58],
        [74, 58],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={1.8} ry={2.6} fill="#ffe58a" />
      ))}
      <path d="M50 26 L38 14 L46 22 L50 10 L54 22 L62 14 L50 26 Z" fill="#5cb85c" {...thin} />
      <path d="M30 26 C 40 30 60 30 70 26 C 62 34 38 34 30 26 Z" fill="#5cb85c" {...thin} />
      <Face x={50} y={52} s={0.75} mood={mood} look={look} />
    </Svg>
  );
}

export function Banana({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M22 26 C 14 58 36 86 76 80 C 86 78 88 72 82 70 C 52 72 34 54 34 26 Z" fill="#ffe14d" {...stroke} />
      <path d="M22 26 L20 16 L30 16 L34 26 Z" fill="#a37a3b" {...thin} />
      <path d="M30 40 C 32 58 48 70 70 72" fill="none" stroke="#e6b923" strokeWidth={2.4} strokeLinecap="round" />
      <Face x={48} y={60} s={0.62} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Cherry({ mood }: ArtProps) {
  return (
    <Svg>
      <path d="M36 62 C 40 40 50 24 62 12 M66 60 C 64 42 64 26 62 12" fill="none" stroke="#6b8e23" strokeWidth={3.5} strokeLinecap="round" />
      <Leaf x={62} y={12} rot={10} />
      <circle cx="34" cy="70" r="17" fill="#e8263f" {...stroke} />
      <circle cx="68" cy="68" r="17" fill="#f23b53" {...stroke} />
      <Shine x={28} y={64} rx={3.5} ry={5.5} />
      <Shine x={62} y={62} rx={3.5} ry={5.5} />
      <Face x={34} y={72} s={0.45} mood={mood} cheeks={false} />
      <Face x={68} y={70} s={0.45} mood={mood} cheeks={false} />
    </Svg>
  );
}

export function Carrot({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M44 24 C 36 12 40 6 46 16 M50 22 C 50 8 56 6 54 20 M56 24 C 62 12 70 14 60 26" fill="none" stroke="#4caf50" strokeWidth={5} strokeLinecap="round" />
      <path d="M32 30 C 40 22 60 22 68 30 C 66 54 56 80 50 92 C 44 80 34 54 32 30 Z" fill="#ff8c2b" {...stroke} />
      <path d="M40 60 L46 58 M54 70 L60 68 M38 44 L44 43" stroke="#d96b12" strokeWidth={2.4} strokeLinecap="round" />
      <Face x={50} y={40} s={0.6} mood={mood} look={look} />
    </Svg>
  );
}

export function Cookie({ mood, look }: ArtProps) {
  return (
    <Svg>
      <circle cx="50" cy="52" r="36" fill="#e3a45c" {...stroke} />
      {[
        [32, 36],
        [66, 34],
        [26, 60],
        [72, 62],
        [50, 78],
        [58, 30],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={4} ry={3.4} fill="#6b3f1f" />
      ))}
      <Face x={50} y={52} s={0.8} mood={mood} look={look} />
    </Svg>
  );
}

export function Donut({ mood, look }: ArtProps) {
  return (
    <Svg>
      <circle cx="50" cy="54" r="36" fill="#e6a863" {...stroke} />
      <path d="M18 50 C 16 28 34 16 50 18 C 70 18 86 30 82 52 C 80 60 74 56 70 62 C 64 68 58 60 50 64 C 42 68 36 58 30 62 C 22 64 18 58 18 50 Z" fill="#ff8fc0" {...thin} />
      <ellipse cx="50" cy="46" rx="10" ry="7" fill="#fff5ea" {...thin} />
      {[
        [30, 34, 20],
        [68, 32, -30],
        [74, 48, 60],
        [26, 50, -60],
        [40, 26, 80],
        [60, 58, 10],
      ].map(([x, y, r], i) => (
        <rect key={i} x={x} y={y} width="7" height="2.6" rx="1.3" fill={["#6ad3ff", "#ffe066", "#8be08b"][i % 3]} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <Face x={50} y={72} s={0.5} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Cupcake({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M24 56 L32 90 L68 90 L76 56 Z" fill="#7fd1f5" {...stroke} />
      <path d="M36 58 L40 88 M50 58 L50 88 M64 58 L60 88" stroke="#4fb3e0" strokeWidth={2.4} />
      <path d="M20 58 C 12 48 22 36 32 38 C 32 24 50 18 56 28 C 66 22 82 32 78 44 C 88 48 84 60 76 58 Z" fill="#ffc0d9" {...stroke} />
      <circle cx="52" cy="20" r="6" fill="#ff3b5c" {...stroke} />
      <Face x={50} y={70} s={0.6} mood={mood} look={look} />
    </Svg>
  );
}

export function IceCream({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M32 50 L50 94 L68 50 Z" fill="#f2b766" {...stroke} />
      <path d="M38 58 L60 60 M42 70 L56 70 M36 52 L50 82 M64 52 L50 82" stroke="#d9923a" strokeWidth={2} />
      <path d="M26 52 C 18 40 28 24 40 26 C 44 10 64 12 66 26 C 78 26 84 42 74 52 Z" fill="#fff0f6" {...stroke} />
      <path d="M30 50 C 34 44 40 52 46 46 C 52 52 58 44 64 50" fill="none" stroke="#ff9ec7" strokeWidth={4} strokeLinecap="round" />
      <Face x={50} y={36} s={0.6} mood={mood} look={look} />
    </Svg>
  );
}

export function Lollipop({ mood, look }: ArtProps) {
  return (
    <Svg>
      <rect x="47" y="56" width="6" height="38" rx="3" fill="#fff" {...thin} />
      <circle cx="50" cy="38" r="28" fill="#ff7eb6" {...stroke} />
      <path d="M50 38 m0 -20 a20 20 0 1 1 -20 20 a14 14 0 1 1 14 -14 a8 8 0 1 1 -8 8" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity="0.9" />
      <Face x={50} y={42} s={0.55} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Bamboo({ mood }: ArtProps) {
  return (
    <Svg>
      <Leaf x={58} y={30} rot={-40} />
      <Leaf x={40} y={56} rot={200} />
      <rect x="40" y="8" width="18" height="86" rx="8" fill="#8fd16a" {...stroke} />
      <path d="M40 36 H58 M40 64 H58" stroke={INK} strokeWidth={LINE} />
      <Face x={49} y={48} s={0.4} mood={mood} cheeks={false} />
    </Svg>
  );
}

export function Acorn({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M26 46 C 26 74 40 90 50 92 C 60 90 74 74 74 46 Z" fill="#d99452" {...stroke} />
      <path d="M20 46 C 20 26 34 20 50 20 C 66 20 80 26 80 46 Z" fill="#8a5a2b" {...stroke} />
      <path d="M30 34 L36 40 M44 28 L50 34 M60 28 L66 34" stroke="#6b421c" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M50 20 L50 10" {...stroke} />
      <Face x={50} y={62} s={0.6} mood={mood} look={look} />
    </Svg>
  );
}

export function Corn({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M50 16 C 64 16 70 40 68 60 C 66 80 58 90 50 90 C 42 90 34 80 32 60 C 30 40 36 16 50 16 Z" fill="#ffd84a" {...stroke} />
      {[30, 42, 54, 66, 78].map((y) => (
        <path key={y} d={`M36 ${y} Q50 ${y + 3} 64 ${y}`} fill="none" stroke="#e8b422" strokeWidth={2} />
      ))}
      <path d="M50 92 C 30 88 22 66 24 48 C 34 58 40 74 50 92 Z" fill="#7bc653" {...stroke} />
      <path d="M50 92 C 70 88 78 66 76 48 C 66 58 60 74 50 92 Z" fill="#8fd16a" {...stroke} />
      <Face x={50} y={44} s={0.55} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Cheese({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M12 70 L84 36 L88 70 Z" fill="#ffd54f" {...stroke} />
      <path d="M12 70 L88 70 L88 84 L12 84 Z" fill="#ffc62b" {...stroke} />
      <circle cx="66" cy="58" r="5" fill="#f2b21c" />
      <circle cx="40" cy="64" r="3.5" fill="#f2b21c" />
      <circle cx="78" cy="76" r="3" fill="#e0a010" />
      <Face x={52} y={76} s={0.45} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function LeafArt({ mood }: ArtProps) {
  return (
    <Svg>
      <path d="M18 84 C 14 44 44 14 86 14 C 88 56 60 88 18 84 Z" fill="#72c457" {...stroke} />
      <path d="M18 84 C 38 62 58 42 80 20" fill="none" stroke="#4e9b3a" strokeWidth={3} strokeLinecap="round" />
      <Face x={50} y={52} s={0.5} mood={mood} cheeks={false} />
    </Svg>
  );
}

export function Meat({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M58 58 L80 80" stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d="M58 58 L80 80" stroke="#fff8ee" strokeWidth={7} strokeLinecap="round" />
      <circle cx="80" cy="78" r="6" fill="#fff8ee" {...stroke} />
      <circle cx="86" cy="72" r="6" fill="#fff8ee" {...stroke} />
      <path d="M50 14 C 76 14 82 44 64 62 C 48 78 18 76 16 52 C 14 30 30 14 50 14 Z" fill="#c9602f" {...stroke} />
      <path d="M26 44 C 28 30 40 22 52 22" fill="none" stroke="#e68a54" strokeWidth={4} strokeLinecap="round" />
      <Face x={42} y={46} s={0.6} mood={mood} look={look} />
    </Svg>
  );
}

export function Grape({ mood, look }: ArtProps) {
  const dots = [
    [36, 34],
    [52, 32],
    [68, 34],
    [44, 50],
    [60, 50],
    [52, 66],
    [36, 64],
    [68, 64],
    [52, 82],
  ];
  return (
    <Svg>
      <path d="M52 22 C 52 14 56 10 60 8" fill="none" {...stroke} />
      <Leaf x={54} y={16} rot={-15} />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="11" fill="#9b59d0" {...thin} />
      ))}
      <Face x={52} y={52} s={0.55} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Shrimp({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M28 30 C 60 12 90 40 76 68 C 68 84 46 86 38 76 L 26 84 L 28 70 L 16 66 L 30 62 C 48 70 62 60 60 46 C 58 36 44 34 36 42 Z" fill="#ff9a6b" {...stroke} />
      <path d="M52 30 L48 44 M64 38 L56 50 M70 52 L60 58" stroke="#e8703f" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M30 32 C 20 22 14 20 8 22 M32 30 C 26 18 22 14 16 12" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <Face x={38} y={36} s={0.45} mood={mood} look={look} mouth="none" cheeks={false} />
    </Svg>
  );
}

export function Blossom({ mood }: ArtProps) {
  return (
    <Svg>
      {Array.from({ length: 5 }).map((_, i) => (
        <path
          key={i}
          d="M50 50 C 36 36 38 14 50 12 C 62 14 64 36 50 50 Z"
          fill="#ffc2dc"
          {...thin}
          transform={`rotate(${i * 72} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="11" fill="#ffe27a" {...thin} />
      <Face x={50} y={49} s={0.38} mood={mood} cheeks={false} />
    </Svg>
  );
}

export function Watermelon({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M10 40 C 10 74 30 90 50 90 C 70 90 90 74 90 40 Z" fill="#4caf50" {...stroke} />
      <path d="M16 42 C 16 70 32 83 50 83 C 68 83 84 70 84 42 Z" fill="#ff5b6e" />
      {[
        [34, 52],
        [50, 56],
        [66, 52],
        [42, 66],
        [58, 66],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2" ry="3" fill={INK} />
      ))}
      <path d="M10 40 H 90" {...stroke} />
      <Face x={50} y={70} s={0.5} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Caterpillar({ mood, look }: ArtProps) {
  return (
    <Svg>
      {[18, 32, 46, 60].map((x, i) => (
        <circle key={x} cx={x} cy={64 - (i % 2) * 6} r="12" fill={i % 2 ? "#9be15d" : "#7bd148"} {...thin} />
      ))}
      <circle cx="76" cy="50" r="17" fill="#8fe05a" {...stroke} />
      <path d="M70 34 C 66 24 64 20 60 20 M82 34 C 86 24 88 20 92 20" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <circle cx="60" cy="20" r="3" fill="#ff7b93" />
      <circle cx="92" cy="20" r="3" fill="#ff7b93" />
      <Face x={76} y={50} s={0.55} mood={mood} look={look} />
    </Svg>
  );
}

export function Fish({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M72 50 L92 32 L90 68 Z" fill="#4fb3ff" {...stroke} />
      <path d="M10 50 C 20 26 46 20 62 30 C 70 36 76 44 76 50 C 76 56 70 64 62 70 C 46 80 20 74 10 50 Z" fill="#6ec8ff" {...stroke} />
      <path d="M40 30 C 44 20 54 18 58 28" fill="#4fb3ff" {...thin} />
      <path d="M52 40 C 56 46 56 54 52 60" fill="none" stroke="#3e9ee6" strokeWidth={2.4} strokeLinecap="round" />
      <Shine x={28} y={40} rx={4} ry={6} />
      <Face x={30} y={48} s={0.6} mood={mood} look={look} />
    </Svg>
  );
}
