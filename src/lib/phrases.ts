/*
 * 앱이 말하는 모든 문장을 한곳에 모은 카탈로그.
 * - 게임 코드는 문장을 직접 만들지 않고 P.* 를 쓴다.
 * - allPhrases() 가 나올 수 있는 모든 문장을 열거하고, scripts/gen-voice.ts 가 이것으로 음성 파일을 만든다.
 * - 이름·수가 들어간 문장은 억양이 자연스럽도록 문장 통째로 만들고,
 *   칭찬처럼 아무 문장 뒤에나 붙는 말은 따로 만들어 이어서 재생한다 (조합 수가 터지지 않게).
 */
import {
  ALBUMS,
  ANIMALS,
  COUNT_WORDS,
  CYCLE_ORDER,
  ELEVATOR_TOP,
  GAME_META,
  ITEMS,
  MAX_NUMBER,
  PRAISES,
  SCENE_MAX,
  SLOW_PHRASES,
  STICKERS,
  copula,
  counterPhrase,
  numeralName,
  obj,
  randomInt,
  residentOf,
  starPhrase,
  subj,
  topic,
  type CountItem,
  type CycleReason,
  type GameId,
} from "./data";

/** 이어서 말할 문장들 (앞에서부터 차례로) */
export type Line = string[];

/* ---------- 문장 ---------- */

function cycleName(game: GameId) {
  const name = GAME_META[game].title;
  return { name, bang: name.endsWith("?") ? "" : "!" }; // "몇 개일까?!" 가 되지 않게
}

