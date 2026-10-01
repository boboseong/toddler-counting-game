import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  playDial,
  playErase,
  playRing,
  playSoft,
  prefetchSpeech,
  speak,
  speakDuration,
} from "../lib/audio";
import { P, type Line } from "../lib/phrases";
import {
  ANIMALS,
  DIAL_KEY_COLORS,
  DIAL_ROWS,
  STICKERS,
  copula,
  dialGroupBreaks,
  dialLevel,
  dialNumber,
  mashLimitFor,
  pick,
  randomPraise,
  randomSlowPhrase,
  type DialKey,
} from "../lib/data";
import { useTimers } from "../hooks/useTimers";
import { useRoundGuard } from "../hooks/useRoundGuard";
import { GameFrame, ListenChip, SlowBanner, SpeechBubble, TopBar } from "../components/ui";
import type { GameProps } from "../types";
import { Chick } from "../art/Chick";
import { Glyph } from "../art/Glyph";
import { starPath } from "../art/items";
import { useMood } from "../fx/useMood";
import { fx } from "../fx/bus";

/** 전화를 받는 친구 */
interface Caller {
  emoji: string;
  name: string;
}

interface Round {
  id: number;
  keys: DialKey[];
  /** 다음에 누를 버튼을 노랗게 알려 주는 단계 */
  guide: boolean;
  caller: Caller;
}

type Phase = "play" | "calling" | "slow";

/** 누른 뒤 이만큼 아무것도 안 누르면 다음에 누를 것을 다시 알려 준다 */
const IDLE_HINT_MS = 8000;
/** 따르릉 소리가 끝나고 친구가 전화를 받기까지 */
const RING_MS = 1700;

/** 모은 스티커 친구 중 동물(먹이가 있는 친구)도 전화를 받는다 */
function callersFrom(friends: number[]): Caller[] {
  const out: Caller[] = ANIMALS.map((a) => ({ emoji: a.emoji, name: a.name }));
  for (const i of friends) {
    const s = STICKERS[i];
    if (s?.food && !out.some((c) => c.name === s.name)) out.push({ emoji: s.emoji, name: s.name });
  }
  return out;
}

/** 자리 수가 많을수록 번호 글자를 작게 (Tailwind 가 읽도록 클래스는 통째로 적는다) */
function numberSize(len: number): string {
  if (len <= 2) return "text-[clamp(3.2rem,min(17vw,11vh),6rem)] short:text-[3rem]";
  if (len <= 3) return "text-[clamp(2.9rem,min(15vw,10vh),5.4rem)] short:text-[2.8rem]";
  if (len <= 4) return "text-[clamp(2.5rem,min(12vw,9.5vh),4.8rem)] short:text-[2.5rem]";
  if (len <= 6) return "text-[clamp(2rem,min(9.4vw,8.5vh),4rem)] short:text-[2.1rem]";
  return "text-[clamp(1.6rem,min(7.4vw,7.5vh),3.4rem)] short:text-[1.8rem]";
}

/** 버튼 글자: 숫자·샵은 글자로, 별은 별 모양으로 */
function KeyFace({ k, color, className = "" }: { k: DialKey; color?: string; className?: string }) {
  if (k === "*") {
    return (
      <svg viewBox="0 0 100 100" className={`inline-block h-[0.82em] w-[0.82em] ${className}`} aria-hidden>
        <path
          d={starPath(50, 54, 46, 20)}
          fill={color ?? "currentColor"}
          stroke="#fff"
          strokeWidth={6}
          strokeLinejoin="round"
          paintOrder="stroke"
        />
      </svg>
    );
  }
  return (
    <span className={`inline-block font-bold leading-none ${className}`} style={color ? { color } : undefined}>
      {k}
    </span>
  );
}

