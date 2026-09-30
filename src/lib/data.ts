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
  food?: CountItem;
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
  "스물",
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
  "스무",
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
  "이십", // 딩동 엘리베이터의 꼭대기 층 · 나눠 주기의 가장 많은 개수
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
  "#0D9488", // 20
];

export const ITEMS: CountItem[] = [
  { emoji: "🍎", name: "사과", counter: "개" },
  { emoji: "🍌", name: "바나나", counter: "개" },
  { emoji: "🍓", name: "딸기", counter: "개" },
  { emoji: "🍊", name: "귤", counter: "개" },
  { emoji: "🍑", name: "복숭아", counter: "개" },
  { emoji: "🍒", name: "체리", counter: "개" },
  { emoji: "🥕", name: "당근", counter: "개" },
  { emoji: "🍪", name: "쿠키", counter: "개" },
  { emoji: "🍩", name: "도넛", counter: "개" },
  { emoji: "🧁", name: "컵케이크", counter: "개" },
  { emoji: "🍭", name: "사탕", counter: "개" },
  { emoji: "🍦", name: "아이스크림", counter: "개" },
  { emoji: "🎈", name: "풍선", counter: "개" },
  { emoji: "⭐", name: "별", counter: "개" },
  { emoji: "⚽", name: "공", counter: "개" },
  { emoji: "🎁", name: "선물", counter: "개" },
  { emoji: "🧸", name: "곰인형", counter: "개" },
  { emoji: "🍄", name: "버섯", counter: "개" },
  { emoji: "🚗", name: "자동차", counter: "대" },
  { emoji: "🚌", name: "버스", counter: "대" },
  { emoji: "🚀", name: "로켓", counter: "대" },
  { emoji: "✈️", name: "비행기", counter: "대" },
  { emoji: "🐤", name: "병아리", counter: "마리" },
  { emoji: "🐟", name: "물고기", counter: "마리" },
  { emoji: "🐞", name: "무당벌레", counter: "마리" },
  { emoji: "🦋", name: "나비", counter: "마리" },
  { emoji: "🐝", name: "꿀벌", counter: "마리" },
  { emoji: "🐌", name: "달팽이", counter: "마리" },
  { emoji: "🦆", name: "오리", counter: "마리" },
  { emoji: "🌼", name: "꽃", counter: "송이" },
  { emoji: "🌷", name: "튤립", counter: "송이" },
];

/** 먹이 */
const F = {
  carrot: { emoji: "🥕", name: "당근", counter: "개" },
  banana: { emoji: "🍌", name: "바나나", counter: "개" },
  cookie: { emoji: "🍪", name: "쿠키", counter: "개" },
  bamboo: { emoji: "🎋", name: "대나무", counter: "개" },
  fish: { emoji: "🐟", name: "물고기", counter: "마리" },
  apple: { emoji: "🍎", name: "사과", counter: "개" },
  berry: { emoji: "🍓", name: "딸기", counter: "개" },
  acorn: { emoji: "🌰", name: "도토리", counter: "개" },
  corn: { emoji: "🌽", name: "옥수수", counter: "개" },
  cheese: { emoji: "🧀", name: "치즈", counter: "개" },
  leaf: { emoji: "🍃", name: "나뭇잎", counter: "장" },
  meat: { emoji: "🍖", name: "고기", counter: "개" },
  grape: { emoji: "🍇", name: "포도", counter: "송이" },
  shrimp: { emoji: "🦐", name: "새우", counter: "마리" },
  flower: { emoji: "🌸", name: "꽃", counter: "송이" },
  candy: { emoji: "🍭", name: "사탕", counter: "개" },
  melon: { emoji: "🍉", name: "수박", counter: "개" },
  bug: { emoji: "🐛", name: "애벌레", counter: "마리" },
} satisfies Record<string, CountItem>;

