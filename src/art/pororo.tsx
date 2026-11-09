import type { ComponentType } from "react";
import { PORORO_GUESTS, type PororoName } from "../lib/data";
import { critter } from "./animals";
import type { CritterSpec } from "./Critter";
import { INK, stroke } from "./palette";
import type { ArtProps } from "./types";

/*
 * 가끔 놀러 오는 뽀로로와 친구들 (놀이에서 맞혔을 때 10번에 1번쯤, 나눠 주기에서는 가끔 손님으로).
 * 캐릭터의 권리는 (주)아이코닉스 등 원작사에 있고, 수익을 내지 않는 조건으로 쓰기로 허락받았다.
 * 광고·유료 기능을 붙이게 되면 이 친구들은 빼야 한다.
 * EBS 캐릭터 소개 그림을 보고, 다른 그림과 같은 Critter 틀(큰 머리 + 작은 몸)에 각자의 특징을 얹었다.
 */

const thin = { ...stroke, strokeWidth: 2.2 };

/** 외곽선 있는 굵은 선 (고글 테·끈) */
function Band({ d, color, w }: { d: string; color: string; w: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 2.6} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
}

/** 펭귄 얼굴의 흰 부분 (뽀로로·패티) */
const PENGUIN_FACE = (
  <path d="M50 31 C 44 24 30 26 28 40 C 26 56 38 68 50 68 C 62 68 74 56 72 40 C 70 26 56 24 50 31 Z" fill="#fff" />
);

