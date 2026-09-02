import type { GameId } from "./hooks/useProgress";

export type Screen = "home" | "stickers" | GameId;

export interface GameProps {
  level: number;
  stars: number;
  onHome: () => void;
  onWin: () => void;
  onResult: (ok: boolean) => void;
}
