import { Whiskers, type CritterSpec } from "./Critter";
import { Face, Shine } from "./Face";
import { Svg } from "./Svg";
import { BLUSH, INK, LINE, stroke } from "./palette";
import type { ArtProps } from "./types";

/* 스티커 친구 (동물 친구 · 숲속 친구). 대부분 Critter 틀을 쓰고, 몸 모양이 전혀 다른 친구만 따로 그린다 */

const thin = { ...stroke, strokeWidth: LINE * 0.8 };

/** 머리 가운데(50, 44)를 기준으로 θ(도) 방향, 반지름 r 인 점 */
function around(deg: number, r: number, cx = 50, cy = 44): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
}

/** 머리 둘레에 붙은 뾰족한 가시·깃 (공룡 등 가시, 고슴도치 가시) */
function Spikes({ from, to, n, len, color, half = 11 }: { from: number; to: number; n: number; len: number; color: string; half?: number }) {
  return (
    <g fill={color} {...stroke}>
      {Array.from({ length: n }).map((_, i) => {
        const d = from + ((to - from) * i) / Math.max(1, n - 1);
        const [ax, ay] = around(d - half, 25);
        const [bx, by] = around(d, 28 + len);
        const [cx, cy] = around(d + half, 25);
        return <path key={i} d={`M${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)} L${cx.toFixed(1)} ${cy.toFixed(1)} Z`} />;
      })}
    </g>
  );
}

/** 머리 둘레의 동글동글한 털·갈기 */
function Puffs({ degs, r, dist = 27, colors }: { degs: number[]; r: number | number[]; dist?: number; colors: string[] }) {
  return (
    <g {...stroke}>
      {degs.map((d, i) => {
        const [x, y] = around(d, dist);
        const rr = Array.isArray(r) ? r[i % r.length] : r;
        return <circle key={i} cx={x} cy={y} r={rr} fill={colors[i % colors.length]} />;
      })}
    </g>
  );
}

/* ---------- 1권: 동물 친구 ---------- */

export const FROG: CritterSpec = {
  fur: "#7ccf5a",
  light: "#e2f6cc",
  ears: "none",
  nose: "none",
  faceY: 20,
  mouthDy: 23,
  cheeks: false,
  crown: (
    <g fill="#7ccf5a" {...stroke}>
      <circle cx="38.6" cy="19" r="12.5" />
      <circle cx="61.4" cy="19" r="12.5" />
    </g>
  ),
  marks: (
    <g>
      <circle cx="38.6" cy="20" r="8.5" fill="#fff" />
      <circle cx="61.4" cy="20" r="8.5" fill="#fff" />
      <ellipse cx="30" cy="48" rx="5" ry="3.4" fill={BLUSH} opacity="0.6" />
      <ellipse cx="70" cy="48" rx="5" ry="3.4" fill={BLUSH} opacity="0.6" />
      <circle cx="46.5" cy="40" r="1.4" fill={INK} opacity="0.6" />
      <circle cx="53.5" cy="40" r="1.4" fill={INK} opacity="0.6" />
    </g>
  ),
};

export const UNICORN: CritterSpec = {
  fur: "#fffafd",
  light: "#ffe6f0",
  ears: "pointy",
  earInner: "#ffc2d9",
  nose: "muzzle",
  noseColor: "#ffd6e6",
  crown: <Puffs degs={[-105, -130, -155, -180, 155, 130]} r={[10, 10, 10, 9, 8, 7]} colors={["#ff9ecf", "#b89cff", "#8fd3ff", "#ffe07a"]} />,
  marks: (
    <g>
      <path d="M44 22 L50 -2 L56 22 Z" fill="#ffd23f" {...thin} />
      <path d="M45.6 15 L54 12 M47.4 8 L52.6 6" stroke="#e8a51c" strokeWidth={2} strokeLinecap="round" />
      <path d="M36 22 C 40 16 50 16 50 24 C 46 22 40 24 36 22 Z" fill="#ff9ecf" {...thin} />
    </g>
  ),
};

