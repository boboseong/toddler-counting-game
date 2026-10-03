/*
 * 리액션(FX) 이벤트 버스.
 * 게임 코드는 "여기서 반짝!" "이걸 저기로 날려!" 만 알리고, 그리는 건 앱 전체에 하나 있는 FxLayer 가 맡는다.
 */

export interface Point {
  x: number;
  y: number;
}

export type BurstKind = "sparkle" | "pop" | "hearts" | "stars" | "confetti";

export interface BurstEvent extends Point {
  kind: BurstKind;
  /** 조각 수 (콤보가 쌓이면 늘린다) */
  count?: number;
  /** 대표 색 (숫자 색 등) */
  color?: string;
}

export interface FlyEvent {
  from: Point;
  /** 도착 지점 또는 도착할 요소의 id */
  to: Point | string;
  emoji: string;
  /** 날아가는 그림 크기(px) */
  size?: number;
  duration?: number;
  /** 포물선 높이(px). 위로 볼록 */
  arc?: number;
  /**
   * 움직임이 곧 놀이의 뜻일 때 (나눠 주기에서 먹이가 친구에게 건너가는 것 등).
   * '동작 줄이기' 설정에서도 날아가되, 돌거나 커지지 않고 곧게 미끄러진다
   */
  essential?: boolean;
  onArrive?: () => void;
}

type Listener<T> = (e: T) => void;

function channel<T>() {
  const ls = new Set<Listener<T>>();
  return {
    on(l: Listener<T>) {
      ls.add(l);
      return () => {
        ls.delete(l);
      };
    },
    emit(e: T) {
      ls.forEach((l) => l(e));
    },
  };
}

export interface ShakeEvent {
  strength: number;
  /** 흔들 요소 (없으면 화면 전체) */
  el?: HTMLElement | null;
}

export const burstCh = channel<BurstEvent>();
export const flyCh = channel<FlyEvent>();
export const shakeCh = channel<ShakeEvent>();
export const lookCh = channel<Point>();
export const pokeCh = channel<string>();

let hapticsOn = true;
export function setHapticsOn(v: boolean) {
  hapticsOn = v;
}

export function reducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function centerOf(el: Element | null | undefined): Point | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export const fx = {
  /** (x, y) 에서 조각이 터져 나온다 */
  burst(x: number, y: number, kind: BurstKind = "sparkle", opts: { count?: number; color?: string } = {}) {
    burstCh.emit({ x, y, kind, ...opts });
  },
  /** 요소 가운데서 터진다 */
  burstAt(el: Element | null | undefined, kind: BurstKind = "sparkle", opts: { count?: number; color?: string } = {}) {
    const c = centerOf(el);
    if (c) burstCh.emit({ ...c, kind, ...opts });
  },
  /** 그림 하나를 포물선으로 날린다. 움직임 줄이기 설정이면 바로 도착 (essential 이면 곧게 미끄러진다) */
  fly(e: FlyEvent) {
    if (reducedMotion() && !e.essential) {
      e.onArrive?.();
      return;
    }
    flyCh.emit(e);
  },
  /** 화면을 살짝 흔든다 (1 = 보통). el 을 주면 그 요소만 */
  shake(strength = 1, el?: HTMLElement | null) {
    if (reducedMotion()) return;
    shakeCh.emit({ strength, el });
  },
  /** 마지막으로 누른 곳 (캐릭터가 그쪽을 쳐다본다) */
  look(x: number, y: number) {
    lookCh.emit({ x, y });
  },
  /** 배경 소품(data-prop)을 눌렀는지 보고, 눌렀으면 그 소품에 알린다. 눌렀으면 true */
  poke(x: number, y: number): boolean {
    const props = document.querySelectorAll<HTMLElement>("[data-prop]");
    for (const el of Array.from(props)) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        pokeCh.emit(el.dataset.prop ?? "");
        return true;
      }
    }
    return false;
  },
  /** 짧은 진동 (지원하는 기기만, 부모 설정에서 끌 수 있음) */
  haptic(ms: number | number[] = 12) {
    if (!hapticsOn) return;
    try {
      navigator.vibrate?.(ms);
    } catch {
      /* ignore */
    }
  },
};
