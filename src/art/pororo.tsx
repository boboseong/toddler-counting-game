import type { ComponentType, ReactNode } from "react";
import { PORORO_GUESTS, type PororoName } from "../lib/data";
import { critter } from "./animals";
import type { CritterSpec } from "./Critter";
import { INK, stroke } from "./palette";
import type { ArtProps, Mood } from "./types";

/*
 * 가끔 놀러 오는 뽀로로와 친구들 (놀이에서 맞혔을 때 10번에 1번쯤, 나눠 주기에서는 가끔 손님으로).
 * 캐릭터의 권리는 (주)아이코닉스 등 원작사에 있고, 수익을 내지 않는 조건으로 쓰기로 허락받았다.
 * 광고·유료 기능을 붙이게 되면 이 친구들은 빼야 한다.
 * EBS 캐릭터 소개 그림을 한 명씩 보고, 다른 그림과 같은 Critter 틀(큰 머리 + 작은 몸)에
 * 각자의 옷·머리 모양·얼굴 생김새를 얹었다.
 */

const thin = { ...stroke, strokeWidth: 2.2 };

/** 외곽선 있는 굵은 선 (고글 끈·머리털) */
function Band({ d, color, w }: { d: string; color: string; w: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + 2.6} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
}

/** 몸 아래로 퍼지는 치마 (루피 원피스 · 패티 외투) */
function Skirt({ color, hem, dashed }: { color: string; hem: string; dashed?: boolean }) {
  return (
    <g>
      <path d="M30 75 C 37 79 63 79 70 75 L 76 91 C 66 96.5 34 96.5 24 91 Z" fill={color} {...stroke} />
      <path
        d="M27.5 88.5 C 37 92.5 63 92.5 72.5 88.5"
        fill="none"
        stroke={hem}
        strokeWidth={dashed ? 1.6 : 2.4}
        strokeLinecap="round"
        strokeDasharray={dashed ? "2.4 2.6" : undefined}
      />
    </g>
  );
}

/** 몸 앞으로 나온 발 (발가락·발바닥이 보이는 친구). toes 는 발 가운데 x 를 받아 무늬를 그린다 */
function Feet({ color, toes }: { color: string; toes?: (x: number) => ReactNode }) {
  return (
    <g>
      {[39.5, 60.5].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="94.4" rx="8" ry="4.6" fill={color} {...stroke} />
          {toes?.(x)}
        </g>
      ))}
    </g>
  );
}

/** 몸의 아래쪽만 덮는 바지 (y 부터 아래). 몸통 타원(가운데 50,79 · 반지름 23×16)을 그대로 따라간다 */
function Pants({ y, color, bib }: { y: number; color: string; bib?: boolean }) {
  const dx = 23 * Math.sqrt(1 - ((y - 79) / 16) ** 2);
  const l = (50 - dx).toFixed(2);
  const r = (50 + dx).toFixed(2);
  // 멜빵바지는 가슴판까지 한 덩어리로
  const top = bib ? `L39.5 ${y} L39.5 71 Q 39.5 68 42.5 68 L57.5 68 Q 60.5 68 60.5 71 L60.5 ${y} ` : "";
  return <path d={`M${l} ${y} ${top}L${r} ${y} A 23 16 0 0 1 ${l} ${y} Z`} fill={color} {...stroke} />;
}

/** 목 아래로 살짝 보이는 깃 (머리에 가려 아래쪽 초승달만 보인다) */
function Collar({ color, rx = 15, ry = 6.8 }: { color: string; rx?: number; ry?: number }) {
  return <ellipse cx="50" cy="70.5" rx={rx} ry={ry} fill={color} {...thin} />;
}