export const PENGUIN: CritterSpec = {
  fur: "#3d4a63",
  light: "#ffffff",
  ears: "none",
  nose: "beak",
  feet: "#ffa62b",
  marks: <path d="M50 31 C 44 24 30 26 28 40 C 26 56 38 68 50 68 C 62 68 74 56 72 40 C 70 26 56 24 50 31 Z" fill="#fff" />,
  belly: <ellipse cx="50" cy="80" rx="17" ry="13" fill="#fff" />,
};

export const DINO: CritterSpec = {
  fur: "#7fd06b",
  light: "#e3f7c8",
  ears: "none",
  nose: "none",
  crown: <Spikes from={-160} to={-20} n={5} len={11} color="#ffb13b" />,
  back: <path d="M64 74 C 80 78 90 72 98 60 C 98 76 86 92 66 90 Z" fill="#7fd06b" {...stroke} />,
  marks: (
    <g fill="#5fb54c">
      <circle cx="31" cy="33" r="3.6" />
      <circle cx="67" cy="29" r="3" />
      <circle cx="72" cy="37" r="2.2" />
      <circle cx="29" cy="56" r="2.4" />
    </g>
  ),
};

export const OWL: CritterSpec = {
  fur: "#a8784c",
  light: "#f3dfbf",
  ears: "tuft",
  earInner: "#f3dfbf",
  nose: "beak",
  feet: "#ffa62b",
  marks: (
    <g fill="#fff4de" stroke={INK} strokeWidth={2}>
      <circle cx="38.6" cy="43" r="11" />
      <circle cx="61.4" cy="43" r="11" />
    </g>
  ),
  belly: (
    <path
      d="M43 77 l3.5 3 l3.5 -3 M51 77 l3.5 3 l3.5 -3 M47 84 l3.5 3 l3.5 -3"
      fill="none"
      stroke="#c9a06c"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export const GIRAFFE: CritterSpec = {
  fur: "#f9c74f",
  light: "#fde8b0",
  ears: "flat",
  earInner: "#f3a953",
  nose: "muzzle",
  noseColor: "#fde3a4",
  crown: (
    <g>
      <path d="M37 24 L35 7 L41 7 L43 24 Z" fill="#f9c74f" {...thin} />
      <path d="M63 24 L65 7 L59 7 L57 24 Z" fill="#f9c74f" {...thin} />
      <circle cx="38" cy="6" r="5" fill="#a0612f" {...thin} />
      <circle cx="62" cy="6" r="5" fill="#a0612f" {...thin} />
    </g>
  ),
  marks: (
    <g fill="#e0913a">
      <circle cx="28" cy="37" r="4" />
      <circle cx="71" cy="34" r="4.4" />
      <circle cx="45" cy="25" r="3" />
      <circle cx="58" cy="24" r="2.6" />
      <circle cx="70" cy="58" r="3" />
      <circle cx="29" cy="59" r="2.6" />
    </g>
  ),
  belly: (
    <g fill="#e0913a">
      <circle cx="33" cy="74" r="3.4" />
      <circle cx="67" cy="73" r="3.6" />
      <circle cx="62" cy="90" r="2.6" />
    </g>
  ),
};

export const ZEBRA: CritterSpec = {
  fur: "#ffffff",
  light: "#f1f1f4",
  ears: "pointy",
  earInner: "#d9d9e0",
  nose: "muzzle",
  noseColor: "#8a8494",
  crown: <path d="M34 22 L37 8 L43 16 L50 4 L57 16 L63 8 L66 22 Z" fill="#2f2a33" {...thin} />,
  marks: (
    <g stroke="#2f2a33" strokeWidth={3.6} strokeLinecap="round" fill="none">
      <path d="M41 19 Q 45 25 43 30" />
      <path d="M50 17 L50 28" />
      <path d="M59 19 Q 55 25 57 30" />
      <path d="M23 38 Q 28 38 31 43" />
      <path d="M23 49 Q 28 48 31 52" />
      <path d="M77 38 Q 72 38 69 43" />
      <path d="M77 49 Q 72 48 69 52" />
    </g>
  ),
  belly: (
    <g stroke="#2f2a33" strokeWidth={3.4} strokeLinecap="round" fill="none">
      <path d="M31 69 Q 36 74 34 82" />
      <path d="M69 69 Q 64 74 66 82" />
    </g>
  ),
};

/* ---------- 3권: 숲속 친구 ---------- */

export const HORSE: CritterSpec = {
  fur: "#c0814f",
  light: "#ecc9a4",
  ears: "pointy",
  earInner: "#8c5634",
  nose: "muzzle",
  noseColor: "#ecc9a4",
  crown: <Puffs degs={[-100, -125, -150, -175, 160]} r={[9, 9, 9, 8, 7]} colors={["#5b3a24"]} />,
  marks: <path d="M42 17 C 44 26 48 31 51 31 C 51 26 55 21 58 17 C 52 14 47 14 42 17 Z" fill="#5b3a24" />,
};

export const SHEEP: CritterSpec = {
  fur: "#fffdf8",
  light: "#ffffff",
  ears: "flat",
  earColor: "#f2d4b5",
  earInner: "#e8b896",
  nose: "dot",
  noseColor: "#b0707a",
  limbs: "#8a6d5c",
  // 몸 둘레의 털
  back: (
    <g fill="#fffdf8" {...stroke}>
      {[150, 180, 210, 330, 0, 30].map((d) => {
        const a = (d * Math.PI) / 180;
        return <circle key={d} cx={50 + Math.cos(a) * 22} cy={80 + Math.sin(a) * 14} r="8" />;
      })}
    </g>
  ),
  crown: <Puffs degs={[-190, -160, -130, -100, -80, -50, -20, 10]} r={9} colors={["#fffdf8"]} />,
  marks: (
    <g>
      <ellipse cx="50" cy="51" rx="20" ry="19" fill="#f6dcc2" />
      <g fill="#fffdf8" {...thin}>
        <circle cx="37" cy="27" r="8.5" />
        <circle cx="63" cy="27" r="8.5" />
        <circle cx="50" cy="23" r="10" />
      </g>
    </g>
  ),
};

export const GOAT: CritterSpec = {
  fur: "#f4efe6",
  light: "#ffffff",
  ears: "flat",
  earInner: "#f3c4c0",
  nose: "muzzle",
  noseColor: "#f5d6cf",
  crown: (
    <g fill="#b8a48c" {...thin}>
      <path d="M40 22 C 34 8 22 6 17 14 C 24 12 30 16 34 27 Z" />
      <path d="M60 22 C 66 8 78 6 83 14 C 76 12 70 16 66 27 Z" />
    </g>
  ),
  front: <path d="M45 69 C 46 77 48 83 50 86 C 52 83 54 77 55 69 Z" fill="#f4efe6" {...thin} />,
};

export const LLAMA: CritterSpec = {
  fur: "#f3e2c4",
  light: "#fff7ea",
  ears: "long",
  earInner: "#e8c49a",
  nose: "muzzle",
  noseColor: "#fff3e0",
  marks: (
    <g fill="#fbf0dc" {...thin}>
      <circle cx="41" cy="21" r="7" />
      <circle cx="59" cy="21" r="7" />
      <circle cx="50" cy="17" r="8" />
    </g>
  ),
  belly: (
    <g>
      <path d="M31 69 L69 69 L65 86 L35 86 Z" fill="#ff7fa8" {...thin} />
      <path d="M33 75 H67" stroke="#ffd23f" strokeWidth={3} />
      <path d="M35 81 H65" stroke="#7fd1f5" strokeWidth={3} />
    </g>
  ),
};

export const HEDGEHOG: CritterSpec = {
  fur: "#f0d0a8",
  light: "#fff1de",
  ears: "none",
  nose: "dot",
  limbs: "#e3b98a",
  crown: <Spikes from={-205} to={25} n={12} len={10} color="#8b5e3c" half={10} />,
  marks: (
    <path
      d="M22.5 42 C 23 24 36 16 50 16 C 64 16 77 24 77.5 42 C 72 34 62 31 55 33 C 52 30 48 30 45 33 C 38 31 28 34 22.5 42 Z"
      fill="#8b5e3c"
    />
  ),
};

export const RACCOON: CritterSpec = {
  fur: "#9aa0a9",
  light: "#f4f4f6",
  ears: "pointy",
  earInner: "#3f3a44",
  nose: "dot",
  muzzle: true,
  back: (
    <g {...stroke}>
      {[
        [72, 88, "#9aa0a9"],
        [80, 82, "#3a353f"],
        [86, 74, "#9aa0a9"],
        [89, 65, "#3a353f"],
        [89, 56, "#9aa0a9"],
      ].map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r={7.5 - i * 0.4} fill={c as string} />
      ))}
    </g>
  ),
  marks: (
    <g>
      <ellipse cx="50" cy="31" rx="17" ry="6" fill="#f4f4f6" />
      <path d="M22 46 C 26 36 42 36 50 43 C 58 36 74 36 78 46 C 72 54 58 52 50 48 C 42 52 28 54 22 46 Z" fill="#3a353f" />
      <circle cx="38.6" cy="44" r="5.8" fill="#fff" />
      <circle cx="61.4" cy="44" r="5.8" fill="#fff" />
    </g>
  ),
};

