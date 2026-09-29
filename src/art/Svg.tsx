import type { ReactNode } from "react";
import { INK, LINE } from "./palette";

/** 모든 그림의 바탕 SVG (viewBox 100×100, 선이 삐져나와도 잘리지 않게) */
export function Svg({ children, vb = "0 0 100 100" }: { children: ReactNode; vb?: string }) {
  return (
    <svg viewBox={vb} className="glyph-svg" aria-hidden focusable="false">
      {children}
    </svg>
  );
}

/** 외곽선이 있는 굵은 선 (다리·손잡이·물줄기처럼 선으로 그리는 부위) */
export function Tube({ d, color, w }: { d: string; color: string; w: number }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={INK} strokeWidth={w + LINE * 2} />
      <path d={d} stroke={color} strokeWidth={w} />
    </g>
  );
}