/** 따르릉 → 친구가 전화를 받는다 */
function CallBanner({ caller, answered, praise }: { caller: Caller; answered: boolean; praise: string }) {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
    >
      <div className="flex min-w-[16rem] flex-col items-center gap-2 rounded-[2.5rem] border-8 border-emerald-300 bg-white/95 px-8 py-6 text-center shadow-2xl short:gap-1 short:rounded-3xl short:border-4 short:px-5 short:py-2">
        {answered ? (
          <Fragment key="answered">
            <div className="text-2xl text-amber-500 sm:text-3xl short:text-lg">{praise}</div>
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 14 }}
              className="rounded-full border-4 border-emerald-300 bg-emerald-50 p-3 short:p-1.5"
            >
              <Glyph emoji={caller.emoji} mood="talk" className="text-8xl sm:text-9xl short:text-6xl" />
            </motion.div>
            <div className="break-keep text-2xl text-slate-700 sm:text-3xl short:text-xl">
              여보세요? 나 {copula(caller.name)}!
            </div>
          </Fragment>
        ) : (
          <Fragment key="ringing">
            <motion.div
              animate={{ rotate: [0, -16, 16, -16, 16, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, repeatDelay: 0.3 }}
              className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 text-6xl text-white shadow-[0_6px_0_0_#047857] short:h-20 short:w-20 short:text-5xl"
            >
              <Glyph emoji="📞" />
            </motion.div>
            <motion.div
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 0.85, repeat: Infinity }}
              className="text-4xl text-emerald-600 sm:text-5xl short:text-3xl"
            >
              따르릉 따르릉
            </motion.div>
          </Fragment>
        )}
      </div>
    </motion.div>
  );
}

/** 키패드 버튼 크기: 세로 화면은 폭, 가로 화면은 높이에 맞춘다 */
const PAD_STYLE =
  "[--k:clamp(52px,min(20vw,9.2vh),92px)] landscape:[--k:clamp(44px,min(11vw,14.2vh),96px)]";
const KEY_BOX = "h-[var(--k)] w-[var(--k)]";