/** 몸 아래로 퍼지는 치마 (루피 원피스 · 패티 외투) */
function Skirt({ color, hem }: { color: string; hem: string }) {
  return (
    <g>
      <path d="M30 75 C 37 79 63 79 70 75 L 76 91 C 66 96.5 34 96.5 24 91 Z" fill={color} {...stroke} />
      <path d="M27.5 88.5 C 37 92.5 63 92.5 72.5 88.5" fill="none" stroke={hem} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/* ---------- 뽀로로: 파란 꼬마 펭귄, 노란 비행 모자(P 배지)에 큰 주황 고글 ---------- */

const GOGGLE = "#ff8a1c";

export const PORORO: CritterSpec = {
  fur: "#2f86e0",
  light: "#ffffff",
  ears: "none",
  nose: "beak",
  feet: "#ff9d2e",
  faceS: 0.85,
  beakDy: 5,
  cheeks: false,
  marks: PENGUIN_FACE,
  belly: <ellipse cx="50" cy="80" rx="17" ry="13" fill="#fff" />,
  front: (
    <g>
      {/* 비행 모자 */}
      <path
        d="M21 45 C 19.5 22 34 12 50 12 C 66 12 80.5 22 79 45 C 76 38.5 70.5 34.5 64 33.5 L36 33.5 C 29.5 34.5 24 38.5 21 45 Z"
        fill="#ffd21f"
        {...stroke}
      />
      <path d="M26.5 27 C 31 20.5 38 16.5 45 15.5" fill="none" stroke="#fff4b8" strokeWidth={2.6} strokeLinecap="round" />
      {/* P 배지 */}
      <circle cx="50" cy="22.5" r="6" fill="#ff7a1a" {...thin} />
      <path
        d="M48 26 L48 19.2 L51 19.2 C 54.2 19.2 54.2 23.2 51 23.2 L48 23.2"
        fill="none"
        stroke="#fff"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 고글 끈 */}
      <Band d="M29.4 44.5 L21.6 43.5" color={GOGGLE} w={2.4} />
      <Band d="M70.6 44.5 L78.4 43.5" color={GOGGLE} w={2.4} />
      {/* 큰 주황 고글: 눈이 비쳐 보인다 */}
      {[39.8, 60.2].map((x) => (
        <g key={x}>
          <circle cx={x} cy="44" r="8.3" fill="rgba(215,240,255,0.3)" stroke={INK} strokeWidth={5.6} />
          <circle cx={x} cy="44" r="8.3" fill="none" stroke={GOGGLE} strokeWidth={3} />
          <path d={`M${x - 4.8} 41.6 q 1.6 -2.8 4.8 -3.3`} fill="none" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" />
        </g>
      ))}
    </g>
  ),
};

/* ---------- 크롱: 초록 아기 공룡, 머리 위로 툭 튀어나온 눈, 커다란 입 ---------- */

const CRONG_GREEN = "#6fcc4c";

export const CRONG: CritterSpec = {
  fur: CRONG_GREEN,
  light: "#eef9cf",
  ears: "none",
  nose: "none",
  faceY: 20,
  mouthDy: 22,
  mouthScale: [1.8, 1.35],
  cheeks: false,
  crown: (
    <g fill={CRONG_GREEN} {...stroke}>
      <circle cx="38.6" cy="19" r="12.5" />
      <circle cx="61.4" cy="19" r="12.5" />
    </g>
  ),
  back: <path d="M64 74 C 80 78 90 72 98 60 C 98 76 86 92 66 90 Z" fill={CRONG_GREEN} {...stroke} />,
  marks: (
    <g>
      <circle cx="38.6" cy="20" r="8.6" fill="#fff" />
      <circle cx="61.4" cy="20" r="8.6" fill="#fff" />
      <ellipse cx="28" cy="49" rx="5" ry="3.4" fill="#ff8fab" opacity="0.55" />
      <ellipse cx="72" cy="49" rx="5" ry="3.4" fill="#ff8fab" opacity="0.55" />
      <ellipse cx="46.5" cy="41" rx="1.3" ry="1.7" fill={INK} opacity="0.6" />
      <ellipse cx="53.5" cy="41" rx="1.3" ry="1.7" fill={INK} opacity="0.6" />
    </g>
  ),
};

/* ---------- 패티: 보라 후드와 보라 외투를 입은 꼬마 펭귄 ---------- */

const PETTY_PURPLE = "#9a6ad8";

export const PETTY: CritterSpec = {
  fur: "#4b9ce6",
  light: "#ffffff",
  ears: "none",
  nose: "beak",
  feet: "#ff9d2e",
  body: PETTY_PURPLE,
  limbs: PETTY_PURPLE,
  bellyColor: "none",
  // 후드 뒤쪽 (얼굴 둘레로 보인다)
  crown: <circle cx="50" cy="43" r="32" fill={PETTY_PURPLE} {...stroke} />,
  marks: PENGUIN_FACE,
  belly: (
    <g>
      <Skirt color={PETTY_PURPLE} hem="#c7a6f2" />
      {/* 가슴의 작은 별 */}
      <path d="M41 80 l1.4 2.9 3.2.4-2.3 2.2.6 3.1-2.9-1.5-2.9 1.5.6-3.1-2.3-2.2 3.2-.4z" fill="#fff" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  ),
  front: (
    <g>
      {/* 후드 앞쪽: 머리 위를 덮는다 */}
      <path
        d="M21 50 C 18.5 25 33 14 50 14 C 67 14 81.5 25 79 50 C 75.5 37 64.5 28.5 50 28.5 C 35.5 28.5 24.5 37 21 50 Z"
        fill={PETTY_PURPLE}
        {...stroke}
      />
      <path d="M27 31 C 32 22 40 18.5 47 18" fill="none" stroke="#c7a6f2" strokeWidth={2.6} strokeLinecap="round" />
    </g>
  ),
};

/* ---------- 루피: 분홍 비버, 머리에 리본, 앞니 두 개, 세일러 원피스 ---------- */

const LOOPY_FUR = "#f6a3a0";
const LOOPY_DRESS = "#f78fbd";

export const LOOPY: CritterSpec = {
  fur: LOOPY_FUR,
  light: "#ffe3de",
  ears: "small",
  earInner: "#ff8a95",
  nose: "dot",
  noseColor: "#3d2522",
  muzzle: true,
  body: LOOPY_DRESS,
  bellyColor: "none",
  back: (
    <g transform="rotate(-28 74 86)">
      <ellipse cx="82" cy="86" rx="14" ry="8.5" fill="#c9737e" {...stroke} />
      <path d="M74 82 L90 90 M76 90 L88 81 M82 79 L82 93" stroke="#a5575f" strokeWidth={1.5} strokeLinecap="round" />
    </g>
  ),
  belly: (
    <g>
      <Skirt color={LOOPY_DRESS} hem="#fff" />
      {/* 하얀 세일러 깃과 빨간 리본 */}
      <path d="M31 70 C 38 72 45 73 50 77 C 55 73 62 72 69 70 L 66 77 C 60 77 55 79 50 83 C 45 79 40 77 34 77 Z" fill="#fff" {...thin} />
      <g fill="#ff4d6d" stroke={INK} strokeWidth={1.4} strokeLinejoin="round">
        <path d="M50 80 L44.5 77 L44.5 83 Z" />
        <path d="M50 80 L55.5 77 L55.5 83 Z" />
        <circle cx="50" cy="80" r="2" />
      </g>
    </g>
  ),
  front: (
    <g>
      {/* 앞니 */}
      <rect x="46" y="56" width="8" height="7.5" rx="1.6" fill="#fff" {...thin} />
      <path d="M50 56.5 L50 63" stroke={INK} strokeWidth={1.4} />
      {/* 머리 리본 */}
      <g transform="rotate(-24 31 21)" {...thin}>
        <path d="M31 21 C 24 13 18 19 21.5 24.5 C 24 28 28.5 24.5 31 21 Z" fill="#ff7fb0" />
        <path d="M31 21 C 38 13 44 19 40.5 24.5 C 38 28 33.5 24.5 31 21 Z" fill="#ff7fb0" />
        <circle cx="31" cy="21.3" r="3" fill="#ff9cc4" />
      </g>
    </g>
  ),
};

/* ---------- 에디: 노란 여우, 아주 큰 귀, 청 멜빵바지 ---------- */

const EDDY_FUR = "#ffc61f";

export const EDDY: CritterSpec = {
  fur: EDDY_FUR,
  light: "#fffaf0",
  ears: "none",
  nose: "dot",
  noseColor: "#2e211b",
  body: "#3b7fd6",
  bellyColor: "none",
  crown: (
    <g>
      {[false, true].map((flip) => (
        <g key={String(flip)} transform={flip ? "translate(100 0) scale(-1 1)" : undefined}>
          <path d="M30 31 L13 -5 C 28 -1 41 8 47 20 Z" fill={EDDY_FUR} {...stroke} />
          <path d="M30.5 24 L20 2.5 C 29.5 5.5 37 11 41.5 19 Z" fill="#fff7e6" />
        </g>
      ))}
    </g>
  ),
  marks: <path d="M24 46 C 34 46 44 50 50 60 C 56 50 66 46 76 46 C 76 62 64 72 50 72 C 36 72 24 62 24 46 Z" fill="#fffaf0" />,
  belly: (
    <g>
      {/* 멜빵바지 가슴판과 단추 */}
      <rect x="39.5" y="70" width="21" height="15" rx="3.5" fill="#5b98e8" {...thin} />
      <circle cx="43" cy="73.5" r="1.8" fill="#ffd84d" stroke={INK} strokeWidth={1.1} />
      <circle cx="57" cy="73.5" r="1.8" fill="#ffd84d" stroke={INK} strokeWidth={1.1} />
      <path d="M45 80 L55 80" stroke="#2f69b8" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  ),
};

/* ---------- 포비: 커다란 흰 북극곰, 파란 소매 티셔츠에 발바닥 무늬 ---------- */

const POBY_BLUE = "#4ba3ea";

export const POBY: CritterSpec = {
  fur: "#fbfcff",
  light: "#ffffff",
  ears: "round",
  earInner: "#e1e8f3",
  nose: "none",
  mouthDy: 3,
  body: "#ffffff",
  limbs: POBY_BLUE,
  feet: "#fbfcff",
  bellyColor: "none",
  belly: (
    <g fill={POBY_BLUE}>
      <ellipse cx="50" cy="84" rx="5" ry="4" />
      <circle cx="44.6" cy="78.6" r="2" />
      <circle cx="50" cy="76.8" r="2" />
      <circle cx="55.4" cy="78.6" r="2" />
    </g>
  ),
  marks: <ellipse cx="50" cy="55" rx="12.5" ry="9" fill="#ffffff" stroke="#e6ecf5" strokeWidth={1.5} />,
  front: (
    <g>
      <ellipse cx="50" cy="51.5" rx="6.2" ry="4.6" fill="#231815" />
      <ellipse cx="48" cy="50" rx="2" ry="1.1" fill="#fff" opacity="0.7" />
    </g>
  ),
};

/* ---------- 해리: 분홍 꼬마 벌새, 깃털 머리, 보라 나비넥타이 ---------- */

const HARRY_PINK = "#ee4d96";

export const HARRY: CritterSpec = {
  fur: HARRY_PINK,
  light: "#ffe0ee",
  ears: "none",
  nose: "beak",
  feet: "#ffa62b",
  back: (
    <g fill="#d6367f" {...stroke}>
      <g className="flap" style={{ transformOrigin: "100% 70%" }}>
        <path d="M31 77 C 17 74 6 62 8 52 C 18 53 29 62 33 72 Z" />
      </g>
      <g className="flap-r" style={{ transformOrigin: "0% 70%" }}>
        <path d="M69 77 C 83 74 94 62 92 52 C 82 53 71 62 67 72 Z" />
      </g>
    </g>
  ),
  crown: (
    <g fill={HARRY_PINK} {...stroke}>
      <path d="M46 19 C 41 7 33 4 29 6 C 35 8.5 39 13 41 21 Z" />
      <path d="M49 18 C 47 5 53 -2 60 -1 C 55 3 53.5 10 55 18 Z" />
    </g>
  ),
  marks: (
    <g fill="#fff">
      <circle cx="38.6" cy="43.5" r="7.6" />
      <circle cx="61.4" cy="43.5" r="7.6" />
    </g>
  ),
  belly: (
    <g fill="#8b55dd" stroke={INK} strokeWidth={1.6} strokeLinejoin="round">
      <path d="M50 76 L40.5 71 L40.5 81 Z" />
      <path d="M50 76 L59.5 71 L59.5 81 Z" />
      <circle cx="50" cy="76" r="2.8" />
    </g>
  ),
};

interface PororoArt {
  C: ComponentType<ArtProps>;
  /** 크기 배율 (포비는 크고, 해리는 작다) */
  size?: number;
  /** 날아서 온다 (해리) */
  fly?: boolean;
}

/** 이름 → 그림. 이름·먹이는 lib/data.ts 의 PORORO_GUESTS 한곳에만 적는다 */
export const PORORO_ART: Record<PororoName, PororoArt> = {
  뽀로로: { C: critter(PORORO) },
  크롱: { C: critter(CRONG), size: 0.9 },
  패티: { C: critter(PETTY) },
  루피: { C: critter(LOOPY) },
  에디: { C: critter(EDDY) },
  포비: { C: critter(POBY), size: 1.2 },
  해리: { C: critter(HARRY), size: 0.8, fly: true },
};

export interface PororoFriend extends PororoArt {
  name: PororoName;
}

export const PORORO_FRIENDS: PororoFriend[] = PORORO_GUESTS.map(({ name }) => ({ name, ...PORORO_ART[name] }));
