import confetti from "canvas-confetti";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useCallback, useRef, useState, type ComponentType } from "react";
import { playFanfare, stopSpeaking, unlockAudio } from "./lib/audio";
import { useProgress, type GameId } from "./hooks/useProgress";
import Home from "./screens/Home";
import StickerBook from "./screens/StickerBook";
import TapCountGame from "./games/TapCountGame";
import HowManyGame from "./games/HowManyGame";
import FeedGame from "./games/FeedGame";
import BubbleGame from "./games/BubbleGame";
import {
  FlyingStars,
  ParentGate,
  ParentSettings,
  StickerReveal,
  type FlyingStarItem,
} from "./components/overlays";
import type { GameProps, Screen } from "./types";

const GAMES: Record<GameId, ComponentType<GameProps>> = {
  tap: TapCountGame,
  howmany: HowManyGame,
  feed: FeedGame,
  bubbles: BubbleGame,
};

function isGame(s: Screen): s is GameId {
  return s in GAMES;
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
    setAllLevels,
    reset,
  } = useProgress();

  // 별은 즉시 저장하되, 날아가는 별이 항아리에 닿을 때까지 화면 숫자는 올리지 않는다
  const shownStars = progress.stars - flying.length;

  const goHome = useCallback(() => {
    stopSpeaking();
    setScreen("home");
  }, []);

  const go = useCallback((s: Screen) => {
    unlockAudio();
    stopSpeaking();
    setScreen(s);
  }, []);

  /** 라운드 성공 → 팡파레 + 컨페티 + 별 + (스티커) */
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
  }, [addStar]);

  const closeReveal = useCallback(() => setReveal(null), []);
  const flyDone = useCallback(
    (id: number) => setFlying((f) => f.filter((x) => x.id !== id)),
    [],
  );

  let content;
  if (screen === "home") {
    content = (
      <Home
        stars={shownStars}
        stickerCount={progress.stickers.length}
        onSelect={go}
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
        onResult={(ok) => reportResult(screen, ok)}
      />
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative h-[100dvh] w-screen overflow-hidden bg-sky-100 text-slate-800"
        onPointerDownCapture={unlockAudio}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.25 }}
            className="h-full w-full"
          >
            {content}
          </motion.div>
        </AnimatePresence>

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
          onToggleSound={toggleSound}
          onToggleVoice={toggleVoice}
          onSetLevel={setAllLevels}
          onSetTapGap={setTapGap}
          onReset={reset}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
    </MotionConfig>
  );
}