export default function DialGame({ level, stars, tapGap, friends, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
  // 키패드는 세는 탭보다 조금 빨리 눌러도 받아 준다 (여덟 자리까지 누르니까)
  const guard = useRoundGuard(Math.round(tapGap * 0.6));
  const prev = useRef<{ keys?: string; caller?: string }>({});
  const idleTimer = useRef<number | null>(null);
  const levelRef = useRef(level);
  levelRef.current = level;
  const friendsRef = useRef(friends);
  friendsRef.current = friends;

  const newRound = (id: number): Round => {
    const lv = dialLevel(levelRef.current);
    let keys = dialNumber(lv);
    for (let i = 0; i < 5 && keys.join("") === prev.current.keys; i++) keys = dialNumber(lv);
    const callers = callersFrom(friendsRef.current).filter((c) => c.name !== prev.current.caller);
    const caller = pick(callers);
    prev.current = { keys: keys.join(""), caller: caller.name };
    return { id, keys, guide: lv.guide, caller };
  };

  const [round, setRound] = useState<Round>(() => newRound(0));
  const [typed, setTypedState] = useState<DialKey[]>([]);
  const [phase, setPhaseState] = useState<Phase>("play");
  /** 노란 표시를 안 하는 단계에서, 한참 가만히 있거나 막히면 다음 버튼만 잠깐 노랗게 */
  const [hint, setHint] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [praise, setPraise] = useState("");
  const [slowText, setSlowText] = useState("");
  /** 흔들 곳마다 번호 (번호가 바뀌면 다시 흔든다. 0 이면 가만히) */
  const [wobbles, setWobbles] = useState<Record<string, number>>({});
  const [chickMood, flashChick] = useMood(guard.locked ? "talk" : "idle");

  const roundIdRef = useRef(round.id);
  roundIdRef.current = round.id;
  const phaseRef = useRef<Phase>("play");
  const typedRef = useRef<DialKey[]>([]);
  const wrongs = useRef(0);
  /**
   * 이번 라운드에서 틀렸거나 힌트를 받았는지 (막 눌러서 처음부터 다시 해도 그대로).
   * 그 뒤에 전화를 걸면 화면은 똑같이 축하하지만 단계에는 성공으로 치지 않는다.
   */
  const missed = useRef(false);
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  /** 어려워했다: 라운드마다 처음 한 번만 실패로 알린다 */
  const miss = () => {
    if (missed.current) return;
    missed.current = true;
    onResult(false);
  };
  const setTyped = (t: DialKey[]) => {
    typedRef.current = t;
    setTypedState(t);
  };

  const { keys, caller } = round;
  /** 마지막으로 누른 것이 틀렸다 (틀리면 지울 때까지 다음 숫자를 받지 않으므로 틀린 건 늘 마지막 하나) */
  const isWrong = (t: DialKey[]) => t.length > 0 && t[t.length - 1] !== keys[t.length - 1];
  const isComplete = (t: DialKey[]) => t.length === keys.length && !isWrong(t);
  const wrong = isWrong(typed);
  const complete = isComplete(typed);
  const nextKey: DialKey | null = wrong || complete ? null : keys[typed.length];

  const intro: Line = round.id === 0 ? [P.dialHowTo, ...P.dialAsk(keys)] : P.dialAsk(keys);

  const shakeSeq = useRef(0);
  const shake = (id: string) => {
    const n = ++shakeSeq.current;
    setWobbles((w) => ({ ...w, [id]: n }));
    // 다 흔들고 나면 멈춤 (노랗게 두근거리는 움직임으로 돌아가게)
    window.setTimeout(() => setWobbles((w) => (w[id] === n ? { ...w, [id]: 0 } : w)), 500);
  };

  const clearIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = null;
  };

  /** 지금 할 일을 다시 알려 준다: 지우기 / 전화 버튼 / 다음 숫자(노랗게) */
  const giveHint = () => {
    if (phaseRef.current !== "play") return;
    miss();
    const t = typedRef.current;
    flashChick("surprised", 900);
    if (isWrong(t)) {
      shake("erase");
      speak(P.dialEraseFirst);
    } else if (isComplete(t)) {
      shake("call");
      speak(P.dialPressCall);
    } else {
      setHint(true);
      speak(P.dialPress(keys[t.length]));
    }
  };

  const scheduleIdleHint = (extra = 0) => {
    clearIdle();
    idleTimer.current = window.setTimeout(giveHint, IDLE_HINT_MS + extra);
  };

  useEffect(() => {
    prefetchSpeech([...intro, P.dialHello(caller.name)]);
    const ms = 400 + speakDuration(intro);
    guard.lock(ms);
    after(400, () => speak(intro, { interrupt: false }));
    scheduleIdleHint(ms);
    return clearIdle;
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetRoundState = () => {
    wrongs.current = 0;
    guard.resetRound();
    setTyped([]);
    setHint(false);
    setAnswered(false);
    setWobbles({});
    setPhase("play");
  };

  const nextRound = () => {
    clearAll();
    clearIdle();
    missed.current = false;
    resetRoundState();
    setRound((r) => newRound(r.id + 1));
  };

  /** 막 눌러서 끝냈으면 별 없이 같은 번호를 처음부터 다시 */
  const slowRound = () => {
    clearIdle();
    setPhase("slow");
    const s = randomSlowPhrase();
    setSlowText(s);
    playSoft();
    speak(s, { interrupt: false });
    after(3000, () => {
      resetRoundState();
      const again = [P.lookSlowly, ...P.dialAsk(keys)];
      guard.lock(speakDuration(again));
      speak(again);
      scheduleIdleHint(speakDuration(again));
    });
  };

  const pressKey = (rid: number, k: DialKey, el: HTMLElement) => {
    if (rid !== roundIdRef.current) return;
    if (phaseRef.current !== "play") {
      guard.noteIgnored();
      return;
    }
    if (!guard.accept()) return;
    const t = typedRef.current;
    if (isWrong(t)) {
      // 틀린 걸 지우기 전에는 다음 숫자를 받지 않는다
      playSoft();
      shake(`key-${k}`);
      shake("erase");
      speak(P.dialEraseFirst);
      scheduleIdleHint();
      return;
    }
    if (isComplete(t)) {
      playSoft();
      shake("call");
      speak(P.dialPressCall);
      scheduleIdleHint();
      return;
    }
    clearIdle();
    playDial(k);
    const next = [...t, k];
    setTyped(next);
    setHint(false);

    if (k === keys[t.length]) {
      fx.burstAt(el, "sparkle", { count: 6 });
      fx.haptic(10);
      // 다 누르면 따로 말하지 않고 초록 전화 버튼이 두근거린다
      flashChick(isComplete(next) ? "cheer" : "happy", isComplete(next) ? 1600 : 700);
      speak(P.dialKey(k), { pitch: 1.2 });
      scheduleIdleHint();
      return;
    }

    // 틀림: 숫자는 칸에 들어가고, 지우기로 고친다
    wrongs.current += 1;
    miss();
    flashChick("hmm", 1400);
    fx.haptic(30);
    shake(`slot-${t.length}`);
    speak([P.dialKey(k), P.dialWrong]);
    // 두 번 틀리면 노란 표시로 도와준다
    if (wrongs.current >= 2) setHint(true);
    scheduleIdleHint();
  };

  const pressErase = (rid: number) => {
    if (rid !== roundIdRef.current) return;
    if (phaseRef.current !== "play") {
      guard.noteIgnored();
      return;
    }
    if (!guard.accept()) return;
    const t = typedRef.current;
    if (t.length === 0) {
      playSoft();
      shake("erase");
      return;
    }
    clearIdle();
    playErase();
    fx.haptic(10);
    const wasWrong = isWrong(t);
    const next = t.slice(0, -1);
    setTyped(next);
    const ask = P.dialPress(keys[next.length]);
    if (wasWrong) {
      flashChick("happy", 900);
      speak([P.dialErased, ask]);
    } else {
      // 맞게 누른 걸 지웠으면 그 숫자를 다시 누르면 된다
      speak(ask);
    }
    scheduleIdleHint();
  };

  const pressCall = (rid: number) => {
    if (rid !== roundIdRef.current) return;
    if (phaseRef.current !== "play") {
      guard.noteIgnored();
      return;
    }
    if (!guard.accept()) return;
    const t = typedRef.current;
    if (isWrong(t)) {
      playSoft();
      shake("call");
      shake("erase");
      speak(P.dialEraseFirst);
      scheduleIdleHint();
      return;
    }
    if (!isComplete(t)) {
      playSoft();
      shake("call");
      miss();
      setHint(true);
      speak([P.dialNotYet, P.dialPress(keys[t.length])]);
      scheduleIdleHint();
      return;
    }

    clearIdle();
    if (guard.isMashing(mashLimitFor(keys.length + 1))) {
      slowRound();
      return;
    }
    setPhase("calling");
    playRing();
    fx.haptic([10, 40, 10, 40, 10]);
    if (!missed.current) onResult(true);
    const p = randomPraise();
    setPraise(p);
    after(RING_MS, () => {
      setAnswered(true);
      flashChick("cheer", 3600);
      speak([P.dialHello(caller.name), p], { interrupt: false, pitch: 1.3 });
      onWin();
    });
    // "여보세요? 나 토끼야! 전화해 줘서 고마워!" + 칭찬이 끝날 즈음 다음 번호로
    after(RING_MS + 4800, nextRound);
  };

  /** 번호를 누르면 처음부터 다시 들려준다 */
  const replay = () => {
    if (phaseRef.current !== "play" || guard.lockedRef.current) return;
    const t = typedRef.current;
    speak(isWrong(t) ? P.dialEraseFirst : P.dialAsk(keys));
    scheduleIdleHint();
  };

  const locked = guard.locked && phase === "play";
  const breaks = dialGroupBreaks(keys.length);
  /** 번호판에서 지금 가리키는 자리 */
  const cursor = wrong ? typed.length - 1 : complete ? -1 : typed.length;
  const guideKey = nextKey !== null && (round.guide || hint) ? nextKey : null;
  const wob = (id: string) => wobbles[id] ?? 0;

  let status;
  if (wrong) {
    status = (
      <span className="flex items-center gap-1.5 text-rose-500">
        <Glyph emoji="⌫" className="text-[0.9em]" /> 지우기를 눌러 봐!
      </span>
    );
  } else if (complete) {
    status = (
      <span className="flex items-center gap-1.5 text-emerald-600">
        <Glyph emoji="📞" className="text-[0.9em]" /> 초록 전화 버튼을 눌러 봐!
      </span>
    );
  } else {
    status = <span>{keys.length <= 4 ? P.dialAskText(keys) : "차례대로 눌러 봐!"}</span>;
  }

  return (
    <GameFrame scene="call">
      <TopBar onHome={onHome} stars={stars} title="숫자 따라 누르기" emoji="📱" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-evenly gap-2 px-4 pb-3 pt-1 landscape:flex-row landscape:gap-6 short:pb-2 short:pt-0">
        {/* 누를 번호 + 누른 번호 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Chick mood={chickMood} className="shrink-0 text-5xl sm:text-6xl short:text-3xl" />
          <button
            type="button"
            onClick={replay}
            aria-label={`${P.dialAskText(keys)} 다시 듣기`}
            className="block text-left"
          >
            <SpeechBubble tail="left" className="px-4 py-3 sm:px-6 short:px-3 short:py-1.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={round.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className={`flex items-start justify-center ${numberSize(keys.length)}`}
                >
                  {keys.map((k, i) => {
                    const t = typed[i];
                    const isCur = i === cursor && phase === "play";
                    const bad = wrong && i === typed.length - 1;
                    const n = wob(`slot-${i}`);
                    return (
                      <div
                        key={i}
                        className={`flex w-[1.02em] flex-col items-center ${breaks.includes(i) ? "ml-[0.4em]" : ""}`}
                      >
                        {/* 누를 번호 */}
                        <motion.div
                          animate={isCur ? { y: [0, -6, 0] } : { y: 0 }}
                          transition={isCur ? { duration: 0.9, repeat: Infinity } : undefined}
                          className="text-outline flex h-[1.05em] items-center justify-center"
                          style={{ textShadow: "0 4px 0 rgba(0,0,0,0.12)" }}
                        >
                          <KeyFace k={k} color={DIAL_KEY_COLORS[k]} />
                        </motion.div>
                        {/* 누른 번호 칸 */}
                        <motion.div
                          key={`${i}-${n}`}
                          animate={n ? { x: [0, -7, 7, -5, 5, 0] } : undefined}
                          transition={{ duration: 0.45 }}
                          className={`mt-[0.1em] flex h-[0.9em] w-[0.86em] items-center justify-center rounded-[0.2em] border-[0.05em] transition-colors ${
                            bad
                              ? "border-rose-400 bg-rose-100"
                              : t !== undefined
                                ? "border-emerald-300 bg-white"
                                : isCur
                                  ? "border-yellow-400 bg-yellow-50"
                                  : "border-dashed border-slate-300 bg-white/60"
                          }`}
                        >
                          {/* 깜빡이는 커서와 누른 숫자는 key 를 달리해서 커서의 깜빡임이 숫자에 남지 않게 */}
                          {t !== undefined ? (
                            <motion.span
                              key="typed"
                              initial={{ scale: 0.3 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 20 }}
                              className="text-[0.62em]"
                            >
                              <KeyFace k={t} color={bad ? "#f43f5e" : DIAL_KEY_COLORS[t]} />
                            </motion.span>
                          ) : isCur ? (
                            <motion.span
                              key="caret"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="h-[0.55em] w-[0.06em] rounded-full bg-yellow-500"
                            />
                          ) : null}
                        </motion.div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 flex justify-center break-keep text-center text-lg text-slate-500 sm:text-xl short:mt-0.5 short:text-sm">
                {status}
              </div>
            </SpeechBubble>
          </button>
        </div>

        {/* 전화기 키패드 */}
        <div className={`relative ${PAD_STYLE}`}>
          <div
            className={`grid grid-cols-3 gap-x-[calc(var(--k)*0.28)] gap-y-[calc(var(--k)*0.13)] transition-opacity ${
              locked ? "opacity-55" : ""
            }`}
          >
            {DIAL_ROWS.flat().map((k) => {
              const glow = guideKey === k && !locked;
              const n = wob(`key-${k}`);
              return (
                <motion.button
                  key={`${k}-${n}`}
                  type="button"
                  animate={n ? { x: [0, -8, 8, -5, 5, 0] } : glow ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={n ? { duration: 0.45 } : glow ? { duration: 0.9, repeat: Infinity } : undefined}
                  whileTap={{ scale: 0.88 }}
                  onPointerDown={(e) => pressKey(round.id, k, e.currentTarget)}
                  aria-label={k === "*" ? "별" : k === "#" ? "샵" : `숫자 ${k}`}
                  className={`pressable relative flex items-center justify-center rounded-full border-4 text-[calc(var(--k)*0.52)] shadow-[0_5px_0_0_rgba(0,0,0,0.12)] ${KEY_BOX} ${
                    glow ? "border-yellow-100 bg-yellow-300" : "border-white bg-white"
                  }`}
                >
                  {glow ? (
                    <motion.span
                      className="pointer-events-none absolute -inset-1 rounded-full border-4 border-yellow-300"
                      initial={{ opacity: 0.9, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.35 }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                    />
                  ) : null}
                  <KeyFace k={k} color={DIAL_KEY_COLORS[k]} className="text-outline" />
                </motion.button>
              );
            })}

            {/* 맨 아래 줄: (빈 칸) · 전화 · 지우기 */}
            <span aria-hidden />
            <motion.button
              key={`call-${wob("call")}`}
              type="button"
              animate={
                wob("call")
                  ? { x: [0, -8, 8, -5, 5, 0] }
                  : complete && phase === "play"
                    ? { scale: [1, 1.12, 1] }
                    : { scale: 1 }
              }
              transition={
                wob("call")
                  ? { duration: 0.45 }
                  : complete && phase === "play"
                    ? { duration: 0.8, repeat: Infinity }
                    : undefined
              }
              whileTap={{ scale: 0.88 }}
              onPointerDown={() => pressCall(round.id)}
              aria-label="전화 걸기"
              className={`pressable relative flex items-center justify-center rounded-full border-4 border-white text-[calc(var(--k)*0.5)] text-white shadow-[0_5px_0_0_rgba(4,120,87,0.45)] transition-colors ${KEY_BOX} ${
                complete ? "bg-emerald-500" : "bg-emerald-400/80"
              }`}
            >
              {complete && phase === "play" ? (
                <motion.span
                  className="pointer-events-none absolute -inset-1 rounded-full border-4 border-emerald-300"
                  initial={{ opacity: 0.9, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.4 }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />
              ) : null}
              <Glyph emoji="📞" />
            </motion.button>
            <motion.button
              key={`erase-${wob("erase")}`}
              type="button"
              animate={wob("erase") ? { x: [0, -8, 8, -5, 5, 0] } : wrong ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={wob("erase") ? { duration: 0.45 } : wrong ? { duration: 0.8, repeat: Infinity } : undefined}
              whileTap={{ scale: 0.88 }}
              onPointerDown={() => pressErase(round.id)}
              aria-label="지우기"
              className={`pressable relative flex flex-col items-center justify-center rounded-full border-4 shadow-[0_5px_0_0_rgba(0,0,0,0.1)] transition-colors ${KEY_BOX} ${
                wrong ? "border-rose-100 bg-rose-400 text-white" : "border-white bg-slate-100 text-slate-500"
              }`}
            >
              {wrong ? (
                <motion.span
                  className="pointer-events-none absolute -inset-1 rounded-full border-4 border-rose-300"
                  initial={{ opacity: 0.9, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.4 }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />
              ) : null}
              <Glyph emoji="⌫" className="text-[calc(var(--k)*0.36)]" />
              <span className="text-[calc(var(--k)*0.2)] leading-none">지우기</span>
            </motion.button>
          </div>

          {/* 안내를 듣는 동안 */}
          <AnimatePresence>
            {locked ? (
              <motion.div
                key="listen"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
              >
                <ListenChip />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {phase === "calling" ? (
          <CallBanner key="call" caller={caller} answered={answered} praise={praise} />
        ) : phase === "slow" ? (
          <SlowBanner key="slow" text={slowText} />
        ) : null}
      </AnimatePresence>
    </GameFrame>
  );
}
