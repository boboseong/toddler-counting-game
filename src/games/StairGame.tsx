import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  clipMs,
  playChomp,
  playDing,
  playPop,
  playSoft,
  prefetchSpeech,
  speak,
  speakDuration,
} from "../lib/audio";
import { P } from "../lib/phrases";
import {
  ANIMALS,
  GUEST_CHANCE,
  HINT_WAIT_MS,
  NUM_COLORS,
  PORORO_GUESTS,
  guestsFrom,
  pick,
  randomPraise,
  stairChoices,
  stairLevel,
  stairPath,
  type Animal,
  type StairDir,
} from "../lib/data";
import { rollPororo } from "../lib/pororoRoll";
import { useTimers } from "../hooks/useTimers";
import { useRoundGuard } from "../hooks/useRoundGuard";
import { useBox } from "../hooks/useBox";
import { BigNumeral, GameFrame, ListenChip, SpeechBubble, TopBar, WinBanner } from "../components/ui";
import type { GameProps } from "../types";
import { Chick } from "../art/Chick";
import { Glyph } from "../art/Glyph";
import type { Mood } from "../art/types";
import { useMood } from "../fx/useMood";
import { fx } from "../fx/bus";

/*
 * 깡충깡충 계단: 수의 순서 (이 다음은 삼, 삼 다음은 사).
 * 친구가 계단 맨 아래(내려가는 판은 맨 위)에 서 있고, 계단 끝에는 그 친구가 좋아하는 먹을 것이 놓여 있다.
 * "일 층 다음은?" 하면 다음 층의 숫자를 고르고, 맞히면 친구가 그 층으로 깡충 뛰며 숫자가 계단에 적힌다.
 * 지나온 층에는 숫자가 남아 있어서 1, 2, 3 … 이 차례로 놓인 것이 눈에 보인다.
 * 틀리면 지나온 층을 하나씩 비추며 "일, 이, 삼" 하고 같이 센 뒤 다시 묻고, 두 번 틀리면 정답 버튼에 노란 빛.
 * 끝까지 가면 먹을 것을 냠냠 먹고 "오 층입니다!".
 */

interface Round {
  id: number;
  dir: StairDir;
  /** 지나갈 층 (첫 칸이 출발 층, 마지막 칸이 먹을 것이 있는 층) */
  path: number[];
  climber: Animal;
  /** 보기 개수 · 같은 색 도움 (라운드 도중에 단계가 바뀌어도 그대로이게 라운드에 묶어 둔다) */
  choices: number;
  color: boolean;
}

/**
 * ask:   보기를 기다린다
 * hop:   다음 층으로 뛰는 중
 * count: 지나온 층을 같이 세는 중 (틀렸거나 한참 가만히 있었을 때)
 * done:  끝까지 갔다
 */
type Phase = "ask" | "hop" | "count" | "done";

/** 한 층 뛰는 데 걸리는 시간 */
const HOP_MS = 620;
/** 새 보기가 나온 뒤 이만큼은 누르지 못한다 (앞 보기를 두 번 눌렀을 때 새 보기가 눌리지 않게) */
const OPEN_GRACE_MS = 280;

/** 층을 같이 셀 때 한 층에 걸리는 시간: 세는 말(일, 이, 삼 …) 길이에 맞춘다 */
function countMs(floor: number): number {
  const ms = clipMs(P.elevatorCount(floor));
  if (ms === 0) return 450; // 음성을 껐으면 계단만 빠르게 비춘다
  if (ms === null) return 750; // 브라우저 TTS
  return Math.max(460, ms + 100);
}

