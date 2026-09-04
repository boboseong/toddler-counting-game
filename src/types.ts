import type { GameId } from "./hooks/useProgress";

export type Screen = "home" | "stickers" | GameId;

export interface GameProps {
  level: number;
  stars: number;
  /** 세는 탭 사이 최소 간격(ms). 부모 설정에서 조절 */
  tapGap: number;
  onHome: () => void;
  onWin: () => void;
  onResult: (ok: boolean) => void;
}
