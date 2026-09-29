import { motion } from "framer-motion";
import { Face } from "./Face";
import { Wheel } from "./items";
import { Svg, Tube } from "./Svg";
import { INK, LINE, stroke } from "./palette";
import type { ArtProps } from "./types";

/* 탈것 친구 (스티커북 2권). 모두 오른쪽을 보고, 얼굴이 있어서 모으면 웃는다 */

const thin = { ...stroke, strokeWidth: LINE * 0.8 };
const GLASS = "#bfe8ff";
const WATER = "#4fb3ff";

function Waves({ y = 90 }: { y?: number }) {
  return (
    <path
      d={`M2 ${y} q 8 -6 16 0 t 16 0 t 16 0 t 16 0 t 16 0 t 16 0`}
      fill="none"
      stroke={WATER}
      strokeWidth={4}
      strokeLinecap="round"
    />
  );
}

/** 뭉게 연기 */
function Puffs({ pts }: { pts: [number, number, number][] }) {
  return (
    <g fill="#eef1f6" {...thin}>
      {pts.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
      ))}
    </g>
  );
}

export function FireTruck({ mood, look }: ArtProps) {
  const red = "#ff4d3d";
  return (
    <Svg>
      <path d="M14 34 L14 40 M56 34 L56 40" stroke={INK} strokeWidth={3} />
      <rect x="8" y="26" width="54" height="8" rx="2" fill="#dfe4ee" {...thin} />
      <path d="M17 26 V34 M26 26 V34 M35 26 V34 M44 26 V34 M53 26 V34" stroke={INK} strokeWidth={2} />
      <rect x="6" y="40" width="62" height="32" rx="6" fill={red} {...stroke} />
      <path d="M42 48 H60 M42 55 H60 M42 62 H60" stroke="#c9302a" strokeWidth={3} strokeLinecap="round" />
      <circle cx="24" cy="55" r="9" fill="#fff4e3" {...thin} />
      <circle cx="24" cy="55" r="3.4" fill="#ffd23f" />
      <rect x="74" y="20" width="10" height="9" rx="3" fill="#4fa3ff" {...thin} />
      <path d="M64 72 L64 34 C 64 30 67 28 71 28 L 82 28 C 86 28 88 31 90 36 L 94 48 L 94 72 Z" fill={red} {...stroke} />
      <path d="M70 34 H 82 C 84 34 85 36 86 40 L 88 46 H 70 Z" fill={GLASS} {...thin} />
      <rect x="88" y="62" width="6" height="5" rx="2" fill="#ffe27a" {...thin} />
      <Wheel x={22} y={74} />
      <Wheel x={48} y={74} />
      <Wheel x={80} y={74} />
      <Face x={77} y={56} s={0.36} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function PoliceCar({ mood, look }: ArtProps) {
  const blue = "#3f6fe8";
  return (
    <Svg>
      <path d="M40 27 V21 C 40 18 42 16 45 16 H50 V27 Z" fill="#ff4d4d" />
      <path d="M50 16 H55 C 58 16 60 18 60 21 V27 H50 Z" fill="#4d8bff" />
      <path d="M40 27 V21 C 40 18 42 16 45 16 H55 C 58 16 60 18 60 21 V27" fill="none" {...thin} />
      <path d="M26 44 C 30 30 36 26 50 26 C 62 26 68 30 74 44 Z" fill="#fff" {...stroke} />
      <path d="M34 42 C 36 34 40 32 48 32 L48 42 Z M54 32 C 62 32 64 34 68 42 L54 42 Z" fill={GLASS} {...thin} />
      <rect x="10" y="42" width="80" height="26" rx="10" fill="#fff" />
      <path d="M10 56 H90 V58 C 90 63.5 85.5 68 80 68 H20 C 14.5 68 10 63.5 10 58 Z" fill={blue} />
      <rect x="10" y="42" width="80" height="26" rx="10" fill="none" {...stroke} />
      <circle cx="84" cy="50" r="3.6" fill="#ffe27a" {...thin} />
      <Wheel x={28} y={70} />
      <Wheel x={72} y={70} />
      <Face x={50} y={49} s={0.42} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Ambulance({ mood, look }: ArtProps) {
  return (
    <Svg>
      <rect x="44" y="18" width="12" height="9" rx="3" fill="#ff4d4d" {...thin} />
      <path d="M6 70 L6 34 C 6 29 10 26 15 26 L 64 26 C 70 26 73 29 76 34 L 84 46 L 90 48 C 93 49 94 52 94 56 L 94 70 Z" fill="#fff" {...stroke} />
      <path d="M68 32 L 74 32 L 81 46 L 68 46 Z" fill={GLASS} {...thin} />
      <rect x="7.6" y="55" width="84.8" height="6" fill="#ff4d4d" />
      <path d="M22 34 h6 v6 h6 v6 h-6 v6 h-6 v-6 h-6 v-6 h6 Z" fill="#ff4d4d" />
      <circle cx="89" cy="64" r="3.2" fill="#ffe27a" {...thin} />
      <Wheel x={24} y={72} />
      <Wheel x={74} y={72} />
      <Face x={52} y={42} s={0.4} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Tractor({ mood, look }: ArtProps) {
  const green = "#4caf50";
  return (
    <Svg>
      <Puffs pts={[[72, 13, 4.5], [79, 7, 3.4]]} />
      <rect x="66" y="20" width="5" height="22" fill="#6b6f7a" {...thin} />
      <path d="M24 50 L27 22 L52 22 L54 50 Z" fill={GLASS} {...thin} />
      <rect x="21" y="16" width="36" height="8" rx="3" fill="#ffd23f" {...stroke} />
      <path d="M18 70 L18 50 L56 50 L58 42 L84 42 C 88 42 90 45 90 49 L92 70 Z" fill={green} {...stroke} />
      <path d="M84 46 V62" stroke="#2f7d32" strokeWidth={2.6} strokeLinecap="round" />
      <circle cx="30" cy="72" r="20" fill="#3d3a4a" {...stroke} />
      <circle cx="30" cy="72" r="15" fill="none" stroke="#5a5668" strokeWidth={3} strokeDasharray="4 4" />
      <circle cx="30" cy="72" r="8" fill="#ffd23f" {...thin} />
      <circle cx="78" cy="80" r="12" fill="#3d3a4a" {...stroke} />
      <circle cx="78" cy="80" r="5" fill="#ffd23f" {...thin} />
      <Face x={70} y={56} s={0.38} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

/** 증기 기관차 */
export function Train({ mood, look }: ArtProps) {
  const blue = "#3f7fe0";
  const red = "#ff5a5a";
  return (
    <Svg>
      <Puffs pts={[[74, 11, 5], [82, 5, 4], [90, 2, 3]]} />
      <path d="M66 40 L64 22 L78 22 L76 40 Z" fill="#3d3a4a" {...stroke} />
      <rect x="62" y="17" width="18" height="6" rx="2" fill={red} {...thin} />
      <rect x="36" y="36" width="50" height="30" rx="10" fill={blue} {...stroke} />
      <path d="M52 36 V66 M66 36 V66" stroke="#ffd23f" strokeWidth={3} />
      <rect x="8" y="26" width="32" height="40" fill={blue} {...stroke} />
      <rect x="15" y="32" width="18" height="14" rx="3" fill={GLASS} {...thin} />
      <rect x="4" y="18" width="40" height="9" rx="3" fill={red} {...stroke} />
      <path d="M90 64 L98 78 L84 78 Z" fill="#ffd23f" {...thin} />
      <rect x="4" y="64" width="90" height="8" rx="3" fill={red} {...stroke} />
      <circle cx="86" cy="50" r="13" fill="#dfe4ee" {...stroke} />
      <Wheel x={20} y={77} />
      <Wheel x={44} y={77} />
      <Wheel x={68} y={77} />
      <path d="M20 77 L68 77" stroke={red} strokeWidth={3} strokeLinecap="round" />
      <Face x={86} y={49} s={0.42} mood={mood} look={look} />
    </Svg>
  );
}

export function Helicopter({ mood, look }: ArtProps) {
  const red = "#ff6a5c";
  const spin = mood === "cheer" || mood === "happy";
  return (
    <Svg>
      <path d="M34 76 L30 90 M64 76 L68 90" stroke={INK} strokeWidth={LINE} strokeLinecap="round" />
      <path d="M20 90 H80" stroke={INK} strokeWidth={LINE * 1.6} strokeLinecap="round" />
      <path d="M30 52 L6 44 L6 55 L30 66 Z" fill={red} {...stroke} />
      <circle cx="7" cy="45" r="7" fill="#dfe4ee" opacity="0.9" {...thin} />
      <path d="M1 45 H13 M7 39 V51" stroke={INK} strokeWidth={2} />
      <rect x="47" y="20" width="6" height="12" fill="#6b6f7a" {...thin} />
      <motion.g
        style={{ originX: "50%", originY: "50%" }}
        animate={spin ? { scaleX: [1, 0.12, 1] } : { scaleX: 1 }}
        transition={spin ? { duration: 0.28, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
      >
        <rect x="6" y="16" width="88" height="6" rx="3" fill="#6b6f7a" {...thin} />
      </motion.g>
      <ellipse cx="54" cy="60" rx="30" ry="20" fill={red} {...stroke} />
      <path d="M60 42 C 73 43 82 51 84 60 L 62 60 C 59 54 58 48 60 42 Z" fill={GLASS} {...thin} />
      <Face x={44} y={62} s={0.42} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Sailboat({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M50 10 L50 66" stroke={INK} strokeWidth={LINE} strokeLinecap="round" />
      <path d="M50 10 L63 14 L50 18 Z" fill="#ff5a5a" {...thin} />
      <path d="M53 18 C 64 32 78 48 84 62 L53 62 Z" fill="#fff" {...stroke} />
      <path d="M47 26 C 38 38 28 50 22 62 L47 62 Z" fill="#ffe27a" {...stroke} />
      <path d="M10 66 L90 66 C 86 76 78 82 68 82 L32 82 C 22 82 14 76 10 66 Z" fill="#ff7f50" {...stroke} />
      <Waves />
      <Face x={50} y={72} s={0.4} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Bicycle({ mood, look }: ArtProps) {
  const frame = "#ff5a7a";
  return (
    <Svg>
      {[24, 76].map((x) => (
        <g key={x}>
          <circle cx={x} cy="68" r="17" fill="none" stroke={INK} strokeWidth={5.5} />
          <path d={`M${x - 14} 68 H${x + 14} M${x} 54 V82 M${x - 10} 58 L${x + 10} 78 M${x + 10} 58 L${x - 10} 78`} stroke="#b8c0cf" strokeWidth={1.4} />
          <circle cx={x} cy="68" r="3" fill={INK} />
        </g>
      ))}
      <Tube d="M24 68 L46 68 L37 42 Z M37 42 L66 42 L46 68 M68 34 L76 68" color={frame} w={4.2} />
      <path d="M36 42 L35 38" stroke={INK} strokeWidth={3} />
      <ellipse cx="34" cy="36" rx="8" ry="3.4" fill="#3d3a4a" {...thin} />
      <path d="M68 34 L63 28 M68 34 L73 28" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx="46" cy="68" r="4.5" fill={frame} {...thin} />
      <path d="M76 34 H96 L93 50 H79 Z" fill="#e0a45c" {...stroke} />
      <path d="M78 40 H94 M84 34 L84 50 M90 34 L89 50" stroke="#b77b3f" strokeWidth={1.6} />
      <Face x={86} y={42} s={0.3} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

/** 스쿠터 (오토바이) */
export function Scooter({ mood, look }: ArtProps) {
  const mint = "#4fd1c5";
  return (
    <Svg>
      <path d="M62 26 L90 26" stroke={INK} strokeWidth={LINE * 1.5} strokeLinecap="round" />
      <path d="M66 72 L70 30 L81 30 L86 68 Z" fill={mint} {...stroke} />
      <circle cx="83" cy="36" r="5" fill="#ffe27a" {...thin} />
      <rect x="44" y="63" width="28" height="8" rx="4" fill={mint} {...stroke} />
      <path d="M8 72 C 6 56 18 48 32 50 L50 54 L52 72 Z" fill={mint} {...stroke} />
      <path d="M14 50 C 16 43 38 43 42 50 Z" fill="#6b4a3a" {...thin} />
      <Wheel x={24} y={76} r={11} />
      <Wheel x={80} y={76} r={11} />
      <path d="M68 72 C 70 62 90 62 92 72 Z" fill={mint} {...thin} />
      <Face x={76} y={50} s={0.34} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Taxi({ mood, look }: ArtProps) {
  const yellow = "#ffc93c";
  return (
    <Svg>
      <rect x="36" y="14" width="28" height="12" rx="3" fill="#fff4d6" {...thin} />
      <text x="50" y="23.2" textAnchor="middle" fontSize="8" fontWeight="700" fontFamily="Arial, sans-serif" fill={INK}>
        TAXI
      </text>
      <path d="M26 44 C 30 30 36 26 50 26 C 62 26 68 30 74 44 Z" fill={yellow} {...stroke} />
      <path d="M34 42 C 36 34 40 32 48 32 L48 42 Z M54 32 C 62 32 64 34 68 42 L54 42 Z" fill={GLASS} {...thin} />
      <rect x="10" y="42" width="80" height="26" rx="10" fill={yellow} {...stroke} />
      <g fill={INK}>
        {[16, 24, 32, 40, 48, 56, 64, 72, 80].map((x, i) => (
          <rect key={x} x={x} y={i % 2 ? 60 : 63} width="4" height="3" />
        ))}
      </g>
      <circle cx="84" cy="50" r="3.6" fill="#fff4d6" {...thin} />
      <Wheel x={28} y={70} />
      <Wheel x={72} y={70} />
      <Face x={50} y={49} s={0.42} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Truck({ mood, look }: ArtProps) {
  return (
    <Svg>
      <rect x="6" y="24" width="58" height="46" rx="5" fill="#ffb13b" {...stroke} />
      <path d="M12 30 H58" stroke="#e08f1c" strokeWidth={3} strokeLinecap="round" />
      <path d="M64 70 L64 38 C 64 34 67 32 71 32 L82 32 C 86 32 88 35 90 40 L94 52 L94 70 Z" fill="#4f8fe8" {...stroke} />
      <path d="M70 38 H82 C 84 38 85 40 86 44 L88 50 H70 Z" fill={GLASS} {...thin} />
      <rect x="88" y="58" width="6" height="6" rx="2" fill="#ffe27a" {...thin} />
      <rect x="6" y="68" width="88" height="6" rx="3" fill="#6b6f7a" {...thin} />
      <Wheel x={22} y={76} />
      <Wheel x={46} y={76} />
      <Wheel x={80} y={76} />
      <Face x={35} y={46} s={0.55} mood={mood} look={look} />
    </Svg>
  );
}

/** 경주용 차 */
export function RaceCar({ mood, look }: ArtProps) {
  const red = "#ff4d4d";
  return (
    <Svg>
      <path d="M12 44 L14 56" stroke={INK} strokeWidth={LINE} />
      <rect x="4" y="38" width="18" height="7" rx="2" fill={red} {...stroke} />
      <circle cx="56" cy="42" r="8" fill="#ffd23f" {...stroke} />
      <path d="M56 38 H64 C 64 42 62 45 58 45 Z" fill="#3d3a4a" />
      <path d="M8 66 C 6 58 10 54 18 54 L36 52 C 40 47 44 46 48 46 L66 46 C 69 46 71 48 72 52 L90 56 C 96 58 98 64 96 68 Z" fill={red} {...stroke} />
      <path d="M74 57 L94 62" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <circle cx="45" cy="59" r="6.5" fill="#fff" {...thin} />
      <text x="45" y="62.4" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="Arial, sans-serif" fill={INK}>
        1
      </text>
      <Wheel x={24} y={70} r={12} />
      <Wheel x={80} y={70} r={11} />
      <Face x={63} y={56} s={0.32} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

/** 비행접시: 동그란 창 안에 외계인 친구 */
export function Ufo({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M44 31 L40 24 M56 31 L60 24" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <circle cx="40" cy="24" r="2.6" fill="#ff9ecf" />
      <circle cx="60" cy="24" r="2.6" fill="#ff9ecf" />
      <circle cx="50" cy="40" r="11" fill="#8fe07a" {...thin} />
      <Face x={50} y={40} s={0.42} mood={mood} look={look} cheeks={false} />
      <path d="M26 54 C 26 12 74 12 74 54 Z" fill="#bfe8ff" opacity="0.45" />
      <path d="M26 54 C 26 12 74 12 74 54" fill="none" {...stroke} />
      <path d="M33 34 C 36 28 40 25 44 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity="0.8" />
      <ellipse cx="50" cy="60" rx="44" ry="13" fill="#b8c2d6" {...stroke} />
      <ellipse cx="50" cy="55" rx="28" ry="5" fill="#dfe4ee" />
      {[
        [20, 62, "#ffd23f"],
        [35, 66, "#ff9ecf"],
        [50, 67.5, "#7fd1f5"],
        [65, 66, "#ffd23f"],
        [80, 62, "#ff9ecf"],
      ].map(([x, y, c]) => (
        <circle key={x as number} cx={x as number} cy={y as number} r="3.2" fill={c as string} {...thin} strokeWidth={1.8} />
      ))}
    </Svg>
  );
}

export function CableCar({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M0 16 L100 6" stroke={INK} strokeWidth={2.4} />
      <rect x="40" y="7" width="20" height="8" rx="4" fill="#6b6f7a" {...thin} />
      <path d="M50 14 L50 28" stroke={INK} strokeWidth={LINE} />
      <rect x="22" y="30" width="56" height="58" rx="10" fill="#ff5a5a" {...stroke} />
      <rect x="18" y="26" width="64" height="8" rx="4" fill="#e04848" {...stroke} />
      <rect x="28" y="40" width="20" height="18" rx="3" fill={GLASS} {...thin} />
      <rect x="52" y="40" width="20" height="18" rx="3" fill={GLASS} {...thin} />
      <Face x={50} y={70} s={0.45} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

/** 모터보트 */
export function Speedboat({ mood, look }: ArtProps) {
  return (
    <Svg>
      <path d="M2 66 C 6 62 10 62 13 66 M4 74 C 8 70 12 70 15 74" fill="none" stroke={WATER} strokeWidth={3} strokeLinecap="round" />
      <path d="M52 56 L60 40 L70 40 L66 56 Z" fill={GLASS} {...stroke} />
      <path d="M14 56 L78 56 C 88 56 94 60 98 66 C 90 74 76 78 60 78 L20 78 C 14 78 12 72 14 56 Z" fill="#fff" {...stroke} />
      <path d="M16 71 H88" stroke="#ff4d4d" strokeWidth={4} />
      <Waves y={88} />
      <Face x={40} y={62} s={0.4} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

/** 킥보드 */
export function KickScooter({ mood, look }: ArtProps) {
  return (
    <Svg>
      <Tube d="M72 70 L82 20" color="#8fa3bf" w={5} />
      <Tube d="M72 20 L92 20" color="#3d3a4a" w={4.4} />
      <rect x="14" y="62" width="66" height="14" rx="7" fill="#4fb3ff" {...stroke} />
      <Wheel x={22} y={82} r={8} />
      <Wheel x={80} y={82} r={8} />
      <Face x={46} y={68} s={0.36} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

/** 전철 */
export function Tram({ mood, look }: ArtProps) {
  const green = "#5cc98a";
  return (
    <Svg>
      <path d="M42 22 L52 12 L62 22 M38 12 H66" fill="none" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <rect x="10" y="18" width="80" height="7" rx="3" fill="#3fa56f" {...thin} />
      <rect x="6" y="22" width="88" height="52" rx="12" fill={green} {...stroke} />
      {[12, 30, 56, 74].map((x) => (
        <rect key={x} x={x} y="30" width="14" height="15" rx="3" fill={GLASS} {...thin} />
      ))}
      <path d="M7.6 52 H92.4" stroke="#fff" strokeWidth={3} />
      {[20, 34, 66, 80].map((x) => (
        <Wheel key={x} x={x} y={77} r={6} />
      ))}
      <Face x={50} y={62} s={0.42} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

/** 큰 배 */
export function Ship({ mood, look }: ArtProps) {
  return (
    <Svg>
      <Puffs pts={[[70, 10, 4.5], [77, 5, 3.4]]} />
      <path d="M58 38 L60 16 L72 16 L74 38 Z" fill="#ff5a5a" {...stroke} />
      <path d="M59.6 17.6 H72.4 L72 22 H60 Z" fill={INK} />
      <rect x="30" y="28" width="24" height="12" rx="2" fill="#fff" {...stroke} />
      <path d="M34 32 H50" stroke={GLASS} strokeWidth={4} />
      <rect x="22" y="38" width="58" height="20" rx="3" fill="#fff" {...stroke} />
      {[29, 37, 63, 71].map((x) => (
        <circle key={x} cx={x} cy="48" r="3" fill={GLASS} {...thin} strokeWidth={1.8} />
      ))}
      <path d="M4 56 L96 56 L86 84 L14 84 Z" fill="#3f6fd8" />
      <path d="M11.4 76 L88.6 76 L86 84 L14 84 Z" fill="#ff5a5a" />
      <path d="M4 56 L96 56 L86 84 L14 84 Z" fill="none" {...stroke} />
      <Waves y={92} />
      <Face x={50} y={46} s={0.4} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

export function Canoe({ mood, look }: ArtProps) {
  return (
    <Svg>
      <Tube d="M80 18 L42 84" color="#c98a52" w={4} />
      <ellipse cx="40" cy="88" rx="6" ry="11" fill="#e0a45c" {...stroke} transform="rotate(30 40 88)" />
      <path d="M4 54 C 20 66 80 66 96 54 C 92 72 74 82 50 82 C 26 82 8 72 4 54 Z" fill="#c98a52" {...stroke} />
      <path d="M6 55 C 22 64 78 64 94 55 C 78 60 22 60 6 55 Z" fill="#8a5a34" />
      <path d="M14 68 C 30 75 70 75 86 68" fill="none" stroke="#a06a3c" strokeWidth={2.4} strokeLinecap="round" />
      <Waves y={92} />
      <Face x={50} y={71} s={0.4} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}

/** 고속열차 */
export function BulletTrain({ mood, look }: ArtProps) {
  return (
    <Svg>
      {[18, 34, 60, 76].map((x) => (
        <circle key={x} cx={x} cy="77" r="4.4" fill="#3d3a4a" {...thin} />
      ))}
      <path d="M4 72 L4 40 C 4 35 8 32 13 32 L52 32 C 74 32 90 46 97 64 C 98 69 96 72 92 72 Z" fill="#fbfcff" {...stroke} />
      <path d="M5.6 66 H95" stroke="#3f7fe0" strokeWidth={4.4} />
      <path d="M62 36 C 74 38 84 46 88 54 L66 54 Z" fill="#2f4f8f" {...thin} />
      {[12, 26, 40].map((x) => (
        <rect key={x} x={x} y="40" width="9" height="9" rx="2" fill={GLASS} {...thin} />
      ))}
      <Face x={78} y={60} s={0.34} mood={mood} look={look} cheeks={false} />
    </Svg>
  );
}