export default function StairGame({ level, friends, stars, tapGap, onHome, onWin, onResult }: GameProps) {
  const { after, clearAll } = useTimers();
  const guard = useRoundGuard(tapGap);
  const levelRef = useRef(level);
  levelRef.current = level;
  const friendsRef = useRef(friends);
  friendsRef.current = friends;
  const prev = useRef<{ start?: number; climber?: string; dir?: StairDir }>({});
  /** 이번에 이 놀이에 들어와서 방향별 안내("계단을 깡충깡충 올라가요!")를 했는지 */
  const introduced = useRef<Partial<Record<StairDir, boolean>>>({});
  const idleTimer = useRef<number | null>(null);

  const newRound = (id: number): Round => {
    const lv = stairLevel(levelRef.current);
    const dir: StairDir = lv.dir === "both" ? (Math.random() < 0.5 ? "up" : "down") : lv.dir;
    const path = stairPath(lv, dir, prev.current.dir === dir ? prev.current.start : undefined);
    // 가끔 뽀로로 친구가, 가끔 모은 스티커 친구가 계단을 오른다
    const last = prev.current.climber;
    const guests = guestsFrom(friendsRef.current).filter((g) => g.name !== last);
    const climber: Animal = rollPororo()
      ? pick(PORORO_GUESTS.filter((g) => g.name !== last))
      : guests.length > 0 && Math.random() < GUEST_CHANCE
        ? pick(guests)
        : pick(ANIMALS.filter((a) => a.name !== last));
    prev.current = { start: path[0], climber: climber.name, dir };
    return { id, dir, path, climber, choices: lv.choices, color: lv.color };
  };

  const [round, setRound] = useState<Round>(() => newRound(0));
  const [phase, setPhaseState] = useState<Phase>("ask");
  /** 친구가 서 있는 칸 (path 의 인덱스) */
  const [at, setAtState] = useState(0);
  const [options, setOptions] = useState<number[]>(() => stairChoices(round.path[0], round.path[1], round.choices));
  /** 같이 세는 중에 비추는 칸 (path 의 인덱스) */
  const [lit, setLit] = useState(-1);
  const [hint, setHint] = useState(false);
  const [wobble, setWobble] = useState<number | null>(null);
  const [eaten, setEaten] = useState(false);
  const [banner, setBanner] = useState(false);
  const [praise, setPraise] = useState("");

  const roundRef = useRef(round);
  roundRef.current = round;
  const phaseRef = useRef<Phase>("ask");
  const atRef = useRef(0);
  /** 이 문제에서 틀린 횟수 · 가만히 있어서 힌트를 받은 횟수 */
  const wrongs = useRef(0);
  const idleStage = useRef(0);
  /** 이번 라운드를 실패로 알렸는지 (처음 한 번만 알린다) */
  const missed = useRef(false);
  const openAt = useRef(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const setAt = (i: number) => {
    atRef.current = i;
    setAtState(i);
  };
  /** 어려워했다: 라운드마다 처음 한 번만 실패로 알린다 */
  const miss = () => {
    if (missed.current) return;
    missed.current = true;
    onResult(false);
  };

  const [chickMood, flashChick] = useMood(guard.locked || phase === "count" ? "talk" : "idle");
  const climberBase: Mood = phase === "done" ? "cheer" : phase === "hop" ? "happy" : "idle";
  const [climberMood, flashClimber] = useMood(climberBase);

  const clearIdle = () => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = null;
  };

  /** 지금 서 있는 층에서 다시 묻는다. 말하는 동안에도 보기는 누를 수 있다 */
  const reask = () => {
    const r = roundRef.current;
    const line = P.stairAsk(r.path[atRef.current], r.dir);
    const ms = speakDuration(line);
    setPhase("ask");
    openAt.current = performance.now() + OPEN_GRACE_MS;
    speak(line, { interrupt: false });
    flashChick("talk", ms);
    scheduleIdle(ms);
  };

  /** 지나온 층을 처음부터 하나씩 비추며 같이 센 뒤 다시 묻는다 */
  const countAlong = () => {
    const r = roundRef.current;
    setPhase("count");
    const lead = P.stairCountAgain;
    speak(lead);
    let t = speakDuration(lead);
    for (let k = 0; k <= atRef.current; k++) {
      const floor = r.path[k];
      after(t, () => {
        setLit(k);
        playPop(k + 1);
        fx.haptic(6);
        speak(P.elevatorCount(floor), { interrupt: false, rate: 0.9, pitch: 1.2 });
      });
      t += countMs(floor);
    }
    after(t + 150, () => {
      setLit(-1);
      reask();
    });
  };

  /** 한참 안 누르면: 처음엔 지나온 층을 같이 세고, 또 가만히 있으면 정답 버튼에 노란 빛 */
  const onIdle = () => {
    if (phaseRef.current !== "ask") return;
    idleStage.current += 1;
    miss();
    if (idleStage.current >= 2) {
      setHint(true);
      reask();
    } else {
      countAlong();
    }
  };

  const scheduleIdle = (lead = 0) => {
    clearIdle();
    idleTimer.current = window.setTimeout(onIdle, lead + HINT_WAIT_MS);
  };

  /* 새 계단: (처음이면 방향 안내를 하고) 출발 층에서 묻는다 */
  useEffect(() => {
    const r = round;
    const ask = P.stairAsk(r.path[0], r.dir);
    const lines = introduced.current[r.dir] ? [ask] : [P.stairIntro(r.dir), ask];
    introduced.current[r.dir] = true;
    prefetchSpeech([
      ...lines,
      ...r.path.map((f) => P.elevatorCount(f)),
      ...r.path.slice(1, -1).map((f) => P.stairAsk(f, r.dir)),
      P.elevatorArrive(r.path[r.path.length - 1]),
      P.stairYum,
      P.stairCountAgain,
    ]);
    const ms = speakDuration(lines);
    guard.lock(400 + ms);
    after(400, () => speak(lines, { interrupt: false }));
    openAt.current = 0;
    scheduleIdle(400 + ms);
    return clearIdle;
  }, [round.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextRound = () => {
    clearAll();
    clearIdle();
    guard.resetRound();
    wrongs.current = 0;
    idleStage.current = 0;
    missed.current = false;
    setHint(false);
    setWobble(null);
    setLit(-1);
    setEaten(false);
    setBanner(false);
    setAt(0);
    setPhase("ask");
    const r = newRound(roundRef.current.id + 1);
    setOptions(stairChoices(r.path[0], r.path[1], r.choices));
    setRound(r);
  };

  /** 계단 끝에 도착: 먹을 것을 냠냠 먹고 축하 */
  const arrive = () => {
    const r = roundRef.current;
    const goal = r.path[r.path.length - 1];
    setPhase("done");
    const p = randomPraise();
    setPraise(p);
    const line = P.elevatorArrive(goal);
    speak(line, { interrupt: false });
    after(220, () => {
      setEaten(true);
      playChomp();
      flashClimber("eating", 900);
      fx.burstAt(stepRefs.current[r.path.length - 1], "stars", { count: 14 });
      fx.haptic([10, 40, 10]);
    });
    const thanksAt = Math.max(1000, speakDuration(line));
    after(thanksAt, () => {
      playDing();
      flashClimber("cheer", 3200);
      flashChick("cheer", 3400);
      speak(P.stairYum, { pitch: 1.3 });
      speak(p, { interrupt: false, pitch: 1.25 });
      setBanner(true);
      // 틀리거나 힌트를 받은 뒤 끝까지 갔으면 화면은 똑같이 축하하지만 단계에는 성공으로 치지 않는다
      if (!missed.current) onResult(true);
      onWin();
    });
    after(thanksAt + 3800, nextRound);
  };

  const press = (rid: number, n: number, el: HTMLElement) => {
    const r = roundRef.current;
    if (rid !== r.id || phaseRef.current !== "ask") return;
    if (performance.now() < openAt.current) return;
    if (!guard.accept()) return;
    clearIdle();
    const i = atRef.current;
    const target = r.path[i + 1];

    if (n === target) {
      // 정답: 그 층으로 깡충 뛰고, 계단에 숫자가 적힌다
      setPhase("hop");
      setHint(false);
      setAt(i + 1);
      playPop(i + 2);
      fx.haptic(12);
      fx.burstAt(el, "stars", { count: 8 });
      speak(P.elevatorCount(n), { rate: 0.9, pitch: 1.2 });
      after(HOP_MS * 0.7, () => fx.burstAt(stepRefs.current[i + 1], "sparkle", { count: 8 }));
      after(HOP_MS, () => {
        if (i + 1 >= r.path.length - 1) {
          arrive();
          return;
        }
        wrongs.current = 0;
        idleStage.current = 0;
        setOptions(stairChoices(r.path[i + 1], r.path[i + 2], r.choices));
        reask();
      });
    } else {
      // 오답: 지나온 층을 같이 세고 다시 묻는다. 두 번 틀리면 정답 버튼을 노랗게 비춘다
      wrongs.current += 1;
      miss();
      if (wrongs.current >= 2) setHint(true);
      playSoft();
      fx.haptic(30);
      flashChick("hmm", 1300);
      flashClimber("hmm", 1300);
      setWobble(n);
      after(600, () => setWobble(null));
      countAlong();
    }
  };

  /** 친구를 누르면 다시 물어 준다 */
  const tapClimber = () => {
    if (phaseRef.current !== "ask" || guard.lockedRef.current) return;
    speak(P.stairAsk(roundRef.current.path[atRef.current], roundRef.current.dir));
    flashChick("talk", 1200);
    scheduleIdle(1200);
  };

  /* ---------- 화면 ---------- */

  const [stageRef, stage] = useBox<HTMLDivElement>();
  const { path, dir, climber } = round;
  const n = path.length;
  const goal = path[n - 1];
  const cur = path[at];
  const target = path[Math.min(at + 1, n - 1)];
  const locked = guard.locked;
  const showChoices = phase === "ask" && !locked;

  // 계단: 낮은 층이 왼쪽, 높은 층이 오른쪽. 한 칸의 폭 cw, 한 층의 높이 rise
  const cw = Math.min(stage.w / (n + 0.3), 150);
  const figBox = Math.max(36, Math.min(cw * 0.92, stage.h * 0.3));
  const base = Math.max(34, Math.min(stage.h * 0.2, 90));
  const rise = Math.max(12, Math.min(cw * 0.7, (stage.h - base - figBox * 1.2) / (n - 1)));
  const left0 = (stage.w - n * cw) / 2;
  /** path 의 k 번째 칸이 왼쪽에서 몇 번째 계단인지 */
  const colOf = (k: number) => (dir === "up" ? k : n - 1 - k);
  const topOf = (col: number) => base + col * rise;
  const figLeft = (k: number) => left0 + colOf(k) * cw + (cw - figBox) / 2;
  // 숫자는 가장 낮은 계단에도 다 들어가는 크기로 (계단마다 크기가 같아야 차례로 놓인 것이 잘 보인다)
  const numPx = (floor: number) => Math.min(cw * (floor >= 10 ? 0.4 : 0.52), base * 0.72);

  let bubble: ReactNode;
  if (phase === "done") {
    bubble = (
      <span className="flex items-center">
        <Glyph emoji={climber.emoji} mood="cheer" className="mr-2 text-[1.3em]" />
        <BigNumeral n={goal} className="text-[1.6em]" />
        <span className="ml-1">층 도착!</span>
      </span>
    );
  } else if (phase === "count") {
    bubble = <span>같이 세어 볼까?</span>;
  } else {
    // 뛰는 동안에는 방금 맞힌 물음에 답을 채워서 보여 준다 ("2층 다음은 3")
    const hopping = phase === "hop" && at > 0;
    bubble = (
      <span className="flex items-center">
        <BigNumeral n={hopping ? path[at - 1] : cur} className="text-[1.6em]" />
        <span className="ml-1">층 {dir === "up" ? "다음은" : "아래는"}</span>
        {hopping ? (
          <motion.span
            key={`answer-${at}`}
            className="ml-2 inline-block"
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
          >
            <BigNumeral n={cur} className="text-[1.6em]" />
          </motion.span>
        ) : (
          <span className="ml-2 inline-flex h-[1.5em] w-[1.5em] items-center justify-center rounded-xl border-[3px] border-dashed border-amber-400 bg-amber-50 text-amber-500">
            ?
          </span>
        )}
      </span>
    );
  }

  return (
    <GameFrame scene="farm">
      <TopBar onHome={onHome} stars={stars} title="깡충깡충 계단" emoji="🪜" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2 sm:px-4 short:pb-2 short:pt-0">
        {/* 물음 */}
        <div className="flex items-center justify-center gap-3">
          <Chick mood={chickMood} className="text-5xl sm:text-6xl short:text-3xl" />
          <SpeechBubble
            tail="left"
            className="break-keep text-center text-xl sm:text-2xl short:px-4 short:py-1.5 short:text-base"
          >
            {bubble}
          </SpeechBubble>
        </div>

        {/* 계단 + 보기 (세로가 짧은 화면에서는 보기를 오른쪽에 둔다) */}
        <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 short:mt-1 short:flex-row short:gap-3">
          <div ref={stageRef} className="relative min-h-0 min-w-0 flex-1">
            {stage.w > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={round.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 계단 칸들 */}
                  {path.map((floor, k) => {
                    const col = colOf(k);
                    const visited = k <= at;
                    const next = k === at + 1 && phase !== "done";
                    const color = NUM_COLORS[(floor - 1) % NUM_COLORS.length];
                    const tinted = visited || (next && round.color);
                    const glowing = lit === k;
                    return (
                      <motion.div
                        key={floor}
                        ref={(el) => {
                          stepRefs.current[k] = el;
                        }}
                        className="absolute overflow-hidden rounded-t-2xl border-4 border-b-0 border-white shadow-lg"
                        style={{
                          left: left0 + col * cw + 2,
                          bottom: 0,
                          width: cw - 4,
                          height: topOf(col),
                          background: tinted
                            ? `linear-gradient(180deg, ${color}${visited ? "" : "99"}, ${color}${visited ? "cc" : "66"})`
                            : "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(226,232,240,0.75))",
                          transformOrigin: "bottom",
                        }}
                        initial={{ scaleY: 0 }}
                        animate={{
                          scaleY: 1,
                          filter: glowing ? "brightness(1.18)" : "brightness(1)",
                          boxShadow: glowing
                            ? "0 0 0 5px rgba(253,224,71,0.95), 0 8px 14px rgba(0,0,0,0.15)"
                            : "0 0 0 0px rgba(253,224,71,0), 0 8px 14px rgba(0,0,0,0.15)",
                        }}
                        transition={{ scaleY: { duration: 0.3, delay: 0.06 * col }, default: { duration: 0.18 } }}
                      >
                        {/* 계단 윗면의 밝은 띠 */}
                        <span className="absolute inset-x-0 top-0 h-[7px] bg-white/45" />
                        <span
                          className="absolute inset-x-0 top-0 flex items-center justify-center font-bold leading-none"
                          style={{ height: Math.min(topOf(col), cw * 0.8), fontSize: numPx(floor) }}
                        >
                          {visited ? (
                            <motion.span
                              key="num"
                              className="text-white"
                              style={{ textShadow: "0 3px 0 rgba(0,0,0,0.18)" }}
                              initial={k === 0 ? false : { scale: 0, rotate: -25 }}
                              animate={{ scale: glowing ? 1.25 : 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 420, damping: 14 }}
                            >
                              {floor}
                            </motion.span>
                          ) : next ? (
                            <motion.span
                              key="q"
                              className={tinted ? "text-white" : "text-amber-500"}
                              style={{ textShadow: tinted ? "0 3px 0 rgba(0,0,0,0.18)" : undefined }}
                              animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
                              transition={{ duration: 1.1, repeat: Infinity }}
                            >
                              ?
                            </motion.span>
                          ) : null}
                        </span>
                      </motion.div>
                    );
                  })}

                  {/* 계단 끝에 놓인 먹을 것 */}
                  <AnimatePresence>
                    {!eaten ? (
                      <motion.span
                        key="treat"
                        className="pointer-events-none absolute z-[2] leading-none"
                        style={{
                          left: figLeft(n - 1) + figBox * 0.2,
                          bottom: topOf(colOf(n - 1)) + 2,
                          fontSize: (figBox * 0.6) / 1.15,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0, y: -figBox * 0.3 }}
                        transition={{ duration: 0.25 }}
                      >
                        <span className="bob inline-block">
                          <Glyph emoji={climber.food.emoji} mood="happy" className="drop-shadow" />
                        </span>
                      </motion.span>
                    ) : null}
                  </AnimatePresence>

                  {/* 계단을 오르내리는 친구 (누르면 다시 물어 준다) */}
                  <motion.button
                    onPointerDown={tapClimber}
                    aria-label={`${climber.name} (지금 ${cur}층)`}
                    className="absolute z-[3] leading-none"
                    style={{ width: figBox, height: figBox, fontSize: figBox / 1.15 }}
                    initial={false}
                    animate={{ left: figLeft(at), bottom: topOf(colOf(at)) - 3 }}
                    transition={{ duration: (HOP_MS * 0.8) / 1000, ease: "easeInOut" }}
                  >
                    <motion.span
                      key={at}
                      className="inline-block"
                      initial={false}
                      animate={at > 0 ? { y: [0, -figBox * 0.6, 0], scaleY: [1, 1.1, 0.9, 1] } : {}}
                      transition={{ duration: (HOP_MS * 0.8) / 1000, ease: "easeOut" }}
                    >
                      <Glyph emoji={climber.emoji} mood={climberMood} className="drop-shadow-lg" />
                    </motion.span>
                  </motion.button>
                </motion.div>
              </AnimatePresence>
            ) : null}

            <AnimatePresence>
              {locked && phase === "ask" ? (
                <motion.div
                  key="listen"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="pointer-events-none absolute inset-x-0 top-1 z-[5] flex justify-center"
                >
                  <div className="origin-top scale-75 short:scale-[0.6]">
                    <ListenChip />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* 보기 */}
          <div className="flex min-h-[clamp(88px,min(25vw,19vh),170px)] items-end justify-center gap-4 sm:gap-8 short:min-h-0 short:w-[44%] short:items-center short:gap-3">
            <AnimatePresence>
              {showChoices
                ? options.map((v) => {
                    const color = NUM_COLORS[(v - 1) % NUM_COLORS.length];
                    const glow = hint && v === target;
                    return (
                      <motion.button
                        key={`${at}-${v}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={
                          wobble === v
                            ? { x: [0, -14, 14, -10, 10, 0], scale: 1, opacity: 1 }
                            : { scale: 1, opacity: 1, x: 0 }
                        }
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 18 }}
                        whileTap={{ scale: 0.9 }}
                        onPointerDown={(e) => press(round.id, v, e.currentTarget)}
                        aria-label={`${v}`}
                        className="pressable relative flex h-[clamp(88px,min(25vw,19vh),170px)] w-[clamp(80px,min(23vw,18vh),150px)] items-center justify-center rounded-[2rem] border-4 border-white text-white shadow-[0_10px_0_0_rgba(0,0,0,0.15)] short:h-[84px] short:w-[76px] short:rounded-2xl"
                        style={{ background: color }}
                      >
                        {glow ? (
                          <motion.span
                            className="pointer-events-none absolute -inset-3 rounded-[2.4rem] bg-yellow-300"
                            style={{ zIndex: -1 }}
                            animate={{ scale: [1, 1.1, 1], opacity: [0.95, 0.5, 0.95] }}
                            transition={{ duration: 1.1, repeat: Infinity }}
                          />
                        ) : null}
                        <span
                          className={`leading-none ${
                            v >= 10
                              ? "text-[clamp(2.4rem,min(10vw,8vh),5rem)] short:text-4xl"
                              : "text-[clamp(3rem,min(13vw,10vh),6.5rem)] short:text-5xl"
                          }`}
                          style={{ textShadow: "0 4px 0 rgba(0,0,0,0.15)" }}
                        >
                          {v}
                        </span>
                      </motion.button>
                    );
                  })
                : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {banner ? <WinBanner emoji={climber.emoji} n={goal} label={`${goal}층 도착`} praise={praise} /> : null}
      </AnimatePresence>
    </GameFrame>
  );
}
