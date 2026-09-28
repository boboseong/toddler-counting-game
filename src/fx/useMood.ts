import { useCallback, useEffect, useRef, useState } from "react";
import type { Mood } from "../art/types";
import { lookCh } from "./bus";

/**
 * 캐릭터 표정 관리.
 * - base: 평소 표정 (안내 중이면 talk 등, 부르는 쪽에서 정한다)
 * - flash(mood, ms): 잠깐 다른 표정 (정답 = cheer, 오답 = hmm …) 뒤 base 로 돌아온다
 * - sleepyAfterMs: 이만큼 아무도 안 누르면 꾸벅꾸벅, 누르면 깜짝 깬다
 */
export function useMood(base: Mood, sleepyAfterMs = 0): [Mood, (m: Mood, ms?: number) => void] {
  const [temp, setTemp] = useState<Mood | null>(null);
  const [sleepy, setSleepy] = useState(false);
  const timer = useRef<number | null>(null);

  const flash = useCallback((m: Mood, ms = 1600) => {
    if (timer.current) window.clearTimeout(timer.current);
    setTemp(m);
    timer.current = window.setTimeout(() => setTemp(null), ms);
  }, []);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (!sleepyAfterMs) return;
    let t = window.setTimeout(() => setSleepy(true), sleepyAfterMs);
    const off = lookCh.on(() => {
      window.clearTimeout(t);
      setSleepy((was) => {
        if (was) flash("surprised", 700);
        return false;
      });
      t = window.setTimeout(() => setSleepy(true), sleepyAfterMs);
    });
    return () => {
      off();
      window.clearTimeout(t);
    };
  }, [sleepyAfterMs, flash]);

  return [temp ?? (sleepy ? "sleepy" : base), flash];
}