/** 꽃잎 다섯 장짜리 작은 꽃 */
function Flower({ x, y, r = 2.3, petal = 1.55, center }: { x: number; y: number; r?: number; petal?: number; center: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => {
        const t = (a * Math.PI) / 180;
        return <circle key={a} cx={(x + r * Math.sin(t)).toFixed(2)} cy={(y - r * Math.cos(t)).toFixed(2)} r={petal} fill="#fff" />;
      })}
      <circle cx={x} cy={y} r={petal * 0.75} fill={center} />
    </g>
  );
}

/* ---------- 뽀로로: 노란 비행 모자(파란 P 배지)에 큰 주황 고글, 파란 옷에 주황 장갑 ---------- */

const PORORO_BLUE = "#1f72d6";
const HELMET = "#ffd21f";
const GOGGLE = "#ff8a1c";

export const PORORO: CritterSpec = {
  // 모자 밖으로 보이는 얼굴은 온통 하얗다
  fur: "#ffffff",
  light: "#ffffff",
  ears: "none",
  nose: "beak",
  body: PORORO_BLUE,
  limbs: PORORO_BLUE,
  hands: "#ff9d2e",
  feet: "#ffb01f",
  bellyColor: "none",
  faceY: 45,
  faceS: 0.92,
  eyeScale: 0.8,
  beakDy: 5,
  beakScale: 1.4,
  cheeks: false,
  marks: (
    <g>
      {/* 모자 아래로 내려온 파란 이마 (고글 사이로 뾰족하게 보인다) */}
      <path d="M33 36 C 39 31.5 45 33.5 50 40.5 C 55 33.5 61 31.5 67 36 L 67 28 L 33 28 Z" fill={PORORO_BLUE} />
      {/* 비행 모자: 머리 위와 양옆 볼까지 감싼다 */}
      <path
        d="M22.6 59 C 16 40 26 13.5 50 13.5 C 74 13.5 84 40 77.4 59 L 71.6 57.5 C 73.6 47 71.5 38.5 66 34.5 C 60 31.4 40 31.4 34 34.5 C 28.5 38.5 26.4 47 28.4 57.5 Z"
        fill={HELMET}
        {...stroke}
      />
      <path d="M26.5 29 C 29.5 22.5 34.5 18.6 39 17.4" fill="none" stroke="#fff4b0" strokeWidth={2.4} strokeLinecap="round" />
      {/* 파란 네모 배지에 주황 P */}
      <rect x="41.5" y="16.6" width="17" height="12.6" rx="2.4" fill={PORORO_BLUE} stroke={INK} strokeWidth={1.6} />
      <path
        d="M46.7 26.3 L46.7 19.6 L50.4 19.6 C 54.2 19.6 54.2 24 50.4 24 L46.7 24"
        fill="none"
        stroke={GOGGLE}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ),
  belly: (
    <g>
      {/* 주황 목깃과 옷 가운데 지퍼 */}
      <Collar color="#ff9d2e" />
      <path d="M50 79.5 L50 93" stroke="#1558ae" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  ),
  front: (
    <g>
      {/* 고글 끈과 콧등 */}
      <Band d="M29 44.8 L21.6 43.2" color={GOGGLE} w={2.6} />
      <Band d="M71 44.8 L78.4 43.2" color={GOGGLE} w={2.6} />
      {/* 큰 주황 고글: 알이 맑아서 눈이 보인다 */}
      {[39, 61].map((x) => (
        <g key={x}>
          <circle cx={x} cy="45" r="8.4" fill="none" stroke={INK} strokeWidth={5.6} />
          <circle cx={x} cy="45" r="8.4" fill="none" stroke={GOGGLE} strokeWidth={3} />
          <path d={`M${x - 4.4} 42.4 q 1.4 -2.4 4 -3`} fill="none" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" />
        </g>
      ))}
    </g>
  ),
};

/* ---------- 크롱: 연두 아기 공룡, 머리 위에 얹힌 큰 눈, 주황빛 큰 입, 파란 옷에 빨간 장갑 ---------- */

const CRONG_GREEN = "#84cc2e";
const CRONG_SUIT = "#2a7de1";
const CRONG_RED = "#dc3b2a";

