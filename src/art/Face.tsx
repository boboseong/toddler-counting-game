import { useId, type CSSProperties } from "react";
import { BLUSH, INK, MOUTH, SHINE, TONGUE } from "./palette";
import type { Look, Mood } from "./types";

/** useId 로 얻은 문자열에서 0~1 사이의 고정된 값을 만든다 (깜빡임 시점이 서로 어긋나도록) */
export function useStableRandom(): number {
  const id = useId();
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

interface FaceProps {
  /** 두 눈 사이 가운데 */
  x: number;
  y: number;
  /** 크기 배율 (1 이면 눈 사이 24) */
  s?: number;
  mood?: Mood;
  look?: Look;
  /** 입 모양: 보통 입 / 부리 / 입 없음(코끼리 코처럼 다른 부위가 입을 가릴 때) */
  mouth?: "mouth" | "beak" | "none";
  /** 입 위치를 조금 내릴 때 (주둥이가 긴 동물) */
  mouthDy?: number;
  /** 볼터치를 그릴지 */
  cheeks?: boolean;
  /** 눈 색 (판다처럼 눈 주변이 검으면 흰 눈동자) */
  eyeColor?: string;
}

/**
 * 모든 캐릭터가 같이 쓰는 얼굴: 눈 · 입 · 볼.
 * 표정(mood)에 따라 모양이 바뀌고, 눈은 CSS 로 가끔 깜빡인다(JS 타이머 없음).
 */
export function Face({
  x,
  y,
  s = 1,
  mood = "idle",
  look,
  mouth = "mouth",
  mouthDy = 0,
  cheeks = true,
  eyeColor = INK,
}: FaceProps) {
  const r = useStableRandom();
  const blinkStyle: CSSProperties = { animationDelay: `${(r * 4).toFixed(2)}s` };
  const lx = (look?.x ?? 0) * 1.8;
  const ly = (look?.y ?? 0) * 1.4;
  const w = 3 / s; // 선 두께를 배율과 상관없이 일정하게

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {cheeks ? <Cheeks mood={mood} /> : null}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 12} 0)`}>
          <Eye mood={mood} side={side} lx={lx} ly={ly} w={w} color={eyeColor} style={blinkStyle} />
        </g>
      ))}
      {mouth === "beak" ? (
        <Beak mood={mood} w={w} />
      ) : mouth === "mouth" ? (
        <g transform={`translate(0 ${11 + mouthDy})`}>
          <Mouth mood={mood} w={w} />
        </g>
      ) : null}
    </g>
  );
}

function Cheeks({ mood }: { mood: Mood }) {
  const big = mood === "full" || mood === "eating" || mood === "cheer";
  return (
    <>
      {[-1, 1].map((side) => (
        <ellipse
          key={side}
          cx={side * 20}
          cy={8}
          rx={big ? 6.5 : 5}
          ry={big ? 4.5 : 3.4}
          fill={BLUSH}
          opacity={big ? 0.8 : 0.55}
        />
      ))}
    </>
  );
}

function Eye({
  mood,
  side,
  lx,
  ly,
  w,
  color,
  style,
}: {
  mood: Mood;
  side: number;
  lx: number;
  ly: number;
  w: number;
  color: string;
  style: CSSProperties;
}) {
  const line = { fill: "none", stroke: color, strokeWidth: w, strokeLinecap: "round" as const };
  switch (mood) {
    case "happy":
    case "cheer":
    case "eating":
      // ^ ^ 웃는 눈
      return <path d="M -5 1.5 Q 0 -5 5 1.5" {...line} />;
    case "full":
      // > < 꽉 감은 눈
      return side < 0 ? (
        <path d="M -4 -4 L 3 0 L -4 4" {...line} strokeLinejoin="round" />
      ) : (
        <path d="M 4 -4 L -3 0 L 4 4" {...line} strokeLinejoin="round" />
      );
    case "sleepy":
      return <path d="M -5 0 Q 0 3.5 5 0" {...line} />;
    default: {
      const big = mood === "surprised" || mood === "hungry";
      const rx = big ? 5.4 : 4.6;
      const ry = big ? 6.4 : 5.6;
      const tilt = mood === "hmm" ? 2.2 * side : 0;
      return (
        <g>
          {mood === "hmm" ? (
            // 한쪽 눈썹만 살짝
            <path d={`M -5 ${-10 - tilt} L 5 ${-10 + tilt}`} {...line} />
          ) : null}
          <g className="blink" style={style}>
            {big ? <ellipse cx={0} cy={0} rx={rx + 1.6} ry={ry + 1.6} fill="#fff" /> : null}
            <ellipse
              cx={lx + (mood === "hmm" ? 1.5 : 0)}
              cy={ly}
              rx={rx}
              ry={ry}
              fill={color}
            />
            <circle cx={lx - 1.6} cy={ly - 2.2} r={1.9} fill={color === INK ? "#fff" : INK} />
            <circle cx={lx + 1.8} cy={ly + 2} r={0.9} fill={color === INK ? "#fff" : INK} opacity={0.8} />
          </g>
        </g>
      );
    }
  }
}

function Mouth({ mood, w }: { mood: Mood; w: number }) {
  const line = { fill: "none", stroke: INK, strokeWidth: w, strokeLinecap: "round" as const };
  switch (mood) {
    case "happy":
    case "cheer":
      return (
        <g>
          <path d="M -7 -1 Q 0 11 7 -1 Z" fill={MOUTH} stroke={INK} strokeWidth={w} strokeLinejoin="round" />
          <ellipse cx={0} cy={4.6} rx={3.4} ry={2} fill={TONGUE} />
        </g>
      );
    case "surprised":
      return <ellipse cx={0} cy={1.5} rx={3} ry={3.8} fill={MOUTH} stroke={INK} strokeWidth={w} />;
    case "hungry":
      return (
        <g>
          <ellipse cx={0} cy={2} rx={5.5} ry={6} fill={MOUTH} stroke={INK} strokeWidth={w} />
          <ellipse cx={0} cy={5} rx={3.2} ry={2} fill={TONGUE} />
        </g>
      );
    case "eating":
      return (
        <g className="chew">
          <ellipse cx={0} cy={1.5} rx={4.6} ry={3.4} fill={MOUTH} stroke={INK} strokeWidth={w} />
        </g>
      );
    case "talk":
      return (
        <g className="talk">
          <ellipse cx={0} cy={1.5} rx={4} ry={3.6} fill={MOUTH} stroke={INK} strokeWidth={w} />
        </g>
      );
    case "full":
      return <path d="M -6 1 q 3 -3 6 0 q 3 3 6 0" {...line} />;
    case "hmm":
      return <path d="M -5 1.5 L 5 -0.5" {...line} />;
    case "sleepy":
      return <ellipse cx={0} cy={1} rx={2} ry={2.4} fill={MOUTH} />;
    default:
      return <path d="M -5 0 Q 0 5 5 0" {...line} />;
  }
}

/** 새 부리: 기쁘거나 말하거나 놀라면 벌어진다 */
function Beak({ mood, w }: { mood: Mood; w: number }) {
  const open = mood === "happy" || mood === "cheer" || mood === "surprised" || mood === "hungry";
  const beak = { fill: "#ffa62b", stroke: INK, strokeWidth: w, strokeLinejoin: "round" as const };
  if (mood === "talk" || mood === "eating") {
    return (
      <g transform="translate(0 7)">
        <path d="M -6 0 L 0 -3.5 L 6 0 Z" {...beak} />
        <g className={mood === "talk" ? "talk" : "chew"}>
          <path d="M -5 1.5 L 0 7 L 5 1.5 Z" {...beak} fill="#f08a1c" />
        </g>
      </g>
    );
  }
  if (open) {
    return (
      <g transform="translate(0 7)">
        <path d="M -5 1 L 0 9 L 5 1 Z" fill={MOUTH} />
        <path d="M -7 0 L 0 -4 L 7 0 Z" {...beak} />
        <path d="M -5.5 2.5 L 0 9.5 L 5.5 2.5 Z" {...beak} fill="#f08a1c" />
      </g>
    );
  }
  return (
    <g transform="translate(0 7)">
      <path d="M -6 0 L 0 -3.5 L 6 0 L 0 5 Z" {...beak} />
      <path d="M -6 0 L 6 0" stroke={INK} strokeWidth={w * 0.7} />
    </g>
  );
}

/** 공통 하이라이트 (물건 왼쪽 위의 반짝) */
export function Shine({ x, y, rx = 5, ry = 8, rot = -25 }: { x: number; y: number; rx?: number; ry?: number; rot?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={SHINE} transform={`rotate(${rot} ${x} ${y})`} />;
}
