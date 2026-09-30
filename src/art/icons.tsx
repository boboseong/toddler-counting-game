import { Face, Shine } from "./Face";
import { starPath } from "./items";
import { Svg, Tube } from "./Svg";
import { INK, LINE, stroke } from "./palette";
import type { ArtProps } from "./types";

/* 화면 곳곳의 작은 그림: 놀이 아이콘 · 버튼 · 안내 표시 · 부모님 설정 */

const thin = { ...stroke, strokeWidth: LINE * 0.8 };
const SKIN = "#ffd2a8";
const SKIN_LINE = "#e8a070";
const GLASS = "#bfe8ff";

/* ---------- 놀이 아이콘 ---------- */

/** 거품 */
export function Bubbles({ mood, look }: ArtProps) {
  const bubble = (cx: number, cy: number, r: number) => (
    <g key={`${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={r} fill="#d6f1ff" fillOpacity="0.9" {...(r > 12 ? stroke : thin)} />
      <path
        d={`M${cx - r * 0.62} ${cy - r * 0.1} A ${r * 0.64} ${r * 0.64} 0 0 1 ${cx - r * 0.1} ${cy - r * 0.62}`}
        fill="none"
        stroke="#fff"
        strokeWidth={Math.max(2, r * 0.14)}
        strokeLinecap="round"
      />
      <path
        d={`M${cx + r * 0.66} ${cy + r * 0.12} A ${r * 0.68} ${r * 0.68} 0 0 1 ${cx + r * 0.12} ${cy + r * 0.66}`}
        fill="none"
        stroke="#ffb3d9"
        strokeWidth={Math.max(1.6, r * 0.09)}
        strokeLinecap="round"
        opacity="0.8"
      />
    </g>
  );
  return (
    <Svg>
      {bubble(78, 24, 15)}
      {bubble(82, 70, 9)}
      {bubble(42, 58, 31)}
      <Face x={44} y={62} s={0.6} mood={mood} look={look} />
    </Svg>
  );
}

/** 숫자 1 2 3 */
export function Numbers(_: ArtProps) {
  const tiles = [
    { x: 4, y: 56, c: "#ff6b6b", n: "1" },
    { x: 35, y: 42, c: "#ffc93c", n: "2" },
    { x: 66, y: 28, c: "#4fb3ff", n: "3" },
  ];
  return (
    <Svg>
      {tiles.map((t) => (
        <g key={t.n}>
          <rect x={t.x} y={t.y} width="30" height="30" rx="8" fill={t.c} {...stroke} />
          <text
            x={t.x + 15}
            y={t.y + 23.5}
            textAnchor="middle"
            fontSize="22"
            fontWeight="700"
            fontFamily="Jua, 'Arial Rounded MT Bold', Arial, sans-serif"
            fill="#fff"
            stroke={INK}
            strokeWidth={2.6}
            paintOrder="stroke"
            strokeLinejoin="round"
          >
            {t.n}
          </text>
        </g>
      ))}
    </Svg>
  );
}

/** 돋보기 */
export function Magnifier({ mood, look }: ArtProps) {
  return (
    <Svg>
      <Tube d="M62 62 L86 86" color="#8b5cf6" w={11} />
      <circle cx="40" cy="40" r="33" fill="#a78bfa" {...stroke} />
      <circle cx="40" cy="40" r="24" fill="#eaf7ff" {...stroke} />
      <path d="M24 34 A 17 17 0 0 1 34 23" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" />
      <Face x={40} y={42} s={0.52} mood={mood} look={look} />
    </Svg>
  );
}

/** 휴대전화 (숫자 따라 누르기) */
export function MobilePhone({ mood, look }: ArtProps) {
  const keys = ["#ff6b6b", "#ffc93c", "#4fb3ff", "#6fd98a", "#b18cff", "#ff8fc8", "#ffa94d", "#4fd1c5", "#8b9cff"];
  return (
    <Svg>
      <rect x="20" y="4" width="60" height="92" rx="14" fill="#ff7fa8" {...stroke} />
      <rect x="27" y="12" width="46" height="36" rx="7" fill="#eaf7ff" {...thin} />
      <Face x={50} y={29} s={0.5} mood={mood} look={look} />
      {keys.map((c, i) => (
        <circle
          key={i}
          cx={36 + (i % 3) * 14}
          cy={59 + Math.floor(i / 3) * 11.5}
          r="4.4"
          fill={c}
          {...thin}
          strokeWidth={2}
        />
      ))}
      <Shine x={26} y={16} rx={2.4} ry={6} rot={0} />
    </Svg>
  );
}

/** 회전목마 */
export function Carousel(_: ArtProps) {
  const pink = "#ff7fa8";
  return (
    <Svg>
      <path d="M26 38 V84 M74 38 V84" stroke={INK} strokeWidth={6.4} strokeLinecap="round" />
      <path d="M26 38 V84 M74 38 V84" stroke="#ffd23f" strokeWidth={3} strokeLinecap="round" />
      <path d="M50 38 V84" stroke={INK} strokeWidth={6.4} />
      <path d="M50 38 V84" stroke="#ffd23f" strokeWidth={3} />
      <path d="M50 4 L50 12" stroke={INK} strokeWidth={2.4} />
      <path d="M50 3 L61 6.5 L50 10 Z" fill="#ff5a7a" {...thin} strokeWidth={2} />
      <path d="M8 34 L50 11 L92 34 Z" fill={pink} />
      <path d="M50 11 L29 34 H43 Z M50 11 L57 34 H71 Z" fill="#fff" />
      <path d="M8 34 L50 11 L92 34 Z" fill="none" {...stroke} />
      <path
        d="M8 34 a 6 6 0 0 0 12 0 a 6 6 0 0 0 12 0 a 6 6 0 0 0 12 0 a 6 6 0 0 0 12 0 a 6 6 0 0 0 12 0 a 6 6 0 0 0 12 0 a 6 6 0 0 0 12 0 Z"
        fill="#ffd23f"
        {...thin}
      />
      {/* 목마 */}
      <path d="M34 62 C 27 60 25 66 28 71" fill="none" stroke={pink} strokeWidth={3.6} strokeLinecap="round" />
      <path d="M40 69 L36 78 M46 71 L46 80 M56 71 L58 80 M62 68 L66 77" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx="49" cy="64" rx="16" ry="8" fill="#fff" {...stroke} />
      <path d="M57 60 L61 48 C 62 44 69 42 72 46 L75 52 C 76 55 73 57 70 55 L66 54 L64 62 Z" fill="#fff" {...stroke} />
      <path d="M61 47 C 57 51 56 55 57 60" fill="none" stroke={pink} strokeWidth={3.4} strokeLinecap="round" />
      <circle cx="68.6" cy="48.4" r="1.6" fill={INK} />
      <ellipse cx="49" cy="58" rx="6.5" ry="3.2" fill="#4fb3ff" {...thin} strokeWidth={1.8} />
      <rect x="8" y="82" width="84" height="10" rx="5" fill={pink} {...stroke} />
    </Svg>
  );
}

/** 오므린 두 손에 사과와 쿠키 (나눠 주기) */
export function ShareHands(_: ArtProps) {
  const palm = "M7 49 C 5 60 10 73 22 81 C 32 87 43 88 50 86 L 50 63 C 40 65 27 61 19 51 C 16 46 9 44 7 49 Z";
  const hand = (flip: boolean) => (
    <g transform={flip ? "translate(100 0) scale(-1 1)" : undefined}>
      <path d={palm} fill={SKIN} {...stroke} />
      <path d="M11 58 C 14 64 19 68 25 70 M13 67 C 17 72 22 75 28 77" fill="none" stroke={SKIN_LINE} strokeWidth={2.6} strokeLinecap="round" />
    </g>
  );
  return (
    <Svg>
      <path d={sparkPath(84, 18, 9)} fill="#ffe27a" {...thin} />
      <path d={sparkPath(16, 26, 6)} fill="#ffe27a" {...thin} />
      {/* 사과 */}
      <circle cx="37" cy="45" r="15" fill="#ff5a5a" {...stroke} />
      <path d="M37 31 C 37 27 39 24 41 22" fill="none" stroke="#8a5a2b" strokeWidth={3.2} strokeLinecap="round" />
      <path d="M41 26 C 46 21 53 23 54 26 C 49 29 44 29 41 26 Z" fill="#6cc04a" {...thin} strokeWidth={2} />
      <ellipse cx="31" cy="39" rx="4" ry="2.4" fill="#fff" opacity="0.6" transform="rotate(-35 31 39)" />
      {/* 쿠키 */}
      <circle cx="64" cy="47" r="14" fill="#e0a45c" {...stroke} />
      <circle cx="59" cy="42" r="2.4" fill="#7a4a26" />
      <circle cx="68" cy="44" r="2.2" fill="#7a4a26" />
      <circle cx="63" cy="51" r="2.2" fill="#7a4a26" />
      <circle cx="71" cy="51" r="1.8" fill="#7a4a26" />
      {hand(false)}
      {hand(true)}
    </Svg>
  );
}

/* ---------- 손·몸 ---------- */

/** 귀 (안내를 듣는 중) */
export function EarIcon(_: ArtProps) {
  return (
    <Svg>
      <path d="M30 40 C 25 45 25 55 30 60 M20 32 C 11 41 11 59 20 68" fill="none" stroke="#a78bfa" strokeWidth={4} strokeLinecap="round" />
      <path
        d="M52 90 C 42 90 38 82 42 76 C 46 70 50 70 52 62 C 54 54 42 50 42 36 C 42 20 54 10 66 10 C 82 10 92 22 90 40 C 88 56 76 60 74 72 C 72 84 64 90 52 90 Z"
        fill={SKIN}
        {...stroke}
      />
      <path
        d="M60 72 C 62 64 72 60 74 48 C 76 34 68 26 60 28 C 52 30 52 40 58 44 C 64 48 62 56 58 58"
        fill="none"
        stroke={SKIN_LINE}
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <ellipse cx="68" cy="20" rx="6" ry="3" fill="#fff" opacity="0.6" transform="rotate(-20 68 20)" />
    </Svg>
  );
}

/** 위를 가리키는 손가락 */
export function PointUp(_: ArtProps) {
  return (
    <Svg>
      <rect x="28" y="6" width="18" height="54" rx="9" fill={SKIN} {...stroke} />
      <path d="M32 13 C 32 9 42 9 42 13 L42 17 C 42 19 32 19 32 17 Z" fill="#ffe9d8" />
      <path d="M24 56 C 24 46 30 43 36 44 L70 44 C 78 44 82 50 80 58 L78 80 C 76 90 68 94 56 94 L42 94 C 30 94 24 86 24 76 Z" fill={SKIN} {...stroke} />
      <path d="M52 53 C 60 51 70 53 76 58 M52 64 C 60 62 70 64 75 69 M52 75 C 59 73 67 75 72 80" fill="none" stroke={SKIN_LINE} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M21 64 C 21 58 26 56 32 56 L53 55 C 60 55 62 64 55 67 L32 73 C 26 74 21 70 21 64 Z" fill={SKIN} {...stroke} />
    </Svg>
  );
}

/** 흔드는 손 (안녕) */
export function WaveHand(_: ArtProps) {
  return (
    <Svg>
      <path d="M12 32 C 7 40 7 50 12 58 M88 22 C 94 30 94 40 90 48" fill="none" stroke="#a78bfa" strokeWidth={3.6} strokeLinecap="round" />
      <g transform="rotate(-14 56 60)">
        <ellipse cx="30" cy="62" rx="8" ry="14" fill={SKIN} {...stroke} transform="rotate(-38 30 62)" />
        <rect x="36" y="16" width="12" height="42" rx="6" fill={SKIN} {...stroke} />
        <rect x="49" y="10" width="12" height="46" rx="6" fill={SKIN} {...stroke} />
        <rect x="62" y="14" width="12" height="42" rx="6" fill={SKIN} {...stroke} />
        <rect x="74" y="24" width="11" height="34" rx="5.5" fill={SKIN} {...stroke} />
        <path d="M33 46 H85 V70 C 85 84 74 94 58 94 C 44 94 33 84 33 70 Z" fill={SKIN} {...stroke} />
        <path d="M44 48 V44 M56 48 V43 M68 48 V44" stroke={SKIN_LINE} strokeWidth={2.4} strokeLinecap="round" />
      </g>
    </Svg>
  );
}

/** 박수 */
export function Clap(_: ArtProps) {
  const mitten = (rot: number, dx: number) => (
    <g transform={`translate(${dx} 0) rotate(${rot} 50 60)`}>
      <ellipse cx="34" cy="62" rx="7" ry="12" fill={SKIN} {...stroke} transform="rotate(-30 34 62)" />
      <rect x="36" y="22" width="30" height="66" rx="15" fill={SKIN} {...stroke} />
      <path d="M44 30 V40 M51 28 V40 M58 30 V40" stroke={SKIN_LINE} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
  return (
    <Svg>
      <path d="M14 26 L8 18 M24 16 L22 7 M86 26 L92 18 M76 16 L78 7" stroke="#ffb81f" strokeWidth={3.6} strokeLinecap="round" />
      {mitten(18, 8)}
      {mitten(-18, -8)}
    </Svg>
  );
}

/** 동물 발자국 */
export function Paws(_: ArtProps) {
  const paw = (x: number, y: number, sc: number, rot: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} fill="#8b5e3c">
      <ellipse cx="0" cy="8" rx="11" ry="9" />
      <circle cx="-12" cy="-6" r="4.6" />
      <circle cx="-4.5" cy="-12.5" r="5" />
      <circle cx="4.5" cy="-12.5" r="5" />
      <circle cx="12" cy="-6" r="4.6" />
    </g>
  );
  return <Svg>{[paw(32, 68, 1.25, -20), paw(70, 30, 1.05, 15)]}</Svg>;
}

/** 엘리베이터 (딩동 엘리베이터): 층 표시 위에 ▲, 문에 얼굴 */
export function Elevator({ mood, look }: ArtProps) {
  const door = "#d6dde8";
  return (
    <Svg>
      <rect x="10" y="4" width="80" height="92" rx="10" fill="#2dd4bf" {...stroke} />
      <rect x="30" y="10" width="40" height="15" rx="5" fill="#334155" {...thin} />
      <path d="M37 21 L42 14 L47 21 Z" fill="#fbbf24" />
      <text
        x="58"
        y="22"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
        fontFamily="Jua, 'Arial Rounded MT Bold', Arial, sans-serif"
        fill="#fbbf24"
      >
        5
      </text>
      <rect x="20" y="31" width="60" height="59" rx="3" fill={door} {...stroke} />
      <path d="M50 31 V90" stroke={INK} strokeWidth={LINE * 0.8} />
      <path d="M26 36 V84 M56 36 V84" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity="0.7" />
      <Face x={50} y={60} s={0.62} mood={mood} look={look} />
    </Svg>
  );
}

/* ---------- 버튼 · 표시 ---------- */

/** 집 (홈 버튼) */
export function House(_: ArtProps) {
  return (
    <Svg>
      <rect x="64" y="18" width="11" height="22" fill="#c9423a" {...stroke} />
      <rect x="18" y="44" width="64" height="46" rx="3" fill="#fff4e3" {...stroke} />
      <path d="M8 50 L50 12 L92 50 Z" fill="#ff6a5c" {...stroke} />
      <path d="M42 90 V68 C 42 61 58 61 58 68 V90 Z" fill="#c98a52" {...thin} />
      <circle cx="54" cy="78" r="1.8" fill={INK} />
      {[24, 62].map((x) => (
        <g key={x}>
          <rect x={x} y="56" width="14" height="14" rx="2" fill={GLASS} {...thin} />
          <path d={`M${x + 7} 56 V70 M${x} 63 H${x + 14}`} stroke={INK} strokeWidth={1.6} />
        </g>
      ))}
    </Svg>
  );
}

/** 마당이 있는 집 (스티커북: 장면에 붙인 친구 표시) */
export function HouseGarden(_: ArtProps) {
  return (
    <Svg>
      <rect x="78" y="56" width="7" height="30" fill="#a0703e" {...thin} />
      <circle cx="81" cy="46" r="15" fill="#5cc26a" {...stroke} />
      <rect x="12" y="48" width="52" height="40" rx="2" fill="#fff4e3" {...stroke} />
      <path d="M4 52 L38 20 L72 52 Z" fill="#ff6a5c" {...stroke} />
      <path d="M32 88 V71 C 32 65 44 65 44 71 V88 Z" fill="#c98a52" {...thin} />
      <rect x="16" y="58" width="11" height="11" rx="2" fill={GLASS} {...thin} />
      <rect x="2" y="86" width="96" height="9" rx="4.5" fill="#8fd16a" {...thin} />
      <circle cx="56" cy="84" r="3" fill="#ff7fa8" {...thin} strokeWidth={1.6} />
      <circle cx="68" cy="85" r="3" fill="#ffd23f" {...thin} strokeWidth={1.6} />
    </Svg>
  );
}

/** 스티커북 */
export function StickerBookIcon({ mood, look }: ArtProps) {
  return (
    <Svg>
      <rect x="24" y="11" width="62" height="80" rx="6" fill="#fff" {...stroke} />
      <path d="M80 18 V84" stroke="#e2e8f0" strokeWidth={2.4} />
      <rect x="14" y="8" width="64" height="82" rx="8" fill="#a78bfa" {...stroke} />
      <path d="M26 9.6 V88.4" stroke="#8b5cf6" strokeWidth={6} />
      <path d="M29 8 V90" stroke={INK} strokeWidth={2.2} />
      <path d={starPath(52, 46, 21, 10)} fill="#ffd23f" {...thin} />
      <Face x={52} y={48} s={0.36} mood={mood ?? "happy"} look={look} cheeks={false} />
      <path d="M38 76 C 38 72 43 71 44 75 C 45 71 50 72 50 76 C 50 80 44 83 44 83 C 44 83 38 80 38 76 Z" fill="#ff7fa8" {...thin} strokeWidth={1.8} />
      <path d="M62 88 L62 98 L66 94.5 L70 98 L70 88" fill="#ff5a7a" {...thin} strokeWidth={2} />
    </Svg>
  );
}

/** 접시와 포크·숟가락 (먹이 주기) */
export function Plate({ mood, look }: ArtProps) {
  const metal = "#cfd6e2";
  return (
    <Svg>
      <Tube d="M13 36 V88" color={metal} w={5} />
      <Tube d="M7 12 V26 M13 12 V26 M19 12 V26" color={metal} w={2.4} />
      <Tube d="M7 26 C 7 36 19 36 19 26" color={metal} w={3.4} />
      <Tube d="M87 44 V88" color={metal} w={5} />
      <ellipse cx="87" cy="27" rx="8.5" ry="13" fill={metal} {...stroke} />
      <circle cx="50" cy="52" r="30" fill="#fff" {...stroke} />
      <circle cx="50" cy="52" r="21" fill="#f3f6fb" stroke="#dde3ec" strokeWidth={2.4} />
      <Face x={50} y={52} s={0.55} mood={mood} look={look} />
    </Svg>
  );
}

/** 폭죽 (축하) */
export function Party(_: ArtProps) {
  const cone = "M8 92 L30 40 L60 70 Z";
  return (
    <Svg>
      <path d="M40 36 C 34 26 46 22 42 12" fill="none" stroke="#a78bfa" strokeWidth={3.6} strokeLinecap="round" />
      <path d="M64 60 C 74 56 78 68 90 64" fill="none" stroke="#6cc04a" strokeWidth={3.6} strokeLinecap="round" />
      <path d="M52 44 C 58 34 66 38 72 28" fill="none" stroke="#ff5a7a" strokeWidth={3.6} strokeLinecap="round" />
      <rect x="60" y="14" width="8" height="4.5" rx="1.5" fill="#4fb3ff" transform="rotate(30 64 16)" />
      <rect x="82" y="44" width="8" height="4.5" rx="1.5" fill="#ffd23f" transform="rotate(-20 86 46)" />
      <rect x="22" y="18" width="8" height="4.5" rx="1.5" fill="#ff7fa8" transform="rotate(-35 26 20)" />
      <circle cx="80" cy="28" r="3.6" fill="#ff5a7a" />
      <circle cx="54" cy="8" r="3" fill="#ffd23f" />
      <circle cx="92" cy="80" r="3" fill="#4fb3ff" />
      <path d={starPath(84, 12, 7, 3.2)} fill="#ffd23f" />
      <path d={cone} fill="#ffc93c" />
      <path d="M16.8 71.2 L28.8 83.2 M23.4 55.6 L44.4 76.6" stroke="#ff5a7a" strokeWidth={6} />
      <path d={cone} fill="none" {...stroke} />
    </Svg>
  );
}

function sparkPath(x: number, y: number, r: number): string {
  const k = r * 0.16;
  return `M${x} ${y - r} C ${x + k} ${y - k} ${x + k} ${y - k} ${x + r} ${y} C ${x + k} ${y + k} ${x + k} ${y + k} ${x} ${y + r} C ${x - k} ${y + k} ${x - k} ${y + k} ${x - r} ${y} C ${x - k} ${y - k} ${x - k} ${y - k} ${x} ${y - r} Z`;
}

/** 반짝반짝 */
export function Sparkles(_: ArtProps) {
  return (
    <Svg>
      <path d={sparkPath(40, 58, 34)} fill="#ffd23f" {...stroke} />
      <path d={sparkPath(79, 22, 15)} fill="#ffe27a" {...thin} />
      <path d={sparkPath(80, 74, 11)} fill="#ffe27a" {...thin} />
    </Svg>
  );
}

/** 자명종 (놀이 시간 알림) */
export function AlarmClock(_: ArtProps) {
  return (
    <Svg>
      <path d="M28 84 L20 94 M72 84 L80 94" stroke={INK} strokeWidth={LINE * 1.5} strokeLinecap="round" />
      <path d="M12 36 C 8 20 26 10 38 22 Z" fill="#ffd23f" {...stroke} />
      <path d="M88 36 C 92 20 74 10 62 22 Z" fill="#ffd23f" {...stroke} />
      <path d="M50 14 V24" stroke={INK} strokeWidth={LINE} />
      <circle cx="50" cy="13" r="4" fill="#ffd23f" {...thin} />
      <circle cx="50" cy="56" r="32" fill="#ff5a5a" {...stroke} />
      <circle cx="50" cy="56" r="24" fill="#fff" {...thin} />
      <path d="M50 35 V39 M50 73 V77 M29 56 H33 M67 56 H71" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M50 56 L50 42 M50 56 L61 61" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
      <circle cx="50" cy="56" r="3" fill={INK} />
    </Svg>
  );
}

/** 막대그래프 (기록) */
export function BarChart(_: ArtProps) {
  return (
    <Svg>
      <rect x="10" y="12" width="80" height="76" rx="10" fill="#fff" {...stroke} />
      <path d="M20 30 H80 M20 46 H80 M20 62 H80" stroke="#e2e8f0" strokeWidth={2} />
      <rect x="24" y="52" width="13" height="26" rx="2" fill="#ff6b6b" {...thin} />
      <rect x="44" y="38" width="13" height="40" rx="2" fill="#ffc93c" {...thin} />
      <rect x="64" y="24" width="13" height="54" rx="2" fill="#4fb3ff" {...thin} />
      <path d="M18 78 H82" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

/** 전구 (팁) */
export function Bulb({ mood, look }: ArtProps) {
  return (
    <Svg>
      <g stroke="#ffc928" strokeWidth={4} strokeLinecap="round">
        {[-160, -125, -90, -55, -20].map((d) => {
          const a = (d * Math.PI) / 180;
          return (
            <path
              key={d}
              d={`M${50 + Math.cos(a) * 40} ${40 + Math.sin(a) * 40} L${50 + Math.cos(a) * 48} ${40 + Math.sin(a) * 48}`}
            />
          );
        })}
      </g>
      <path d="M50 10 C 31 10 20 25 20 40 C 20 54 29 60 33 70 L67 70 C 71 60 80 54 80 40 C 80 25 69 10 50 10 Z" fill="#ffe066" {...stroke} />
      <rect x="33" y="69" width="34" height="8" rx="3" fill="#b8c2d6" {...thin} />
      <rect x="35" y="76" width="30" height="8" rx="3" fill="#cfd6e2" {...thin} />
      <path d="M42 84 H58 L55 90 H45 Z" fill="#8f96a3" {...thin} />
      <Shine x={34} y={28} rx={4.5} ry={8} />
      <Face x={50} y={42} s={0.65} mood={mood ?? "happy"} look={look} />
    </Svg>
  );
}

/** 톱니바퀴 (설정) */
export function Gear(_: ArtProps) {
  const metal = "#b8c2d6";
  return (
    <Svg>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="42" y="5" width="16" height="22" rx="4" fill={metal} {...stroke} transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="31" fill={metal} {...stroke} />
      <circle cx="50" cy="50" r="12" fill="#fff" {...stroke} />
      <Shine x={34} y={36} rx={4} ry={7} />
    </Svg>
  );
}

/** 모르는 스티커 자리 */
export function Question(_: ArtProps) {
  return (
    <Svg>
      <Tube d="M32 34 C 32 20 42 12 52 12 C 64 12 72 20 72 32 C 72 44 56 46 54 58 L54 64" color="#e2e8f0" w={11} />
      <circle cx="54" cy="83" r="8" fill="#e2e8f0" {...stroke} />
    </Svg>
  );
}

/** ▶ (글자 색을 따른다) */
export function Play(_: ArtProps) {
  return (
    <Svg>
      <path d="M26 16 C 26 10 32 7 37 10 L84 44 C 89 47 89 53 84 56 L37 90 C 32 93 26 90 26 84 Z" fill="currentColor" />
    </Svg>
  );
}

/** 전화 수화기 (글자 색을 따른다) */
export function Handset(_: ArtProps) {
  return (
    <Svg>
      <path d="M31 30 C 26 52 46 74 70 70" fill="none" stroke="currentColor" strokeWidth={15} strokeLinecap="round" />
      <rect x="15" y="16" width="30" height="19" rx="9" fill="currentColor" transform="rotate(-62 30 25.5)" />
      <rect x="61" y="63" width="30" height="19" rx="9" fill="currentColor" transform="rotate(-28 76 72.5)" />
    </Svg>
  );
}

/** 지우기 ⌫ (글자 색을 따른다) */
export function Backspace(_: ArtProps) {
  return (
    <Svg>
      <path
        d="M38 20 H82 C 88 20 92 24 92 30 V70 C 92 76 88 80 82 80 H38 L8 50 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <path d="M48 36 L72 64 M72 36 L48 64" stroke="currentColor" strokeWidth={8} strokeLinecap="round" />
    </Svg>
  );
}

/** ✔ (글자 색을 따른다) */
export function Check(_: ArtProps) {
  return (
    <Svg>
      <path d="M14 52 L38 76 L86 24" fill="none" stroke="currentColor" strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
