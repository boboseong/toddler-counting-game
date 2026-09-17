import confetti from "canvas-confetti";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { playFanfare, playWhoosh, speak, stopSpeaking, unlockAudio } from "./lib/audio";
import {
  CYCLE_ORDER,
  CYCLE_PACES,
  CYCLE_RULES,
  cycleNextOf,
  cyclePhrase,
  cycleShouldSwitch,
  type CycleReason,
  type GameId,
} from "./lib/data";
import { useProgress } from "./hooks/useProgress";
import Home from "./screens/Home";
import StickerBook from "./screens/StickerBook";
import TapCountGame from "./games/TapCountGame";
import HowManyGame from "./games/HowManyGame";
import FeedGame from "./games/FeedGame";
import BubbleGame from "./games/BubbleGame";
import FindGame from "./games/FindGame";
import {
  FlyingStars,
  ParentGate,
  ParentSettings,
  StickerReveal,
  type FlyingStarItem,
} from "./components/overlays";
import { CycleBar, CycleTransition } from "./components/cycle";
import type { GameProps, Screen } from "./types";

const GAMES: Record<GameId, ComponentType<GameProps>> = {
  tap: TapCountGame,
  howmany: HowManyGame,
  feed: FeedGame,
  bubbles: BubbleGame,
  find: FindGame,
};

function isGame(s: Screen): s is GameId {
  return s in GAMES;
}

interface CycleTransitionState {
  game: GameId;
  reason: CycleReason;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [gateOpen, setGateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reveal, setReveal] = useState<number | null>(null);
  const [flying, setFlying] = useState<FlyingStarItem[]>([]);
  const flyId = useRef(0);

  const {
    progress,
    addStar,
    reportResult,
    toggleSound,
    toggleVoice,
    setTapGap,
    setCycleNext,
    setCyclePace,
    setLevel,
    reset,
  } = useProgress();

  // 별은 즉시 저장하되, 날아가는 별이 항아리에 닿을 때까지 화면 숫자는 올리지 않는다
  const shownStars = progress.stars - flying.length;

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
  const revealRef = useRef<number | null>(null);
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
      later(150, () => speak(cyclePhrase(game, reason), { pitch: 1.2 }));
      later(CYCLE_RULES.transitionMs, () => {
        setTransition(null);
        stats.current.startedAt = performance.now();
        lastTap.current = performance.now();
      });
    },
    [clearCycleTimers, later, setCycleNext],
  );

  /** 지금 놀이에서 다음 놀이로. 스티커 화면이 떠 있으면 닫힌 뒤에 */
  const requestSwitch = useCallback(
    (reason: CycleReason) => {
      if (!cycleRef.current) return;
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

  /** 라운드 성공 → 팡파레 + 컨페티 + 별 + (스티커) + (빙글빙글이면 다음 놀이 판단) */
  const handleWin = useCallback(() => {
    playFanfare();
    try {
      confetti({
        particleCount: 130,
        spread: 100,
        startVelocity: 40,
        origin: { y: 0.6 },
        zIndex: 55,
        colors: ["#F87171", "#FBBF24", "#4ADE80", "#60A5FA", "#A78BFA", "#F472B6"],
      });
      window.setTimeout(
        () =>
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.7 },
            zIndex: 55,
          }),
        250,
      );
      window.setTimeout(
        () =>
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.7 },
            zIndex: 55,
          }),
        250,
      );
    } catch {
      /* ignore */
    }
    const id = ++flyId.current;
    setFlying((f) => [...f, { id }]);
    const unlocked = addStar();
    if (unlocked !== null) {
      window.setTimeout(() => {
        setReveal(unlocked);
        try {
          confetti({
            particleCount: 200,
            spread: 160,
            startVelocity: 55,
            origin: { y: 0.5 },
            zIndex: 65,
            shapes: ["star", "circle"],
            colors: ["#FDE68A", "#FBBF24", "#F472B6", "#A78BFA", "#ffffff"],
          });
        } catch {
          /* ignore */
        }
      }, 1700);
    }

    if (cycleRef.current) {
      const s = stats.current;
      s.wins += 1;
      setCycleWins(s.wins);
      const snapshot = {
        wins: s.wins,
        misses: s.misses,
        elapsedMs: performance.now() - s.startedAt,
      };
      if (cycleShouldSwitch(snapshot, paceRef.current)) {
        // 축하가 끝날 즈음, 다음 라운드가 시작되기 전에 넘어간다
        later(CYCLE_RULES.afterWinMs, () => requestSwitch("next"));
      }
    }
  }, [addStar, later, requestSwitch]);

  const handleResult = useCallback(
    (game: GameId, ok: boolean) => {
      reportResult(game, ok);
      if (cycleRef.current && !ok) stats.current.misses += 1;
    },
    [reportResult],
  );

  const closeReveal = useCallback(() => {
    setReveal(null);
    revealRef.current = null;
    const p = pendingSwitch.current;
    if (p && cycleRef.current) {
      pendingSwitch.current = null;
      cycleGo(p.game, p.reason);
    }
  }, [cycleGo]);

  const flyDone = useCallback(
    (id: number) => setFlying((f) => f.filter((x) => x.id !== id)),
    [],
  );

  const onAnyPointerDown = useCallback(() => {
    unlockAudio();
    lastTap.current = performance.now();
  }, []);

  let content;
  let contentKey: string = screen;
  if (transition) {
    contentKey = "cycle-transition";
    content = <CycleTransition game={transition.game} reason={transition.reason} />;
  } else if (screen === "home") {
    content = (
      <Home
        stars={shownStars}
        stickerCount={progress.stickers.length}
        onSelect={go}
        onCycle={startCycle}
        onOpenSettings={() => setGateOpen(true)}
      />
    );
  } else if (screen === "stickers") {
    content = (
      <StickerBook stars={shownStars} unlocked={progress.stickers} onHome={goHome} />
    );
  } else if (isGame(screen)) {
    const Game = GAMES[screen];
    content = (
      <Game
        level={progress.levels[screen]}
        stars={shownStars}
        tapGap={progress.tapGap}
        onHome={goHome}
        onWin={handleWin}
        onResult={(ok) => handleResult(screen, ok)}
      />
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative h-[100dvh] w-screen overflow-hidden bg-sky-100 text-slate-800"
        onPointerDownCapture={onAnyPointerDown}
      >
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
            needed={CYCLE_PACES[progress.cyclePace].wins}
            onSkip={() => cycleGo(cycleNextOf(screen), "next")}
          />
        ) : null}

        <FlyingStars items={flying} onDone={flyDone} />
        <StickerReveal index={reveal} onClose={closeReveal} />
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
          onToggleSound={toggleSound}
          onToggleVoice={toggleVoice}
          onSetLevel={setLevel}
          onSetTapGap={setTapGap}
          onSetCyclePace={setCyclePace}
          onReset={reset}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}