export const P = {
  /** 셈말: 하나, 둘, 셋 … */
  count: (n: number) => COUNT_WORDS[n - 1],

  /* 공통 */
  /** "사과 세 개!" */
  itemCount: (item: CountItem, n: number) => `${item.name} ${counterPhrase(n, item.counter)}!`,
  tapAgain: "천천히, 하나씩 눌러 봐!",

  /* 톡톡 세기 */
  tapIntro: (item: CountItem) => `${item.name} 몇 ${item.counter}? 하나씩 눌러 봐!`,

  /* 몇 개일까 */
  howManyIntro: (item: CountItem) => `${item.name} 몇 ${item.counter}일까?`,
  howManyAgain: (counter: string) => `몇 ${counter}일까?`,
  countTogether: "같이 세어 볼까?",
  right: "맞았어요!",
  wrongCountTogether: "음, 다시 같이 세어 볼까?",
  sameColor: "이제 같은 색 숫자를 눌러 봐!",
  lookAndPress: "천천히 보고, 숫자를 눌러 봐!",

  /* 먹이 주기 (동물이 말하는 문장은 동물 목소리) */
  feedAsk: (food: CountItem, n: number) => `${food.name} ${counterPhrase(n, food.counter)} 주세요!`,
  guestHello: (name: string) => `${subj(name)} 놀러 왔어!`,
  feedSlow: (food: CountItem) => `천천히, ${food.name} 하나씩 줘 봐!`,
  feedThanks: (food: CountItem, n: number) => `냠냠, ${food.name} ${counterPhrase(n, food.counter)}! 고마워!`,
  tooFull: "배불러요! 그만 주세요!",
  pressGreen: "다 줬으면 초록 버튼을 눌러 줘!",
  stillHungry: "아직 배고파요! 더 주세요!",

  /* 거품 팡팡 */
  bubbleIntro: "거품을 톡톡 터뜨리면서 같이 세어 보자!",
  bubbleAgain: "천천히, 하나씩 터뜨려 봐!",
  bubbleDone: (n: number) => `와! ${COUNT_WORDS[n - 1]}까지 다 셌어요!`,

  /* 숫자 찾기 */
  /** "숫자 오를 찾아줘!" */
  findNumeral: (n: number) => `숫자 ${obj(numeralName(n))} 찾아줘!`,
  /** "다섯 개를 뜻하는 숫자를 찾아줘!" */
  findCount: (n: number, counter: string) => `${obj(counterPhrase(n, counter))} 뜻하는 숫자를 찾아줘!`,
  findWinNumeral: (n: number) => `찾았다! 숫자 ${numeralName(n)}!`,
  findWinCount: (n: number, counter: string) =>
    `맞아! ${topic(counterPhrase(n, counter))} 숫자 ${numeralName(n)}!`,
  /** "이건 숫자 일이야." */
  findWrong: (n: number) => `이건 숫자 ${copula(numeralName(n))}.`,
  hereMaybe: "여기 있을까?",
  lookSlowly: "천천히 봐!",

  /* 딩동 엘리베이터 (손님이 말하는 문장은 동물 목소리) */
  /** "사자가 탔어요!" */
  elevatorBoard: (name: string) => `${subj(name)} 탔어요!`,
  /** 손님: "오 층 눌러 주세요!" */
  elevatorAsk: (floor: number) => `${numeralName(floor)} 층 눌러 주세요!`,
  /** 손님 (외우기): 층을 말하지 않는다 */
  elevatorAskHome: "우리 집에 데려다 줘!",
  /** 손님: "우리 집은 오 층이에요!" */
  elevatorHomeIs: (floor: number) => `우리 집은 ${numeralName(floor)} 층이에요!`,
  /** 층을 지나며 세는 말: 일, 이, 삼 … */
  elevatorCount: (floor: number) => numeralName(floor),
  /**
   * 여러 층을 한 번에 이어 세는 말: "일 이 삼 … 십", "십일 십이 … 십오".
   * 쉼표를 넣으면 층마다 길게 쉬어서 오히려 느려진다
   */
  elevatorCountRun: (from: number, to: number) => range(from, to).map(numeralName).join(" "),
  /** "오 층입니다!" */
  elevatorArrive: (floor: number) => `${numeralName(floor)} 층입니다!`,
  /** 다른 층에서 문이 열렸을 때: "여기는 삼 층, 토끼네 집이야!" */
  elevatorVisit: (floor: number, name: string) => `여기는 ${numeralName(floor)} 층, ${name}네 집이야!`,
  /** 손님 */
  elevatorNotHere: "여기가 아니에요!",
  /** 손님 */
  elevatorThanks: "우리 집이다! 고마워!",

  /* 홈 */
  greetings: ["안녕! 같이 숫자 세어 볼까?", "삐약! 오늘도 재미있게 놀자!", "하나, 둘, 셋! 준비됐어?"],
  missedYou: "다시 왔구나! 보고 싶었어!",
  buddyWaiting: (yesterday: boolean, name: string) =>
    `${yesterday ? "어제" : "지난번에"} 만난 ${subj(name)} 기다리고 있었어!`,
  todayStars: (n: number) =>
    n <= MAX_NUMBER ? `오늘 ${starPhrase(n)} 모았어! 더 놀자!` : "오늘 별을 아주 많이 모았어! 더 놀자!",
  buddyPlay: (name: string) => `${name}도 같이 놀자!`,

  /* 스티커북 */
  moreStars: "별을 더 모으면 만날 수 있어요!",
  stickerHop: (name: string) => `${name}, 폴짝!`,
  stickerName: (name: string) => `${name}!`,
  countScene: "같이 세어 보자!",
  friendsTotal: (n: number) => `친구들이 모두 ${COUNT_WORDS[n - 1]}!`,

  /* 오늘은 여기까지 */
  bye: (stars: number, newFriends: string[]): Line => {
    const out = ["오늘은 여기까지!"];
    if (stars > 0) {
      out.push(stars <= MAX_NUMBER ? `${starPhrase(stars)}나 모았어!` : "별을 아주 많이 모았어!");
      if (newFriends.length === 1) out.push(`새 친구 ${newFriends[0]}도 만났지?`);
      else if (newFriends.length > 1) out.push("새 친구들도 만났지?");
    }
    out.push("내일 또 만나!");
    return out;
  },

  /* 새 스티커 */
  revealShiny: (name: string) => `우와! ${name} 스티커가 반짝반짝해졌어요!`,
  revealAlbum: (album: string, name: string) => `와! 새 스티커북이 열렸어요! ${album}! 첫 번째 친구는 ${name}!`,
  revealNew: (name: string) => `와! 새 친구가 왔어요! ${name}!`,
  /** 새 스티커를 보여 주기 전에, 선물 상자를 눌러 열어 보게 한다 */
  gift: "선물이 왔어요! 눌러 봐!",

  /* 레벨업 · 빙글빙글 */
  levelUp: "우와, 더 큰 숫자에 도전!",
  cycleVariants: (game: GameId, reason: CycleReason): string[] => {
    const { name, bang } = cycleName(game);
    if (reason === "start") return [`먼저 ${name}${bang}`];
    if (reason === "idle") return [`다른 놀이 해 볼까? 이번엔 ${name}${bang}`];
    return [`이번엔 ${name}${bang}`, `다음은 ${name}${bang}`, `${name} 하러 가자!`];
  },
  cycle: (game: GameId, reason: CycleReason): string => {
    const v = P.cycleVariants(game, reason);
    return v[randomInt(0, v.length - 1)];
  },
};

