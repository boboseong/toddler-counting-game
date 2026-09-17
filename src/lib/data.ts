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
  "열하나",
  "열둘",
  "열셋",
  "열넷",
  "열다섯",
  "열여섯",
  "열일곱",
  "열여덟",
  "열아홉",
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
  "열한",
  "열두",
  "열세",
  "열네",
  "열다섯",
  "열여섯",
  "열일곱",
  "열여덟",
  "열아홉",
];

/** 이 앱에서 다루는 가장 큰 수 */
export const MAX_NUMBER = COUNT_WORDS.length;

/** 한자어 수사 (일, 이, 삼 ...) — 숫자 이름을 읽을 때 ("숫자 오") */
export const SINO_WORDS = [
  "일",
  "이",
  "삼",
  "사",
  "오",
  "육",
  "칠",
  "팔",
  "구",
  "십",
  "십일",
  "십이",
  "십삼",
  "십사",
  "십오",
  "십육",
  "십칠",
  "십팔",
  "십구",
];

/** 숫자 이름 읽기: 5 → "오" (TTS 가 숫자를 엉뚱하게 읽지 않도록 한글로 넘긴다) */
export function numeralName(n: number): string {
  return SINO_WORDS[n - 1] ?? String(n);
}

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
  "#34D399", // 11
  "#F59E0B", // 12
  "#8B5CF6", // 13
  "#EC4899", // 14
  "#06B6D4", // 15
  "#84CC16", // 16
  "#EF4444", // 17
  "#3B82F6", // 18
  "#D946EF", // 19
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

export type GameId = "tap" | "howmany" | "feed" | "bubbles" | "find";

export const GAME_IDS: GameId[] = ["tap", "howmany", "feed", "bubbles", "find"];

export const GAME_NAMES: Record<GameId, string> = {
  tap: "톡톡 세기",
  howmany: "몇 개일까?",
  feed: "냠냠 먹이 주기",
  bubbles: "거품 팡팡",
  find: "숫자 찾기",
};

/** 한 라운드에 나오는 수의 범위 */
export interface CountLevel {
  min: number;
  max: number;
}

/** 톡톡 세기: 단계별 범위 */
export const TAP_LEVELS: CountLevel[] = [
  { min: 1, max: 3 },
  { min: 1, max: 4 },
  { min: 1, max: 5 },
  { min: 3, max: 7 },
  { min: 5, max: 10 },
  { min: 8, max: 13 },
  { min: 10, max: 16 },
  { min: 12, max: 19 },
];

/** 먹이 주기: 단계별 범위. confirm 이면 딱 맞게 준 뒤 "다 줬어요" 를 눌러야 끝난다 */
export interface FeedLevel extends CountLevel {
  confirm: boolean;
}

export const FEED_LEVELS: FeedLevel[] = [
  { min: 1, max: 3, confirm: false },
  { min: 1, max: 4, confirm: false },
  { min: 1, max: 5, confirm: false },
  { min: 1, max: 5, confirm: true },
  { min: 3, max: 7, confirm: true },
  { min: 5, max: 10, confirm: true },
  { min: 8, max: 14, confirm: true },
  { min: 11, max: 19, confirm: true },
];

/**
 * 몇 개일까?: 다른 놀이보다 어려워서 단계를 잘게 나눈다.
 * - choices: 보기 개수
 * - spread: 오답 보기를 고르는 방식
 *   far  = 정답과 2 이상 차이 나는 수만 (1 vs 3 처럼 한눈에 구분)
 *   any  = 범위 안에서 아무 수나
 *   near = 정답과 1~2 차이 나는 수만 (13 vs 14 처럼 꼼꼼히 세야 함)
 */
export type ChoiceSpread = "far" | "any" | "near";

export interface HowManyLevel extends CountLevel {
  choices: number;
  spread: ChoiceSpread;
}

