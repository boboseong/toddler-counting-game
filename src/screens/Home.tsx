import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { playDing, speak } from "../lib/audio";
import { STARS_PER_STICKER, STICKERS } from "../lib/data";
import { Background, SpeechBubble, StarJar } from "../components/ui";
import type { GameId } from "../hooks/useProgress";
import type { Screen } from "../types";

interface Props {
  stars: number;
  stickerCount: number;
  onSelect: (s: Screen) => void;
  onOpenSettings: () => void;
}

const GAMES: {
  id: GameId;
  emoji: string;
  title: string;
  sub: string;
  bg: string;
  shadow: string;
}[] = [
  {
    id: "tap",
    emoji: "🍎",
    title: "톡톡 세기",
    sub: "하나씩 눌러 세어요",
    bg: "linear-gradient(160deg,#fda4af,#f87171)",
    shadow: "#be123c",
  },
  {
    id: "howmany",
    emoji: "🔢",
    title: "몇 개일까?",
    sub: "숫자를 골라요",
    bg: "linear-gradient(160deg,#86efac,#22c55e)",
    shadow: "#15803d",
  },
  {
    id: "feed",
    emoji: "🐰",
    title: "냠냠 먹이 주기",
    sub: "딱 맞게 주세요",
    bg: "linear-gradient(160deg,#fcd34d,#f59e0b)",
    shadow: "#b45309",
  },
  {
    id: "bubbles",
    emoji: "🫧",
    title: "거품 팡팡",
    sub: "터뜨리며 세어요",
    bg: "linear-gradient(160deg,#7dd3fc,#38bdf8)",
    shadow: "#0369a1",
  },
];

const GREETINGS = [
  "안녕! 같이 숫자 세어 볼까?",
  "삐약! 오늘도 재미있게 놀자!",
  "하나, 둘, 셋! 준비됐어?",
];

export default function Home({ stars, stickerCount, onSelect, onOpenSettings }: Props) {
  const [greet, setGreet] = useState(0);
  const pressTimer = useRef<number | null>(null);
  const [pressing, setPressing] = useState(false);

  const startPress = () => {
    setPressing(true);
    pressTimer.current = window.setTimeout(() => {
      setPressing(false);
      onOpenSettings();
    }, 1500);
  };
  const endPress = () => {
    setPressing(false);
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const tapMascot = () => {
    playDing();
    const i = (greet + 1) % GREETINGS.length;
    setGreet(i);
    speak(GREETINGS[i]);
  };

  const toNext = STARS_PER_STICKER - (stars % STARS_PER_STICKER);
  const allDone = stickerCount >= STICKERS.length;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <Background />

      <div className="relative z-10 flex items-center justify-between px-4 pt-4 sm:px-6">
        <div className="text-2xl text-slate-500 sm:text-3xl">
          <span className="emoji">🎈</span> 숫자 놀이터
        </div>
        <StarJar stars={stars} />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-4 py-3 no-scrollbar sm:gap-5">
        {/* 마스코트 */}
        <div className="flex items-center gap-3">
          <motion.button
            onPointerDown={tapMascot}
            whileTap={{ scale: 0.85, rotate: -10 }}
            className="bob emoji text-[clamp(3.5rem,min(14vw,12vh),7rem)] drop-shadow-lg"
            aria-label="병아리 친구"
          >
            🐥
          </motion.button>
          <SpeechBubble tail="left" className="text-xl sm:text-2xl">
            {GREETINGS[greet]}
          </SpeechBubble>
        </div>

        {/* 게임 카드 */}
        <div className="grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {GAMES.map((g, i) => (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.08 * i, type: "spring", stiffness: 260, damping: 18 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onSelect(g.id)}
              className="pressable flex min-h-[clamp(104px,min(28vw,24vh),220px)] flex-col items-center justify-center gap-1 rounded-[2rem] border-4 border-white p-3 text-white"
              style={{ background: g.bg, boxShadow: `0 8px 0 0 ${g.shadow}55` }}
            >
              <span
                className="wiggle emoji text-[clamp(2.5rem,min(11vw,9vh),5.5rem)] drop-shadow"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {g.emoji}
              </span>
              <span
                className="text-2xl sm:text-3xl"
                style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}
              >
                {g.title}
              </span>
              <span className="text-sm opacity-90 sm:text-base">{g.sub}</span>
            </motion.button>
          ))}
        </div>

        {/* 스티커북 */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect("stickers")}
          className="pressable flex w-full max-w-4xl items-center justify-between rounded-[2rem] border-4 border-white bg-gradient-to-r from-violet-300 to-fuchsia-300 px-5 py-3 text-white shadow-[0_8px_0_0_rgba(109,40,217,0.35)]"
        >
          <div className="flex items-center gap-3">
            <span className="emoji text-4xl sm:text-6xl">📒</span>
            <div className="text-left">
              <div className="text-2xl sm:text-3xl" style={{ textShadow: "0 2px 0 rgba(0,0,0,0.2)" }}>
                내 스티커 {stickerCount > 0 ? `(${stickerCount})` : ""}
              </div>
              <div className="text-sm sm:text-base">
                {allDone ? "스티커를 모두 모았어요! 🎉" : `별 ${toNext}개 더 모으면 새 친구가 와요!`}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: STARS_PER_STICKER }).map((_, i) => (
              <span
                key={i}
                className="emoji text-3xl sm:text-4xl"
                style={{ opacity: i < stars % STARS_PER_STICKER || allDone ? 1 : 0.3 }}
              >
                ⭐
              </span>
            ))}
          </div>
        </motion.button>
      </div>

      {/* 부모님용 설정 (길게 누르기) */}
      <div className="relative z-10 flex items-center justify-end px-4 pb-3 sm:px-6">
        <button
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          onPointerCancel={endPress}
          onContextMenu={(e) => e.preventDefault()}
          className="relative flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-sm text-slate-500 shadow"
          aria-label="부모님 설정 (길게 누르기)"
        >
          <span className="emoji text-lg">⚙️</span>
          <span>부모님용 · 길게 누르기</span>
          {pressing ? (
            <motion.span
              className="absolute inset-0 rounded-full bg-violet-300/40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: "linear" }}
              style={{ transformOrigin: "left" }}
            />
          ) : null}
        </button>
      </div>
    </div>
  );
}
