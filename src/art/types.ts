/** 캐릭터 표정 */
export type Mood =
  | "idle"
  | "happy"
  | "cheer"
  | "surprised"
  | "hmm"
  | "eating"
  | "full"
  | "hungry"
  | "sleepy"
  | "talk";

/** 시선 (-1~1) */
export interface Look {
  x: number;
  y: number;
}

export interface ArtProps {
  mood?: Mood;
  look?: Look;
  /** 먹이 주기: 얼마나 배부른지 (0~1). 배가 조금씩 커진다 */
  fullness?: number;
}

/** 물건을 셀 때의 반응 종류 */
export type TapReaction = "bounce" | "spin" | "hop" | "bloom" | "flip" | "drive" | "wiggle";
