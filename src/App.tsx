import confetti from "canvas-confetti";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent,
} from "react";
import {
  afterSpeech,
  playBonus,
  playFanfare,
  playLevelUp,
  playTwinkle,
  playWhoosh,
  speak,
  stopSpeaking,
  unlockAudio,
} from "./lib/audio";
import {
  BONUS_CHANCE,
  CYCLE_ORDER,
  CYCLE_RULES,
  cycleNextOf,
  cycleShouldSwitch,
  cycleWinsFor,
  pick,
  problemMax,
  type CycleReason,
  type GameId,
} from "./lib/data";
import { starMeter, useProgress, type Unlock } from "./hooks/useProgress";
import { P } from "./lib/phrases";
import { dropHeld, setHeld } from "./lib/hold";
import Home from "./screens/Home";
import StickerBook from "./screens/StickerBook";
import Goodbye from "./screens/Goodbye";
import TapCountGame from "./games/TapCountGame";
import HowManyGame from "./games/HowManyGame";
import FeedGame from "./games/FeedGame";
import BubbleGame from "./games/BubbleGame";
import FindGame from "./games/FindGame";
import ElevatorGame from "./games/ElevatorGame";
import DialGame from "./games/DialGame";
import ShareGame from "./games/ShareGame";
import {
  BalloonRise,
  BonusBadge,
  CheerChick,
  FlyingStars,
  LevelUpBadge,
  ParentGate,
  ParentSettings,
  StickerReveal,
  type FlyingStarItem,
} from "./components/overlays";
import { FxLayer } from "./fx/FxLayer";
import { fx } from "./fx/bus";
import { CycleBar, CycleTransition } from "./components/cycle";
import { BuddyContext, type BuddyInfo } from "./components/buddy";
import type { GameProps, Screen } from "./types";

const GAMES: Record<GameId, ComponentType<GameProps>> = {
  tap: TapCountGame,
  howmany: HowManyGame,
  feed: FeedGame,
  bubbles: BubbleGame,
  find: FindGame,
  elevator: ElevatorGame,
  dial: DialGame,
  share: ShareGame,
};

function isGame(s: Screen): s is GameId {
  return s in GAMES;
}

interface CycleTransitionState {
  game: GameId;
  reason: CycleReason;
  /** "이번엔 거품 팡팡!" 을 다 말해서 시작 버튼을 누를 수 있다 */
  ready?: boolean;
}

/** 라운드 성공 축하 연출. 매번 같지 않게 돌아가며 쓴다 */
type Celebration = "confetti" | "balloons" | "stars" | "hearts";
const CELEBRATIONS: Celebration[] = ["confetti", "balloons", "stars", "hearts"];
const PARTY_COLORS = ["#F87171", "#FBBF24", "#4ADE80", "#60A5FA", "#A78BFA", "#F472B6"];

/** 성공 뒤 칭찬·레벨업 말이 길어지면 이만큼까지 기다렸다가 스티커 공개·전환으로 넘어간다 */
const CHEER_WAIT_MAX_MS = 4500;
/** 전환 화면의 "이번엔 거품 팡팡!" 이 늦게 끝나면 이만큼까지 기다렸다가 시작 버튼을 보여 준다 */
const TRANSITION_WAIT_MAX_MS = 2500;

function fire(opts: confetti.Options) {
  try {
    void confetti({ zIndex: 55, ...opts });
  } catch {
    /* ignore */
  }
}