/** 얼굴 너비만 한 입. 평소에도 벌리고 웃는다 */
function crongMouth(mood: Mood) {
  const line = { stroke: INK, strokeWidth: 2.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  if (mood === "hmm") return <path d="M29 60 Q 50 62.5 71 58" fill="none" {...line} />;
  if (mood === "sleepy" || mood === "full") return <path d="M27 57.5 Q 50 65 73 57.5" fill="none" {...line} />;
  const big = mood === "happy" || mood === "cheer" || mood === "hungry" || mood === "surprised";
  const open = (
    <g>
      <path
        d={
          big
            ? "M24.5 54 Q 50 60 75.5 54 Q 72 70.5 50 70.5 Q 28 70.5 24.5 54 Z"
            : "M26.5 55 Q 50 60.5 73.5 55 Q 70.5 67.5 50 67.5 Q 29.5 67.5 26.5 55 Z"
        }
        fill="#ff8a1c"
        {...line}
      />
      <ellipse cx="50" cy={big ? 65.8 : 63.8} rx={big ? 11 : 9.5} ry={big ? 2.8 : 2.2} fill="#ffb054" />
    </g>
  );
  return mood === "talk" ? <g className="talk">{open}</g> : mood === "eating" ? <g className="chew">{open}</g> : open;
}

export const CRONG: CritterSpec = {
  fur: CRONG_GREEN,
  light: "#fff3c4",
  ears: "none",
  nose: "none",
  body: CRONG_SUIT,
  limbs: CRONG_SUIT,
  hands: CRONG_RED,
  feet: CRONG_GREEN,
  bellyColor: "none",
  faceY: 22.6,
  eyeGap: 13.3,
  eyeScale: 0.72,
  cheeks: false,
  // 위는 좁고 아래(입 쪽)는 넓적한 머리
  head: (
    <path
      d="M50 20 C 65 20 77.5 27 81.5 43 C 85 60 74 74 50 74 C 26 74 15 60 18.5 43 C 22.5 27 35 20 50 20 Z"
      fill={CRONG_GREEN}
      {...stroke}
    />
  ),
  back: <path d="M64 74 C 80 78 90 72 98 60 C 98 76 86 92 66 90 Z" fill={CRONG_GREEN} {...stroke} />,
  marks: (
    <g>
      {/* 머리 위에 반쯤 걸친 큰 눈알: 얇은 연두 눈꺼풀에 흰자, 두 눈이 맞닿는다 */}
      {[37.4, 62.6].map((x) => (
        <g key={x}>
          <circle cx={x} cy="22" r="12.5" fill={CRONG_GREEN} {...stroke} />
          <circle cx={x} cy="22.3" r="10.1" fill="#fff" />
        </g>
      ))}
      <ellipse cx="45.6" cy="43.5" rx="1.3" ry="1.7" fill={INK} opacity="0.65" />
      <ellipse cx="54.4" cy="43.5" rx="1.3" ry="1.7" fill={INK} opacity="0.65" />
    </g>
  ),
  mouth: crongMouth,
  belly: (
    <g>
      {/* 목의 빨간 깃 */}
      <path d="M40.5 72 L59.5 72 L50 82 Z" fill={CRONG_RED} {...thin} />
      {/* 연두 발에 크림색 발가락 */}
      <Feet
        color={CRONG_GREEN}
        toes={(x) => [-4.3, 0, 4.3].map((dx) => <circle key={dx} cx={x + dx} cy={dx ? 95.2 : 95.8} r="1.7" fill="#fff3c4" />)}
      />
    </g>
  ),
};

/* ---------- 패티: 얼굴을 빙 두른 보라 후드(방울 하나), 파란 앞머리, 보라 외투와 장갑 ---------- */

const PETTY_PURPLE = "#ab62c2";
const PETTY_LILAC = "#dcbdf0";

export const PETTY: CritterSpec = {
  // 후드 안으로 보이는 얼굴은 하얗다
  fur: "#ffffff",
  light: "#ffffff",
  ears: "none",
  nose: "beak",
  feet: "#ffb01f",
  body: PETTY_PURPLE,
  limbs: PETTY_LILAC,
  hands: PETTY_PURPLE,
  bellyColor: "none",
  faceY: 46.5,
  beakDy: 1,
  cheeks: false,
  // 후드 꼭대기의 연보라 방울
  crown: <circle cx="72" cy="18" r="6.2" fill={PETTY_LILAC} {...stroke} />,
  marks: (
    <g>
      {/* 파란 앞머리: 아래가 삐죽삐죽 갈라진다 */}
      <path
        d="M27 38 C 27 29 36 22.5 50 22.5 C 64 22.5 73 29 73 38 C 70 35.5 66 34.5 62 36 L 59.5 30.5 C 57.5 34.5 53 37 47.5 37.5 L 45.5 32 C 42.5 35.5 35 38 27 38 Z"
        fill={PORORO_BLUE}
      />
      {/* 후드: 얼굴 둘레를 턱 밑까지 감싼다 */}
      <path
        fillRule="evenodd"
        d="M50 13.5 C 66.85 13.5 80.5 27.15 80.5 44 C 80.5 60.85 66.85 74.5 50 74.5 C 33.15 74.5 19.5 60.85 19.5 44 C 19.5 27.15 33.15 13.5 50 13.5 Z M50 25.5 C 62.4 25.5 72.5 35.1 72.5 47 C 72.5 58.9 62.4 68.5 50 68.5 C 37.6 68.5 27.5 58.9 27.5 47 C 27.5 35.1 37.6 25.5 50 25.5 Z"
        fill={PETTY_PURPLE}
        {...stroke}
      />
      <path d="M25.5 33 C 28.5 25.5 34.5 20.5 41 18.6" fill="none" stroke="#c897e3" strokeWidth={2.4} strokeLinecap="round" />
    </g>
  ),
  belly: (
    <g>
      <Skirt color={PETTY_PURPLE} hem="#d9b3ee" dashed />
      {/* 가슴의 흰 꽃 */}
      <Flower x={58.5} y={81.5} center={PETTY_LILAC} />
    </g>
  ),
};

/* ---------- 루피: 분홍 비버, 커다란 자줏빛 코와 앞니 두 개, 꽃 리본, 세일러 원피스 ---------- */

const LOOPY_FUR = "#f5a09f";
const LOOPY_DRESS = "#f9a9d1";
const LOOPY_HOT = "#ee4f99";
const LOOPY_DARK = "#6b2a3c";

export const LOOPY: CritterSpec = {
  fur: LOOPY_FUR,
  light: "#ffd9d4",
  ears: "small",
  earInner: "#ffd3cf",
  nose: "none",
  faceY: 42.5,
  mouthDy: 8.5,
  body: LOOPY_DRESS,
  bellyColor: "none",
  feet: LOOPY_DARK,
  back: (
    <g transform="rotate(-25 72 88)">
      <ellipse cx="79" cy="88" rx="10.5" ry="6.5" fill="#8a3b4f" {...stroke} />
      <path d="M73 85 L85 91 M74.5 91.5 L84 84.5" stroke={LOOPY_DARK} strokeWidth={1.4} strokeLinecap="round" />
    </g>
  ),
  // 정수리의 갈색 머리털 두 가닥
  crown: (
    <g>
      <Band d="M49.5 18 C 48.5 11 49.5 5.5 52.5 1.5" color="#c8813f" w={1.7} />
      <Band d="M51.5 18 C 52.5 12.5 55.5 9.5 59.5 8.5" color="#c8813f" w={1.7} />
    </g>
  ),
  marks: (
    <g>
      {/* 윤이 나는 커다란 자줏빛 코 */}
      <ellipse cx="50" cy="53" rx="7.4" ry="5.6" fill="#6a1740" />
      <ellipse cx="47.2" cy="50.8" rx="2.3" ry="1.2" fill="#fff" opacity="0.75" transform="rotate(-15 47.2 50.8)" />
    </g>
  ),
  belly: (
    <g>
      <Skirt color={LOOPY_DRESS} hem="#fff" />
      {/* 하얀 세일러 깃과 진분홍 스카프 */}
      <path d="M30 70 C 38 72.5 45 74.5 50 79 C 55 74.5 62 72.5 70 70 L 67.5 79 C 61 79 55 81.5 50 86 C 45 81.5 39 79 32.5 79 Z" fill="#fff" {...thin} />
      <g fill={LOOPY_HOT} stroke={INK} strokeWidth={1.4} strokeLinejoin="round">
        <path d="M50 85.5 L44.4 92.4 L49.6 90.6 Z" />
        <path d="M50 85.5 L55.6 92.4 L50.4 90.6 Z" />
        <circle cx="50" cy="85.5" r="2.4" />
      </g>
    </g>
  ),
  front: (
    <g>
      {/* 앞니 */}
      <rect x="46.4" y="60.3" width="7.2" height="5.6" rx="1.5" fill="#fff" {...thin} />
      <path d="M50 60.8 L50 65.4" stroke={INK} strokeWidth={1.3} />
      {/* 머리의 분홍 리본, 가운데에 흰 꽃 */}
      <g transform="rotate(-22 35.5 21.5)">
        <g fill={LOOPY_HOT} {...thin}>
          <path d="M35.5 21.5 C 28 13 21.5 19 25.5 25 C 28.5 28.8 33 25 35.5 21.5 Z" />
          <path d="M35.5 21.5 C 43 13 49.5 19 45.5 25 C 42.5 28.8 38 25 35.5 21.5 Z" />
        </g>
        <circle cx="35.5" cy="21.7" r="3.7" fill="#fff" {...thin} />
        <circle cx="35.5" cy="21.7" r="1.3" fill="#ffc94d" />
      </g>
    </g>
  ),
};

/* ---------- 에디: 노란 여우, 끝이 둥근 아주 큰 귀, 흰 주둥이에 까만 코, 흰 셔츠와 청 멜빵바지 ---------- */

const EDDY_FUR = "#ffc41c";
const DENIM = "#3f82d8";

export const EDDY: CritterSpec = {
  fur: EDDY_FUR,
  light: "#ffffff",
  ears: "none",
  nose: "none",
  body: "#ffffff",
  limbs: "#ffffff",
  hands: EDDY_FUR,
  feet: EDDY_FUR,
  bellyColor: "none",
  faceY: 43,
  eyeGap: 13.5,
  mouthDy: 7,
  cheeks: false,
  // 옆으로 넓적한 머리
  head: <ellipse cx="50" cy="46" rx="31" ry="25.5" fill={EDDY_FUR} {...stroke} />,
  crown: (
    <g>
      {[false, true].map((flip) => (
        <g key={String(flip)} transform={flip ? "translate(100 0) scale(-1 1)" : undefined}>
          <path d="M23 40 C 15 22 12 4 18.5 -5 C 22 -9.5 27.5 -8 31.5 -2.5 C 39 8 45 18 48 27 Z" fill={EDDY_FUR} {...stroke} />
          <path d="M25.6 31 C 20 19 18.6 6.5 21.6 0.6 C 23.8 -2.6 27 -1.6 29.6 2.2 C 34.5 9.5 39 17 41.5 24 Z" fill="#fff9ec" />
        </g>
      ))}
    </g>
  ),
  // 끝이 하얀 복슬 꼬리
  back: (
    <g>
      <path d="M66 85 C 76 87 85 80 91 64 C 104 78 94 99 68 95 Z" fill={EDDY_FUR} {...stroke} />
      <path d="M86.9 77 Q 89.4 72.5 91.3 67.4 Q 94.6 71.5 95 77.4 Q 91 80.5 86.9 77 Z" fill="#fff" />
    </g>
  ),
  marks: (
    <g>
      <ellipse cx="33" cy="30" rx="5" ry="7.5" fill="rgba(255,255,255,0.45)" transform="rotate(-32 33 30)" />
      {/* 작고 흰 주둥이에 넓적한 까만 코 */}
      <ellipse cx="50" cy="57.5" rx="11" ry="8.6" fill="#fff" />
      <ellipse cx="50" cy="52.3" rx="5.6" ry="3.9" fill="#231a16" />
      <ellipse cx="48.2" cy="51" rx="1.9" ry="1" fill="#fff" opacity="0.7" />
    </g>
  ),
  belly: (
    <g>
      {/* 청 멜빵바지: 가슴판·단추·주머니 */}
      <Pants y={82} color={DENIM} bib />
      <rect x="44.6" y="75.6" width="10.8" height="6.4" rx="1.8" fill="none" stroke="#2c62ad" strokeWidth={1.4} />
      <circle cx="42.6" cy="72.6" r="1.5" fill="#ffe27a" stroke={INK} strokeWidth={1} />
      <circle cx="57.4" cy="72.6" r="1.5" fill="#ffe27a" stroke={INK} strokeWidth={1} />
      {/* 노란 발에 흰 발끝 */}
      <Feet
        color={EDDY_FUR}
        toes={(x) => <path d={`M${x - 5.8} 95.4 Q ${x} 92.6 ${x + 5.8} 95.4 Q ${x} 98.2 ${x - 5.8} 95.4 Z`} fill="#fff" />}
      />
    </g>
  ),
};

/* ---------- 포비: 커다란 흰 북극곰, 콩알 눈에 아주 큰 밤색 코, 파란 소매 티셔츠와 남색 바지 ---------- */

const POBY_BLUE = "#3aa6ee";
const POBY_FUR = "#fbfcff";
const POBY_BROWN = "#3b2219";

export const POBY: CritterSpec = {
  fur: POBY_FUR,
  light: "#ffffff",
  ears: "none",
  nose: "none",
  body: "#ffffff",
  limbs: POBY_BLUE,
  hands: POBY_FUR,
  feet: POBY_FUR,
  bellyColor: "none",
  faceY: 27,
  eyeGap: 9.5,
  eyeScale: 0.55,
  mouthDy: 24,
  mouthScale: [2.1, 1.1],
  cheeks: false,
  // 위아래로 길쭉한 달걀 머리
  head: (
    <path
      d="M50 13 C 65 13 76.5 26 76.5 45 C 76.5 62 66 72 50 72 C 34 72 23.5 62 23.5 45 C 23.5 26 35 13 50 13 Z"
      fill={POBY_FUR}
      {...stroke}
    />
  ),
  // 머리 옆에 붙은 작은 귀
  crown: (
    <g>
      {[26, 74].map((x) => (
        <g key={x}>
          <circle cx={x} cy="25" r="6.6" fill={POBY_FUR} {...stroke} />
          <circle cx={x} cy="25.4" r="3" fill="#dfe6f2" />
        </g>
      ))}
    </g>
  ),
  marks: (
    <g>
      {/* 얼굴 한가운데의 아주 큰 코 */}
      <ellipse cx="50" cy="43.5" rx="11.5" ry="10.5" fill={POBY_BROWN} />
      <ellipse cx="46" cy="39.4" rx="4" ry="2.4" fill="#7a5646" opacity="0.85" transform="rotate(-20 46 39.4)" />
    </g>
  ),
  belly: (
    <g>
      {/* 파란 목둘레, 남색 바지, 가슴의 작은 발바닥 무늬 */}
      <Collar color={POBY_BLUE} rx={14.5} ry={6.6} />
      <Pants y={86} color="#27458f" />
      <g fill={POBY_BLUE}>
        <ellipse cx="59.6" cy="80.4" rx="2.6" ry="2.1" />
        <circle cx="56.7" cy="77.7" r="1.05" />
        <circle cx="59.6" cy="76.7" r="1.05" />
        <circle cx="62.5" cy="77.7" r="1.05" />
      </g>
      {/* 흰 발에 밤색 발바닥 */}
      <Feet
        color={POBY_FUR}
        toes={(x) => (
          <g fill={POBY_BROWN}>
            <ellipse cx={x} cy="95.7" rx="3.3" ry="1.5" />
            <circle cx={x - 3} cy="93.2" r="0.85" />
            <circle cx={x} cy="92.6" r="0.85" />
            <circle cx={x + 3} cy="93.2" r="0.85" />
          </g>
        )}
      />
    </g>
  ),
};

/* ---------- 해리: 진분홍 꼬마 벌새, 크림색 볼, 깃털 머리, 파란 옷에 보라 나비넥타이 ---------- */

const HARRY_PINK = "#e62a8a";

export const HARRY: CritterSpec = {
  fur: HARRY_PINK,
  light: "#fff1b8",
  ears: "none",
  nose: "beak",
  arms: false,
  body: "#3f80d6",
  bellyColor: "none",
  feet: "#ffa62b",
  faceY: 42,
  faceS: 0.9,
  beakDy: 1.5,
  beakScale: 1.25,
  cheeks: false,
  // 활짝 편 날개: 깃 끝이 세 갈래
  back: (
    <g fill="#d41f7c" {...stroke}>
      <g className="flap" style={{ transformOrigin: "100% 80%" }}>
        <path d="M34 80 C 26 82 14 79 6.5 70.5 C 9 70.5 11 69.5 12.5 68 C 8 65.5 4.5 61 3 55.5 C 6 57 9 57.5 11.5 56.5 C 9.5 53 9 49 10 45 C 16 50 27 60 35 72 Z" />
      </g>
      <g className="flap-r" style={{ transformOrigin: "0% 80%" }}>
        <path d="M66 80 C 74 82 86 79 93.5 70.5 C 91 70.5 89 69.5 87.5 68 C 92 65.5 95.5 61 97 55.5 C 94 57 91 57.5 88.5 56.5 C 90.5 53 91 49 90 45 C 84 50 73 60 65 72 Z" />
      </g>
    </g>
  ),
  crown: (
    <g fill={HARRY_PINK} {...stroke}>
      <path d="M46.5 20 C 44 9 46 -1 52.5 -6 C 52 1 51.5 10 54 19 Z" />
      <path d="M53 20 C 54.5 12 59.5 7.5 66 6.5 C 62 10.5 60 15 60 21 Z" />
    </g>
  ),
  marks: (
    <g>
      {/* 얼굴 아래쪽의 크림색 볼 */}
      <path d="M24.29 50 A 26.4 26.4 0 0 0 75.71 50 C 70 45.5 58 46 50 53 C 42 46 30 45.5 24.29 50 Z" fill="#fff1b8" />
      {/* 크고 흰 눈자위 */}
      <circle cx="39.2" cy="42" r="8.8" fill="#fff" />
      <circle cx="60.8" cy="42" r="8.8" fill="#fff" />
    </g>
  ),
  belly: (
    <g>
      {/* 옷 가운데 흰 줄, 흰 깃, 보라 나비넥타이 */}
      <rect x="47.2" y="72" width="5.6" height="20.5" rx="2.8" fill="#fff" />
      <Collar color="#fff" rx={13} ry={6.2} />
      <g fill="#9a4fc4" stroke={INK} strokeWidth={1.6} strokeLinejoin="round">
        <path d="M50 78 L41 73.4 L41 82.6 Z" />
        <path d="M50 78 L59 73.4 L59 82.6 Z" />
        <circle cx="50" cy="78" r="2.7" />
      </g>
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
