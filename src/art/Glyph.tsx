import type { CSSProperties } from "react";
import { ART } from "./registry";
import type { ArtProps } from "./types";

interface GlyphProps extends ArtProps {
  /** 데이터에 적힌 이모지. 그림이 있으면 그림으로, 없으면 이모지 그대로 */
  emoji: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * 이모지 → 자체 제작 SVG 로 조금씩 바꾸는 장치.
 * 크기는 지금처럼 글자 크기(text-5xl 등)로 정한다 (그림은 1.15em 네모 안에 그려진다).
 */
export function Glyph({ emoji, className = "", style, mood, look, fullness }: GlyphProps) {
  const entry = ART[emoji];
  if (!entry) {
    return (
      <span className={`emoji ${className}`} style={style}>
        {emoji}
      </span>
    );
  }
  const C = entry.C;
  return (
    <span className={`glyph ${className}`} style={style}>
      <C mood={mood} look={look} fullness={fullness} />
    </span>
  );
}

/** 이 이모지를 대신할 그림이 있는지 */
export function hasArt(emoji: string): boolean {
  return emoji in ART;
}

/** 이 물건을 셀 때의 반응 (그림이 없으면 기본 통통) */
export function reactionOf(emoji: string) {
  return ART[emoji]?.react ?? "bounce";
}