function celebrate(kind: Celebration, bonus: boolean) {
  switch (kind) {
    case "confetti":
      fire({ particleCount: 130, spread: 100, startVelocity: 40, origin: { y: 0.6 }, colors: PARTY_COLORS });
      window.setTimeout(() => {
        fire({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } });
        fire({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } });
      }, 250);
      break;
    case "balloons":
      // 풍선은 BalloonRise 가 그린다. 아래에서 작은 꽃가루만
      fire({ particleCount: 50, spread: 120, startVelocity: 30, origin: { y: 0.95 }, colors: PARTY_COLORS });
      break;
    case "stars":
      // 하늘에서 별이 쏟아진다
      [0.2, 0.5, 0.8].forEach((x, i) =>
        window.setTimeout(
          () =>
            fire({
              particleCount: 45,
              angle: 270,
              spread: 100,
              startVelocity: 12,
              gravity: 0.7,
              ticks: 260,
              origin: { x, y: -0.05 },
              shapes: ["star"],
              colors: ["#FDE68A", "#FBBF24", "#FCD34D", "#ffffff"],
              scalar: 1.4,
            }),
          i * 180,
        ),
      );
      break;
    case "hearts": {
      // 자체 제작 하트 조각이 화면 여기저기서 퐁퐁
      const w = window.innerWidth;
      const h = window.innerHeight;
      [
        [0.5, 0.55],
        [0.22, 0.7],
        [0.78, 0.7],
        [0.35, 0.35],
        [0.65, 0.35],
      ].forEach(([x, y], i) =>
        window.setTimeout(() => fx.burst(w * x, h * y, "hearts", { count: 9 }), i * 140),
      );
      break;
    }
  }
  if (bonus) {
    // 보너스 별: 양쪽에서 금빛 불꽃
    window.setTimeout(() => {
      fire({ particleCount: 90, angle: 60, spread: 80, startVelocity: 55, origin: { x: 0, y: 0.8 }, shapes: ["star"], colors: ["#FBBF24", "#FDE68A", "#F59E0B"] });
      fire({ particleCount: 90, angle: 120, spread: 80, startVelocity: 55, origin: { x: 1, y: 0.8 }, shapes: ["star"], colors: ["#FBBF24", "#FDE68A", "#F59E0B"] });
    }, 450);
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reveal, setReveal] = useState<Unlock | null>(null);
  const [flying, setFlying] = useState<FlyingStarItem[]>([]);
  const flyId = useRef(0);
  const [balloons, setBalloons] = useState(0);
  const [bonusShown, setBonusShown] = useState(false);
  const [levelUpShown, setLevelUpShown] = useState(false);
  const [cheer, setCheer] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastSparkle = useRef(0);
  const lastCelebration = useRef<Celebration>("confetti");
  const winsThisVisit = useRef(0);

  const {
    progress,
    visit,
    addStar,
    reportResult,
    noteRide,
    setBuddy,
    placeInScene,
    setSessionMin,
    toggleSound,
    toggleVoice,
    toggleHaptics,
    setTapGap,
    setCycleNext,
    setCyclePace,
    setLevel,
    reset,
  } = useProgress();

  // 별은 즉시 저장하되, 날아가는 별이 항아리에 닿을 때까지 화면의 별 칸은 채우지 않는다
  const meter = starMeter(progress, flying.length);

  /* ---------- 빙글빙글 (놀이 자동 순환) ---------- */
  const [cycleOn, setCycleOn] = useState(false);
  const [transition, setTransition] = useState<CycleTransitionState | null>(null);
  const [cycleWins, setCycleWins] = useState(0);
  // 타이머·인터벌 안에서 최신 값을 보기 위한 ref 들
  const cycleRef = useRef(false);
  cycleRef.current = cycleOn;
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;
  const transitionRef = useRef<CycleTransitionState | null>(null);
  transitionRef.current = transition;
  const revealRef = useRef<Unlock | null>(null);
  revealRef.current = reveal;
  const paceRef = useRef(progress.cyclePace);
  paceRef.current = progress.cyclePace;
  /** 지금 놀이에서의 성공·실패 횟수와 시작 시각 */
  const stats = useRef({ wins: 0, misses: 0, startedAt: performance.now() });
  /** 마지막으로 화면을 누른 시각 (흥미를 잃었는지 보는 데 쓴다) */
  const lastTap = useRef(performance.now());
  /** 스티커 화면이 떠 있어서 미뤄 둔 전환 */
  const pendingSwitch = useRef<CycleTransitionState | null>(null);
  const cycleTimers = useRef<number[]>([]);
  const revealTimers = useRef<number[]>([]);

  /* ---------- 놀이 시간 알림 ---------- */
  /** 놀이 화면에 있던 시간(ms). 화면이 꺼져 있던 시간은 빼고 센다 */
  const playMs = useRef(0);
  /** 정해진 시간이 지나서, 다음 성공 직후에 "오늘은 여기까지" 를 보여 줄 차례 */
  const byeDue = useRef(false);
  /** 스티커 화면이 떠 있어서 미뤄 둔 "오늘은 여기까지" */
  const pendingBye = useRef(false);
  const sessionMinRef = useRef(progress.sessionMin);
  sessionMinRef.current = progress.sessionMin;

  const clearCycleTimers = useCallback(() => {
    cycleTimers.current.forEach((t) => window.clearTimeout(t));
    cycleTimers.current = [];
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    cycleTimers.current.push(window.setTimeout(fn, ms));
  }, []);

  /** 전환 화면("이번엔 거품 팡팡!")을 보여 준 뒤 그 놀이를 시작한다 */
  const cycleGo = useCallback(
    (game: GameId, reason: CycleReason) => {
      clearCycleTimers();
      pendingSwitch.current = null;
      stopSpeaking();
      playWhoosh();
      stats.current = { wins: 0, misses: 0, startedAt: performance.now() };
      setCycleWins(0);
      setTransition({ game, reason });
      setScreen(game);
      // 다음에 앱을 열면 이 다음 놀이부터 이어진다
      setCycleNext(CYCLE_ORDER.indexOf(game) + 1);
      later(150, () => speak(P.cycle(game, reason), { pitch: 1.2 }));
      // "이번엔 거품 팡팡!" 이 다 끝난 뒤에 시작 버튼이 나온다. 눌러야 놀이가 나오고 첫 안내를 시작한다
      afterSpeech(
        CYCLE_RULES.transitionMs,
        TRANSITION_WAIT_MAX_MS,
        () => setTransition((t) => (t && t.game === game ? { ...t, ready: true } : t)),
        (id) => cycleTimers.current.push(id),
      );
    },
    [clearCycleTimers, later, setCycleNext],
  );

  /** 전환 화면의 시작 버튼 */
  const startCycleGame = useCallback(() => {
    if (!transitionRef.current?.ready) return;
    stopSpeaking();
    setTransition(null);
    dropHeld();
    stats.current.startedAt = performance.now();
    lastTap.current = performance.now();
  }, []);

  /** 지금 놀이에서 다음 놀이로. 스티커 화면이 떠 있으면 닫힌 뒤에 */
  const requestSwitch = useCallback(
    (reason: CycleReason) => {
      if (!cycleRef.current) return;
      if (byeDue.current) {
        showByeRef.current();
        return;
      }
      const cur = screenRef.current;
      if (!isGame(cur)) return;
      const next: CycleTransitionState = { game: cycleNextOf(cur), reason };
      if (revealRef.current !== null) {
        pendingSwitch.current = next;
        return;
      }
      cycleGo(next.game, next.reason);
    },
    [cycleGo],
  );

  const startCycle = useCallback(() => {
    unlockAudio();
    setCycleOn(true);
    cycleGo(CYCLE_ORDER[progress.cycleNext % CYCLE_ORDER.length], "start");
  }, [cycleGo, progress.cycleNext]);

  const stopCycle = useCallback(() => {
    clearCycleTimers();
    pendingSwitch.current = null;
    setCycleOn(false);
    setTransition(null);
  }, [clearCycleTimers]);

  // 흥미를 잃었거나(한참 안 누름) 라운드가 끝나지 않고 너무 오래 걸리면 다른 놀이로
  useEffect(() => {
    if (!cycleOn) return;
    const iv = window.setInterval(() => {
      if (document.hidden) return; // 화면이 꺼져 있거나 다른 앱에 가 있는 동안은 세지 않는다
      if (transitionRef.current || revealRef.current !== null) return;
      if (!isGame(screenRef.current)) return;
      const now = performance.now();
      if (now - lastTap.current >= CYCLE_RULES.idleMs) requestSwitch("idle");
      else if (now - stats.current.startedAt >= CYCLE_RULES.hardCapMs) requestSwitch("next");
    }, 1000);
    // 잠깐 다른 데 갔다 돌아온 시간은 "가만히 있던 시간"으로 치지 않는다
    let hiddenAt: number | null = null;
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
        return;
      }
      const away = hiddenAt === null ? 0 : performance.now() - hiddenAt;
      hiddenAt = null;
      lastTap.current = performance.now();
      stats.current.startedAt += away;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [cycleOn, requestSwitch]);

  useEffect(() => clearCycleTimers, [clearCycleTimers]);
  useEffect(
    () => () => {
      revealTimers.current.forEach((t) => window.clearTimeout(t));
      setHeld(false);
    },
    [],
  );
  // 화면이 바뀌면(홈·작별·다음 놀이) 멈춰 둔 놀이는 사라지므로, 미뤄 둔 일은 버리고 멈춤을 푼다
  useEffect(() => dropHeld(), [screen]);

  // 놀이 시간 재기 (놀이 화면에 있고, 화면이 켜져 있을 때만)
  useEffect(() => {
    const iv = window.setInterval(() => {
      if (document.hidden || !isGame(screenRef.current) || transitionRef.current) return;
      playMs.current += 1000;
      const limit = sessionMinRef.current * 60_000;
      if (limit > 0 && playMs.current >= limit) byeDue.current = true;
    }, 1000);
    return () => window.clearInterval(iv);
  }, []);

  // 알림을 끄거나 시간을 바꾸면 다시 판단한다
  useEffect(() => {
    const limit = progress.sessionMin * 60_000;
    byeDue.current = limit > 0 && playMs.current >= limit;
  }, [progress.sessionMin]);

  /* ---------- 화면 이동 ---------- */
  const goHome = useCallback(() => {
    stopSpeaking();
    stopCycle();
    setScreen("home");
  }, [stopCycle]);

  const go = useCallback((s: Screen) => {
    unlockAudio();
    stopSpeaking();
    setScreen(s);
  }, []);

  /** "오늘은 여기까지! 내일 또 만나" */
  const showBye = useCallback(() => {
    if (revealRef.current !== null) {
      pendingBye.current = true;
      return;
    }
    pendingBye.current = false;
    byeDue.current = false;
    playMs.current = 0;
    stopSpeaking();
    stopCycle();
    setScreen("bye");
  }, [stopCycle]);
  const showByeRef = useRef(showBye);
  showByeRef.current = showBye;

  /**
   * 라운드 성공 → 팡파레 + 축하 연출(돌아가며) + 별 + (가끔 보너스 별) + (스티커)
   * + (놀이 시간이 다 됐으면 "오늘은 여기까지") + (빙글빙글이면 다음 놀이 판단)
   */
  const handleWin = useCallback(() => {
    playFanfare();
    winsThisVisit.current += 1;
    const bonus = winsThisVisit.current > 1 && Math.random() < BONUS_CHANCE;
    const kind = pick(CELEBRATIONS, lastCelebration.current);
    lastCelebration.current = kind;
    celebrate(kind, bonus);
    if (bonus) fx.shake(0.8);
    if (kind === "balloons") setBalloons((b) => b + 1);
    setCheer((c) => c + 1);

    const id = ++flyId.current;
    const items: FlyingStarItem[] = [{ id }];
    if (bonus) {
      items.push({ id: ++flyId.current, gold: true });
      playBonus();
      setBonusShown(true);
      window.setTimeout(() => setBonusShown(false), 2200);
    }
    setFlying((f) => [...f, ...items]);
    const unlocked = addStar(bonus ? 2 : 1);

    // 이번 성공 뒤에 이어질 일: 오늘은 여기까지 / 빙글빙글 다음 놀이
    let after: "bye" | "switch" | null = null;
    const winGame = screenRef.current;
    if (byeDue.current) {
      after = "bye";
    } else if (cycleRef.current) {
      const st = stats.current;
      st.wins += 1;
      setCycleWins(st.wins);
      const snapshot = {
        wins: st.wins,
        misses: st.misses,
        elapsedMs: performance.now() - st.startedAt,
      };
      if (isGame(winGame) && cycleShouldSwitch(snapshot, paceRef.current, winGame)) after = "switch";
    }
    if (unlocked === null && after === null) return;

    // 스티커 공개·전환이 이어지면 놀이 화면이 뒤에서 다음 라운드를 시작하지 않게 멈춰 두고,
    // 칭찬(과 "더 큰 숫자 도전!")이 다 끝난 뒤에 넘어간다
    setHeld(true);
    if (after !== null) clearCycleTimers();
    afterSpeech(
      CYCLE_RULES.afterWinMs,
      CHEER_WAIT_MAX_MS,
      () => {
        if (unlocked !== null) {
          // 스티커를 닫은 뒤에 "오늘은 여기까지" / 다음 놀이 (그새 다른 화면으로 갔으면 안 함)
          const sameScreen = screenRef.current === winGame && isGame(winGame);
          if (sameScreen && after === "bye") pendingBye.current = true;
          else if (sameScreen && after === "switch" && cycleRef.current && isGame(winGame)) {
            pendingSwitch.current = { game: cycleNextOf(winGame), reason: "next" };
          }
          // 스티커가 떠 있는 동안 뒤의 놀이는 멈춰 둔다 (닫으면 풀림)
          if (isGame(screenRef.current)) setHeld(true);
          setLevelUpShown(false);
          playWhoosh();
          setReveal(unlocked);
          revealRef.current = unlocked;
        } else if (after === "bye") {
          showByeRef.current();
        } else {
          requestSwitch("next");
        }
      },
      // 스티커 공개는 홈으로 가도 보여 준다. 전환·작별은 홈으로 가면(stopCycle) 취소
      (id) => (unlocked !== null ? revealTimers : cycleTimers).current.push(id),
    );
  }, [addStar, clearCycleTimers, requestSwitch]);

  const levelUpTimers = useRef<number[]>([]);
  useEffect(() => () => levelUpTimers.current.forEach((t) => window.clearTimeout(t)), []);

  const handleResult = useCallback(
    (game: GameId, ok: boolean) => {
      const up = reportResult(game, ok);
      if (cycleRef.current && !ok) stats.current.misses += 1;
      if (up) {
        // 축하 말이 먼저 나오고, 그 뒤에 "더 큰 숫자 도전!"
        levelUpTimers.current.push(
          window.setTimeout(() => {
            playLevelUp();
            setLevelUpShown(true);
            speak(P.levelUp, { interrupt: false, pitch: 1.25 });
          }, 1300),
          window.setTimeout(() => setLevelUpShown(false), 3600),
        );
      }
    },
    [reportResult],
  );

  /** 선물 상자를 열었을 때 */
  const openReveal = useCallback(() => {
    playFanfare();
    fx.shake(1);
    fire({
      particleCount: 200,
      spread: 160,
      startVelocity: 55,
      origin: { y: 0.5 },
      zIndex: 65,
      shapes: ["star", "circle"],
      colors: ["#FDE68A", "#FBBF24", "#F472B6", "#A78BFA", "#ffffff"],
    });
  }, []);

  const closeReveal = useCallback(() => {
    setReveal(null);
    revealRef.current = null;
    // 스티커 이름을 말하던 중에 닫았으면 끊고, 멈춰 둔 놀이가 새 라운드 안내를 바로 시작하게 한다
    stopSpeaking();
    if (pendingBye.current) {
      showByeRef.current();
      return;
    }
    const p = pendingSwitch.current;
    if (p && cycleRef.current && isGame(screenRef.current)) {
      pendingSwitch.current = null;
      cycleGo(p.game, p.reason);
      return;
    }
    pendingSwitch.current = null;
    setHeld(false);
  }, [cycleGo]);

  const flyDone = useCallback(
    (id: number) => setFlying((f) => f.filter((x) => x.id !== id)),
    [],
  );

  const onAnyPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    unlockAudio();
    const now = performance.now();
    lastTap.current = now;
    // 캐릭터들이 누른 곳을 쳐다본다
    fx.look(e.clientX, e.clientY);
    // 버튼이 아닌 빈 곳을 누르면 반짝 (세기와는 상관없음). 배경 소품이면 소품이 반응한다
    const t = e.target as Element | null;
    if (!t || t.closest("button, [data-no-sparkle]")) return;
    if (now - lastSparkle.current < 120) return;
    lastSparkle.current = now;
    playTwinkle();
    fx.poke(e.clientX, e.clientY);
    fx.burst(e.clientX, e.clientY, "sparkle");
  }, []);

  const countMax = problemMax(progress.levels);
  const buddyInfo = useMemo<BuddyInfo | null>(
    () =>
      progress.buddy === null
        ? null
        : { index: progress.buddy, shiny: progress.buddy < progress.shiny, cheer },
    [progress.buddy, progress.shiny, cheer],
  );

  let content;
  let contentKey: string = screen;
  if (transition) {
    contentKey = "cycle-transition";
    content = (
      <CycleTransition
        game={transition.game}
        reason={transition.reason}
        ready={!!transition.ready}
        onStart={startCycleGame}
      />
    );
  } else if (screen === "home") {
    content = (
      <Home
        stars={meter}
        stickerCount={progress.stickers.length}
        todayStars={progress.today.stars}
        visit={visit}
        onSelect={go}
        onCycle={startCycle}
        onOpenSettings={() => setGateOpen(true)}
      />
    );
  } else if (screen === "stickers") {
    content = (
      <StickerBook
        stars={meter}
        unlocked={progress.stickers}
        shiny={progress.shiny}
        scene={progress.scene}
        onPlace={placeInScene}
        onBuddy={setBuddy}
        onHome={goHome}
      />
    );
  } else if (screen === "bye") {
    content = (
      <Goodbye
        todayStars={progress.today.stars}
        todayStickers={progress.today.stickers}
        onDone={goHome}
      />
    );
  } else if (isGame(screen)) {
    const Game = GAMES[screen];
    content = (
      <Game
        level={progress.levels[screen]}
        stars={meter}
        tapGap={progress.tapGap}
        countMax={countMax}
        friends={progress.stickers}
        rides={progress.elevatorRides}
        onRide={noteRide}
        onHome={goHome}
        onWin={handleWin}
        onResult={(ok) => handleResult(screen, ok)}
      />
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <BuddyContext.Provider value={buddyInfo}>
      <div
        className="relative h-[100dvh] w-screen overflow-hidden bg-sky-100 text-slate-800"
        onPointerDownCapture={onAnyPointerDown}
      >
        <div ref={rootRef} className="h-full w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={contentKey}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.25 }}
            className="h-full w-full"
          >
            {content}
          </motion.div>
        </AnimatePresence>

        {cycleOn && !transition && isGame(screen) ? (
          <CycleBar
            current={screen}
            wins={cycleWins}
            needed={cycleWinsFor(screen, progress.cyclePace)}
            onSkip={() => cycleGo(cycleNextOf(screen), "next")}
          />
        ) : null}

        </div>

        {isGame(screen) && !transition ? <CheerChick cheer={cheer} /> : null}
        <BalloonRise burst={balloons} />
        <BonusBadge show={bonusShown} />
        <LevelUpBadge show={levelUpShown} />
        <FlyingStars items={flying} onDone={flyDone} />
        <StickerReveal unlock={reveal} onOpen={openReveal} onClose={closeReveal} />
        <FxLayer shakeTarget={rootRef} />
        <ParentGate
          open={gateOpen}
          onPass={() => {
            setGateOpen(false);
            setSettingsOpen(true);
          }}
          onClose={() => setGateOpen(false)}
        />
        <ParentSettings
          open={settingsOpen}
          soundOn={progress.soundOn}
          voiceOn={progress.voiceOn}
          levels={progress.levels}
          stars={progress.stars}
          totalRounds={progress.totalRounds}
          tapGap={progress.tapGap}
          cyclePace={progress.cyclePace}
          sessionMin={progress.sessionMin}
          onSetSessionMin={setSessionMin}
          onToggleSound={toggleSound}
          onToggleVoice={toggleVoice}
          hapticsOn={progress.hapticsOn}
          onToggleHaptics={toggleHaptics}
          onSetLevel={setLevel}
          onSetTapGap={setTapGap}
          onSetCyclePace={setCyclePace}
          onReset={reset}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
      </BuddyContext.Provider>
    </MotionConfig>
  );
}
