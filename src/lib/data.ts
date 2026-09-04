export interface CountItem {
  emoji: string;
  name: string;
  counter: string; // 개, 마리, 송이 ...
}

export interface Animal {
  emoji: string;
  name: string;
  food: CountItem;
}

export interface Sticker {
  emoji: string;
  name: string;
}

/** 고유어 수사 (하나, 둘, 셋 ...) — 물건을 셀 때 */
export const COUNT_WORDS = [
  "하나",
  "둘",
  "셋",
  "넷",
  "다섯",
  "여섯",
  "일곱",
  "여덟",
  "아홉",
  "열",
];

/** 단위 앞에 붙는 관형형 수사 (한 개, 두 개, 세 개 ...) */
export const COUNTER_PREFIX = [
  "한",
  "두",
  "세",
  "네",
  "다섯",
  "여섯",
  "일곱",
  "여덟",
  "아홉",
  "열",
];

export const NUM_COLORS = [
  "#F87171", // 1
  "#FB923C", // 2
  "#4ADE80", // 3
  "#60A5FA", // 4
  "#A78BFA", // 5
  "#F472B6", // 6
  "#FBBF24", // 7
  "#2DD4BF", // 8
  "#818CF8", // 9
  "#FB7185", // 10
];

export const ITEMS: CountItem[] = [
  { emoji: "🍎", name: "사과", counter: "개" },
  { emoji: "🍌", name: "바나나", counter: "개" },
  { emoji: "🍓", name: "딸기", counter: "개" },
  { emoji: "🍊", name: "귤", counter: "개" },
  { emoji: "🍪", name: "쿠키", counter: "개" },
  { emoji: "🎈", name: "풍선", counter: "개" },
  { emoji: "⭐", name: "별", counter: "개" },
  { emoji: "🚗", name: "자동차", counter: "대" },
  { emoji: "🐤", name: "병아리", counter: "마리" },
  { emoji: "🐟", name: "물고기", counter: "마리" },
  { emoji: "🐞", name: "무당벌레", counter: "마리" },
  { emoji: "🌼", name: "꽃", counter: "송이" },
  { emoji: "🧸", name: "곰인형", counter: "개" },
  { emoji: "🦆", name: "오리", counter: "마리" },
];

export const ANIMALS: Animal[] = [
  { emoji: "🐰", name: "토끼", food: { emoji: "🥕", name: "당근", counter: "개" } },
  { emoji: "🐵", name: "원숭이", food: { emoji: "🍌", name: "바나나", counter: "개" } },
  { emoji: "🐶", name: "강아지", food: { emoji: "🍪", name: "쿠키", counter: "개" } },
  { emoji: "🐼", name: "판다", food: { emoji: "🎋", name: "대나무", counter: "개" } },
  { emoji: "🐱", name: "고양이", food: { emoji: "🐟", name: "물고기", counter: "마리" } },
  { emoji: "🐘", name: "코끼리", food: { emoji: "🍎", name: "사과", counter: "개" } },
  { emoji: "🐻", name: "곰", food: { emoji: "🍓", name: "딸기", counter: "개" } },
  { emoji: "🐿️", name: "다람쥐", food: { emoji: "🌰", name: "도토리", counter: "개" } },
];

export const STICKERS: Sticker[] = [
  { emoji: "🦁", name: "사자" },
  { emoji: "🐰", name: "토끼" },
  { emoji: "🐼", name: "판다" },
  { emoji: "🦊", name: "여우" },
  { emoji: "🐸", name: "개구리" },
  { emoji: "🐨", name: "코알라" },
  { emoji: "🦄", name: "유니콘" },
  { emoji: "🐙", name: "문어" },
  { emoji: "🐧", name: "펭귄" },
  { emoji: "🦋", name: "나비" },
  { emoji: "🐬", name: "돌고래" },
  { emoji: "🦖", name: "공룡" },
  { emoji: "🐢", name: "거북이" },
  { emoji: "🦩", name: "홍학" },
  { emoji: "🐳", name: "고래" },
  { emoji: "🦉", name: "부엉이" },
  { emoji: "🐯", name: "호랑이" },
  { emoji: "🐮", name: "소" },
  { emoji: "🐷", name: "돼지" },
  { emoji: "🐭", name: "생쥐" },
  { emoji: "🦒", name: "기린" },
  { emoji: "🦓", name: "얼룩말" },
  { emoji: "🐝", name: "꿀벌" },
  { emoji: "🐌", name: "달팽이" },
];