export const ANIMALS: Animal[] = [
  { emoji: "🐰", name: "토끼", food: F.carrot },
  { emoji: "🐵", name: "원숭이", food: F.banana },
  { emoji: "🐶", name: "강아지", food: F.cookie },
  { emoji: "🐼", name: "판다", food: F.bamboo },
  { emoji: "🐱", name: "고양이", food: F.fish },
  { emoji: "🐘", name: "코끼리", food: F.apple },
  { emoji: "🐻", name: "곰", food: F.berry },
  { emoji: "🐿️", name: "다람쥐", food: F.acorn },
  { emoji: "🐔", name: "닭", food: F.corn },
  { emoji: "🐭", name: "생쥐", food: F.cheese },
  { emoji: "🐨", name: "코알라", food: F.leaf },
  { emoji: "🐷", name: "돼지", food: F.melon },
];

/**
 * 스티커. 앨범 순서대로 하나씩 열린다 (0~23 동물 친구 → 24~47 탈것 친구 → 48~71 숲속 친구).
 * food 가 있는 친구는 모은 뒤에 먹이 주기 놀이에 손님으로 찾아온다.
 */
export const STICKERS: Sticker[] = [
  // 1권: 동물 친구
  { emoji: "🦁", name: "사자", food: F.meat },
  { emoji: "🐰", name: "토끼", food: F.carrot },
  { emoji: "🐼", name: "판다", food: F.bamboo },
  { emoji: "🦊", name: "여우", food: F.grape },
  { emoji: "🐸", name: "개구리", food: F.bug },
  { emoji: "🐨", name: "코알라", food: F.leaf },
  { emoji: "🦄", name: "유니콘", food: F.candy },
  { emoji: "🐙", name: "문어", food: F.shrimp },
  { emoji: "🐧", name: "펭귄", food: F.fish },
  { emoji: "🦋", name: "나비", food: F.flower },
  { emoji: "🐬", name: "돌고래", food: F.fish },
  { emoji: "🦖", name: "공룡", food: F.leaf },
  { emoji: "🐢", name: "거북이", food: F.berry },
  { emoji: "🦩", name: "홍학", food: F.shrimp },
  { emoji: "🐳", name: "고래", food: F.shrimp },
  { emoji: "🦉", name: "부엉이", food: F.bug },
  { emoji: "🐯", name: "호랑이", food: F.meat },
  { emoji: "🐮", name: "소", food: F.corn },
  { emoji: "🐷", name: "돼지", food: F.melon },
  { emoji: "🐭", name: "생쥐", food: F.cheese },
  { emoji: "🦒", name: "기린", food: F.leaf },
  { emoji: "🦓", name: "얼룩말", food: F.apple },
  { emoji: "🐝", name: "꿀벌", food: F.flower },
  { emoji: "🐌", name: "달팽이", food: F.berry },
  // 2권: 탈것 친구
  { emoji: "🚗", name: "자동차" },
  { emoji: "🚌", name: "버스" },
  { emoji: "🚒", name: "소방차" },
  { emoji: "🚓", name: "경찰차" },
  { emoji: "🚑", name: "구급차" },
  { emoji: "🚜", name: "트랙터" },
  { emoji: "🚂", name: "기차" },
  { emoji: "✈️", name: "비행기" },
  { emoji: "🚁", name: "헬리콥터" },
  { emoji: "🚀", name: "로켓" },
  { emoji: "⛵", name: "돛단배" },
  { emoji: "🚲", name: "자전거" },
  { emoji: "🛵", name: "오토바이" },
  { emoji: "🚕", name: "택시" },
  { emoji: "🚚", name: "트럭" },
  { emoji: "🏎️", name: "경주용 차" },
  { emoji: "🛸", name: "비행접시" },
  { emoji: "🚠", name: "케이블카" },
  { emoji: "🚤", name: "모터보트" },
  { emoji: "🛴", name: "킥보드" },
  { emoji: "🚃", name: "전철" },
  { emoji: "🚢", name: "큰 배" },
  { emoji: "🛶", name: "카누" },
  { emoji: "🚅", name: "고속열차" },
  // 3권: 숲속 친구
  { emoji: "🐔", name: "닭", food: F.corn },
  { emoji: "🦆", name: "오리", food: F.corn },
  { emoji: "🐴", name: "말", food: F.carrot },
  { emoji: "🐑", name: "양", food: F.leaf },
  { emoji: "🐐", name: "염소", food: F.leaf },
  { emoji: "🦙", name: "라마", food: F.apple },
  { emoji: "🐿️", name: "다람쥐", food: F.acorn },
  { emoji: "🦔", name: "고슴도치", food: F.bug },
  { emoji: "🦝", name: "너구리", food: F.grape },
  { emoji: "🦦", name: "수달", food: F.fish },
  { emoji: "🐹", name: "햄스터", food: F.acorn },
  { emoji: "🦜", name: "앵무새", food: F.grape },
  { emoji: "🦚", name: "공작", food: F.corn },
  { emoji: "🦘", name: "캥거루", food: F.leaf },
  { emoji: "🐒", name: "원숭이", food: F.banana },
  { emoji: "🦥", name: "나무늘보", food: F.leaf },
  { emoji: "🐊", name: "악어", food: F.fish },
  { emoji: "🦛", name: "하마", food: F.melon },
  { emoji: "🦏", name: "코뿔소", food: F.apple },
  { emoji: "🐘", name: "코끼리", food: F.apple },
  { emoji: "🦍", name: "고릴라", food: F.banana },
  { emoji: "🦌", name: "사슴", food: F.leaf },
  { emoji: "🐻", name: "곰", food: F.berry },
  { emoji: "🐶", name: "강아지", food: F.cookie },
];

