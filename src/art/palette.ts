/* 자체 제작 그림의 공통 색·선. 모든 캐릭터·물건이 한 그림체로 보이게 여기 값만 쓴다 */

/** 외곽선 (진한 밤색: 검정보다 부드럽다) */
export const INK = "#4a3426";
/** 외곽선 두께 (viewBox 100 기준) */
export const LINE = 3.2;
/** 볼터치 */
export const BLUSH = "#ff8fab";
/** 입 안 */
export const MOUTH = "#8a2f3a";
/** 혀 */
export const TONGUE = "#ff7b93";
/** 하이라이트 */
export const SHINE = "rgba(255,255,255,0.6)";

/** 외곽선 공통 속성 */
export const stroke = {
  stroke: INK,
  strokeWidth: LINE,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};