export const OTTER: CritterSpec = {
  fur: "#946441",
  light: "#f3e1c7",
  ears: "small",
  earInner: "#6e4a30",
  nose: "none",
  mouthDy: 4,
  marks: (
    <g>
      <path d="M24 50 C 24 38 36 34 50 38 C 64 34 76 38 76 50 C 76 64 64 72 50 72 C 36 72 24 64 24 50 Z" fill="#f3e1c7" />
      <ellipse cx="50" cy="52" rx="5" ry="3.6" fill="#3d2a22" />
    </g>
  ),
  front: <Whiskers y={57} />,
  // 배 위에 조개를 올려놓고 있다
  belly: (
    <g>
      <path d="M40 84 C 40 72 60 72 60 84 Z" fill="#ffc7d6" {...thin} />
      <path d="M50 84 L45 76 M50 84 L50 74.5 M50 84 L55 76" stroke="#f2a0b6" strokeWidth={1.8} strokeLinecap="round" />
    </g>
  ),
};

export const PARROT: CritterSpec = {
  fur: "#ff5147",
  light: "#ffd84d",
  ears: "none",
  nose: "beak",
  limbs: "#3aa0ff",
  feet: "#8f96a3",
  back: (
    <g {...stroke}>
      <path d="M62 84 C 74 94 84 100 94 98 C 90 90 80 84 68 78 Z" fill="#3aa0ff" />
      <path d="M60 88 C 68 96 74 102 82 102 C 80 96 74 90 64 84 Z" fill="#ffd84d" />
    </g>
  ),
  crown: (
    <g fill="#ff5147" {...thin}>
      <path d="M44 20 C 40 8 45 1 50 2 C 48 8 50 14 53 19 Z" />
      <path d="M50 19 C 52 6 59 1 64 4 C 59 8 57 14 57 21 Z" />
    </g>
  ),
  marks: (
    <g fill="#fff">
      <ellipse cx="38.6" cy="44" rx="8.5" ry="9" />
      <ellipse cx="61.4" cy="44" rx="8.5" ry="9" />
    </g>
  ),
};