export interface Album {
  title: string;
  emoji: string;
  /** STICKERS 안의 범위 [start, end) */
  start: number;
  end: number;
}

/** 모은 스티커 친구가 먹이 주기·나눠 주기에 손님으로 올 확률 */
export const GUEST_CHANCE = 0.4;

/** 먹이를 먹는 스티커 친구들 (손님) */
export function guestsFrom(friends: number[]): Animal[] {
  const out: Animal[] = [];
  for (const i of friends) {
    const s = STICKERS[i];
    if (s?.food) out.push({ emoji: s.emoji, name: s.name, food: s.food });
  }
  return out;
}

export const ALBUMS: Album[] = [
  { title: "동물 친구", emoji: "🦁", start: 0, end: 24 },
  { title: "탈것 친구", emoji: "🚗", start: 24, end: 48 },
  { title: "숲속 친구", emoji: "🐔", start: 48, end: 72 },
];

export function albumOf(sticker: number): number {
  const i = ALBUMS.findIndex((a) => sticker >= a.start && sticker < a.end);
  return i < 0 ? ALBUMS.length - 1 : i;
}

/** 스티커 꾸미기 장면에 한 번에 놓을 수 있는 친구 수 (같이 세기 좋은 만큼) */
export const SCENE_MAX = 10;

export const STARS_PER_STICKER = 3;

export const PRAISES = [
  "잘했어요!",
  "와, 최고야!",
  "정말 대단해!",
  "참 잘했어요!",
  "멋져요!",
  "우와, 똑똑해!",
  "짝짝짝!",
  "최고최고!",
  "우와, 해냈다!",
  "야호, 성공!",
  "너무 멋지다!",
  "척척 잘하네!",
  "반짝반짝 빛나!",
];

export type GameId = "tap" | "howmany" | "feed" | "bubbles" | "find" | "elevator" | "dial" | "share";

export const GAME_IDS: GameId[] = ["tap", "howmany", "feed", "bubbles", "find", "elevator", "dial", "share"];

export const GAME_NAMES: Record<GameId, string> = {
  tap: "톡톡 세기",
  howmany: "몇 개일까?",
  feed: "냠냠 먹이 주기",
  bubbles: "거품 팡팡",
  find: "숫자 찾기",
  elevator: "딩동 엘리베이터",
  dial: "숫자 따라 누르기",
  share: "쏙쏙 나눠 주기",
};

