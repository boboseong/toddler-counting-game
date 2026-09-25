import type { GameId } from "./hooks/useProgress";

export type Screen = "home" | "stickers" | "bye" | GameId;

export interface GameProps {
  level: number;
  stars: number;
  /** 세는 탭 사이 최소 간격(ms). 부모 설정에서 조절 */
  tapGap: number;
  /** 문제를 푸는 놀이들에서 지금 나오는 가장 큰 수. 톡톡 세기·거품 팡팡은 여기까지 센다 */
  countMax: number;
  /** 모은 스티커 (먹이 주기에 손님으로 온다) */
  friends: number[];
  onHome: () => void;
  onWin: () => void;
  onResult: (ok: boolean) => void;
}