export const PEACOCK: CritterSpec = {
  fur: "#2f80d8",
  light: "#9fd6ff",
  ears: "none",
  nose: "beak",
  feet: "#8f96a3",
  back: (
    <g>
      {Array.from({ length: 9 }).map((_, i) => {
        const d = -200 + (220 * i) / 8;
        const [fx, fy] = around(d, 33);
        const [ex, ey] = around(d, 40);
        return (
          <g key={i}>
            <ellipse cx={fx} cy={fy} rx="9" ry="17" fill="#3bb273" {...thin} transform={`rotate(${d + 90} ${fx} ${fy})`} />
            <circle cx={ex} cy={ey} r="5.6" fill="#ffd23f" {...thin} />
            <circle cx={ex} cy={ey} r="3" fill="#2f80d8" />
          </g>
        );
      })}
    </g>
  ),
  crown: (
    <g>
      <path d="M50 18 L42 5 M50 18 L50 2 M50 18 L58 5" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <g fill="#2f80d8" {...thin} strokeWidth={2}>
        <circle cx="42" cy="5" r="3.4" />
        <circle cx="50" cy="2" r="3.4" />
        <circle cx="58" cy="5" r="3.4" />
      </g>
    </g>
  ),
};

export const KANGAROO: CritterSpec = {
  fur: "#d49a62",
  light: "#f4dcbd",
  ears: "long",
  earInner: "#f1b9a3",
  nose: "dot",
  muzzle: true,
  back: <path d="M62 86 C 78 96 92 98 99 92 C 92 88 80 82 68 78 Z" fill="#d49a62" {...stroke} />,
  belly: (
    <g>
      <ellipse cx="45.5" cy="73" rx="2.4" ry="4.6" fill="#d49a62" stroke={INK} strokeWidth={1.6} />
      <ellipse cx="54.5" cy="73" rx="2.4" ry="4.6" fill="#d49a62" stroke={INK} strokeWidth={1.6} />
      <circle cx="50" cy="80" r="7.4" fill="#d49a62" stroke={INK} strokeWidth={2} />
      <circle cx="47.3" cy="79.4" r="1.3" fill={INK} />
      <circle cx="52.7" cy="79.4" r="1.3" fill={INK} />
      <path d="M34 82 C 38 95 62 95 66 82 C 58 86 42 86 34 82 Z" fill="#f4dcbd" {...thin} />
    </g>
  ),
};

