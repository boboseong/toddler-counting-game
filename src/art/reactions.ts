import type { TargetAndTransition } from "framer-motion";
import type { TapReaction } from "./types";

/** 물건을 셀 때의 움직임 (물건마다 registry 에 적힌 종류로) */
export const REACTIONS: Record<TapReaction, TargetAndTransition> = {
  bounce: { scale: [1, 1.3, 0.9, 1.1, 1], y: [0, -18, 0, -6, 0] },
  spin: { rotate: [0, 360], scale: [1, 1.25, 1] },
  hop: { y: [0, -26, 0, -10, 0], scaleY: [1, 1.12, 0.9, 1.04, 1] },
  bloom: { scale: [1, 0.8, 1.35, 1], rotate: [0, -15, 15, 0] },
  flip: { scaleX: [1, -1, 1], y: [0, -14, 0] },
  drive: { x: [0, 16, -5, 0], rotate: [0, -5, 2, 0] },
  wiggle: { rotate: [0, -14, 14, -8, 8, 0], scale: [1, 1.15, 1] },
};
