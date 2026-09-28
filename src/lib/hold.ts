/**
 * 놀이 잠깐 멈춤.
 * 성공 뒤에 스티커 공개 · 빙글빙글 전환 · "오늘은 여기까지" 가 이어질 때, 놀이 화면이 뒤에서
 * 다음 라운드를 시작해 버리면(새 물건이 나오고 안내 말이 겹침) 소리와 화면이 어긋난다.
 * 멈춰 있는 동안 놀이의 예약된 일(useTimers)은 미뤄 두었다가 풀리면 이어서 한다.
 */

let held = false;
const listeners = new Set<(discard: boolean) => void>();

export function isHeld(): boolean {
  return held;
}

export function setHeld(v: boolean) {
  if (held === v) return;
  held = v;
  if (!v) [...listeners].forEach((l) => l(false));
}

/**
 * 멈춤을 풀되 미뤄 둔 일은 버린다. 화면이 바뀌어 멈춰 둔 놀이가 사라질 때 쓴다
 * (사라지는 애니메이션 동안 옛 놀이가 새 라운드를 시작하지 않게)
 */
export function dropHeld() {
  if (!held) return;
  held = false;
  [...listeners].forEach((l) => l(true));
}

/** 멈춤이 풀릴 때 불린다 (discard: 미뤄 둔 일을 버릴지). 돌려주는 함수로 구독을 끊는다 */
export function onRelease(fn: (discard: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