/** 홈 카드·전환 화면에서 쓰는 놀이 정보 */
export interface GameMeta {
  emoji: string;
  title: string;
  sub: string;
  bg: string;
  shadow: string;
}

export const GAME_META: Record<GameId, GameMeta> = {
  tap: {
    emoji: "🍎",
    title: "톡톡 세기",
    sub: "하나씩 눌러 세어요",
    bg: "linear-gradient(160deg,#fda4af,#f87171)",
    shadow: "#be123c",
  },
  howmany: {
    emoji: "🔢",
    title: "몇 개일까?",
    sub: "숫자를 골라요",
    bg: "linear-gradient(160deg,#86efac,#22c55e)",
    shadow: "#15803d",
  },
  feed: {
    emoji: "🐰",
    title: "냠냠 먹이 주기",
    sub: "딱 맞게 주세요",
    bg: "linear-gradient(160deg,#fcd34d,#f59e0b)",
    shadow: "#b45309",
  },
  bubbles: {
    emoji: "🫧",
    title: "거품 팡팡",
    sub: "터뜨리며 세어요",
    bg: "linear-gradient(160deg,#7dd3fc,#38bdf8)",
    shadow: "#0369a1",
  },
  find: {
    emoji: "🔍",
    title: "숫자 찾기",
    sub: "숨은 숫자를 찾아요",
    bg: "linear-gradient(160deg,#c4b5fd,#8b5cf6)",
    shadow: "#5b21b6",
  },
  elevator: {
    emoji: "🛗",
    title: "딩동 엘리베이터",
    sub: "몇 층일까요?",
    bg: "linear-gradient(160deg,#5eead4,#14b8a6)",
    shadow: "#0f766e",
  },
  dial: {
    emoji: "📱",
    title: "숫자 따라 누르기",
    sub: "전화기 숫자를 눌러요",
    bg: "linear-gradient(160deg,#fdba74,#f97316)",
    shadow: "#c2410c",
  },
  share: {
    emoji: "🤲",
    title: "쏙쏙 나눠 주기",
    sub: "달라는 만큼 나눠 줘요",
    // 주황은 숫자 따라 누르기, 청록은 엘리베이터가 쓰고 있어서 연두 (꽃밭 장면과도 어울린다)
    bg: "linear-gradient(160deg,#bef264,#65a30d)",
    shadow: "#3f6212",
  },
};

/* ---------- 빙글빙글 (놀이 자동 순환) ---------- */

/**
 * 순환 순서.
 * 집중이 많이 필요한 놀이(몇 개일까 · 숫자 따라 누르기 · 딩동 엘리베이터 · 숫자 찾기) 사이에 몸으로 노는 놀이
 * (거품 팡팡 · 먹이 주기 · 톡톡 세기)를 끼워서 긴장과 이완이 번갈아 오게 한다. 집중 놀이가 하나 더 많아
 * 한 곳(숫자 따라 누르기 → 몇 개일까)은 이어지는데, 버튼을 누르는 두 놀이(숫자 따라 누르기 · 딩동 엘리베이터)는
 * 멀리 떨어뜨렸다. 나눠 주기는 비슷한 먹이 주기와 떨어뜨려 숫자 찾기 뒤에 두고,
 * 한 바퀴의 끝(나눠 주기) 다음은 가장 쉬운 톡톡 세기로 돌아온다.
 */
export const CYCLE_ORDER: GameId[] = ["tap", "dial", "howmany", "bubbles", "elevator", "feed", "find", "share"];

export type CyclePace = "fast" | "normal" | "slow";

