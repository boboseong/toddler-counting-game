import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { playDing, playSoft, speak, speakDuration } from "../lib/audio";
import {
  ITEMS,
  NUM_COLORS,
  copula,
  counterPhrase,
  findDistractors,
  findLevel,
  mashLimitFor,
  numeralName,
  obj,
  pick,
  randomIntExcept,
  randomPraise,
  randomSlowPhrase,
  shuffle,
  subj,
  topic,
  type CountItem,
  type FindPrompt,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { useRoundGuard } from "../hooks/useRoundGuard";
import {
  BigNumeral,
  GameFrame,
  ListenChip,
  SlowBanner,
  SpeechBubble,
  TopBar,
  WinBanner,
} from "../components/ui";
import type { GameProps } from "../types";

/* ---------- 숫자가 숨는 장면 ---------- */

type ShapeKind = "balloon" | "star" | "egg" | "cloud";

interface Theme {
  kind: ShapeKind;
  emoji: string;
  name: string;
}

const THEMES: Theme[] = [
  { kind: "balloon", emoji: "🎈", name: "풍선" },
  { kind: "star", emoji: "⭐", name: "별" },
  { kind: "egg", emoji: "🥚", name: "알" },
  { kind: "cloud", emoji: "☁️", name: "구름" },
];

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
}

const STAR_POINTS = starPoints(50, 56, 52, 23);

/** 숫자가 적힌 풍선/별/알/구름 (viewBox 100×120, 풍선 줄까지 포함) */
function NumberShape({ kind, color, n }: { kind: ShapeKind; color: string; n: number }) {
  let body: ReactNode;
  let baseline: number;
  switch (kind) {
    case "balloon":
      body = (
        <>
          <path
            d="M50 99 q 12 8 0 21"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <ellipse cx="50" cy="46" rx="43" ry="46" fill={color} />
          <ellipse
            cx="33"
            cy="27"
            rx="9"
            ry="14"
            fill="#fff"
            opacity="0.4"
            transform="rotate(-22 33 27)"
          />
          <polygon points="50,91 43,101 57,101" fill={color} />
        </>
      );
      baseline = 63;
      break;
    case "star":
      body = (
        <polygon
          points={STAR_POINTS}
          fill={color}
          stroke="#fff"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      );
      baseline = 72;
      break;
    case "egg":
      body = (
        <>
          <path
            d="M50 4 C 22 4 8 44 8 68 C 8 96 28 116 50 116 C 72 116 92 96 92 68 C 92 44 78 4 50 4 Z"
            fill={color}
          />
          <ellipse
            cx="35"
            cy="34"
            rx="8"
            ry="14"
            fill="#fff"
            opacity="0.4"
            transform="rotate(-15 35 34)"
          />
        </>
      );
      baseline = 86;
      break;
    case "cloud":
      body = (
        <>
          <circle cx="28" cy="70" r="24" fill={color} />
          <circle cx="52" cy="50" r="31" fill={color} />
          <circle cx="76" cy="70" r="24" fill={color} />
          <rect x="12" y="70" width="76" height="24" rx="12" fill={color} />
          <circle cx="40" cy="36" r="8" fill="#fff" opacity="0.4" />
        </>
      );
      baseline = 82;
      break;
  }
  const fontSize = n >= 10 ? 42 : 50;
  return (
    <svg
      viewBox="0 0 100 120"
      className="h-full w-full overflow-visible drop-shadow-[0_6px_0_rgba(0,0,0,0.12)]"
      aria-hidden
    >
      {body}
      <text
        x="50"
        y={baseline + 2.5}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="bold"
        fill="rgba(0,0,0,0.22)"
        fontFamily="inherit"
      >
        {n}
      </text>
      <text
        x="50"
        y={baseline}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="bold"
        fill="#fff"
        fontFamily="inherit"
      >
        {n}
      </text>
    </svg>
  );
}

/* ---------- 라운드 ---------- */

interface Spot {
  n: number;
  /** 격자에서 몇 번째 칸인지 (행 우선). 화면이 돌아가면 칸 모양만 다시 계산한다 */
  rank: number;
  /** 칸 안에서 조금씩 흔들어 놓은 정도 (-0.15~0.15) */
  jx: number;
  jy: number;
  /** 둥실거림이 서로 어긋나도록 */
  bobDelay: number;
}

