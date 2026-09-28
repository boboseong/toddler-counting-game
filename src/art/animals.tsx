import { Critter, Whiskers, type CritterSpec } from "./Critter";
import { INK, stroke } from "./palette";
import type { ArtProps } from "./types";

/* 먹이 주기 동물 12종 + 스티커 친구 몇몇. 모두 Critter 틀을 쓴다 */

const PINK_NOSE = "#ff8fa3";

export const RABBIT: CritterSpec = {
  fur: "#f7f1ea",
  light: "#ffffff",
  ears: "long",
  nose: "tri",
  noseColor: PINK_NOSE,
  muzzle: true,
};

export const MONKEY: CritterSpec = {
  fur: "#a86b3c",
  light: "#f5d3a8",
  ears: "round",
  earColor: "#f5d3a8",
  earInner: "#e8b98a",
  nose: "dot",
  marks: (
    <g fill="#f5d3a8">
      <circle cx="40" cy="43" r="11" />
      <circle cx="60" cy="43" r="11" />
      <ellipse cx="50" cy="55" rx="17" ry="12" />
    </g>
  ),
};

export const DOG: CritterSpec = {
  fur: "#eab676",
  light: "#fff3df",
  ears: "floppy",
  earColor: "#9c6536",
  nose: "dot",
  muzzle: true,
  marks: <ellipse cx="62" cy="40" rx="9" ry="8" fill="#d9964f" opacity="0.8" />,
};

export const PANDA: CritterSpec = {
  fur: "#ffffff",
  light: "#ffffff",
  ears: "round",
  earColor: "#2f2a2a",
  earInner: "#4b4444",
  limbs: "#2f2a2a",
  nose: "dot",
  muzzle: false,
  marks: (
    <g>
      <ellipse cx="38" cy="45" rx="8" ry="10" fill="#2f2a2a" transform="rotate(25 38 45)" />
      <ellipse cx="62" cy="45" rx="8" ry="10" fill="#2f2a2a" transform="rotate(-25 62 45)" />
      <circle cx="38.6" cy="44" r="5.6" fill="#fff" />
      <circle cx="61.4" cy="44" r="5.6" fill="#fff" />
    </g>
  ),
};

export const CAT: CritterSpec = {
  fur: "#f8a94e",
  light: "#fff1dc",
  ears: "pointy",
  nose: "tri",
  noseColor: PINK_NOSE,
  muzzle: true,
  marks: (
    <g stroke="#d97d25" strokeWidth={3} strokeLinecap="round">
      <path d="M50 17 L50 25" />
      <path d="M42 18 L44 25" />
      <path d="M58 18 L56 25" />
    </g>
  ),
  front: <Whiskers />,
};

export const ELEPHANT: CritterSpec = {
  fur: "#a9bdd3",
  light: "#d6e2ee",
  ears: "side",
  earInner: "#f3b8c4",
  nose: "trunk",
};

export const BEAR: CritterSpec = {
  fur: "#b27a47",
  light: "#ecc795",
  ears: "round",
  earInner: "#ecc795",
  nose: "dot",
  muzzle: true,
};

export const SQUIRREL: CritterSpec = {
  fur: "#d0823f",
  light: "#fbe4c4",
  ears: "tiny",
  earInner: "#f5c28e",
  nose: "dot",
  muzzle: true,
  back: (
    <path
      d="M66 88 C 92 88 98 62 88 46 C 80 34 64 40 70 52 C 74 60 84 58 82 68 C 80 76 70 78 64 80 Z"
      fill="#c0712f"
      {...stroke}
    />
  ),
};

export const CHICKEN: CritterSpec = {
  fur: "#fffaf0",
  light: "#ffffff",
  ears: "none",
  nose: "beak",
  limbs: "#ffb13b",
  marks: (
    <g fill="#f0473c" {...stroke}>
      <path d="M40 20 C 38 10 46 8 47 16 C 48 6 56 6 55 16 C 58 8 66 12 61 21 Z" />
      <path d="M47 63 C 47 70 53 70 53 63 Z" />
    </g>
  ),
};

export const MOUSE: CritterSpec = {
  fur: "#cfc9d6",
  light: "#f2eef5",
  ears: "bigRound",
  nose: "dot",
  noseColor: PINK_NOSE,
  muzzle: true,
  front: <Whiskers />,
};

export const KOALA: CritterSpec = {
  fur: "#a3a8ae",
  light: "#e9ebee",
  ears: "fluffy",
  earInner: "#f4f5f6",
  nose: "big",
  noseColor: "#3d3838",
};

export const PIG: CritterSpec = {
  fur: "#ffc2cd",
  light: "#ffe3e8",
  ears: "tiny",
  earInner: "#ff9fb1",
  nose: "snout",
  noseColor: "#ff9fb1",
};

/* ---------- 스티커 친구 ---------- */

export const LION: CritterSpec = {
  fur: "#f7c35f",
  light: "#fff0c9",
  ears: "round",
  earInner: "#f0a94b",
  nose: "tri",
  noseColor: "#8a4b2a",
  muzzle: true,
  back: (
    <g fill="#d9822b" {...stroke}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={50 + Math.cos(a) * 30} cy={44 + Math.sin(a) * 30} r="11" />;
      })}
    </g>
  ),
};

export const TIGER: CritterSpec = {
  fur: "#f9a13b",
  light: "#fff6e6",
  ears: "round",
  earInner: "#fff6e6",
  nose: "tri",
  noseColor: PINK_NOSE,
  muzzle: true,
  marks: (
    <g stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" opacity="0.85">
      <path d="M50 17 L50 24" />
      <path d="M43 18 L45 24" />
      <path d="M57 18 L55 24" />
      <path d="M23 40 L31 42" />
      <path d="M24 48 L31 48" />
      <path d="M77 40 L69 42" />
      <path d="M76 48 L69 48" />
    </g>
  ),
  front: <Whiskers />,
};

export const FOX: CritterSpec = {
  fur: "#f07a2e",
  light: "#fff6ec",
  ears: "pointy",
  earInner: "#3d2a22",
  nose: "dot",
  marks: <path d="M24 46 C 34 46 44 50 50 60 C 56 50 66 46 76 46 C 76 62 64 72 50 72 C 36 72 24 62 24 46 Z" fill="#fff6ec" />,
};

export const COW: CritterSpec = {
  fur: "#ffffff",
  light: "#ffc9cf",
  ears: "floppy",
  earColor: "#ffffff",
  nose: "snout",
  noseColor: "#ffb3bc",
  marks: (
    <g fill="#3d3535">
      <ellipse cx="36" cy="30" rx="9" ry="7" />
      <ellipse cx="66" cy="44" rx="6" ry="8" />
      <path d="M36 16 C 32 8 30 8 28 10 C 30 14 32 17 36 20 Z" stroke={INK} strokeWidth={2} fill="#f5e6c8" />
      <path d="M64 16 C 68 8 70 8 72 10 C 70 14 68 17 64 20 Z" stroke={INK} strokeWidth={2} fill="#f5e6c8" />
    </g>
  ),
};

export const HAMSTER: CritterSpec = {
  fur: "#f3bd7a",
  light: "#fff5e6",
  ears: "round",
  earInner: "#ffb3c1",
  nose: "dot",
  noseColor: PINK_NOSE,
  marks: <ellipse cx="50" cy="56" rx="22" ry="14" fill="#fff5e6" />,
  front: <Whiskers />,
};

/** spec → 그림 컴포넌트 */
export function critter(spec: CritterSpec) {
  return function CritterArt(p: ArtProps) {
    return <Critter spec={spec} {...p} />;
  };
}