export const SLOTH: CritterSpec = {
  fur: "#b39a7e",
  light: "#eadbc6",
  ears: "none",
  nose: "dot",
  marks: (
    <g>
      <ellipse cx="50" cy="48" rx="23" ry="19" fill="#efe3d1" />
      <ellipse cx="36.5" cy="46" rx="9.5" ry="6" fill="#8d6b50" transform="rotate(18 36.5 46)" />
      <ellipse cx="63.5" cy="46" rx="9.5" ry="6" fill="#8d6b50" transform="rotate(-18 63.5 46)" />
    </g>
  ),
};

export const CROCODILE: CritterSpec = {
  fur: "#6cc15a",
  light: "#d8f2b8",
  ears: "none",
  nose: "none",
  faceY: 23,
  mouthDy: 26,
  cheeks: false,
  crown: (
    <g fill="#6cc15a" {...stroke}>
      <circle cx="38.6" cy="21" r="11" />
      <circle cx="61.4" cy="21" r="11" />
    </g>
  ),
  marks: (
    <g>
      <circle cx="38.6" cy="23" r="7.5" fill="#fff7c2" />
      <circle cx="61.4" cy="23" r="7.5" fill="#fff7c2" />
      <g fill="#4fa742">
        <circle cx="50" cy="30" r="2.2" />
        <circle cx="44" cy="36" r="1.8" />
        <circle cx="56" cy="36" r="1.8" />
      </g>
      <ellipse cx="50" cy="56" rx="22" ry="13" fill="#8fd679" {...thin} />
      <circle cx="44" cy="49" r="1.8" fill={INK} opacity="0.7" />
      <circle cx="56" cy="49" r="1.8" fill={INK} opacity="0.7" />
      <path d="M33 63 l3 4 l3 -3 M61 64 l3 3 l3 -4" fill="#fff" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <ellipse cx="29" cy="38" rx="4.5" ry="3" fill={BLUSH} opacity="0.55" />
      <ellipse cx="71" cy="38" rx="4.5" ry="3" fill={BLUSH} opacity="0.55" />
    </g>
  ),
};

export const HIPPO: CritterSpec = {
  fur: "#b7a2cf",
  light: "#e5d9f0",
  ears: "small",
  earInner: "#f2b3c6",
  nose: "none",
  mouthDy: 10,
  marks: (
    <g>
      <ellipse cx="50" cy="60" rx="23" ry="13" fill="#d3c2e6" {...thin} />
      <ellipse cx="42" cy="55" rx="2.6" ry="3.4" fill={INK} opacity="0.7" />
      <ellipse cx="58" cy="55" rx="2.6" ry="3.4" fill={INK} opacity="0.7" />
    </g>
  ),
};