/* ---------- 음성 파일 카탈로그 ---------- */

/** 누가 말하는지: 병아리(해설) / 먹이를 달라는 동물 손님 */
export type Role = "narrator" | "animal";

/** 어떻게 말하는지 (생성할 때 목소리 연기 지시로 쓴다) */
export type Style = "count" | "countRun" | "cheer" | "talk" | "ask";

export interface PhraseSpec {
  text: string;
  role: Role;
  style: Style;
  /** 자주 나오는 짧은 문장. 앱과 함께 미리 받아 둔다 (오프라인에서도 바로) */
  core: boolean;
}

/** TTS 가 그대로 읽어 버리는 기호(물결표, 따옴표, 괄호 등) */
const SPEECH_SYMBOLS = /[~∼～'"“”‘’()[\]{}*·•…_|<>^`#]/g;

/** 말할 문장 정리. 음성 파일을 찾는 열쇠로도 쓴다 */
export function cleanForSpeech(text: string): string {
  return text.replace(SPEECH_SYMBOLS, " ").replace(/\s+/g, " ").trim();
}

function uniqueBy<T>(xs: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  return xs.filter((x) => {
    const k = key(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/** 앱이 말할 수 있는 모든 문장 (같은 문장은 처음 것만) */
export function allPhrases(): PhraseSpec[] {
  const out: PhraseSpec[] = [];
  const add = (text: string, style: Style, core = false, role: Role = "narrator") =>
    out.push({ text: cleanForSpeech(text), role, style, core });

  const nums = range(1, MAX_NUMBER);
  const counters = uniqueBy(ITEMS, (i) => i.counter).map((i) => i.counter);
  const foods = uniqueBy(
    [...ANIMALS.map((a) => a.food), ...STICKERS.flatMap((s) => (s.food ? [s.food] : []))],
    (f) => f.name,
  );
  const names = uniqueBy(STICKERS, (s) => s.name).map((s) => s.name);
  const guests = uniqueBy(
    STICKERS.filter((s) => s.food),
    (s) => s.name,
  ).map((s) => s.name);

  // 자주 나오는 짧은 말 (미리 받아 둔다)
  nums.forEach((n) => add(P.count(n), "count", true));
  PRAISES.forEach((p) => add(p, "cheer", true));
  SLOW_PHRASES.forEach((p) => add(p, "talk", true));
  [
    P.tapAgain,
    P.countTogether,
    P.wrongCountTogether,
    P.sameColor,
    P.lookAndPress,
    P.pressGreen,
    P.bubbleIntro,
    P.bubbleAgain,
    P.hereMaybe,
    P.lookSlowly,
    P.missedYou,
    P.moreStars,
    P.countScene,
    P.levelUp,
    "오늘은 여기까지!",
    "새 친구들도 만났지?",
    "내일 또 만나!",
    "별을 아주 많이 모았어!",
    ...P.greetings,
  ].forEach((t) => add(t, "talk", true));
  add(P.right, "cheer", true);
  add(P.gift, "cheer", true);
  add(P.tooFull, "talk", true, "animal");
  add(P.stillHungry, "ask", true, "animal");
  CYCLE_ORDER.forEach((g) =>
    (["start", "next", "idle"] as CycleReason[]).forEach((r) =>
      P.cycleVariants(g, r).forEach((t) => add(t, "cheer", true)),
    ),
  );

  // 물건 × 수
  ITEMS.forEach((item) => {
    add(P.tapIntro(item), "ask");
    add(P.howManyIntro(item), "ask");
    nums.forEach((n) => add(P.itemCount(item, n), "cheer"));
  });
  counters.forEach((c) => {
    add(P.howManyAgain(c), "ask");
    nums.forEach((n) => {
      add(P.findCount(n, c), "ask");
      add(P.findWinCount(n, c), "cheer");
    });
  });
  nums.forEach((n) => {
    add(P.findNumeral(n), "ask");
    add(P.findWinNumeral(n), "cheer");
    add(P.findWrong(n), "talk");
    add(P.bubbleDone(n), "cheer");
    add(P.todayStars(n), "talk");
    add(`${starPhrase(n)}나 모았어!`, "cheer");
  });
  add(P.todayStars(MAX_NUMBER + 1), "talk");

  // 딩동 엘리베이터: 층 × 그 층에 사는 친구
  add(P.elevatorAskHome, "ask", true, "animal");
  add(P.elevatorNotHere, "talk", true, "animal");
  add(P.elevatorThanks, "cheer", true, "animal");
  range(1, ELEVATOR_TOP).forEach((f) => {
    add(P.elevatorCount(f), "count", true);
    add(P.elevatorVisit(f, residentOf(f).name), "talk");
  });
  add(P.elevatorCountRun(1, 10), "countRun");
  range(12, ELEVATOR_TOP).forEach((f) => add(P.elevatorCountRun(11, f), "countRun"));
  range(2, ELEVATOR_TOP).forEach((f) => {
    add(P.elevatorBoard(residentOf(f).name), "talk");
    add(P.elevatorAsk(f), "ask", false, "animal");
    add(P.elevatorHomeIs(f), "talk", false, "animal");
    add(P.elevatorArrive(f), "cheer");
  });
  range(1, SCENE_MAX).forEach((n) => add(P.friendsTotal(n), "cheer"));

  // 먹이 × 수
  foods.forEach((food) => {
    add(P.feedSlow(food), "talk");
    nums.forEach((n) => {
      add(P.feedAsk(food, n), "ask", false, "animal");
      add(P.feedThanks(food, n), "cheer", false, "animal");
    });
  });
  guests.forEach((name) => add(P.guestHello(name), "cheer"));

  // 스티커 친구 이름
  names.forEach((name) => {
    add(P.buddyWaiting(true, name), "talk");
    add(P.buddyWaiting(false, name), "talk");
    add(P.buddyPlay(name), "cheer");
    add(P.stickerHop(name), "cheer");
    add(P.stickerName(name), "cheer");
    add(`새 친구 ${name}도 만났지?`, "talk");
    add(P.revealShiny(name), "cheer");
    add(P.revealNew(name), "cheer");
  });
  ALBUMS.slice(1).forEach((a) => add(P.revealAlbum(a.title, STICKERS[a.start].name), "cheer"));

  return uniqueBy(out, (p) => p.text);
}