export interface CyclePaceSpec {
  label: string;
  desc: string;
  /** 이만큼 성공하면 다음 놀이로 */
  wins: number;
  /** 이 시간 전에는 wins 보다 2번 더 성공해야 넘어간다 (푹 빠져 있을 때 방해하지 않기) */
  minMs: number;
  /** 이 시간이 지나면 성공 횟수가 모자라도 다음 성공 직후 넘어간다 */
  maxMs: number;
  /** 세기만 하면 끝나는 놀이(톡톡 세기·거품 팡팡)는 최소 시간 없이 이만큼 성공하면 바로 다음 놀이로 */
  quickWins: number;
}

export const CYCLE_PACES: Record<CyclePace, CyclePaceSpec> = {
  fast: { label: "빠르게", desc: "2번 성공 · 1분 30초", wins: 2, minMs: 40_000, maxMs: 90_000, quickWins: 1 },
  normal: { label: "보통", desc: "3번 성공 · 2분 30초", wins: 3, minMs: 60_000, maxMs: 150_000, quickWins: 2 },
  slow: { label: "천천히", desc: "5번 성공 · 4분", wins: 5, minMs: 90_000, maxMs: 240_000, quickWins: 3 },
};

export const CYCLE_PACE_IDS: CyclePace[] = ["fast", "normal", "slow"];

export const CYCLE_RULES = {
  /** 어려워하는 신호(실패 보고)가 이만큼 쌓이면, 다음에 성공하자마자 분위기를 바꾼다 */
  missesToSwitch: 2,
  /** 아무것도 안 누르고 이만큼 지나면 흥미를 잃은 것으로 보고 다른 놀이로 (놀이 안의 힌트보다 늦게) */
  idleMs: 35_000,
  /** 라운드가 끝나지 않아도(막 누르기 반복 등) 이 시간이 지나면 넘어간다 */
  hardCapMs: 300_000,
  /** 전환 화면("이번엔 거품 팡팡!")에서 시작 버튼이 나오기까지 적어도 이만큼 (말이 끝나야 나온다) */
  transitionMs: 1500,
  /**
   * 성공(onWin) 뒤 스티커 공개·다음 놀이로 넘어가기까지 적어도 이만큼 축하를 보여 준다.
   * 그 뒤에도 칭찬·"더 큰 숫자 도전!" 을 말하는 중이면 끝날 때까지 기다린다 (그동안 놀이는 멈춰 둔다)
   */
  afterWinMs: 2000,
};

export interface CycleStats {
  wins: number;
  misses: number;
  elapsedMs: number;
}

/** 이 놀이에서 몇 번 성공하면 다음 놀이로 넘어가는지 (순서 띠에 보여 주는 칸 수) */
export function cycleWinsFor(game: GameId, pace: CyclePace): number {
  const p = CYCLE_PACES[pace];
  return isFollowGame(game) ? p.quickWins : p.wins;
}

/** 이번 성공 뒤에 다음 놀이로 넘어갈지 */
export function cycleShouldSwitch(s: CycleStats, pace: CyclePace, game: GameId): boolean {
  const p = CYCLE_PACES[pace];
  if (s.wins < 1) return false; // 적어도 한 번은 성공하고 넘어간다
  // 톡톡 세기·거품 팡팡은 세기만 하면 무조건 성공이라 오래 붙잡지 않는다
  if (isFollowGame(game)) return s.wins >= p.quickWins;
  if (s.misses >= CYCLE_RULES.missesToSwitch) return true; // 어려워했으면 성공한 김에 분위기 전환
  if (s.elapsedMs >= p.maxMs) return true; // 오래 했으면
  if (s.wins >= p.wins + 2) return true; // 아주 잘하고 있어도 한 놀이만 너무 오래 하지 않게
  return s.wins >= p.wins && s.elapsedMs >= p.minMs; // 기본: 정해진 횟수 + 최소 시간
}

export function cycleNextOf(game: GameId): GameId {
  const i = CYCLE_ORDER.indexOf(game);
  return CYCLE_ORDER[(i + 1) % CYCLE_ORDER.length];
}

