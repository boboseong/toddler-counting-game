import type { ComponentType } from "react";
import { ChickArt } from "./Chick";
import type { ArtProps, TapReaction } from "./types";

export interface ArtEntry {
  C: ComponentType<ArtProps>;
  /** 물건을 셀 때의 반응 */
  react?: TapReaction;
}

/**
 * 이모지 → 자체 제작 그림.
 * 여기에 등록만 하면 그 이모지를 쓰는 모든 화면(놀이·스티커북·손님·축하)에 그림이 나온다.
 */
export const ART: Record<string, ArtEntry> = {
  "🐥": { C: ChickArt, react: "hop" },
  "🐤": { C: ChickArt, react: "hop" },
};
