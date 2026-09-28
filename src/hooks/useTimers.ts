import { useCallback, useEffect, useRef } from "react";
import { isHeld, onRelease } from "../lib/hold";

/**
 * 컴포넌트가 사라질 때 자동으로 정리되는 setTimeout.
 * 놀이가 멈춰 있는 동안(lib/hold) 때가 된 일은 미뤄 두었다가 풀리면 차례로 한다.
 */
export function useTimers() {
  const timers = useRef<number[]>([]);
  const deferred = useRef<(() => void)[]>([]);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.current = timers.current.filter((t) => t !== id);
      if (isHeld()) {
        deferred.current.push(fn);
        return;
      }
      fn();
    }, ms);
    timers.current.push(id);
    return id;
  }, []);

  const clearAll = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    deferred.current = [];
  }, []);

  useEffect(
    () =>
      onRelease((discard) => {
        const fns = deferred.current;
        deferred.current = [];
        if (!discard) fns.forEach((fn) => after(0, fn));
      }),
    [after],
  );

  useEffect(() => clearAll, [clearAll]);

  return { after, clearAll };
}
