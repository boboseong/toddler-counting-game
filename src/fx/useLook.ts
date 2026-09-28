import { useEffect, useState, type RefObject } from "react";
import type { Look } from "../art/types";
import { lookCh } from "./bus";

/** 이만큼 지나면 다시 앞을 본다 */
const HOLD_MS = 1600;

/**
 * 화면을 누른 곳을 캐릭터가 쳐다보게 한다.
 * ref 요소 가운데에서 누른 곳으로의 방향을 -1~1 로 돌려준다.
 */
export function useLook(ref: RefObject<Element | null>): Look | undefined {
  const [look, setLook] = useState<Look | undefined>(undefined);

  useEffect(() => {
    let t: number | null = null;
    const off = lookCh.on((p) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = p.x - (r.left + r.width / 2);
      const dy = p.y - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      // 가까우면 조금만, 멀면 끝까지
      const k = Math.min(1, len / 160);
      setLook({ x: (dx / len) * k, y: (dy / len) * k });
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => setLook(undefined), HOLD_MS);
    });
    return () => {
      off();
      if (t) window.clearTimeout(t);
    };
  }, [ref]);

  return look;
}