export const STARS_PER_STICKER = 3;

export const PRAISES = [
  "잘했어요!",
  "와, 최고야!",
  "정말 대단해!",
  "참 잘했어요!",
  "멋져요!",
  "우와, 똑똑해!",
];

export const MAX_LEVEL = 3;

/** 한 라운드에서 무시된 탭(잠금 중·너무 빠름)이 이만큼 쌓이면 "막 누르는 중"으로 본다 */
export const MASH_LIMIT = 4;

/** 세는 탭 사이 최소 간격(ms) */
export const DEFAULT_TAP_GAP = 700;
export const TAP_GAP_OPTIONS = [
  { label: "빠르게", ms: 350 },
  { label: "보통", ms: 700 },
  { label: "천천히", ms: 1100 },
];

/** 막 눌렀을 때 */
export const SLOW_PHRASES = [
  "너무 빨라요! 천천히, 하나씩 해 보자.",
  "잠깐! 천천히 하나씩 눌러 보자.",
];

export function randomSlowPhrase(): string {
  return SLOW_PHRASES[randomInt(0, SLOW_PHRASES.length - 1)];
}

/** 레벨별 최대 숫자 */
export function maxCountForLevel(level: number): number {
  if (level <= 1) return 3;
  if (level === 2) return 4;
  return 5;
}

/** 거품 팡팡: 레벨별 목표 숫자 */
export function bubbleTargetForLevel(level: number): number {
  if (level <= 1) return 5;
  if (level === 2) return 7;
  return 10;
}

/** 레벨 이름 (설정 화면용) */
export function levelRangeLabel(level: number): string {
  return `1~${maxCountForLevel(level)}`;
}

/** 레벨별 보기 개수 (몇 개일까? 게임) */
export function choicesForLevel(level: number): number {
  return level <= 1 ? 2 : 3;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** min~max 사이 정수. except 와 같은 값은 (가능하면) 피한다 */
export function randomIntExcept(min: number, max: number, except?: number): number {
  if (except === undefined || except < min || except > max || max <= min) {
    return randomInt(min, max);
  }
  const v = randomInt(min, max - 1);
  return v >= except ? v + 1 : v;
}

export function pick<T>(arr: T[], except?: T): T {
  if (arr.length <= 1) return arr[0];
  let v = arr[randomInt(0, arr.length - 1)];
  let guard = 0;
  while (v === except && guard < 10) {
    v = arr[randomInt(0, arr.length - 1)];
    guard++;
  }
  return v;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randomPraise(): string {
  return PRAISES[randomInt(0, PRAISES.length - 1)];
}

/** 받침 유무 판별 */
export function hasBatchim(word: string): boolean {
  const ch = word.charCodeAt(word.length - 1);
  if (ch < 0xac00 || ch > 0xd7a3) return false;
  return (ch - 0xac00) % 28 !== 0;
}

/** 주격 조사 이/가 */
export function subj(word: string): string {
  return word + (hasBatchim(word) ? "이" : "가");
}

/** 목적격 조사 을/를 */
export function obj(word: string): string {
  return word + (hasBatchim(word) ? "을" : "를");
}

/** "세 개", "다섯 마리" */
export function counterPhrase(n: number, counter: string): string {
  return `${COUNTER_PREFIX[n - 1]} ${counter}`;
}
