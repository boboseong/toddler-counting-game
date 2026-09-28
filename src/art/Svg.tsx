import type { ReactNode } from "react";

/** 모든 그림의 바탕 SVG (viewBox 100×100, 선이 삐져나와도 잘리지 않게) */
export function Svg({ children, vb = "0 0 100 100" }: { children: ReactNode; vb?: string }) {
  return (
    <svg viewBox={vb} className="glyph-svg" aria-hidden focusable="false">
      {children}
    </svg>
  );
}
