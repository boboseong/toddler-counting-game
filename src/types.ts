import type { GameId, StarMeter } from "./hooks/useProgress";

export type Screen = "home" | "stickers" | "bye" | GameId;

export interface GameProps {
  level: number;
  stars: StarMeter;
  /** 세는 탭 사이 최소 간격(ms). 부모 설정에서 조절 */
  tapGap: number;
  /** 문제를 푸는 놀이들에서 지금 나오는 가장 큰 수. 톡톡 세기·거품 팡팡은 여기까지 센다 */
  countMax: number;
  /** 모은 스티커 (먹이 주기·나눠 주기에 손님으로 온다) */
  friends: number[];
  /** 딩동 엘리베이터: 층마다 손님을 집에 데려다 준 횟수 (자주 데려다 준 친구는 가끔 층을 말하지 않는다) */
  rides: number[];
  onRide: (floor: number) => void;
  onHome: () => void;
  onWin: () => void;
  onResult: (ok: boolean) => void;
}