export const RHINO: CritterSpec = {
  fur: "#a8aeb9",
  light: "#d8dbe2",
  ears: "pointy",
  earInner: "#e8b7c2",
  nose: "snout",
  noseColor: "#c3c8d1",
  front: <path d="M44 51 C 46 44 48 38 50.5 32 C 53 38 55 45 56 51 Z" fill="#f3ead8" {...thin} />,
};

export const GORILLA: CritterSpec = {
  fur: "#4f4654",
  light: "#9d93a3",
  ears: "small",
  earColor: "#8d8394",
  earInner: "#6d6373",
  nose: "none",
  mouthDy: 4,
  marks: (
    <g>
      <g fill="#a99fb0">
        <circle cx="40" cy="45" r="11" />
        <circle cx="60" cy="45" r="11" />
        <ellipse cx="50" cy="57" rx="16" ry="11" />
      </g>
      <path d="M29 37 C 36 30 46 32 50 36 C 54 32 64 30 71 37" fill="none" stroke="#2e2832" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx="47" cy="52" rx="1.8" ry="2.4" fill={INK} />
      <ellipse cx="53" cy="52" rx="1.8" ry="2.4" fill={INK} />
    </g>
  ),
};

export const DEER: CritterSpec = {
  fur: "#c98a52",
  light: "#f6e2c6",
  ears: "flat",
  earInner: "#f3bf9e",
  nose: "dot",
  muzzle: true,
  crown: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {["#4a3426", "#9a6a40"].map((c, i) => (
        <g key={c} stroke={c} strokeWidth={i === 0 ? 7.4 : 4}>
          <path d="M41 22 L34 4 M37 12 L27 9 M35.5 7 L41 1" />
          <path d="M59 22 L66 4 M63 12 L73 9 M64.5 7 L59 1" />
        </g>
      ))}
    </g>
  ),
  marks: (
    <g fill="#fff6ea">
      <circle cx="44" cy="24" r="1.8" />
      <circle cx="56" cy="24" r="1.8" />
      <circle cx="50" cy="21" r="1.6" />
    </g>
  ),
  belly: (
    <g fill="#fff6ea">
      <circle cx="33" cy="72" r="2.2" />
      <circle cx="37" cy="78" r="2" />
      <circle cx="67" cy="72" r="2.2" />
      <circle cx="63" cy="78" r="2" />
    </g>
  ),
};

/* ---------- 몸 모양이 다른 친구 ---------- */

/** 홍학: 한 다리로 서 있다 */
export function Flamingo({ mood, look }: ArtProps) {
  const pink = "#ff9ec4";
  const leg = "#f47aa6";
  return (
    <Svg>
      {[INK, leg].map((c, i) => (
        <g key={c} stroke={c} strokeWidth={i === 0 ? 6 : 2.8} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M56 68 L56 97" />
          <path d="M62 68 L72 80 L58 82" />
        </g>
      ))}
      <path d="M50 97 L62 97" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d="M34 58 C 34 44 50 40 66 44 C 78 46 90 44 96 40 C 94 52 86 70 60 72 C 44 73 34 68 34 58 Z" fill={pink} {...stroke} />
      <path d="M50 52 C 58 48 72 50 78 56 C 70 62 58 62 50 52 Z" fill="#ff7fb0" {...thin} />
      {[INK, pink].map((c, i) => (
        <path
          key={c}
          d="M40 56 C 28 50 26 38 34 32 C 42 26 42 18 34 16"
          fill="none"
          stroke={c}
          strokeWidth={i === 0 ? 12 : 6.4}
          strokeLinecap="round"
        />
      ))}
      <circle cx="30" cy="17" r="11" fill={pink} {...stroke} />
      <path d="M21 17 C 14 18 10 24 12 30 C 14 26 18 23 23 23 Z" fill="#fff4f8" {...thin} />
      <path d="M13.2 25 C 12 27 11.6 28.6 12 30 C 13 28.4 14.4 27.2 16 26.4 Z" fill={INK} />
      <Shine x={27} y={11} rx={2.4} ry={4} />
      <Face x={32} y={15} s={0.4} mood={mood} look={look} mouth="none" />
    </Svg>
  );
}