export type CycleReason = "start" | "next" | "idle";

/** 한 라운드에 나오는 수의 범위 */
export interface CountLevel {
  min: number;
  max: number;
}

/**
 * 문제를 푸는 단계가 없는 놀이(톡톡 세기 · 거품 팡팡)는 세기만 하면 끝나서 스스로 난이도를 잴 수 없다.
 * 그래서 따로 단계를 두지 않고, 문제를 푸는 놀이(몇 개일까 · 먹이 주기 · 숫자 찾기 · 나눠 주기)에서
 * 지금 다루는 가장 큰 수까지 센다.
 */
export const FOLLOW_GAMES: GameId[] = ["tap", "bubbles"];

export function isFollowGame(game: GameId): boolean {
  return FOLLOW_GAMES.includes(game);
}

/** 문제를 푸는 놀이들의 지금 단계에서 나오는 가장 큰 수 */
export function problemMax(levels: Record<GameId, number>): number {
  return Math.max(
    howManyLevel(levels.howmany).max,
    feedLevel(levels.feed).max,
    findLevel(levels.find).max,
    shareLevel(levels.share).max,
  );
}

/** 톡톡 세기: 1~최고 수. 5를 넘으면 너무 작은 수는 빼고 위쪽 60% 정도에서 낸다 */
export function tapRange(maxN: number): CountLevel {
  const max = Math.min(MAX_NUMBER, Math.max(2, maxN));
  const min = max <= 5 ? 1 : Math.max(1, Math.round(max * 0.6));
  return { min, max };
}

/** 거품 팡팡: 최고 수까지 센다 */
export function bubbleTargetFor(maxN: number): number {
  return Math.min(MAX_NUMBER, Math.max(2, maxN));
}

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

/**
 * 딩동 엘리베이터: 손님이 "오 층 눌러 주세요!" 하면 그 층 버튼을 누른다.
 * 엘리베이터는 늘 1층에서 손님을 태우므로 목적지는 2층부터다.
 * - floors: 층 버튼 수 (1~floors 층)
 * - glow: 정답 버튼에 노란 빛을 비춘다 (처음 단계에서만)
 */
export interface ElevatorLevel {
  floors: number;
  glow: boolean;
}

export const ELEVATOR_LEVELS: ElevatorLevel[] = [
  { floors: 5, glow: true },
  { floors: 5, glow: false },
  { floors: 10, glow: false },
  { floors: 15, glow: false },
  { floors: 20, glow: false },
];

/** 엘리베이터 아파트의 꼭대기 층 */
export const ELEVATOR_TOP = 20;

/**
 * 이 층 이상으로 올라갈 때는 층을 한 낱말씩 끊지 않고 이어서 빠르게 센다
 * ("일 이 … 십" 과 "십일 십이 … 십오" 를 한 번에).
 */
export const ELEVATOR_RUN_FROM = 10;

/**
 * 외우기: 여러 번 데려다 준 친구는 가끔 층을 말하지 않고 "우리 집에 데려다 줘!" 한다.
 * 노란 빛이 없는 단계에서만 (빛이 있으면 답이 보이니까)
 */
export const ELEVATOR_MEMORY = {
  /** 이만큼 데려다 준 친구부터 */
  known: 5,
  /** 이 확률로 */
  chance: 0.1,
};

export interface Resident {
  emoji: string;
  name: string;
}

/**
 * 층마다 사는 친구. 늘 같은 층에 살아서 누가 몇 층에 사는지 외울 수 있다.
 * 1층은 병아리네 집(로비)이고, 2층부터 동물 친구 스티커북 순서대로 한 층에 한 친구씩 산다
 * (사자 2층, 토끼 3층, 판다 4층 … 돼지 20층).
 */
export function residentOf(floor: number): Resident {
  const s = floor >= 2 ? STICKERS[floor - 2] : undefined;
  return s ? { emoji: s.emoji, name: s.name } : { emoji: "🐤", name: "병아리" };
}

