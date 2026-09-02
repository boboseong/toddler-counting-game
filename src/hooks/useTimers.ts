import { useCallback, useEffect, useRef } from "react";

/** 컴포넌트가 사라질 때 자동으로 정리되는 setTimeout */
export function useTimers() {
  const timers = useRef<number[]>([]);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(() => {
      timers.current = timers.current.filter((t) => t !== id);
      fn();
    }, ms);
    timers.current.push(id);
    return id;
  }, []);

  const clearAll = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearAll, [clearAll]);

  return { after, clearAll };
}