export const HOWMANY_LEVELS: HowManyLevel[] = [
  { min: 1, max: 3, choices: 2, spread: "far" },
  { min: 1, max: 3, choices: 2, spread: "any" },
  { min: 1, max: 4, choices: 2, spread: "any" },
  { min: 1, max: 4, choices: 3, spread: "any" },
  { min: 1, max: 5, choices: 2, spread: "any" },
  { min: 1, max: 5, choices: 3, spread: "any" },
  { min: 1, max: 6, choices: 3, spread: "any" },
  { min: 2, max: 7, choices: 3, spread: "any" },
  { min: 3, max: 8, choices: 3, spread: "any" },
  { min: 4, max: 10, choices: 3, spread: "any" },
  { min: 5, max: 12, choices: 3, spread: "any" },
  { min: 7, max: 15, choices: 3, spread: "any" },
  { min: 10, max: 19, choices: 3, spread: "any" },
  { min: 10, max: 19, choices: 3, spread: "near" },
];

/** 거품 팡팡: 단계별로 여기까지 센다 */
export const BUBBLE_TARGETS = [5, 7, 10, 13, 16, 19];

/**
 * 숫자 찾기: 흩어진 숫자 중에서 말한 숫자를 찾는다.
 * - items: 화면에 흩어 놓는 숫자 개수
 * - prompts: 문제를 내는 방식 (한 라운드마다 이 중 하나)
 *   show  = 말풍선에 숫자를 보여 주며 "숫자 5를 찾아줘" (보고 찾기)
 *   hear  = 숫자를 보여 주지 않고 소리로만 (듣고 찾기)
 *   count = 물건 다섯 개를 보여 주며 "다섯 개를 뜻하는 숫자를 찾아줘" (세어서 찾기)
 * - near: 정답과 가까운 수를 오답으로 (13 옆에 12·14·15)
 */
export type FindPrompt = "show" | "hear" | "count";

export interface FindLevel extends CountLevel {
  items: number;
  prompts: FindPrompt[];
  near: boolean;
}

export const FIND_LEVELS: FindLevel[] = [
  { min: 1, max: 3, items: 3, prompts: ["show"], near: false },
  { min: 1, max: 5, items: 3, prompts: ["show"], near: false },
  { min: 1, max: 5, items: 4, prompts: ["show"], near: false },
  { min: 1, max: 5, items: 4, prompts: ["hear"], near: false },
  { min: 1, max: 5, items: 5, prompts: ["count"], near: false },
  { min: 1, max: 7, items: 5, prompts: ["show", "hear", "count"], near: false },
  { min: 1, max: 9, items: 6, prompts: ["hear", "count"], near: false },
  { min: 1, max: 10, items: 6, prompts: ["hear", "count"], near: false },
  { min: 5, max: 13, items: 6, prompts: ["show", "hear", "count"], near: false },
  { min: 8, max: 16, items: 7, prompts: ["hear", "count"], near: false },
  { min: 10, max: 19, items: 8, prompts: ["hear", "count"], near: false },
  { min: 10, max: 19, items: 9, prompts: ["hear", "count"], near: true },
];

export const FIND_PROMPT_LABELS: Record<FindPrompt, string> = {
  show: "보고",
  hear: "듣고",
  count: "세어서",
};

export const MAX_LEVELS: Record<GameId, number> = {
  tap: TAP_LEVELS.length,
  howmany: HOWMANY_LEVELS.length,
  feed: FEED_LEVELS.length,
  bubbles: BUBBLE_TARGETS.length,
  find: FIND_LEVELS.length,
};

export function clampLevel(game: GameId, level: number): number {
  const max = MAX_LEVELS[game];
  if (!Number.isFinite(level)) return 1;
  return Math.min(max, Math.max(1, Math.round(level)));
}

export function tapLevel(level: number): CountLevel {
  return TAP_LEVELS[clampLevel("tap", level) - 1];
}

export function feedLevel(level: number): FeedLevel {
  return FEED_LEVELS[clampLevel("feed", level) - 1];
}

export function howManyLevel(level: number): HowManyLevel {
  return HOWMANY_LEVELS[clampLevel("howmany", level) - 1];
}

export function bubbleTarget(level: number): number {
  return BUBBLE_TARGETS[clampLevel("bubbles", level) - 1];
}