/**
 * 쏙쏙 나눠 주기: 아이가 가진 개수(max)가 단계마다 늘고, 친구는 1개부터 가진 개수까지 아무 수나 달라고 한다.
 * 끌거나 눌러서 준 뒤 "다 줬어요" 를 눌러야 끝난다.
 */
export const SHARE_LEVELS: CountLevel[] = [2, 3, 5, 7, 10, 15, 20].map((have) => ({ min: 1, max: have }));

/* ---------- 숫자 따라 누르기 (전화기 키패드) ---------- */

/** 전화기 키패드의 버튼 (지우기·전화 버튼 빼고) */
export type DialKey = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "*" | "0" | "#";

/** 키패드 배치 (전화기처럼 1 2 3 / 4 5 6 / 7 8 9 / 별 0 샵) */
export const DIAL_ROWS: DialKey[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

export const DIAL_KEYS: DialKey[] = DIAL_ROWS.flat();
const DIAL_DIGITS: DialKey[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** 버튼 이름 (한 자리씩 읽는다: 12 → "일", "이") */
export const DIAL_KEY_NAMES: Record<DialKey, string> = {
  "1": "일",
  "2": "이",
  "3": "삼",
  "4": "사",
  "5": "오",
  "6": "육",
  "7": "칠",
  "8": "팔",
  "9": "구",
  "0": "영",
  "*": "별",
  "#": "샵",
};

/** 버튼 글자 색. 1~9 는 다른 놀이의 숫자 색과 같고, 별은 금색 */
export const DIAL_KEY_COLORS: Record<DialKey, string> = {
  "1": NUM_COLORS[0],
  "2": NUM_COLORS[1],
  "3": NUM_COLORS[2],
  "4": NUM_COLORS[3],
  "5": NUM_COLORS[4],
  "6": NUM_COLORS[5],
  "7": NUM_COLORS[6],
  "8": NUM_COLORS[7],
  "9": NUM_COLORS[8],
  "0": "#64748B",
  "*": "#F59E0B",
  "#": "#0891B2",
};

/**
 * 숫자 따라 누르기 단계.
 * - digits: 눌러야 할 자리 수
 * - guide: 다음에 누를 버튼을 노랗게 알려 준다
 * - special: 별·샵이 섞이는지 (always = 꼭 하나, some = 절반쯤 하나, none = 숫자만)
 */
export interface DialLevel {
  digits: number;
  guide: boolean;
  special: "none" | "always" | "some";
}

export const DIAL_LEVELS: DialLevel[] = [
  { digits: 2, guide: true, special: "none" },
  { digits: 2, guide: false, special: "none" },
  { digits: 3, guide: false, special: "none" },
  { digits: 3, guide: false, special: "always" },
  { digits: 4, guide: false, special: "some" },
  { digits: 5, guide: false, special: "some" },
  { digits: 6, guide: false, special: "some" },
  { digits: 7, guide: false, special: "some" },
  { digits: 8, guide: false, special: "some" },
];

/**
 * 이번에 누를 번호. 같은 버튼이 바로 이어서 나오지 않게 한다
 * (같은 버튼을 두 번 누르면 눌렸는지 헷갈린다). 별·샵은 한 번만.
 */
export function dialNumber(lv: DialLevel): DialKey[] {
  const specialAt =
    lv.special === "always" || (lv.special === "some" && Math.random() < 0.5)
      ? randomInt(0, lv.digits - 1)
      : -1;
  const out: DialKey[] = [];
  for (let i = 0; i < lv.digits; i++) {
    const pool = i === specialAt ? (["*", "#"] as DialKey[]) : DIAL_DIGITS;
    out.push(pick(pool.filter((k) => k !== out[i - 1])));
  }
  return out;
}

/** 번호를 보기 좋게 끊어서 보여 줄 자리 (전화번호처럼 3-4, 4-4). 끊는 자리 앞의 인덱스들 */
export function dialGroupBreaks(len: number): number[] {
  if (len <= 4) return [];
  return [len <= 6 ? Math.floor(len / 2) : len - 4];
}

export const MAX_LEVELS: Record<GameId, number> = {
  tap: 1,
  howmany: HOWMANY_LEVELS.length,
  feed: FEED_LEVELS.length,
  bubbles: 1,
  find: FIND_LEVELS.length,
  elevator: ELEVATOR_LEVELS.length,
  dial: DIAL_LEVELS.length,
  share: SHARE_LEVELS.length,
};

export function clampLevel(game: GameId, level: number): number {
  const max = MAX_LEVELS[game];
  if (!Number.isFinite(level)) return 1;
  return Math.min(max, Math.max(1, Math.round(level)));
}

export function feedLevel(level: number): FeedLevel {
  return FEED_LEVELS[clampLevel("feed", level) - 1];
}

export function howManyLevel(level: number): HowManyLevel {
  return HOWMANY_LEVELS[clampLevel("howmany", level) - 1];
}

export function findLevel(level: number): FindLevel {
  return FIND_LEVELS[clampLevel("find", level) - 1];
}

export function elevatorLevel(level: number): ElevatorLevel {
  return ELEVATOR_LEVELS[clampLevel("elevator", level) - 1];
}

export function dialLevel(level: number): DialLevel {
  return DIAL_LEVELS[clampLevel("dial", level) - 1];
}

export function shareLevel(level: number): CountLevel {
  return SHARE_LEVELS[clampLevel("share", level) - 1];
}

/** 설정 화면에 보여 줄 단계 설명 (톡톡 세기·거품 팡팡은 levels 전체를 보고 정한다) */
export function levelLabel(game: GameId, levels: Record<GameId, number>): string {
  const level = levels[game];
  switch (game) {
    case "tap": {
      const s = tapRange(problemMax(levels));
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
      return `${bubbleTargetFor(problemMax(levels))}까지`;
    case "find": {
      const s = findLevel(level);
      const kinds = s.prompts.map((p) => FIND_PROMPT_LABELS[p]).join("·");
      return `${s.min}~${s.max} · ${s.items}개 중 · ${kinds} 찾기${s.near ? " · 비슷한 수" : ""}`;
    }
    case "elevator": {
      const s = elevatorLevel(level);
      return `1~${s.floors}층 · ${s.glow ? "노란 빛 도움" : "듣고 누르기 · 가끔 외우기"}`;
    }
    case "dial": {
      const s = dialLevel(level);
      const special = s.special === "always" ? " · 별·샵" : s.special === "some" ? " · 별·샵 가끔" : "";
      return `${s.digits}자리${s.guide ? " · 누를 버튼 노랗게" : ""}${special}`;
    }
    case "share": {
      const s = shareLevel(level);
      return `${s.max}개 가지고 ${s.min}~${s.max}개 주기`;
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

let lastPraise = "";

/** 칭찬 한 마디 (바로 앞과 같은 말은 피한다) */
export function randomPraise(): string {
  lastPraise = pick(PRAISES, lastPraise);
  return lastPraise;
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

/** 접속 조사 과/와 ("일과", "이와") */
export function conj(word: string): string {
  return word + (hasBatchim(word) ? "과" : "와");
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

/* ---------- 축하 · 놀이 시간 ---------- */

/** 이 확률로 "보너스 별" (별 2개 + 특별 축하). 첫 성공에는 주지 않는다 */
export const BONUS_CHANCE = 1 / 6;

/** 부모 설정: 놀이 시간 알림 (분, 0 = 끔) */
export const SESSION_LIMITS = [0, 10, 15, 20];

/** "별 다섯 개" (19 를 넘으면 숫자 그대로) */
export function starPhrase(n: number): string {
  return n >= 1 && n <= MAX_NUMBER ? `별 ${counterPhrase(n, "개")}` : `별 ${n}개`;
}