interface Round {
  id: number;
  target: number;
  prompt: FindPrompt;
  theme: Theme;
  /** count 문제에서 보여 줄 물건 */
  item: CountItem;
  spots: Spot[];
}

type Phase = "play" | "done" | "slow";

/** 숫자를 겹치지 않게 흩어 놓기: 칸 순서를 섞고, 칸 안에서 조금씩 흔든다 */
function makeSpots(numbers: number[]): Spot[] {
  const ranks = shuffle(numbers.map((_, i) => i));
  return numbers.map((num, i) => ({
    n: num,
    rank: ranks[i],
    // 칸 안에서 ±15% 만 흔들어서 이웃끼리 닿지 않게
    jx: (Math.random() - 0.5) * 0.3,
    jy: (Math.random() - 0.5) * 0.3,
    bobDelay: Math.random() * 1.4,
  }));
}

/** 세로 화면은 2~3열(최대 3줄), 가로 화면은 2~5열(최대 2줄) */
function gridFor(n: number, portrait: boolean) {
  const cols = portrait ? (n <= 6 ? 2 : 3) : n <= 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : 5;
  return { cols, rows: Math.ceil(n / cols) };
}

/** 놀이판 안에서의 위치 (0~1, 가운데 기준). 마지막 줄은 가운데로 모은다 */
function spotPos(s: Spot, n: number, portrait: boolean) {
  const { cols, rows } = gridFor(n, portrait);
  const r = Math.floor(s.rank / cols);
  const c = s.rank % cols;
  const inRow = r === rows - 1 ? n - r * cols : cols;
  const offset = (cols - inRow) / 2;
  return { x: (c + offset + 0.5 + s.jx) / cols, y: (r + 0.5 + s.jy) / rows };
}

function isPortrait() {
  return window.innerHeight >= window.innerWidth;
}

/** 말할 문장과 보여 줄 문장 */
function textsFor(r: Round) {
  const name = numeralName(r.target); // "오"
  const particle = obj(name).slice(name.length); // 을/를
  if (r.prompt === "count") {
    const phrase = counterPhrase(r.target, r.item.counter); // "다섯 개"
    const ask = `${obj(phrase)} 뜻하는 숫자를 찾아줘!`;
    return {
      intro: `${subj(r.item.name)} ${phrase}! ${ask}`,
      ask,
      particle,
      win: `맞아! ${topic(phrase)} 숫자 ${name}!`,
    };
  }
  const ask = `숫자 ${name}${particle} 찾아줘!`;
  return { intro: ask, ask, particle, win: `찾았다! 숫자 ${name}!` };
}

const PLAY_STYLE = {
  "--fs": "clamp(60px, min(21vw, 16vh), 120px)",
  "--fsh": "calc(clamp(60px, min(21vw, 16vh), 120px) * 1.2)",
} as CSSProperties;

