import { useEffect, useRef } from "react";

/** 버튼을 누를 수 있게 된 뒤 이만큼 아무도 안 누르면 저절로 다음 단계로 (선물 상자·확인·시작) */
export const AUTO_ADVANCE_MS = 10_000;

/**
 * ready 가 된 뒤 ms 동안 진행되지 않으면 fn 을 부른다.
 * 화면이 꺼져 있거나 다른 앱에 가 있는 동안에는 넘어가지 않고, 돌아오면 시간을 다시 잰다.
 */
export function useAutoAdvance(ready: boolean, fn: () => void, ms: number = AUTO_ADVANCE_MS) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (!ready) return;
    let t = 0;
    const arm = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (document.hidden) return; // 돌아오면 onVisibility 가 다시 잰다
        fnRef.current();
      }, ms);
    };
    const onVisibility = () => {
      if (!document.hidden) arm();
    };
    arm();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ready, ms]);
}