export function findLevel(level: number): FindLevel {
  return FIND_LEVELS[clampLevel("find", level) - 1];
}

/** 설정 화면에 보여 줄 단계 설명 */
export function levelLabel(game: GameId, level: number): string {
  switch (game) {
    case "tap": {
      const s = tapLevel(level);
      return `${s.min}~${s.max}`;
    }
    case "feed": {
      const s = feedLevel(level);
      return `${s.min}~${s.max}${s.confirm ? " · 다 줬어요 누르기" : ""}`;
    }
    case "howmany": {
      const s = howManyLevel(level);
      const extra =
        s.spread === "far" ? " · 쉬운 보기" : s.spread === "near" ? " · 비슷한 수" : "";
      return `${s.min}~${s.max} · 보기 ${s.choices}개${extra}`;
    }
    case "bubbles":
      return `${bubbleTarget(level)}까지`;
    case "find": {
      const s = findLevel(level);
      const kinds = s.prompts.map((p) => FIND_PROMPT_LABELS[p]).join("·");
      return `${s.min}~${s.max} · ${s.items}개 중 · ${kinds} 찾기${s.near ? " · 비슷한 수" : ""}`;
    }
  }
}

/**
 * 숫자 찾기 오답 숫자 고르기 (items-1 개). near 면 정답 근처를 먼저 쓰고, 모자라면 범위 안의 아무 수로 채운다.
 */
export function findDistractors(target: number, lv: FindLevel): number[] {
  const all: number[] = [];
  for (let n = lv.min; n <= lv.max; n++) if (n !== target) all.push(n);
  const want = Math.min(lv.items - 1, all.length);
  const preferred = lv.near ? all.filter((n) => Math.abs(n - target) <= 3) : all;
  const picked = shuffle(preferred).slice(0, want);
  if (picked.length < want) {
    const rest = shuffle(all.filter((n) => !picked.includes(n)));
    picked.push(...rest.slice(0, want - picked.length));
  }
  return picked;
}

/**
 * 몇 개일까? 보기 만들기. 정답 + 오답 (choices-1)개를 섞어서 돌려준다.
 * spread 조건에 맞는 오답이 모자라면 범위 안의 아무 수로 채운다.
 */
export function howManyChoices(count: number, lv: HowManyLevel): number[] {
  const all: number[] = [];
  for (let n = lv.min; n <= lv.max; n++) if (n !== count) all.push(n);
  const want = Math.min(lv.choices, all.length + 1) - 1;

  let preferred = all;
  if (lv.spread === "far") preferred = all.filter((n) => Math.abs(n - count) >= 2);
  else if (lv.spread === "near") preferred = all.filter((n) => Math.abs(n - count) <= 2);

  const picked = shuffle(preferred).slice(0, want);
  if (picked.length < want) {
    const rest = shuffle(all.filter((n) => !picked.includes(n)));
    picked.push(...rest.slice(0, want - picked.length));
  }
  return shuffle([count, ...picked]);
}

/** 한 라운드에서 무시된 탭(잠금 중·너무 빠름)이 이만큼 쌓이면 "막 누르는 중"으로 본다 */
export const MASH_LIMIT = 4;

/** 셀 것이 많은 라운드는 무시된 탭이 조금 더 쌓여도 봐준다 */
export function mashLimitFor(count: number): number {
  return Math.max(MASH_LIMIT, Math.ceil(count * 0.35));
}

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

/** 아이템을 하나씩 짚으며 셀 때 한 개당 걸리는 시간(ms). 많으면 조금 빠르게 */
export function countStepMs(count: number): number {
  if (count > 10) return 560;
  if (count > 5) return 640;
  return 720;
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

/** 보조사 은/는 */
export function topic(word: string): string {
  return word + (hasBatchim(word) ? "은" : "는");
}

/** 서술격 조사 이야/야 ("일이야", "오야") */
export function copula(word: string): string {
  return word + (hasBatchim(word) ? "이야" : "야");
}

/** "세 개", "다섯 마리" */
export function counterPhrase(n: number, counter: string): string {
  return `${COUNTER_PREFIX[n - 1]} ${counter}`;
}
