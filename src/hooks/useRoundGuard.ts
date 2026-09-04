import { useCallback, useEffect, useRef, useState } from "react";
import { MASH_LIMIT } from "../lib/data";

/**
 * 라운드 입력 보호.
 * - lock(ms): 안내 음성이 나가는 동안 입력을 잠근다 (화면에는 "잘 들어 봐" 표시)
 * - accept(): 잠금 중이거나 직전 탭에서 tapGap(ms) 이 지나지 않았으면 false 를 돌려주고 무시 횟수를 센다
 * - isMashing(): 이번 라운드에서 무시된 탭이 MASH_LIMIT 이상이면 "막 누르는 중"
 */
export function useRoundGuard(tapGap: number) {
  const [locked, setLocked] = useState(true);
  const lockedRef = useRef(true);
  const lockTimer = useRef<number | null>(null);
  const lastTap = useRef(0);
  const ignored = useRef(0);
  const gapRef = useRef(tapGap);
  gapRef.current = tapGap;

  const lock = useCallback((ms: number) => {
    lockedRef.current = true;
    setLocked(true);
    if (lockTimer.current) window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(() => {
      lockedRef.current = false;
      lastTap.current = 0;
      setLocked(false);
    }, ms);
  }, []);

  /** 잠금 없이 바로 받기 */
  const unlock = useCallback(() => {
    if (lockTimer.current) window.clearTimeout(lockTimer.current);
    lockTimer.current = null;
    lockedRef.current = false;
    lastTap.current = 0;
    setLocked(false);
  }, []);

  useEffect(
    () => () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    },
    [],
  );

  const noteIgnored = useCallback(() => {
    ignored.current += 1;
  }, []);

  const accept = useCallback((): boolean => {
    if (lockedRef.current) {
      ignored.current += 1;
      return false;
    }
    const now = performance.now();
    if (now - lastTap.current < gapRef.current) {
      ignored.current += 1;
      return false;
    }
    lastTap.current = now;
    return true;
  }, []);

  const isMashing = useCallback(() => ignored.current >= MASH_LIMIT, []);

  const resetRound = useCallback(() => {
    ignored.current = 0;
    lastTap.current = 0;
  }, []);

  return { locked, lockedRef, lock, unlock, accept, noteIgnored, isMashing, resetRound };
}