export default function FindGame({ level, stars, tapGap, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
  const guard = useRoundGuard(tapGap);
  const prev = useRef<{ target?: number; prompt?: FindPrompt; theme?: Theme; item?: CountItem }>({});
  const idleTimer = useRef<number | null>(null);
  const levelRef = useRef(level);
  levelRef.current = level;

  const newRound = (id: number): Round => {
    const lv = findLevel(levelRef.current);
    const target = randomIntExcept(lv.min, lv.max, prev.current.target);
    const prompt = pick(lv.prompts, prev.current.prompt);
    const theme = pick(THEMES, prev.current.theme);
    const item = pick(ITEMS, prev.current.item);
    prev.current = { target, prompt, theme, item };
    const numbers = shuffle([target, ...findDistractors(target, lv)]);
    return { id, target, prompt, theme, item, spots: makeSpots(numbers) };
  };

  const [round, setRound] = useState<Round>(() => newRound(0));
  const [phase, setPhaseState] = useState<Phase>("play");
  const [wrongN, setWrongN] = useState<number | null>(null);
  const [wobble, setWobble] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [found, setFound] = useState(false);
  const [banner, setBanner] = useState(false);
  const [praise, setPraise] = useState("");
  const [slowText, setSlowText] = useState("");
  const [portrait, setPortrait] = useState(isPortrait);

  // 화면을 돌리면 격자 모양을 바꿔서 숫자가 겹치지 않게 다시 놓는다
  useEffect(() => {
    const onResize = () => setPortrait(isPortrait());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const roundIdRef = useRef(round.id);
  roundIdRef.current = round.id;
  const phaseRef = useRef<Phase>("play");
  const wrongs = useRef(0);
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  const texts = textsFor(round);

  const clearIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = null;
  };

  /** 한참 못 찾으면 정답이 살짝 커졌다 작아지며 알려 준다 */
  const giveHint = () => {
    if (phaseRef.current !== "play") return;
    setHint(true);
    setRevealed(true);
    speak(`${texts.ask} 여기 있을까?`);
  };

  const scheduleIdleHint = () => {
    clearIdle();
    const wait = 9000 + round.spots.length * 700 + (round.prompt === "count" ? round.target * 400 : 0);
    idleTimer.current = window.setTimeout(giveHint, wait);
  };

  useEffect(() => {
    guard.lock(400 + speakDuration(texts.intro));
    after(400, () => speak(texts.intro, { interrupt: false }));
    scheduleIdleHint();
    return clearIdle;
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetRoundState = () => {
    wrongs.current = 0;
    guard.resetRound();
    setWrongN(null);
    setWobble(null);
    setHint(false);
    setRevealed(false);
    setFound(false);
    setBanner(false);
    setPhase("play");
  };

  const nextRound = () => {
    clearAll();
    clearIdle();
    resetRoundState();
    setRound((r) => newRound(r.id + 1));
  };

  const slowRound = () => {
    clearIdle();
    setPhase("slow");
    const s = randomSlowPhrase();
    setSlowText(s);
    playSoft();
    speak(s, { interrupt: false });
    after(3000, () => {
      resetRoundState();
      const again = `천천히 보고, ${texts.ask}`;
      guard.lock(speakDuration(again));
      speak(again);
      scheduleIdleHint();
    });
  };

  const handleTap = (rid: number, n: number) => {
    if (rid !== roundIdRef.current) return;
    if (phaseRef.current !== "play") {
      guard.noteIgnored();
      return;
    }
    if (!guard.accept()) return;
    clearIdle();

    if (n === round.target) {
      if (guard.isMashing(mashLimitFor(round.spots.length))) {
        slowRound();
        return;
      }
      setPhase("done");
      setFound(true);
      setWrongN(null);
      const p = randomPraise();
      setPraise(p);
      playDing();
      if (wrongs.current === 0) onResult(true);
      after(600, () => {
        speak(`${texts.win} ${p}`, { interrupt: false, pitch: 1.25 });
        setBanner(true);
        onWin();
      });
      after(4200, nextRound);
      return;
    }

    // 오답: 흔들리면서 "이건 숫자 1이야. 숫자 5를 찾아줘!"
    wrongs.current += 1;
    playSoft();
    setWobble(n);
    setWrongN(n);
    setRevealed(true);
    if (wrongs.current === 1) onResult(false);
    if (wrongs.current >= 2) setHint(true);
    const say = `이건 숫자 ${copula(numeralName(n))}. ${texts.ask}`;
    guard.lock(speakDuration(say));
    speak(say);
    after(600, () => setWobble(null));
    scheduleIdleHint();
  };

  const { target, prompt, theme, item, spots } = round;
  const locked = guard.locked;
  const wrongSuffix = wrongN !== null ? copula(numeralName(wrongN)).slice(numeralName(wrongN).length) : "";

  /* 말풍선 내용 */
  let bubble: ReactNode;
  const askLine =
    prompt === "count" ? (
      <span>{texts.ask}</span>
    ) : (
      <span className="flex items-center">
        <span className="mr-2">숫자</span>
        <BigNumeral n={target} className="text-[1.6em]" />
        <span>{texts.particle} 찾아줘!</span>
      </span>
    );
  if (wrongN !== null) {
    bubble = (
      <div className="flex flex-col items-center gap-1">
        <span className="flex items-center text-rose-500">
          <span className="mr-2">이건 숫자</span>
          <BigNumeral n={wrongN} className="text-[1.6em]" />
          <span>{wrongSuffix}.</span>
        </span>
        {askLine}
      </div>
    );
  } else if (prompt === "count") {
    const cls =
      target > 10 ? "text-lg sm:text-xl" : target > 5 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";
    bubble = (
      <div className="flex flex-col items-center gap-1.5">
        <div className={target > 5 ? "grid grid-cols-5 gap-x-1.5 gap-y-0.5" : "flex gap-1.5"}>
          {Array.from({ length: target }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 400 }}
              className={`emoji ${cls}`}
            >
              {item.emoji}
            </motion.span>
          ))}
        </div>
        {askLine}
      </div>
    );
  } else if (prompt === "show" || revealed) {
    bubble = askLine;
  } else {
    bubble = (
      <span className="flex items-center gap-2">
        <span className="emoji">👂</span>
        <span>잘 듣고 숫자를 찾아 봐!</span>
      </span>
    );
  }

  return (
    <GameFrame>
      <TopBar onHome={onHome} stars={stars} title="숫자 찾기" emoji="🔍" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-3 pt-2 short:pb-2 short:pt-0">
        {/* 질문 */}
        <div className="flex items-center justify-center gap-3">
          <span className="emoji text-5xl sm:text-6xl short:text-3xl">🐥</span>
          <SpeechBubble
            tail="left"
            className="break-keep text-center text-xl sm:text-2xl short:px-4 short:py-1.5 short:text-base"
          >
            {bubble}
          </SpeechBubble>
        </div>

        {/* 놀이판: 숫자들이 숨어 있는 곳 */}
        <div className="relative mt-2 min-h-0 flex-1" style={PLAY_STYLE}>
          <AnimatePresence mode="wait">
            <motion.div
              key={round.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
            >
              {spots.map((s, i) => {
                const pos = spotPos(s, spots.length, portrait);
                const isTarget = s.n === target;
                const color = NUM_COLORS[(s.n - 1) % NUM_COLORS.length];
                const dimmed = locked && phase === "play";
                const pulse = hint && isTarget && !found;
                const animate = found
                  ? isTarget
                    ? { scale: [1, 1.6, 1.4], rotate: [0, -10, 10, 0], opacity: 1 }
                    : { scale: 0.7, opacity: 0.2 }
                  : wobble === s.n
                    ? { rotate: [0, -16, 16, -12, 12, 0], scale: 1, opacity: 1 }
                    : pulse
                      ? { scale: [1, 1.22, 1], rotate: 0, opacity: 1 }
                      : { scale: 1, rotate: 0, opacity: dimmed ? 0.55 : 1 };
                const transition = found
                  ? { type: "spring" as const, stiffness: 260, damping: 16 }
                  : wobble === s.n
                    ? { duration: 0.5 }
                    : pulse
                      ? { duration: 0.9, repeat: Infinity }
                      : { type: "spring" as const, stiffness: 260, damping: 18, delay: i * 0.1 };
                return (
                  <motion.button
                    key={s.n}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={animate}
                    transition={transition}
                    whileTap={{ scale: 0.9 }}
                    onPointerDown={() => handleTap(round.id, s.n)}
                    aria-label={`숫자 ${s.n}`}
                    className="absolute h-[var(--fsh)] w-[var(--fs)]"
                    style={{
                      left: `calc(var(--fs) / 2 + (100% - var(--fs)) * ${pos.x.toFixed(3)})`,
                      top: `calc(var(--fsh) / 2 + (100% - var(--fsh)) * ${pos.y.toFixed(3)})`,
                      x: "-50%",
                      y: "-50%",
                      zIndex: found && isTarget ? 5 : 1,
                    }}
                  >
                    <div
                      className={`h-full w-full ${dimmed || found ? "" : "bob"}`}
                      style={{ animationDelay: `${s.bobDelay}s` }}
                    >
                      <NumberShape kind={theme.kind} color={color} n={s.n} />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* 안내를 듣는 동안 */}
          <AnimatePresence>
            {locked && phase === "play" ? (
              <motion.div
                key="listen"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center"
              >
                <ListenChip />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {banner ? (
          <WinBanner
            emoji={prompt === "count" ? item.emoji : theme.emoji}
            n={target}
            label={`숫자 ${target} 찾았다`}
            praise={praise}
          />
        ) : phase === "slow" ? (
          <SlowBanner text={slowText} />
        ) : null}
      </AnimatePresence>
    </GameFrame>
  );
}
